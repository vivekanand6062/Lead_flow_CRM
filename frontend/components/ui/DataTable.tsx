'use client';

import React, { useState, useMemo, ReactNode } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { Skeleton } from './Skeleton';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKey?: keyof T | ((item: T) => string);
  filterTabs?: { label: string; value: string; filterFn?: (item: T) => boolean }[];
  activeFilter?: string;
  onFilterChange?: (filterValue: string) => void;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  pageSize?: number;
  onRowClick?: (item: T) => void;
}

export function DataTable<T extends { _id?: string; id?: string }>({
  data,
  columns,
  searchPlaceholder = 'Search records...',
  searchKey,
  filterTabs,
  activeFilter,
  onFilterChange,
  isLoading,
  emptyTitle = 'No records found',
  emptyDescription = 'There are currently no records available in this view.',
  emptyActionLabel,
  onEmptyAction,
  pageSize = 10,
  onRowClick
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(activeFilter || (filterTabs ? filterTabs[0]?.value : 'ALL'));
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Handle filtering
  const filteredData = useMemo(() => {
    let result = [...data];

    // Filter tabs
    if (filterTabs && selectedFilter !== 'ALL') {
      const activeTabObj = filterTabs.find(t => t.value === selectedFilter);
      if (activeTabObj && activeTabObj.filterFn) {
        result = result.filter(activeTabObj.filterFn);
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(item => {
        if (typeof searchKey === 'function') {
          return searchKey(item).toLowerCase().includes(q);
        } else if (searchKey) {
          const val = item[searchKey];
          return String(val || '').toLowerCase().includes(q);
        }
        return Object.values(item).some(v => String(v || '').toLowerCase().includes(q));
      });
    }

    // Sorting
    if (sortKey) {
      result.sort((a: any, b: any) => {
        const valA = a[sortKey] ?? '';
        const valB = b[sortKey] ?? '';
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, filterTabs, selectedFilter, searchQuery, searchKey, sortKey, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleFilterClick = (value: string) => {
    setSelectedFilter(value);
    setCurrentPage(1);
    if (onFilterChange) onFilterChange(value);
  };

  return (
    <div className="w-full space-y-3.5">
      {/* Controls Bar: Search & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#8A7F87] dark:text-[#817783]" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-[#E5DCD5] dark:border-[#2A242D] bg-[#FFFFFF] dark:bg-[#141117] text-[#211A20] dark:text-[#F5F1F3] placeholder-[#8A7F87] dark:placeholder-[#817783] focus:outline-none focus:border-[#A9683F] dark:focus:border-[#C08457] focus:ring-1 focus:ring-[#A9683F] dark:focus:ring-[#C08457] transition-all"
          />
        </div>

        {/* Filter Tabs */}
        {filterTabs && filterTabs.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleFilterClick(tab.value)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap active:scale-[0.98] ${
                  selectedFilter === tab.value
                    ? 'bg-[#A9683F] dark:bg-[#C08457] text-white shadow-xs font-semibold'
                    : 'text-[#665C65] dark:text-[#B8AEB9] hover:bg-[#F8F2EE] dark:hover:bg-[#211B24] hover:text-[#211A20] dark:hover:text-[#F5F1F3]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="w-full overflow-hidden border border-[#E5DCD5] dark:border-[#2A242D] rounded-xl bg-[#FFFFFF] dark:bg-[#141117] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5DCD5] dark:border-[#2A242D] bg-[#F7F3F0]/80 dark:bg-[#1A151D]/80 text-[11px] uppercase tracking-wider text-[#665C65] dark:text-[#B8AEB9] font-semibold">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={`px-4 py-3 ${col.sortable ? 'cursor-pointer select-none hover:text-[#211A20] dark:hover:text-[#F5F1F3]' : ''} ${col.className || ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      {col.header}
                      {col.sortable && <ArrowUpDown className="w-3 h-3 text-[#8A7F87] dark:text-[#817783]" />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DCD5]/70 dark:divide-[#2A242D]/80 text-xs sm:text-sm text-[#211A20] dark:text-[#F5F1F3]">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="bg-[#FFFFFF] dark:bg-[#141117]">
                    {columns.map((col, colIdx) => (
                      <td key={`col-${colIdx}`} className="px-4 py-3.5">
                        <Skeleton className="h-4 w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8">
                    <EmptyState
                      title={emptyTitle}
                      description={emptyDescription}
                      actionLabel={emptyActionLabel}
                      onAction={onEmptyAction}
                    />
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, idx) => {
                  const rowId = item._id || item.id || `row-${idx}`;
                  return (
                    <tr
                      key={rowId}
                      onClick={() => onRowClick && onRowClick(item)}
                      className={`transition-colors duration-100 ${
                        onRowClick ? 'cursor-pointer hover:bg-[#F8F2EE] dark:hover:bg-[#211B24]' : 'hover:bg-[#F8F2EE]/60 dark:hover:bg-[#211B24]/50'
                      }`}
                    >
                      {columns.map((col) => (
                        <td key={col.key} className={`px-4 py-3.5 ${col.className || ''}`}>
                          {col.render ? col.render(item) : (item as any)[col.key]}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with Pagination */}
        {!isLoading && filteredData.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#E5DCD5] dark:border-[#2A242D] bg-[#F7F3F0]/60 dark:bg-[#1A151D]/60 text-xs text-[#665C65] dark:text-[#B8AEB9]">
            <span className="tabular-nums">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 rounded border border-[#E5DCD5] dark:border-[#2A242D] hover:bg-[#F8F2EE] dark:hover:bg-[#211B24] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-[#211A20] dark:text-[#F5F1F3]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-[#211A20] dark:text-[#F5F1F3] tabular-nums">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1 rounded border border-[#E5DCD5] dark:border-[#2A242D] hover:bg-[#F8F2EE] dark:hover:bg-[#211B24] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-[#211A20] dark:text-[#F5F1F3]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
