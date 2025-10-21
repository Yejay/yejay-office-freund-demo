/**
 * GridPagination Component
 *
 * Preline-styled pagination controls for AG Grid.
 * Displays page navigation, page size selector, and row count info.
 *
 * @module components/ag-grid/GridPagination
 */

'use client';

import React, { useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import type { GridPaginationProps, PaginationState } from '@/specs/001-ag-grid-preline/contracts/GridPagination.interface';

/**
 * GridPagination component with Preline design
 *
 * @example
 * ```tsx
 * <GridPagination
 *   gridApi={gridApi}
 *   currentPage={0}
 *   pageSize={50}
 *   totalRows={1234}
 *   pageSizeOptions={[10, 25, 50, 100]}
 *   showPageSizeSelector
 *   showRowCount
 * />
 * ```
 */
export function GridPagination(props: GridPaginationProps) {
  const {
    gridApi,
    currentPage,
    pageSize,
    totalRows,
    pageSizeOptions = [10, 25, 50, 100],
    showPageSizeSelector = true,
    showRowCount = true,
    showPageJump = false,
    maxPageButtons = 7,
    onPageChange,
    onPageSizeChange,
    className,
    style,
    align = 'center',
  } = props;

  // Calculate pagination state
  const paginationState = useMemo<PaginationState>(() => {
    const totalPages = Math.ceil(totalRows / pageSize);
    const startRow = currentPage * pageSize;
    const endRow = Math.min(startRow + pageSize, totalRows);
    const hasPrevious = currentPage > 0;
    const hasNext = currentPage < totalPages - 1;

    // Calculate visible page numbers with ellipsis
    const visiblePages = calculateVisiblePages(
      currentPage,
      totalPages,
      maxPageButtons
    );

    return {
      currentPage,
      pageSize,
      totalRows,
      totalPages,
      startRow,
      endRow,
      hasPrevious,
      hasNext,
      visiblePages,
    };
  }, [currentPage, pageSize, totalRows, maxPageButtons]);

  // Navigate to specific page
  const goToPage = useCallback(
    (page: number) => {
      if (page < 0 || page >= paginationState.totalPages) return;
      gridApi.paginationGoToPage(page);
      onPageChange?.(page);
    },
    [gridApi, paginationState.totalPages, onPageChange]
  );

  // Navigate to previous page
  const goToPrevious = useCallback(() => {
    if (paginationState.hasPrevious) {
      goToPage(currentPage - 1);
    }
  }, [paginationState.hasPrevious, currentPage, goToPage]);

  // Navigate to next page
  const goToNext = useCallback(() => {
    if (paginationState.hasNext) {
      goToPage(currentPage + 1);
    }
  }, [paginationState.hasNext, currentPage, goToPage]);

  // Navigate to first page
  const goToFirst = useCallback(() => {
    goToPage(0);
  }, [goToPage]);

  // Navigate to last page
  const goToLast = useCallback(() => {
    goToPage(paginationState.totalPages - 1);
  }, [goToPage, paginationState.totalPages]);

  // Change page size
  const handlePageSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newSize = parseInt(e.target.value, 10);
      gridApi.paginationSetPageSize(newSize);
      onPageSizeChange?.(newSize);
      // Reset to first page when changing page size
      goToPage(0);
    },
    [gridApi, onPageSizeChange, goToPage]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
        case 'Home':
          e.preventDefault();
          goToFirst();
          break;
        case 'End':
          e.preventDefault();
          goToLast();
          break;
      }
    },
    [goToPrevious, goToNext, goToFirst, goToLast]
  );

  // Alignment classes
  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center gap-3 p-4 bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-700 ${
        alignmentClasses[align]
      } ${className || ''}`}
      style={style}
      onKeyDown={handleKeyDown}
    >
      {/* Row Count Display */}
      {showRowCount && (
        <div className="text-sm text-gray-700 dark:text-neutral-200 order-1 sm:order-none">
          Showing{' '}
          <span className="font-semibold">
            {paginationState.totalRows === 0 ? 0 : paginationState.startRow + 1}
          </span>{' '}
          to{' '}
          <span className="font-semibold">{paginationState.endRow}</span> of{' '}
          <span className="font-semibold">{paginationState.totalRows}</span>{' '}
          results
        </div>
      )}

      {/* Page Navigation */}
      <div className="flex items-center gap-1 order-2 sm:order-none">
        {/* First Page Button */}
        <button
          type="button"
          onClick={goToFirst}
          disabled={!paginationState.hasPrevious}
          className="min-h-[38px] min-w-[38px] flex justify-center items-center text-gray-800 hover:bg-gray-100 py-2 px-2.5 text-sm rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-neutral-700"
          aria-label="Go to first page"
        >
          <ChevronsLeft className="size-4" />
        </button>

        {/* Previous Page Button */}
        <button
          type="button"
          onClick={goToPrevious}
          disabled={!paginationState.hasPrevious}
          className="min-h-[38px] min-w-[38px] flex justify-center items-center text-gray-800 hover:bg-gray-100 py-2 px-2.5 text-sm rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-neutral-700"
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </button>

        {/* Page Number Buttons */}
        {paginationState.visiblePages.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <div
                key={`ellipsis-${index}`}
                className="min-h-[38px] flex justify-center items-center text-gray-800 py-2 px-1.5 text-sm dark:text-white"
              >
                ...
              </div>
            );
          }

          const isActive = page === currentPage;
          return (
            <button
              key={page}
              type="button"
              onClick={() => goToPage(page)}
              className={`min-h-[38px] min-w-[38px] flex justify-center items-center py-2 px-3 text-sm rounded-lg ${
                isActive
                  ? 'bg-gray-200 text-gray-800 dark:bg-neutral-600 dark:text-white'
                  : 'text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-neutral-700'
              }`}
              aria-label={`Go to page ${page + 1}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {page + 1}
            </button>
          );
        })}

        {/* Next Page Button */}
        <button
          type="button"
          onClick={goToNext}
          disabled={!paginationState.hasNext}
          className="min-h-[38px] min-w-[38px] flex justify-center items-center text-gray-800 hover:bg-gray-100 py-2 px-2.5 text-sm rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-neutral-700"
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </button>

        {/* Last Page Button */}
        <button
          type="button"
          onClick={goToLast}
          disabled={!paginationState.hasNext}
          className="min-h-[38px] min-w-[38px] flex justify-center items-center text-gray-800 hover:bg-gray-100 py-2 px-2.5 text-sm rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-neutral-700"
          aria-label="Go to last page"
        >
          <ChevronsRight className="size-4" />
        </button>
      </div>

      {/* Page Size Selector */}
      {showPageSizeSelector && (
        <div className="flex items-center gap-x-2 order-3 sm:order-none">
          <label
            htmlFor="page-size-select"
            className="text-sm text-gray-700 dark:text-neutral-200"
          >
            Show
          </label>
          <select
            id="page-size-select"
            value={pageSize}
            onChange={handlePageSizeChange}
            className="py-2 px-3 pe-9 block border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-200"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-700 dark:text-neutral-200">
            per page
          </span>
        </div>
      )}
    </div>
  );
}

GridPagination.displayName = 'GridPagination';

/**
 * Calculate visible page numbers with ellipsis
 * Based on current page and total pages, returns an array of page numbers and 'ellipsis' markers
 */
function calculateVisiblePages(
  currentPage: number,
  totalPages: number,
  maxButtons: number
): (number | 'ellipsis')[] {
  if (totalPages <= maxButtons) {
    // Show all pages
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const pages: (number | 'ellipsis')[] = [];
  const sideButtons = Math.floor((maxButtons - 3) / 2); // Reserve 3 for first, last, current

  // Always show first page
  pages.push(0);

  // Calculate range around current page
  let startPage = Math.max(1, currentPage - sideButtons);
  let endPage = Math.min(totalPages - 2, currentPage + sideButtons);

  // Adjust range if near start or end
  if (currentPage <= sideButtons + 1) {
    endPage = Math.min(totalPages - 2, maxButtons - 2);
  } else if (currentPage >= totalPages - sideButtons - 2) {
    startPage = Math.max(1, totalPages - maxButtons + 1);
  }

  // Add ellipsis after first page if needed
  if (startPage > 1) {
    pages.push('ellipsis');
  }

  // Add pages in range
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  // Add ellipsis before last page if needed
  if (endPage < totalPages - 2) {
    pages.push('ellipsis');
  }

  // Always show last page
  if (totalPages > 1) {
    pages.push(totalPages - 1);
  }

  return pages;
}
