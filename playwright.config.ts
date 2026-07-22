import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";
import { BASE_URL } from "./e2e/helpers/base-url";

// A dedicated port (not 3000) so this never collides with a dev server
// already running for manual testing. Local-only for now, per AGENTS.md
// §1.7 decision — see PROGRESS.md Phase 1 Task 4 log entry: needs a live
// dev server + live Neon DB, not yet wired into CI.
const PORT = new URL(BASE_URL).port;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  // Generous timeouts: this runs against `next dev` (Turbopack compiles each
  // route on first hit, not a production build), not because the app itself
  // is slow.
  timeout: 90_000,
  expect: { timeout: 20_000 },
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: `npx next dev -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      ...process.env,
      PORT: String(PORT),
      NEXT_PUBLIC_APP_URL: BASE_URL,
      BETTER_AUTH_URL: BASE_URL,
      PLAYWRIGHT_TEST: "1",
    },
  },
});
