import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  // Local: workers=1. Parallel workers race on Next 16 + Turbopack per-route
  // cold-compile — first hit on each route can take 10–30s, so simultaneous
  // misses time out. CI usually retries cleanly and runs on hotter caches.
  fullyParallel: false,
  workers: process.env.CI ? undefined : 1,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3001',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: {
    command: 'pnpm dev',
    // Probe a real locale-prefixed route. `/` has no route — App Router only
    // mounts `/[locale]/*`, so probing the bare root gets a 404 and Playwright
    // refuses to mark the server ready. Use a known-200 path instead.
    url: 'http://localhost:3001/en/users/report',
    // Next 16 + Turbopack cold compile easily exceeds the 60s default.
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
  },
});
