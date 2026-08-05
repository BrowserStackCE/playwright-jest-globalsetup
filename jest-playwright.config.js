// Launch/context options for globalsetup.js + browserSessionSetup.js.
// Read via process.env.JEST_PLAYWRIGHT_CONFIG.
module.exports = {
  launchType: 'LAUNCH',
  launchOptions: {
    args: [
      '--disable-extensions',
      '--start-maximized',
      '--allow-no-sandbox-job',
      '--allow-sandbox-debugging',
      '--disable-setuid-sandbox',
      '--ignore-certificate-errors',
      '--ignore-ssl-errors',
      '--ignore-certificate-errors-spki-list',
    ],
    ignoreDefaultArgs: ['--mute-audio'],
    headless: false,
    logLevel: 'error',
    exitOnPageError: false,
  },
  contextOptions: {
    acceptDownloads: true,
    viewport: null,
    ignoreHTTPSErrors: true,
  },
};
