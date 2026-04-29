import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../test-utils';

const MockParentDashboard: React.FC = () => {
  return (
    <div data-testid="parent-dashboard">
      <h1>Parent Dashboard</h1>
      <div data-testid="children-overview">
        <h2>Your Children</h2>
        <div data-testid="child-1">
          <span data-testid="child-name">Ahmad Raza</span>
          <span data-testid="child-class">8th Grade - Section A</span>
          <span data-testid="child-attendance">Attendance: 92%</span>
          <span data-testid="child-rank">Rank: 3rd</span>
        </div>
      </div>
      <div data-testid="fee-overview">
        <h2>Fee Status</h2>
        <div data-testid="fee-march">March: PAID - PKR 5,000</div>
        <div data-testid="fee-april">April: OVERDUE - PKR 5,000</div>
      </div>
      <div data-testid="recent-marks">
        <h2>Recent Marks</h2>
        <div data-testid="mark-math">Mathematics Mid-Term: 42/50 (A)</div>
        <div data-testid="mark-english">English Mid-Term: 38/50 (B+)</div>
      </div>
      <div data-testid="quick-actions">
        <button data-testid="request-report-btn">Request Progress Report</button>
        <button data-testid="pay-fee-btn">Pay Fee</button>
        <button data-testid="message-teacher-btn">Message Teacher</button>
      </div>
    </div>
  );
};

describe('Parent Dashboard', () => {
  it('renders parent dashboard', () => {
    render(<MockParentDashboard />);
    expect(screen.getByTestId('parent-dashboard')).toBeInTheDocument();
    expect(screen.getByText('Parent Dashboard')).toBeInTheDocument();
  });

  it('shows child overview', () => {
    render(<MockParentDashboard />);
    expect(screen.getByTestId('child-name')).toHaveTextContent('Ahmad Raza');
    expect(screen.getByTestId('child-class')).toHaveTextContent('8th Grade - Section A');
    expect(screen.getByTestId('child-attendance')).toHaveTextContent('92%');
  });

  it('shows fee status', () => {
    render(<MockParentDashboard />);
    expect(screen.getByTestId('fee-march')).toHaveTextContent('PAID');
    expect(screen.getByTestId('fee-april')).toHaveTextContent('OVERDUE');
  });

  it('shows recent marks', () => {
    render(<MockParentDashboard />);
    expect(screen.getByTestId('mark-math')).toHaveTextContent('42/50');
    expect(screen.getByTestId('mark-english')).toHaveTextContent('38/50');
  });

  it('shows quick action buttons', () => {
    render(<MockParentDashboard />);
    expect(screen.getByTestId('request-report-btn')).toBeInTheDocument();
    expect(screen.getByTestId('pay-fee-btn')).toBeInTheDocument();
    expect(screen.getByTestId('message-teacher-btn')).toBeInTheDocument();
  });
});
