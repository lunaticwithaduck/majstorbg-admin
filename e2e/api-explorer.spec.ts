import { expect, test } from '@playwright/test';

test('/api-explorer renders without server-side error and shows the Swagger iframe', async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  const response = await page.goto('/en/api-explorer');
  expect(response?.status(), 'route must not 500 — server-component / client boundary mistake').toBe(
    200,
  );

  await expect(page.getByRole('heading', { name: /API Explorer/i })).toBeVisible();
  await expect(page.getByTitle(/Backend API Swagger UI/i)).toBeVisible();
  await expect(page.getByRole('link', { name: /Open in new tab/i })).toBeVisible();

  // Don't fail on every console error — some are inevitable from the embedded
  // iframe — but flag the "Functions cannot be passed across the server/client
  // boundary" regression that just bit us.
  const boundaryError = consoleErrors.find((line) =>
    /Functions cannot be passed directly to Client Components/i.test(line),
  );
  expect(boundaryError, 'no server→client function-prop violations').toBeUndefined();
});
