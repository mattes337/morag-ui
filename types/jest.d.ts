/// <reference types="@testing-library/jest-dom" />

// Extend Jest matchers with @testing-library/jest-dom custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toBeVisible(): R
      toBeDisabled(): R
      toBeEnabled(): R
      toHaveAttribute(attr: string, value?: any): R
      toHaveClass(...classNames: string[]): R
      toHaveStyle(css: Record<string, any> | string): R
      toHaveTextContent(text: string | RegExp): R
      toHaveValue(value: string | number | string[]): R
      toBeChecked(): R
      toBePartiallyChecked(): R
      toHaveAccessibleName(name?: string | RegExp): R
      toHaveAccessibleDescription(description?: string | RegExp): R
      toBeRequired(): R
      toBeInvalid(): R
      toBeValid(): R
    }
  }
}

// Mock localStorage and sessionStorage
interface MockStorage {
  getItem: jest.Mock<string | null, [string]>
  setItem: jest.Mock<void, [string, string]>
  removeItem: jest.Mock<void, [string]>
  clear: jest.Mock<void, []>
}

declare global {
  interface Window {
    localStorage: MockStorage
    sessionStorage: MockStorage
  }
}

export {}