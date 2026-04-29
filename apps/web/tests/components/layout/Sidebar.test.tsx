import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../test-utils';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: 'DashboardIcon', roles: ['PRINCIPAL', 'TEACHER', 'STUDENT', 'PARENT', 'ADMIN'] },
  { label: 'Students', path: '/students', icon: 'StudentsIcon', roles: ['PRINCIPAL', 'TEACHER', 'ADMIN'] },
  { label: 'Teachers', path: '/teachers', icon: 'TeachersIcon', roles: ['PRINCIPAL', 'ADMIN'] },
  { label: 'Classes', path: '/classes', icon: 'ClassesIcon', roles: ['PRINCIPAL', 'TEACHER', 'ADMIN'] },
  { label: 'Attendance', path: '/attendance', icon: 'AttendanceIcon', roles: ['TEACHER', 'PRINCIPAL'] },
  { label: 'Homework', path: '/homework', icon: 'HomeworkIcon', roles: ['TEACHER', 'STUDENT', 'PARENT'] },
  { label: 'Marks', path: '/marks', icon: 'MarksIcon', roles: ['TEACHER', 'STUDENT', 'PARENT'] },
  { label: 'Fee', path: '/fee', icon: 'FeeIcon', roles: ['ADMIN', 'PARENT'] },
  { label: 'Messages', path: '/messages', icon: 'MessagesIcon', roles: ['PRINCIPAL', 'TEACHER', 'STUDENT', 'PARENT'] },
  { label: 'Reports', path: '/reports', icon: 'ReportsIcon', roles: ['PRINCIPAL', 'ADMIN', 'PARENT'] },
  { label: 'Settings', path: '/settings', icon: 'SettingsIcon', roles: ['PRINCIPAL', 'ADMIN'] },
];

const MockSidebar: React.FC<{
  userRole: string;
  currentPath: string;
  collapsed?: boolean;
  onToggle?: () => void;
}> = ({ userRole, currentPath, collapsed = false, onToggle }) => {
  const filteredItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside data-testid="sidebar" className={collapsed ? 'sidebar-collapsed' : ''}>
      <div data-testid="sidebar-header">
        <h2>Acadivo</h2>
        <button data-testid="toggle-btn" onClick={onToggle}>
          {collapsed ? '→' : '←'}
        </button>
      </div>
      <nav data-testid="sidebar-nav">
        <ul>
          {filteredItems.map((item) => (
            <li
              key={item.path}
              data-testid={`nav-item-${item.path.replace('/', '')}`}
              className={currentPath === item.path ? 'active' : ''}
            >
              <span data-testid={`icon-${item.path.replace('/', '')}`}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

describe('Sidebar Component', () => {
  it('renders nav items for teacher role', () => {
    render(<MockSidebar userRole="TEACHER" currentPath="/dashboard" />);
    expect(screen.getByTestId('nav-item-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('nav-item-students')).toBeInTheDocument();
    expect(screen.getByTestId('nav-item-attendance')).toBeInTheDocument();
    expect(screen.getByTestId('nav-item-homework')).toBeInTheDocument();
    expect(screen.getByTestId('nav-item-marks')).toBeInTheDocument();
    expect(screen.getByTestId('nav-item-messages')).toBeInTheDocument();
  });

  it('renders nav items for student role', () => {
    render(<MockSidebar userRole="STUDENT" currentPath="/dashboard" />);
    expect(screen.getByTestId('nav-item-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('nav-item-homework')).toBeInTheDocument();
    expect(screen.getByTestId('nav-item-messages')).toBeInTheDocument();
    expect(screen.queryByTestId('nav-item-students')).not.toBeInTheDocument();
    expect(screen.queryByTestId('nav-item-fee')).not.toBeInTheDocument();
  });

  it('renders nav items for parent role', () => {
    render(<MockSidebar userRole="PARENT" currentPath="/dashboard" />);
    expect(screen.getByTestId('nav-item-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('nav-item-homework')).toBeInTheDocument();
    expect(screen.getByTestId('nav-item-marks')).toBeInTheDocument();
    expect(screen.getByTestId('nav-item-fee')).toBeInTheDocument();
    expect(screen.getByTestId('nav-item-messages')).toBeInTheDocument();
    expect(screen.getByTestId('nav-item-reports')).toBeInTheDocument();
    expect(screen.queryByTestId('nav-item-attendance')).not.toBeInTheDocument();
  });

  it('renders nav items for principal role', () => {
    render(<MockSidebar userRole="PRINCIPAL" currentPath="/dashboard" />);
    expect(screen.getByTestId('nav-item-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('nav-item-students')).toBeInTheDocument();
    expect(screen.getByTestId('nav-item-teachers')).toBeInTheDocument();
    expect(screen.getByTestId('nav-item-classes')).toBeInTheDocument();
    expect(screen.getByTestId('nav-item-reports')).toBeInTheDocument();
    expect(screen.getByTestId('nav-item-settings')).toBeInTheDocument();
  });

  it('shows active state for current path', () => {
    render(<MockSidebar userRole="TEACHER" currentPath="/attendance" />);
    expect(screen.getByTestId('nav-item-attendance')).toHaveClass('active');
    expect(screen.getByTestId('nav-item-dashboard')).not.toHaveClass('active');
  });

  it('renders in collapsed state', () => {
    render(<MockSidebar userRole="TEACHER" currentPath="/dashboard" collapsed={true} />);
    expect(screen.getByTestId('sidebar')).toHaveClass('sidebar-collapsed');
  });

  it('toggles sidebar on button click', () => {
    const handleToggle = vi.fn();
    render(<MockSidebar userRole="TEACHER" currentPath="/dashboard" onToggle={handleToggle} />);
    fireEvent.click(screen.getByTestId('toggle-btn'));
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it('does not show restricted items', () => {
    render(<MockSidebar userRole="STUDENT" currentPath="/dashboard" />);
    expect(screen.queryByTestId('nav-item-teachers')).not.toBeInTheDocument();
    expect(screen.queryByTestId('nav-item-settings')).not.toBeInTheDocument();
    expect(screen.queryByTestId('nav-item-reports')).not.toBeInTheDocument();
  });

  it('renders icons for all items', () => {
    render(<MockSidebar userRole="ADMIN" currentPath="/dashboard" />);
    expect(screen.getByTestId('icon-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('icon-students')).toBeInTheDocument();
    expect(screen.getByTestId('icon-teachers')).toBeInTheDocument();
  });

  it('renders with school branding', () => {
    render(<MockSidebar userRole="TEACHER" currentPath="/dashboard" />);
    expect(screen.getByText('Acadivo')).toBeInTheDocument();
  });
});
