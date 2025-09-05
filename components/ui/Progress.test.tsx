import React from 'react';
import { render, screen } from '@testing-library/react';
import { Progress } from './Progress';

describe('Progress', () => {
  it('should render progress bar with default value', () => {
    render(<Progress data-testid="progress" />);
    
    const progress = screen.getByRole('progressbar');
    expect(progress).toBeInTheDocument();
    expect(progress).toHaveAttribute('aria-valuenow', '0');
    expect(progress).toHaveAttribute('aria-valuemax', '100');
  });

  it('should render progress bar with custom value', () => {
    render(<Progress value={50} data-testid="progress" />);
    
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuenow', '50');
    expect(progress).toHaveAttribute('aria-valuemax', '100');
  });

  it('should render progress bar with custom max value', () => {
    render(<Progress value={25} max={50} data-testid="progress" />);
    
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuenow', '25');
    expect(progress).toHaveAttribute('aria-valuemax', '50');
  });

  it('should calculate percentage correctly', () => {
    render(<Progress value={30} max={60} showValue data-testid="progress" />);
    
    // 30/60 * 100 = 50%
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('should display label when provided', () => {
    render(<Progress label="Loading..." value={75} data-testid="progress" />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display percentage when showValue is true', () => {
    render(<Progress value={25} showValue data-testid="progress" />);
    
    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  it('should display both label and percentage', () => {
    render(
      <Progress 
        label="Upload Progress" 
        value={60} 
        showValue 
        data-testid="progress" 
      />
    );
    
    expect(screen.getByText('Upload Progress')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('should not display label or percentage by default', () => {
    render(<Progress value={40} data-testid="progress" />);
    
    expect(screen.queryByText('40%')).not.toBeInTheDocument();
    expect(screen.queryByText(/progress/i)).not.toBeInTheDocument();
  });

  it('should apply default size styles', () => {
    render(<Progress data-testid="progress" />);
    
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveClass('h-4');
  });

  it('should apply small size styles', () => {
    render(<Progress size="sm" data-testid="progress" />);
    
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveClass('h-2');
  });

  it('should apply large size styles', () => {
    render(<Progress size="lg" data-testid="progress" />);
    
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveClass('h-6');
  });

  it('should apply default variant styles', () => {
    render(<Progress data-testid="progress" />);
    
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveClass('bg-secondary');
  });

  it('should apply success variant styles', () => {
    render(<Progress variant="success" data-testid="progress" />);
    
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveClass('bg-green-100', 'dark:bg-green-950');
  });

  it('should apply warning variant styles', () => {
    render(<Progress variant="warning" data-testid="progress" />);
    
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveClass('bg-yellow-100', 'dark:bg-yellow-950');
  });

  it('should apply destructive variant styles', () => {
    render(<Progress variant="destructive" data-testid="progress" />);
    
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveClass('bg-red-100', 'dark:bg-red-950');
  });

  it('should apply custom className', () => {
    render(<Progress className="custom-progress-class" data-testid="progress" />);
    
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveClass('custom-progress-class');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    
    render(<Progress ref={ref} />);
    
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('should have proper base styling classes', () => {
    render(<Progress data-testid="progress" />);
    
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveClass(
      'relative',
      'w-full',
      'overflow-hidden',
      'rounded-full',
      'bg-secondary'
    );
  });

  it('should have proper indicator styling', () => {
    const { container } = render(<Progress value={50} data-testid="progress" />);
    
    const indicator = container.querySelector('[data-state="loading"]');
    expect(indicator).toHaveClass(
      'h-full',
      'w-full',
      'flex-1',
      'bg-primary',
      'transition-all'
    );
  });

  it('should apply correct transform to indicator based on percentage', () => {
    const { container } = render(<Progress value={75} data-testid="progress" />);
    
    const indicator = container.querySelector('[data-state="loading"]');
    expect(indicator).toHaveStyle('transform: translateX(-25%)'); // 100 - 75 = 25
  });

  it('should handle zero value correctly', () => {
    const { container } = render(<Progress value={0} showValue data-testid="progress" />);
    
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByText('0%')).toBeInTheDocument();
    
    const indicator = container.querySelector('[data-state="loading"]');
    expect(indicator).toHaveStyle('transform: translateX(-100%)');
  });

  it('should handle max value correctly', () => {
    const { container } = render(<Progress value={100} showValue data-testid="progress" />);
    
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByText('100%')).toBeInTheDocument();
    
    const indicator = container.querySelector('[data-state="loading"]');
    expect(indicator).toHaveStyle('transform: translateX(-0%)');
  });

  it('should handle values greater than max', () => {
    const { container } = render(<Progress value={150} max={100} showValue data-testid="progress" />);
    
    // Should clamp to 100%
    expect(screen.getByText('150%')).toBeInTheDocument(); // Shows actual calculation
    
    const indicator = container.querySelector('[data-state="loading"]');
    expect(indicator).toHaveStyle('transform: translateX(50%)'); // 100 - 150 = -50, so 50%
  });

  it('should handle negative values', () => {
    const { container } = render(<Progress value={-10} showValue data-testid="progress" />);
    
    expect(screen.getByText('-10%')).toBeInTheDocument();
    
    const indicator = container.querySelector('[data-state="loading"]');
    expect(indicator).toHaveStyle('transform: translateX(-110%)'); // 100 - (-10) = 110
  });

  it('should apply different indicator colors based on variant', () => {
    const { container: defaultContainer } = render(<Progress variant="default" value={50} />);
    const defaultIndicator = defaultContainer.querySelector('[data-state="loading"]');
    expect(defaultIndicator).toHaveClass('bg-primary');

    const { container: successContainer } = render(<Progress variant="success" value={50} />);
    const successIndicator = successContainer.querySelector('[data-state="loading"]');
    expect(successIndicator).toHaveClass('bg-green-600');

    const { container: warningContainer } = render(<Progress variant="warning" value={50} />);
    const warningIndicator = warningContainer.querySelector('[data-state="loading"]');
    expect(warningIndicator).toHaveClass('bg-yellow-600');

    const { container: destructiveContainer } = render(<Progress variant="destructive" value={50} />);
    const destructiveIndicator = destructiveContainer.querySelector('[data-state="loading"]');
    expect(destructiveIndicator).toHaveClass('bg-red-600');
  });

  it('should support accessibility attributes', () => {
    render(
      <Progress 
        value={50} 
        aria-label="File upload progress"
        aria-describedby="progress-description"
        data-testid="progress" 
      />
    );
    
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-label', 'File upload progress');
    expect(progress).toHaveAttribute('aria-describedby', 'progress-description');
  });

  it('should handle decimal values', () => {
    render(<Progress value={33.33} showValue data-testid="progress" />);
    
    expect(screen.getByText('33%')).toBeInTheDocument(); // Should round to nearest integer
  });

  it('should handle custom max values with percentage calculation', () => {
    render(<Progress value={15} max={200} showValue data-testid="progress" />);
    
    // 15/200 * 100 = 7.5, rounded to 8%
    expect(screen.getByText('8%')).toBeInTheDocument();
  });

  it('should render wrapper div with proper spacing', () => {
    const { container } = render(<Progress label="Test" showValue value={50} />);
    
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('w-full', 'space-y-2');
  });

  it('should render label and value container with proper layout', () => {
    const { container } = render(<Progress label="Test Progress" showValue value={50} />);
    
    const labelContainer = container.querySelector('.flex.items-center.justify-between');
    expect(labelContainer).toBeInTheDocument();
    expect(labelContainer).toHaveClass('text-sm');
  });

  it('should style label text correctly', () => {
    render(<Progress label="Test Progress" value={50} />);
    
    const label = screen.getByText('Test Progress');
    expect(label).toHaveClass('text-foreground', 'font-medium');
  });

  it('should style percentage text correctly', () => {
    render(<Progress showValue value={50} />);
    
    const percentage = screen.getByText('50%');
    expect(percentage).toHaveClass('text-muted-foreground');
  });

  it('should work without any props', () => {
    render(<Progress />);
    
    const progress = screen.getByRole('progressbar');
    expect(progress).toBeInTheDocument();
    expect(progress).toHaveAttribute('aria-valuenow', '0');
    expect(progress).toHaveAttribute('aria-valuemax', '100');
  });

  it('should support all HTML div attributes on the root', () => {
    render(
      <Progress
        id="test-progress"
        role="progressbar"
        title="Progress tooltip"
        data-custom="custom-value"
      />
    );
    
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('id', 'test-progress');
    expect(progress).toHaveAttribute('title', 'Progress tooltip');
    expect(progress).toHaveAttribute('data-custom', 'custom-value');
  });
});