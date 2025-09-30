import { test, expect } from '@playwright/test';
import HomePage from '../pages/homePage';

// Defines an array of users to loop through
const userNumbers = [1, 2, 3];

for (const num of userNumbers) {
  const emailKey = `user${num}`; 
  const storageStatePath = `storageState/user${num}.json`;

  test.describe(`Storage State for ${emailKey}`, () => {
    //Uses a pre-saved login session to skip manual login.
    test.use({ storageState: storageStatePath });

    test(`Test Case ID:${num}-Verify ${emailKey} is logged in and storage state is working`, async ({ page, context }) => {
      const home = new HomePage(page);
      const expectedEmail = process.env[emailKey]!;

      // Verify in first tab
      await home.verifyStorageStateEmail(expectedEmail);

      // Open second tab in same context and verify storage state
      const newPage = await context.newPage();
      const home2 = new HomePage(newPage);
      await home2.verifyStorageStateEmail(expectedEmail);
    });
  });
}
