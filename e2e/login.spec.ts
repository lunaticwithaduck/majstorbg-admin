import { expect, test } from '@playwright/test';

test('login route renders the placeholder heading and Log in button', async ({ page }) => {
  await page.goto('/en/login');
  await expect(page.getByRole('heading', { name: /Log in/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Log in/i })).toBeVisible();
});
