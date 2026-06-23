'use client';

/**
 * URL-synced filter state for report list screens.
 *
 * Report tables keep their filters in the address bar so a view is shareable /
 * reload-safe. This hook reads the current `?key=value` params and returns a
 * setter that merges patches and writes back via `router.replace` (no history
 * spam). Writing `null` / `''` for a key removes it, keeping URLs clean.
 *
 * Setting any non-page key auto-resets `page` to 1 unless the patch explicitly
 * sets `page` — every filter change should land you on the first page.
 */

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export type ReportQueryPatch = Record<string, string | number | null | undefined>;

export type UseReportQueryResult = {
  get: (key: string) => string | null;
  getNumber: (key: string, fallback: number) => number;
  set: (patch: ReportQueryPatch) => void;
};

export function useReportQuery(pageKey = 'page'): UseReportQueryResult {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const get = useCallback((key: string) => searchParams.get(key), [searchParams]);

  const getNumber = useCallback(
    (key: string, fallback: number) => {
      const raw = searchParams.get(key);
      if (raw === null) return fallback;
      const parsed = Number.parseInt(raw, 10);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
    },
    [searchParams],
  );

  const set = useCallback(
    (patch: ReportQueryPatch) => {
      const next = new URLSearchParams(searchParams.toString());

      const touchesPage = Object.hasOwn(patch, pageKey);
      const touchesFilter = Object.keys(patch).some((key) => key !== pageKey);
      if (touchesFilter && !touchesPage) next.delete(pageKey);

      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === undefined || value === '') {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      }

      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams, pageKey],
  );

  return { get, getNumber, set };
}
