const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./"
});

const customJestConfig = {
  setupFilesAfterEnv: ["@testing-library/jest-dom/extend-expect", "@testing-library/react", "<rootDir>/jest.setup.ts"],
  moduleDirectories: ["node_modules", "<rootDir>/"],
  testEnvironment: "jest-environment-jsdom",
  testMatch: ["**/__tests__/**/*.[jt]s?(x)"],
  collectCoverage: true,
  collectCoverageFrom: ["components/**/*.{js,jsx,ts,tsx}", "pages/**/*.{js,jsx,ts,tsx}"]
};

module.exports = createJestConfig(customJestConfig);
