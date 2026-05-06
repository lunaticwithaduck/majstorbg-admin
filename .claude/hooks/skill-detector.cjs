#!/usr/bin/env node
'use strict';
// skill-detector.cjs - Root-level UserPromptSubmit hook for the majstorbg monorepo.
//
// Reads a consolidated skill-rules.json at .claude/skills/skill-rules.json (root)
// with shape:
//   { "<skill-name>": {
//       "keywords":     [...],
//       "filePatterns": [...],
//       "toolTriggers": [...],
//       "source":       "packages/.claude/skills/backend/SKILL.md" (path relative to project root)
//     }, ... }
//
// Behaviour:
//   - If rules file is missing: exit 0 silently.
//   - Matches skills by keyword substring against the lowercased prompt.
//   - For each matched skill, loads the SKILL.md at `source` and emits an
//     [AUTO-ACTIVATED SKILL: <name>] block.
//   - Updates .claude/skill-usage.json (last_used, used_count).
//   - Scans each workspace's autolearn-pending flag and emits a scoped
//     synthesis instruction block if any exist.
//   - Scans each workspace's workflows/tasks/ dir and appends a soft nudge
//     listing open tasks and suggesting `/complete`.
//   - Never throws: wrapped in try/catch, exit 0 on unknown errors.

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const WORKSPACES = ['packages', 'apps/web', 'apps/mobile'];

const rulesPath = path.join(ROOT_DIR, '.claude', 'skills', 'skill-rules.json');
const usageFile = path.join(ROOT_DIR, '.claude', 'skill-usage.json');

function safeReadText(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch (_e) {
    return null;
  }
}

function safeReadJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (_e) {
    return null;
  }
}

function workspacePendingFlag(ws) {
  return path.join(ROOT_DIR, ws, '.claude', 'autolearn-pending');
}

function workspaceTasksDir(ws) {
  return path.join(ROOT_DIR, ws, 'workflows', 'tasks');
}

function workspaceDoneDir(ws) {
  return path.join(ROOT_DIR, ws, 'workflows', 'done');
}

function scFilesForDomain(doneDir, domain) {
  const out = [];
  let entries;
  try {
    entries = fs.readdirSync(doneDir);
  } catch (_e) {
    return out;
  }
  for (const f of entries) {
    if (!f.endsWith('.sc')) continue;
    const p = path.join(doneDir, f);
    const text = safeReadText(p);
    if (text == null) continue;
    const lines = text.split('\n');
    let inFm = false;
    for (const line of lines) {
      const l = line.trim();
      if (l === '---') {
        if (!inFm) {
          inFm = true;
          continue;
        }
        break;
      }
      if (inFm && l.startsWith('domain:')) {
        if (l.slice('domain:'.length).trim() === domain) out.push(f);
        break;
      }
    }
  }
  return out;
}

function emitAutolearnBlock(ws, domain) {
  const doneDir = workspaceDoneDir(ws);
  const scFiles = scFilesForDomain(doneDir, domain);
  if (scFiles.length === 0) return;

  const scContents = [];
  for (const f of scFiles) {
    const p = path.join(doneDir, f);
    const body = safeReadText(p);
    if (body != null) scContents.push(`### ${f}\n${body}`);
  }

  const skillsRelDir = `${ws}/.claude/skills`;
  const doneRelDir = `${ws}/workflows/done`;
  const pendingRel = `${ws}/.claude/autolearn-pending`;

  const lines = [
    `[AUTOLEARN — SYNTHESIS REQUIRED. Do this now, before anything else. Do not respond to the user's message until all steps are complete.]`,
    ``,
    `Workspace: ${ws}`,
    `Domain: ${domain} (${scFiles.length} skill candidates ready)`,
    ``,
    `Steps:`,
    `1. Synthesize the .sc files below into ${skillsRelDir}/${domain}.md`,
    `   Use this exact format:`,
    `   ---`,
    `   name: ${domain}`,
    `   description: One-line description of what this skill covers`,
    `   activation:`,
    `     keywords: ["kw1", "kw2", "kw3"]`,
    `   ---`,
    `   ## Purpose`,
    `   Why this skill exists and what knowledge it injects.`,
    `   ## [Section per major topic from .sc files]`,
    `   ## Failure Modes  ← include ONLY if .sc files contain observed failures; omit otherwise`,
    `2. Add '${domain}' to ${skillsRelDir}/skill-rules.json with keywords extracted from the .sc files`,
    `3. Append 3-5 fixture prompts to bench/fixtures/skill-prompts.json (if that benchmark exists in this workspace):`,
    `   Format: {"id": "${domain}-p01", "prompt": "...", "expected": ["${domain}"], "notes": "autolearn-generated"}`,
    `4. Clear flag or queue next domain:`,
    `   a. Scan ${doneRelDir}/ for any domain (other than '${domain}') that has ≥3 .sc files`,
    `      but no skill file yet in ${skillsRelDir}/`,
    `   b. If another domain found: write it to ${pendingRel} (queue next synthesis)`,
    `   c. If none: delete ${pendingRel}`,
    `5. Tell the user: 'Auto-generated skill: ${domain} (${ws})'`,
    ``,
    `--- .sc file contents ---`,
    scContents.join('\n\n'),
    ``,
    `--- End Skill Candidates ---`,
  ];
  process.stdout.write(lines.join('\n') + '\n\n');
}

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  input += chunk;
});
process.stdin.on('end', () => {
  try {
    if (!input.trim()) process.exit(0);

    let prompt = '';
    try {
      const data = JSON.parse(input);
      prompt = data.prompt || data.message || data.user_prompt || '';
    } catch (_e) {
      process.exit(0);
    }
    if (!prompt) process.exit(0);

    // Load consolidated root rules. If absent, silently exit — an agent is
    // still generating this file in Stage A.
    if (!fs.existsSync(rulesPath)) {
      // Even without rules, we still run the autolearn + task-nudge passes
      // below so the agentic loop isn't fully dead. Skill injection is skipped.
    }

    const rules = fs.existsSync(rulesPath) ? safeReadJson(rulesPath) || {} : {};
    const promptLower = prompt.toLowerCase();

    // Detect any workspace with a pending synthesis flag
    const pendingByWorkspace = [];
    for (const ws of WORKSPACES) {
      const flag = workspacePendingFlag(ws);
      if (fs.existsSync(flag)) {
        const domain = (safeReadText(flag) || '').trim();
        if (domain) pendingByWorkspace.push({ ws, domain });
      }
    }
    const synthesisPending = pendingByWorkspace.length > 0;

    // Match skills by keyword substring
    const matched = [];
    for (const [skillName, rule] of Object.entries(rules)) {
      const keywords = (rule && rule.keywords) || [];
      if (keywords.some((kw) => typeof kw === 'string' && promptLower.includes(kw.toLowerCase()))) {
        matched.push({ name: skillName, rule });
      }
    }

    // Update usage stats
    if (matched.length > 0) {
      let usage = {};
      if (fs.existsSync(usageFile)) {
        usage = safeReadJson(usageFile) || {};
      }
      const today = new Date().toISOString().slice(0, 10);
      for (const { name } of matched) {
        if (!usage[name]) usage[name] = { last_used: today, used_count: 0 };
        usage[name].last_used = today;
        usage[name].used_count = (usage[name].used_count || 0) + 1;
      }
      try {
        fs.writeFileSync(usageFile, JSON.stringify(usage, null, 2));
      } catch (_e) {}
    }

    // Inject matched skill content (suppress when synthesis is pending — synthesis takes priority)
    if (matched.length > 0 && !synthesisPending) {
      const parts = [];
      for (const { name, rule } of matched) {
        const source = rule && rule.source;
        if (!source) continue;
        const skillAbs = path.isAbsolute(source) ? source : path.join(ROOT_DIR, source);
        const content = safeReadText(skillAbs);
        if (content == null) continue;
        parts.push(`[AUTO-ACTIVATED SKILL: ${name}]\n${content}\n[END SKILL: ${name}]`);
      }
      if (parts.length > 0) {
        const label = parts.length === 1 ? 'skill was' : 'skills were';
        process.stdout.write(
          `The following ${label} automatically activated based on your prompt. Apply the domain knowledge in your response:\n\n`,
        );
        process.stdout.write(parts.join('\n\n') + '\n\n');
      }
    }

    // Emit autolearn synthesis blocks (scoped per workspace)
    if (synthesisPending) {
      for (const { ws, domain } of pendingByWorkspace) {
        emitAutolearnBlock(ws, domain);
      }
    }

    // Soft open-task nudge — per workspace, only if tasks exist.
    // This is informational; Stage B Stop hook is the hard enforcement.
    if (!synthesisPending) {
      const nudges = [];
      for (const ws of WORKSPACES) {
        const tasksDir = workspaceTasksDir(ws);
        if (!fs.existsSync(tasksDir)) continue;
        let files = [];
        try {
          files = fs.readdirSync(tasksDir).filter((f) => f.endsWith('.md'));
        } catch (_e) {
          continue;
        }
        if (files.length === 0) continue;
        nudges.push({ ws, files });
      }
      if (nudges.length > 0) {
        process.stdout.write(
          'Open tasks across workspaces (soft reminder — complete before starting new work):\n',
        );
        for (const { ws, files } of nudges) {
          process.stdout.write(`  ${ws}/workflows/tasks/: ${files.join(', ')}\n`);
        }
        process.stdout.write('Run `/complete <path>` on any finished tasks before moving on.\n\n');
      }
    }

    process.exit(0);
  } catch (_e) {
    process.exit(0);
  }
});
