import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../test-utils';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from '@/components/ui/table';

describe('Table Component (Real)', () => {
  it('renders Table with content', () => {
    render(
      <Table>
        <TableCaption>Student List</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Grade</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John Doe</TableCell>
            <TableCell>10</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByText('Student List')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders with footer', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Item</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total: 5</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );
    expect(screen.getByText('Total: 5')).toBeInTheDocument();
  });

  it('applies custom className to Table', () => {
    render(<Table className="custom-table" data-testid="table">Content</Table>);
    expect(screen.getByTestId('table')).toHaveClass('custom-table');
  });

  it('renders multiple rows', () => {
    render(
      <Table>
        <TableBody>
          <TableRow><TableCell>Row 1</TableCell></TableRow>
          <TableRow><TableCell>Row 2</TableCell></TableRow>
          <TableRow><TableCell>Row 3</TableCell></TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByText('Row 1')).toBeInTheDocument();
    expect(screen.getByText('Row 2')).toBeInTheDocument();
    expect(screen.getByText('Row 3')).toBeInTheDocument();
  });

  it('has correct semantic table structure', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Data</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
