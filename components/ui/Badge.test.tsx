import React from 'react';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('should render children correctly', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('should apply default variant styles', () => {
    render(<Badge data-testid="badge">Default</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('bg-primary');
  });

  it('should apply secondary variant styles', () => {
    render(<Badge variant="secondary" data-testid="badge">Secondary</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('bg-secondary');
  });

  it('should apply destructive variant styles', () => {
    render(<Badge variant="destructive" data-testid="badge">Destructive</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('bg-destructive');
  });

  it('should apply outline variant styles', () => {
    render(<Badge variant="outline" data-testid="badge">Outline</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('border');
  });

  it('should apply success variant styles', () => {
    render(<Badge variant="success" data-testid="badge">Success</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('bg-green-600');
  });

  it('should apply warning variant styles', () => {
    render(<Badge variant="warning" data-testid="badge">Warning</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('bg-yellow-600');
  });

  it('should apply small size styles', () => {
    render(<Badge size="sm" data-testid="badge">Small</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('text-xs', 'px-2', 'py-0.5');
  });

  it('should apply large size styles', () => {
    render(<Badge size="lg" data-testid="badge">Large</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('text-sm', 'px-3', 'py-1');
  });

  it('should apply custom className', () => {
    render(<Badge className="custom-class" data-testid="badge">Test</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('custom-class');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Badge ref={ref}>Test</Badge>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('should support all HTML div attributes', () => {
    render(
      <Badge 
        data-testid="badge"
        id="test-badge"
        role="status"
        aria-label="Status badge"
      >
        Test
      </Badge>
    );
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveAttribute('id', 'test-badge');
    expect(badge).toHaveAttribute('role', 'status');
    expect(badge).toHaveAttribute('aria-label', 'Status badge');
  });
});