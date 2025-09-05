import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('should render correctly', () => {
    render(<Textarea placeholder="Enter text" data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute('placeholder', 'Enter text');
  });

  it('should apply default size styles', () => {
    render(<Textarea data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveClass('min-h-[60px]');
  });

  it('should apply small size styles', () => {
    render(<Textarea size="sm" data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveClass('min-h-[50px]', 'text-xs');
  });

  it('should apply large size styles', () => {
    render(<Textarea size="lg" data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveClass('min-h-[80px]', 'text-base');
  });

  it('should apply error variant styles', () => {
    render(<Textarea variant="error" data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveClass('border-destructive', 'focus-visible:ring-destructive');
  });

  it('should apply success variant styles', () => {
    render(<Textarea variant="success" data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveClass('border-green-500', 'focus-visible:ring-green-500');
  });

  it('should handle value changes', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(
      <Textarea 
        data-testid="textarea"
        onChange={handleChange}
        value=""
      />
    );
    
    const textarea = screen.getByTestId('textarea');
    await user.type(textarea, 'Hello world');
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('should display error message', () => {
    render(<Textarea error="This field is required" data-testid="textarea" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByText('This field is required')).toHaveClass('text-destructive');
  });

  it('should display helper text', () => {
    render(<Textarea helperText="Enter your message here" data-testid="textarea" />);
    expect(screen.getByText('Enter your message here')).toBeInTheDocument();
    expect(screen.getByText('Enter your message here')).toHaveClass('text-muted-foreground');
  });

  it('should prioritize error over helper text', () => {
    render(
      <Textarea 
        error="This field is required"
        helperText="Enter your message here"
        data-testid="textarea"
      />
    );
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.queryByText('Enter your message here')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<Textarea className="custom-class" data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveClass('custom-class');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Textarea disabled data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('should support all HTML textarea attributes', () => {
    render(
      <Textarea 
        data-testid="textarea"
        id="test-textarea"
        name="message"
        rows={5}
        cols={30}
        maxLength={100}
      />
    );
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveAttribute('id', 'test-textarea');
    expect(textarea).toHaveAttribute('name', 'message');
    expect(textarea).toHaveAttribute('rows', '5');
    expect(textarea).toHaveAttribute('cols', '30');
    expect(textarea).toHaveAttribute('maxLength', '100');
  });

  it('should handle resize prop', () => {
    render(<Textarea resize={false} data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveClass('resize-none');
  });

  it('should allow resize by default', () => {
    render(<Textarea data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveClass('resize-y');
  });
});