import React from 'react';
import { Layers } from 'lucide-react';
import { Button } from './Button';

export interface ColumnDef<T> {
  header: React.ReactNode;
  accessorKey?: keyof T;
  cell?: (row: T, index: number) => React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface PaginationConfig {
  currentPage: number;
  totalPages: number;
  totalEntries?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor?: (item: T, index: number) => string;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectAll?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectOne?: (id: string) => void;
  pagination?: PaginationConfig;
  emptyMessage?: string;
  isLoading?: boolean;
  density?: 'compact' | 'normal' | 'relaxed';
  onRowClick?: (item: T, index: number) => void;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor = (item: any, index: number) => item?.id || item?.code || item?.key || String(index),
  selectable = false,
  selectedIds = [],
  onSelectAll,
  onSelectOne,
  pagination,
  emptyMessage = 'No records found',
  isLoading = false,
  density = 'normal',
  onRowClick,
  className = '',
}: DataTableProps<T>) {
  const allSelected = selectable && data.length > 0 && selectedIds.length === data.length;

  const cellPaddingClass =
    density === 'relaxed'
      ? 'px-4 py-4'
      : density === 'compact'
      ? 'px-3 py-2'
      : 'px-3.5 py-3.5';

  const headerPaddingClass =
    density === 'relaxed'
      ? 'px-4 py-3.5'
      : density === 'compact'
      ? 'px-3 py-2.5'
      : 'px-3.5 py-3';

  return (
    <div className={`overflow-hidden rounded-sm border border-slate-200/80 bg-white shadow-xs flex flex-col justify-between min-h-[360px] ${className}`}>
      {/* Scrollable Table Area */}
      <div className="overflow-x-auto custom-scrollbar flex-1 min-h-[300px]">
        <table className="w-full text-left text-xs border-collapse font-sans">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/90 text-xs font-bold text-[#0D1F3D]">
              {selectable && (
                <th className={`${headerPaddingClass} text-center w-10`}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onSelectAll}
                    className="rounded-sm border-slate-300 text-[#0D1F3D] focus:ring-[#0D1F3D]"
                  />
                </th>
              )}

              {columns.map((col, idx) => {
                const alignClass =
                  col.align === 'center'
                    ? 'text-center'
                    : col.align === 'right'
                    ? 'text-right'
                    : 'text-left';

                return (
                  <th
                    key={idx}
                    style={{ width: col.width }}
                    className={`${headerPaddingClass} whitespace-nowrap ${alignClass} ${col.className || ''}`}
                  >
                    {col.header}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="py-14 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-[#0D1F3D]" />
                    <span className="text-xs font-medium">Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : data.length > 0 ? (
              data.map((row, index) => {
                const key = keyExtractor(row, index);
                const isSelected = selectable && selectedIds.includes(key);

                return (
                  <tr
                    key={key}
                    onClick={(e) => {
                      if (!onRowClick) return;
                      const target = e.target as HTMLElement;
                      if (target.closest('button, a, input, select, label, svg')) return;
                      onRowClick(row, index);
                    }}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      onRowClick ? 'cursor-pointer' : ''
                    } ${
                      isSelected ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    {selectable && (
                      <td className={`${cellPaddingClass} text-center`}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onSelectOne && onSelectOne(key)}
                          className="rounded-sm border-slate-300 text-[#0D1F3D] focus:ring-[#0D1F3D]"
                        />
                      </td>
                    )}

                    {columns.map((col, cIdx) => {
                      const alignClass =
                        col.align === 'center'
                          ? 'text-center'
                          : col.align === 'right'
                          ? 'text-right'
                          : 'text-left';

                      let content: React.ReactNode = null;
                      if (col.cell) {
                        content = col.cell(row, index);
                      } else if (col.accessorKey) {
                        content = (row[col.accessorKey] as unknown) as React.ReactNode;
                      }

                      return (
                        <td
                          key={cIdx}
                          className={`${cellPaddingClass} whitespace-nowrap ${alignClass} ${col.className || ''}`}
                        >
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-14 text-center text-slate-500"
                >
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <Layers className="h-7 w-7 text-slate-300 mb-1" />
                    <p className="font-bold text-xs text-[#0D1F3D]">{emptyMessage}</p>
                    <p className="text-[11px] text-slate-400">Try adjusting your filters or search terms.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Standardized Pagination Footer */}
      {pagination && (
        <div className="flex flex-wrap items-center justify-between border-t border-slate-200 bg-slate-50/50 px-4 py-3 text-xs text-slate-500 gap-2">
          <span>
            Showing {data.length === 0 ? 0 : (pagination.currentPage - 1) * (pagination.pageSize ?? data.length) + 1} to{' '}
            {Math.min(pagination.currentPage * (pagination.pageSize ?? data.length), pagination.totalEntries ?? data.length)} of{' '}
            {(pagination.totalEntries ?? data.length).toLocaleString()} entries
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage <= 1}
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              className="h-7 px-2.5 text-xs font-semibold rounded-sm border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              Prev
            </Button>

            {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, i) => {
              const pageNum = i + 1;
              const isActive = pageNum === pagination.currentPage;
              return (
                <Button
                  key={pageNum}
                  variant={isActive ? 'accent' : 'outline'}
                  size="sm"
                  onClick={() => pagination.onPageChange(pageNum)}
                  className={`h-7 px-2.5 text-xs font-bold rounded-sm ${
                    isActive
                      ? 'bg-[#0D1F3D] text-white hover:bg-slate-800'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {pageNum}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              className="h-7 px-2.5 text-xs font-semibold rounded-sm border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
