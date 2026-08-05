/**
 * Runs as setupFilesAfterEnv — AFTER the BrowserStack SDK's setupFiles have
 * patched `chromium.launch` for Automate.
 *
 * Do NOT launch the browser from a custom Jest environment `setup()`.
 * browserstack-node-sdk wraps the user environment and overrides `setup()`
 * with an empty method that never calls `super.setup()`, so launches there
 * either never run (when wrapped) or stay local (when the leaf env bypasses
 * the SDK wrapper).
 */
const fs = require('fs');
const path = require('path');

const STORAGE_STATE_PATH = path.resolve(process.cwd(), 'storageState.json');
const SESSION_STORAGE_PATH = path.resolve(process.cwd(), 'sessionStorage.json');

const playwrightConfigPath =
  process.env.JEST_PLAYWRIGHT_CONFIG || './jest-playwright.config.js';
const playwrightConfig = require(path.resolve(playwrightConfigPath));

beforeAll(async () => {
  // Prefer the same package the SDK patches in test.setup.js.
  const { chromium } = require('playwright');

  const launchSrc = chromium.launch.toString();
  const looksPatched = !launchSrc.includes('userDataDir');
  console.log(
    'browserSessionSetup: jestConfig=',
    !!global.jestConfig,
    '__platformCaps=',
    !!(global.__platformCaps && Object.keys(global.__platformCaps).length),
    'launchPatched=',
    looksPatched
  );

  const launchOptions = { ...(playwrightConfig.launchOptions || {}) };
  // channel/executablePath force a local binary and bypass the SDK connect rewrite.
  delete launchOptions.channel;
  delete launchOptions.executablePath;

  global.browser = await chromium.launch(launchOptions);

  const contextOptions = {
    ignoreHTTPSErrors: true,
    ...playwrightConfig.contextOptions,
  };
  if (fs.existsSync(STORAGE_STATE_PATH)) {
    contextOptions.storageState = STORAGE_STATE_PATH;
    console.log(`browserSessionSetup: using storageState from ${STORAGE_STATE_PATH}`);
  }

  global.context = await global.browser.newContext(contextOptions);

  if (fs.existsSync(SESSION_STORAGE_PATH)) {
    const storage = JSON.parse(fs.readFileSync(SESSION_STORAGE_PATH, 'utf8'));
    await global.context.addInitScript((data) => {
      for (const [key, value] of Object.entries(data)) {
        window.sessionStorage.setItem(key, value);
      }
    }, storage);
    console.log(
      `browserSessionSetup: reinjecting sessionStorage keys: ${Object.keys(storage).join(', ')}`
    );
  }

  global.page = await global.context.newPage();
}, 120000);

afterAll(async () => {
  try {
    await global.page?.close().catch(() => {});
    await global.context?.close().catch(() => {});
    await global.browser?.close().catch(() => {});
  } finally {
    global.page = undefined;
    global.browser = undefined;
    global.context = undefined;
  }
});
