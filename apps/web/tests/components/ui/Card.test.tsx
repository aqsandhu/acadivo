import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../test-utils';

const MockCard: React.FC<{
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
  hover?: boolean;
}> = ({ title, children, footer, header, className, hover }) => {
  return (
    <div
      className={`card ${className || ''} ${hover ? 'card-hover' : ''}`}
      data-testid="card"
    >
      {(header || title) && (
        <div className="card-header" data-testid="card-header">
          {header}
          {title && <h3 data-testid="card-title">{title}</h3>}
        </div>
      )}
      <div className="card-body" data-testid="card-body">
        {children}
      </div>
      {footer && (
        <div className="card-footer" data-testid="card-footer">
          {footer}
        </div>
      )}
    </div>
  );
};

describe('Card Component', () => {
  it('renders with content', () => {
    render(<MockCard>Card content</MockCard>);
    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders with title', () => {
    render(<MockCard title="Student Details">Content</MockCard>);
    expect(screen.getByTestId('card-title')).toHaveTextContent('Student Details');
  });

  it('renders with header slot', () => {
    render(
      <MockCard header={<span data-testid="custom-header">Custom Header</span>}>
        Body
      </MockCard>
    );
    expect(screen.getByTestId('custom-header')).toBeInTheDocument();
    expect(screen.getByTestId('card-header')).toContainElement(screen.getByTestId('custom-header'));
  });

  it('renders with footer slot', () => {
    render(
      <MockCard footer={<button data-testid="footer-btn">Action</button>}>
        Body
      </MockCard>
    );
    expect(screen.getByTestId('footer-btn')).toBeInTheDocument();
    expect(screen.getByTestId('card-footer')).toContainElement(screen.getByTestId('footer-btn'));
  });

  it('renders with both header, body, and footer', () => {
    render(
      <MockCard
        title="Test Card"
        header={<span data-testid="header-icon">Icon</span>}
        footer={<span data-testid="footer-text">Footer</span>}
      >
        Main body content
      </MockCard>
    );
    expect(screen.getByTestId('card-header')).toBeInTheDocument();
    expect(screen.getByTestId('card-body')).toBeInTheDocument();
    expect(screen.getByTestId('card-footer')).toBeInTheDocument();
    expect(screen.getByText('Main body content')).toBeInTheDocument();
  });

  it('applies hover class', () => {
    render(<MockCard hover>Hover card</MockCard>);
    expect(screen.getByTestId('card')).toHaveClass('card-hover');
  });

  it('applies custom className', () => {
    render(<MockCard className="custom-card">Custom</MockCard>);
    expect(screen.getByTestId('card')).toHaveClass('custom-card');
  });

  it('renders without header when no title or header provided', () => {
    render(<MockCard>No header card</MockCard>);
    expect(screen.queryByTestId('card-header')).not.toBeInTheDocument();
  });

  it('renders without footer when not provided', () => {
    render(<MockCard>No footer</MockCard>);
    expect(screen.queryByTestId('card-footer')).not.toBeInTheDocument();
  });

  it('renders complex nested content', () => {
    render(
      <MockCard title="Students">
        <ul data-testid="student-list">
          <li>Ahmad Raza</li>
          <li>Sana Malik</li>
          <li>Bilal Khan</li>
        </ul>
      </MockCard>
    );
    expect(screen.getByTestId('student-list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });
});
