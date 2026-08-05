/**
 * Global setup adapted from Notified/globalsetup.ts for this sample.
 *
 * - Sets JEST_PLAYWRIGHT_CONFIG for browserSessionSetup.js
 * - Logs in once (bstackdemo.com)
 * - Persists session for browserSessionSetup.js:
 *     storageState.json  → cookies + localStorage
 *     sessionStorage.json → sessionStorage (bstackdemo auth lives here)
 *     session.json       → Notified-style cookie array
 *
 * NOTE: This file ALWAYS runs locally. Jest globalSetup is a separate Node
 * process that the BrowserStack SDK does not patch. That is intentional for
 * one-time login + session capture. Test browser launches (in
 * browserSessionSetup.js) are rewritten onto BrowserStack Automate.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const STORAGE_STATE_PATH = path.resolve(process.cwd(), 'storageState.json');
const SESSION_STORAGE_PATH = path.resolve(process.cwd(), 'sessionStorage.json');
const SESSION_PATH = path.resolve(process.cwd(), 'session.json');
const PROJECT_KEY = 'bstackdemo';

module.exports = async () => {
  process.env.JEST_PLAYWRIGHT_CONFIG =
    process.env.JEST_PLAYWRIGHT_CONFIG || 'jest-playwright.config.js';
  process.env.projectToLoad = PROJECT_KEY;

  const configPath = path.resolve(process.env.JEST_PLAYWRIGHT_CONFIG);
  const playwrightConfig = require(configPath);

  // globalSetup runs outside the BrowserStack SDK launch rewrite, so this needs a
  // local browser. Use the system Chrome channel to avoid requiring
  // `npx playwright install` for the bundled Chromium download.
  const browser = await chromium.launch({
    ...(playwrightConfig.launchOptions || {}),
    channel: 'chrome',
  });
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    ...playwrightConfig.contextOptions,
  });
  const page = await context.newPage();

  try {
    await page.goto('https://bstackdemo.com/signin');

    await page.locator('#username').click();
    await page.locator('#react-select-2-option-0-0').click(); // demouser
    await page.locator('#password').click();
    await page.locator('#react-select-3-option-0-0').click(); // testingisfun99
    await page.getByRole('button', { name: 'Log In' }).click();
    await page.getByText('Logout').waitFor({ state: 'visible' });

    // cookies + localStorage
    await context.storageState({ path: STORAGE_STATE_PATH });

    // bstackdemo keeps username/state in sessionStorage (not covered by storageState)
    const sessionStorageData = await page.evaluate(() =>
      JSON.stringify(sessionStorage)
    );
    fs.writeFileSync(SESSION_STORAGE_PATH, sessionStorageData);

    // Notified-style session.json
    const cookies = await context.cookies();
    fs.writeFileSync(
      SESSION_PATH,
      JSON.stringify([{ key: PROJECT_KEY, value: cookies }], null, 2)
    );

    console.log('Cookies captured →', JSON.stringify(cookies, null, 2));
    console.log('sessionStorage captured →', sessionStorageData);

    console.log(
      `Session created successfully → ${STORAGE_STATE_PATH}, ${SESSION_STORAGE_PATH}`
    );
  } finally {
    await browser.close();
  }
};
