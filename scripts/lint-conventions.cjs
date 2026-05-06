#!/usr/bin/env node
/**
 * Convention linter — enforces the rules in CLAUDE.md / project-conventions.
 *
 * Run: node scripts/lint-conventions.cjs
 * Exits 1 if any rule is violated.
 *
 * Scope: src/app/** and src/ui/components/composed/**.  Design primitives
 * live in `@lunaticwithaduck/webui` (separate package) and aren't scanned —
 * they're allowed to use raw HTML + next/link + next/font, that's their job.
 */

const { readFileSync, readdirSync, statSync } = require('node:fs');
const { join, relative, resolve } = require('node:path');

const ROOT = resolve(__dirname, '..');

const SCAN_DIRS = [resolve(ROOT, 'src/app'), resolve(ROOT, 'src/ui/components/composed')];

const ALLOW_IMPORTS_NEXT_LINK = new Set();

const ALLOW_IMPORTS_NEXT_FONT = new Set([resolve(ROOT, 'src/app/fonts.ts')]);

// File paths where we allow raw HTML (edge cases)
const ALLOW_RAW_HTML = new Set([resolve(ROOT, 'src/app/layout.tsx')]);

// Vestigial: design primitives moved to @lunaticwithaduck/webui and aren't
// scanned anymore. Kept as a never-matching regex so existing skipFile checks
// stay structurally correct without rewriting every rule.
const ALLOW_RAW_PRIMITIVE_HTML_RE = /^$a/;

// Test + story files may use raw HTML on purpose.
const IS_TEST_OR_STORY = (p) => /\.(test|spec|stories)\.(tsx?|jsx?)$/.test(p);

// R3 — <Text> must route user-visible *copy* through the translation pipeline
// via `value=` (with optional `params` for ICU interpolation and inline
// `**markdown**` for styled fragments). The children prop is reserved for
// *runtime* data (user input, server-provided labels, ReactNode slots) which
// has no translatable source.
//
// The split-Text wrapper pattern is gone — if you need to mix static + runtime,
// use one `value=` with ICU placeholders ("Received {count} offers"). If you
// need styled fragments, use inline markdown inside the translated string.
//
// We flag a Text opening tag that lacks `value=` AND `asChild` AND whose
// children are obviously static copy (literal text or a `*_COPY.x` reference).
// Pure-runtime children (`{message}`, `{worker.name}`, `{value}`) are allowed.
// Self-closing <Text … /> doesn't match this regex, which is correct — a
// self-closing Text has no children, so it's a no-op for children-flow checks
// (and self-closers always carry `value=` in practice, enforced by TS types).
const TEXT_OPEN_TAG_RE = /<Text\b([^>]*?)>([\s\S]*?)<\/Text>/g;

// R5 — One component per file. Screens and composed code must declare exactly
// one React component per source file; extract helpers + sub-components into
// their own `./components/<Name>/<Name>.tsx` (or `./utils/<name>.utils.ts`
// for non-component helpers). We detect components as top-level PascalCase
// `function X(` or `const X = (` declarations. Non-component PascalCase
// values (types, enums, styles maps) are constrained by a JSX heuristic:
// only flag declarations whose bodies contain a JSX opening tag before the
// next top-level declaration.
const TOP_LEVEL_COMPONENT_RE =
  /^(?:export\s+)?(?:function|const)\s+([A-Z][A-Za-z0-9]*)\s*(?:\(|=\s*(?:\(|\(?\s*[A-Za-z{]))/gm;

function findComponentDeclarations(src) {
  const matches = [...src.matchAll(TOP_LEVEL_COMPONENT_RE)];
  const decls = [];
  for (let i = 0; i < matches.length; i += 1) {
    const match = matches[i];
    const name = match[1];
    const start = match.index ?? 0;
    const end = i + 1 < matches.length ? (matches[i + 1].index ?? src.length) : src.length;
    const body = src.slice(start, end);
    // JSX heuristic — only count as a component if the body renders JSX.
    if (
      /return\s*\(\s*</.test(body) ||
      /=>\s*\(?\s*</.test(body) ||
      /<[A-Z][A-Za-z0-9]*[\s/>]/.test(body)
    ) {
      const line = src.slice(0, start).split('\n').length;
      decls.push({ name, line });
    }
  }
  return decls;
}

function findMultiComponentViolations(src, rel, file) {
  if (ALLOW_RAW_PRIMITIVE_HTML_RE.test(file) || IS_TEST_OR_STORY(file)) return [];
  if (!file.endsWith('.tsx')) return [];
  const decls = findComponentDeclarations(src);
  if (decls.length < 2) return [];
  return decls.slice(1).map((decl) => ({
    file: rel,
    line: decl.line,
    rule: 'R5: one component per file',
    hint: `File declares multiple React components (${decls.map((d) => d.name).join(', ')}). Extract "${decl.name}" to its own ./components/${decl.name}/${decl.name}.tsx. Non-component helpers (pure functions, constants) belong in ./utils/<name>.utils.ts.`,
    snippet: decl.name,
  }));
}

// String-shaped DATA suffixes. When a `*_DATA.…` chain inside <Text> children
// ends in one of these, the field is almost certainly mis-namespaced copy that
// should live in a `*_COPY.…` constant and flow through `value=`. Keep this
// list conservative — anything that could plausibly be runtime data (amount,
// count, id, code, slug, url, date) stays out.
const DATA_STRING_SUFFIXES = [
  'title',
  'subtitle',
  'label',
  'headline',
  'sub',
  'eyebrow',
  'cta',
  'price',
  'deadline',
  'warranty',
  'materials',
  'name',
  'description',
  'caption',
  'placeholder',
  'tagline',
  'heading',
  'body',
  'message',
  'note',
];
const DATA_STRING_SUFFIX_RE = /\b[A-Z][A-Z0-9_]*_DATA\b(?:\.[A-Za-z_$][A-Za-z0-9_$]*)+/g;

function findTextChildrenViolations(src, rel) {
  const out = [];
  TEXT_OPEN_TAG_RE.lastIndex = 0;
  let m = TEXT_OPEN_TAG_RE.exec(src);
  while (m !== null) {
    const [full, openProps, inner] = m;
    m = TEXT_OPEN_TAG_RE.exec(src);
    if (/\bvalue=/.test(openProps)) continue;
    if (/\basChild\b/.test(openProps)) continue;
    const trimmed = inner.trim();
    if (trimmed.length === 0) continue;
    const dataChainHasStringSuffix = (() => {
      DATA_STRING_SUFFIX_RE.lastIndex = 0;
      let dm = DATA_STRING_SUFFIX_RE.exec(inner);
      while (dm !== null) {
        const chain = dm[0];
        const lastSegment = chain.split('.').pop();
        if (lastSegment && DATA_STRING_SUFFIXES.includes(lastSegment)) return true;
        dm = DATA_STRING_SUFFIX_RE.exec(inner);
      }
      return false;
    })();
    const looksLikeStaticCopy =
      // literal text directly inside <Text>…</Text>
      /^[^{<][\s\S]*\w/.test(trimmed) ||
      // reference to an ALL_CAPS_COPY constant, e.g. {INTRO_COPY.headline}
      /\b[A-Z][A-Z0-9_]*_COPY\b/.test(inner) ||
      // reference to an ALL_CAPS_DATA chain that ends in a string-shaped field
      // (title/label/headline/...) — typically copy mis-namespaced as DATA.
      dataChainHasStringSuffix ||
      // bare string literal inside a JSX expression
      /\{[\s\S]*(['"])[^'"]+\1[\s\S]*\}/.test(inner);
    if (!looksLikeStaticCopy) continue;
    const line = src.slice(0, full ? src.indexOf(full) : 0).split('\n').length;
    out.push({
      file: rel,
      line,
      rule: 'R3: <Text> static copy must flow through value=',
      hint: 'Use <Text value="…{name}…" params={{ name }} />. Runtime data (user input, server strings) stays as children. No split-Text wrapper pattern — mix static + runtime via ICU placeholders, style fragments via **bold** / *italic* / __underline__ markdown inside the translated string. If the value comes from a `*_DATA.…title/.label/.headline/...` chain, that field is mis-namespaced copy — move it to `*_COPY` and translate.',
      snippet: full.replace(/\s+/g, ' ').slice(0, 160),
    });
  }
  return out;
}

const rules = [
  {
    name: 'R1: no inline style={}',
    pattern: /\bstyle=\{/,
    skipFile: (p) => p.endsWith('.styles.ts') || p.endsWith('.styles.tsx'),
    hint: 'Move inline styles into a co-located *.styles.ts file (CVA).',
  },
  {
    name: 'R3: no raw <input> (use Input primitive or wrap in LabeledField deliberately)',
    pattern: /<input\b/,
    skipFile: (p) => ALLOW_RAW_PRIMITIVE_HTML_RE.test(p) || IS_TEST_OR_STORY(p),
    skipLine: () => false,
    hint: 'Use <Input label=… /> from @/ui/components/design/Input/Input. Add a `suffix` or adornment prop to Input if you need extra chrome.',
  },
  {
    name: 'R3: no raw <textarea> (use Textarea primitive)',
    pattern: /<textarea\b/,
    skipFile: (p) => ALLOW_RAW_PRIMITIVE_HTML_RE.test(p) || IS_TEST_OR_STORY(p),
    skipLine: () => false,
    hint: 'Use <Textarea label=… /> from @/ui/components/design/Textarea/Textarea.',
  },
  {
    name: 'R3: no raw <button (use Button primitive; asChild+unstyled for custom surfaces)',
    // Match opening <button tag, but not </button>. A raw <button> in screen
    // code should be wrapped in <Button asChild> or <Button asChild unstyled>.
    // We cheaply allow the case where the literal line directly above ends
    // with `asChild` by using a small sliding-window check below, not regex.
    pattern: /<button\b/,
    skipFile: (p) => ALLOW_RAW_PRIMITIVE_HTML_RE.test(p) || IS_TEST_OR_STORY(p),
    skipLine: () => false,
    hint: 'Route through <Button variant=… /> for CTAs, or <Button asChild unstyled>…</Button> when you need a custom clickable surface.',
    // Custom scanner: skip when wrapped by <Button asChild…> in the nearby lines.
    contextAwareSkip: (lines, i) => {
      // Search the preceding 6 lines for `<Button asChild` opening.
      const start = Math.max(0, i - 6);
      for (let j = start; j < i; j += 1) {
        if (/<Button\b[^>]*\basChild\b/.test(lines[j])) return true;
      }
      return false;
    },
  },
  {
    name: 'R4: no hardcoded hex color',
    pattern: /#[0-9a-fA-F]{6}\b(?!`|\s*[`"'])/,
    // allow in .styles.ts where tokens cover most cases but occasional hex is OK in CVA base strings
    skipFile: (p) => p.endsWith('.styles.ts'),
    // ignore data-node-id and similar comment-like occurrences
    skipLine: (line) => /data-node-id|@figma|\/\/|\/\*|^\s*\*/.test(line),
    hint: 'Use token classes (bg-primary, text-text, border-border) instead of hex.',
  },
  {
    name: 'R4: no arbitrary-value Tailwind class',
    // catch className with arbitrary bracket values like rounded-[14px], text-[12px], w-[100%]
    // narrow to common sources of regressions
    pattern:
      /className=.*?(?:rounded-\[|text-\[(?:\d|#)|bg-\[#|tracking-\[|leading-\[|w-\[\d|h-\[\d(?!dvh)|p[xylrtb]?-\[\d|m[xylrtb]?-\[\d)/,
    skipFile: (p) => p.endsWith('.styles.ts') || p.endsWith('.styles.tsx'),
    skipLine: () => false,
    hint: 'Use design-token utilities (rounded-button, text-base, tracking-wider). Arbitrary values belong in .styles.ts only if unavoidable.',
  },
  {
    name: 'R3: no raw <a href=> (use Link primitive)',
    pattern: /<a\s+[^>]*href=/,
    skipFile: (p) => ALLOW_RAW_HTML.has(p),
    skipLine: () => false,
    hint: 'Use <Link href={…} /> from @/ui/components/design/Link/Link instead of a raw <a>.',
  },
  {
    name: 'R7: no string-literal href="/…" (use @/config/routes)',
    pattern: /href=(?:"|')\/[a-zA-Z]/,
    skipFile: (p) => p.endsWith('.styles.ts') || p.endsWith('.styles.tsx'),
    skipLine: () => false,
    hint: 'Import routes from @/config/routes and reference routes.<section>.<name>.',
  },
  {
    name: 'R3/R8: next/link must be imported only via the Link primitive',
    pattern: /from\s+["']next\/link["']/,
    skipFile: (p) => ALLOW_IMPORTS_NEXT_LINK.has(p),
    skipLine: () => false,
    hint: 'Import Link from @/ui/components/design/Link/Link, not next/link directly.',
  },
  {
    name: 'R8: next/font/google must be imported only from src/app/fonts.ts',
    pattern: /from\s+["']next\/font\/google["']/,
    skipFile: (p) => ALLOW_IMPORTS_NEXT_FONT.has(p),
    skipLine: () => false,
    hint: 'Import font variables from @/app/fonts; never re-define fonts anywhere else.',
  },
];

function walk(dir, out) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    const full = join(dir, name);
    const s = statSync(full);
    if (s.isDirectory()) {
      if (name === 'node_modules' || name === '.next') continue;
      walk(full, out);
    } else if (/\.(tsx?|jsx?)$/.test(name)) {
      out.push(full);
    }
  }
}

const files = [];
for (const d of SCAN_DIRS) walk(d, files);

const violations = [];

for (const file of files) {
  const rel = relative(ROOT, file);
  const src = readFileSync(file, 'utf-8');
  const lines = src.split('\n');

  // Multi-line rules: Text-with-children flow check (R3).
  if (!ALLOW_RAW_PRIMITIVE_HTML_RE.test(file) && !IS_TEST_OR_STORY(file)) {
    violations.push(...findTextChildrenViolations(src, rel));
  }

  // R5 — one component per file
  violations.push(...findMultiComponentViolations(src, rel, file));

  for (const rule of rules) {
    if (rule.skipFile?.(file)) continue;
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      if (rule.skipLine?.(line)) continue;
      if (rule.contextAwareSkip?.(lines, i)) continue;
      if (rule.pattern.test(line)) {
        violations.push({
          file: rel,
          line: i + 1,
          rule: rule.name,
          hint: rule.hint,
          snippet: line.trim().slice(0, 160),
        });
      }
    }
  }
}

if (violations.length === 0) {
  console.log(`[lint-conventions] ${files.length} files scanned — clean.`);
  process.exit(0);
}

console.error(
  `[lint-conventions] ${violations.length} violation${violations.length === 1 ? '' : 's'}:\n`,
);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}`);
  console.error(`    rule : ${v.rule}`);
  console.error(`    code : ${v.snippet}`);
  console.error(`    fix  : ${v.hint}\n`);
}
process.exit(1);
