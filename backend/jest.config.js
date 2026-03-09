module.exports = {
  testEnvironment: "node",
  testTimeout: 30000,
  testPathIgnorePatterns: ["/node_modules/"],
  coveragePathIgnorePatterns: ["/node_modules/"],
  detectOpenHandles: true,
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  maxWorkers: 1,
  testMatch: ["**/tests/**/*.test.js"]
};