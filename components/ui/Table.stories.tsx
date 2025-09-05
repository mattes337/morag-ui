import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Checkbox } from './Checkbox';
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

const meta = {
  title: 'Components/Table',
  component: Table,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'bordered', 'striped'],
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg'],
    },
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleData = [
  {
    id: '1',
    invoice: 'INV001',
    status: 'Paid',
    method: 'Credit Card',
    amount: '$250.00',
  },
  {
    id: '2',
    invoice: 'INV002',
    status: 'Pending',
    method: 'PayPal',
    amount: '$150.00',
  },
  {
    id: '3',
    invoice: 'INV003',
    status: 'Unpaid',
    method: 'Bank Transfer',
    amount: '$350.00',
  },
  {
    id: '4',
    invoice: 'INV004',
    status: 'Paid',
    method: 'Credit Card',
    amount: '$450.00',
  },
  {
    id: '5',
    invoice: 'INV005',
    status: 'Paid',
    method: 'PayPal',
    amount: '$550.00',
  },
];

export const Default: Story = {
  render: (args) => (
    <Table {...args}>
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleData.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">{invoice.invoice}</TableCell>
            <TableCell>{invoice.status}</TableCell>
            <TableCell>{invoice.method}</TableCell>
            <TableCell className="text-right">{invoice.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const Bordered: Story = {
  render: () => (
    <Table variant="bordered">
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleData.slice(0, 3).map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">{invoice.invoice}</TableCell>
            <TableCell>{invoice.status}</TableCell>
            <TableCell>{invoice.method}</TableCell>
            <TableCell className="text-right">{invoice.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const Striped: Story = {
  render: () => (
    <Table variant="striped">
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleData.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">{invoice.invoice}</TableCell>
            <TableCell>{invoice.status}</TableCell>
            <TableCell>{invoice.method}</TableCell>
            <TableCell className="text-right">{invoice.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const Small: Story = {
  render: () => (
    <Table size="sm">
      <TableCaption>A compact table with small text.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleData.slice(0, 3).map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">{invoice.invoice}</TableCell>
            <TableCell>{invoice.status}</TableCell>
            <TableCell className="text-right">{invoice.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const Large: Story = {
  render: () => (
    <Table size="lg">
      <TableCaption>A larger table with increased text size.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleData.slice(0, 3).map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">{invoice.invoice}</TableCell>
            <TableCell>{invoice.status}</TableCell>
            <TableCell className="text-right">{invoice.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const WithSorting: Story = {
  render: () => {
    const [sortKey, setSortKey] = React.useState<string>('');
    const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
    
    const handleSort = (key: string, direction: 'asc' | 'desc') => {
      setSortKey(key);
      setSortDirection(direction);
    };

    const sortedData = React.useMemo(() => {
      if (!sortKey) return sampleData;
      
      return [...sampleData].sort((a, b) => {
        const aValue = a[sortKey as keyof typeof a];
        const bValue = b[sortKey as keyof typeof b];
        
        if (sortDirection === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
    }, [sortKey, sortDirection]);

    return (
      <Table>
        <TableCaption>Click on column headers to sort the data.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead 
              sortable 
              sortKey="invoice" 
              onSort={handleSort}
              sortDirection={sortKey === 'invoice' ? sortDirection : null}
            >
              Invoice
            </TableHead>
            <TableHead 
              sortable 
              sortKey="status" 
              onSort={handleSort}
              sortDirection={sortKey === 'status' ? sortDirection : null}
            >
              Status
            </TableHead>
            <TableHead 
              sortable 
              sortKey="method" 
              onSort={handleSort}
              sortDirection={sortKey === 'method' ? sortDirection : null}
            >
              Method
            </TableHead>
            <TableHead 
              className="text-right"
              sortable 
              sortKey="amount" 
              onSort={handleSort}
              sortDirection={sortKey === 'amount' ? sortDirection : null}
            >
              Amount
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">{invoice.invoice}</TableCell>
              <TableCell>{invoice.status}</TableCell>
              <TableCell>{invoice.method}</TableCell>
              <TableCell className="text-right">{invoice.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  },
};

export const WithSelection: Story = {
  render: () => {
    const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());
    
    const handleSelectAll = (checked: boolean) => {
      if (checked) {
        setSelectedRows(new Set(sampleData.map(item => item.id)));
      } else {
        setSelectedRows(new Set());
      }
    };
    
    const handleSelectRow = (id: string, selected: boolean) => {
      const newSelection = new Set(selectedRows);
      if (selected) {
        newSelection.add(id);
      } else {
        newSelection.delete(id);
      }
      setSelectedRows(newSelection);
    };

    const allSelected = selectedRows.size === sampleData.length;
    const someSelected = selectedRows.size > 0 && selectedRows.size < sampleData.length;

    return (
      <Table>
        <TableCaption>
          Table with row selection. {selectedRows.size} of {sampleData.length} rows selected.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sampleData.map((invoice) => (
            <TableRow 
              key={invoice.id}
              selectable
              onSelect={(selected) => handleSelectRow(invoice.id, selected)}
            >
              <TableCell>
                <Checkbox
                  checked={selectedRows.has(invoice.id)}
                  onCheckedChange={(checked) => handleSelectRow(invoice.id, checked as boolean)}
                  aria-label={`Select invoice ${invoice.invoice}`}
                />
              </TableCell>
              <TableCell className="font-medium">{invoice.invoice}</TableCell>
              <TableCell>{invoice.status}</TableCell>
              <TableCell>{invoice.method}</TableCell>
              <TableCell className="text-right">{invoice.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  },
};

export const WithHoverableRows: Story = {
  render: () => (
    <Table>
      <TableCaption>Table with hoverable rows.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleData.slice(0, 4).map((invoice) => (
          <TableRow key={invoice.id} hoverable>
            <TableCell className="font-medium">{invoice.invoice}</TableCell>
            <TableCell>{invoice.status}</TableCell>
            <TableCell>{invoice.method}</TableCell>
            <TableCell className="text-right">{invoice.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Table>
      <TableCaption>Table with footer totals.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleData.slice(0, 3).map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">{invoice.invoice}</TableCell>
            <TableCell>{invoice.status}</TableCell>
            <TableCell>{invoice.method}</TableCell>
            <TableCell className="text-right">{invoice.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right font-medium">$750.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

export const Empty: Story = {
  render: () => (
    <Table>
      <TableCaption>Empty table with no data.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
            No results.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};