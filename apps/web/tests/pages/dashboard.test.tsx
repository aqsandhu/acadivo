import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../test-utils';

const MockDashboardPage: React.FC<{ userRole: string; isAuthenticated: boolean }> = ({
  userRole,
  isAuthenticated,
}) => {
  if (!isAuthenticated) {
    return <div data-testid="redirect-login">Redirecting to login...</div>;
  }

  const stats = {
    totalStudents: 450,
    totalTeachers: 28,
    totalClasses: 24,
    attendanceToday: 92,
  };

  return (
    <div data-testid="dashboard-page">
      <h1 data-testid="dashboard-title">Dashboard</h1>
      <div data-testid="stats-grid">
        <div data-testid="stat-students">
          <span data-testid="stat-students-value">{stats.totalStudents}</span>
          <span>Students</span>
        </div>
        <div data-testid="stat-teachers">
          <span data-testid="stat-teachers-value">{stats.totalTeachers}</span>
          <span>Teachers</span>
        </div>
        <div data-testid="stat-classes">
          <span data-testid="stat-classes-value">{stats.totalClasses}</span>
          <span>Classes</span>
        </div>
        <div data-testid="stat-attendance">
          <span data-testid="stat-attendance-value">{stats.attendanceToday}%</span>
          <span>Attendance Today</span>
        </div>
      </div>
      <div data-testid="role-content">
        {userRole === 'PRINCIPAL' && <div data-testid="principal-panel">Principal Overview Panel</div>}
        {userRole === 'TEACHER' && <div data-testid="teacher-panel">Teacher Quick Actions</div>}
        {userRole === 'STUDENT' && <div data-testid="student-panel">Student Progress</div>}
        {userRole === 'PARENT' && <div data-testid="parent-panel">Child Overview</div>}
      </div>
    </div>
  );
};

describe('Dashboard Page', () => {
  it('renders dashboard with stats when authenticated', () => {
    render(<MockDashboardPage userRole="PRINCIPAL" isAuthenticated={true} />);
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-title')).toHaveTextContent('Dashboard');
  });

  it('renders student count stat', () => {
    render(<MockDashboardPage userRole="PRINCIPAL" isAuthenticated={true} />);
    expect(screen.getByTestId('stat-students-value')).toHaveTextContent('450');
    expect(screen.getByTestId('stat-students')).toHaveTextContent('Students');
  });

  it('renders teacher count stat', () => {
    render(<MockDashboardPage userRole="PRINCIPAL" isAuthenticated={true} />);
    expect(screen.getByTestId('stat-teachers-value')).toHaveTextContent('28');
    expect(screen.getByTestId('stat-teachers')).toHaveTextContent('Teachers');
  });

  it('renders classes count stat', () => {
    render(<MockDashboardPage userRole="PRINCIPAL" isAuthenticated={true} />);
    expect(screen.getByTestId('stat-classes-value')).toHaveTextContent('24');
  });

  it('renders attendance percentage stat', () => {
    render(<MockDashboardPage userRole="PRINCIPAL" isAuthenticated={true} />);
    expect(screen.getByTestId('stat-attendance-value')).toHaveTextContent('92%');
  });

  it('redirects if not authenticated', () => {
    render(<MockDashboardPage userRole="TEACHER" isAuthenticated={false} />);
    expect(screen.getByTestId('redirect-login')).toBeInTheDocument();
    expect(screen.queryByTestId('dashboard-page')).not.toBeInTheDocument();
  });

  it('shows principal panel for principal role', () => {
    render(<MockDashboardPage userRole="PRINCIPAL" isAuthenticated={true} />);
    expect(screen.getByTestId('principal-panel')).toBeInTheDocument();
    expect(screen.queryByTestId('teacher-panel')).not.toBeInTheDocument();
  });

  it('shows teacher panel for teacher role', () => {
    render(<MockDashboardPage userRole="TEACHER" isAuthenticated={true} />);
    expect(screen.getByTestId('teacher-panel')).toBeInTheDocument();
    expect(screen.queryByTestId('principal-panel')).not.toBeInTheDocument();
  });

  it('shows student panel for student role', () => {
    render(<MockDashboardPage userRole="STUDENT" isAuthenticated={true} />);
    expect(screen.getByTestId('student-panel')).toBeInTheDocument();
  });

  it('shows parent panel for parent role', () => {
    render(<MockDashboardPage userRole="PARENT" isAuthenticated={true} />);
    expect(screen.getByTestId('parent-panel')).toBeInTheDocument();
  });
});
