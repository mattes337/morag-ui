# Accessibility Testing Checklist

Use this checklist to ensure your components meet WCAG 2.1 AA accessibility standards before submitting for review.

## Pre-Development

- [ ] Review similar components in established design systems (Radix UI, Ariakit, etc.)
- [ ] Identify the appropriate ARIA pattern from [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [ ] Plan keyboard navigation behavior
- [ ] Consider screen reader announcements
- [ ] Design focus management strategy

## Development

### Semantic HTML

- [ ] Use appropriate semantic HTML elements (`button`, `input`, `nav`, etc.)
- [ ] Only use `div` and `span` when no semantic alternative exists
- [ ] Include proper heading hierarchy (`h1` → `h2` → `h3`)
- [ ] Use list elements (`ul`, `ol`, `dl`) for grouped content
- [ ] Include landmark regions (`main`, `nav`, `aside`, `section`)

### ARIA Implementation

- [ ] Add `role` attribute only when semantic HTML isn't sufficient
- [ ] Include `aria-label` for elements without visible text
- [ ] Use `aria-labelledby` when referencing other elements
- [ ] Add `aria-describedby` for additional context
- [ ] Hide decorative elements with `aria-hidden="true"`
- [ ] Use `aria-live` regions for dynamic content
- [ ] Implement appropriate ARIA states (`aria-expanded`, `aria-selected`, etc.)

### Keyboard Navigation

- [ ] All interactive elements are focusable (tabindex ≥ 0)
- [ ] Focus order is logical and matches visual order
- [ ] No positive tabindex values (use 0 or -1 only)
- [ ] Implement focus trapping for modals/dialogs
- [ ] Support Enter and Space for button activation
- [ ] Support Enter for link activation
- [ ] Implement arrow key navigation for composite widgets
- [ ] Support Home/End keys where appropriate
- [ ] Support Escape key to close overlays
- [ ] Provide skip links for main content

### Focus Management

- [ ] Focus indicators are visible and high contrast
- [ ] Focus returns to appropriate element after interactions
- [ ] Focus doesn't get trapped unintentionally
- [ ] Initial focus is set appropriately in modals
- [ ] Focus moves logically through form fields
- [ ] Hidden elements don't receive focus

### Color and Contrast

- [ ] Text meets 4.5:1 contrast ratio (3:1 for large text)
- [ ] Focus indicators meet 3:1 contrast ratio
- [ ] UI components meet 3:1 contrast ratio
- [ ] Information isn't conveyed by color alone
- [ ] Color patterns work for color-blind users
- [ ] Components work in high contrast mode

### Form Accessibility

- [ ] All form controls have associated labels
- [ ] Required fields are marked with `aria-required="true"`
- [ ] Error messages use `role="alert"` or `aria-live="assertive"`
- [ ] Field descriptions are linked with `aria-describedby`
- [ ] Invalid fields are marked with `aria-invalid="true"`
- [ ] Fieldsets group related form controls
- [ ] Form submission provides clear feedback

## Testing

### Automated Testing

- [ ] axe-core tests pass in Jest
- [ ] Storybook accessibility addon shows no violations
- [ ] ESLint jsx-a11y rules pass
- [ ] Custom accessibility tests are written and passing

```typescript
// Example test structure
describe('ComponentName Accessibility', () => {
  test('meets WCAG 2.1 AA standards', async () => {
    await testComponentAccessibility(<ComponentName />);
  });

  test('keyboard navigation works correctly', async () => {
    const tester = new KeyboardNavigationTester();
    const { container } = render(<ComponentName />);
    await tester.testTabNavigation(container);
  });

  test('screen reader announcements are correct', () => {
    const screenReader = new ScreenReaderTestUtils();
    const { container } = render(<ComponentName />);
    const element = container.querySelector('[role="button"]');
    screenReader.testAccessibleName(element, 'Expected Name');
  });
});
```

### Manual Testing - Keyboard Only

- [ ] Tab through all interactive elements
- [ ] Verify tab order matches visual layout
- [ ] Test all keyboard shortcuts and interactions
- [ ] Ensure no elements are skipped or unreachable
- [ ] Verify disabled elements aren't focusable
- [ ] Test with both Tab and Shift+Tab
- [ ] Verify focus indicators are always visible

### Manual Testing - Screen Reader

Test with at least one screen reader (NVDA, JAWS, or VoiceOver):

- [ ] All content is announced correctly
- [ ] Interactive elements have clear names/descriptions
- [ ] Roles and states are announced properly
- [ ] Navigation landmarks work (`H`, `K`, `B`, `D` keys)
- [ ] Dynamic content updates are announced
- [ ] Error messages are announced immediately
- [ ] Loading states are communicated clearly

### Manual Testing - Visual

- [ ] Component works at 200% browser zoom
- [ ] Text remains readable at high zoom levels
- [ ] Interactive elements remain usable at high zoom
- [ ] Component adapts properly to different screen sizes
- [ ] Touch targets are at least 44×44 pixels on mobile
- [ ] Focus indicators work in light and dark themes

### Manual Testing - Assistive Technology

- [ ] Test with Windows Magnifier (or similar)
- [ ] Test with voice control software
- [ ] Test with switch navigation (if applicable)
- [ ] Verify with Windows High Contrast mode
- [ ] Test with reduced motion settings

## Component-Specific Checklists

### Button Component

- [ ] Uses `<button>` element or has `role="button"`
- [ ] Has accessible name (text content or `aria-label`)
- [ ] Disabled state uses `disabled` attribute and `aria-disabled`
- [ ] Loading state is announced to screen readers
- [ ] Icons are hidden from screen readers (`aria-hidden="true"`)
- [ ] Responds to Enter and Space keys
- [ ] Has visible focus indicator

### Form Input Component

- [ ] Associated with label via `htmlFor`/`id` or wrapping
- [ ] Required fields have `aria-required="true"`
- [ ] Error states use `aria-invalid` and `role="alert"`
- [ ] Help text linked with `aria-describedby`
- [ ] Placeholder text doesn't replace labels
- [ ] Autocomplete attributes are appropriate
- [ ] Input type matches expected data format

### Dialog/Modal Component

- [ ] Uses `role="dialog"` or `role="alertdialog"`
- [ ] Has `aria-labelledby` referencing title
- [ ] Has `aria-describedby` referencing description
- [ ] Focus moves to dialog when opened
- [ ] Focus is trapped within dialog
- [ ] Focus returns to trigger when closed
- [ ] Closes on Escape key press
- [ ] Background is properly hidden from screen readers

### Navigation Component

- [ ] Uses `<nav>` element or `role="navigation"`
- [ ] Has `aria-label` to distinguish multiple navs
- [ ] Current page indicated with `aria-current="page"`
- [ ] Keyboard navigation works with arrow keys
- [ ] Submenus are properly labeled and controlled
- [ ] Mobile menu states are announced correctly

### Table Component

- [ ] Uses proper table markup (`table`, `thead`, `tbody`, `tr`, `th`, `td`)
- [ ] Headers have `scope` attributes where needed
- [ ] Complex tables use `headers` attribute on cells
- [ ] Table has caption or `aria-label`
- [ ] Sortable headers indicate sort state
- [ ] Row/column headers are properly identified
- [ ] Data tables aren't used for layout

### Tabs Component

- [ ] Tab list has `role="tablist"`
- [ ] Tabs have `role="tab"` and `aria-selected`
- [ ] Tab panels have `role="tabpanel"`
- [ ] Panels are linked to tabs via `aria-labelledby`
- [ ] Arrow keys navigate between tabs
- [ ] Only active tab is in tab sequence
- [ ] Space/Enter activates focused tab

## Documentation

- [ ] Component has accessibility documentation
- [ ] Storybook stories demonstrate accessible usage
- [ ] Props related to accessibility are documented
- [ ] Keyboard shortcuts are documented
- [ ] ARIA patterns are explained
- [ ] Examples show proper labeling techniques

## Code Review Checklist

For reviewers to verify accessibility implementation:

### Code Structure
- [ ] Semantic HTML elements used appropriately
- [ ] ARIA attributes are necessary and correct
- [ ] No redundant ARIA roles on semantic elements
- [ ] Event handlers include keyboard support
- [ ] Focus management is implemented correctly

### TypeScript/Props
- [ ] Accessibility props are properly typed
- [ ] Required accessibility props are marked as required
- [ ] Prop names follow ARIA naming conventions
- [ ] Default values support accessibility
- [ ] Polymorphic props maintain accessibility

### Styling
- [ ] Focus indicators are implemented
- [ ] Color contrast meets requirements
- [ ] Responsive design maintains accessibility
- [ ] High contrast mode is supported
- [ ] Reduced motion preferences are respected

### Testing
- [ ] Automated accessibility tests are present
- [ ] Tests cover keyboard interactions
- [ ] Tests verify ARIA attributes
- [ ] Edge cases are tested
- [ ] Manual testing has been performed

## Common Mistakes to Avoid

- ❌ Using `div` or `span` instead of semantic elements
- ❌ Missing labels on form controls
- ❌ Using placeholder text as labels
- ❌ Positive tabindex values
- ❌ No focus indicators or poor contrast
- ❌ Not managing focus in dynamic content
- ❌ Conveying information through color alone
- ❌ Auto-playing media without controls
- ❌ Not providing alternative text for images
- ❌ Breaking keyboard navigation patterns

## Resources for Testing

### Browser Extensions
- **axe DevTools**: Free accessibility testing
- **WAVE**: Visual accessibility testing
- **Lighthouse**: Include accessibility audit
- **Accessibility Insights**: Microsoft's testing tool

### Screen Readers
- **NVDA**: Free Windows screen reader
- **JAWS**: Professional Windows screen reader
- **VoiceOver**: Built into macOS
- **Orca**: Built into Linux

### Testing Tools
- **Keyboard**: Unplug your mouse and navigate
- **High Contrast**: Windows High Contrast mode
- **Zoom**: Test at 200%+ browser zoom
- **Mobile**: Test on actual devices

## Sign-off

Before marking a component as complete:

- [ ] **Developer**: All automated tests pass
- [ ] **Developer**: Manual keyboard testing completed
- [ ] **Designer**: Visual accessibility review completed  
- [ ] **QA**: Screen reader testing completed
- [ ] **Accessibility Champion**: Final accessibility review
- [ ] **Documentation**: Accessibility guide updated

---

**Remember**: Accessibility is not a checklist to complete, but an ongoing commitment to inclusive design. When in doubt, test with real users who rely on assistive technologies.