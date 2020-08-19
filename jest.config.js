module.exports = {
  clearMocks: true,
  testEnvironment: 'node',
  testRegex: '(/__tests__/.*|(\\.|/)(test))\\.[jt]sx?$',
  setupFilesAfterEnv: ['<rootDir>/setupTests.js']
};
