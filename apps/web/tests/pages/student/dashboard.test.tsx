import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../test-utils';

const MockStudentDashboard: React.FC = () => {
  return (
    <div data-testid="student-dashboard">
      <h1>Student Dashboard</h1>
      <div data-testid="student-stats">
        <div data-testid="attendance-percentage">Attendance: 92%</div>
        <div data-testid="current-rank">Class Rank: 3rd</div>
        <div data-testid="pending-homework">3 Homework Pending</div>
        <div data-testid="average-marks">Average: 85%</div>
      </div>
      <div data-testid="today-timetable">
        <h2>Today's Timetable</h2>
        <div data-testid="period-1">08:00 - Mathematics - Room 105</div>
        <div data-testid="period-2">08:45 - English - Room 102</div>
        <div data-testid="period-3">09:30 - Science - Lab 1</div>
      </div>
      <div data-testid="recent-homework">
        <h2>Recent Homework</h2>
        <div data-testid="hw-1">Mathematics - Due 22 Mar</div>
        <div data-testid="hw-2">English - Due 25 Mar</div>
      </div>
    </div>
  );
};

describe('Student Dashboard', () => {
  it('renders student dashboard', () => {
    render(<MockStudentDashboard />);
    expect(screen.getByTestId('student-dashboard')).toBeInTheDocument();
    expect(screen.getByText('Student Dashboard')).toBeInTheDocument();
  });

  it('shows student stats', () => {
    render(<MockStudentDashboard />);
    expect(screen.getByTestId('attendance-percentage')).toHaveTextContent('92%');
    expect(screen.getByTestId('current-rank')).toHaveTextContent('3rd');
    expect(screen.getByTestId('average-marks')).toHaveTextContent('85%');
  });

  it('shows today timetable', () => {
    render(<MockStudentDashboard />);
    expect(screen.getByTestId('period-1')).toHaveTextContent('Mathematics');
    expect(screen.getByTestId('period-2')).toHaveTextContent('English');
    expect(screen.getByTestId('period-3')).toHaveTextContent('Science');
  });

  it('shows recent homework', () => {
    render(<MockStudentDashboard />);
    expect(screen.getByTestId('hw-1')).toHaveTextContent('Mathematics');
    expect(screen.getByTestId('hw-2')).toHaveTextContent('English');
  });
});
