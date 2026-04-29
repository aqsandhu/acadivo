import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../test-utils';
import { Badge } from '@/components/ui/badge';

describe('Badge Component (Real)', () => {
  it('renders with default variant', () => {
    render(<Badge>Default Badge</Badge>);
    expect(screen.getByText('Default Badge')).toBeInTheDocument();
  });

  it('renders with secondary variant', () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    expect(screen.getByText('Secondary')).toBeInTheDocument();
  });

  it('renders with destructive variant', () => {
    render(<Badge variant="destructive">Destructive</Badge>);
    expect(screen.getByText('Destructive')).toBeInTheDocument();
  });

  it('renders with outline variant', () => {
    render(<Badge variant="outline">Outline</Badge>);
    expect(screen.getByText('Outline')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Badge className="custom-badge-class">Styled</Badge>);
    const badge = screen.getByText('Styled');
    expect(badge).toHaveClass('custom-badge-class');
  });

  it('renders children correctly', () => {
    render(<Badge><span data-testid="child">Child</span></Badge>);
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('is accessible as a div element', () => {
    render(<Badge role="status">Status</Badge>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders numbers as children', () => {
    render(<Badge>{42}</Badge>);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders with icon and text together', () => {
    render(
      <Badge>
        <svg data-testid="icon" />
        Notification
      </Badge>
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('Notification')).toBeInTheDocument();
  });
});
