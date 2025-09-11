import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './input';

describe('Input', () => {
  it('should render input element', () => {
    render(<Input data-testid="input" />);
    
    const input = screen.getByTestId('input');
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe('INPUT');
    // When no type is specified, browsers default to text behavior but may not show type="text" attribute
    expect(['text', null]).toContain(input.getAttribute('type'));
  });

  it('should handle different input types', () => {
    const { rerender } = render(<Input type="email" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'email');
    
    rerender(<Input type="password" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'password');
    
    rerender(<Input type="number" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'number');
  });

  it('should display placeholder text', () => {
    render(<Input placeholder="Enter your name" data-testid="input" />);
    
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('placeholder', 'Enter your name');
  });

  it('should handle user input', async () => {
    const user = userEvent.setup();
    
    render(<Input data-testid="input" />);
    
    const input = screen.getByTestId('input');
    await user.type(input, 'Hello World');
    
    expect(input).toHaveValue('Hello World');
  });

  it('should handle controlled input', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    
    render(
      <Input 
        value="initial value" 
        onChange={handleChange} 
        data-testid="input" 
      />
    );
    
    const input = screen.getByTestId('input');
    expect(input).toHaveValue('initial value');
    
    await user.clear(input);
    await user.type(input, 'new value');
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('should apply default size styles', () => {
    render(<Input data-testid="input" />);
    
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('h-10', 'px-3', 'py-2');
  });

  it('should apply small size styles', () => {
    render(<Input size="sm" data-testid="input" />);
    
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('h-9', 'px-3', 'py-2', 'text-xs');
  });

  it('should apply large size styles', () => {
    render(<Input size="lg" data-testid="input" />);
    
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('h-11', 'px-4', 'py-3');
  });

  it('should apply default variant styles', () => {
    render(<Input data-testid="input" />);
    
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('border-input');
    expect(input).not.toHaveClass('border-destructive', 'border-green-500');
  });

  it('should apply error variant styles', () => {
    render(<Input variant="error" data-testid="input" />);
    
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('border-destructive', 'focus-visible:ring-destructive');
  });

  it('should apply success variant styles', () => {
    render(<Input variant="success" data-testid="input" />);
    
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('border-green-500', 'focus-visible:ring-green-500');
  });

  it('should override variant with error when error prop is provided', () => {
    render(<Input variant="success" error="This field is required" data-testid="input" />);
    
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('border-destructive', 'focus-visible:ring-destructive');
    expect(input).not.toHaveClass('border-green-500');
  });

  it('should display error message', () => {
    render(<Input error="This field is required" data-testid="input" />);
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByText('This field is required')).toHaveClass('text-destructive');
  });

  it('should display helper text', () => {
    render(<Input helperText="Enter at least 8 characters" data-testid="input" />);
    
    expect(screen.getByText('Enter at least 8 characters')).toBeInTheDocument();
    expect(screen.getByText('Enter at least 8 characters')).toHaveClass('text-muted-foreground');
  });

  it('should prioritize error message over helper text', () => {
    render(
      <Input 
        error="This field is required" 
        helperText="Enter at least 8 characters"
        data-testid="input" 
      />
    );
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.queryByText('Enter at least 8 characters')).not.toBeInTheDocument();
  });

  it('should render with left element', () => {
    const LeftIcon = () => <span data-testid="left-icon">@</span>;
    
    render(
      <Input 
        leftElement={<LeftIcon />}
        placeholder="username"
        data-testid="input" 
      />
    );
    
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('input')).toHaveClass('pl-10');
  });

  it('should render with right element', () => {
    const RightIcon = () => <span data-testid="right-icon"><span role="img" aria-label="magnifying glass">🔍</span></span>;
    
    render(
      <Input 
        rightElement={<RightIcon />}
        placeholder="Search..."
        data-testid="input" 
      />
    );
    
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    expect(screen.getByTestId('input')).toHaveClass('pr-10');
  });

  it('should render with both left and right elements', () => {
    const LeftIcon = () => <span data-testid="left-icon">@</span>;
    const RightIcon = () => <span data-testid="right-icon">✓</span>;
    
    render(
      <Input 
        leftElement={<LeftIcon />}
        rightElement={<RightIcon />}
        data-testid="input" 
      />
    );
    
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    expect(screen.getByTestId('input')).toHaveClass('pl-10', 'pr-10');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled data-testid="input" />);
    
    const input = screen.getByTestId('input');
    expect(input).toBeDisabled();
  });

  it('should apply disabled styles', () => {
    render(<Input disabled data-testid="input" />);
    
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
  });

  it('should apply custom className', () => {
    render(<Input className="custom-input-class" data-testid="input" />);
    
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('custom-input-class');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();
    
    render(<Input ref={ref} />);
    
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('should have base input styling classes', () => {
    render(<Input data-testid="input" />);
    
    const input = screen.getByTestId('input');
    expect(input).toHaveClass(
      'flex',
      'w-full',
      'rounded-md',
      'border',
      'bg-background',
      'text-sm',
      'ring-offset-background',
      'placeholder:text-muted-foreground',
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-ring',
      'focus-visible:ring-offset-2'
    );
  });

  it('should handle focus and blur events', async () => {
    const user = userEvent.setup();
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();
    
    render(
      <Input 
        onFocus={handleFocus} 
        onBlur={handleBlur} 
        data-testid="input" 
      />
    );
    
    const input = screen.getByTestId('input');
    
    await user.click(input);
    expect(handleFocus).toHaveBeenCalled();
    
    await user.tab();
    expect(handleBlur).toHaveBeenCalled();
  });

  it('should support keyboard navigation', async () => {
    const user = userEvent.setup();
    
    render(<Input data-testid="input" />);
    
    const input = screen.getByTestId('input');
    
    await user.tab();
    expect(input).toHaveFocus();
  });

  it('should support all standard HTML input attributes', () => {
    render(
      <Input
        data-testid="input"
        name="test-input"
        id="test-id"
        required
        readOnly
        maxLength={100}
        minLength={5}
        pattern="[a-zA-Z]+"
        aria-label="Test input"
        aria-describedby="helper-text"
      />
    );
    
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('name', 'test-input');
    expect(input).toHaveAttribute('id', 'test-id');
    expect(input).toHaveAttribute('required');
    expect(input).toHaveAttribute('readOnly');
    expect(input).toHaveAttribute('maxLength', '100');
    expect(input).toHaveAttribute('minLength', '5');
    expect(input).toHaveAttribute('pattern', '[a-zA-Z]+');
    expect(input).toHaveAttribute('aria-label', 'Test input');
    expect(input).toHaveAttribute('aria-describedby', 'helper-text');
  });

  it('should handle file input type with proper styling', () => {
    render(<Input type="file" data-testid="input" />);
    
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('type', 'file');
    expect(input).toHaveClass(
      'file:border-0',
      'file:bg-transparent', 
      'file:text-sm',
      'file:font-medium'
    );
  });

  it('should wrap input in container div', () => {
    const { container } = render(<Input data-testid="input" />);
    
    const wrapper = container.querySelector('.w-full');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toContainElement(screen.getByTestId('input'));
  });

  it('should position left and right elements correctly', () => {
    const LeftIcon = () => <span data-testid="left-icon">L</span>;
    const RightIcon = () => <span data-testid="right-icon">R</span>;
    
    render(
      <Input 
        leftElement={<LeftIcon />}
        rightElement={<RightIcon />}
        data-testid="input" 
      />
    );
    
    const leftElement = screen.getByTestId('left-icon').parentElement;
    const rightElement = screen.getByTestId('right-icon').parentElement;
    
    expect(leftElement).toHaveClass('absolute', 'left-3', 'top-1/2', '-translate-y-1/2');
    expect(rightElement).toHaveClass('absolute', 'right-3', 'top-1/2', '-translate-y-1/2');
  });

  it('should handle onChange event correctly', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    
    render(<Input onChange={handleChange} data-testid="input" />);
    
    const input = screen.getByTestId('input');
    await user.type(input, 'test');
    
    expect(handleChange).toHaveBeenCalledTimes(4); // Once per character
  });

  it('should handle onKeyDown event correctly', async () => {
    const user = userEvent.setup();
    const handleKeyDown = jest.fn();
    
    render(<Input onKeyDown={handleKeyDown} data-testid="input" />);
    
    const input = screen.getByTestId('input');
    await user.type(input, 'a');
    
    expect(handleKeyDown).toHaveBeenCalled();
  });

  it('should handle enter key press', async () => {
    const user = userEvent.setup();
    const handleKeyDown = jest.fn();
    
    render(<Input onKeyDown={handleKeyDown} data-testid="input" />);
    
    const input = screen.getByTestId('input');
    await user.type(input, '{enter}');
    
    expect(handleKeyDown).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'Enter' })
    );
  });
});