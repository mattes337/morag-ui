const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/lib/accessibility/jest-setup.ts'
  ],
  testEnvironment: 'jsdom',
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
    '!components/**/*.stories.{ts,tsx}',
    '!components/**/*.test.{ts,tsx}',
    '!lib/**/*.test.{ts,tsx}',
    '!**/*.d.ts',
    '!lib/accessibility/**', // Exclude test utilities from coverage
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  // Accessibility-specific configuration
  testTimeout: 15000, // Longer timeout for accessibility tests
  verbose: true,
  // Use default Jest patterns for test discovery
  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/build/',
    '<rootDir>/dist/',
    '<rootDir>/storybook-static/',
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)