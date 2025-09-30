// import { defineConfig, devices, ReporterDescription } from '@playwright/test';
// import * as dotenv from 'dotenv';
// import path from 'path';
// dotenv.config();

// const customReporter: ReporterDescription[] = [
//   [path.join(__dirname, 'customReport.ts'), {}] // Use tuple with options
// ];

// export default defineConfig({
//   testDir: './tests' ,
//   fullyParallel: false,
//   forbidOnly: !!process.env.CI,
//   retries: process.env.CI ? 2 : 0,
//   workers: process.env.CI ? 1 : undefined,
//   reporter: customReporter, // ✅ now type-safe

//   use: {
//     trace: 'on-first-retry',
//   },

//   projects: [
//     {
//       name: 'user1Setup',
//       testMatch: ['authSetupForUser1.ts'],
//     },
//     {
//       name: 'user2Setup',
//       testMatch: ['authSetupForUser2.ts'],
//       dependencies: ['user1Setup'],
//     },
//     {
//       name: 'user3Setup',
//       testMatch: ['authSetupForUser3.ts'],
//       dependencies: ['user2Setup'],
//     },
//     {
//       name: 'chromium',
//       use: { ...devices['Desktop Chrome'] },
//       dependencies: ['user3Setup'],
//     },
//   ],
// });
import { defineConfig, devices, ReporterDescription } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config();

// Multiple reporters: custom + Allure
const reporters: ReporterDescription[] = [
  [path.join(__dirname, 'customReport.ts'), {}],        // ✅ Your custom reporter
  ['allure-playwright', { outputFolder: 'allure-results' }] // ✅ Allure reporter
];

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: reporters, // Use both reporters

  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure', // Attach screenshots automatically
    video: 'retain-on-failure',    // Attach videos on failure
  },

  projects: [
    {
      name: 'user1Setup',
      testMatch: ['authSetupForUser1.ts'],
    },
    {
      name: 'user2Setup',
      testMatch: ['authSetupForUser2.ts'],
      dependencies: ['user1Setup'],
    },
    {
      name: 'user3Setup',
      testMatch: ['authSetupForUser3.ts'],
      dependencies: ['user2Setup'],
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['user3Setup'],
    },
  ],
});
