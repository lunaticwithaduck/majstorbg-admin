# Skill: project-conventions

When adding, editing, or reviewing code in `apps/web`, these are
non-negotiable. Before finishing the task, confirm each one.

## Original four

### 1. Follow existing component patterns
- Read a nearby component under `src/ui/` before creating or reshaping anything.
  The design system lives in `src/ui/design-system/` — reuse tokens, primitives,
  and variants instead of inventing new ones.
- New components go under `src/ui/` using the same file layout, props shape, and
  styling approach as neighbours (Radix primitives wrapped with CVA + Tailwind).
- Don't introduce a competing abstraction when one already exists.

### 2. Tests live with the code
- Unit tests: **Vitest** + Testing Library — colocate `*.test.ts(x)` next to the
  file under test. Cover behavior, not implementation.
- End-to-end: **Playwright** in `e2e/` — add a spec when shipping a user-visible
  flow.
- Before completing a task: `pnpm typecheck && pnpm test` must pass. For e2e-
  touching work, also `pnpm e2e`.

### 3. User-facing text goes through translations
- No hardcoded strings in JSX, toasts, errors, or alt text. Every piece of copy
  flows through `next-intl` — use `useTranslations` / `getTranslations` with a
  key in the message catalogue. Staged copy awaiting i18n sits in
  `./config/constants.ts` with a `TODO(i18n)` comment — never inlined in JSX.
- Add new keys under the existing namespace scheme; keep `en.json` complete.
  Missing locales are a bug.
- `pnpm i18n:generate` regenerates the typed message bindings after catalogue
  changes.

### 4. Features ship behind feature flags
- Any new user-visible feature, experimental behavior, or risky switch must be
  gated by a flag from `@lunaticwithaduck/feature-flags` — no ad-hoc booleans,
  env-variable reads, or inline constants.
- Register the flag in the shared package, then read it at the feature boundary.
  Default to **off** unless the feature is already rolled out.

## Component rules (from PR #2 review)

### R1. Inline styling is banned
- No `style={{...}}` in JSX. Anything beyond a handful of static class
  tokens extracts to `<Component>.styles.ts` using `cva`.
- The ONE allowed exception is `data-node-id="..."` (Figma tracking).
- `pnpm lint:conventions` fails the build if it finds a bare `style={` in
  a JSX file.

### R2. No in-file constants / config
- String literals, copy objects, option arrays, step totals, category
  lists — move to `./config/constants.ts` in the component's folder.
- Hrefs come from `@/config/routes`, never inline.

### R3. Use project primitives

**Text — value= is non-negotiable.**
- Every piece of static copy goes through `<Text value="English default"
  params={…} />`. The `value` prop is the entry point to the translation
  pipeline; `children` is reserved for runtime data (user input,
  server-returned strings).
- **One `<Text value=>` per phrase.** No outer-wrapper `<Text>` with nested
  inner `<Text value=>` + literal glue. Mix static + runtime via ICU
  placeholders in a single value: `<Text value="Received {count} offers"
  params={{ count }} />`. Style styled fragments via inline markdown
  (`**bold**`, `*italic*`, `__underline__`) inside the translated string.
- For grammatical plurals/gender, use full ICU syntax:
  `"{count, plural, =0 {no offers} one {1 offer} other {# offers}}"`.
- `pnpm lint:conventions` flags Text children that contain literal text or
  `*_COPY.*` references. Runtime-only expressions (`{message}`,
  `{worker.name}`) pass.

**Other primitives.**
- `Button` for all buttons. Nav CTA: `<Button asChild variant="…" size="…">
  <Link variant="inherit" href={…}>…</Link></Button>`. Custom clickable
  surface: `<Button asChild unstyled><button>…</button></Button>`. Raw
  `<button>` is banned in screens/composed.
- `Input` / `Textarea` for form fields. Use `suffix` on Input for trailing
  adornments. Raw `<input>` / `<textarea>` is banned in screens/composed.
- `Link` for every navigation link — never `next/link` directly.
- `Icon` (with a lucide import) for every icon — never unicode glyphs like
  `✓` or `‹`.
- `Spacer` for layout gaps that aren't gap/padding.
- If a primitive doesn't exist for what you need, ADD it to `design/`, don't
  work around it.

### R4. Tokens not numbers
- Spacings: Tailwind scale (`p-4`, `gap-6`) — never `px-[13px]`.
- Colors: token classes (`bg-primary`, `text-muted`) — never `#f25c1f`.
- Radii: `rounded-{button,lg,xl,2xl,full}` — regenerated from
  `tokens.radius` by `pnpm theme:generate`.
- Typography: `tracking-{…}`, `leading-{…}` — never inline
  `letterSpacing` / `lineHeight`.

### R5. Folder discipline
- `design/` = reused across 2+ consumers.
- `composed/` = reused across 2+ routes.
- Single-use children live in `<parent>/components/<Child>/` — not in
  `composed/`.
- One component per file.

### R6. No shim `page.tsx`
- Screen body lives IN `page.tsx`, not re-exported from `composed/`.
- Page-scoped assets colocate: `./page.styles.ts`, `./config/constants.ts`,
  `./components/*`.

### R7. Routes
- Every href reads from `@/config/routes`.
- Internal nav uses `<Link>`; external uses `<Link external>`.

### R8. Fonts
- `next/font/google` imports live ONLY in `src/app/fonts.ts`.

### R9. Workflow discipline
- Every multi-step piece of work gets a `workflows/tasks/*.md` file
  before implementation. Run `/complete` when done.

## Completion checklist

Before running `/complete`, confirm:

- [ ] New/changed components match existing patterns under `src/ui/`
- [ ] Tests written and `pnpm typecheck && pnpm test` passes
- [ ] `pnpm lint:conventions` passes
- [ ] All user-facing text goes through `next-intl` (or staged in `./config/constants.ts` with a `TODO(i18n)`)
- [ ] New feature behavior is gated via `@lunaticwithaduck/feature-flags`
- [ ] Every `className` cluster that varies by state is in `.styles.ts`
- [ ] No raw `<p>/<h1>/<a>/<button>/<input>/<textarea>` inside `src/app/**` or composed screens — use primitives
- [ ] Every `<Text>` carries `value=` (static copy) or a pure-runtime expression in children (no `_COPY.*` refs, no literal text, no split-Text wrappers)
- [ ] No inline `style={...}` attributes
- [ ] No hardcoded hrefs in JSX (use `@/config/routes`)
- [ ] No hardcoded hex colors or arbitrary-value Tailwind classes in JSX (use tokens)
