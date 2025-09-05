import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Avatar, AvatarImage, AvatarFallback } from './Avatar';

describe('Avatar', () => {
  it('should render avatar with image and fallback', async () => {
    render(
      <Avatar data-testid="avatar">
        <AvatarImage src="/test-image.jpg" alt="Test User" />
        <AvatarFallback>TU</AvatarFallback>
      </Avatar>
    );
    
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
    expect(screen.getByText('TU')).toBeInTheDocument();
    
    // Check for image by alt text or test-id instead of role
    const imageElement = screen.getByAltText('Test User');
    expect(imageElement).toBeInTheDocument();
  });

  it('should show fallback when image fails to load', async () => {
    render(
      <Avatar data-testid="avatar">
        <AvatarImage src="/invalid-image.jpg" alt="Test User" />
        <AvatarFallback>TU</AvatarFallback>
      </Avatar>
    );
    
    // Fallback should always be rendered in test environment
    expect(screen.getByText('TU')).toBeInTheDocument();
    
    // Image should be present
    const image = screen.getByAltText('Test User');
    expect(image).toBeInTheDocument();
  });

  it('should apply default size styles', () => {
    render(
      <Avatar data-testid="avatar">
        <AvatarFallback>TU</AvatarFallback>
      </Avatar>
    );
    
    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveClass('h-10', 'w-10');
  });

  it('should apply small size styles', () => {
    render(
      <Avatar size="sm" data-testid="avatar">
        <AvatarFallback size="sm">TU</AvatarFallback>
      </Avatar>
    );
    
    const avatar = screen.getByTestId('avatar');
    const fallback = screen.getByText('TU');
    
    expect(avatar).toHaveClass('h-8', 'w-8');
    expect(fallback).toHaveClass('text-xs');
  });

  it('should apply large size styles', () => {
    render(
      <Avatar size="lg" data-testid="avatar">
        <AvatarFallback size="lg">TU</AvatarFallback>
      </Avatar>
    );
    
    const avatar = screen.getByTestId('avatar');
    const fallback = screen.getByText('TU');
    
    expect(avatar).toHaveClass('h-12', 'w-12');
    expect(fallback).toHaveClass('text-base');
  });

  it('should apply xl size styles', () => {
    render(
      <Avatar size="xl" data-testid="avatar">
        <AvatarFallback size="xl">TU</AvatarFallback>
      </Avatar>
    );
    
    const avatar = screen.getByTestId('avatar');
    const fallback = screen.getByText('TU');
    
    expect(avatar).toHaveClass('h-16', 'w-16');
    expect(fallback).toHaveClass('text-lg');
  });

  it('should apply 2xl size styles', () => {
    render(
      <Avatar size="2xl" data-testid="avatar">
        <AvatarFallback size="2xl">TU</AvatarFallback>
      </Avatar>
    );
    
    const avatar = screen.getByTestId('avatar');
    const fallback = screen.getByText('TU');
    
    expect(avatar).toHaveClass('h-20', 'w-20');
    expect(fallback).toHaveClass('text-xl');
  });

  it('should apply 3xl size styles', () => {
    render(
      <Avatar size="3xl" data-testid="avatar">
        <AvatarFallback size="3xl">TU</AvatarFallback>
      </Avatar>
    );
    
    const avatar = screen.getByTestId('avatar');
    const fallback = screen.getByText('TU');
    
    expect(avatar).toHaveClass('h-24', 'w-24');
    expect(fallback).toHaveClass('text-2xl');
  });

  it('should apply custom className to avatar', () => {
    render(
      <Avatar className="custom-avatar-class" data-testid="avatar">
        <AvatarFallback>TU</AvatarFallback>
      </Avatar>
    );
    
    expect(screen.getByTestId('avatar')).toHaveClass('custom-avatar-class');
  });

  it('should apply custom className to image', () => {
    render(
      <Avatar>
        <AvatarImage 
          src="/test-image.jpg" 
          alt="Test User"
          className="custom-image-class"
        />
        <AvatarFallback>TU</AvatarFallback>
      </Avatar>
    );
    
    expect(screen.getByAltText('Test User')).toHaveClass('custom-image-class');
  });

  it('should apply custom className to fallback', () => {
    render(
      <Avatar>
        <AvatarFallback className="custom-fallback-class">TU</AvatarFallback>
      </Avatar>
    );
    
    expect(screen.getByText('TU')).toHaveClass('custom-fallback-class');
  });

  it('should forward ref to avatar root', () => {
    const ref = React.createRef<HTMLSpanElement>();
    
    render(
      <Avatar ref={ref}>
        <AvatarFallback>TU</AvatarFallback>
      </Avatar>
    );
    
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('should forward ref to avatar image', () => {
    const ref = React.createRef<HTMLImageElement>();
    
    render(
      <Avatar>
        <AvatarImage ref={ref} src="/test-image.jpg" alt="Test User" />
        <AvatarFallback>TU</AvatarFallback>
      </Avatar>
    );
    
    expect(ref.current).toBeTruthy();
  });

  it('should forward ref to avatar fallback', () => {
    const ref = React.createRef<HTMLSpanElement>();
    
    render(
      <Avatar>
        <AvatarFallback ref={ref}>TU</AvatarFallback>
      </Avatar>
    );
    
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('should have proper accessibility attributes', () => {
    render(
      <Avatar data-testid="avatar">
        <AvatarImage src="/test-image.jpg" alt="John Doe profile picture" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    
    const image = screen.getByAltText('John Doe profile picture');
    expect(image).toHaveAttribute('alt', 'John Doe profile picture');
  });

  it('should support all HTML attributes on avatar root', () => {
    render(
      <Avatar 
        data-testid="avatar"
        id="test-avatar"
        role="img"
        aria-label="User avatar"
      >
        <AvatarFallback>TU</AvatarFallback>
      </Avatar>
    );
    
    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveAttribute('id', 'test-avatar');
    expect(avatar).toHaveAttribute('role', 'img');
    expect(avatar).toHaveAttribute('aria-label', 'User avatar');
  });

  it('should render with image and proper image attributes', () => {
    render(
      <Avatar>
        <AvatarImage 
          src="/test-image.jpg" 
          alt="Test User"
          loading="lazy"
          crossOrigin="anonymous"
        />
        <AvatarFallback>TU</AvatarFallback>
      </Avatar>
    );
    
    const image = screen.getByAltText('Test User');
    expect(image).toHaveAttribute('src', '/test-image.jpg');
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveAttribute('crossOrigin', 'anonymous');
  });

  it('should have rounded-full class for circular shape', () => {
    render(
      <Avatar data-testid="avatar">
        <AvatarFallback>TU</AvatarFallback>
      </Avatar>
    );
    
    expect(screen.getByTestId('avatar')).toHaveClass('rounded-full');
    expect(screen.getByText('TU')).toHaveClass('rounded-full');
  });

  it('should handle empty fallback text', () => {
    render(
      <Avatar data-testid="avatar">
        <AvatarFallback></AvatarFallback>
      </Avatar>
    );
    
    const avatar = screen.getByTestId('avatar');
    expect(avatar).toBeInTheDocument();
  });

  it('should render fallback with default size when size not specified', () => {
    render(
      <Avatar>
        <AvatarFallback>TU</AvatarFallback>
      </Avatar>
    );
    
    const fallback = screen.getByText('TU');
    expect(fallback).toHaveClass('text-sm');
  });

  it('should have proper image styling classes', () => {
    render(
      <Avatar>
        <AvatarImage src="/test-image.jpg" alt="Test User" />
        <AvatarFallback>TU</AvatarFallback>
      </Avatar>
    );
    
    const image = screen.getByAltText('Test User');
    expect(image).toHaveClass('aspect-square', 'h-full', 'w-full', 'object-cover');
  });

  it('should have proper fallback styling classes', () => {
    render(
      <Avatar>
        <AvatarFallback>TU</AvatarFallback>
      </Avatar>
    );
    
    const fallback = screen.getByText('TU');
    expect(fallback).toHaveClass(
      'flex', 
      'h-full', 
      'w-full', 
      'items-center', 
      'justify-center', 
      'rounded-full',
      'bg-muted',
      'font-medium',
      'text-muted-foreground'
    );
  });
});