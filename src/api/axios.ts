import axios from 'axios';
import { serverApiBase } from '@/config/env';

export const axiosClient = axios.create({
  // Browser → same-origin `/api/be` proxy (first-party session cookie + survives
  // the staging access gate). Server-side → the backend directly via
  // `serverApiBase` (private-network address bypasses the gate).
  baseURL: typeof window === 'undefined' ? serverApiBase : '/api/be',
  withCredentials: true,
  timeout: 15_000,
});

// The admin report endpoints validate `from`/`to` as ISO datetimes (zod
// `.datetime()`), but `PeriodSelect` emits date-only `yyyy-mm-dd` (its custom
// range uses native `<input type="date">`, which only speaks date-only). Without
// this, every report that sends a date window gets a 400 "Validation failed".
// Promote date-only `from`/`to` to inclusive day bounds at the request boundary:
// `from` → start-of-day, `to` → end-of-day (UTC).
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

axiosClient.interceptors.request.use((config) => {
  const params = config.params as Record<string, unknown> | undefined;
  if (!params || typeof params !== 'object') return config;
  const next = { ...params };
  if (typeof next.from === 'string' && DATE_ONLY.test(next.from)) {
    next.from = `${next.from}T00:00:00.000Z`;
  }
  if (typeof next.to === 'string' && DATE_ONLY.test(next.to)) {
    next.to = `${next.to}T23:59:59.999Z`;
  }
  config.params = next;
  return config;
});
