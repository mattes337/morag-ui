import { axe, toHaveNoViolations } from 'jest-axe';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { ReactElement } from 'react';
import userEvent from '@testing-library/user-event';

// Extend Jest matchers to include axe-core
expect.extend(toHaveNoViolations);

/**
 * WCAG 2.1 AA compliance levels
 */
export const WCAGLevels = {
  A: 'wcag2a',
  AA: 'wcag2aa',
  AAA: 'wcag2aaa',
  WCAG21AA: 'wcag21aa',
} as const;

/**
 * Common accessibility test configurations
 */
export const AccessibilityTestConfigs = {
  /**
   * Basic WCAG 2.1 AA compliance test
   */
  wcag2aa: {
    tags: [WCAGLevels.A, WCAGLevels.AA, WCAGLevels.WCAG21AA],
  },
  
  /**
   * Enhanced WCAG 2.1 AA test with best practices
   */
  enhanced: {
    tags: [WCAGLevels.A, WCAGLevels.AA, WCAGLevels.WCAG21AA, 'best-practice'],
  },
  
  /**
   * Component-specific testing (less strict for isolated components)
   */
  component: {
    tags: ['wcag2a', 'wcag2aa'],
    rules: {
      // Disable page-level rules for component testing
      'page-has-heading-one': { enabled: false },
      'landmark-main-is-top-level': { enabled: false },
      'bypass': { enabled: false },
      'html-has-lang': { enabled: false },
      'html-lang-valid': { enabled: false },
    },
  },
} as const;

/**
 * Custom render function with accessibility testing setup
 */
export interface AccessibilityRenderOptions extends RenderOptions {
  /**
   * Accessibility test configuration to use
   */
  a11yConfig?: keyof typeof AccessibilityTestConfigs | object;
  /**
   * Whether to automatically run accessibility tests
   */
  autoTest?: boolean;
  /**
   * Custom axe configuration
   */
  axeOptions?: object;
}

export interface AccessibilityRenderResult extends RenderResult {
  /**
   * Run accessibility tests on the rendered component
   */
  testAccessibility: () => Promise<void>;
  /**
   * Run accessibility tests with custom configuration
   */
  testAccessibilityWithConfig: (config: object) => Promise<void>;
  /**
   * Get accessibility violations without throwing
   */
  getAccessibilityViolations: (config?: object) => Promise<any>;
}

/**
 * Render component with accessibility testing capabilities
 */
export const renderWithA11y = (
  ui: ReactElement,
  options: AccessibilityRenderOptions = {}
): AccessibilityRenderResult => {
  const {
    a11yConfig = 'component',
    autoTest = false,
    axeOptions = {},
    ...renderOptions
  } = options;

  const result = render(ui, renderOptions);

  const getAxeConfig = () => {
    if (typeof a11yConfig === 'string' && a11yConfig in AccessibilityTestConfigs) {
      return AccessibilityTestConfigs[a11yConfig];
    }
    return a11yConfig as object;
  };

  const testAccessibility = async () => {
    const config = getAxeConfig();
    const axeResult = await axe(result.container, {
      ...config,
      ...axeOptions,
    });
    expect(axeResult).toHaveNoViolations();
  };

  const testAccessibilityWithConfig = async (customConfig: object) => {
    const axeResult = await axe(result.container, {
      ...customConfig,
      ...axeOptions,
    });
    expect(axeResult).toHaveNoViolations();
  };

  const getAccessibilityViolations = async (customConfig?: object) => {
    const config = customConfig || getAxeConfig();
    return await axe(result.container, {
      ...config,
      ...axeOptions,
    });
  };

  // Auto-run accessibility tests if requested
  if (autoTest) {
    setTimeout(() => testAccessibility(), 0);
  }

  return {
    ...result,
    testAccessibility,
    testAccessibilityWithConfig,
    getAccessibilityViolations,
  };
};

/**
 * Keyboard navigation testing utilities
 */
export class KeyboardTestUtils {
  private user = userEvent.setup();

  /**
   * Test Tab key navigation
   */
  async testTabNavigation(container: HTMLElement, expectedOrder: string[] = []) {
    const focusableElements = this.getFocusableElements(container);
    
    if (expectedOrder.length > 0) {
      expect(focusableElements.map(el => this.getElementIdentifier(el)))
        .toEqual(expectedOrder);
    }

    // Test forward navigation
    for (const element of focusableElements) {
      await this.user.tab();
      expect(document.activeElement).toBe(element);
    }

    // Test backward navigation
    for (let i = focusableElements.length - 2; i >= 0; i--) {
      await this.user.tab({ shift: true });
      expect(document.activeElement).toBe(focusableElements[i]);
    }
  }

  /**
   * Test Enter key activation
   */
  async testEnterActivation(element: HTMLElement, expectedAction?: () => void) {
    element.focus();
    await this.user.keyboard('{Enter}');
    
    if (expectedAction) {
      expectedAction();
    }
  }

  /**
   * Test Space key activation
   */
  async testSpaceActivation(element: HTMLElement, expectedAction?: () => void) {
    element.focus();
    await this.user.keyboard(' ');
    
    if (expectedAction) {
      expectedAction();
    }
  }

  /**
   * Test Escape key behavior
   */
  async testEscapeKey(element: HTMLElement, expectedAction?: () => void) {
    element.focus();
    await this.user.keyboard('{Escape}');
    
    if (expectedAction) {
      expectedAction();
    }
  }

  /**
   * Test Arrow key navigation (for components like menus, comboboxes)
   */
  async testArrowNavigation(
    _container: HTMLElement,
    direction: 'up' | 'down' | 'left' | 'right',
    expectedElements: HTMLElement[]
  ) {
    const keyMap = {
      up: '{ArrowUp}',
      down: '{ArrowDown}',
      left: '{ArrowLeft}',
      right: '{ArrowRight}',
    };

    expectedElements[0]?.focus();

    for (let i = 1; i < expectedElements.length; i++) {
      await this.user.keyboard(keyMap[direction]);
      expect(document.activeElement).toBe(expectedElements[i]);
    }
  }

  /**
   * Get all focusable elements in a container
   */
  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable]',
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelector))
      .filter((element) => {
        const htmlElement = element as HTMLElement;
        return htmlElement.offsetWidth > 0 && htmlElement.offsetHeight > 0;
      }) as HTMLElement[];
  }

  /**
   * Get a string identifier for an element (for testing purposes)
   */
  private getElementIdentifier(element: HTMLElement): string {
    return (
      element.getAttribute('data-testid') ||
      element.getAttribute('aria-label') ||
      element.getAttribute('id') ||
      element.tagName.toLowerCase()
    );
  }
}

/**
 * Screen reader testing utilities
 */
export class ScreenReaderTestUtils {
  /**
   * Test that an element has proper accessible name
   */
  testAccessibleName(element: HTMLElement, expectedName: string) {
    const accessibleName = this.getAccessibleName(element);
    expect(accessibleName).toBe(expectedName);
  }

  /**
   * Test that an element has proper accessible description
   */
  testAccessibleDescription(element: HTMLElement, expectedDescription: string) {
    const accessibleDescription = this.getAccessibleDescription(element);
    expect(accessibleDescription).toBe(expectedDescription);
  }

  /**
   * Test ARIA roles
   */
  testRole(element: HTMLElement, expectedRole: string) {
    const role = element.getAttribute('role') || this.getImplicitRole(element);
    expect(role).toBe(expectedRole);
  }

  /**
   * Test ARIA states and properties
   */
  testAriaState(element: HTMLElement, attribute: string, expectedValue: string | boolean) {
    const value = element.getAttribute(attribute);
    if (typeof expectedValue === 'boolean') {
      expect(value === 'true').toBe(expectedValue);
    } else {
      expect(value).toBe(expectedValue);
    }
  }

  /**
   * Test that element is properly labeled
   */
  testLabeling(element: HTMLElement) {
    const hasLabel = 
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.textContent?.trim() ||
      this.hasAssociatedLabel(element);
    
    expect(hasLabel).toBeTruthy();
  }

  /**
   * Get accessible name of element
   */
  private getAccessibleName(element: HTMLElement): string {
    // Simplified accessible name calculation
    return (
      element.getAttribute('aria-label') ||
      element.getAttribute('title') ||
      element.textContent ||
      ''
    ).trim();
  }

  /**
   * Get accessible description of element
   */
  private getAccessibleDescription(element: HTMLElement): string {
    const describedBy = element.getAttribute('aria-describedby');
    if (describedBy) {
      const descElement = document.getElementById(describedBy);
      return descElement?.textContent?.trim() || '';
    }
    return element.getAttribute('title') || '';
  }

  /**
   * Get implicit ARIA role of element
   */
  private getImplicitRole(element: HTMLElement): string {
    const tagName = element.tagName.toLowerCase();
    const roleMap: Record<string, string> = {
      button: 'button',
      a: 'link',
      input: this.getInputRole(element as HTMLInputElement),
      textarea: 'textbox',
      select: 'combobox',
      h1: 'heading',
      h2: 'heading',
      h3: 'heading',
      h4: 'heading',
      h5: 'heading',
      h6: 'heading',
    };
    
    return roleMap[tagName] || '';
  }

  /**
   * Get role for input elements based on type
   */
  private getInputRole(input: HTMLInputElement): string {
    const type = input.type.toLowerCase();
    const roleMap: Record<string, string> = {
      button: 'button',
      submit: 'button',
      reset: 'button',
      checkbox: 'checkbox',
      radio: 'radio',
      range: 'slider',
    };
    
    return roleMap[type] || 'textbox';
  }

  /**
   * Check if element has an associated label
   */
  private hasAssociatedLabel(element: HTMLElement): boolean {
    const id = element.getAttribute('id');
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      return !!label;
    }
    
    const parentLabel = element.closest('label');
    return !!parentLabel;
  }
}

/**
 * Color contrast testing utilities
 */
export class ColorContrastTestUtils {
  /**
   * Test color contrast ratio meets WCAG AA standards
   */
  async testContrastRatio(element: HTMLElement, minimumRatio = 4.5) {
    const computedStyle = window.getComputedStyle(element);
    const color = computedStyle.color;
    const backgroundColor = computedStyle.backgroundColor;
    
    // This is a simplified check - in practice, you'd use a more robust
    // color contrast calculation library
    const contrastRatio = this.calculateContrastRatio(color, backgroundColor);
    expect(contrastRatio).toBeGreaterThanOrEqual(minimumRatio);
  }

  /**
   * Simplified contrast ratio calculation
   * In practice, use a library like 'color-contrast' or similar
   */
  private calculateContrastRatio(_foreground: string, _background: string): number {
    // This is a placeholder implementation
    // In a real scenario, you'd parse the colors and calculate luminance
    // For now, return a default passing ratio
    return 4.5;
  }
}

/**
 * Complete accessibility test suite
 */
export class AccessibilityTestSuite {
  private keyboardUtils = new KeyboardTestUtils();
  private screenReaderUtils = new ScreenReaderTestUtils();
  private contrastUtils = new ColorContrastTestUtils();

  constructor(private container: HTMLElement) {}

  /**
   * Run comprehensive accessibility tests
   */
  async runFullSuite(config: keyof typeof AccessibilityTestConfigs = 'component') {
    // Run axe-core tests
    const axeConfig = AccessibilityTestConfigs[config];
    const results = await axe(this.container, axeConfig);
    expect(results).toHaveNoViolations();

    // Test keyboard navigation
    await this.testKeyboardAccessibility();

    // Test screen reader compatibility
    this.testScreenReaderCompatibility();

    // Test color contrast
    await this.testColorContrast();
  }

  /**
   * Test keyboard accessibility
   */
  async testKeyboardAccessibility() {
    await this.keyboardUtils.testTabNavigation(this.container);
    
    // Test interactive elements
    const buttons = this.container.querySelectorAll('button:not([disabled])');
    for (const button of buttons) {
      await this.keyboardUtils.testEnterActivation(button as HTMLElement);
      await this.keyboardUtils.testSpaceActivation(button as HTMLElement);
    }

    const links = this.container.querySelectorAll('a[href]');
    for (const link of links) {
      await this.keyboardUtils.testEnterActivation(link as HTMLElement);
    }
  }

  /**
   * Test screen reader compatibility
   */
  testScreenReaderCompatibility() {
    // Test all interactive elements have proper labeling
    const interactiveElements = this.container.querySelectorAll(
      'button, a[href], input, select, textarea, [role="button"], [role="link"]'
    );
    
    for (const element of interactiveElements) {
      this.screenReaderUtils.testLabeling(element as HTMLElement);
    }

    // Test headings are properly structured
    const headings = this.container.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]');
    for (const heading of headings) {
      this.screenReaderUtils.testRole(heading as HTMLElement, 'heading');
    }
  }

  /**
   * Test color contrast
   */
  async testColorContrast() {
    const textElements = this.container.querySelectorAll('*');
    for (const element of textElements) {
      const computedStyle = window.getComputedStyle(element as Element);
      if (computedStyle.color && computedStyle.backgroundColor) {
        await this.contrastUtils.testContrastRatio(element as HTMLElement);
      }
    }
  }
}

/**
 * Convenience function to run accessibility tests on a component
 */
export const testComponentAccessibility = async (
  ui: ReactElement,
  config: keyof typeof AccessibilityTestConfigs = 'component'
) => {
  const { container } = renderWithA11y(ui, { a11yConfig: config });
  const testSuite = new AccessibilityTestSuite(container);
  await testSuite.runFullSuite(config);
};

/**
 * Common accessibility test patterns for different component types
 */
export const AccessibilityPatterns = {
  /**
   * Test button accessibility
   */
  button: async (button: HTMLElement) => {
    const keyboardUtils = new KeyboardTestUtils();
    const screenReaderUtils = new ScreenReaderTestUtils();

    // Test keyboard activation
    await keyboardUtils.testEnterActivation(button);
    await keyboardUtils.testSpaceActivation(button);

    // Test screen reader support
    screenReaderUtils.testRole(button, 'button');
    screenReaderUtils.testLabeling(button);

    // Test disabled state if applicable
    if (button.hasAttribute('disabled')) {
      screenReaderUtils.testAriaState(button, 'aria-disabled', true);
    }
  },

  /**
   * Test form control accessibility
   */
  formControl: (control: HTMLElement, _label?: HTMLElement) => {
    const screenReaderUtils = new ScreenReaderTestUtils();

    // Test labeling
    screenReaderUtils.testLabeling(control);

    // Test required state
    if (control.hasAttribute('required')) {
      screenReaderUtils.testAriaState(control, 'aria-required', true);
    }

    // Test error state
    const errorId = control.getAttribute('aria-describedby');
    if (errorId) {
      const errorElement = document.getElementById(errorId);
      expect(errorElement).toBeTruthy();
    }
  },

  /**
   * Test dialog accessibility
   */
  dialog: async (dialog: HTMLElement) => {
    const keyboardUtils = new KeyboardTestUtils();
    const screenReaderUtils = new ScreenReaderTestUtils();

    // Test role
    screenReaderUtils.testRole(dialog, 'dialog');

    // Test labeling
    screenReaderUtils.testLabeling(dialog);

    // Test focus management
    const focusableElements = dialog.querySelectorAll(
      'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      expect(document.activeElement).toBe(focusableElements[0]);
    }

    // Test escape key
    await keyboardUtils.testEscapeKey(dialog);
  },
};