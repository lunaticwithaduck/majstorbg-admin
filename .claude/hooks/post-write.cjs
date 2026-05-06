#!/usr/bin/env node
'use strict';
// post-write.cjs - Root-level PostToolUse hook for Write/Edit in the majstorbg monorepo.
//
// Responsibilities:
//   1. Validate JSON files after write (warn on stderr; never block).
//   2. Route .sc (skill candidate) writes to the correct workspace:
//      when a file path matches <ws>/workflows/done/*.sc (ws ∈ packages,
//      apps/web, apps/mobile), count .sc files sharing the same `domain:`
//      value in that workspace's done/ dir and, if the count is ≥ 3,
//      write `<ws>/.claude/autolearn-pending` with the domain name.
//
// All paths are derived relative to ROOT_DIR = two levels up from this file.
// Hook must be fast and never throw — silent-fail on unknown errors (exit 0).

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const WORKSPACES = ['packages', 'apps/web', 'apps/mobile'];
const THRESHOLD = 3;
const TOUCH_DIR = path.join(os.tmpdir(), 'majstorbg-session-touches');

function logWorkspaceTouch(sessionId, ws) {
  if (!sessionId || !ws) return;
  const logPath = path.join(TOUCH_DIR, `${sessionId}.json`);
  try {
    fs.mkdirSync(TOUCH_DIR, { recursive: true });
    let current = [];
    try {
      const existing = JSON.parse(fs.readFileSync(logPath, 'utf8'));
      if (Array.isArray(existing)) current = existing;
    } catch (_e) {}
    if (!current.includes(ws)) {
      current.push(ws);
      fs.writeFileSync(logPath, JSON.stringify(current));
    }
  } catch (_e) {}
}

function workspaceForPath(relPath) {
  for (const ws of WORKSPACES) {
    if (relPath === ws || relPath.startsWith(`${ws}/`)) {
      // Exclude meta paths: workflows/ is the agentic pipeline itself,
      // .claude/ is the harness config. Writes there are not "feature work"
      // that needs a /complete capture, so they shouldn't mark the workspace
      // as touched for the Stop-hook enforcement.
      const tail = relPath.slice(ws.length + 1);
      if (tail.startsWith('workflows/') || tail.startsWith('.claude/')) return null;
      return ws;
    }
  }
  return null;
}

function readDomain(filePath) {
  let text;
  try {
    text = fs.readFileSync(filePath, 'utf8');
  } catch (_e) {
    return null;
  }
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
      return l.slice('domain:'.length).trim();
    }
  }
  return null;
}

function countDomainInDir(dir, domain) {
  let count = 0;
  let entries;
  try {
    entries = fs.readdirSync(dir);
  } catch (_e) {
    return 0;
  }
  for (const f of entries) {
    if (!f.endsWith('.sc')) continue;
    const p = path.join(dir, f);
    const d = readDomain(p);
    if (d === domain) count++;
  }
  return count;
}

function skillExists(rootDir, ws, domain) {
  const skillsDir = path.join(rootDir, ws, '.claude', 'skills');
  const fileForm = path.join(skillsDir, `${domain}.md`);
  const dirForm = path.join(skillsDir, domain);
  if (fs.existsSync(fileForm)) return true;
  try {
    const stat = fs.statSync(dirForm);
    if (stat.isDirectory()) return true;
  } catch (_e) {}
  return false;
}

function detectWorkspace(normalizedRelPath) {
  // normalizedRelPath is relative to ROOT, forward slashes.
  // Match <ws>/workflows/done/<name>.sc where ws is one of the known workspaces.
  for (const ws of WORKSPACES) {
    const prefix = `${ws}/workflows/done/`;
    if (normalizedRelPath.startsWith(prefix) && normalizedRelPath.endsWith('.sc')) {
      // Must be exactly one filename component after the prefix (no nested dirs).
      const rest = normalizedRelPath.slice(prefix.length);
      if (!rest.includes('/')) return ws;
    }
  }
  return null;
}

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  input += chunk;
});
process.stdin.on('end', () => {
  try {
    let filePath = '';
    let sessionId = '';
    try {
      const d = JSON.parse(input);
      const payload = d.tool_input || d;
      filePath = payload.file_path || payload.filePath || payload.path || '';
      sessionId = (d.session_id || '').trim();
    } catch (_e) {
      process.exit(0);
    }
    if (!filePath) process.exit(0);

    let absPath = filePath;
    if (!path.isAbsolute(absPath)) absPath = path.join(ROOT_DIR, absPath);
    if (!fs.existsSync(absPath)) process.exit(0);

    // 0. Session-scoped workspace touch log (consumed by post-stop.cjs).
    {
      const relForTouch = path.relative(ROOT_DIR, absPath).split(path.sep).join('/');
      const touchedWs = workspaceForPath(relForTouch);
      if (touchedWs) logWorkspaceTouch(sessionId, touchedWs);
    }

    // 1. JSON validation (warn-only).
    if (absPath.endsWith('.json')) {
      try {
        JSON.parse(fs.readFileSync(absPath, 'utf8'));
      } catch (_e) {
        process.stderr.write(`WARNING: ${absPath} is not valid JSON\n`);
      }
    }

    // 2. .sc routing.
    if (!absPath.endsWith('.sc')) process.exit(0);

    // Compute path relative to ROOT_DIR with forward slashes.
    let rel = path.relative(ROOT_DIR, absPath);
    rel = rel.split(path.sep).join('/');

    const ws = detectWorkspace(rel);
    if (!ws) process.exit(0);

    const domain = readDomain(absPath);
    if (!domain) process.exit(0);

    const doneDir = path.join(ROOT_DIR, ws, 'workflows', 'done');
    const count = countDomainInDir(doneDir, domain);

    if (count >= THRESHOLD && !skillExists(ROOT_DIR, ws, domain)) {
      const pendingFile = path.join(ROOT_DIR, ws, '.claude', 'autolearn-pending');
      try {
        // Ensure parent .claude/ dir exists (it should; but be safe).
        fs.mkdirSync(path.dirname(pendingFile), { recursive: true });
        fs.writeFileSync(pendingFile, `${domain}\n`);
      } catch (_e) {}
    }

    process.exit(0);
  } catch (_e) {
    process.exit(0);
  }
});
