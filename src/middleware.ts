import { routing } from '@lunaticwithaduck/i18n/runtime/routing';
import createIntlMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';

const intlMiddleware = createIntlMiddleware(routing);

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  // Behind a reverse proxy (Railway, Cloud Run, etc.) Next.js / next-intl
  // builds absolute redirect URLs using the container's internal listening
  // port (e.g. https://example.com:8080/en) instead of the public 443. The
  // browser then follows the redirect to a port that isn't externally open
  // and times out. Strip the port from the Location header here.
  const location = response.headers.get('location');
  if (location) {
    try {
      const url = new URL(location);
      if (url.port) {
        url.port = '';
        response.headers.set('location', url.toString());
      }
    } catch {
      // Relative Location header — no host/port to strip.
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
