import { defineConfig, devices, ReporterDescription } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config();
const reporters: ReporterDescription[] = [
  ['allure-playwright', {
    outputFolder: 'allure-results',
    detail: false,
    suiteTitle: false,
    useCucumberStepReporter: false,
    useStepsForHooks: false,
    screenshots: 'on',
    videos: 'on'
  }]
];
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: reporters,

  use: {
    trace: 'on-first-retry',       // optional, set to 'on-first-retry' if needed
    screenshot: 'on',  // disable automatic screenshots in Allure if you want cleaner steps
    video: 'on',      // disable automatic videos
  },

  projects: [
    {
      //name: 'SaveCookiesForUser1',
      testMatch: ['authSetupForUser1.ts'],
    },
    {
      //name: 'SaveCookiesForUser2',
      testMatch: ['authSetupForUser2.ts'],
      //dependencies: ['SaveCookiesForUser1'],
    },
    {
      //name: 'SaveCookiesForUser3',
      testMatch: ['authSetupForUser3.ts'],
      //dependencies: ['SaveCookiesForUser2'],
    },
    {
      //name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      //dependencies: ['SaveCookiesForUser3'],
    },
  ],
});
