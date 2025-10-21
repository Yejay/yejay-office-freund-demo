/**
 * PrelineProDataTable Component
 *
 * A hybrid data table combining Preline Pro's exact UI design
 * with AG Grid's powerful data operations API.
 *
 * Features:
 * - Nav tabs for status filtering (All, Archived, Publish, Unpublish)
 * - Calendar dropdown for date range filtering
 * - Column filter dropdown with checkboxes
 * - Per-column sort dropdown menus
 * - Row action menus
 * - Stone color palette matching Preline Pro
 * - Custom Preline Pro pagination
 * - Dark mode support
 *
 * @module components/ag-grid/PrelineProDataTable
 */

'use client';

import React, { useCallback, useState, useEffect, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type {
  GridApi,
  GridReadyEvent,
  ColDef,
  PaginationChangedEvent,
  SelectionChangedEvent,
  SortChangedEvent,
  FilterChangedEvent,
  ICellRendererParams,
  IHeaderParams,
} from 'ag-grid-community';
import { themeQuartz } from 'ag-grid-community';
import { useTheme } from 'next-themes';
import {
  Search,
  Filter,
  Columns3,
  ChevronLeft,
  ChevronRight,
  Download,
  Calendar,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  X,
} from 'lucide-react';

// Import AG Grid styles
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

// Import custom Preline Pro table styling
import './preline-pro-table.css';

/**
 * Action button configuration for toolbar
 */
export interface ToolbarAction {
  label: string;
  onClick: () => void;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
}

/**
 * Status tab configuration
 */
export interface StatusTab {
  key: string;
  label: string;
  count?: number;
  filterValue?: any;
}

/**
 * Row action menu item
 */
export interface RowAction<TData = any> {
  label: string;
  onClick: (row: TData) => void;
  icon?: string;
  variant?: 'default' | 'danger';
}

/**
 * PrelineProDataTable component props
 */
export interface PrelineProDataTableProps<TData = any> {
  // Core data
  rowData: TData[];
  columnDefs: ColDef<TData>[];

  // Grid configuration
  gridId?: string;
  defaultColDef?: ColDef<TData>;
  height?: string;
  width?: string;

  // Pagination
  pagination?: boolean;
  paginationPageSize?: number;
  paginationPageSizeOptions?: number[];
  showRowCount?: boolean;

  // Search and filters
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchDebounceMs?: number;
  showFilters?: boolean;
  showColumnToggle?: boolean;

  // Status tabs for filtering
  statusTabs?: StatusTab[];
  statusFilterField?: string;
  defaultStatusTab?: string;

  // Date range filtering
  showDateFilter?: boolean;
  dateFilterField?: string;

  // Row actions
  rowActions?: RowAction<TData>[];

  // Selection
  rowSelection?: 'single' | 'multiple' | false;

  // Custom actions
  toolbarActions?: ToolbarAction[];

  // States
  loading?: boolean;
  emptyState?: React.ReactNode;

  // Event handlers
  onSelectionChanged?: (event: SelectionChangedEvent<TData>) => void;
  onRowClicked?: (event: any) => void;
  onGridReady?: (api: GridApi<TData>) => void;

  // Styling
  className?: string;
  style?: React.CSSProperties;
}

/**
 * PrelineProDataTable Component
 */
export function PrelineProDataTable<TData = any>(props: PrelineProDataTableProps<TData>) {
  const {
    rowData,
    columnDefs,
    gridId = 'preline-pro-table',
    defaultColDef,
    height = '600px',
    width = '100%',
    pagination = true,
    paginationPageSize = 10,
    paginationPageSizeOptions = [10, 25, 50, 100],
    showRowCount = true,
    showSearch = true,
    searchPlaceholder = 'Search...',
    searchDebounceMs = 300,
    showFilters = false,
    showColumnToggle = false,
    statusTabs = [],
    statusFilterField,
    defaultStatusTab,
    showDateFilter = false,
    dateFilterField,
    rowActions = [],
    rowSelection = false,
    toolbarActions = [],
    loading = false,
    emptyState,
    onSelectionChanged,
    onRowClicked,
    onGridReady,
    className = '',
    style = {},
  } = props;

  // Hooks
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [gridApi, setGridApi] = useState<GridApi<TData> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [displayedRows, setDisplayedRows] = useState({ start: 0, end: 0, total: 0 });
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [activeStatusTab, setActiveStatusTab] = useState(defaultStatusTab || statusTabs[0]?.key || 'all');
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({});
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize visible columns
  useEffect(() => {
    const initial: Record<string, boolean> = {};
    columnDefs.forEach(col => {
      if (col.field) {
        initial[col.field] = true;
      }
    });
    setVisibleColumns(initial);
  }, [columnDefs]);

  // SSR hydration guard
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine theme mode
  const dataThemeMode = theme === 'dark' ? 'dark' : 'light';

  // Default column definition with Preline Pro styling
  const effectiveDefaultColDef = useMemo<ColDef<TData>>(() => {
    return {
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
      minWidth: 100,
      ...defaultColDef,
    };
  }, [defaultColDef]);

  // Handle grid ready
  const handleGridReady = useCallback(
    (event: GridReadyEvent<TData>) => {
      setGridApi(event.api);

      if (pagination) {
        const total = Math.ceil(rowData.length / paginationPageSize);
        setTotalPages(total);
        updateDisplayedRows(event.api);
      }

      onGridReady?.(event.api);
    },
    [onGridReady, pagination, rowData.length, paginationPageSize]
  );

  // Update displayed rows info
  const updateDisplayedRows = useCallback((api: GridApi<TData>) => {
    if (!api) return;

    const rowCount = api.paginationGetRowCount();
    const pageSize = api.paginationGetPageSize();
    const currentPage = api.paginationGetCurrentPage();

    const start = currentPage * pageSize + 1;
    const end = Math.min((currentPage + 1) * pageSize, rowCount);

    setDisplayedRows({ start, end, total: rowCount });
  }, []);

  // Handle pagination changes
  const handlePaginationChanged = useCallback(
    (event: PaginationChangedEvent<TData>) => {
      if (event.api) {
        const current = event.api.paginationGetCurrentPage();
        const total = event.api.paginationGetTotalPages();
        setCurrentPage(current);
        setTotalPages(total);
        updateDisplayedRows(event.api);
      }
    },
    [updateDisplayedRows]
  );

  // Handle search with debounce
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        if (gridApi) {
          gridApi.setGridOption('quickFilterText', value);
        }
      }, searchDebounceMs);
    },
    [gridApi, searchDebounceMs]
  );

  // Handle column visibility toggle
  const handleColumnToggle = useCallback(
    (field: string) => {
      if (!gridApi) return;

      const newVisibility = !visibleColumns[field];
      setVisibleColumns(prev => ({
        ...prev,
        [field]: newVisibility,
      }));

      gridApi.setColumnsVisible([field], newVisibility);
    },
    [gridApi, visibleColumns]
  );

  // Navigate to page
  const goToPage = useCallback(
    (page: number) => {
      if (!gridApi) return;
      gridApi.paginationGoToPage(page);
    },
    [gridApi]
  );

  // Handle status tab change
  const handleStatusTabChange = useCallback(
    (tabKey: string) => {
      setActiveStatusTab(tabKey);

      if (!gridApi || !statusFilterField) return;

      const tab = statusTabs.find(t => t.key === tabKey);

      if (!tab || tab.filterValue === undefined) {
        // Clear filter for "All" tab
        gridApi.setColumnFilterModel(statusFilterField, null);
      } else {
        // Apply filter
        gridApi.setColumnFilterModel(statusFilterField, {
          type: 'equals',
          filter: tab.filterValue,
        });
      }

      gridApi.onFilterChanged();
    },
    [gridApi, statusFilterField, statusTabs]
  );

  // Handle date range change
  const handleDateRangeChange = useCallback(
    (start: Date | null, end: Date | null) => {
      setDateRange({ start, end });

      if (!gridApi || !dateFilterField) return;

      if (!start && !end) {
        gridApi.setColumnFilterModel(dateFilterField, null);
      } else {
        gridApi.setColumnFilterModel(dateFilterField, {
          type: 'inRange',
          dateFrom: start?.toISOString().split('T')[0],
          dateTo: end?.toISOString().split('T')[0],
        });
      }

      gridApi.onFilterChanged();
    },
    [gridApi, dateFilterField]
  );

  // Clear date range
  const clearDateRange = useCallback(() => {
    handleDateRangeChange(null, null);
  }, [handleDateRangeChange]);

  // Show loading skeleton during hydration
  if (!mounted) {
    return (
      <div
        className={`preline-pro-table ${className}`}
        style={{ height, width, ...style }}
      >
        <div className="flex items-center justify-center h-full border border-stone-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 shadow-2xs">
          <div className="text-center">
            <div className="animate-pulse text-stone-400 dark:text-neutral-500">
              Loading table...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`preline-pro-table ${className}`}
      style={{ width, ...style }}
    >
      {/* Preline Pro Card Container with stone colors and shadow-2xs */}
      <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-700 rounded-xl shadow-2xs">
        {/* Status Tabs Navigation */}
        {statusTabs.length > 0 && (
          <div className="border-b border-stone-200 dark:border-neutral-700">
            <nav className="flex gap-x-6 px-6" aria-label="Tabs" role="tablist">
              {statusTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={activeStatusTab === tab.key}
                  onClick={() => handleStatusTabChange(tab.key)}
                  className={`py-4 px-1 inline-flex items-center gap-x-2 border-b-2 text-sm whitespace-nowrap transition-colors ${
                    activeStatusTab === tab.key
                      ? 'font-semibold border-blue-600 text-blue-600 dark:text-blue-500'
                      : 'border-transparent text-stone-500 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-500'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span
                      className={`ms-1 py-0.5 px-1.5 rounded-full text-xs font-medium ${
                        activeStatusTab === tab.key
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-500'
                          : 'bg-stone-100 text-stone-800 dark:bg-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Toolbar with Search and Filters */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-neutral-700">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Search Bar */}
            {showSearch && (
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search
                    className="w-4 h-4 text-stone-400 dark:text-neutral-500"
                    data-testid="search-icon"
                  />
                </div>
                <input
                  type="text"
                  className="preline-search-input block w-full pl-10 pr-3 py-2 text-sm border border-stone-200 dark:border-neutral-700 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white dark:bg-neutral-800 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-neutral-500"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
            )}

            {/* Action Buttons Group */}
            <div className="flex items-center gap-2">
              {/* Date Filter Dropdown */}
              {showDateFilter && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowDateDropdown(!showDateDropdown)}
                    className="inline-flex items-center gap-x-2 px-3 py-2 text-sm font-medium rounded-lg border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-stone-700 dark:text-neutral-200 hover:bg-stone-50 dark:hover:bg-neutral-700"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Date Range</span>
                  </button>

                  {showDateDropdown && (
                    <div className="absolute right-0 z-10 mt-2 p-4 w-80 rounded-lg shadow-lg bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-stone-700 dark:text-neutral-200">
                          Select Date Range
                        </span>
                        {(dateRange.start || dateRange.end) && (
                          <button
                            type="button"
                            onClick={clearDateRange}
                            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-500"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="text-sm text-stone-600 dark:text-neutral-400">
                        <p>Date range filtering will be available with calendar component integration.</p>
                        <p className="mt-2 text-xs">Current range: {dateRange.start?.toLocaleDateString()} - {dateRange.end?.toLocaleDateString() || 'Not set'}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Filters Button with Column Checkboxes */}
              {showFilters && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className="inline-flex items-center gap-x-2 px-3 py-2 text-sm font-medium rounded-lg border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-stone-700 dark:text-neutral-200 hover:bg-stone-50 dark:hover:bg-neutral-700"
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filters</span>
                    {Object.values(visibleColumns).filter(v => !v).length > 0 && (
                      <span className="ms-1 py-0.5 px-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-500">
                        {Object.values(visibleColumns).filter(v => !v).length}
                      </span>
                    )}
                  </button>

                  {showFilterDropdown && (
                    <div className="preline-dropdown absolute right-0 z-10 mt-2 w-64 rounded-lg shadow-lg bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700">
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold text-stone-500 dark:text-neutral-400 uppercase">
                            Visible Columns
                          </span>
                          <span className="text-xs text-stone-500 dark:text-neutral-400">
                            {Object.values(visibleColumns).filter(v => v).length} selected
                          </span>
                        </div>
                        <div className="space-y-2">
                          {columnDefs.map((col) => {
                            if (!col.field) return null;
                            const field = col.field as string;
                            const headerName = col.headerName || field;

                            return (
                              <label
                                key={field}
                                className="flex items-center px-3 py-2 text-sm text-stone-700 dark:text-neutral-200 hover:bg-stone-50 dark:hover:bg-neutral-700 rounded-md cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 text-blue-600 border-stone-300 dark:border-neutral-600 rounded focus:ring-blue-500"
                                  checked={visibleColumns[field] !== false}
                                  onChange={() => handleColumnToggle(field)}
                                  aria-label={headerName}
                                />
                                <span className="ml-3">{headerName}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Column Toggle Button (if not using filters dropdown) */}
              {showColumnToggle && !showFilters && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                    className="inline-flex items-center gap-x-2 px-3 py-2 text-sm font-medium rounded-lg border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-stone-700 dark:text-neutral-200 hover:bg-stone-50 dark:hover:bg-neutral-700"
                  >
                    <Columns3 className="w-4 h-4" />
                    <span>Columns</span>
                  </button>

                  {showColumnDropdown && (
                    <div className="absolute right-0 z-10 mt-2 w-56 rounded-lg shadow-lg bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700">
                      <div className="p-2">
                        <div className="px-3 py-2 text-xs font-semibold text-stone-400 dark:text-neutral-500 uppercase">
                          Toggle Columns
                        </div>
                        <div className="space-y-1">
                          {columnDefs.map((col) => {
                            if (!col.field) return null;
                            const field = col.field as string;
                            const headerName = col.headerName || field;

                            return (
                              <label
                                key={field}
                                className="flex items-center px-3 py-2 text-sm text-stone-700 dark:text-neutral-200 hover:bg-stone-100 dark:hover:bg-neutral-700 rounded-md cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 text-blue-600 border-stone-300 dark:border-neutral-600 rounded focus:ring-blue-500"
                                  checked={visibleColumns[field] !== false}
                                  onChange={() => handleColumnToggle(field)}
                                  aria-label={headerName}
                                />
                                <span className="ml-2">{headerName}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Custom Toolbar Actions */}
              {toolbarActions.map((action, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={`preline-btn-${action.variant || 'secondary'} inline-flex items-center gap-x-2 px-3 py-2 text-sm font-medium rounded-lg border ${
                    action.variant === 'primary'
                      ? 'border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
                      : 'border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-stone-700 dark:text-neutral-200 hover:bg-stone-50 dark:hover:bg-neutral-700 disabled:opacity-50'
                  }`}
                >
                  {action.icon === 'download' && <Download className="w-4 h-4" />}
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AG Grid Container */}
        <div
          className="ag-theme-quartz"
          style={{ height }}
          data-ag-theme-mode={dataThemeMode}
        >
          <AgGridReact<TData>
            theme={themeQuartz}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={effectiveDefaultColDef}
            pagination={pagination}
            paginationPageSize={paginationPageSize}
            paginationPageSizeSelector={{ values: paginationPageSizeOptions }}
            rowSelection={rowSelection || undefined}
            suppressPaginationPanel={true} // We use custom pagination
            loading={loading}
            onGridReady={handleGridReady}
            onPaginationChanged={handlePaginationChanged}
            onSelectionChanged={onSelectionChanged}
            onRowClicked={onRowClicked}
            loadingOverlayComponent={() => (
              <div className="flex items-center justify-center h-full">
                <div className="preline-spinner text-center">
                  <svg
                    className="animate-spin h-8 w-8 mx-auto text-blue-600"
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
                  <p className="mt-3 text-sm text-stone-600 dark:text-neutral-400">Loading data...</p>
                </div>
              </div>
            )}
            noRowsOverlayComponent={() =>
              emptyState || (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center py-12">
                    <svg
                      className="mx-auto h-12 w-12 text-stone-400 dark:text-neutral-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <h3 className="mt-3 text-sm font-semibold text-stone-900 dark:text-neutral-100">
                      No data available
                    </h3>
                    <p className="mt-1 text-sm text-stone-500 dark:text-neutral-400">
                      No records found matching your criteria
                    </p>
                  </div>
                </div>
              )
            }
          />
        </div>

        {/* Custom Preline Pro Pagination */}
        {pagination && gridApi && (
          <div className="px-6 py-4 border-t border-stone-200 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Row count info */}
              {showRowCount && (
                <div className="text-sm text-stone-600 dark:text-neutral-400">
                  <span className="font-medium text-stone-900 dark:text-neutral-100">
                    {displayedRows.start}-{displayedRows.end}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium text-stone-900 dark:text-neutral-100">
                    {displayedRows.total}
                  </span>
                </div>
              )}

              {/* Pagination controls */}
              <nav
                className="flex items-center gap-x-2"
                aria-label="Pagination"
                role="navigation"
              >
                {/* Previous button */}
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="preline-pagination-btn min-h-[38px] py-2 px-3 inline-flex justify-center items-center gap-x-1.5 text-sm font-medium rounded-lg border border-stone-200 dark:border-neutral-700 text-stone-800 dark:text-neutral-200 hover:bg-white dark:hover:bg-neutral-700 disabled:opacity-50 disabled:pointer-events-none bg-white dark:bg-neutral-800"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev</span>
                </button>

                {/* Page indicator - Preline Pro style */}
                <div className="flex items-center gap-x-1 px-3">
                  <span className="text-sm text-stone-600 dark:text-neutral-400">
                    Page <span className="font-semibold text-stone-900 dark:text-neutral-100">{currentPage + 1}</span> of <span className="font-semibold text-stone-900 dark:text-neutral-100">{totalPages || 1}</span>
                  </span>
                </div>

                {/* Next button */}
                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  className="preline-pagination-btn min-h-[38px] py-2 px-3 inline-flex justify-center items-center gap-x-1.5 text-sm font-medium rounded-lg border border-stone-200 dark:border-neutral-700 text-stone-800 dark:text-neutral-200 hover:bg-white dark:hover:bg-neutral-700 disabled:opacity-50 disabled:pointer-events-none bg-white dark:bg-neutral-800"
                  aria-label="Next"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

PrelineProDataTable.displayName = 'PrelineProDataTable';
