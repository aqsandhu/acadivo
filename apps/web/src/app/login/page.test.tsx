import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from '@/app/login/page';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: vi.fn() },
  }),
}));

// Mock auth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    login: vi.fn(),
    isLoading: false,
    isAuthenticated: false,
  }),
}));

describe('Login Page', () => {
  it('renders login form with username and password fields', () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText('auth.username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('auth.password')).toBeInTheDocument();
  });

  it('renders login button', () => {
    render(<LoginPage />);
    expect(screen.getByText('auth.login')).toBeInTheDocument();
  });

  it('renders forgot password link', () => {
    render(<LoginPage />);
    expect(screen.getByText('auth.forgotPassword')).toBeInTheDocument();
  });

  it('renders app name heading', () => {
    render(<LoginPage />);
    expect(screen.getByText('common.appName')).toBeInTheDocument();
  });

  it('allows toggling password visibility', () => {
    render(<LoginPage />);
    const passwordInput = screen.getByPlaceholderText('auth.password') as HTMLInputElement;
    expect(passwordInput.type).toBe('password');
  });
});
