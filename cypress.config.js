import { defineConfig } from "cypress";

export default defineConfig({
  env: {
    mobileViewportWidthBreakpoint: 414,
    coverage: true,
    codeCoverage: {
      // url: "http://localhost:3001/__coverage__",
      exclude: "cypress/**/*.*"
    }
  },
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/tests/**/*.spec.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.ts",
    viewportHeight: 1000,
    viewportWidth: 1280,
    defaultCommandTimeout: 60000,
    requestTimeout: 20000,
    video: false,
    setupNodeEvents(on, config) {
      require("@cypress/code-coverage/task")(on, config);
      // include any other plugin code...

      // It's IMPORTANT to return the config object
      // with any changed environment variables
      return config;
    }
  }
});
