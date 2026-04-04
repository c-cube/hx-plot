// @ts-check
const { defineConfig } = require('/usr/lib/node_modules/@playwright/test');

module.exports = defineConfig({
  testDir: './test',
  use: { baseURL: 'http://localhost:8000' },
  webServer: {
    command: 'python3 demo/server.py',
    url: 'http://localhost:8000/demo/demo.html',
    reuseExistingServer: true,
  },
});
