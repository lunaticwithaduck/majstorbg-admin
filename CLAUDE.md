# CLAUDE.md — `majstorbg-admin`

Internal admin app for the **majstorbg** platform. Standalone repo; consumes the same BE and the same shared `@lunaticwithaduck/*` packages as the consumer-facing web app, role-gated for staff use.

This workspace uses **agentic** infrastructure for AI-assisted development. Conventions are mirrored from `../majstorbg/apps/web/CLAUDE.md` — read that file first; the rules below repeat its R1–R10 verbatim and skip R11 (admin has no mobile breakpoint).

## Project Structure

### Stack
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS 4 (via `@tailwindcss/postcss`)
- **i18n**: `next-intl` + `@lunaticwithaduck/i18n` (catalogue reused from the consumer app, no admin-local catalogue)
- **Animation**: `motion`
- **UI primitives**: `@lunaticwithaduck/webui` (no Radix consumed directly)
- **Tables / forms**: `@tanstack/react-table`, `react-hook-form` + `@hookform/resolvers`
- **Unit tests**: Vitest + Testing Library (jsdom)
- **E2E tests**: Playwright
- **Lint / format**: Biome

### Key directories
- `src/app/` — Next.js App Router routes, layouts, root metadata
- `src/auth/` — `can(action, subject)` permission helper. Auth wiring deferred until staff role lands on BE.
- `src/lib/` — cross-cutting utilities (i18n shim re-exports from `@lunaticwithaduck/i18n/runtime/request`)
- `src/ui/components/composed/` — composed components reused across 2+ admin routes (data-table wrappers, audit-log row, etc.). Primitives live in `@lunaticwithaduck/webui`, never duplicated here.
- `e2e/` — Playwright suites
- `scripts/lint-conventions.cjs` — convention checker (R1, R3, R4, R7, R8 patterns)
- `workflows/` — agentic pipeline (`ideas/`, `tasks/`, `done/`, `problems/`)

### External package consumption
Admin installs `@lunaticwithaduck/{api,feature-flags,i18n,schemas,types,webui}` from **GitHub Packages**. `.npmrc` declares the registry; `NODE_AUTH_TOKEN` (a GitHub PAT with `read:packages`) must be exported in the shell before `pnpm install`. The token lives in `../majstorbg-backend/.env`.

For local cross-repo iteration against an unpublished package change, use **yalc** — see `../majstorbg/PUBLISHING.md`.

### Commands
| Command | Purpose |
|---------|---------|
| `pnpm dev` | Next dev server (port 3000) |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` / `pnpm test:watch` | Vitest |
| `pnpm e2e` | Playwright |
| `pnpm lint` / `pnpm lint:fix` | Biome |
| `pnpm lint:conventions` | Convention checker |

## Component rules — NON-NEGOTIABLE

These come from `../majstorbg/apps/web/CLAUDE.md` and apply verbatim. The consumer app's PR review history is the rationale for every one.

### R1. No inline styling. Ever.
- No `style={{...}}` in JSX. Every `className` longer than a handful of tokens — or any className that changes by prop/state — extracts to a sibling `*.styles.ts` file using `cva` from `class-variance-authority`.
- The ONE allowed exception is `data-node-id="..."` (Figma tracking).
- Raw `style={...}` attributes outside `.styles.ts` are blocked by `pnpm lint:conventions`.

### R2. No in-file configuration or copy
- String literals (headings, labels, CTAs, placeholders), route lists, option arrays, step totals — anything that isn't JSX or a render helper — moves to `./config/constants.ts` in the component's folder, or to `@/config/routes` for hrefs.
- `./config/constants.ts` exports `ALL_CAPS_OBJECTS` per-concern.

### R3. Use the project primitives. Do not roll your own.

#### Text — `value=` is the translation pipeline
- `<Text as="…" size="…" weight="…" color="…" value="English default">` — never a raw `<p>/<span>/<h1..h6>/<label>`.
- Mixed static + runtime copy goes in ONE `value=` as an ICU template with named placeholders.
- Styled fragments inside a translated phrase use inline markdown: `**bold**`, `*italic*`, `__underline__`. Style the resulting tags via descendant selectors in `.styles.ts`.
- `children` is RESERVED for runtime data with no translatable source.

#### Buttons, inputs, and the rest
- Button → `<Button variant="…" size="…">` from `@lunaticwithaduck/webui`. Never a bare `<button>`. For custom clickable surfaces wrap in `<Button asChild unstyled>…</Button>`.
- Input → `<Input label="…" />` from `@lunaticwithaduck/webui`. Raw `<input>` is banned in screen/composed code.
- Textarea → `<Textarea label="…" />`. Raw `<textarea>` is banned.
- Link → `<Link href={…} variant="…">` — NEVER `next/link` directly.
- Icon → `<Icon icon={LucideIcon} size="…" />` — never a hand-rolled SVG or unicode glyph.
- Spacer → `<Spacer />` for flex spacer or `<Spacer size={4} />` for fixed gaps.

### R4. Use design tokens. No hardcoded numbers or colors.
- Spacings: Tailwind scale (`p-4`, `gap-6`).
- Colors: token classes (`bg-primary`, `text-muted`, `border-border`) — never hex, never `bg-[#…]`.
- Radii: `rounded-{button,lg,xl,2xl,full}` from `tokens.radius`.
- Typography: `tracking-{tight,wide,…}`, `leading-{tight,snug,normal}`.

### R5. Folder discipline
- `src/ui/components/composed/` — composed components reused across 2+ routes. Layout: `Component.tsx` + `Component.styles.ts` (+ optional `Component.test.tsx`).
- Single-use children live **inside the parent's folder**, not in `composed/`. If a component is only referenced by one screen, move it to `<that-screen>/components/<Child>/Child.tsx` + `Child.styles.ts`.
- Cross-screen chrome (sidebar, topbar, page-head) lives in `app/[locale]/_components/<role>-shell/` once 2+ screens consume it.
- **One component per file** — enforced by `pnpm lint:conventions`. `page.tsx` renders ONE component (the page).
- Design primitives DO NOT live here — they live in `@lunaticwithaduck/webui`. Adding a primitive means PRing the consumer monorepo, not duplicating in admin.

### R6. No shim `page.tsx` files
- A `page.tsx` that just imports and renders a component from `composed/` is useless indirection. The screen body lives IN the `page.tsx`. Page-scoped styles/config/children colocate as `./page.styles.ts`, `./config/constants.ts`, `./components/*`.

### R7. Routing
- All hrefs come from `@/config/routes`. No string-literal `href="/..."` in JSX.
- Use `<Link>` primitive for internal nav; set `external` prop for external links.
- Dynamic route segments: `encodeURIComponent()` the value.

### R8. Fonts
- `next/font/google` imports live ONLY in `src/app/fonts.ts`. Every consumer reads `fontVariables` from there and nothing else.

### R9. Workflow discipline
- Every multi-step piece of work gets a `workflows/tasks/*.md` file before implementation starts. Run `/complete` when finished. In-memory checklists don't count.

### R10. Feature flags
- Shared flag definitions live in `@lunaticwithaduck/feature-flags`. Do not read `process.env.NEXT_PUBLIC_FLAG_*` directly from components — go through `@/config/feature-flags`.
- Add a new flag to `@lunaticwithaduck/feature-flags` whenever you need a kill-switch or staged rollout — never hand-roll `if (isProd)` checks.

## Agentic Flow

### Workflow Pipeline
Work items flow through a pipeline of markdown files:

1. **Ideas** (`workflows/ideas/`) — Raw ideas, feature requests, brainstorms
2. **Tasks** (`workflows/tasks/`) — Refined, actionable work items with acceptance criteria
3. **Done** (`workflows/done/`) — Completed work with outcome notes and `.sc` skill candidates
4. **Problems** (`workflows/problems/`) — Open design problems and known issues (not actionable yet)

Manage the pipeline with `/idea`, `/promote`, `/complete`.

### Skills
Skills live in `.claude/skills/` and provide domain expertise. They are **auto-detected** via the `UserPromptSubmit` hook — every prompt is matched against `.claude/skills/skill-rules.json` and relevant skills are injected as context.

### Hooks
Hooks in `.claude/settings.json` enforce guardrails automatically:
- **UserPromptSubmit** — skill auto-detection (`skill-detector.cjs`)
- **PreToolUse (Bash)** — blocks commands that would expose secrets (`block-secrets.cjs`)
- **PostToolUse (Write/Edit)** — validation after file modifications (`post-write.cjs`)
- **Stop** — blocks session end if open tasks remain in `workflows/tasks/` (`post-stop.cjs`)

### Multi-Agent System
Specialized agents in `.claude/agents/`:

| Agent | Role |
|-------|------|
| **project-manager** | Orchestrates work, breaks down tasks, coordinates agents |
| **architect** | Design decisions, trade-offs, system structure |
| **worker** | Implements scoped tasks |
| **refactorer** | Restructures code without changing behavior |
| **devops** | Builds, pipelines, containers, deployments |
| **security** | Finds vulnerabilities, hardens the codebase |

### Slash Commands
| Command | Description |
|---------|-------------|
| `/idea [title]` | Create a new idea |
| `/promote [file]` | Move an idea to a task |
| `/complete [file]` | Mark a task as done |
| `/diagram` | Architecture diagrams |
| `/security` | Security scan |
| `/preserve` | Write session notes before ending a session |

## Task Pipeline — REQUIRED

Before starting any multi-step work, you MUST:

1. Create a task file in `workflows/tasks/` — one file per logical unit of work
2. Implement the task
3. When done, run `/complete` to move it to `workflows/done/` with outcome notes and `.sc` evaluation

The only valid task record is a `.md` file in `workflows/tasks/`. In-memory checklists, TodoWrite, and chat-based lists do not count — they evaporate between sessions.

### Task File Template

```markdown
---
title: Short description
created: YYYY-MM-DD
status: in-progress
---

## Goal
What needs to be done and why.

## Steps
- [ ] Step 1
- [ ] Step 2

## Completion
When all steps above are done:
Run `/complete workflows/tasks/THIS-FILENAME.md` before starting any new work.
```

## Deferred decisions

These are **intentionally** not wired up in the first scaffold. See `workflows/tasks/scaffold-admin.md` for context.

- **Auth.** No `better-auth` client, no `/admin/*` middleware role gate, no real login. `src/auth/can.ts` is a placeholder returning `true`. Resume when the BE adds an `admin` role to `UserRole` (currently `worker | client` only).
- **Deployment topology.** Same-apex vs. locked-down host is undecided. Affects CORS and cookie domain. Pick when shipping beyond local dev.
- **Storybook.** Not configured. The consumer monorepo has Storybook for `@lunaticwithaduck/webui` already; admin can run it from there. Revisit if admin grows enough composed components to justify its own workbench.
- **Admin-local i18n catalogue.** Admin currently reuses the consumer catalogue from `@lunaticwithaduck/i18n` as-is. If admin's vocabulary diverges enough that bundle inflation hurts, split into a namespaced catalogue.
