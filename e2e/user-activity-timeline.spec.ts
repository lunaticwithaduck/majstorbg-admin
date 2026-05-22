import { expect, test } from '@playwright/test';

test('user detail page renders the Activity timeline section', async ({ page }) => {
  await page.goto('/en/users/report');

  // The report drives the navigation — wait for it to populate. The "View"
  // link is the canonical row affordance on the table.
  const firstViewLink = page.getByRole('link', { name: /View/i }).first();
  const populated = await firstViewLink
    .waitFor({ state: 'visible', timeout: 15_000 })
    .then(() => true)
    .catch(() => false);
  test.skip(!populated, 'no users available from BE to drive activity-timeline test');

  await firstViewLink.click();
  await expect(page).toHaveURL(/\/en\/users\/[A-Za-z0-9]+$/);

  const activityHeading = page.getByRole('heading', { name: /Activity timeline/i });
  await activityHeading.scrollIntoViewIfNeeded();
  await expect(activityHeading).toBeVisible({ timeout: 15_000 });
});
