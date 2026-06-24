import { expect, test } from '@playwright/test';

// Smoke test for the Ratings & quality report. The two report endpoints are
// stubbed so the render path is validated deterministically regardless of
// whether a local BE is up: summary (KPI tiles + donut) and the low-rated
// worker list (sortable table + drilldown link).
const SUMMARY = {
  avgWorkerRating: 4.21,
  reviewCount: 1280,
  starDistribution: [
    { stars: 1, count: 40 },
    { stars: 2, count: 60 },
    { stars: 3, count: 180 },
    { stars: 4, count: 420 },
    { stars: 5, count: 580 },
  ],
  disputeRate: 0.034,
  totalDisputes: 17,
  completedJobs: 500,
};

const LOW_LIST = {
  items: [
    { workerId: 'wkr_abc123', name: 'Ivan Petrov', avgRating: 2.1, reviewCount: 8, disputeCount: 3 },
    { workerId: 'wkr_def456', name: 'Maria Dimitrova', avgRating: 2.6, reviewCount: 5, disputeCount: 1 },
  ],
  total: 2,
  page: 1,
  pageSize: 25,
};

test('ratings report renders KPIs, donut, and low-rated table; view → detail navigates', async ({
  page,
}) => {
  await page.route('**/admin/reports/ratings**', async (route) => {
    await route.fulfill({ json: SUMMARY });
  });
  await page.route('**/admin/ratings/low**', async (route) => {
    await route.fulfill({ json: LOW_LIST });
  });

  await page.goto('/en/reports/ratings');

  await expect(page.getByRole('heading', { name: /Ratings & quality/i })).toBeVisible();

  // KPI tile value rendered from the summary stub.
  await expect(page.getByText('4.21', { exact: false })).toBeVisible({ timeout: 15_000 });

  // Donut renders as an SVG with the aria-label from constants.
  await expect(
    page.getByRole('img', { name: /star distribution/i }).first(),
  ).toBeVisible();

  // Low-rated worker row from the list stub.
  await expect(page.getByText('Ivan Petrov')).toBeVisible({ timeout: 15_000 });

  // Drilldown to the user detail route.
  const firstViewLink = page.getByRole('link', { name: /View/i }).first();
  await expect(firstViewLink).toBeVisible();
  await firstViewLink.click();
  await expect(page).toHaveURL(/\/en\/users\/wkr_abc123$/);
});
