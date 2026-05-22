import { expect, test } from '@playwright/test';

test('/localisations renders the catalogue browser with at least one row', async ({ page }) => {
  const response = await page.goto('/en/localisations');
  expect(response?.status()).toBe(200);

  await expect(page.getByRole('heading', { name: /Localisations/i })).toBeVisible();

  // The i18n package ships many keys — at least one data row should render.
  const firstRow = page.getByRole('row').nth(1);
  await expect(firstRow).toBeVisible({ timeout: 15_000 });
});
