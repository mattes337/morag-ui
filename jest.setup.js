import '@testing-library/jest-dom'

// Polyfill for ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock matchMedia
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

// Mock scrollTo and scroll methods
window.scrollTo = jest.fn();
window.scroll = jest.fn();

// Mock Element.scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// Mock getComputedStyle
const originalGetComputedStyle = window.getComputedStyle;
window.getComputedStyle = jest.fn().mockImplementation((element) => {
  const style = originalGetComputedStyle ? originalGetComputedStyle(element) : {};
  return {
    ...style,
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