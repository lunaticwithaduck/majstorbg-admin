import { expect, test } from '@playwright/test';

test('/jobs renders the explorer shell (graceful state until BE endpoint lands)', async ({
  page,
}) => {
  const response = await page.goto('/en/jobs');
  expect(response?.status()).toBe(200);

  await expect(page.getByRole('heading', { name: /Jobs/i }).first()).toBeVisible();

  // BE doesn't ship /admin/jobs yet — accept ANY of: loading spinner stuck,
  // error message, or rows. What we MUST NOT see is a runtime exception.
  const loading = page.getByText(/Loading/i).first();
  const errorState = page.getByText(/Failed|Could?n['’]?t/i).first();
  const tableRow = page.getByRole('row').nth(1);
  await expect(loading.or(errorState).or(tableRow)).toBeVisible({ timeout: 15_000 });
});
