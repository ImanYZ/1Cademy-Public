const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./"
});

function makeModuleNameMapper(srcPath, tsconfigPath) {
  // Get paths from tsconfig
  const { paths } = require(tsconfigPath).compilerOptions;

  const aliases = {};

  // Iterate over paths and convert them into moduleNameMapper format
  Object.keys(paths).forEach(item => {
    const key = item.replace("/*", "/(.*)");
    const path = paths[item][0].replace("/*", "/$1");
    aliases[key] = srcPath + "/" + path;
  });
  return aliases;
}

const TS_CONFIG_PATH = "./tsconfig.json";
const SRC_PATH = "<rootDir>";

const customJestConfig = {
  roots: [SRC_PATH],
  setupFilesAfterEnv: ["@testing-library/jest-dom/extend-expect", "@testing-library/react", "<rootDir>/jest.setup.ts"],
  moduleDirectories: ["node_modules"],
  testEnvironment: "jest-environment-jsdom",
  testMatch: ["**/__tests__/**/*.[jt]s?(x)"],
  collectCoverage: true,
  collectCoverageFrom: ["components/**/*.{js,jsx,ts,tsx}", "pages/**/*.{js,jsx,ts,tsx}"],
  moduleNameMapper: makeModuleNameMapper(SRC_PATH, TS_CONFIG_PATH)
};

module.exports = createJestConfig(customJestConfig);
