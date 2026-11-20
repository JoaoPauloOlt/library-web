/* global process */

const apiUrl = (process.env.CYPRESS_API_URL || "http://localhost:8080").replace(/\/$/, "");
const configuredBulkSize = Number.parseInt(process.env.CYPRESS_BULK_SIZE || "10", 10);

export default {
  video: false,
  screenshotOnRunFailure: true,
  defaultCommandTimeout: 10000,
  requestTimeout: 10000,
  responseTimeout: 30000,
  env: {
    adminPassword: process.env.CYPRESS_ADMIN_PASSWORD || "Admin123!",
    userPassword: process.env.CYPRESS_USER_PASSWORD || "User123!",
  },
  expose: {
    adminEmail: process.env.CYPRESS_ADMIN_EMAIL || "admin@library.com",
    userEmail: process.env.CYPRESS_USER_EMAIL || "user@library.com",
    apiUrl,
    bulkSize: Number.isNaN(configuredBulkSize) ? 10 : configuredBulkSize,
  },
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || "http://localhost:5173",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx}",
    supportFile: "cypress/support/e2e.js",
  },
};
