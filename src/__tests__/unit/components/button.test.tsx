import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass(
      'bg-blue-600',
      'text-white',
      'h-10',
      'px-4',
      'py-2'
    );
  });

  it('renders with different variants', () => {
    const variants = [
      'default',
      'outline',
      'secondary',
      'ghost',
      'destructive',
      'link',
    ] as const;

    variants.forEach((variant) => {
      const { unmount } = render(<Button variant={variant}>Test</Button>);
      const button = screen.getByRole('button', { name: 'Test' });

      expect(button).toBeInTheDocument();

      if (variant === 'default') {
        expect(button).toHaveClass('bg-blue-600', 'text-white');
      } else if (variant === 'destructive') {
        expect(button).toHaveClass('bg-red-600', 'text-white');
      } else if (variant === 'outline') {
        expect(button).toHaveClass('border', 'border-gray-300', 'bg-white');
      } else if (variant === 'secondary') {
        expect(button).toHaveClass('bg-gray-100', 'text-gray-900');
      } else if (variant === 'ghost') {
        expect(button).toHaveClass('hover:bg-gray-100');
      } else if (variant === 'link') {
        expect(button).toHaveClass('text-blue-600', 'underline-offset-4');
      }

      unmount();
    });
  });

  it('renders with different sizes', () => {
    const sizes = ['default', 'sm', 'lg', 'icon'] as const;

    sizes.forEach((size) => {
      const { unmount } = render(<Button size={size}>Test</Button>);
      const button = screen.getByRole('button', { name: 'Test' });

      expect(button).toBeInTheDocument();

      if (size === 'default') {
        expect(button).toHaveClass('h-10', 'px-4', 'py-2');
      } else if (size === 'sm') {
        expect(button).toHaveClass('h-9', 'rounded-md', 'px-3');
      } else if (size === 'lg') {
        expect(button).toHaveClass('h-11', 'px-8');
      } else if (size === 'icon') {
        expect(button).toHaveClass('h-10', 'w-10');
      }

      unmount();
    });
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button', { name: 'Click me' });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    render(<Button disabled>Disabled Button</Button>);

    const button = screen.getByRole('button', { name: 'Disabled Button' });
    expect(button).toBeDisabled();
    expect(button).toHaveClass(
      'disabled:pointer-events-none',
      'disabled:opacity-50'
    );
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>);

    const button = screen.getByRole('button', { name: 'Custom Button' });
    expect(button).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref Button</Button>);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    if (ref.current) {
      expect(ref.current.textContent).toBe('Ref Button');
    }
  });

  it('handles all HTML button attributes', () => {
    render(
      <Button
        type="submit"
        aria-label="Submit form"
        data-testid="submit-button"
      >
        Submit
      </Button>
    );

    const button = screen.getByRole('button', { name: 'Submit form' });
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('aria-label', 'Submit form');
    expect(button).toHaveAttribute('data-testid', 'submit-button');
  });

  it('has correct display name', () => {
    expect(Button.displayName).toBe('Button');
  });
});
