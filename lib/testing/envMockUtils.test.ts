import {
  mockEnv,
  withEnv,
  withEnvAsync,
  jestEnvMock,
  describeWithEnv,
  getNodeEnv,
  isTestEnv,
  isDevelopmentEnv,
  isProductionEnv,
  getEnvConfig
} from './envMockUtils';

describe('Environment Mock Utils', () => {
  let originalNodeEnv: string | undefined;

  beforeAll(() => {
    originalNodeEnv = process.env.NODE_ENV;
  });

  afterAll(() => {
    if (originalNodeEnv !== undefined) {
      (process.env as any).NODE_ENV = originalNodeEnv;
    } else {
      delete (process.env as any).NODE_ENV;
    }
  });

  describe('mockEnv', () => {
    test('should set environment variables and restore them', () => {
      const originalValue = process.env.TEST_VAR;
      
      const restoreEnv = mockEnv({ TEST_VAR: 'test-value' });
      
      expect(process.env.TEST_VAR).toBe('test-value');
      
      restoreEnv();
      
      if (originalValue !== undefined) {
        expect(process.env.TEST_VAR).toBe(originalValue);
      } else {
        expect(process.env.TEST_VAR).toBeUndefined();
      }
    });

    test('should handle undefined values by deleting variables', () => {
      // Set a test variable
      process.env.TEMP_TEST_VAR = 'initial-value';
      
      const restoreEnv = mockEnv({ TEMP_TEST_VAR: undefined });
      
      expect(process.env.TEMP_TEST_VAR).toBeUndefined();
      
      restoreEnv();
      
      expect(process.env.TEMP_TEST_VAR).toBe('initial-value');
      
      // Cleanup
      delete process.env.TEMP_TEST_VAR;
    });

    test('should preserve existing variables by default', () => {
      const originalValue = process.env.NODE_ENV;
      process.env.EXISTING_VAR = 'existing-value';
      
      const restoreEnv = mockEnv({
        NODE_ENV: 'test',
        NEW_VAR: 'new-value'
      });
      
      expect(process.env.NODE_ENV).toBe('test');
      expect(process.env.NEW_VAR).toBe('new-value');
      expect(process.env.EXISTING_VAR).toBe('existing-value');
      
      restoreEnv();
      
      expect(process.env.NODE_ENV).toBe(originalValue);
      expect(process.env.NEW_VAR).toBeUndefined();
      expect(process.env.EXISTING_VAR).toBe('existing-value');
      
      // Cleanup
      delete process.env.EXISTING_VAR;
    });
  });

  describe('withEnv', () => {
    test('should execute function with temporary environment', () => {
      const result = withEnv({ NODE_ENV: 'production' }, () => {
        expect(process.env.NODE_ENV).toBe('production');
        return 'test-result';
      });
      
      expect(result).toBe('test-result');
      expect(process.env.NODE_ENV).toBe(originalNodeEnv);
    });

    test('should handle function that throws', () => {
      expect(() => {
        withEnv({ NODE_ENV: 'production' }, () => {
          expect(process.env.NODE_ENV).toBe('production');
          throw new Error('Test error');
        });
      }).toThrow('Test error');
      
      // Environment should still be restored
      expect(process.env.NODE_ENV).toBe(originalNodeEnv);
    });
  });

  describe('withEnvAsync', () => {
    test('should execute async function with temporary environment', async () => {
      const result = await withEnvAsync({ NODE_ENV: 'production' }, async () => {
        expect(process.env.NODE_ENV).toBe('production');
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'async-result';
      });
      
      expect(result).toBe('async-result');
      expect(process.env.NODE_ENV).toBe(originalNodeEnv);
    });

    test('should handle async function that rejects', async () => {
      await expect(
        withEnvAsync({ NODE_ENV: 'production' }, async () => {
          expect(process.env.NODE_ENV).toBe('production');
          throw new Error('Async test error');
        })
      ).rejects.toThrow('Async test error');
      
      // Environment should still be restored
      expect(process.env.NODE_ENV).toBe(originalNodeEnv);
    });
  });

  describe('jestEnvMock', () => {
    test('should provide beforeEach and afterEach functions', () => {
      const { beforeEach, afterEach } = jestEnvMock({ TEST_VAR: 'test-value' });
      
      expect(typeof beforeEach).toBe('function');
      expect(typeof afterEach).toBe('function');
      
      beforeEach();
      expect(process.env.TEST_VAR).toBe('test-value');
      
      afterEach();
      expect(process.env.TEST_VAR).toBeUndefined();
    });
  });

  describe('describeWithEnv', () => {
    test('should create a describe block with environment mocking', () => {
      // This is a meta-test - we're testing that the function exists and is callable
      expect(typeof describeWithEnv).toBe('function');
      
      // The actual functionality would be tested by running a suite created with describeWithEnv
      // which is demonstrated in the usage examples but not easily unit tested here
    });
  });

  describe('environment detection functions', () => {
    test('getNodeEnv should return current NODE_ENV or default', () => {
      const current = getNodeEnv();
      expect(typeof current).toBe('string');
      expect(current.length).toBeGreaterThan(0);
    });

    test('isTestEnv should detect test environment', () => {
      const result1 = withEnv({ NODE_ENV: 'test' }, () => isTestEnv());
      const result2 = withEnv({ NODE_ENV: 'production' }, () => isTestEnv());
      
      expect(result1).toBe(true);
      expect(result2).toBe(false);
    });

    test('isDevelopmentEnv should detect development environment', () => {
      const result1 = withEnv({ NODE_ENV: 'development' }, () => isDevelopmentEnv());
      const result2 = withEnv({ NODE_ENV: 'production' }, () => isDevelopmentEnv());
      
      expect(result1).toBe(true);
      expect(result2).toBe(false);
    });

    test('isProductionEnv should detect production environment', () => {
      const result1 = withEnv({ NODE_ENV: 'production' }, () => isProductionEnv());
      const result2 = withEnv({ NODE_ENV: 'development' }, () => isProductionEnv());
      
      expect(result1).toBe(true);
      expect(result2).toBe(false);
    });
  });

  describe('getEnvConfig', () => {
    test('should return environment-specific configuration', () => {
      const config = {
        development: { debug: true, timeout: 1000 },
        test: { debug: false, timeout: 500 },
        production: { debug: false, timeout: 5000 },
        default: { debug: true, timeout: 2000 }
      };

      const devResult = withEnv({ NODE_ENV: 'development' }, () => getEnvConfig(config));
      const testResult = withEnv({ NODE_ENV: 'test' }, () => getEnvConfig(config));
      const prodResult = withEnv({ NODE_ENV: 'production' }, () => getEnvConfig(config));
      const unknownResult = withEnv({ NODE_ENV: 'staging' }, () => getEnvConfig(config));

      expect(devResult).toEqual({ debug: true, timeout: 1000 });
      expect(testResult).toEqual({ debug: false, timeout: 500 });
      expect(prodResult).toEqual({ debug: false, timeout: 5000 });
      expect(unknownResult).toEqual({ debug: true, timeout: 2000 });
    });

    test('should use default when environment-specific config is missing', () => {
      const config = {
        production: { setting: 'prod' },
        default: { setting: 'default' }
      };

      const result = withEnv({ NODE_ENV: 'development' }, () => getEnvConfig(config));
      expect(result).toEqual({ setting: 'default' });
    });
  });
});

// Example usage in a component test
describe('Example: Component with Environment Dependencies', () => {
  // Using jestEnvMock for consistent environment across all tests in suite
  const envMock = jestEnvMock({ 
    NODE_ENV: 'test',
    NEXT_PUBLIC_API_URL: 'http://localhost:3000'
  });
  
  beforeEach(envMock.beforeEach);
  afterEach(envMock.afterEach);

  test('should have consistent environment', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.NEXT_PUBLIC_API_URL).toBe('http://localhost:3000');
  });

  test('should maintain environment between tests', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.NEXT_PUBLIC_API_URL).toBe('http://localhost:3000');
  });
});

// Example using describeWithEnv
describeWithEnv('Component in Production Environment', { NODE_ENV: 'production' }, () => {
  test('should behave differently in production', () => {
    expect(process.env.NODE_ENV).toBe('production');
    expect(isProductionEnv()).toBe(true);
    expect(isDevelopmentEnv()).toBe(false);
  });

  test('should maintain production environment across tests', () => {
    expect(process.env.NODE_ENV).toBe('production');
  });
});