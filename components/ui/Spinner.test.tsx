import React from 'react';
import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('should render with default styles', () => {
    render(<Spinner data-testid="spinner" />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
  });

  it('should apply small size styles', () => {
    render(<Spinner size="sm" data-testid="spinner" />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveClass('h-4', 'w-4');
  });

  it('should apply medium size styles', () => {
    render(<Spinner size="md" data-testid="spinner" />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveClass('h-6', 'w-6');
  });

  it('should apply large size styles', () => {
    render(<Spinner size="lg" data-testid="spinner" />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveClass('h-8', 'w-8');
  });

  it('should apply extra large size styles', () => {
    render(<Spinner size="xl" data-testid="spinner" />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveClass('h-12', 'w-12');
  });

  it('should apply custom className', () => {
    render(<Spinner className="custom-class" data-testid="spinner" />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveClass('custom-class');
  });

  it('should have proper accessibility attributes', () => {
    render(<Spinner data-testid="spinner" />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveAttribute('role', 'status');
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });

  it('should allow custom aria-label', () => {
    render(<Spinner aria-label="Custom loading message" data-testid="spinner" />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveAttribute('aria-label', 'Custom loading message');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Spinner ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('should support all HTML div attributes', () => {
    render(
      <Spinner 
        data-testid="spinner"
        id="test-spinner"
        title="Loading spinner"
      />
    );
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveAttribute('id', 'test-spinner');
    expect(spinner).toHaveAttribute('title', 'Loading spinner');
  });

  it('should render SVG with proper viewBox and paths', () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector('svg');
    const circle = container.querySelector('circle');
    const path = container.querySelector('path');
    
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    expect(circle).toBeInTheDocument();
    expect(path).toBeInTheDocument();
  });
});