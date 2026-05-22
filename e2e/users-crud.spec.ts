import { expect, test } from '@playwright/test';

test('/users/new renders the create form', async ({ page }) => {
  const response = await page.goto('/en/users/new');
  expect(response?.status()).toBe(200);

  await expect(page.getByRole('heading').first()).toBeVisible();

  // Form should expose at least an email field — the canonical required input
  // for the create user flow.
  await expect(page.getByLabel(/email/i).first()).toBeVisible({ timeout: 10_000 });
});

test('user report → detail → edit flow renders the prefilled form', async ({ page }) => {
  await page.goto('/en/users/report');

  // Wait for the list to populate. isVisible() is a snapshot — we need to wait.
  const firstViewLink = page.getByRole('link', { name: /View/i }).first();
  const populated = await firstViewLink
    .waitFor({ state: 'visible', timeout: 15_000 })
    .then(() => true)
    .catch(() => false);
  test.skip(!populated, 'no users available from BE to drive edit-flow test');

  await firstViewLink.click();
  await expect(page).toHaveURL(/\/en\/users\/[A-Za-z0-9]+$/);

  await page.getByRole('link', { name: /Edit/i }).click();
  await expect(page).toHaveURL(/\/en\/users\/[A-Za-z0-9]+\/edit$/);
  await expect(page.getByLabel(/email/i).first()).toBeVisible({ timeout: 10_000 });
});
