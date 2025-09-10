/**
 * Environment Variable Testing Utilities
 * 
 * Provides safe, isolated environment variable mocking for tests without
 * direct process.env mutation that can cause test isolation failures.
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const { restoreEnv } = mockEnv({ NODE_ENV: 'production' });
 * // ... run tests
 * restoreEnv();
 * 
 * // With automatic cleanup
 * withEnv({ NODE_ENV: 'production' }, () => {
 *   // test code here
 * });
 * 
 * // In Jest setup
 * beforeEach(() => {
 *   restoreEnv = mockEnv({ NODE_ENV: 'test' });
 * });
 * afterEach(() => {
 *   restoreEnv();
 * });
 * ```
 */

interface EnvMockOptions {
  /** Whether to preserve existing environment variables */
  preserveExisting?: boolean;
  /** Whether to clear all existing environment variables first */
  clearExisting?: boolean;
}

/**
 * Mock environment variables for testing with proper isolation
 * 
 * @param envVars - Object containing environment variables to mock
 * @param options - Configuration options for the mock
 * @returns Cleanup function to restore original environment
 */
export function mockEnv(
  envVars: Record<string, string | undefined>,
  options: EnvMockOptions = {}
): () => void {
  const { clearExisting = false } = options;
  
  // Store original environment for restoration
  const originalEnv: Record<string, string | undefined> = {};
  const keysToDelete: string[] = [];
  
  // Handle existing environment variables
  for (const key of Object.keys(envVars)) {
    if (key in process.env) {
      originalEnv[key] = process.env[key];
    } else {
      keysToDelete.push(key);
    }
  }
  
  // If clearExisting is true, store all current env vars for restoration
  if (clearExisting) {
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) {
        originalEnv[key] = process.env[key];
      }
    }
  }
  
  // Apply mock environment variables
  if (clearExisting) {
    // Clear all environment variables first
    for (const key of Object.keys(process.env)) {
      delete (process.env as any)[key];
    }
  }
  
  // Set the mock environment variables
  for (const [key, value] of Object.entries(envVars)) {
    if (value !== undefined) {
      (process.env as any)[key] = value;
    } else {
      delete (process.env as any)[key];
    }
  }
  
  // Return cleanup function
  return function restoreEnv() {
    // Remove mocked variables that weren't in original env
    for (const key of keysToDelete) {
      delete process.env[key];
    }
    
    // Restore original environment variables
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value !== undefined) {
        (process.env as any)[key] = value;
      } else {
        delete (process.env as any)[key];
      }
    }
  };
}

/**
 * Execute a function with temporary environment variables
 * 
 * @param envVars - Environment variables to set temporarily
 * @param fn - Function to execute with the temporary environment
 * @param options - Configuration options for the environment mock
 * @returns The result of the function execution
 */
export function withEnv<T>(
  envVars: Record<string, string | undefined>,
  fn: () => T,
  options?: EnvMockOptions
): T {
  const restoreEnv = mockEnv(envVars, options);
  try {
    return fn();
  } finally {
    restoreEnv();
  }
}

/**
 * Execute an async function with temporary environment variables
 * 
 * @param envVars - Environment variables to set temporarily
 * @param fn - Async function to execute with the temporary environment
 * @param options - Configuration options for the environment mock
 * @returns Promise resolving to the result of the function execution
 */
export async function withEnvAsync<T>(
  envVars: Record<string, string | undefined>,
  fn: () => Promise<T>,
  options?: EnvMockOptions
): Promise<T> {
  const restoreEnv = mockEnv(envVars, options);
  try {
    return await fn();
  } finally {
    restoreEnv();
  }
}

/**
 * Jest helper to automatically setup and cleanup environment mocking
 * 
 * @param envVars - Environment variables to mock for all tests in the suite
 * @param options - Configuration options for the environment mock
 * @returns Object with beforeEach and afterEach functions for Jest
 */
export function jestEnvMock(
  envVars: Record<string, string | undefined>,
  options?: EnvMockOptions
): {
  beforeEach: () => void;
  afterEach: () => void;
} {
  let restoreEnv: (() => void) | null = null;
  
  return {
    beforeEach: () => {
      restoreEnv = mockEnv(envVars, options);
    },
    afterEach: () => {
      if (restoreEnv) {
        restoreEnv();
        restoreEnv = null;
      }
    }
  };
}

/**
 * Create a Jest describe block with environment variable mocking
 * 
 * @param name - Name of the test suite
 * @param envVars - Environment variables to mock for the suite
 * @param fn - Test suite function
 * @param options - Configuration options for the environment mock
 */
export function describeWithEnv(
  name: string,
  envVars: Record<string, string | undefined>,
  fn: () => void,
  options?: EnvMockOptions
): void {
  describe(name, () => {
    let restoreEnv: (() => void) | null = null;
    
    beforeAll(() => {
      restoreEnv = mockEnv(envVars, options);
    });
    
    afterAll(() => {
      if (restoreEnv) {
        restoreEnv();
        restoreEnv = null;
      }
    });
    
    fn();
  });
}

/**
 * Get the current environment type safely
 * 
 * @returns The current NODE_ENV value or 'development' as default
 */
export function getNodeEnv(): string {
  return process.env.NODE_ENV || 'development';
}

/**
 * Check if running in test environment
 * 
 * @returns True if NODE_ENV is 'test'
 */
export function isTestEnv(): boolean {
  return getNodeEnv() === 'test';
}

/**
 * Check if running in development environment
 * 
 * @returns True if NODE_ENV is 'development'
 */
export function isDevelopmentEnv(): boolean {
  return getNodeEnv() === 'development';
}

/**
 * Check if running in production environment
 * 
 * @returns True if NODE_ENV is 'production'
 */
export function isProductionEnv(): boolean {
  return getNodeEnv() === 'production';
}

/**
 * Environment-specific configuration loader
 * 
 * @param configs - Object with environment-specific configurations
 * @returns The configuration for the current environment
 */
export function getEnvConfig<T>(configs: {
  development?: T;
  test?: T;
  production?: T;
  default: T;
}): T {
  const env = getNodeEnv();
  return configs[env as keyof typeof configs] || configs.default;
}