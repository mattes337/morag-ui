import userEvent from '@testing-library/user-event';

/**
 * Comprehensive keyboard navigation testing utilities
 */
export class KeyboardNavigationTester {
  private user: ReturnType<typeof userEvent.setup>;
  
  constructor() {
    this.user = userEvent.setup();
  }

  /**
   * Test that Tab key moves focus to the next focusable element
   */
  async testTabForwardNavigation(
    container: HTMLElement, 
    expectedOrder?: string[],
    options: { shouldLoop?: boolean } = {}
  ) {
    const focusableElements = this.getFocusableElements(container);
    
    if (expectedOrder && expectedOrder.length > 0) {
      expect(focusableElements.map(el => this.getElementIdentifier(el)))
        .toEqual(expectedOrder);
    }

    // Start from first element or current focus
    if (focusableElements.length > 0) {
      focusableElements[0]?.focus();
    }

    // Test forward navigation
    for (let i = 1; i < focusableElements.length; i++) {
      await this.user.tab();
      expect(document.activeElement).toBe(focusableElements[i]);
    }

    // Test loop behavior if specified
    if (options.shouldLoop && focusableElements.length > 0) {
      await this.user.tab();
      expect(document.activeElement).toBe(focusableElements[0]);
    }
  }

  /**
   * Test that Shift+Tab moves focus to the previous focusable element
   */
  async testTabBackwardNavigation(
    container: HTMLElement,
    options: { shouldLoop?: boolean } = {}
  ) {
    const focusableElements = this.getFocusableElements(container);
    
    if (focusableElements.length === 0) return;

    // Start from last element
    const lastIndex = focusableElements.length - 1;
    focusableElements[lastIndex]?.focus();

    // Test backward navigation
    for (let i = lastIndex - 1; i >= 0; i--) {
      await this.user.tab({ shift: true });
      expect(document.activeElement).toBe(focusableElements[i]);
    }

    // Test loop behavior if specified
    if (options.shouldLoop) {
      await this.user.tab({ shift: true });
      expect(document.activeElement).toBe(focusableElements[lastIndex]);
    }
  }

  /**
   * Test Enter key activation on buttons and links
   */
  async testEnterActivation(
    element: HTMLElement, 
    expectedCallback?: jest.Mock,
    expectedBehavior?: 'click' | 'submit' | 'navigate'
  ) {
    element.focus();
    expect(document.activeElement).toBe(element);
    
    const clickSpy = jest.spyOn(element, 'click');
    
    await this.user.keyboard('{Enter}');
    
    if (expectedCallback) {
      expect(expectedCallback).toHaveBeenCalled();
    }
    
    if (expectedBehavior === 'click') {
      expect(clickSpy).toHaveBeenCalled();
    }
    
    clickSpy.mockRestore();
  }

  /**
   * Test Space key activation on buttons and checkboxes
   */
  async testSpaceActivation(
    element: HTMLElement,
    expectedCallback?: jest.Mock,
    expectedBehavior?: 'click' | 'toggle'
  ) {
    element.focus();
    expect(document.activeElement).toBe(element);
    
    const clickSpy = jest.spyOn(element, 'click');
    const initialChecked = (element as HTMLInputElement).checked;
    
    await this.user.keyboard(' ');
    
    if (expectedCallback) {
      expect(expectedCallback).toHaveBeenCalled();
    }
    
    if (expectedBehavior === 'click') {
      expect(clickSpy).toHaveBeenCalled();
    } else if (expectedBehavior === 'toggle' && (element as HTMLInputElement).type === 'checkbox') {
      expect((element as HTMLInputElement).checked).toBe(!initialChecked);
    }
    
    clickSpy.mockRestore();
  }

  /**
   * Test Escape key behavior (typically for modals, dropdowns)
   */
  async testEscapeKeyBehavior(
    element: HTMLElement,
    expectedCallback?: jest.Mock,
    expectedBehavior?: 'close' | 'cancel' | 'blur'
  ) {
    element.focus();
    
    await this.user.keyboard('{Escape}');
    
    if (expectedCallback) {
      expect(expectedCallback).toHaveBeenCalled();
    }
    
    if (expectedBehavior === 'blur') {
      expect(document.activeElement).not.toBe(element);
    }
  }

  /**
   * Test Arrow key navigation for composite widgets (menus, tabs, radio groups)
   */
  async testArrowKeyNavigation(
    _container: HTMLElement,
    direction: 'horizontal' | 'vertical' | 'both',
    expectedElements: HTMLElement[],
    options: { shouldLoop?: boolean; shouldActivate?: boolean } = {}
  ) {
    if (expectedElements.length === 0) return;

    // Start with first element focused
    expectedElements[0]?.focus();
    expect(document.activeElement).toBe(expectedElements[0]);

    const keyMaps = {
      horizontal: ['{ArrowRight}', '{ArrowLeft}'],
      vertical: ['{ArrowDown}', '{ArrowUp}'],
      both: ['{ArrowRight}', '{ArrowDown}', '{ArrowLeft}', '{ArrowUp}'],
    };

    const [forwardKey, backwardKey] = keyMaps[direction] || keyMaps.horizontal;

    // Test forward navigation
    for (let i = 1; i < expectedElements.length; i++) {
      if (forwardKey) await this.user.keyboard(forwardKey);
      expect(document.activeElement).toBe(expectedElements[i]);
      
      if (options.shouldActivate) {
        // Check if element was activated (depends on component implementation)
        const ariaSelected = expectedElements[i]!.getAttribute('aria-selected');
        expect(ariaSelected).toBe('true');
      }
    }

    // Test loop behavior
    if (options.shouldLoop && forwardKey) {
      await this.user.keyboard(forwardKey);
      expect(document.activeElement).toBe(expectedElements[0]);
    }

    // Test backward navigation
    for (let i = expectedElements.length - 2; i >= 0; i--) {
      if (backwardKey) await this.user.keyboard(backwardKey);
      expect(document.activeElement).toBe(expectedElements[i]);
    }

    if (options.shouldLoop && backwardKey) {
      await this.user.keyboard(backwardKey);
      expect(document.activeElement).toBe(expectedElements[expectedElements.length - 1]);
    }
  }

  /**
   * Test Home/End key behavior
   */
  async testHomeEndKeys(_container: HTMLElement, navigableElements: HTMLElement[]) {
    if (navigableElements.length < 2) return;

    // Focus somewhere in the middle
    const middleIndex = Math.floor(navigableElements.length / 2);
    navigableElements[middleIndex]?.focus();

    // Test Home key
    await this.user.keyboard('{Home}');
    expect(document.activeElement).toBe(navigableElements[0]);

    // Test End key
    await this.user.keyboard('{End}');
    expect(document.activeElement).toBe(navigableElements[navigableElements.length - 1]);
  }

  /**
   * Test Page Up/Page Down behavior for large lists
   */
  async testPageUpDownKeys(
    _container: HTMLElement,
    navigableElements: HTMLElement[],
    pageSize = 10
  ) {
    if (navigableElements.length <= pageSize) return;

    // Start at beginning
    navigableElements[0]?.focus();

    // Test Page Down
    await this.user.keyboard('{PageDown}');
    const expectedIndex = Math.min(pageSize, navigableElements.length - 1);
    expect(document.activeElement).toBe(navigableElements[expectedIndex]);

    // Test Page Up
    await this.user.keyboard('{PageUp}');
    expect(document.activeElement).toBe(navigableElements[0]);
  }

  /**
   * Test that disabled elements are not focusable
   */
  testDisabledElementsNotFocusable(container: HTMLElement) {
    const disabledElements = container.querySelectorAll(
      '[disabled], [aria-disabled="true"]'
    ) as NodeListOf<HTMLElement>;

    disabledElements.forEach(element => {
      expect(element.tabIndex).toBe(-1);
      
      // Try to focus - should not work
      element.focus();
      expect(document.activeElement).not.toBe(element);
    });
  }

  /**
   * Test focus trap behavior (for modals, dialogs)
   */
  async testFocusTrap(container: HTMLElement) {
    const focusableElements = this.getFocusableElements(container);
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Start at last element
    lastElement?.focus();
    expect(document.activeElement).toBe(lastElement);

    // Tab should move to first element (trap)
    await this.user.tab();
    expect(document.activeElement).toBe(firstElement);

    // Shift+Tab from first should move to last element (trap)
    await this.user.tab({ shift: true });
    expect(document.activeElement).toBe(lastElement);
  }

  /**
   * Test roving tabindex behavior
   */
  async testRovingTabindex(
    _container: HTMLElement,
    navigableElements: HTMLElement[],
    direction: 'horizontal' | 'vertical' = 'horizontal'
  ) {
    // Initially, only one element should have tabindex="0"
    const tabbableElements = navigableElements.filter(el => el.tabIndex === 0);
    expect(tabbableElements).toHaveLength(1);

    const [forwardKey] = direction === 'horizontal' 
      ? ['{ArrowRight}'] 
      : ['{ArrowDown}'];

    // Start with the tabbable element
    tabbableElements[0]?.focus();

    // Arrow keys should move tabindex="0" and focus
    for (let i = 1; i < navigableElements.length; i++) {
      if (forwardKey) await this.user.keyboard(forwardKey);
      
      // Check that exactly one element has tabindex="0"
      const currentTabbable = navigableElements.filter(el => el.tabIndex === 0);
      expect(currentTabbable).toHaveLength(1);
      expect(currentTabbable[0]).toBe(navigableElements[i]);
      expect(document.activeElement).toBe(navigableElements[i]);
    }
  }

  /**
   * Get all focusable elements in a container
   */
  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelector = [
      'a[href]:not([tabindex="-1"])',
      'button:not([disabled]):not([tabindex="-1"])',
      'input:not([disabled]):not([tabindex="-1"])',
      'select:not([disabled]):not([tabindex="-1"])',
      'textarea:not([disabled]):not([tabindex="-1"])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]:not([tabindex="-1"])',
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelector))
      .filter(element => {
        const style = window.getComputedStyle(element as Element);
        return (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          (element as HTMLElement).offsetWidth > 0 &&
          (element as HTMLElement).offsetHeight > 0
        );
      }) as HTMLElement[];
  }

  /**
   * Get a string identifier for an element (for debugging/testing)
   */
  private getElementIdentifier(element: HTMLElement): string {
    return (
      element.getAttribute('data-testid') ||
      element.getAttribute('aria-label') ||
      element.getAttribute('id') ||
      element.className ||
      element.tagName.toLowerCase()
    );
  }
}

/**
 * Specific keyboard behavior tests for different component types
 */
export const KeyboardPatterns = {
  /**
   * Test button keyboard behavior
   */
  button: async (button: HTMLElement, onClick?: jest.Mock) => {
    const tester = new KeyboardNavigationTester();
    
    // Buttons should be focusable
    expect(button).toBeInTheTabSequence();
    
    // Enter and Space should activate
    await tester.testEnterActivation(button, onClick, 'click');
    await tester.testSpaceActivation(button, onClick, 'click');
  },

  /**
   * Test link keyboard behavior
   */
  link: async (link: HTMLElement, onClick?: jest.Mock) => {
    const tester = new KeyboardNavigationTester();
    
    // Links should be focusable
    expect(link).toBeInTheTabSequence();
    
    // Only Enter should activate links
    await tester.testEnterActivation(link, onClick, 'click');
  },

  /**
   * Test checkbox keyboard behavior
   */
  checkbox: async (checkbox: HTMLInputElement, onChange?: jest.Mock) => {
    const tester = new KeyboardNavigationTester();
    
    // Checkboxes should be focusable
    expect(checkbox).toBeInTheTabSequence();
    
    // Space should toggle, Enter might trigger form submission
    await tester.testSpaceActivation(checkbox, onChange, 'toggle');
  },

  /**
   * Test radio group keyboard behavior
   */
  radioGroup: async (
    container: HTMLElement, 
    radioButtons: HTMLInputElement[],
    _onChange?: jest.Mock
  ) => {
    const tester = new KeyboardNavigationTester();
    
    // Only checked radio should be tabbable initially
    const checkedRadio = radioButtons.find(radio => radio.checked);
    if (checkedRadio) {
      expect(checkedRadio).toBeInTheTabSequence();
      radioButtons.forEach(radio => {
        if (radio !== checkedRadio) {
          expect(radio.tabIndex).toBe(-1);
        }
      });
    }
    
    // Arrow keys should move between radios
    await tester.testArrowKeyNavigation(
      container, 
      'vertical', 
      radioButtons,
      { shouldLoop: true, shouldActivate: true }
    );
  },

  /**
   * Test select/combobox keyboard behavior
   */
  select: async (
    select: HTMLElement,
    options: HTMLElement[],
    onChange?: jest.Mock
  ) => {
    const tester = new KeyboardNavigationTester();
    
    // Select should be focusable
    expect(select).toBeInTheTabSequence();
    
    // Enter or Space should open dropdown
    await tester.testEnterActivation(select, onChange);
    await tester.testSpaceActivation(select, onChange);
    
    // Arrow keys should navigate options
    if (options.length > 0) {
      await tester.testArrowKeyNavigation(
        select,
        'vertical',
        options,
        { shouldLoop: false }
      );
    }
    
    // Escape should close dropdown
    await tester.testEscapeKeyBehavior(select, onChange, 'close');
  },

  /**
   * Test tabs keyboard behavior
   */
  tabs: async (
    tabList: HTMLElement,
    tabs: HTMLElement[],
    _panels: HTMLElement[],
    _onTabChange?: jest.Mock
  ) => {
    const tester = new KeyboardNavigationTester();
    
    // Tab list should be a single tab stop
    expect(tabList).toBeInTheTabSequence();
    
    // Arrow keys should move between tabs
    await tester.testArrowKeyNavigation(
      tabList,
      'horizontal',
      tabs,
      { shouldLoop: true, shouldActivate: true }
    );
    
    // Home/End should work
    await tester.testHomeEndKeys(tabList, tabs);
  },

  /**
   * Test menu keyboard behavior
   */
  menu: async (
    menu: HTMLElement,
    menuItems: HTMLElement[],
    onItemSelect?: jest.Mock
  ) => {
    const tester = new KeyboardNavigationTester();
    
    // Arrow keys should navigate menu items
    await tester.testArrowKeyNavigation(
      menu,
      'vertical',
      menuItems,
      { shouldLoop: true }
    );
    
    // Enter should select items
    for (const item of menuItems) {
      item.focus();
      await tester.testEnterActivation(item, onItemSelect);
    }
    
    // Escape should close menu
    await tester.testEscapeKeyBehavior(menu, undefined, 'close');
    
    // Home/End navigation
    await tester.testHomeEndKeys(menu, menuItems);
  },

  /**
   * Test dialog keyboard behavior
   */
  dialog: async (
    dialog: HTMLElement,
    closeButton?: HTMLElement,
    onClose?: jest.Mock
  ) => {
    const tester = new KeyboardNavigationTester();
    
    // Focus should be trapped within dialog
    await tester.testFocusTrap(dialog);
    
    // Escape should close dialog
    await tester.testEscapeKeyBehavior(dialog, onClose, 'close');
    
    // Close button should work
    if (closeButton) {
      await tester.testEnterActivation(closeButton, onClose);
      await tester.testSpaceActivation(closeButton, onClose);
    }
  },

  /**
   * Test slider/range keyboard behavior
   */
  slider: async (
    slider: HTMLInputElement,
    _onChange?: jest.Mock,
    options: { min?: number; max?: number; step?: number } = {}
  ) => {
    // const _tester = new KeyboardNavigationTester();
    const user = userEvent.setup();
    
    // Slider should be focusable
    expect(slider).toBeInTheTabSequence();
    
    slider.focus();
    const initialValue = parseFloat(slider.value);
    
    // Arrow keys should change value
    await user.keyboard('{ArrowRight}');
    expect(parseFloat(slider.value)).toBeGreaterThan(initialValue);
    
    await user.keyboard('{ArrowLeft}');
    expect(parseFloat(slider.value)).toBe(initialValue);
    
    await user.keyboard('{ArrowUp}');
    expect(parseFloat(slider.value)).toBeGreaterThan(initialValue);
    
    await user.keyboard('{ArrowDown}');
    expect(parseFloat(slider.value)).toBe(initialValue);
    
    // Home/End should go to min/max
    if (options.min !== undefined) {
      await user.keyboard('{Home}');
      expect(parseFloat(slider.value)).toBe(options.min);
    }
    
    if (options.max !== undefined) {
      await user.keyboard('{End}');
      expect(parseFloat(slider.value)).toBe(options.max);
    }
    
    // Page Up/Down should make larger increments
    await user.keyboard('{PageUp}');
    await user.keyboard('{PageDown}');
  },
};