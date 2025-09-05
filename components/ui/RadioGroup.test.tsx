import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RadioGroup, RadioGroupItem } from './RadioGroup';
import { Label } from './Label';

describe('RadioGroup', () => {
  const BasicRadioGroup = ({ 
    defaultValue = '', 
    value,
    onValueChange = () => {},
    disabled = false 
  }: { 
    defaultValue?: string; 
    value?: string;
    onValueChange?: (value: string) => void;
    disabled?: boolean;
  }) => (
    <RadioGroup 
      defaultValue={defaultValue} 
      {...(value !== undefined && { value })}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option1" id="option1" />
        <Label htmlFor="option1">Option 1</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option2" id="option2" />
        <Label htmlFor="option2">Option 2</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option3" id="option3" />
        <Label htmlFor="option3">Option 3</Label>
      </div>
    </RadioGroup>
  );

  it('should render radio group correctly', () => {
    render(<BasicRadioGroup />);
    
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    expect(screen.getByLabelText('Option 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Option 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Option 3')).toBeInTheDocument();
  });

  it('should have no option selected by default', () => {
    render(<BasicRadioGroup />);
    
    const option1 = screen.getByLabelText('Option 1');
    const option2 = screen.getByLabelText('Option 2');
    const option3 = screen.getByLabelText('Option 3');
    
    expect(option1).not.toBeChecked();
    expect(option2).not.toBeChecked();
    expect(option3).not.toBeChecked();
  });

  it('should select default value', () => {
    render(<BasicRadioGroup defaultValue="option2" />);
    
    const option1 = screen.getByLabelText('Option 1');
    const option2 = screen.getByLabelText('Option 2');
    const option3 = screen.getByLabelText('Option 3');
    
    expect(option1).not.toBeChecked();
    expect(option2).toBeChecked();
    expect(option3).not.toBeChecked();
  });

  it('should handle controlled value', async () => {
    const TestComponent = () => {
      const [value, setValue] = React.useState('option1');
      
      return (
        <>
          <BasicRadioGroup value={value} onValueChange={setValue} />
          <button onClick={() => setValue('option3')}>Select Option 3</button>
        </>
      );
    };
    
    render(<TestComponent />);
    
    // Initial state
    expect(screen.getByLabelText('Option 1')).toBeChecked();
    expect(screen.getByLabelText('Option 2')).not.toBeChecked();
    expect(screen.getByLabelText('Option 3')).not.toBeChecked();
    
    // Change value programmatically
    await act(async () => {
      fireEvent.click(screen.getByText('Select Option 3'));
    });
    
    expect(screen.getByLabelText('Option 1')).not.toBeChecked();
    expect(screen.getByLabelText('Option 2')).not.toBeChecked();
    expect(screen.getByLabelText('Option 3')).toBeChecked();
  });

  it('should call onValueChange when selection changes', async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    
    render(<BasicRadioGroup onValueChange={onValueChange} />);
    
    const option2 = screen.getByLabelText('Option 2');
    await user.click(option2);
    
    expect(onValueChange).toHaveBeenCalledWith('option2');
  });

  it('should allow only one selection at a time', async () => {
    const user = userEvent.setup();
    
    render(<BasicRadioGroup />);
    
    const option1 = screen.getByLabelText('Option 1');
    const option2 = screen.getByLabelText('Option 2');
    
    // Select option 1
    await user.click(option1);
    expect(option1).toBeChecked();
    expect(option2).not.toBeChecked();
    
    // Select option 2
    await user.click(option2);
    expect(option1).not.toBeChecked();
    expect(option2).toBeChecked();
  });

  it('should support keyboard interaction', async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    
    render(<BasicRadioGroup onValueChange={onValueChange} />);
    
    const option1 = screen.getByLabelText('Option 1');
    
    // Focus and press space to select
    option1.focus();
    await user.keyboard(' ');
    
    expect(onValueChange).toHaveBeenCalledWith('option1');
  });

  it('should support disabled state for entire group', () => {
    render(<BasicRadioGroup disabled />);
    
    const option1 = screen.getByLabelText('Option 1');
    const option2 = screen.getByLabelText('Option 2');
    const option3 = screen.getByLabelText('Option 3');
    
    expect(option1).toBeDisabled();
    expect(option2).toBeDisabled();
    expect(option3).toBeDisabled();
  });

  it('should support disabled state for individual items', () => {
    render(
      <RadioGroup>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option1" id="option1" />
          <Label htmlFor="option1">Option 1</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option2" id="option2" disabled />
          <Label htmlFor="option2">Option 2 (Disabled)</Label>
        </div>
      </RadioGroup>
    );
    
    const option1 = screen.getByLabelText('Option 1');
    const option2 = screen.getByLabelText('Option 2 (Disabled)');
    
    expect(option1).not.toBeDisabled();
    expect(option2).toBeDisabled();
  });

  it('should apply different layouts', () => {
    render(
      <RadioGroup layout="horizontal" data-testid="radio-group">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option1" id="option1" />
          <Label htmlFor="option1">Option 1</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option2" id="option2" />
          <Label htmlFor="option2">Option 2</Label>
        </div>
      </RadioGroup>
    );
    
    const radioGroup = screen.getByTestId('radio-group');
    expect(radioGroup).toHaveClass('flex-row');
  });

  it('should apply different sizes', () => {
    render(
      <RadioGroup>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option1" id="option1" size="sm" />
          <Label htmlFor="option1">Small Option</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option2" id="option2" size="lg" />
          <Label htmlFor="option2">Large Option</Label>
        </div>
      </RadioGroup>
    );
    
    const smallOption = screen.getByLabelText('Small Option');
    const largeOption = screen.getByLabelText('Large Option');
    
    expect(smallOption).toHaveClass('h-3', 'w-3');
    expect(largeOption).toHaveClass('h-5', 'w-5');
  });

  it('should apply different variants', () => {
    render(
      <RadioGroup>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option1" id="option1" variant="default" />
          <Label htmlFor="option1">Default Option</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option2" id="option2" variant="destructive" />
          <Label htmlFor="option2">Destructive Option</Label>
        </div>
      </RadioGroup>
    );
    
    const defaultOption = screen.getByLabelText('Default Option');
    const destructiveOption = screen.getByLabelText('Destructive Option');
    
    expect(defaultOption).toHaveClass('border-primary');
    expect(destructiveOption).toHaveClass('border-destructive');
  });

  it('should support custom className', () => {
    render(
      <RadioGroup className="custom-radio-group" data-testid="radio-group">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option1" id="option1" className="custom-radio-item" />
          <Label htmlFor="option1">Option 1</Label>
        </div>
      </RadioGroup>
    );
    
    const radioGroup = screen.getByTestId('radio-group');
    const radioItem = screen.getByLabelText('Option 1');
    
    expect(radioGroup).toHaveClass('custom-radio-group');
    expect(radioItem).toHaveClass('custom-radio-item');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    
    render(
      <RadioGroup ref={ref}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option1" id="option1" />
          <Label htmlFor="option1">Option 1</Label>
        </div>
      </RadioGroup>
    );
    
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('should have proper accessibility attributes', () => {
    render(<BasicRadioGroup />);
    
    const radioGroup = screen.getByRole('radiogroup');
    expect(radioGroup).toBeInTheDocument();
    
    const options = screen.getAllByRole('radio');
    expect(options).toHaveLength(3);
    
    options.forEach((option, index) => {
      expect(option).toHaveAttribute('value', `option${index + 1}`);
    });
  });

  it('should support required attribute', () => {
    render(
      <RadioGroup required data-testid="radio-group">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option1" id="option1" />
          <Label htmlFor="option1">Option 1</Label>
        </div>
      </RadioGroup>
    );
    
    const radioGroup = screen.getByTestId('radio-group');
    expect(radioGroup).toHaveAttribute('aria-required', 'true');
  });
});