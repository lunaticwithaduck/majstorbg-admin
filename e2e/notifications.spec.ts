import { expect, test } from '@playwright/test';

test('/notifications renders the inspector shell (graceful state until BE endpoint lands)', async ({
  page,
}) => {
  const response = await page.goto('/en/notifications');
  expect(response?.status()).toBe(200);

  await expect(page.getByRole('heading', { name: /Notifications/i }).first()).toBeVisible();

  // The "Send test notification" trigger lives in the table toolbar.
  await expect(
    page.getByRole('button', { name: /Send test notification/i }),
  ).toBeVisible();

  // BE doesn't ship /admin/notifications yet — accept ANY of: loading spinner
  // stuck, error message, or rows. The MUST-NOT is a runtime exception.
  const loading = page.getByText(/Loading/i).first();
  const errorState = page.getByText(/Failed|Could?n['’]?t/i).first();
  const tableRow = page.getByRole('row').nth(1);
  await expect(loading.or(errorState).or(tableRow)).toBeVisible({ timeout: 15_000 });
});
