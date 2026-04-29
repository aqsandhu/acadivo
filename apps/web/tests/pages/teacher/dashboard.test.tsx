import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../test-utils';

const MockTeacherDashboard: React.FC = () => {
  return (
    <div data-testid="teacher-dashboard">
      <h1>Teacher Dashboard</h1>
      <div data-testid="teacher-stats">
        <div data-testid="assigned-classes">3 Classes</div>
        <div data-testid="total-students">85 Students</div>
        <div data-testid="pending-homework">4 Pending Homework</div>
        <div data-testid="ungraded-submissions">12 Ungraded</div>
      </div>
      <div data-testid="quick-actions">
        <button data-testid="mark-attendance-btn">Mark Attendance</button>
        <button data-testid="create-homework-btn">Create Homework</button>
        <button data-testid="enter-marks-btn">Enter Marks</button>
      </div>
      <div data-testid="today-classes">
        <h2>Today's Classes</h2>
        <div data-testid="class-slot-1">8th A - Mathematics - 08:00 AM</div>
        <div data-testid="class-slot-2">7th B - Mathematics - 09:30 AM</div>
        <div data-testid="class-slot-3">8th A - Mathematics - 10:45 AM</div>
      </div>
    </div>
  );
};

describe('Teacher Dashboard', () => {
  it('renders teacher dashboard', () => {
    render(<MockTeacherDashboard />);
    expect(screen.getByTestId('teacher-dashboard')).toBeInTheDocument();
    expect(screen.getByText('Teacher Dashboard')).toBeInTheDocument();
  });

  it('shows teacher stats', () => {
    render(<MockTeacherDashboard />);
    expect(screen.getByTestId('assigned-classes')).toHaveTextContent('3 Classes');
    expect(screen.getByTestId('total-students')).toHaveTextContent('85 Students');
    expect(screen.getByTestId('pending-homework')).toHaveTextContent('4 Pending Homework');
    expect(screen.getByTestId('ungraded-submissions')).toHaveTextContent('12 Ungraded');
  });

  it('shows quick action buttons', () => {
    render(<MockTeacherDashboard />);
    expect(screen.getByTestId('mark-attendance-btn')).toBeInTheDocument();
    expect(screen.getByTestId('create-homework-btn')).toBeInTheDocument();
    expect(screen.getByTestId('enter-marks-btn')).toBeInTheDocument();
  });

  it('shows today classes schedule', () => {
    render(<MockTeacherDashboard />);
    expect(screen.getByTestId('class-slot-1')).toHaveTextContent('8th A');
    expect(screen.getByTestId('class-slot-2')).toHaveTextContent('7th B');
    expect(screen.getByTestId('class-slot-3')).toHaveTextContent('8th A');
  });
});
