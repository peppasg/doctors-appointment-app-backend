/**@type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/tests'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  setupFiles: ['<rootDir>/src/tests/jest.env.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/testSetup.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/server.ts'],
  transform: {'^.+\\.tsx?$': 'ts-jest'},
  coveragePathIgnorePatterns: ['/node_modules/'],
  collectCoverage: true,
};
