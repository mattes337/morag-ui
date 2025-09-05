# MoRAG UI Accessibility Guide

This guide provides comprehensive accessibility standards and best practices for developing components in the MoRAG UI library. Our goal is to ensure all components meet WCAG 2.1 AA standards and provide excellent user experiences for people with disabilities.

## Table of Contents

- [Overview](#overview)
- [Testing Infrastructure](#testing-infrastructure)
- [Component Development Guidelines](#component-development-guidelines)
- [ARIA Patterns](#aria-patterns)
- [Keyboard Navigation](#keyboard-navigation)
- [Color and Contrast](#color-and-contrast)
- [Screen Reader Support](#screen-reader-support)
- [Testing Checklist](#testing-checklist)
- [Tools and Resources](#tools-and-resources)

## Overview

### Accessibility Standards

We follow **WCAG 2.1 Level AA** guidelines, which include:

- **Perceivable**: Information must be presentable to users in ways they can perceive
- **Operable**: Interface components must be operable by all users
- **Understandable**: Information and UI operation must be understandable
- **Robust**: Content must be robust enough for various assistive technologies

### Key Principles

1. **Semantic HTML First**: Use appropriate HTML elements before adding ARIA
2. **Progressive Enhancement**: Components work without JavaScript
3. **Keyboard Accessible**: All interactive elements are keyboard accessible
4. **Screen Reader Compatible**: Proper ARIA labels and descriptions
5. **High Contrast Support**: Components work in high contrast mode
6. **Focus Management**: Clear focus indicators and logical focus order

## Testing Infrastructure

### Automated Testing

We use several tools for automated accessibility testing:

```typescript
import { renderWithA11y, testComponentAccessibility } from '@/lib/accessibility/a11y-test-utils';

// Basic accessibility test
test('Button is accessible', async () => {
  await testComponentAccessibility(<Button>Click me</Button>);
});

// Custom accessibility test
test('Button with custom config', async () => {
  const { testAccessibility } = renderWithA11y(<Button>Click me</Button>);
  await testAccessibility();
});
```

### Storybook Integration

All stories automatically run accessibility tests. View the **Accessibility** tab in Storybook to see results.

### Manual Testing

Use these tools for manual testing:

- **Screen Readers**: NVDA (Windows), JAWS (Windows), VoiceOver (macOS)
- **Keyboard Only**: Navigate using only Tab, Enter, Space, Arrow keys
- **High Contrast Mode**: Test in Windows High Contrast mode
- **Color Vision**: Use color blindness simulators

## Component Development Guidelines

### 1. Interactive Elements

#### Buttons

```typescript
// ✅ Good - Accessible button
<Button 
  onClick={handleClick}
  disabled={isLoading}
  aria-label="Save document"
  aria-describedby="save-help"
>
  {isLoading ? 'Saving...' : 'Save'}
</Button>

// ❌ Bad - Missing accessibility attributes
<div onClick={handleClick} className="button-like">
  Save
</div>
```

**Requirements:**
- Use `<button>` element or `role="button"`
- Include `aria-label` for icon-only buttons
- Set `aria-disabled` when disabled
- Provide loading state announcements
- Support Enter and Space key activation

#### Links

```typescript
// ✅ Good - Descriptive link
<Link href="/documents" aria-describedby="doc-help">
  View Documents
</Link>

// ❌ Bad - Generic link text
<Link href="/documents">
  Click here
</Link>
```

**Requirements:**
- Use meaningful link text
- Include context for external links
- Support Enter key activation
- Provide `aria-current` for current page

### 2. Form Controls

#### Input Fields

```typescript
// ✅ Good - Properly labeled input
<div>
  <Label htmlFor="email">Email Address *</Label>
  <Input
    id="email"
    type="email"
    required
    aria-required="true"
    aria-describedby="email-error email-help"
    aria-invalid={hasError ? 'true' : 'false'}
  />
  <div id="email-help">We'll never share your email</div>
  {hasError && (
    <div id="email-error" role="alert">
      Please enter a valid email address
    </div>
  )}
</div>
```

**Requirements:**
- Associate labels with `htmlFor` or wrapping
- Use `aria-required` for required fields
- Provide error messages with `role="alert"`
- Include help text with `aria-describedby`
- Set `aria-invalid` for validation errors

### 3. Complex Components

#### Dialogs/Modals

```typescript
// ✅ Good - Accessible dialog
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent
    role="dialog"
    aria-labelledby="dialog-title"
    aria-describedby="dialog-description"
  >
    <DialogTitle id="dialog-title">
      Confirm Action
    </DialogTitle>
    <DialogDescription id="dialog-description">
      Are you sure you want to delete this item?
    </DialogDescription>
    <div className="flex gap-2">
      <Button onClick={handleConfirm}>Confirm</Button>
      <Button variant="outline" onClick={handleCancel}>
        Cancel
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

**Requirements:**
- Use `role="dialog"` or `role="alertdialog"`
- Provide `aria-labelledby` and `aria-describedby`
- Trap focus within dialog
- Return focus to trigger element when closed
- Support Escape key to close

## ARIA Patterns

### Common ARIA Attributes

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `aria-label` | Accessible name | `<button aria-label="Close dialog">×</button>` |
| `aria-labelledby` | References labeling element | `<div role="dialog" aria-labelledby="title">` |
| `aria-describedby` | References describing element | `<input aria-describedby="help-text">` |
| `aria-hidden` | Hide from screen readers | `<span aria-hidden="true">👍</span>` |
| `aria-expanded` | Collapsible state | `<button aria-expanded="false">Menu</button>` |
| `aria-selected` | Selection state | `<option aria-selected="true">Option 1</option>` |
| `aria-current` | Current item in set | `<a href="/home" aria-current="page">Home</a>` |
| `aria-live` | Dynamic content regions | `<div aria-live="polite">Status updates</div>` |

### Live Regions

```typescript
// Announcements for screen readers
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {statusMessage}
</div>

// For urgent announcements
<div aria-live="assertive" className="sr-only">
  {errorMessage}
</div>
```

## Keyboard Navigation

### Focus Management

```typescript
// Custom focus management hook
export function useFocusManagement(isOpen: boolean) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus first focusable element in dialog
      const firstFocusable = dialogRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      firstFocusable?.focus();
    } else {
      // Return focus to trigger
      triggerRef.current?.focus();
    }
  }, [isOpen]);

  return { dialogRef, triggerRef };
}
```

### Keyboard Patterns by Component Type

| Component | Keys | Behavior |
|-----------|------|----------|
| Button | Enter, Space | Activate button |
| Link | Enter | Follow link |
| Tabs | Arrow keys, Home, End | Navigate tabs |
| Menu | Arrow keys, Enter, Escape | Navigate and select |
| Dialog | Escape | Close dialog |
| Combobox | Arrow keys, Enter, Escape | Open, navigate, select |

### Roving Tabindex

For composite widgets (tabs, menus, toolbars):

```typescript
export function useRovingTabindex<T extends HTMLElement>(
  items: T[],
  defaultIndex = 0
) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  useEffect(() => {
    items.forEach((item, index) => {
      item.tabIndex = index === activeIndex ? 0 : -1;
    });
  }, [items, activeIndex]);

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((prev) => (prev + 1) % items.length);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(items.length - 1);
        break;
    }
  };

  return { activeIndex, handleKeyDown };
}
```

## Color and Contrast

### Requirements

- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text**: Minimum 3:1 contrast ratio (18pt+ or 14pt+ bold)
- **UI elements**: Minimum 3:1 contrast ratio for focus indicators, borders

### Testing Colors

```typescript
// Use our color contrast testing utility
import { ColorContrastTestUtils } from '@/lib/accessibility/a11y-test-utils';

test('Button has sufficient contrast', async () => {
  const { container } = render(<Button>Click me</Button>);
  const button = container.querySelector('button');
  
  const contrastUtils = new ColorContrastTestUtils();
  await contrastUtils.testContrastRatio(button, 4.5);
});
```

### Color-Independent Design

- Don't rely on color alone to convey information
- Use icons, text, or patterns alongside color
- Provide alternative text for color-coded content

```typescript
// ✅ Good - Multiple indicators
<Badge variant={isError ? 'destructive' : 'success'}>
  {isError ? '❌ Error' : '✅ Success'}
</Badge>

// ❌ Bad - Color only
<Badge variant={isError ? 'destructive' : 'success'}>
  Status
</Badge>
```

## Screen Reader Support

### Semantic HTML Structure

```html
<!-- ✅ Good - Semantic structure -->
<main>
  <header>
    <h1>Page Title</h1>
    <nav aria-label="Main navigation">...</nav>
  </header>
  <section>
    <h2>Section Title</h2>
    <article>...</article>
  </section>
  <aside>...</aside>
  <footer>...</footer>
</main>
```

### Screen Reader Testing

Test with actual screen readers:

1. **NVDA (Free)**: Download from nvaccess.org
2. **JAWS**: Industry standard (paid)
3. **VoiceOver**: Built into macOS
4. **Orca**: Built into Linux

Common screen reader commands:
- **Navigate by headings**: H (next), Shift+H (previous)
- **Navigate by landmarks**: D (next), Shift+D (previous)
- **Navigate by links**: K (next), Shift+K (previous)
- **Navigate by buttons**: B (next), Shift+B (previous)

## Testing Checklist

### Automated Tests

- [ ] axe-core tests pass in Storybook
- [ ] Jest accessibility tests pass
- [ ] ESLint jsx-a11y rules pass
- [ ] No accessibility violations in CI

### Manual Tests

#### Keyboard Navigation
- [ ] All interactive elements are focusable
- [ ] Focus order is logical
- [ ] Focus indicators are visible
- [ ] Keyboard shortcuts work as expected
- [ ] No keyboard traps (except modals)

#### Screen Reader
- [ ] All content is announced correctly
- [ ] Navigation landmarks work
- [ ] Form labels are associated properly
- [ ] Error messages are announced
- [ ] Dynamic content updates are announced

#### Visual
- [ ] Components work in high contrast mode
- [ ] Focus indicators meet contrast requirements
- [ ] Text meets contrast requirements
- [ ] Components work at 200% zoom
- [ ] Color is not the only indicator

#### Responsive
- [ ] Components work on mobile devices
- [ ] Touch targets are at least 44×44px
- [ ] Content reflows properly
- [ ] All functionality is available on mobile

## Tools and Resources

### Development Tools

- **axe DevTools**: Browser extension for accessibility testing
- **WAVE**: Web accessibility evaluation tool
- **Lighthouse**: Includes accessibility audit
- **Color Oracle**: Color blindness simulator
- **Stark**: Figma/Sketch accessibility plugin

### Testing Libraries

```typescript
// Our accessibility testing utilities
import {
  renderWithA11y,
  testComponentAccessibility,
  KeyboardNavigationTester,
  ScreenReaderTestUtils,
  ColorContrastTestUtils,
  AccessibilityTestSuite
} from '@/lib/accessibility/a11y-test-utils';

// Keyboard testing
const keyboardTester = new KeyboardNavigationTester();
await keyboardTester.testTabNavigation(container);

// Screen reader testing
const screenReaderUtils = new ScreenReaderTestUtils();
screenReaderUtils.testAccessibleName(element, 'Expected Name');

// Complete test suite
const testSuite = new AccessibilityTestSuite(container);
await testSuite.runFullSuite();
```

### External Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM Resources](https://webaim.org/resources/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

## Contributing

When contributing to the MoRAG UI library:

1. **Follow this guide** for all accessibility requirements
2. **Run automated tests** before submitting PRs
3. **Test manually** with keyboard and screen reader
4. **Update documentation** for new accessibility patterns
5. **Ask for review** from accessibility team members

## Support

For accessibility questions or issues:

- Create an issue in the repository
- Contact the accessibility team
- Join the #accessibility Slack channel
- Review existing accessibility documentation

Remember: **Accessibility is not optional** - it's a fundamental requirement for all components in the MoRAG UI library.