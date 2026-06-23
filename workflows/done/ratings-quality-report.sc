---
domain: admin-reports
source_task: ratings-quality-report.md
date: 2026-06-22
keywords: ["admin report", "ratings", "review aggregate", "bidirectional reviews", "dispute rate", "donut chart", "prisma groupBy having"]
---

## Extracted Knowledge

Additive to `liquidity-bids-per-job-report.sc` (general BE/FE report recipe)
and `admin-worker-supply-report.sc` (cross-model joins). This captures the
RATING/REVIEW data-model facts and the donut + in-memory-HAVING patterns the
"Ratings & quality" report surfaced in majstorbg.

### Review / rating schema facts (majstorbg prisma)
- `Review` has ONLY: `id, jobId, authorUserId, subjectUserId, stars (Int),
  body, response (String?), createdAt`. There is NO rating-chip / tag / aspect
  column — `stars` is the ONLY persisted rating signal. Do NOT design a report
  around chips; an unrated entity simply has no Review rows.
- Reviews are BIDIRECTIONAL: a worker rates a client AND a client rates a
  worker, both as `Review` rows. The "worker quality" number is the
  worker-AS-SUBJECT side only: filter `subject: { is: { role: 'worker' } }`
  (Review.subjectUserId -> User.role === 'worker'). Forgetting this doubles the
  set with the reverse direction.
- `stars` is a free `Int` (1..5 by convention, NOT enum-enforced). When building
  the 1..5 histogram, clamp `if (g.stars >= 1 && g.stars <= 5)` so a stray value
  can't widen the bucket set; zero-fill all five buckets so the donut is stable.
- Dispute attribution to a worker is INDIRECT: `Dispute.bidId -> Bid.workerUserId`
  (Dispute has no worker FK). Filter `bid: { is: { workerUserId: { in: ids } } }`,
  then re-fold `groupBy(['bidId'])` results to workers via a single
  `bid.findMany({ select: { id, workerUserId } })` lookup map.
- Prisma to-one relation filters in this codebase use the `{ is: { ... } }`
  wrapper form (`subject: { is: { role } }`, `bid: { is: { workerUserId } }`,
  `job: { is: { status: 'completed' } }`) — matches the worker-leaderboard
  service. The flat form also compiles but `{ is: }` is the house convention.

### Windowed-vs-lifetime split (state it in the DTO)
- Rating tiles + star distribution + reviewCount window on `Review.createdAt`
  (half-open `[from, to)`, both bounds optional).
- Dispute RATE is LIFETIME platform-wide on purpose: `disputeRate = total
  disputes / completed-job count`, NOT windowed (a rolling window over a tiny
  dispute set is noise; it's framed as a platform-health number). Document the
  asymmetry in the query DTO so the next reader doesn't add a window.
- Guard the ratio: `rate(n,d) => d === 0 ? 0 : n/d`, round to 2dp. Return
  `totalDisputes` + `completedJobs` raw so the FE can show the ratio's basis.

### In-memory HAVING + sort + paginate over a groupBy
- "Workers whose avg < threshold AND count >= min" can't be expressed as a
  Prisma HAVING + orderBy + paginate across the join. Instead:
  `review.groupBy({ by:['subjectUserId'], _avg:{stars}, _count:{_all} })`,
  then `.map(...).filter(r => r.reviewCount >= minReviews && r.avgRating <
  maxAvg)` in memory, then a second trip for names/disputes over the qualifying
  ids, then sort + slice-paginate the assembled rows. The worker pool is small;
  tiebreak on id for stable pagination.
- Thresholds (`minReviews` default 3, `maxAvg` default 3) are
  `z.coerce.number().default(...)` query params so the FE filter bar can tune
  them.

### FE donut + the min-reviews Select filter
- Star distribution → `ReportChart kind='donut'` with
  `data: {label,value}[]` (label e.g. `"5★"`) + `ariaLabel`. The donut renders
  as an `<svg role="img" aria-label=...>` — Playwright targets it via
  `getByRole('img', { name: /star distribution/i })`.
- Extra DataTable filter (min-reviews threshold) goes as a `<Select>` CHILD of
  `<ReportFilters period={...}>` (ReportFilters renders children in a slot next
  to PeriodSelect). `Select` (webui) takes `label`, `value`, `onValueChange`,
  `size`; options are `<SelectItem value=...>`.
- Index the threshold-label map defensively: declare
  `const MAP: Record<string,string> = MIN_REVIEWS_LABELS` and
  `MAP[value] ?? value` so a raw URL `minReviews` string can't trip TS7053.
- Derive BOTH a Row and a Summary type from the hooks (bracketed-path `.d.ts`
  resolution): `type Summary = NonNullable<ReturnType<typeof
  useGetRatingsSummaryQuery>['data']>; type StarBucket =
  Summary['starDistribution'][number];`.

### Process gotcha — exact component name matters when wiring is pre-built
- A prior partial left the screen as `RatingsQualityReport`, but `page.tsx` and
  the spec must use the name the wiring expects (`RatingsReport`). When a
  previous run left partials under a different component name, CREATE the
  correctly-named folder and DELETE the stale one (R5 one-component-per-file) —
  don't leave both. Only `store.ts` hook names + the endpoint builder name are
  the hard contract; the component name is yours but must match `page.tsx`.

## Proposed Skill Content

Fold a "ratings / reviews & rate KPIs" section into the `admin-reports` skill:
1. Review schema reality: stars-only (no chips), bidirectional (filter
   `subject.is.role==='worker'`), free-Int stars (clamp 1..5, zero-fill),
   Dispute→Bid.workerUserId indirect attribution, `{ is: }` relation-filter form.
2. Windowed (ratings on Review.createdAt) vs lifetime (disputeRate = disputes /
   completed jobs) — document the split in the DTO; `rate()` guard + raw basis.
3. In-memory HAVING: groupBy → filter(min/max) → second trip for labels →
   sort+slice; tunable thresholds as coerced defaulted query params.
4. FE: donut from {label,value}[] (svg role=img, aria-label = Playwright hook),
   extra `<Select>` filter as ReportFilters child, defensive Record<string,_>
   label map, hook-derived Summary + Row types.
5. Process: match the component name `page.tsx` imports; delete stale
   differently-named partials (R5).
