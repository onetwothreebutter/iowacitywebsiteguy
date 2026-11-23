# iowacitywebsiteguy.com

Static site for Iowa City Website Guy. Plain HTML, no build step.

- `index.html`, `eric.jpg`: the homepage
- `samples/coffee/`: a labeled sample site for a made-up coffee shop

## Tests

End-to-end tests use Playwright and run on GitHub Actions on every push.

```sh
npm install
npx playwright install chromium
npm test                      # contact form tests, FormSubmit mocked (no email sent)
LIVE_URL=https://iowacitywebsiteguy.com npm run test:live   # submits the real form, sends a real email
```

The live test can also be run from GitHub: Actions → E2E tests → Run workflow → tick "live".
