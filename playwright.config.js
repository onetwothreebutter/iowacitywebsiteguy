const { defineConfig } = require('@playwright/test');

const live = process.env.LIVE_URL;

module.exports = defineConfig({
  testDir: 'tests',
  timeout: 60000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: live || 'http://localhost:4173',
    trace: 'off',
  },
  // The live test sends a real email, so it only runs when LIVE_URL is set.
  testIgnore: live ? [] : ['**/live.spec.js'],
  webServer: live ? undefined : {
    command: 'node tests/serve.js',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
});
