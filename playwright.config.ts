import { defineConfig, devices } from "@playwright/test";

// Smoke tests run against a production build, on a desktop and a mobile viewport.
// Port 3100 keeps them clear of a dev server on 3000.
const PORT = 3100;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    // CI builds in an earlier step, so it only starts the server here.
    command: process.env.CI ? `pnpm start --port ${PORT}` : `pnpm build && pnpm start --port ${PORT}`,
    url: `http://localhost:${PORT}/en`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
