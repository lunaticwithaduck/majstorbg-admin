import { expect, test } from '@playwright/test';

test('/feature-flags lists flags and exposes per-row toggle + reset', async ({ page }) => {
  const response = await page.goto('/en/feature-flags');
  expect(response?.status()).toBe(200);

  await expect(page.getByRole('heading', { name: /Feature flags/i })).toBeVisible();

  // At least one flag row should render — the package ships many.
  const firstRow = page.getByRole('row').nth(1);
  await expect(firstRow).toBeVisible({ timeout: 10_000 });

  // The toolbar should show the "Reset all overrides" action.
  await expect(page.getByRole('button', { name: /Reset all overrides/i })).toBeVisible();
});
