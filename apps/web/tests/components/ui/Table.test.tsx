import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../test-utils';

interface TableColumn {
  key: string;
  title: string;
  sortable?: boolean;
}

interface TableProps {
  columns: TableColumn[];
  data: Record<string, any>[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
  };
  sorting?: {
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    onSort: (key: string) => void;
  };
  emptyMessage?: string;
  loading?: boolean;
}

const MockTable: React.FC<TableProps> = ({
  columns,
  data,
  pagination,
  sorting,
  emptyMessage = 'No data available',
  loading,
}) => {
  return (
    <div data-testid="table-container">
      {loading ? (
        <div data-testid="table-loading">Loading...</div>
      ) : (
        <>
          <table data-testid="data-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    data-testid={`col-header-${col.key}`}
                    onClick={() => col.sortable && sorting?.onSort(col.key)}
                    style={{ cursor: col.sortable ? 'pointer' : 'default' }}
                  >
                    {col.title}
                    {sorting?.sortBy === col.key && (
                      <span data-testid={`sort-indicator-${col.key}`}>
                        {sorting.sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} data-testid="empty-message">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row, index) => (
                  <tr key={index} data-testid={`row-${index}`}>
                    {columns.map((col) => (
                      <td key={col.key} data-testid={`cell-${index}-${col.key}`}>
                        {row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {pagination && (
            <div data-testid="pagination" className="pagination">
              <button
                data-testid="prev-page"
                disabled={pagination.page <= 1}
                onClick={() => pagination.onPageChange(pagination.page - 1)}
              >
                Previous
              </button>
              <span data-testid="page-info">
                Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
              </span>
              <button
                data-testid="next-page"
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                onClick={() => pagination.onPageChange(pagination.page + 1)}
              >
                Next
              </button>
              <select
                data-testid="limit-select"
                value={pagination.limit}
                onChange={(e) => pagination.onLimitChange(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const mockColumns: TableColumn[] = [
  { key: 'name', title: 'Name', sortable: true },
  { key: 'rollNumber', title: 'Roll Number', sortable: true },
  { key: 'class', title: 'Class', sortable: false },
  { key: 'attendance', title: 'Attendance %', sortable: true },
];

const mockData = [
  { name: 'Ahmad Raza', rollNumber: 'R-2024-008-A', class: '8th Grade', attendance: 92 },
  { name: 'Sana Malik', rollNumber: 'R-2024-008-B', class: '8th Grade', attendance: 95 },
  { name: 'Bilal Khan', rollNumber: 'R-2024-007-A', class: '7th Grade', attendance: 88 },
];

describe('Table Component', () => {
  it('renders table with data', () => {
    render(<MockTable columns={mockColumns} data={mockData} />);
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(4); // header + 3 data rows
  });

  it('renders column headers', () => {
    render(<MockTable columns={mockColumns} data={mockData} />);
    expect(screen.getByTestId('col-header-name')).toHaveTextContent('Name');
    expect(screen.getByTestId('col-header-rollNumber')).toHaveTextContent('Roll Number');
    expect(screen.getByTestId('col-header-class')).toHaveTextContent('Class');
  });

  it('renders data cells correctly', () => {
    render(<MockTable columns={mockColumns} data={mockData} />);
    expect(screen.getByTestId('cell-0-name')).toHaveTextContent('Ahmad Raza');
    expect(screen.getByTestId('cell-1-rollNumber')).toHaveTextContent('R-2024-008-B');
    expect(screen.getByTestId('cell-2-class')).toHaveTextContent('7th Grade');
  });

  it('renders empty state message', () => {
    render(<MockTable columns={mockColumns} data={[]} emptyMessage="No students found" />);
    expect(screen.getByTestId('empty-message')).toHaveTextContent('No students found');
  });

  it('renders loading state', () => {
    render(<MockTable columns={mockColumns} data={mockData} loading />);
    expect(screen.getByTestId('table-loading')).toBeInTheDocument();
    expect(screen.queryByTestId('data-table')).not.toBeInTheDocument();
  });

  it('handles pagination', () => {
    const onPageChange = vi.fn();
    const onLimitChange = vi.fn();

    render(
      <MockTable
        columns={mockColumns}
        data={mockData}
        pagination={{
          page: 1,
          limit: 10,
          total: 45,
          onPageChange,
          onLimitChange,
        }}
      />
    );

    expect(screen.getByTestId('page-info')).toHaveTextContent('Page 1 of 5');
    expect(screen.getByTestId('prev-page')).toBeDisabled();
    expect(screen.getByTestId('next-page')).toBeEnabled();
  });

  it('navigates to next page', () => {
    const onPageChange = vi.fn();

    render(
      <MockTable
        columns={mockColumns}
        data={mockData}
        pagination={{
          page: 1,
          limit: 10,
          total: 45,
          onPageChange,
          onLimitChange: vi.fn(),
        }}
      />
    );

    fireEvent.click(screen.getByTestId('next-page'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('navigates to previous page', () => {
    const onPageChange = vi.fn();

    render(
      <MockTable
        columns={mockColumns}
        data={mockData}
        pagination={{
          page: 3,
          limit: 10,
          total: 45,
          onPageChange,
          onLimitChange: vi.fn(),
        }}
      />
    );

    fireEvent.click(screen.getByTestId('prev-page'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('disables next button on last page', () => {
    render(
      <MockTable
        columns={mockColumns}
        data={mockData}
        pagination={{
          page: 5,
          limit: 10,
          total: 45,
          onPageChange: vi.fn(),
          onLimitChange: vi.fn(),
        }}
      />
    );

    expect(screen.getByTestId('next-page')).toBeDisabled();
    expect(screen.getByTestId('prev-page')).toBeEnabled();
  });

  it('changes page limit', () => {
    const onLimitChange = vi.fn();

    render(
      <MockTable
        columns={mockColumns}
        data={mockData}
        pagination={{
          page: 1,
          limit: 10,
          total: 45,
          onPageChange: vi.fn(),
          onLimitChange,
        }}
      />
    );

    fireEvent.change(screen.getByTestId('limit-select'), { target: { value: '25' } });
    expect(onLimitChange).toHaveBeenCalledWith(25);
  });

  it('handles sorting', () => {
    const onSort = vi.fn();

    render(
      <MockTable
        columns={mockColumns}
        data={mockData}
        sorting={{
          sortBy: 'name',
          sortOrder: 'asc',
          onSort,
        }}
      />
    );

    expect(screen.getByTestId('sort-indicator-name')).toHaveTextContent('↑');
    fireEvent.click(screen.getByTestId('col-header-name'));
    expect(onSort).toHaveBeenCalledWith('name');
  });

  it('does not sort non-sortable columns', () => {
    const onSort = vi.fn();

    render(
      <MockTable
        columns={mockColumns}
        data={mockData}
        sorting={{
          sortBy: '',
          sortOrder: 'asc',
          onSort,
        }}
      />
    );

    fireEvent.click(screen.getByTestId('col-header-class'));
    expect(onSort).not.toHaveBeenCalled();
  });

  it('shows descending sort indicator', () => {
    render(
      <MockTable
        columns={mockColumns}
        data={mockData}
        sorting={{
          sortBy: 'attendance',
          sortOrder: 'desc',
          onSort: vi.fn(),
        }}
      />
    );

    expect(screen.getByTestId('sort-indicator-attendance')).toHaveTextContent('↓');
  });
});
