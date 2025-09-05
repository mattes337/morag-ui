import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const tableVariants = cva(
  'w-full caption-bottom text-sm',
  {
    variants: {
      variant: {
        default: '',
        bordered: 'border border-border rounded-md',
        striped: 'striped',
      },
      size: {
        sm: 'text-xs',
        default: 'text-sm',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const tableHeaderVariants = cva(
  '[&_tr]:border-b'
);

const tableBodyVariants = cva(
  '[&_tr:last-child]:border-0'
);

const tableFooterVariants = cva(
  'border-t bg-muted/50 font-medium [&>tr]:last:border-b-0'
);

const tableRowVariants = cva(
  'border-b transition-colors data-[state=selected]:bg-muted',
  {
    variants: {
      variant: {
        default: '',
        hoverable: 'hover:bg-muted/50',
        selectable: 'cursor-pointer hover:bg-muted/50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const tableHeadVariants = cva(
  'h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
  {
    variants: {
      sortable: {
        true: 'cursor-pointer select-none hover:bg-muted/50 focus:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
        false: '',
      },
    },
    defaultVariants: {
      sortable: false,
    },
  }
);

const tableCellVariants = cva(
  'p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]'
);

const tableCaptionVariants = cva(
  'mt-4 text-sm text-muted-foreground'
);

export interface TableProps
  extends React.HTMLAttributes<HTMLTableElement>,
    VariantProps<typeof tableVariants> {}

export interface TableHeaderProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {}

export interface TableBodyProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {}

export interface TableFooterProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {}

export interface TableRowProps
  extends Omit<React.HTMLAttributes<HTMLTableRowElement>, 'onSelect'> {
  selectable?: boolean;
  hoverable?: boolean;
  onSelect?: (selected: boolean) => void;
}

export interface TableHeadProps
  extends React.ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
}

export interface TableCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {}

export interface TableCaptionProps
  extends React.HTMLAttributes<HTMLTableCaptionElement> {}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={cn(tableVariants({ variant, size }), className)}
        role="table"
        {...props}
      />
    </div>
  )
);
Table.displayName = 'Table';

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn(tableHeaderVariants(), className)}
      {...props}
    />
  )
);
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn(tableBodyVariants(), className)}
      {...props}
    />
  )
);
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={cn(tableFooterVariants(), className)}
      {...props}
    />
  )
);
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, selectable, hoverable, onSelect, onClick, ...props }, ref) => {
    const [selected, setSelected] = React.useState(false);
    
    const handleClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
      if (selectable && onSelect) {
        const newSelected = !selected;
        setSelected(newSelected);
        onSelect(newSelected);
      }
      onClick?.(event);
    };

    const variant = selectable ? 'selectable' : hoverable ? 'hoverable' : 'default';

    return (
      <tr
        ref={ref}
        className={cn(tableRowVariants({ variant }), className)}
        onClick={handleClick}
        data-state={selected ? 'selected' : undefined}
        {...props}
      />
    );
  }
);
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, children, sortable, sortKey, sortDirection, onSort, onClick, onKeyDown, ...props }, ref) => {
    const [currentDirection, setCurrentDirection] = React.useState<'asc' | 'desc' | null>(sortDirection || null);

    const handleSort = () => {
      if (!sortable || !sortKey || !onSort) return;
      
      const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
      setCurrentDirection(newDirection);
      onSort(sortKey, newDirection);
    };

    const handleClick = (event: React.MouseEvent<HTMLTableCellElement>) => {
      if (sortable) {
        handleSort();
      }
      onClick?.(event);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTableCellElement>) => {
      if (sortable && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        handleSort();
      }
      onKeyDown?.(event);
    };

    return (
      <th
        ref={ref}
        className={cn(tableHeadVariants({ sortable }), className)}
        scope="col"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={sortable ? 0 : undefined}
        role="columnheader"
        aria-sort={
          sortable && currentDirection
            ? currentDirection === 'asc'
              ? 'ascending'
              : 'descending'
            : undefined
        }
        {...props}
      >
        <div className="flex items-center gap-2">
          {children}
          {sortable && (
            <div className="flex flex-col">
              <div
                className={cn(
                  'h-0 w-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent',
                  currentDirection === 'asc' ? 'border-b-foreground' : 'border-b-muted-foreground'
                )}
              />
              <div
                className={cn(
                  'h-0 w-0 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent',
                  currentDirection === 'desc' ? 'border-t-foreground' : 'border-t-muted-foreground'
                )}
              />
            </div>
          )}
        </div>
      </th>
    );
  }
);
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(tableCellVariants(), className)}
      {...props}
    />
  )
);
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  ({ className, ...props }, ref) => (
    <caption
      ref={ref}
      className={cn(tableCaptionVariants(), className)}
      {...props}
    />
  )
);
TableCaption.displayName = 'TableCaption';

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  tableVariants,
  tableRowVariants,
  tableHeadVariants,
  tableCellVariants,
};