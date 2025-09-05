import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';

describe('Card', () => {
  it('should render card with children', () => {
    render(
      <Card data-testid="card">
        <div>Card content</div>
      </Card>
    );
    
    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('should apply default variant styles', () => {
    render(<Card data-testid="card">Content</Card>);
    
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('border-border');
    expect(card).not.toHaveClass('shadow-sm', 'shadow-md');
  });

  it('should apply outlined variant styles', () => {
    render(<Card variant="outlined" data-testid="card">Content</Card>);
    
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('border-border', 'shadow-sm');
  });

  it('should apply elevated variant styles', () => {
    render(<Card variant="elevated" data-testid="card">Content</Card>);
    
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('border-border', 'shadow-md');
  });

  it('should apply ghost variant styles', () => {
    render(<Card variant="ghost" data-testid="card">Content</Card>);
    
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('border-transparent', 'bg-transparent');
  });

  it('should apply default padding styles', () => {
    render(<Card data-testid="card">Content</Card>);
    
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('p-6');
  });

  it('should apply no padding when padding is none', () => {
    render(<Card padding="none" data-testid="card">Content</Card>);
    
    const card = screen.getByTestId('card');
    expect(card).not.toHaveClass('p-4', 'p-6', 'p-8');
  });

  it('should apply small padding styles', () => {
    render(<Card padding="sm" data-testid="card">Content</Card>);
    
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('p-4');
  });

  it('should apply large padding styles', () => {
    render(<Card padding="lg" data-testid="card">Content</Card>);
    
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('p-8');
  });

  it('should apply custom className', () => {
    render(<Card className="custom-card-class" data-testid="card">Content</Card>);
    
    expect(screen.getByTestId('card')).toHaveClass('custom-card-class');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    
    render(<Card ref={ref}>Content</Card>);
    
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('should support all HTML div attributes', () => {
    render(
      <Card 
        data-testid="card"
        id="test-card"
        aria-label="Test card"
      >
        Content
      </Card>
    );
    
    const card = screen.getByTestId('card');
    expect(card).toHaveAttribute('id', 'test-card');
    expect(card).toHaveAttribute('aria-label', 'Test card');
  });

  it('should have base card styling classes', () => {
    render(<Card data-testid="card">Content</Card>);
    
    const card = screen.getByTestId('card');
    expect(card).toHaveClass(
      'rounded-lg',
      'border',
      'bg-card',
      'text-card-foreground'
    );
  });
});

describe('CardHeader', () => {
  it('should render header with children', () => {
    render(
      <CardHeader data-testid="card-header">
        <div>Header content</div>
      </CardHeader>
    );
    
    expect(screen.getByTestId('card-header')).toBeInTheDocument();
    expect(screen.getByText('Header content')).toBeInTheDocument();
  });

  it('should apply default header styles', () => {
    render(<CardHeader data-testid="card-header">Header</CardHeader>);
    
    const header = screen.getByTestId('card-header');
    expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6');
  });

  it('should apply custom className', () => {
    render(<CardHeader className="custom-header-class" data-testid="card-header">Header</CardHeader>);
    
    expect(screen.getByTestId('card-header')).toHaveClass('custom-header-class');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    
    render(<CardHeader ref={ref}>Header</CardHeader>);
    
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('CardTitle', () => {
  it('should render title with children', () => {
    render(<CardTitle>Test Title</CardTitle>);
    
    expect(screen.getByRole('heading', { name: 'Test Title' })).toBeInTheDocument();
  });

  it('should apply default title styles', () => {
    render(<CardTitle data-testid="card-title">Title</CardTitle>);
    
    const title = screen.getByTestId('card-title');
    expect(title).toHaveClass(
      'text-2xl',
      'font-semibold',
      'leading-none',
      'tracking-tight'
    );
  });

  it('should render as h3 element', () => {
    render(<CardTitle>Title</CardTitle>);
    
    const title = screen.getByRole('heading', { name: 'Title' });
    expect(title.tagName).toBe('H3');
  });

  it('should apply custom className', () => {
    render(<CardTitle className="custom-title-class">Title</CardTitle>);
    
    const title = screen.getByRole('heading', { name: 'Title' });
    expect(title).toHaveClass('custom-title-class');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLHeadingElement>();
    
    render(<CardTitle ref={ref}>Title</CardTitle>);
    
    expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
  });
});

describe('CardDescription', () => {
  it('should render description with children', () => {
    render(<CardDescription>Test description</CardDescription>);
    
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('should apply default description styles', () => {
    render(<CardDescription data-testid="card-description">Description</CardDescription>);
    
    const description = screen.getByTestId('card-description');
    expect(description).toHaveClass('text-sm', 'text-muted-foreground');
  });

  it('should render as p element', () => {
    render(<CardDescription data-testid="card-description">Description</CardDescription>);
    
    const description = screen.getByTestId('card-description');
    expect(description.tagName).toBe('P');
  });

  it('should apply custom className', () => {
    render(<CardDescription className="custom-description-class">Description</CardDescription>);
    
    expect(screen.getByText('Description')).toHaveClass('custom-description-class');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLParagraphElement>();
    
    render(<CardDescription ref={ref}>Description</CardDescription>);
    
    expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
  });
});

describe('CardContent', () => {
  it('should render content with children', () => {
    render(
      <CardContent data-testid="card-content">
        <div>Card content</div>
      </CardContent>
    );
    
    expect(screen.getByTestId('card-content')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('should apply default content styles', () => {
    render(<CardContent data-testid="card-content">Content</CardContent>);
    
    const content = screen.getByTestId('card-content');
    expect(content).toHaveClass('p-6', 'pt-0');
  });

  it('should apply custom className', () => {
    render(<CardContent className="custom-content-class" data-testid="card-content">Content</CardContent>);
    
    expect(screen.getByTestId('card-content')).toHaveClass('custom-content-class');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    
    render(<CardContent ref={ref}>Content</CardContent>);
    
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('CardFooter', () => {
  it('should render footer with children', () => {
    render(
      <CardFooter data-testid="card-footer">
        <div>Footer content</div>
      </CardFooter>
    );
    
    expect(screen.getByTestId('card-footer')).toBeInTheDocument();
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('should apply default footer styles', () => {
    render(<CardFooter data-testid="card-footer">Footer</CardFooter>);
    
    const footer = screen.getByTestId('card-footer');
    expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');
  });

  it('should apply custom className', () => {
    render(<CardFooter className="custom-footer-class" data-testid="card-footer">Footer</CardFooter>);
    
    expect(screen.getByTestId('card-footer')).toHaveClass('custom-footer-class');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    
    render(<CardFooter ref={ref}>Footer</CardFooter>);
    
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('Card Composition', () => {
  it('should render complete card with all components', () => {
    render(
      <Card data-testid="complete-card">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card content goes here</p>
        </CardContent>
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      </Card>
    );
    
    expect(screen.getByTestId('complete-card')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Card Title' })).toBeInTheDocument();
    expect(screen.getByText('Card description')).toBeInTheDocument();
    expect(screen.getByText('Card content goes here')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it('should work with different card variants and padding', () => {
    render(
      <Card variant="elevated" padding="lg" data-testid="styled-card">
        <CardHeader>
          <CardTitle>Styled Card</CardTitle>
        </CardHeader>
        <CardContent>Content</CardContent>
      </Card>
    );
    
    const card = screen.getByTestId('styled-card');
    expect(card).toHaveClass('shadow-md', 'p-8');
    expect(screen.getByRole('heading', { name: 'Styled Card' })).toBeInTheDocument();
  });
});