import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Badge } from '@/components/ui/badge';

describe('Badge Component', () => {
  it('renders with default variant', () => {
    render(<Badge>Default Badge</Badge>);
    
    const badge = screen.getByText('Default Badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('renders with secondary variant', () => {
    render(<Badge variant="secondary">Secondary Badge</Badge>);
    
    const badge = screen.getByText('Secondary Badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
  });

  it('renders with destructive variant', () => {
    render(<Badge variant="destructive">Destructive Badge</Badge>);
    
    const badge = screen.getByText('Destructive Badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('renders with outline variant', () => {
    render(<Badge variant="outline">Outline Badge</Badge>);
    
    const badge = screen.getByText('Outline Badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('border', 'border-blue-200', 'text-blue-800');
  });

  it('applies custom className', () => {
    render(<Badge className="custom-badge">Custom Badge</Badge>);
    
    const badge = screen.getByText('Custom Badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('custom-badge');
  });

  it('renders with different content types', () => {
    const { rerender } = render(
      <Badge>
        <span>Text content</span>
      </Badge>
    );
    
    let badge = screen.getByText('Text content');
    expect(badge).toBeInTheDocument();
    expect(badge.tagName).toBe('SPAN');
    
    // Rerender with different content
    rerender(
      <Badge>
        <div>Div content</div>
      </Badge>
    );
    
    badge = screen.getByText('Div content');
    expect(badge).toBeInTheDocument();
    expect(badge.tagName).toBe('DIV');
  });

  it('has consistent base classes', () => {
    render(<Badge>Test Badge</Badge>);
    
    const badge = screen.getByText('Test Badge');
    expect(badge).toHaveClass(
      'inline-flex',
      'items-center',
      'rounded-full',
      'px-2.5',
      'py-0.5',
      'text-xs',
      'font-medium',
      'transition-colors',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-ring',
      'focus:ring-offset-2'
    );
  });

  it('handles long content gracefully', () => {
    render(
      <Badge>
        This is a very long badge content that should be handled gracefully
      </Badge>
    );
    
    const badge = screen.getByText(/This is a very long badge content/);
    expect(badge).toBeInTheDocument();
  });

  it('can be empty', () => {
    render(<Badge></Badge>);
    
    // Should render empty badge
    const badge = screen.getByRole('generic'); // Badge doesn't have a specific role
    expect(badge).toBeInTheDocument();
    expect(badge).toBeEmptyDOMElement();
  });
});
