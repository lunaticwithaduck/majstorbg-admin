import { expect, test } from '@playwright/test';

test('login route renders the heading and Sign in button', async ({ page }) => {
  await page.goto('/en/login');
  await expect(page.getByRole('heading', { name: /MajstorBG Admin/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Sign in/i })).toBeVisible();
});
