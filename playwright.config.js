const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests',

    use: {
        baseURL: 'http://localhost:3000',
        headless: false,
        screenshot: 'only-on-failure',
        video: 'retain-on-failure'
    },

    reporter: 'html'
});