// Browser + auth lifecycle come from browserSessionSetup.js (setupFilesAfterEnv)
// after globalsetup.js has written session artifacts. `page` / `browser` /
// `context` are injected as globals.

describe('BStackDemo cart', () => {
  test('starts already signed in from global setup', async () => {
    await page.goto('https://bstackdemo.com/');
    await page.getByText('Logout').waitFor({ state: 'visible' });
    expect(await page.getByText('Logout').isVisible()).toBe(true);
  });

  test('add the first product to the cart', async () => {
    await page.goto('https://bstackdemo.com/');

    const firstProduct = page.locator('[id="1"]');
    const productTitle = await firstProduct.locator('.shelf-item__title').first().innerText();
    await firstProduct.getByText('Add to Cart').click();

    const quantity = await page.locator('.bag__quantity').innerText();
    expect(quantity).toBe('1');

    const cartTitle = await page.locator('.shelf-item__details .title').innerText();
    expect(cartTitle).toBe(productTitle);
  });
});
