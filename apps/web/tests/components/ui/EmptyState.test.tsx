import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../test-utils';
import { EmptyState } from '@/components/ui/EmptyState';

describe('EmptyState Component (Real)', () => {
  it('renders with default title and description', () => {
    render(<EmptyState />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
    expect(screen.getByText('There are no items to display at the moment.')).toBeInTheDocument();
  });

  it('renders with custom title and description', () => {
    render(<EmptyState title="No Students" description="Add students to get started." />);
    expect(screen.getByText('No Students')).toBeInTheDocument();
    expect(screen.getByText('Add students to get started.')).toBeInTheDocument();
  });

  it('renders with custom icon', () => {
    render(<EmptyState icon={<span data-testid="custom-icon">X</span>} />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders action button when actionLabel and onAction are provided', () => {
    const handleAction = vi.fn();
    render(<EmptyState actionLabel="Add Item" onAction={handleAction} />);
    const button = screen.getByText('Add Item');
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('does not render action button when onAction is missing', () => {
    render(<EmptyState actionLabel="Add Item" />);
    expect(screen.queryByText('Add Item')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<EmptyState className="custom-empty" data-testid="empty" />);
    expect(screen.getByTestId('empty')).toHaveClass('custom-empty');
  });

  it('renders with empty description when not provided', () => {
    render(<EmptyState title="Empty" />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
    expect(screen.getByText('There are no items to display at the moment.')).toBeInTheDocument();
  });

  it('handles multiple action clicks', () => {
    const handleAction = vi.fn();
    render(<EmptyState actionLabel="Retry" onAction={handleAction} />);
    const button = screen.getByText('Retry');
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);
    expect(handleAction).toHaveBeenCalledTimes(3);
  });
});
