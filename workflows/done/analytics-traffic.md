---
title: Analytics — Traffic dashboard (visitors / unique / pageviews / referrers)
created: 2026-06-26
status: done
---

## Goal
New admin section for site traffic analytics: visitors, unique visitors,
pageviews (hits), bounce rate, by-referrer, by-device and top pages, over a
selectable period. Standalone feature (not part of the kure2 ops-layer spec) —
branched off `main`.

## Steps
- [x] `admin-traffic-endpoints.ts` — getTrafficOverview (overview + series + referrers/pages/devices)
- [x] Register in `store.ts`; `routes.ts` `analytics.traffic`; new "Analytics" nav group (Traffic)
- [x] `/analytics/traffic` — PeriodSelect + 5 StatTiles (visitors / unique / pageviews / bounce / avg duration)
- [x] Traffic-over-time area chart (visitors + pageviews); By-referrer bar chart; By-device donut; Top-pages list
- [x] Reuses the composed kit (StatTileRow / ReportChart / PeriodSelect); period state in URL via useReportQuery
- [x] Verify: typecheck ✓, biome ✓, lint:conventions ✓

## BACKEND TODO (for the BE agent)
- `GET /admin/analytics/traffic?from=&to=` →
  `{ visitors, uniqueVisitors, pageviews, sessions, bounceRatePct, avgDurationSec,
     series:[{date,visitors,pageviews}], referrers:[{referrer,visitors,pageviews}],
     pages:[{path,pageviews,uniqueVisitors}], devices:[{device,visitors}] }`.
  Needs a traffic source (e.g. server access logs, a pageview beacon, or Plausible/Umami).
- By-country was intentionally dropped — not worth standing up GeoIP for one chart.

## Notes
- Read-only; reused the `WelcomeStats` API tag (never invalidated). TODO(api-tags): add a `Traffic` tag.
- Period presets (today / 7d / 30d / this-month / custom) via the existing PeriodSelect.
- Off `main` → independent of the ops-layer PR stack; mergeable on its own.

## Outcome
FE complete against the contract; non-functional until the BE traffic endpoint
(and a traffic data source) land.
