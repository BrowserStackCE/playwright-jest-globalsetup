# jest-playwright-browserstack

This sample shows how to run [Jest](https://jestjs.io/) + [Playwright](https://playwright.dev/) tests with Global Setup on BrowserStack using the [BrowserStack Node SDK](https://www.npmjs.com/package/browserstack-node-sdk). The SDK reads `browserstack.yml`, fans your tests out across the platforms listed there, starts and stops. If the test requires to capture a particular state from a local run like saving the logged in session and reuse the same session on BrowserStack devices then the globalsetup is required. This repo highlights how to use the globalsetup process to preserve the logged in session and inject it to the BrowserStack Automate sessions.

# Global setup

* In the globalsetup.js file, the session state is captured and stored in a file

    ```
    
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

    ```

* The globalsetup file is injected to the session through jest's configuration

  ```
      module.exports = {
        rootDir: '.',
        testMatch: ['**/tests/bstack_sample*.test.js'],
        globalSetup: './globalsetup.js',
        globalTeardown: './global-teardown.js',
        setupFilesAfterEnv: ['./browserSessionSetup.js'],
        testTimeout: 90 * 1000,
        verbose: true,
      };

  ```

* Inject the session storage data through the beforeAll hook [configured in the ./browserSessionSetup.js]

  ```
      if (fs.existsSync(STORAGE_STATE_PATH)) {
        contextOptions.storageState = STORAGE_STATE_PATH;
        console.log(`browserSessionSetup: using storageState from ${STORAGE_STATE_PATH}`);
      }

      global.context = await global.browser.newContext(contextOptions);

  ```
* Configure the setupFilesAfterEnv to include the browserSessionSetup.js file so that the hooks are triggered before every test file

![BrowserStack Logo](https://d98b8t1nnulk5.cloudfront.net/production/images/layout/logo-header.png?1469004780)

## Prerequisites

* [Node.js](https://nodejs.org/) 18, 20, or 22 LTS, and npm (verified on Node 20)
* A BrowserStack account -- grab your [Username and Access Key](https://www.browserstack.com/accounts/settings)

## Setup

* Clone the repo
* Install dependencies:

  ```sh
  npm install
  ```

* Add your credentials to `browserstack.yml` (replace `YOUR_USERNAME` / `YOUR_ACCESS_KEY`), or remove those two lines and export them as environment variables instead:

  ```sh
  export BROWSERSTACK_USERNAME=<browserstack-username>
  export BROWSERSTACK_ACCESS_KEY=<browserstack-access-key>
  ```

## Run Sample Test

Runs the public [bstackdemo.com](https://bstackdemo.com/) add-to-cart scenario across every platform in `browserstack.yml`:

```sh
npm run sample-test
```
