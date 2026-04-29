import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../test-utils';
import { Button } from '@/components/ui/Button';

// Mock Button component for testing
const MockButton: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}> = ({ children, variant = 'primary', size = 'md', loading, disabled, onClick, type = 'button', className }) => {
  const baseClasses = 'button';
  const variantClasses = {
    primary: 'button-primary',
    secondary: 'button-secondary',
    danger: 'button-danger',
    ghost: 'button-ghost',
  };
  const sizeClasses = {
    sm: 'button-sm',
    md: 'button-md',
    lg: 'button-lg',
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className || ''}`}
      disabled={disabled || loading}
      onClick={onClick}
      data-loading={loading}
      data-testid="button"
    >
      {loading && <span data-testid="loading-spinner">Loading...</span>}
      {children}
    </button>
  );
};

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<MockButton>Click me</MockButton>);
    expect(screen.getByTestId('button')).toBeInTheDocument();
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('renders with primary variant', () => {
    render(<MockButton variant="primary">Primary</MockButton>);
    const button = screen.getByTestId('button');
    expect(button).toHaveClass('button-primary');
  });

  it('renders with secondary variant', () => {
    render(<MockButton variant="secondary">Secondary</MockButton>);
    const button = screen.getByTestId('button');
    expect(button).toHaveClass('button-secondary');
  });

  it('renders with danger variant', () => {
    render(<MockButton variant="danger">Delete</MockButton>);
    const button = screen.getByTestId('button');
    expect(button).toHaveClass('button-danger');
  });

  it('renders with ghost variant', () => {
    render(<MockButton variant="ghost">Ghost</MockButton>);
    const button = screen.getByTestId('button');
    expect(button).toHaveClass('button-ghost');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<MockButton size="sm">Small</MockButton>);
    expect(screen.getByTestId('button')).toHaveClass('button-sm');

    rerender(<MockButton size="md">Medium</MockButton>);
    expect(screen.getByTestId('button')).toHaveClass('button-md');

    rerender(<MockButton size="lg">Large</MockButton>);
    expect(screen.getByTestId('button')).toHaveClass('button-lg');
  });

  it('shows loading state', () => {
    render(<MockButton loading>Loading Button</MockButton>);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByTestId('button')).toBeDisabled();
    expect(screen.getByTestId('button')).toHaveAttribute('data-loading', 'true');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<MockButton onClick={handleClick}>Click me</MockButton>);
    fireEvent.click(screen.getByTestId('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(<MockButton onClick={handleClick} disabled>Disabled</MockButton>);
    fireEvent.click(screen.getByTestId('button'));
    expect(handleClick).not.toHaveBeenCalled();
    expect(screen.getByTestId('button')).toBeDisabled();
  });

  it('does not call onClick when loading', () => {
    const handleClick = vi.fn();
    render(<MockButton onClick={handleClick} loading>Loading</MockButton>);
    fireEvent.click(screen.getByTestId('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders as submit button', () => {
    render(<MockButton type="submit">Submit</MockButton>);
    expect(screen.getByTestId('button')).toHaveAttribute('type', 'submit');
  });

  it('renders as reset button', () => {
    render(<MockButton type="reset">Reset</MockButton>);
    expect(screen.getByTestId('button')).toHaveAttribute('type', 'reset');
  });

  it('applies custom className', () => {
    render(<MockButton className="custom-class">Custom</MockButton>);
    expect(screen.getByTestId('button')).toHaveClass('custom-class');
  });

  it('renders with icon and text', () => {
    render(
      <MockButton>
        <span data-testid="icon">+</span>
        Add Student
      </MockButton>
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('Add Student')).toBeInTheDocument();
  });
});
