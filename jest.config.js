module.exports = {
  clearMocks: true,
  testEnvironment: 'node',
  testRegex: '(/__tests__/.*|(\\.|/)(test))\\.[jt]sx?$',
  setupFiles: ['dotenv/config'],
  setupFilesAfterEnv: ['<rootDir>/setupTests.js']
};
