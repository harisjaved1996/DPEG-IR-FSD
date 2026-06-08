const { jestConfig } = require("@salesforce/sfdx-lwc-jest/config");

module.exports = {
  ...jestConfig,
  moduleNameMapper: {
    "^c/(.+)$": "<rootDir>/force-app/main/default/lwc/$1/$1"
  },
  setupFilesAfterEach: ["@sa11y/jest/dist/setup"],
  collectCoverageFrom: [
    "force-app/main/default/lwc/**/*.js",
    "!force-app/main/default/lwc/**/*.test.js",
    "!force-app/main/default/lwc/**/__tests__/**"
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
