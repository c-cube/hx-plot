// @ts-check
const { test, expect } = require('/usr/lib/node_modules/@playwright/test');

// All heavy lifting is in demo/test.html, which runs a self-contained
// in-browser test suite and logs TEST_RESULTS to the console.
// This file just drives that page and asserts the outcome.

test('in-browser test suite passes', async ({ page }) => {
  const resultPromise = page.waitForEvent('console', msg =>
    msg.text().startsWith('TEST_RESULTS'),
  );

  await page.goto('/demo/test.html');

  const msg = await resultPromise;
  const { pass, fail } = JSON.parse(msg.text().replace('TEST_RESULTS ', ''));

  // Surface individual failures via the page's #results element.
  if (fail > 0) {
    const failures = await page.locator('.fail').allInnerTexts();
    console.error('Failed tests:\n' + failures.join('\n'));
  }

  expect(fail, `${fail} test(s) failed`).toBe(0);
  expect(pass).toBeGreaterThan(0);
});
