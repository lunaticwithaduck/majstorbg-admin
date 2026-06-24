import { test } from '@playwright/test';

// Diagnostic (non-asserting): load every report against REAL stage data and
// report render crashes / failed requests / console errors. Logs one
// `DIAG <json>` line per route. Run: npx playwright test e2e/reports-diagnose.spec.ts --project=chromium --reporter=line
const ROUTES = [
  '/en/reports/users',
  '/en/reports/jobs-funnel',
  '/en/reports/jobs-funnel/breakdown',
  '/en/reports/disputes',
  '/en/reports/disputes/disp_seed_resolved',
  '/en/reports/invoices',
  '/en/reports/invoices/list',
  '/en/reports/liquidity',
  '/en/reports/match-speed',
  '/en/reports/cancellations',
  '/en/reports/bid-outcomes',
  '/en/reports/worker-supply',
  '/en/reports/worker-leaderboard',
  '/en/reports/profile-completeness',
  '/en/reports/registrations',
  '/en/reports/engagement',
  '/en/reports/ratings',
  '/en/reports/categories',
  '/en/reports/portfolio',
];

for (const route of ROUTES) {
  test(`diag ${route}`, async ({ page }) => {
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];
    const failedApi: string[] = [];
    page.on('pageerror', (e) => pageErrors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200));
    });
    page.on('response', (r) => {
      const u = r.url();
      if (u.includes('/admin/') && r.status() >= 400) {
        failedApi.push(`${r.status()} ${u.replace(/^https?:\/\/[^/]+/, '').slice(0, 80)}`);
      }
    });

    await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 60_000 }).catch(() => {});
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
    await page.waitForTimeout(1200);

    // Heuristic: did the Next/React error overlay or a thrown error appear?
    const overlay = await page.locator('text=/Unhandled Runtime Error|Application error|client-side exception/i').count();

    // eslint-disable-next-line no-console
    console.log(
      `DIAG ${JSON.stringify({
        route,
        ok: pageErrors.length === 0 && failedApi.length === 0 && overlay === 0,
        pageErrors: pageErrors.slice(0, 2),
        failedApi: [...new Set(failedApi)].slice(0, 4),
        overlay,
        consoleErrors: [...new Set(consoleErrors)].slice(0, 3),
      })}`,
    );
  });
}
