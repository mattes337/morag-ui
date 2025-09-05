import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('should render checkbox without label', () => {
    render(<Checkbox data-testid="checkbox" />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('should render checkbox with label', () => {
    render(<Checkbox label="Accept terms" data-testid="checkbox" />);
    
    const checkbox = screen.getByRole('checkbox');
    const label = screen.getByText('Accept terms');
    
    expect(checkbox).toBeInTheDocument();
    expect(label).toBeInTheDocument();
  });

  it('should render checkbox with description', () => {
    render(
      <Checkbox 
        label="Accept terms" 
        description="You agree to our terms and conditions"
        data-testid="checkbox" 
      />
    );
    
    expect(screen.getByText('Accept terms')).toBeInTheDocument();
    expect(screen.getByText('You agree to our terms and conditions')).toBeInTheDocument();
  });

  it('should render checkbox with error message', () => {
    render(
      <Checkbox 
        label="Accept terms" 
        error="This field is required"
        data-testid="checkbox" 
      />
    );
    
    expect(screen.getByText('Accept terms')).toBeInTheDocument();
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should handle checked state', () => {
    render(<Checkbox checked={true} data-testid="checkbox" />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('should handle unchecked state', () => {
    render(<Checkbox checked={false} data-testid="checkbox" />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('should handle indeterminate state', () => {
    render(<Checkbox checked="indeterminate" data-testid="checkbox" />);
    
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.indeterminate).toBe(true);
  });

  it('should handle indeterminate prop', () => {
    render(<Checkbox indeterminate={true} data-testid="checkbox" />);
    
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.indeterminate).toBe(true);
  });

  it('should handle user interactions', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    
    render(<Checkbox onCheckedChange={handleChange} data-testid="checkbox" />);
    
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('should handle label click to toggle checkbox', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    
    render(
      <Checkbox 
        label="Click me" 
        onCheckedChange={handleChange} 
        data-testid="checkbox" 
      />
    );
    
    const label = screen.getByText('Click me');
    await user.click(label);
    
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('should apply default size styles', () => {
    render(<Checkbox data-testid="checkbox" />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveClass('h-4', 'w-4');
  });

  it('should apply small size styles', () => {
    render(<Checkbox size="sm" data-testid="checkbox" />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveClass('h-3', 'w-3');
  });

  it('should apply large size styles', () => {
    render(<Checkbox size="lg" data-testid="checkbox" />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveClass('h-5', 'w-5');
  });

  it('should apply default variant styles', () => {
    render(<Checkbox data-testid="checkbox" />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveClass('border-primary');
  });

  it('should apply destructive variant styles', () => {
    render(<Checkbox variant="destructive" data-testid="checkbox" />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveClass('border-destructive');
  });

  it('should apply success variant styles', () => {
    render(<Checkbox variant="success" data-testid="checkbox" />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveClass('border-green-600');
  });

  it('should apply destructive variant when error is present', () => {
    render(
      <Checkbox 
        variant="success" 
        error="Error message" 
        data-testid="checkbox" 
      />
    );
    
    const checkbox = screen.getByRole('checkbox');
    // Error should override the success variant
    expect(checkbox).toHaveClass('border-destructive');
  });

  it('should apply error styling to label when error is present', () => {
    render(
      <Checkbox 
        label="Test label" 
        error="Error message" 
        data-testid="checkbox" 
      />
    );
    
    const label = screen.getByText('Test label');
    expect(label).toHaveClass('text-destructive');
  });

  it('should apply error styling to description when error is present', () => {
    render(
      <Checkbox 
        label="Test label"
        description="Test description"
        error="Error message" 
        data-testid="checkbox" 
      />
    );
    
    const description = screen.getByText('Test description');
    expect(description).toHaveClass('text-destructive/80');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Checkbox disabled data-testid="checkbox" />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
  });

  it('should apply disabled styles', () => {
    render(<Checkbox disabled data-testid="checkbox" />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
  });

  it('should apply custom className', () => {
    render(<Checkbox className="custom-checkbox-class" data-testid="checkbox" />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveClass('custom-checkbox-class');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    
    render(<Checkbox ref={ref} />);
    
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('should generate unique id when id is not provided', () => {
    render(
      <>
        <Checkbox label="First" data-testid="checkbox-1" />
        <Checkbox label="Second" data-testid="checkbox-2" />
      </>
    );
    
    const checkbox1 = screen.getByTestId('checkbox-1');
    const checkbox2 = screen.getByTestId('checkbox-2');
    
    expect(checkbox1.id).toBeTruthy();
    expect(checkbox2.id).toBeTruthy();
    expect(checkbox1.id).not.toBe(checkbox2.id);
  });

  it('should use provided id', () => {
    render(<Checkbox id="custom-id" label="Test label" />);
    
    const checkbox = screen.getByRole('checkbox');
    const label = screen.getByText('Test label');
    
    expect(checkbox).toHaveAttribute('id', 'custom-id');
    expect(label).toHaveAttribute('for', 'custom-id');
  });

  it('should have proper accessibility attributes', () => {
    render(
      <Checkbox 
        label="Test checkbox" 
        description="Helper text"
        aria-describedby="helper-text"
        data-testid="checkbox" 
      />
    );
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-describedby', 'helper-text');
  });

  it('should support keyboard navigation', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    
    render(<Checkbox onCheckedChange={handleChange} data-testid="checkbox" />);
    
    const checkbox = screen.getByRole('checkbox');
    
    // Focus the checkbox
    await user.tab();
    expect(checkbox).toHaveFocus();
    
    // Press space to toggle
    await user.keyboard(' ');
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('should display check icon when checked', () => {
    render(<Checkbox checked={true} data-testid="checkbox" />);
    
    const checkbox = screen.getByRole('checkbox');
    const icon = checkbox.querySelector('svg');
    
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('fill-current');
  });

  it('should apply proper icon size based on checkbox size', () => {
    const { rerender } = render(<Checkbox size="sm" checked={true} data-testid="checkbox" />);
    
    let checkbox = screen.getByRole('checkbox');
    let icon = checkbox.querySelector('svg');
    expect(icon).toHaveClass('h-2', 'w-2');
    
    rerender(<Checkbox size="default" checked={true} data-testid="checkbox" />);
    checkbox = screen.getByRole('checkbox');
    icon = checkbox.querySelector('svg');
    expect(icon).toHaveClass('h-3', 'w-3');
    
    rerender(<Checkbox size="lg" checked={true} data-testid="checkbox" />);
    checkbox = screen.getByRole('checkbox');
    icon = checkbox.querySelector('svg');
    expect(icon).toHaveClass('h-4', 'w-4');
  });

  it('should handle focus and blur events', () => {
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();
    
    render(
      <Checkbox 
        onFocus={handleFocus} 
        onBlur={handleBlur} 
        data-testid="checkbox" 
      />
    );
    
    const checkbox = screen.getByRole('checkbox');
    
    fireEvent.focus(checkbox);
    expect(handleFocus).toHaveBeenCalled();
    
    fireEvent.blur(checkbox);
    expect(handleBlur).toHaveBeenCalled();
  });

  it('should have focus-visible styles', () => {
    render(<Checkbox data-testid="checkbox" />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveClass(
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-ring',
      'focus-visible:ring-offset-2'
    );
  });

  it('should render without wrapper when no label, description, or error', () => {
    render(<Checkbox data-testid="checkbox" />);
    
    const checkbox = screen.getByRole('checkbox');
    // Should not have wrapper div with space-x-2
    expect(checkbox.closest('.space-x-2')).not.toBeInTheDocument();
  });

  it('should render with wrapper when label is provided', () => {
    render(<Checkbox label="Test label" data-testid="checkbox" />);
    
    const checkbox = screen.getByRole('checkbox');
    // Should have wrapper div with space-x-2
    expect(checkbox.closest('.space-x-2')).toBeInTheDocument();
  });

  it('should support all checkbox attributes', () => {
    render(
      <Checkbox
        data-testid="checkbox"
        name="test-checkbox"
        value="test-value"
        required
        aria-label="Test checkbox"
      />
    );
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('name', 'test-checkbox');
    expect(checkbox).toHaveAttribute('value', 'test-value');
    expect(checkbox).toHaveAttribute('required');
    expect(checkbox).toHaveAttribute('aria-label', 'Test checkbox');
  });
});