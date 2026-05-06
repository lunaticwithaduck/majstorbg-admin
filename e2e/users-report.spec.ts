import { expect, test } from '@playwright/test';

test('user report renders rows from BE and view → detail navigates', async ({ page }) => {
  await page.goto('/en/users/report');
  await expect(page.getByRole('heading', { name: /User report/i })).toBeVisible();

  // Wait for the table to populate (loading state → rows).
  const firstViewLink = page.getByRole('link', { name: /View/i }).first();
  await expect(firstViewLink).toBeVisible({ timeout: 15_000 });

  await firstViewLink.click();
  await expect(page).toHaveURL(/\/en\/users\/[A-Za-z0-9]+$/);
  await expect(page.getByRole('heading').first()).toBeVisible();
});
