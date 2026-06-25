import { type NextRequest, NextResponse } from 'next/server';
import { serverApiBase } from '@/config/env';

/**
 * Same-origin reverse proxy → the backend.
 *
 * The admin SPA's auth + business API calls hit `/api/be/*` on THIS origin
 * instead of the backend directly, so better-auth's session cookie is set
 * first-party (scoped to the admin app's own host) AND the calls survive the
 * staging access gate: a cross-origin XHR to the gated backend host would be
 * silently blocked (it can't answer a Basic-Auth challenge). The backend is
 * unchanged: it issues its host-only cookie; forwarded through here, the
 * browser files it under the admin origin.
 *
 * Server-side fetches target the backend via `serverApiBase` — the
 * private-network address when INTERNAL_API_URL is set, so they bypass the
 * gate; the public URL otherwise.
 *
 * Ported near-verbatim from apps/web's BFF handler — keep them in sync.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PREFIX = '/api/be';
const TARGET_ORIGIN = serverApiBase;

// Never forwarded upstream: `host` (fetch sets it to the backend host), the
// body-framing headers (recomputed for the re-sent body), and `authorization`
// — the browser caches the staging gate's Basic-Auth creds and re-sends them on
// same-origin /api/be calls; they must not reach the backend (better-auth reads
// Authorization for bearer sessions).
const DROP_REQUEST_HEADERS = new Set(['host', 'connection', 'content-length', 'authorization']);
// Dropped from the response: framing + the upstream `content-encoding`, which
// is stale once undici has transparently decompressed the body we buffer.
const DROP_RESPONSE_HEADERS = new Set([
  'content-encoding',
  'content-length',
  'transfer-encoding',
  'connection',
]);
// Statuses that must not carry a response body.
const NULL_BODY_STATUS = new Set([204, 205, 304]);

async function proxy(request: NextRequest): Promise<Response> {
  const tail = request.nextUrl.pathname.slice(PREFIX.length); // keeps the leading "/"
  const target = `${TARGET_ORIGIN}${tail}${request.nextUrl.search}`;

  const headers = new Headers(request.headers);
  for (const name of DROP_REQUEST_HEADERS) headers.delete(name);

  const method = request.method.toUpperCase();
  const hasBody = method !== 'GET' && method !== 'HEAD';

  const upstream = await fetch(target, {
    method,
    headers,
    body: hasBody ? await request.arrayBuffer() : null,
    redirect: 'manual',
    cache: 'no-store',
  });

  const responseHeaders = new Headers(upstream.headers);
  for (const name of DROP_RESPONSE_HEADERS) responseHeaders.delete(name);
  // Set-Cookie must be re-emitted as discrete headers — a comma-folded join
  // corrupts cookie values (the better-auth session cookie above all).
  responseHeaders.delete('set-cookie');

  const body = NULL_BODY_STATUS.has(upstream.status) ? null : await upstream.arrayBuffer();
  const response = new NextResponse(body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
  for (const cookie of upstream.headers.getSetCookie()) {
    response.headers.append('set-cookie', cookie);
  }
  return response;
}

export {
  proxy as GET,
  proxy as POST,
  proxy as PUT,
  proxy as PATCH,
  proxy as DELETE,
  proxy as HEAD,
  proxy as OPTIONS,
};
