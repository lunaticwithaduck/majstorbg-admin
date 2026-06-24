---
domain: admin-reports
source_task: admin-worker-supply-report.md
date: 2026-06-22
keywords: ["admin report", "prisma cross-model join", "worker supply", "groupBy", "free-text foreign key", "supply vs demand window"]
---

## Extracted Knowledge

Additive to `liquidity-bids-per-job-report.sc` (same `admin-reports` domain).
The general BE/FE report recipe is documented there; this captures the
DATA-MODEL and aggregation specifics that the "Worker supply & coverage"
report surfaced — the non-obvious schema facts that determine how supply and
demand are joined in majstorbg-backend.

### Schema facts that aren't where you'd expect (majstorbg prisma)
- `Worker` has NO `cityName` and NO `category` column. City lives in
  `Worker.serviceCity` (nullable String) — fall back to `Worker.serviceArea`
  (required String) when null. There is NO archived/soft-delete flag, so
  "active worker" == every `Worker` row.
- A worker's skills/categories are NOT on `Worker`. They live in `WorkerSkill`,
  joined to the worker through the SHARED `userId` (`Worker.userId` ==
  `WorkerSkill.userId`, both nullable-on-Worker). `WorkerSkill` has two
  category FKs: `categoryId` → `SkillCategory` (richer 15-value profession
  taxonomy) and `jobCategoryId` → `JobCategory` (10-value taxonomy). Use
  `jobCategoryId` when you need to line workers up against jobs.
- `Job.category` is a plain `String`, NOT a relation — but it actually stores a
  `JobCategory.id` (validated on job-create by
  `JobCategoriesService.validateCategoryId`). So demand
  (`prisma.job.groupBy({ by:['category'] })`) and supply
  (`WorkerSkill.jobCategoryId`) match on the SAME `JobCategory.id` string.
  Resolve human labels from `JobCategory.nameEn`/`nameBg`.
- `JobStatus` enum: `open | accepted | in_progress | awaiting_confirmation |
  completed | cancelled`. Open-job demand = `status: 'open'`.

### Supply-vs-demand windowing
- Supply (Worker/WorkerSkill rows) is a CURRENT SNAPSHOT — do NOT time-filter
  it. "How many active workers exist right now" is the question.
- Only the DEMAND side (open Jobs) takes the `from`/`to` window, anchored on
  `Job.createdAt` as the usual half-open `[from, to)`. Document this split in
  the query DTO so the next reader doesn't try to date-filter workers.

### Cross-model in-memory aggregation pattern
- `findMany` workers (minimal select) + `findMany` skills
  (`where:{ jobCategoryId:{ not:null } }`, select `userId`+`jobCategoryId`) +
  `groupBy` open jobs by the dimension — then assemble per-bucket counts in a
  `Map<key, acc>` in memory. The bucket set (cities / ~10 categories) is tiny,
  so search/sort/slice-pagination in memory is fine and stable (tiebreak on
  key).
- Build a `Map<userId, workerSnapshot>` first, then fold each skill row into
  its category bucket via that map — workers with `userId === null` simply
  can't be matched and drop out of the category dimension (note it).
- Dedupe `(userId, categoryId)` with a `Set` so a worker with two skills in the
  same category counts once.
- Surface buckets that have DEMAND but ZERO supply: after tallying workers,
  loop the job groups and seed any missing key with a zeroed accumulator —
  otherwise thin/absent coverage vanishes from the report.
- `coverageRatio = activeWorkers / openJobs` is `null` when `openJobs === 0`
  (would be Infinity); response field is `z.number().nullable()`, FE renders
  `—`. Sort must push nulls to the end regardless of direction.
- `thinCoverage = openJobs > 0 && activeWorkers < openJobs * FACTOR` —
  compute the flag server-side (one tunable const) so the FE never reimplements
  the heuristic.

### FE: typecheck a screen BEFORE the wiring agent re-exports the hook
- The hook (`useGetWorkerSupplyQuery`) doesn't exist in `store.ts` yet (wiring
  agent owns that file), so `ReturnType<typeof useGetXQuery>['data']` resolves
  to `any` and `.map((point) => ...)` trips `noImplicitAny` (TS7006).
- Fix without touching store.ts: import the row/point TYPES from your own
  endpoints file and (a) make the derived Row type fall back to it —
  `type Row = Resp extends { items: readonly unknown[] } ? Resp['items'][number]
  : EndpointRow;` — and (b) annotate map callbacks by casting the source
  (`(data?.chart ?? []) as ChartPoint[]).map((point) => ...`). Once wiring
  lands, the conditional resolves to the real typed item.
- To self-verify the screen compiles, TEMPORARILY add the
  import/spread/hook-export to store.ts, run `tsc --noEmit`, then revert all
  three edits exactly (git diff to confirm store.ts is byte-identical). Leaves
  the disjoint-files boundary intact.

## Proposed Skill Content

Fold into the `admin-reports` skill a "supply/demand & cross-model joins"
section:
1. The majstorbg schema gotchas: Worker has no city/category (serviceCity→
   serviceArea), skills via shared userId on WorkerSkill, `Job.category` is a
   free-text String that holds a `JobCategory.id` (so it joins to
   `WorkerSkill.jobCategoryId`), JobStatus members.
2. Supply = live snapshot (never time-filtered); only demand takes the
   Job.createdAt window — and say so in the DTO.
3. In-memory Map aggregation across findMany(workers)+findMany(skills)+
   groupBy(jobs): userId→snapshot map, (worker,category) dedupe Set, seed
   zero-supply buckets from demand groups, null coverageRatio (nulls sort
   last), server-computed thinCoverage flag.
4. The pre-wiring typecheck trick: endpoint-type fallback for the derived Row,
   cast map sources to the endpoint point type, and the temp-wire-then-revert
   store.ts verification (with git-diff confirmation).
