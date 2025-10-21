/**
 * DataGrid Component
 *
 * Main data grid component integrating AG Grid with Preline design system.
 * Provides enterprise-grade table functionality with modern UX.
 *
 * @module components/ag-grid/DataGrid
 */

'use client';

import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { GridApi, GridReadyEvent, ColDef, PaginationChangedEvent } from 'ag-grid-community';
import type { DataGridProps } from '@/specs/001-ag-grid-preline/contracts/DataGrid.interface';
import { useGridTheme } from './hooks/useGridTheme';
import { useGridState } from './hooks/useGridState';
import { GridToolbar } from './GridToolbar';
import { GridPagination } from './GridPagination';

// Import AG Grid styles
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

/**
 * DataGrid component with Preline styling
 *
 * @template TData - Type of row data objects
 *
 * @example
 * ```tsx
 * interface Invoice {
 *   id: string;
 *   invoiceNumber: string;
 *   amount: number;
 *   status: 'paid' | 'pending';
 * }
 *
 * const columnDefs: ColDef<Invoice>[] = [
 *   { field: 'invoiceNumber', headerName: 'Invoice #' },
 *   { field: 'amount', valueFormatter: p => `$${p.value}` },
 * ];
 *
 * <DataGrid<Invoice>
 *   rowData={invoices}
 *   columnDefs={columnDefs}
 *   pagination
 *   showSearch
 * />
 * ```
 */
export function DataGrid<TData = any>(props: DataGridProps<TData>) {
  const {
    rowData,
    columnDefs,
    gridId,
    defaultColDef,
    gridOptions,
    themeConfig,
    pagination = true,
    paginationPageSize = 50,
    paginationPageSizeOptions = [10, 25, 50, 100],
    rowSelection = false,
    enableQuickFilter = false,
    enableColumnFilters = true,
    enableSorting = true,
    enableColumnResizing = true,
    enableColumnReordering = true,
    animateRows = true,
    showSearch = false,
    searchPlaceholder = 'Search...',
    showFilters = false,
    showColumnToggle = false,
    showDensityControl = false,
    toolbarActions,
    loading = false,
    loadingOverlay,
    emptyState,
    noRowsOverlay,
    onRowClicked,
    onRowDoubleClicked,
    onSelectionChanged,
    onCellValueChanged,
    onSortChanged,
    onFilterChanged,
    onColumnStateChanged,
    onGridReady,
    className,
    style,
    height = '600px',
    width = '100%',
    rowHeight,
    headerHeight,
  } = props;

  // SSR Hydration Guard
  // Prevents theme mismatch between server and client
  // next-themes needs client-side hydration to determine correct theme
  const [mounted, setMounted] = useState(false);

  // Grid API reference for toolbar interactions
  const [gridApiInstance, setGridApiInstance] = useState<GridApi<TData> | null>(null);

  // Pagination state
  const [currentPaginationPage, setCurrentPaginationPage] = useState(0);
  const [displayedRowCount, setDisplayedRowCount] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load Preline theme with dark mode support
  const { theme, dataThemeMode } = useGridTheme({ themeConfig });

  // Grid state persistence
  const { saveState } = useGridState({
    gridId: gridId || 'default-grid',
    gridApi: gridApiInstance,
    enabled: !!gridId, // Only enable if gridId is provided
  });

  // Default column definition with sensible defaults
  // User-provided defaultColDef will override these
  const effectiveDefaultColDef = useMemo<ColDef<TData>>(() => {
    return {
      sortable: enableSorting,
      filter: enableColumnFilters,
      resizable: enableColumnResizing,
      ...defaultColDef,
    };
  }, [enableSorting, enableColumnFilters, enableColumnResizing, defaultColDef]);

  // Handle grid ready event
  const handleGridReady = useCallback(
    (event: GridReadyEvent<TData>) => {
      setGridApiInstance(event.api);
      // Initialize pagination state
      if (pagination) {
        setCurrentPaginationPage(0);
        setDisplayedRowCount(rowData.length);
      }
      if (onGridReady) {
        onGridReady(event.api);
      }
    },
    [onGridReady, pagination, rowData.length]
  );

  // Handle pagination changes
  const handlePaginationChanged = useCallback(
    (event: PaginationChangedEvent<TData>) => {
      if (event.api) {
        const currentPage = event.api.paginationGetCurrentPage();
        const totalRows = event.api.paginationGetRowCount();
        setCurrentPaginationPage(currentPage);
        setDisplayedRowCount(totalRows);
      }
    },
    []
  );

  // Handle column state changes (resize, reorder, visibility)
  const handleColumnStateChanged = useCallback(() => {
    saveState();
    onColumnStateChanged?.({
      api: gridApiInstance!,
      columnState: gridApiInstance?.getColumnState() || [],
    });
  }, [saveState, onColumnStateChanged, gridApiInstance]);

  // Handle sort changes
  const handleSortChanged = useCallback(
    (event: any) => {
      saveState();
      onSortChanged?.(event);
    },
    [saveState, onSortChanged]
  );

  // Handle filter changes
  const handleFilterChanged = useCallback(
    (event: any) => {
      saveState();
      onFilterChanged?.(event);
    },
    [saveState, onFilterChanged]
  );

  // Show skeleton/placeholder until hydration is complete
  // This prevents theme flashing and hydration mismatches
  if (!mounted) {
    return (
      <div
        className={className}
        style={{
          height,
          width,
          ...style,
        }}
      >
        <div className="flex items-center justify-center h-full border border-gray-200 dark:border-neutral-700 rounded-lg bg-gray-50 dark:bg-neutral-900">
          <div className="text-center">
            <div className="animate-pulse text-gray-400 dark:text-neutral-500">
              Loading grid...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Determine if we should show the toolbar
  const shouldShowToolbar = showSearch || showFilters || showColumnToggle || showDensityControl || toolbarActions;

  return (
    <div
      className={`ag-theme-quartz ${className || ''}`}
      style={{
        width,
        ...style,
      }}
      data-ag-theme-mode={dataThemeMode}
    >
      <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-neutral-700 flex flex-col" style={{ height }}>
        {/* Toolbar */}
        {shouldShowToolbar && gridApiInstance && (
          <GridToolbar
            gridApi={gridApiInstance}
            showSearch={showSearch}
            searchPlaceholder={searchPlaceholder}
            showFilters={showFilters}
            showColumnToggle={showColumnToggle}
            showDensityControl={showDensityControl}
            actions={toolbarActions}
          />
        )}

        {/* Grid Container */}
        <div className="flex-1 min-h-0">
          <AgGridReact<TData>
        theme={theme}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={effectiveDefaultColDef}
        autoSizeStrategy={{
          type: 'fitCellContents',
        }}
        pagination={pagination}
        paginationPageSize={paginationPageSize}
        paginationPageSizeSelector={
          pagination ? { values: paginationPageSizeOptions } : false
        }
        rowSelection={rowSelection || undefined}
        animateRows={animateRows}
        rowHeight={rowHeight}
        headerHeight={headerHeight}
        loading={loading}
        loadingOverlayComponent={
          loadingOverlay
            ? () => loadingOverlay
            : () => (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm text-gray-700 dark:text-neutral-200">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Loading...
                    </div>
                  </div>
                </div>
              )
        }
        noRowsOverlayComponent={
          noRowsOverlay
            ? () => noRowsOverlay
            : emptyState
            ? () => emptyState
            : () => (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center py-10">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400 dark:text-neutral-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-neutral-100">
                      No data
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
                      No records to display
                    </p>
                  </div>
                </div>
              )
        }
        onGridReady={handleGridReady}
        onRowClicked={onRowClicked}
        onRowDoubleClicked={onRowDoubleClicked}
        onSelectionChanged={onSelectionChanged}
        onCellValueChanged={onCellValueChanged}
        onSortChanged={handleSortChanged}
        onFilterChanged={handleFilterChanged}
        onColumnResized={handleColumnStateChanged}
        onColumnMoved={handleColumnStateChanged}
        onColumnVisible={handleColumnStateChanged}
        onPaginationChanged={handlePaginationChanged}
        {...gridOptions}
      />
        </div>

        {/* Pagination */}
        {pagination && gridApiInstance && (
          <GridPagination
            gridApi={gridApiInstance}
            currentPage={currentPaginationPage}
            pageSize={paginationPageSize}
            totalRows={displayedRowCount}
            pageSizeOptions={paginationPageSizeOptions}
            showPageSizeSelector
            showRowCount
          />
        )}
      </div>
    </div>
  );
}

DataGrid.displayName = 'DataGrid';
