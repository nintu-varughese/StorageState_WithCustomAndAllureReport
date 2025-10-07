import { expect, test as setup } from '@playwright/test';
import HomePage from '../pages/homePage';

//Defines the path where the browser session will be saved.
const storageStatePath = 'storageState/user3.json';

setup('Login as User 3 and save browser session for future tests', async ({ page })=>{
    const homePage = new HomePage(page);

    // Step 1: Go to home page
    await homePage.gotoHome();

    // Step 2: Login with credentials from .env
    await homePage.userLogin(`${process.env.user3}`, `${process.env.user3_pass}`);

    // Step 3: Verify login was successful
    await expect(homePage.loginValidator).toBeVisible();

     // Step 4: Save storage state to JSON
    await page.context().storageState({ path: storageStatePath });
});

 