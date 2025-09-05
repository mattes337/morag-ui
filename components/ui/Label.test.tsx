import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Label } from './Label';

describe('Label', () => {
  it('should render label with text', () => {
    render(<Label>Test Label</Label>);
    
    const label = screen.getByText('Test Label');
    expect(label).toBeInTheDocument();
    expect(label.tagName).toBe('LABEL');
  });

  it('should apply default variant styles', () => {
    render(<Label data-testid="label">Default Label</Label>);
    
    const label = screen.getByTestId('label');
    expect(label).toHaveClass('text-foreground');
  });

  it('should apply muted variant styles', () => {
    render(<Label variant="muted" data-testid="label">Muted Label</Label>);
    
    const label = screen.getByTestId('label');
    expect(label).toHaveClass('text-muted-foreground');
  });

  it('should apply destructive variant styles', () => {
    render(<Label variant="destructive" data-testid="label">Error Label</Label>);
    
    const label = screen.getByTestId('label');
    expect(label).toHaveClass('text-destructive');
  });

  it('should apply success variant styles', () => {
    render(<Label variant="success" data-testid="label">Success Label</Label>);
    
    const label = screen.getByTestId('label');
    expect(label).toHaveClass('text-green-700', 'dark:text-green-300');
  });

  it('should apply default size styles', () => {
    render(<Label data-testid="label">Default Size</Label>);
    
    const label = screen.getByTestId('label');
    expect(label).toHaveClass('text-sm');
  });

  it('should apply small size styles', () => {
    render(<Label size="sm" data-testid="label">Small Label</Label>);
    
    const label = screen.getByTestId('label');
    expect(label).toHaveClass('text-xs');
  });

  it('should apply large size styles', () => {
    render(<Label size="lg" data-testid="label">Large Label</Label>);
    
    const label = screen.getByTestId('label');
    expect(label).toHaveClass('text-base');
  });

  it('should not show asterisk when required is false', () => {
    render(<Label required={false} data-testid="label">Optional Label</Label>);
    
    const label = screen.getByTestId('label');
    expect(label).not.toHaveClass('after:content-["*"]');
  });

  it('should show asterisk when required is true', () => {
    render(<Label required={true} data-testid="label">Required Label</Label>);
    
    const label = screen.getByTestId('label');
    expect(label).toHaveClass(
      'after:content-["*"]',
      'after:ml-0.5',
      'after:text-destructive'
    );
  });

  it('should show asterisk when required prop is present without value', () => {
    render(<Label required data-testid="label">Required Label</Label>);
    
    const label = screen.getByTestId('label');
    expect(label).toHaveClass(
      'after:content-["*"]',
      'after:ml-0.5', 
      'after:text-destructive'
    );
  });

  it('should apply custom className', () => {
    render(<Label className="custom-label-class" data-testid="label">Custom Label</Label>);
    
    const label = screen.getByTestId('label');
    expect(label).toHaveClass('custom-label-class');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLLabelElement>();
    
    render(<Label ref={ref}>Label with ref</Label>);
    
    expect(ref.current).toBeInstanceOf(HTMLLabelElement);
  });

  it('should have base label styling classes', () => {
    render(<Label data-testid="label">Base Label</Label>);
    
    const label = screen.getByTestId('label');
    expect(label).toHaveClass(
      'text-sm',
      'font-medium',
      'leading-none',
      'peer-disabled:cursor-not-allowed',
      'peer-disabled:opacity-70'
    );
  });

  it('should support htmlFor attribute for form association', () => {
    render(<Label htmlFor="test-input">Associated Label</Label>);
    
    const label = screen.getByText('Associated Label');
    expect(label).toHaveAttribute('for', 'test-input');
  });

  it('should work with input elements', async () => {
    const user = userEvent.setup();
    
    render(
      <div>
        <Label htmlFor="test-input">Click me to focus input</Label>
        <input id="test-input" placeholder="Test input" />
      </div>
    );
    
    const label = screen.getByText('Click me to focus input');
    const input = screen.getByPlaceholderText('Test input');
    
    await user.click(label);
    
    expect(input).toHaveFocus();
  });

  it('should support all HTML label attributes', () => {
    render(
      <Label
        data-testid="label"
        id="test-label"
        role="label"
        aria-label="Accessible label"
        title="Label tooltip"
      >
        Label with attributes
      </Label>
    );
    
    const label = screen.getByTestId('label');
    expect(label).toHaveAttribute('id', 'test-label');
    expect(label).toHaveAttribute('role', 'label');
    expect(label).toHaveAttribute('aria-label', 'Accessible label');
    expect(label).toHaveAttribute('title', 'Label tooltip');
  });

  it('should handle click events', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    
    render(<Label onClick={handleClick}>Clickable Label</Label>);
    
    const label = screen.getByText('Clickable Label');
    await user.click(label);
    
    expect(handleClick).toHaveBeenCalled();
  });

  it('should apply peer-disabled styles when associated input is disabled', () => {
    render(
      <div>
        <input id="disabled-input" disabled className="peer" />
        <Label htmlFor="disabled-input" data-testid="label">
          Label for disabled input
        </Label>
      </div>
    );
    
    const label = screen.getByTestId('label');
    expect(label).toHaveClass('peer-disabled:cursor-not-allowed', 'peer-disabled:opacity-70');
  });

  it('should combine multiple variant props correctly', () => {
    render(
      <Label 
        variant="destructive" 
        size="lg" 
        required 
        data-testid="label"
      >
        Combined Variants
      </Label>
    );
    
    const label = screen.getByTestId('label');
    expect(label).toHaveClass(
      'text-destructive',
      'text-base',
      'after:content-["*"]',
      'after:ml-0.5',
      'after:text-destructive'
    );
  });

  it('should work in form context', () => {
    render(
      <form>
        <Label htmlFor="form-input" required>
          Form Field Label
        </Label>
        <input 
          id="form-input" 
          name="formField" 
          placeholder="Enter value"
        />
      </form>
    );
    
    const label = screen.getByText('Form Field Label');
    const input = screen.getByPlaceholderText('Enter value');
    
    expect(label).toHaveAttribute('for', 'form-input');
    expect(input).toHaveAttribute('id', 'form-input');
    expect(input).toHaveAttribute('name', 'formField');
  });

  it('should support keyboard interaction when associated with inputs', async () => {
    const user = userEvent.setup();
    
    render(
      <div>
        <Label htmlFor="keyboard-input">Keyboard Label</Label>
        <input id="keyboard-input" placeholder="Type here" />
      </div>
    );
    
    const label = screen.getByText('Keyboard Label');
    const input = screen.getByPlaceholderText('Type here');
    
    // Tab to focus the input through label association
    label.focus();
    await user.tab();
    
    expect(input).toHaveFocus();
  });

  it('should maintain text content when using required asterisk', () => {
    render(<Label required data-testid="label">Required Field</Label>);
    
    const label = screen.getByTestId('label');
    expect(label).toHaveTextContent('Required Field');
    // The asterisk is added via CSS pseudo-element, so it won't appear in textContent
  });

  it('should work with different children types', () => {
    render(
      <div>
        <Label data-testid="string-label">String Label</Label>
        <Label data-testid="element-label">
          <span>Element Label</span>
        </Label>
        <Label data-testid="mixed-label">
          Mixed <strong>Content</strong> Label
        </Label>
      </div>
    );
    
    expect(screen.getByTestId('string-label')).toHaveTextContent('String Label');
    expect(screen.getByTestId('element-label')).toHaveTextContent('Element Label');
    expect(screen.getByTestId('mixed-label')).toHaveTextContent('Mixed Content Label');
  });

  it('should handle empty label', () => {
    render(<Label data-testid="empty-label"></Label>);
    
    const label = screen.getByTestId('empty-label');
    expect(label).toBeInTheDocument();
    expect(label).toBeEmptyDOMElement();
  });

  it('should support accessibility features', () => {
    render(
      <div>
        <Label 
          htmlFor="accessible-input"
          required
          variant="destructive"
          aria-describedby="help-text"
        >
          Accessible Label
        </Label>
        <input 
          id="accessible-input"
          aria-describedby="help-text"
          aria-required="true"
        />
        <div id="help-text">This field is required</div>
      </div>
    );
    
    const label = screen.getByText('Accessible Label');
    const input = screen.getByRole('textbox');
    
    expect(label).toHaveAttribute('for', 'accessible-input');
    expect(label).toHaveAttribute('aria-describedby', 'help-text');
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'help-text');
  });
});