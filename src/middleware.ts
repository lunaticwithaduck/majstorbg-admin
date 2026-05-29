import { routing } from '@lunaticwithaduck/i18n/runtime/routing';
import createIntlMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';

const intlMiddleware = createIntlMiddleware(routing);

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  // Behind a reverse proxy (Railway, Cloud Run, etc.) Next.js / next-intl
  // builds absolute redirect URLs from `request.url`, which carries the
  // container's internal listening address (e.g. `http://0.0.0.0:8080/en`)
  // rather than the public origin. The browser then follows that absolute
  // URL and either times out (wrong port) or 404s (wrong host). Rewrite the
  // host/proto from the forwarded headers the proxy sets so the redirect
  // lands on the public origin instead. (Path-only Location breaks the
  // Next.js edge-runtime adapter, so keep it absolute.)
  const location = response.headers.get('location');
  if (location) {
    try {
      const url = new URL(location);
      const fwdHost = request.headers.get('x-forwarded-host');
      const fwdProto = request.headers.get('x-forwarded-proto');
      // `host` header carries the correct hostname:port in all environments.
      // Next.js constructs `request.url` (which next-intl uses for redirects)
      // without the port, so the Location URL needs patching in every case.
      const host = request.headers.get('host');
      let newHost: string | null = null;
      let newProto: string | null = null;
      if (fwdHost) {
        newHost = fwdHost;
        newProto = fwdProto;
      } else if (host && host !== url.host) {
        newHost = host;
      }
      if (newHost !== null) {
        const proto = newProto ? `${newProto}:` : url.protocol;
        const fixed = `${proto}//${newHost}${url.pathname}${url.search}${url.hash}`;
        response.headers.set('location', fixed);
      }
    } catch {
      // Relative Location header — already safe.
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
