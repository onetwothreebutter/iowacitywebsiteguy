// Live test: submits the real form on the deployed site, which sends a real
// email to eric@iowacitywebsiteguy.com. Run with:
//   LIVE_URL=https://iowacitywebsiteguy.com npm run test:live
const { test, expect } = require('@playwright/test');

test('live form delivers through FormSubmit', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Your name').fill('Automated test');
  await page.getByLabel('Phone or email').fill('test@example.com');
  await page.getByLabel('What does your website need?').fill(`Automated live test of the contact form, ${new Date().toISOString()}. You can delete this email.`);
  await page.getByRole('button', { name: 'Ask for my free mockup' }).click();

  await page.waitForURL((url) => url.pathname === '/thanks.html' || url.hostname.endsWith('formsubmit.co'), { timeout: 30000 });
  await page.waitForLoadState('load');

  if (/formsubmit\.co/.test(page.url())) {
    const text = (await page.locator('body').innerText()).replace(/\s+/g, ' ').slice(0, 400);
    if (/activat/i.test(text)) {
      throw new Error('FormSubmit needs activation: click the "Activate Form" link it emailed to eric@iowacitywebsiteguy.com, then run this again.');
    }
    throw new Error(`Stopped on a FormSubmit page instead of the thanks page: ${text}`);
  }
  await expect(page).toHaveURL(/\/thanks\.html$/);
  await expect(page.getByRole('heading', { name: 'Thanks, got it.' })).toBeVisible();
});
