# Backend Handoff — admin operational/trust/money layer

Consolidated list of every `// BACKEND TODO` route the admin frontend was built
against. The FE leads the contract: each route below has a wired RTK Query
endpoint + UI in `majstorbg-admin`, shipping non-functional until the BE
implements the matching route in `majstorbg-backend`.

- **Source PRs:** `lunaticwithaduck/majstorbg-admin` #10–#20 (foundation + modules 1,3,4,5,6,7,8,9,10) + #19 (traffic).
- **Proxy:** the FE calls `/api/be/[...path]` (same-origin BFF) → backend `/admin/*`.
- **Both clones are local:** `~/majstorbg-admin`, `~/majstorbg-backend`. Grep the FE for `// BACKEND TODO:` to jump to each call site.

---

## Cross-cutting (do these first)

**Audit (every state-changing mutation).** The FE does NOT write audit rows — that
would be forgeable and blind to before/after. The BE must append an `admin-audit`
entry on every `/admin/*` mutation: `{ actorId (from session), action,
targetType, targetId, before, after, reason, createdAt }`. The FE passes `reason`
in the payloads where the spec requires it. This audit table is what
`GET /admin/audit` (Module 9) reads.

**RBAC.** Add `admin` to the BE `UserRole` (currently `worker | client`) with
sub-roles `superadmin | finance | support | moderator | viewer`. Expose the
**current admin's role** to the client (a session claim or `GET /admin/me`) so the
FE can graduate `can(permission, role)` and retire the interim `canOperate` gate.
Role→permission matrix is already defined FE-side in `src/auth/permissions.ts`.

**Money.** New money endpoints use integer **cents** (`amountCents`,
`refundableCents`, `heldCents`, …). The legacy invoices `amount` field is major
units — the FE converts. VAT/commission rates are percent floats (0–100).

**Auth/session.** `src/auth/can.ts` is still a stub (auth deferred). Staff-gating
currently relies on the deployment + the `canOperate` env gate; wire the real
session + `admin` role when ready.

---

## Module 1 — Disputes (PR #11)

- `PATCH /admin/disputes/:id/assign { adminId? }` — omit `adminId` ⇒ self-assign from session; status → `assigned`; audit.
- `POST  /admin/disputes/:id/notes { body, internal }` — author from session; returns the dispute with the appended note; audit.
- `POST  /admin/disputes/:id/resolve { outcome: 'refund_client'|'release_worker'|'partial'|'no_fault', amountCents?, reason, notifyParties }` — **MUST trigger the matching money action** (escrow release / refund); audit with before/after.
- `POST  /admin/disputes/:id/reopen { reason }` — status → `reopened`; audit.
- `GET   /admin/disputes/:id` — enrich with `assignedToId/Name`, `notes[]`, `chat[]`, `photos[]`, `payment{ heldCents, releasedCents?, refundedCents?, status }`.
- Extend the dispute status enum with `assigned` + `reopened`.

## Module 3 — Moderation (PR #12)

- `GET  /admin/moderation/reports?type=user|content|review&status=&page=&pageSize=` — `content` groups photo + chat.
- `GET  /admin/moderation/reports/:id`.
- `POST /admin/moderation/reports/:id/action { action: 'dismiss'|'remove_content'|'warn'|'suspend'|'ban', reason, durationDays? }` — `suspend`/`ban` also update user state; `remove_content` hides the entity; audit.
- `GET  /admin/users/:id/moderation → { status: 'active'|'suspended'|'banned', until?, reason? }`.
- `POST /admin/users/:id/suspend { reason, until? }` — audit.
- `POST /admin/users/:id/ban { reason }` — audit.
- `POST /admin/users/:id/reinstate { reason }` — audit.

## Module 4 — Finance (PR #13)

- `GET  /admin/finance/transactions?type=&status=&userId=&jobId=&page=&pageSize=` — rows include `refundableCents`, `jobCompleted`, `flagged`.
- `GET  /admin/finance/transactions/:id`.
- `POST /admin/finance/transactions/:id/refund { amountCents, reason }` — capped at refundable; audit. (Reconciles with dispute outcomes.)
- `POST /admin/finance/jobs/:jobId/release { reason }` — release held escrow to worker; audit.
- `GET  /admin/finance/payouts?status=pending|approved|paid|failed&page=&pageSize=`.
- `POST /admin/finance/payouts/:id/approve` — audit.
- `POST /admin/finance/payouts/:id/reject { reason }` — audit.
- `GET  /admin/finance/commission → { takeRatePct, perCategory:[{ categoryId, categoryName, takeRatePct }] }`.
- `PUT  /admin/finance/commission { takeRatePct, perCategory? }` — audit.

## Module 5 — Reviews (PR #14)

- `GET    /admin/reviews?status=visible|hidden|removed&workerId=&search=&page=&pageSize=`.
- `POST   /admin/reviews/:id/hide { reason }` — recompute the worker's rating; audit.
- `DELETE /admin/reviews/:id { reason }` — recompute rating; audit.
- `POST   /admin/reviews/ring-check { workerId } → { workerId, clusters:[{ id, signal: 'mutual'|'burst'|'reciprocal'|'velocity', riskScore, reviewCount, participants:[{ userId, name }] }] }`.

## Module 6 — Compliance / GDPR (PR #15)

- `GET  /admin/compliance/data-requests?type=export|erase&status=&page=&pageSize=` — rows include `identityVerified`, `dueAt` (SLA), `bundleUrl`.
- `GET  /admin/compliance/data-requests/:id`.
- `POST /admin/compliance/data-requests/:id/verify { verified, note? }` — records the requester identity check; audit.
- `POST /admin/compliance/data-requests/:id/export` — generates the export bundle, returns `bundleUrl`; audit.
- `POST /admin/compliance/data-requests/:id/erase { reason }` — hard erase; retain legally-required records (invoices/tax/dispute history); audit.

## Module 7 — Invoices / ДДС (VAT) (PR #18)

- `POST /admin/invoices/:id/issue` — generate/regenerate the PDF, return the row with `pdfUrl`; audit.
- `POST /admin/invoices/:id/credit-note { amountCents, reason }` — audit.
- `GET  /admin/finance/vat → { ratePct, registered, vatId? }`.
- `PUT  /admin/finance/vat { ratePct, registered, vatId? }` — audit.
- Extend `GET /admin/invoices` rows with `vatAmount` (cents) + `pdfUrl`.

## Module 8 — Growth / Campaigns (PR #16)

- `GET  /admin/campaigns?channel=&status=&page=&pageSize=` — rows include `segment`, `stats`, `scheduleAt`, `templateName`.
- `POST /admin/campaigns { name, channel: 'email'|'push', segment:{ role, city?, categoryId?, activity }, templateId, scheduleAt? }` — **email via Resend with EU-resident handling (GDPR)**; audit.
- `POST /admin/campaigns/:id/send` — audit.
- `GET  /admin/templates?channel=&page=&pageSize=` — rows include `subject`, `body`, `vars`, `transactional`.
- `PUT  /admin/templates/:id { name, channel, subject, body, vars }` — audit.

## Module 9 — Platform RBAC + Audit (PR #20)

- `GET /admin/admins → { items:[{ id, name, email, role, lastActiveAt? }] }` — staff with an admin role.
- `PUT /admin/admins/:id/role { role: 'superadmin'|'finance'|'support'|'moderator'|'viewer' }` — promote/change; creates the admin record if the user wasn't one; audit.
- `GET /admin/audit?actor=&action=&targetType=&from=&to=&page=&pageSize= → { items:[{ id, actorId, actorName, action, targetType, targetId, reason?, before?, after?, createdAt }], total, page, pageSize }`.
- (See cross-cutting: `admin` role on `UserRole` + current-role session claim.)

## Module 10 — Promotions (PR #17)

- `GET    /admin/promotions?type=voucher|referral&status=&page=&pageSize=` — rows include `discountType` (`percent`|`fixed`), `value` (percent or cents), `maxRedemptions?`, `perUserLimit?`, `validFrom?`, `validTo?`, `usageCount`, `status`.
- `GET    /admin/promotions/:id/redemptions → { items:[{ id, userId, userName, redeemedAt, orderId? }], total }`.
- `POST   /admin/promotions { code, type, discountType, value, maxRedemptions?, perUserLimit?, validFrom?, validTo? }` — audit.
- `PATCH  /admin/promotions/:id { …fields, status? }` — audit.
- `DELETE /admin/promotions/:id` — audit.

## Analytics — Traffic (PR #19, off main)

- `GET /admin/analytics/traffic?from=&to= → { visitors, uniqueVisitors, pageviews, sessions, bounceRatePct, avgDurationSec, series:[{ date, visitors, pageviews }], referrers:[{ referrer, visitors, pageviews }], pages:[{ path, pageviews, uniqueVisitors }], devices:[{ device, visitors }] }`.
- **Not just an endpoint — needs a data source:** server access logs, a pageview beacon on the consumer site, or a cookieless analytics tool (Plausible/Umami self-hosted, EU-friendly). By-country was intentionally dropped (not worth GeoIP).

---

## Notes for the BE

- **API tags (FE caching):** the FE reused existing `@lunaticwithaduck/api` tags with namespaced ids where no dedicated tag exists (`Dispute` exists; moderation/finance/reviews/promotions/compliance/admins reused `AdminUser`/`Escrow`/`Worker`/`Notification`/`Privacy`/`Journal`). If you add dedicated tags (`Moderation`, `Finance`, `Review`, `Promotion`, `Verification`, `Audit`), grep the FE for `TODO(api-tags)` to update.
- **Module 2 (Verifications/KYC) was skipped** — no FE, no routes needed yet.
- Every list endpoint is paginated `{ items, total, page, pageSize }` and filtered by the query params shown.
