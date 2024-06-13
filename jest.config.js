/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFiles: ["jest-webextension-mock", "./setup.jest"],
  testMatch: ["**/*.test.ts"],
};
