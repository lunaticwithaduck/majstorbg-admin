---
domain: deployment
source_task: admin-deploy-fixes.md
date: 2026-05-23
keywords: ["next-intl", "middleware", "reverse proxy", "x-forwarded-host", "0.0.0.0", "redirect location", "next.js edge runtime"]
---

## Extracted Knowledge

### Behind a reverse proxy, port-strip alone is not enough — the host can also be wrong
The earlier `.sc` (`add-docker-railway-deploy`) documented the next-intl
"strip `:PORT` from the Location header" fix. In a different deploy target
(or after Railway changed how it forwards), the broken Location is not just
`https://example.com:8080/en` — it's `http://0.0.0.0/en`. Port-only stripping
leaves the host wrong, and the browser navigates to the unroutable
`0.0.0.0`, which then 404s.

The robust fix is to take the host AND proto from the proxy-forwarded
headers and rewrite the Location:
```ts
const fwdHost = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
const fwdProto = request.headers.get('x-forwarded-proto');
if (fwdHost) {
  url.host = fwdHost;
  url.port = '';
  if (fwdProto) url.protocol = `${fwdProto}:`;
  response.headers.set('location', url.toString());
}
```
This subsumes the older port-strip fix and also handles the host case.

### Do NOT rewrite Location to a relative path inside a Next.js edge middleware
The intuitive "make it bulletproof" fix is to throw away the host info entirely
and set Location to `${pathname}${search}${hash}`. The browser would resolve
it against the current origin. **But this breaks Next.js's edge-runtime
adapter** — on the next request through the same middleware, the runtime
tries `new NextURL(...)` against something derived from the previous
Location, and throws:
```
TypeError: Invalid URL
  at new URL (node:internal/url:818:25)
  at parseURL (.../0cco_next_dist_0mp5p55._.js:1015:20)
  at new NextURL (.../0cco_next_dist_0mp5p55._.js:1033:18)
  at adapter (.../0cco_next_dist_0mp5p55._.js:7901:29)
```
The visible symptom is `HTTP/1.1 500 Internal Server Error` from the dev
server (and almost certainly prod) on every middleware-handled route,
including `/`. The error stack is misleading because `adapter` runs
*before* user code on the next request — so it looks unrelated to your
middleware edit.

Conclusion: keep the Location absolute. Fix the host, not the format.

### Verifying the fix without a real proxy
Curl with `-H "x-forwarded-host: foo" -H "x-forwarded-proto: https"`
simulates what the deploy proxy injects. The dev server's `host` header is
`localhost:PORT`, so without the simulation the middleware will look like it
just strips the port — exactly what the older code did. The new host-rewrite
behavior only shows up when forwarded headers are present.

```bash
curl -sI http://localhost:3007/ \
  -H "x-forwarded-host: admin.staging.example.com" \
  -H "x-forwarded-proto: https" | grep -i location
# location: https://admin.staging.example.com/en
```

### Tailwind `max-w-3xl` on flex-column panels looks like "50% width" on wider monitors
Composed panels written with `flex flex-col gap-6 max-w-3xl` cap at 768px.
On a 1440px-wide admin column (sidebar 260px + 32px padding × 2), 768px
is ~58% of the available width — visually reads as "the cards take up only
half the page." For inner panels that are meant to fill the column,
remove the `max-w` cap from the root and let inner constraints (e.g.
`UserForm`'s own `max-w-2xl`) keep forms readable. Tailwind flex-column
children stretch full-width by default, so no extra class is needed once
the cap is gone.

## Proposed Skill Content

A `deployment` skill (already drafted in `add-docker-railway-deploy.sc`)
should be extended with:
- "When the Location header is wrong behind a proxy, the symptom is one of
  three flavors: wrong port (`:8080`), wrong host (`0.0.0.0` or
  `localhost`), or wrong proto (`http://` on an HTTPS-terminated proxy).
  The single robust fix covers all three by rewriting from
  `x-forwarded-{host,proto}`."
- "Never rewrite a Next.js edge-middleware Location to a relative path —
  the edge-runtime adapter throws `TypeError: Invalid URL` on the next
  request. Keep it absolute."
- "To repro proxy issues locally, simulate forwarded headers with curl
  before deploying."
