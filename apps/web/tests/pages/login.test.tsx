import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '../test-utils';

const MockLoginPage: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 100));
    setLoading(false);
  };

  return (
    <div data-testid="login-page">
      <h1 data-testid="login-title">Welcome to Acadivo</h1>
      <p data-testid="login-subtitle">Sign in to your account</p>
      <form data-testid="login-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            data-testid="email-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            data-testid="password-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>
        {error && <div data-testid="login-error">{error}</div>}
        <button type="submit" data-testid="login-btn" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <a href="/forgot-password" data-testid="forgot-password-link">Forgot password?</a>
    </div>
  );
};

describe('Login Page', () => {
  it('renders login form', () => {
    render(<MockLoginPage />);
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.getByTestId('login-title')).toHaveTextContent('Welcome to Acadivo');
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  it('renders email and password inputs', () => {
    render(<MockLoginPage />);
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('shows error for empty fields', async () => {
    render(<MockLoginPage />);
    fireEvent.click(screen.getByTestId('login-btn'));
    await waitFor(() => {
      expect(screen.getByTestId('login-error')).toHaveTextContent('Please fill in all fields');
    });
  });

  it('shows error for invalid email', async () => {
    render(<MockLoginPage />);
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'not-an-email' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByTestId('login-btn'));
    await waitFor(() => {
      expect(screen.getByTestId('login-error')).toHaveTextContent('Please enter a valid email');
    });
  });

  it('shows error for short password', async () => {
    render(<MockLoginPage />);
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'test@school.edu.pk' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'short' } });
    fireEvent.click(screen.getByTestId('login-btn'));
    await waitFor(() => {
      expect(screen.getByTestId('login-error')).toHaveTextContent('Password must be at least 8 characters');
    });
  });

  it('submits form with valid data', async () => {
    render(<MockLoginPage />);
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'teacher@school.edu.pk' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'SecurePass123!' } });
    fireEvent.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('login-btn')).toHaveTextContent('Signing in...');
    });

    await waitFor(() => {
      expect(screen.getByTestId('login-btn')).toHaveTextContent('Sign In');
    });
  });

  it('renders forgot password link', () => {
    render(<MockLoginPage />);
    expect(screen.getByTestId('forgot-password-link')).toHaveAttribute('href', '/forgot-password');
    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
  });

  it('shows loading state during submission', async () => {
    render(<MockLoginPage />);
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'test@school.edu.pk' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'SecurePass123!' } });
    fireEvent.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('login-btn')).toBeDisabled();
      expect(screen.getByTestId('login-btn')).toHaveTextContent('Signing in...');
    });
  });

  it('clears error when user starts typing', async () => {
    render(<MockLoginPage />);
    fireEvent.click(screen.getByTestId('login-btn'));
    await waitFor(() => {
      expect(screen.getByTestId('login-error')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'a' } });
    await waitFor(() => {
      expect(screen.queryByTestId('login-error')).not.toBeInTheDocument();
    });
  });
});
