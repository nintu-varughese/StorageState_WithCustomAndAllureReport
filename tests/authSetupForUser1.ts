import { expect, test as setup } from '@playwright/test';
import HomePage from '../pages/homePage';

// Defines the path where the browser session will be saved for User 1
const storageStatePath = 'storageState/user1.json';

setup('Login as User 1 and save browser session for future tests', async ({ page }) => {
    const homePage = new HomePage(page);

    // Step 1: Navigate to the home page
    // Purpose: Ensure the browser opens the application and the home page loads correctly
    await homePage.gotoHome();

    // Step 2: Perform login using credentials for User 1 from environment variables
    // Purpose: Authenticate the user and validate that login credentials work correctly
    await homePage.userLogin(`${process.env.user1}`, `${process.env.user1_pass}`);

    // Step 3: Verify that login was successful by checking for the presence of a login validation element
    // Purpose: Confirms that the user is logged in and the session is active
    await expect(homePage.loginValidator).toBeVisible();

    // Step 4: Save the current browser context (storage state) to a JSON file
    // Purpose: Persist the authenticated session so that subsequent tests can reuse this session without logging in again
    await page.context().storageState({ path: storageStatePath });
});
