// End-to-end tests for the contact form. FormSubmit is mocked, so these
// tests never send a real email. See live.spec.js for the real thing.
const { test, expect } = require('@playwright/test');

const ENDPOINT = 'https://formsubmit.co/eric@iowacitywebsiteguy.com';

async function mockFormSubmit(page) {
  const sent = [];
  await page.route('https://formsubmit.co/**', async (route) => {
    const req = route.request();
    sent.push({ url: req.url(), method: req.method(), fields: Object.fromEntries(new URLSearchParams(req.postData() || '')) });
    const next = new URLSearchParams(req.postData() || '').get('_next');
    await route.fulfill({ status: 302, headers: { location: next } });
  });
  return sent;
}

test('form is set up to send to FormSubmit', async ({ page }) => {
  await page.goto('/');
  const form = page.locator('form.contact-form');
  await expect(form).toHaveAttribute('action', ENDPOINT);
  await expect(form).toHaveAttribute('method', 'post');
  await expect(form.locator('input[name="_subject"]')).toHaveValue(/iowacitywebsiteguy\.com/);
  // The page points _next at its own thanks page, wherever it is hosted.
  await expect(form.locator('input[name="_next"]')).toHaveValue(new URL('/thanks.html', page.url()).href);
});

test('a filled-in form is sent and the visitor lands on the thanks page', async ({ page }) => {
  const sent = await mockFormSubmit(page);
  await page.goto('/');
  await page.getByLabel('Your name').fill('Test Person');
  await page.getByLabel('Business name').fill('Test Bakery');
  await page.getByLabel('Current website').fill('testbakery.com');
  await page.getByLabel('Phone or email').fill('test@example.com');
  await page.getByLabel('What does your website need?').fill('A menu page');
  await page.getByRole('button', { name: 'Ask for my free mockup' }).click();

  await expect(page).toHaveURL(/\/thanks\.html$/);
  await expect(page.getByRole('heading', { name: 'Thanks, got it.' })).toBeVisible();

  expect(sent).toHaveLength(1);
  expect(sent[0].url).toBe(ENDPOINT);
  expect(sent[0].method).toBe('POST');
  expect(sent[0].fields).toMatchObject({
    name: 'Test Person',
    business: 'Test Bakery',
    website: 'testbakery.com',
    contact: 'test@example.com',
    message: 'A menu page',
  });
});

test('website field is optional and accepts an address without https', async ({ page }) => {
  const sent = await mockFormSubmit(page);
  await page.goto('/');
  await page.getByLabel('Your name').fill('Test Person');
  await page.getByLabel('Phone or email').fill('319-555-0100');
  await page.getByRole('button', { name: 'Ask for my free mockup' }).click();
  await expect(page).toHaveURL(/\/thanks\.html$/);
  expect(sent[0].fields.website).toBe('');
});

test('required fields stop an empty form from sending', async ({ page }) => {
  const sent = await mockFormSubmit(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Ask for my free mockup' }).click();
  await page.waitForTimeout(500);
  expect(sent).toHaveLength(0);
  await expect(page).not.toHaveURL(/thanks/);
});

test('thanks page links back home and shows the phone number', async ({ page }) => {
  await page.goto('/thanks.html');
  await expect(page.getByRole('link', { name: 'Back to the homepage' })).toHaveAttribute('href', '/');
  await expect(page.getByRole('link', { name: '(319) 382-2960' })).toHaveAttribute('href', 'tel:+13193822960');
});
