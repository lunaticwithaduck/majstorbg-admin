import { expect, test } from '@playwright/test';

// Smoke: every wave-1 + wave-2 report route must mount its screen body (an <h1>)
// inside the admin shell with NO uncaught client runtime error. The backend is
// not running during this smoke, so data lands in loading/error/empty state —
// that is expected; we are validating client render, not data.
const REPORT_ROUTES = [
  '/en/reports/users',
  '/en/reports/jobs-funnel',
  '/en/reports/jobs-funnel/breakdown',
  '/en/reports/disputes',
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

for (const route of REPORT_ROUTES) {
  test(`renders without runtime error: ${route}`, async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto(route, { waitUntil: 'domcontentloaded' });

    // The shell must be present, and the screen body must render its heading.
    await expect(page.getByText('MajstorBG', { exact: false }).first()).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 45_000 });

    // No Next dev runtime-error overlay, no uncaught client exception.
    await expect(page.locator('text=Unhandled Runtime Error')).toHaveCount(0);
    expect(pageErrors, `uncaught page errors on ${route}`).toEqual([]);
  });
}
