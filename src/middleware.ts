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
      const fwdHost = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
      const fwdProto = request.headers.get('x-forwarded-proto');
      if (fwdHost) {
        url.host = fwdHost;
        url.port = '';
        if (fwdProto) url.protocol = `${fwdProto}:`;
        response.headers.set('location', url.toString());
      } else if (url.port) {
        url.port = '';
        response.headers.set('location', url.toString());
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
