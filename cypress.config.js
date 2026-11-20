import { defineConfig } from "cypress";

export default defineConfig({
  video: false,
  screenshotOnRunFailure: true,
  defaultCommandTimeout: 10000,
  requestTimeout: 10000,
  responseTimeout: 30000,
  env: {
    adminEmail: process.env.CYPRESS_ADMIN_EMAIL || "admin@library.com",
    adminPassword: process.env.CYPRESS_ADMIN_PASSWORD || "Admin123!",
    userEmail: process.env.CYPRESS_USER_EMAIL || "user@library.com",
    userPassword: process.env.CYPRESS_USER_PASSWORD || "User123!",
  },
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || "http://localhost:5173",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx}",
    supportFile: false,
  },
});
