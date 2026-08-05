// Sample config — runs the public bstackdemo test with one-time login via globalSetup.
//
// The BrowserStack SDK (invoked via `browserstack-node-sdk jest`) reads
// browserstack.yml, fans this run out across the platforms declared there,
// and routes each Playwright `chromium.launch()` to BrowserStack.
//
// Important: do NOT set `testEnvironment` to a custom class that launches the
// browser in `setup()`. The SDK wraps the user environment and overrides
// `setup()` with an empty method (no `super.setup()`), so launches there never
// reach Automate. Browser + session wiring lives in browserSessionSetup.js
// (setupFilesAfterEnv), which runs after the SDK patches Playwright.
module.exports = {
  rootDir: '.',
  testMatch: ['**/tests/bstack_sample*.test.js'],
  globalSetup: './globalsetup.js',
  globalTeardown: './global-teardown.js',
  setupFilesAfterEnv: ['./browserSessionSetup.js'],
  testTimeout: 90 * 1000,
  verbose: true,
};
