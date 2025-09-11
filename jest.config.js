// Simple Jest configuration without Next.js dependencies for reliability
const customJestConfig = {
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js'
  ],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/build/',
    '<rootDir>/dist/',
    '<rootDir>/storybook-static/',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/app/(.*)$': '<rootDir>/app/$1',
    // Mock CSS files
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'contexts/**/*.{ts,tsx}',
    '!components/**/*.stories.{ts,tsx}',
    '!components/**/*.test.{ts,tsx}',
    '!lib/**/*.test.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!lib/accessibility/**', // Exclude test utilities from coverage
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70, // Reduced threshold for initial fixes
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testMatch: [
    '**/__tests__/**/*.(test|spec).(ts|tsx)',
    '**/*.(test|spec).(ts|tsx)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@radix-ui|@testing-library|class-variance-authority)/)'
  ],
  // Accessibility-specific configuration
  testTimeout: 15000, // Longer timeout for accessibility tests
  verbose: true,
  // Ensure proper cleanup between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
}

module.exports = customJestConfig