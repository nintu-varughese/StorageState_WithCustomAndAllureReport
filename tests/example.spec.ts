import { test, expect } from '@playwright/test';
import HomePage from '../pages/homePage';

const userNumbers = [1, 2, 3];

for (const num of userNumbers) {
  const emailKey = `user${num}`;
  const storageStatePath = `storageState/user${num}.json`;

  test.describe(`Verify persisted login session for User ${num} using stored storageState`, () => {
    // Use the specific user's previously saved session
    test.use({ storageState: storageStatePath });

    test(`Verify that the email displayed in the Edit Account page matches the login email for User ${num} (first tab)`, async ({ page }) => {
      const home = new HomePage(page);
      const expectedEmail = process.env[emailKey]!;

      // Step 1: Navigate to home page (user is already logged in via storageState)
      await home.gotoHome();

      // Step 2: Navigate to Edit Account page and fetch displayed email
      // Step 3: Verify that the email shown in Edit Account matches the expected login email
      // Purpose: Ensures that the persisted session reflects the correct authenticated user's email
      await home.verifyStorageStateEmail(expectedEmail);
    });

    test(`Verify that the email displayed in the Edit Account page matches the login email for User ${num} (second tab)`, async ({ context }) => {
      const newPage = await context.newPage();
      const home2 = new HomePage(newPage);
      const expectedEmail = process.env[emailKey]!;

      // Step 1: Open a new tab using the same browser context (logged in via storageState)
      // Step 2: Navigate to Edit Account page
      // Step 3: Verify that the email matches the expected login email
      // Purpose: Ensures session persistence is consistent across multiple tabs for the same user
      await home2.verifyStorageStateEmail(expectedEmail);
    });

     if (num === 3) {
      test(`Verify that the email in Edit Account for User 3 matches User 2 email (expected to fail)`, async ({ page }) => {
        const home = new HomePage(page);
        const expectedEmail = process.env['user2']!; // intentionally wrong email

        await home.gotoHome();
        await home.verifyStorageStateEmail(expectedEmail); // This will fail
      });
    }
  });
}
