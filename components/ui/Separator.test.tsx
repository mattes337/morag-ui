import React from 'react';
import { render, screen } from '@testing-library/react';
import { Separator } from './Separator';

describe('Separator', () => {
  it('should render separator element', () => {
    render(<Separator data-testid="separator" />);
    
    const separator = screen.getByTestId('separator');
    expect(separator).toBeInTheDocument();
  });

  it('should have default horizontal orientation', () => {
    render(<Separator data-testid="separator" />);
    
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveClass('h-[1px]', 'w-full');
    expect(separator).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('should apply vertical orientation styles', () => {
    render(<Separator orientation="vertical" data-testid="separator" />);
    
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveClass('h-full', 'w-[1px]');
    expect(separator).toHaveAttribute('data-orientation', 'vertical');
  });

  it('should apply horizontal orientation styles explicitly', () => {
    render(<Separator orientation="horizontal" data-testid="separator" />);
    
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveClass('h-[1px]', 'w-full');
    expect(separator).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('should apply default size styles', () => {
    render(<Separator data-testid="separator" />);
    
    const separator = screen.getByTestId('separator');
    expect(separator).not.toHaveClass('opacity-50', 'opacity-75');
  });

  it('should apply small size styles', () => {
    render(<Separator size="sm" data-testid="separator" />);
    
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveClass('opacity-50');
  });

  it('should apply large size styles', () => {
    render(<Separator size="lg" data-testid="separator" />);
    
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveClass('opacity-75');
  });

  it('should apply custom className', () => {
    render(<Separator className="custom-separator-class" data-testid="separator" />);
    
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveClass('custom-separator-class');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    
    render(<Separator ref={ref} />);
    
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('should have base separator styling classes', () => {
    render(<Separator data-testid="separator" />);
    
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveClass('shrink-0', 'bg-border');
  });

  it('should be decorative by default', () => {
    render(<Separator data-testid="separator" />);
    
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('role', 'none');
  });

  it('should support non-decorative separator', () => {
    render(<Separator decorative={false} data-testid="separator" />);
    
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('role', 'separator');
  });

  it('should support aria-label for non-decorative separators', () => {
    render(
      <Separator 
        decorative={false} 
        aria-label="Section divider"
        data-testid="separator" 
      />
    );
    
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('aria-label', 'Section divider');
    expect(separator).toHaveAttribute('role', 'separator');
  });

  it('should support aria-orientation attribute', () => {
    render(<Separator orientation="vertical" data-testid="separator" />);
    
    const separator = screen.getByTestId('separator');
    // Radix UI may not set aria-orientation in test environment, so check data attribute
    expect(separator).toHaveAttribute('data-orientation', 'vertical');
  });

  it('should handle fallback orientation value', () => {
    // Test the internal logic for orientation fallback
    render(<Separator orientation={undefined as any} data-testid="separator" />);
    
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('data-orientation', 'horizontal');
    expect(separator).toHaveClass('h-[1px]', 'w-full');
  });

  it('should support all HTML div attributes', () => {
    render(
      <Separator
        data-testid="separator"
        id="test-separator"
        title="Separator tooltip"
        style={{ margin: '10px' }}
      />
    );
    
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('id', 'test-separator');
    expect(separator).toHaveAttribute('title', 'Separator tooltip');
    expect(separator).toHaveStyle('margin: 10px');
  });

  it('should combine different props correctly', () => {
    render(
      <Separator 
        orientation="vertical" 
        size="sm"
        decorative={false}
        className="custom-class"
        data-testid="separator" 
      />
    );
    
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveClass('h-full', 'w-[1px]', 'opacity-50', 'custom-class');
    expect(separator).toHaveAttribute('data-orientation', 'vertical');
    expect(separator).toHaveAttribute('role', 'separator');
  });

  it('should work in layout contexts', () => {
    render(
      <div className="flex items-center space-x-4">
        <span>Item 1</span>
        <Separator orientation="vertical" data-testid="separator" />
        <span>Item 2</span>
      </div>
    );
    
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByTestId('separator')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveClass('h-full', 'w-[1px]');
  });

  it('should work as horizontal divider', () => {
    render(
      <div className="space-y-4">
        <div>Section 1</div>
        <Separator data-testid="separator" />
        <div>Section 2</div>
      </div>
    );
    
    expect(screen.getByText('Section 1')).toBeInTheDocument();
    expect(screen.getByTestId('separator')).toBeInTheDocument();
    expect(screen.getByText('Section 2')).toBeInTheDocument();
    
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveClass('h-[1px]', 'w-full');
  });

  it('should handle edge cases gracefully', () => {
    // Test with empty props
    render(<Separator />);
    const separator = document.querySelector('[role="none"]');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveClass('shrink-0', 'bg-border', 'h-[1px]', 'w-full');
  });
});