import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../test-utils';
import { Input } from '@/components/ui/input';

describe('Input Component (Real)', () => {
  it('renders with placeholder', () => {
    render(<Input placeholder="Enter name" />);
    expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
  });

  it('renders as text input by default', () => {
    render(<Input data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'text');
  });

  it('renders with different types', () => {
    render(<Input type="email" data-testid="email-input" />);
    expect(screen.getByTestId('email-input')).toHaveAttribute('type', 'email');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled data-testid="disabled-input" />);
    expect(screen.getByTestId('disabled-input')).toBeDisabled();
  });

  it('accepts and displays value', () => {
    render(<Input value="test value" onChange={() => {}} data-testid="valued-input" />);
    expect(screen.getByDisplayValue('test value')).toBeInTheDocument();
  });

  it('handles change events', () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} data-testid="change-input" />);
    fireEvent.change(screen.getByTestId('change-input'), { target: { value: 'new value' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<Input className="custom-input" data-testid="styled-input" />);
    expect(screen.getByTestId('styled-input')).toHaveClass('custom-input');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<Input ref={ref} data-testid="ref-input" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('has correct default styling classes', () => {
    render(<Input data-testid="styled" />);
    const input = screen.getByTestId('styled');
    expect(input).toHaveClass('rounded-md', 'border', 'bg-background');
  });
});
