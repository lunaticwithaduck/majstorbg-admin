#!/usr/bin/env node
'use strict';
// post-stop.cjs — Stage B1 blocking Stop hook for the majstorbg monorepo.
//
// Behaviour:
//   - If stdin carries `stop_hook_active: true`, exit 0 silently (don't block a
//     second time — Claude Code re-fires Stop after a block, and re-blocking
//     causes an infinite loop).
//   - For each workspace (packages, apps/web, apps/mobile), scan
//     <ws>/workflows/tasks/*.md and collect tasks whose frontmatter shows
//     status: in-progress (or has no status:, which we treat as in-progress).
//   - If any in-progress tasks are found, emit Stop decision JSON on stdout:
//       {"decision":"block","reason":"<directive>"}
//     The directive lists every open task and instructs Claude to run
//     `/complete` on each before ending the session.
//   - If no open tasks, write SESSION.md files at <ws>/SESSION.md with
//     timestamp, open tasks, recent completions, and preserved session notes.
//
// Never throws: wrapped in try/catch, exit 0 on unknown errors.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const WORKSPACES = ['packages', 'apps/web', 'apps/mobile'];
const TOUCH_DIR = path.join(os.tmpdir(), 'majstorbg-session-touches');

function readTouchedWorkspaces(sessionId) {
  // Returns:
  //   - Array<string> (possibly empty) if session_id is present and the log
  //     file exists — authoritative list of workspaces this session wrote to.
  //   - null if session_id is missing — caller should fall back to the strict
  //     "block on any open task" behaviour.
  if (!sessionId) return null;
  const logPath = path.join(TOUCH_DIR, `${sessionId}.json`);
  try {
    const data = JSON.parse(fs.readFileSync(logPath, 'utf8'));
    if (Array.isArray(data)) return data;
  } catch (_e) {}
  return [];
}

function clearTouchLog(sessionId) {
  if (!sessionId) return;
  try {
    fs.unlinkSync(path.join(TOUCH_DIR, `${sessionId}.json`));
  } catch (_e) {}
}

function readText(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch (_e) {
    return null;
  }
}

function parseFrontmatter(text) {
  // Return an object of frontmatter keys, or {} if none.
  const out = {};
  if (!text) return out;
  const lines = text.split('\n');
  if (lines[0].trim() !== '---') return out;
  for (let i = 1; i < lines.length; i++) {
    const l = lines[i];
    if (l.trim() === '---') break;
    const idx = l.indexOf(':');
    if (idx === -1) continue;
    const key = l.slice(0, idx).trim();
    const val = l.slice(idx + 1).trim();
    if (key) out[key] = val;
  }
  return out;
}

function getOpenTasksForWorkspace(ws) {
  // Returns array of { relPath, absPath, title, status }.
  const tasksDir = path.join(ROOT_DIR, ws, 'workflows', 'tasks');
  const out = [];
  let entries;
  try {
    entries = fs.readdirSync(tasksDir);
  } catch (_e) {
    return out;
  }
  for (const f of entries) {
    if (!f.endsWith('.md')) continue;
    const abs = path.join(tasksDir, f);
    const text = readText(abs);
    const fm = parseFrontmatter(text);
    const status = (fm.status || '').toLowerCase();
    // Missing status or explicit in-progress → in-progress.
    if (status === '' || status === 'in-progress') {
      out.push({
        relPath: `${ws}/workflows/tasks/${f}`,
        absPath: abs,
        title: fm.title || f,
        status: status || 'in-progress',
      });
    }
  }
  return out;
}

function listDoneForWorkspace(ws, n = 7) {
  const doneDir = path.join(ROOT_DIR, ws, 'workflows', 'done');
  let entries;
  try {
    entries = fs.readdirSync(doneDir);
  } catch (_e) {
    return [];
  }
  return entries
    .filter((f) => f.endsWith('.md'))
    .sort()
    .reverse()
    .slice(0, n)
    .map((f) => {
      const text = readText(path.join(doneDir, f)) || '';
      const m = text.match(/^title:\s*(.+)$/m);
      return `- \`${f}\` — ${m ? m[1].trim() : f}`;
    });
}

function listOpenTasksLinesForWorkspace(ws) {
  const tasksDir = path.join(ROOT_DIR, ws, 'workflows', 'tasks');
  let entries;
  try {
    entries = fs.readdirSync(tasksDir);
  } catch (_e) {
    return [];
  }
  return entries
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((f) => {
      const text = readText(path.join(tasksDir, f)) || '';
      const m = text.match(/^title:\s*(.+)$/m);
      return `- \`${f}\` — ${m ? m[1].trim() : f}`;
    });
}

function preservedNotes(sessionFilePath) {
  const existing = readText(sessionFilePath);
  if (!existing) return null;
  const m = existing.match(/## Session Notes\n\n([\s\S]*?)(?=\n---|\n## |\s*$)/);
  if (m?.[1]?.trim() && !m[1].trim().startsWith('_Not yet written')) {
    return m[1].trim();
  }
  return null;
}

function writeSessionFileForWorkspace(ws) {
  const sessionFile = path.join(ROOT_DIR, ws, 'SESSION.md');
  const openTasks = listOpenTasksLinesForWorkspace(ws);
  const recentDone = listDoneForWorkspace(ws);
  const existingNotes = preservedNotes(sessionFile);

  const now = `${new Date().toISOString().replace('T', ' ').slice(0, 16)} UTC`;

  const notesContent =
    existingNotes ||
    [
      '_Not yet written. Claude: before ending a session, replace this with 2-4 bullets:_',
      '_- What was accomplished this session_',
      '_- Key decisions made (and brief rationale)_',
      '_- What to pick up next_',
      '_- Any open questions or blockers_',
    ].join('\n');

  const content = `# SESSION.md — Current Session State (${ws})

> Auto-generated by root Stop hook at session end. Committed to repo.
> **Claude: read this file at the start of every session, before CONTEXT.md.**
> **Claude: replace ## Session Notes before ending a session.**

**Last updated:** ${now}
**Workspace:** ${ws}

---

## Open Tasks

${openTasks.length ? openTasks.join('\n') : `_None — ${ws}/workflows/tasks/ is empty._`}

## Recently Completed (last 7)

${recentDone.length ? recentDone.join('\n') : `_None found in ${ws}/workflows/done/_`}

## Session Notes

${notesContent}
`;

  try {
    fs.mkdirSync(path.dirname(sessionFile), { recursive: true });
    fs.writeFileSync(sessionFile, content);
  } catch (_e) {}
}

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  input += chunk;
});
process.stdin.on('end', () => {
  try {
    let payload = {};
    if (input.trim()) {
      try {
        payload = JSON.parse(input);
      } catch (_e) {
        payload = {};
      }
    }

    const sessionId = (payload?.session_id ? String(payload.session_id) : '').trim();

    // Guard against infinite loop: if Claude Code is re-firing Stop after a
    // prior block, let it through. Clear the touch log too — session is ending.
    if (payload?.stop_hook_active === true) {
      clearTouchLog(sessionId);
      process.exit(0);
    }

    // Session-scoped scoping: only block on open tasks in workspaces this
    // session actually wrote to. If there's no session_id or no log, fall back
    // to strict (block on any open task, as before) so the hook still works
    // when invoked outside a real Claude Code session.
    const touched = readTouchedWorkspaces(sessionId);
    const scopedWorkspaces =
      touched === null ? WORKSPACES : WORKSPACES.filter((ws) => touched.includes(ws));

    // Gather open tasks across the scoped workspaces only.
    const allOpen = [];
    for (const ws of scopedWorkspaces) {
      const tasks = getOpenTasksForWorkspace(ws);
      for (const t of tasks) allOpen.push(t);
    }

    if (allOpen.length > 0) {
      const first = allOpen[0];
      const taskLines = allOpen.map((t) => `  - ${t.relPath} (${t.status})`).join('\n');
      const reason = [
        `You have ${allOpen.length} open task(s) that must be completed before ending this session.`,
        ``,
        `Open tasks:`,
        taskLines,
        ``,
        `Run \`/complete ${first.relPath}\` for each, starting with ${first.relPath}.`,
        ``,
        `This is the agentic self-improving loop's capture point — skipping it loses the`,
        `knowledge extraction step (no .sc candidate, no skill synthesis, no SESSION.md refresh).`,
        `Do not end the session until every task has been passed through \`/complete\`.`,
      ].join('\n');

      process.stdout.write(JSON.stringify({ decision: 'block', reason }));
      process.exit(0);
    }

    // No open tasks (or none in touched workspaces) — write SESSION.md for each
    // workspace that has a .claude/ dir, and clear the touch log.
    for (const ws of WORKSPACES) {
      const wsClaude = path.join(ROOT_DIR, ws, '.claude');
      if (!fs.existsSync(wsClaude)) continue;
      writeSessionFileForWorkspace(ws);
    }
    clearTouchLog(sessionId);

    process.exit(0);
  } catch (_e) {
    process.exit(0);
  }
});
