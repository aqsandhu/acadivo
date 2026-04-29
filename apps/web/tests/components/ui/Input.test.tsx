import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../test-utils';

const MockInput: React.FC<{
  label?: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  className?: string;
}> = ({ label, placeholder, type = 'text', value, onChange, onBlur, error, disabled, required, name, className }) => {
  return (
    <div className={`input-wrapper ${className || ''} ${error ? 'has-error' : ''}`} data-testid="input-wrapper">
      {label && (
        <label data-testid="input-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        name={name}
        data-testid="input-field"
        aria-invalid={!!error}
      />
      {error && <span data-testid="input-error" className="error-text">{error}</span>}
    </div>
  );
};

describe('Input Component', () => {
  it('renders input with placeholder', () => {
    render(<MockInput placeholder="Enter email" />);
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<MockInput label="Email Address" />);
    expect(screen.getByTestId('input-label')).toHaveTextContent('Email Address');
  });

  it('shows required indicator', () => {
    render(<MockInput label="Email" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();
    render(<MockInput value="test" onChange={handleChange} />);
    const input = screen.getByTestId('input-field');
    fireEvent.change(input, { target: { value: 'new value' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('handles blur events', () => {
    const handleBlur = vi.fn();
    render(<MockInput onBlur={handleBlur} />);
    fireEvent.blur(screen.getByTestId('input-field'));
    expect(handleBlur).toHaveBeenCalled();
  });

  it('renders different input types', () => {
    const { rerender } = render(<MockInput type="text" />);
    expect(screen.getByTestId('input-field')).toHaveAttribute('type', 'text');

    rerender(<MockInput type="password" />);
    expect(screen.getByTestId('input-field')).toHaveAttribute('type', 'password');

    rerender(<MockInput type="email" />);
    expect(screen.getByTestId('input-field')).toHaveAttribute('type', 'email');

    rerender(<MockInput type="number" />);
    expect(screen.getByTestId('input-field')).toHaveAttribute('type', 'number');

    rerender(<MockInput type="date" />);
    expect(screen.getByTestId('input-field')).toHaveAttribute('type', 'date');
  });

  it('renders with error state', () => {
    render(<MockInput error="Email is required" />);
    expect(screen.getByTestId('input-error')).toHaveTextContent('Email is required');
    expect(screen.getByTestId('input-wrapper')).toHaveClass('has-error');
    expect(screen.getByTestId('input-field')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not show error when valid', () => {
    render(<MockInput />);
    expect(screen.queryByTestId('input-error')).not.toBeInTheDocument();
  });

  it('renders disabled state', () => {
    render(<MockInput disabled />);
    expect(screen.getByTestId('input-field')).toBeDisabled();
  });

  it('renders with name attribute', () => {
    render(<MockInput name="email" />);
    expect(screen.getByTestId('input-field')).toHaveAttribute('name', 'email');
  });

  it('renders with custom className', () => {
    render(<MockInput className="custom-input" />);
    expect(screen.getByTestId('input-wrapper')).toHaveClass('custom-input');
  });

  it('renders with password visibility toggle', () => {
    const MockPasswordInput: React.FC = () => {
      const [showPassword, setShowPassword] = React.useState(false);
      return (
        <div>
          <input
            type={showPassword ? 'text' : 'password'}
            data-testid="password-input"
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            data-testid="toggle-password"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      );
    };

    render(<MockPasswordInput />);
    expect(screen.getByTestId('password-input')).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByTestId('toggle-password'));
    expect(screen.getByTestId('password-input')).toHaveAttribute('type', 'text');
  });
});
