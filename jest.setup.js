// jest.setup.js
import '@testing-library/jest-dom'
import { toHaveNoViolations } from 'jest-axe'

// Import custom matchers
const { toHaveAccessibleColors } = require('./lib/accessibility/color-contrast-utils')

// Extend Jest matchers to include axe-core matchers and custom accessibility matchers
expect.extend(toHaveNoViolations)
expect.extend({ toHaveAccessibleColors })

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return {
      get: jest.fn(),
    }
  },
  usePathname() {
    return '/dashboard'
  },
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Make localStorage mock available globally
global.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
})

// Make sessionStorage mock available globally
global.sessionStorage = sessionStorageMock

// Mock window.matchMedia
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
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver with proper constructor signature
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback, options) {
    this.callback = callback
    this.options = options
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return [] }
}

// Mock scrollTo and scroll methods
window.scrollTo = jest.fn();
window.scroll = jest.fn();

// Mock Element.scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// Mock getComputedStyle for accessibility testing
const originalGetComputedStyle = window.getComputedStyle;
window.getComputedStyle = jest.fn().mockImplementation((element) => {
  const style = originalGetComputedStyle ? originalGetComputedStyle(element) : {};
  return {
    ...style,
    color: 'rgb(0, 0, 0)',
    backgroundColor: 'rgb(255, 255, 255)',
    display: 'block',
    visibility: 'visible',
    getPropertyValue: jest.fn((property) => {
      switch (property) {
        case 'color':
          return 'rgb(0, 0, 0)';
        case 'background-color':
          return 'rgb(255, 255, 255)';
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

// Suppress console warnings for tests unless specifically testing for them
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});

// Clean up after each test
afterEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Reset storage mocks
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
  localStorageMock.clear.mockClear()
  
  sessionStorageMock.getItem.mockClear()
  sessionStorageMock.setItem.mockClear()
  sessionStorageMock.removeItem.mockClear()
  sessionStorageMock.clear.mockClear()
  
  // Reset document focus
  if (document.activeElement && document.activeElement !== document.body) {
    document.activeElement.blur();
  }
  
  // Clean up any open dialogs or modals
  const modals = document.querySelectorAll('[role="dialog"], [role="alertdialog"]');
  modals.forEach(modal => modal.remove());
})

// Custom Jest matchers for accessibility testing
expect.extend({
  toHaveAccessibleName(element, expectedName) {
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
  
  toHaveAccessibleDescription(element, expectedDescription) {
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
  
  toBeInTheTabSequence(element) {
    const tabIndex = element.tabIndex;
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
  
  toHaveRole(element, expectedRole) {
    const actualRole = element.getAttribute('role') || getImplicitRole(element);
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

// Helper function to get implicit ARIA roles
function getImplicitRole(element) {
  const tagName = element.tagName.toLowerCase();
  const roleMap = {
    button: 'button',
    a: element.hasAttribute('href') ? 'link' : '',
    input: getInputRole(element),
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

function getInputRole(input) {
  const type = input.type.toLowerCase();
  const roleMap = {
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