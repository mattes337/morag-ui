import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from './Switch';

describe('Switch', () => {
  it('should render switch without label', () => {
    render(<Switch data-testid="switch" />);
    
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeInTheDocument();
    expect(switchElement).not.toBeChecked();
  });

  it('should render switch with label', () => {
    render(<Switch label="Enable notifications" data-testid="switch" />);
    
    const switchElement = screen.getByRole('switch');
    const label = screen.getByText('Enable notifications');
    
    expect(switchElement).toBeInTheDocument();
    expect(label).toBeInTheDocument();
  });

  it('should render switch with description', () => {
    render(
      <Switch 
        label="Dark mode" 
        description="Switch between light and dark themes"
        data-testid="switch" 
      />
    );
    
    expect(screen.getByText('Dark mode')).toBeInTheDocument();
    expect(screen.getByText('Switch between light and dark themes')).toBeInTheDocument();
  });

  it('should render switch with error message', () => {
    render(
      <Switch 
        label="Required setting" 
        error="This setting must be enabled"
        data-testid="switch" 
      />
    );
    
    expect(screen.getByText('Required setting')).toBeInTheDocument();
    expect(screen.getByText('This setting must be enabled')).toBeInTheDocument();
  });

  it('should handle checked state', () => {
    render(<Switch checked={true} data-testid="switch" />);
    
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeChecked();
  });

  it('should handle unchecked state', () => {
    render(<Switch checked={false} data-testid="switch" />);
    
    const switchElement = screen.getByRole('switch');
    expect(switchElement).not.toBeChecked();
  });

  it('should handle user interactions', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    
    render(<Switch onCheckedChange={handleChange} data-testid="switch" />);
    
    const switchElement = screen.getByRole('switch');
    await user.click(switchElement);
    
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('should handle label click to toggle switch', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    
    render(
      <Switch 
        label="Click me" 
        onCheckedChange={handleChange} 
        data-testid="switch" 
      />
    );
    
    const label = screen.getByText('Click me');
    await user.click(label);
    
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('should apply default size styles', () => {
    render(<Switch data-testid="switch" />);
    
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveClass('h-6', 'w-11');
  });

  it('should apply small size styles', () => {
    render(<Switch size="sm" data-testid="switch" />);
    
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveClass('h-5', 'w-9');
  });

  it('should apply large size styles', () => {
    render(<Switch size="lg" data-testid="switch" />);
    
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveClass('h-7', 'w-13');
  });

  it('should apply default variant styles', () => {
    render(<Switch data-testid="switch" />);
    
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveClass('data-[state=checked]:bg-primary');
  });

  it('should apply success variant styles', () => {
    render(<Switch variant="success" data-testid="switch" />);
    
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveClass('data-[state=checked]:bg-green-600');
  });

  it('should apply warning variant styles', () => {
    render(<Switch variant="warning" data-testid="switch" />);
    
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveClass('data-[state=checked]:bg-yellow-600');
  });

  it('should apply destructive variant styles', () => {
    render(<Switch variant="destructive" data-testid="switch" />);
    
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveClass('data-[state=checked]:bg-destructive');
  });

  it('should override variant with destructive when error is present', () => {
    render(
      <Switch 
        variant="success" 
        error="Error message" 
        data-testid="switch" 
      />
    );
    
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveClass('data-[state=checked]:bg-destructive');
  });

  it('should apply error styling to label when error is present', () => {
    render(
      <Switch 
        label="Test label" 
        error="Error message" 
        data-testid="switch" 
      />
    );
    
    const label = screen.getByText('Test label');
    expect(label).toHaveClass('text-destructive');
  });

  it('should apply error styling to description when error is present', () => {
    render(
      <Switch 
        label="Test label"
        description="Test description"
        error="Error message" 
        data-testid="switch" 
      />
    );
    
    const description = screen.getByText('Test description');
    expect(description).toHaveClass('text-destructive/80');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Switch disabled data-testid="switch" />);
    
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeDisabled();
  });

  it('should apply disabled styles', () => {
    render(<Switch disabled data-testid="switch" />);
    
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
  });

  it('should apply custom className', () => {
    render(<Switch className="custom-switch-class" data-testid="switch" />);
    
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveClass('custom-switch-class');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    
    render(<Switch ref={ref} />);
    
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('should generate unique id when id is not provided', () => {
    render(
      <>
        <Switch label="First" data-testid="switch-1" />
        <Switch label="Second" data-testid="switch-2" />
      </>
    );
    
    const switch1 = screen.getByTestId('switch-1');
    const switch2 = screen.getByTestId('switch-2');
    
    expect(switch1.id).toBeTruthy();
    expect(switch2.id).toBeTruthy();
    expect(switch1.id).not.toBe(switch2.id);
  });

  it('should use provided id', () => {
    render(<Switch id="custom-id" label="Test label" />);
    
    const switchElement = screen.getByRole('switch');
    const label = screen.getByText('Test label');
    
    expect(switchElement).toHaveAttribute('id', 'custom-id');
    expect(label).toHaveAttribute('for', 'custom-id');
  });

  it('should have proper base styling classes', () => {
    render(<Switch data-testid="switch" />);
    
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveClass(
      'peer',
      'inline-flex',
      'shrink-0',
      'cursor-pointer',
      'items-center',
      'rounded-full',
      'border-2',
      'border-transparent',
      'transition-colors',
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-ring',
      'focus-visible:ring-offset-2',
      'focus-visible:ring-offset-background'
    );
  });

  it('should have proper thumb styling', () => {
    const { container } = render(<Switch data-testid="switch" />);
    
    const thumb = container.querySelector('[data-radix-collection-item] > span');
    expect(thumb).toHaveClass(
      'pointer-events-none',
      'block',
      'rounded-full',
      'bg-background',
      'shadow-lg',
      'ring-0',
      'transition-transform',
      'data-[state=unchecked]:translate-x-0'
    );
  });

  it('should apply correct thumb size based on switch size', () => {
    const { container: defaultContainer } = render(<Switch size="default" />);
    const defaultThumb = defaultContainer.querySelector('[data-radix-collection-item] > span');
    expect(defaultThumb).toHaveClass('h-5', 'w-5', 'data-[state=checked]:translate-x-5');

    const { container: smallContainer } = render(<Switch size="sm" />);
    const smallThumb = smallContainer.querySelector('[data-radix-collection-item] > span');
    expect(smallThumb).toHaveClass('h-4', 'w-4', 'data-[state=checked]:translate-x-4');

    const { container: largeContainer } = render(<Switch size="lg" />);
    const largeThumb = largeContainer.querySelector('[data-radix-collection-item] > span');
    expect(largeThumb).toHaveClass('h-6', 'w-6', 'data-[state=checked]:translate-x-6');
  });

  it('should support keyboard navigation', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    
    render(<Switch onCheckedChange={handleChange} data-testid="switch" />);
    
    const switchElement = screen.getByRole('switch');
    
    // Focus the switch
    await user.tab();
    expect(switchElement).toHaveFocus();
    
    // Press space to toggle
    await user.keyboard(' ');
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('should prioritize error message over helper text', () => {
    render(
      <Switch 
        error="This field is required" 
        description="Helper text"
        data-testid="switch" 
      />
    );
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByText('Helper text')).toBeInTheDocument(); // Both should show
  });

  it('should render without wrapper when no label, description, or error', () => {
    const { container } = render(<Switch data-testid="switch" />);
    
    const switchElement = screen.getByRole('switch');
    // Should not have wrapper div with space-x-3
    expect(switchElement.closest('.space-x-3')).not.toBeInTheDocument();
  });

  it('should render with wrapper when label is provided', () => {
    const { container } = render(<Switch label="Test label" data-testid="switch" />);
    
    const switchElement = screen.getByRole('switch');
    // Should have wrapper div with space-x-3
    expect(switchElement.closest('.space-x-3')).toBeInTheDocument();
  });

  it('should support all switch attributes', () => {
    render(
      <Switch
        data-testid="switch"
        name="test-switch"
        value="test-value"
        required
        aria-label="Test switch"
        aria-describedby="helper-text"
      />
    );
    
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAttribute('name', 'test-switch');
    expect(switchElement).toHaveAttribute('value', 'test-value');
    expect(switchElement).toHaveAttribute('aria-label', 'Test switch');
    expect(switchElement).toHaveAttribute('aria-describedby', 'helper-text');
  });

  it('should handle controlled state', async () => {
    const user = userEvent.setup();
    const ControlledSwitch = () => {
      const [checked, setChecked] = React.useState(false);
      
      return (
        <Switch 
          checked={checked}
          onCheckedChange={setChecked}
          label={checked ? 'Enabled' : 'Disabled'}
          data-testid="switch"
        />
      );
    };
    
    render(<ControlledSwitch />);
    
    const switchElement = screen.getByRole('switch');
    expect(switchElement).not.toBeChecked();
    expect(screen.getByText('Disabled')).toBeInTheDocument();
    
    await user.click(switchElement);
    
    expect(switchElement).toBeChecked();
    expect(screen.getByText('Enabled')).toBeInTheDocument();
  });
});