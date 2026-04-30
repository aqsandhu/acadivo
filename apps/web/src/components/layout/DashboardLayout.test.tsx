import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/dashboard',
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: vi.fn() },
  }),
}));

describe('DashboardLayout', () => {
  it('renders sidebar with navigation items', () => {
    render(
      <DashboardLayout>
        <div data-testid="dashboard-content">Dashboard Content</div>
      </DashboardLayout>
    );
    expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
  });

  it('renders app name in sidebar', () => {
    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );
    expect(screen.getByText('app.name')).toBeInTheDocument();
  });

  it('renders mobile menu button', () => {
    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );
    expect(screen.getByText('nav.dashboard')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <DashboardLayout>
        <div data-testid="test-child">Test Child Content</div>
      </DashboardLayout>
    );
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });
});
