import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './Table';

describe('Table', () => {
  const mockData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', age: 30 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25 },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35 },
  ];

  const BasicTable = () => (
    <Table>
      <TableCaption>A list of users</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Age</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mockData.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.age}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  it('should render table structure correctly', () => {
    render(<BasicTable />);
    
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('A list of users')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Email' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Age' })).toBeInTheDocument();
  });

  it('should render table data correctly', () => {
    render(<BasicTable />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('should apply table variant styles', () => {
    render(
      <Table variant="bordered" data-testid="table">
        <TableBody>
          <TableRow>
            <TableCell>Test</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    
    const table = screen.getByTestId('table');
    expect(table).toHaveClass('border');
  });

  it('should apply table size styles', () => {
    render(
      <Table size="sm" data-testid="table">
        <TableBody>
          <TableRow>
            <TableCell>Test</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    
    const table = screen.getByTestId('table');
    expect(table).toHaveClass('text-xs');
  });

  it('should support sortable headers', async () => {
    const user = userEvent.setup();
    const onSort = jest.fn();
    
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead sortable sortKey="name" onSort={onSort}>
              Name
            </TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Test</TableCell>
            <TableCell>test@example.com</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    
    const sortableHeader = screen.getByRole('columnheader', { name: /Name/ });
    expect(sortableHeader).toHaveClass('cursor-pointer');
    
    await user.click(sortableHeader);
    expect(onSort).toHaveBeenCalledWith('name', 'asc');
  });

  it('should toggle sort direction on multiple clicks', async () => {
    const user = userEvent.setup();
    const onSort = jest.fn();
    
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead sortable sortKey="name" onSort={onSort}>
              Name
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Test</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    
    const sortableHeader = screen.getByRole('columnheader', { name: /Name/ });
    
    // First click - ascending
    await user.click(sortableHeader);
    expect(onSort).toHaveBeenCalledWith('name', 'asc');
    
    // Second click - descending
    await user.click(sortableHeader);
    expect(onSort).toHaveBeenCalledWith('name', 'desc');
    
    // Third click - ascending again
    await user.click(sortableHeader);
    expect(onSort).toHaveBeenCalledWith('name', 'asc');
  });

  it('should support row selection', async () => {
    const user = userEvent.setup();
    const onRowSelect = jest.fn();
    
    render(
      <Table>
        <TableBody>
          <TableRow selectable onSelect={onRowSelect} data-testid="row-1">
            <TableCell>
              <input type="checkbox" data-testid="checkbox-1" />
            </TableCell>
            <TableCell>John Doe</TableCell>
          </TableRow>
          <TableRow selectable onSelect={onRowSelect} data-testid="row-2">
            <TableCell>
              <input type="checkbox" data-testid="checkbox-2" />
            </TableCell>
            <TableCell>Jane Smith</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    
    const row = screen.getByTestId('row-1');
    expect(row).toHaveClass('cursor-pointer');
    
    await user.click(row);
    expect(onRowSelect).toHaveBeenCalledWith(true);
  });

  it('should support hover effects on rows', () => {
    render(
      <Table>
        <TableBody>
          <TableRow hoverable data-testid="row">
            <TableCell>Test</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    
    const row = screen.getByTestId('row');
    expect(row).toHaveClass('hover:bg-muted/50');
  });

  it('should support custom className', () => {
    render(
      <Table className="custom-table" data-testid="table">
        <TableBody>
          <TableRow>
            <TableCell>Test</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    
    const table = screen.getByTestId('table');
    expect(table).toHaveClass('custom-table');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLTableElement>();
    render(
      <Table ref={ref}>
        <TableBody>
          <TableRow>
            <TableCell>Test</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    
    expect(ref.current).toBeInstanceOf(HTMLTableElement);
  });

  it('should support table footer', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Data</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Footer content</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );
    
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('should handle keyboard navigation for sortable headers', async () => {
    const user = userEvent.setup();
    const onSort = jest.fn();
    
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead sortable sortKey="name" onSort={onSort}>
              Name
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Test</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    
    const sortableHeader = screen.getByRole('columnheader', { name: /Name/ });
    
    // Focus and press Enter
    sortableHeader.focus();
    await user.keyboard('{Enter}');
    expect(onSort).toHaveBeenCalledWith('name', 'asc');
    
    // Press Space
    await user.keyboard(' ');
    expect(onSort).toHaveBeenCalledWith('name', 'desc');
  });

  it('should have proper accessibility attributes', () => {
    render(
      <Table data-testid="table">
        <TableCaption>Test caption</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Test</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    
    const table = screen.getByTestId('table');
    expect(table).toHaveAttribute('role', 'table');
    
    const caption = screen.getByText('Test caption');
    expect(caption).toBeInTheDocument();
    
    const header = screen.getByRole('columnheader');
    expect(header).toHaveAttribute('scope', 'col');
  });

  it('should support striped variant', () => {
    render(
      <Table variant="striped" data-testid="table">
        <TableBody>
          <TableRow data-testid="row-1">
            <TableCell>Row 1</TableCell>
          </TableRow>
          <TableRow data-testid="row-2">
            <TableCell>Row 2</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    
    const table = screen.getByTestId('table');
    expect(table).toHaveClass('striped');
  });
});