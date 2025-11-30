'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  onFilterChange: (value: string) => void;
  onSortChange: (id: string, desc: boolean) => void;
  onPageSizeChange: (size: number) => void;
  pageSize: number;
  onNextPage: () => void;
  onPrevPage: () => void;
  canNextPage: boolean;
  canPrevPage: boolean;
  pageIndex: number;
}

const TableSkeleton = ({ colCount }: { colCount: number }) => (
  <TableRow>
    <TableCell colSpan={colCount} className="h-24 text-center">
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </TableCell>
  </TableRow>
);


export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  onFilterChange,
  onSortChange,
  onPageSizeChange,
  pageSize,
  onNextPage,
  onPrevPage,
  canNextPage,
  canPrevPage,
  pageIndex,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  React.useEffect(() => {
    if (sorting.length > 0) {
      const { id, desc } = sorting[0];
      onSortChange(id, desc);
    }
  }, [sorting, onSortChange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className='text-sm text-muted-foreground'>Show</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
           <span className='text-sm text-muted-foreground'>entries</span>
        </div>
        <div className="flex items-center gap-2">
            <span className='text-sm text-muted-foreground'>Search:</span>
            <Input
                placeholder="Filter data..."
                onChange={(e) => onFilterChange(e.target.value)}
                className="max-w-sm"
            />
        </div>
      </div>
      <div className="rounded-lg shadow-lg bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : (
                        <div
                            {...{
                                className: header.column.getCanSort()
                                ? 'cursor-pointer select-none flex items-center justify-center gap-2'
                                : 'flex items-center justify-center gap-2',
                                onClick: header.column.getToggleSortingHandler(),
                            }}
                        >
                            {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                            )}
                            {{
                                asc: <ChevronUp className="h-4 w-4" />,
                                desc: <ChevronDown className="h-4 w-4" />,
                            }[header.column.getIsSorted() as string] ?? (header.column.getCanSort() ? <ChevronsUpDown className="h-4 w-4 opacity-30" /> : null)}
                        </div>
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading && (<TableSkeleton colCount={columns.length} />)}

            {!isLoading && table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-center">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : !isLoading && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
            Showing page {pageIndex + 1}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevPage}
            disabled={!canPrevPage || isLoading}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onNextPage}
            disabled={!canNextPage || isLoading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

    