import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';
import { toHaveAccessibleColors } from './color-contrast-utils';

// Extend Jest matchers to include axe-core and color contrast matchers
expect.extend(toHaveNoViolations);
expect.extend({ toHaveAccessibleColors });

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia for responsive testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock getComputedStyle for color contrast testing
const originalGetComputedStyle = window.getComputedStyle;
window.getComputedStyle = jest.fn().mockImplementation((element: Element) => {
  const style = originalGetComputedStyle(element);
  return {
    ...style,
    color: style.color || 'rgb(0, 0, 0)',
    backgroundColor: style.backgroundColor || 'rgb(255, 255, 255)',
    getPropertyValue: jest.fn((property: string) => {
      switch (property) {
        case 'color':
          return style.color || 'rgb(0, 0, 0)';
        case 'background-color':
          return style.backgroundColor || 'rgb(255, 255, 255)';
        case 'display':
          return 'block';
        case 'visibility':
          return 'visible';
        default:
          return style.getPropertyValue?.(property) || '';
      }
    }),
  };
});

// Set up global test environment
let originalWarn: typeof console.warn;
let originalError: typeof console.error;

beforeAll(() => {
  // Suppress console warnings for tests unless specifically testing for them
  originalWarn = console.warn;
  originalError = console.error;
  
  console.warn = jest.fn();
  console.error = jest.fn();
});

// Restore original console methods after tests
afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});

// Clean up after each test
afterEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Reset document focus
  if (document.activeElement && document.activeElement !== document.body) {
    (document.activeElement as HTMLElement).blur();
  }
  
  // Clean up any open dialogs or modals
  const modals = document.querySelectorAll('[role="dialog"], [role="alertdialog"]');
  modals.forEach(modal => modal.remove());
});

// Custom Jest matcher for accessible names
expect.extend({
  toHaveAccessibleName(element: HTMLElement, expectedName: string) {
    const accessibleName = 
      element.getAttribute('aria-label') ||
      element.getAttribute('title') ||
      element.textContent?.trim() ||
      '';

    const pass = accessibleName === expectedName;
    
    if (pass) {
      return {
        message: () => `Expected element not to have accessible name "${expectedName}"`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected element to have accessible name "${expectedName}", but got "${accessibleName}"`,
        pass: false,
      };
    }
  },
  
  toHaveAccessibleDescription(element: HTMLElement, expectedDescription: string) {
    const describedBy = element.getAttribute('aria-describedby');
    let accessibleDescription = '';
    
    if (describedBy) {
      const descElement = document.getElementById(describedBy);
      accessibleDescription = descElement?.textContent?.trim() || '';
    } else {
      accessibleDescription = element.getAttribute('title') || '';
    }

    const pass = accessibleDescription === expectedDescription;
    
    if (pass) {
      return {
        message: () => `Expected element not to have accessible description "${expectedDescription}"`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected element to have accessible description "${expectedDescription}", but got "${accessibleDescription}"`,
        pass: false,
      };
    }
  },
  
  toBeInTheTabSequence(element: HTMLElement) {
    const tabIndex = element.tabIndex;
    // In JSDOM, offsetWidth/height might be 0, so we check style display instead
    const style = window.getComputedStyle(element);
    const isVisible = style.display !== 'none' && style.visibility !== 'hidden';
    const isDisabled = element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true';
    
    const pass = tabIndex >= 0 && isVisible && !isDisabled;
    
    if (pass) {
      return {
        message: () => `Expected element not to be in the tab sequence`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected element to be in the tab sequence (tabIndex >= 0, visible, not disabled)`,
        pass: false,
      };
    }
  },
  
  toHaveRole(element: HTMLElement, expectedRole: string) {
    const actualRole = element.getAttribute('role') || this.getImplicitRole(element);
    const pass = actualRole === expectedRole;
    
    if (pass) {
      return {
        message: () => `Expected element not to have role "${expectedRole}"`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected element to have role "${expectedRole}", but got "${actualRole}"`,
        pass: false,
      };
    }
  },
});

// Extend global Jest types
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveAccessibleName(expectedName: string): R;
      toHaveAccessibleDescription(expectedDescription: string): R;
      toBeInTheTabSequence(): R;
      toHaveRole(expectedRole: string): R;
    }
  }
}

// Helper function to get implicit ARIA roles
function getImplicitRole(element: HTMLElement): string {
  const tagName = element.tagName.toLowerCase();
  const roleMap: Record<string, string> = {
    button: 'button',
    a: element.hasAttribute('href') ? 'link' : '',
    input: getInputRole(element as HTMLInputElement),
    textarea: 'textbox',
    select: 'combobox',
    h1: 'heading',
    h2: 'heading',
    h3: 'heading',
    h4: 'heading',
    h5: 'heading',
    h6: 'heading',
    nav: 'navigation',
    main: 'main',
    aside: 'complementary',
    section: 'region',
    article: 'article',
    header: 'banner',
    footer: 'contentinfo',
    form: 'form',
    table: 'table',
    ul: 'list',
    ol: 'list',
    li: 'listitem',
    img: element.getAttribute('alt') !== '' ? 'img' : 'presentation',
  };
  
  return roleMap[tagName] || '';
}

function getInputRole(input: HTMLInputElement): string {
  const type = input.type.toLowerCase();
  const roleMap: Record<string, string> = {
    button: 'button',
    submit: 'button',
    reset: 'button',
    image: 'button',
    checkbox: 'checkbox',
    radio: 'radio',
    range: 'slider',
    search: 'searchbox',
  };
  
  return roleMap[type] || 'textbox';
}