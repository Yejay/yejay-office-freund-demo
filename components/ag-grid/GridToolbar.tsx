/**
 * GridToolbar Component
 *
 * Toolbar component with Preline-styled search, filters, and action controls.
 * Sits above the data grid and provides user interaction controls.
 *
 * @module components/ag-grid/GridToolbar
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, X, Filter, RotateCcw, Columns } from 'lucide-react';
import type { GridToolbarProps } from '@/specs/001-ag-grid-preline/contracts/GridToolbar.interface';
import { debounce } from '@/lib/ag-grid/utils';

/**
 * GridToolbar component with Preline design
 *
 * @template TData - Type of row data objects
 *
 * @example
 * ```tsx
 * <GridToolbar
 *   gridApi={gridApi}
 *   showSearch
 *   searchPlaceholder="Search invoices..."
 *   showFilters
 *   filterOptions={[
 *     { id: 'paid', label: 'Paid', filterFn: (params) => params.data.status === 'paid' }
 *   ]}
 * />
 * ```
 */
export function GridToolbar<TData = any>(props: GridToolbarProps<TData>) {
  const {
    gridApi,
    showSearch = false,
    searchPlaceholder = 'Search...',
    defaultSearchValue = '',
    searchDebounceMs = 300,
    onSearchChange,
    showFilters = false,
    filterOptions = [],
    activeFilters: controlledActiveFilters,
    onFiltersChange,
    showColumnToggle = false,
    columns = [],
    onColumnVisibilityChange,
    showDensity = false,
    density = 'normal',
    onDensityChange,
    showExport = false,
    exportFormats = ['csv', 'excel'],
    onExport,
    showRefresh = false,
    onRefresh,
    actions,
    className,
    style,
  } = props;

  // Search state
  const [searchValue, setSearchValue] = useState(defaultSearchValue);

  // Filter state (controlled or uncontrolled)
  const [internalActiveFilters, setInternalActiveFilters] = useState<string[]>([]);
  const activeFilters = controlledActiveFilters ?? internalActiveFilters;

  // Filter dropdown visibility
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Column visibility dropdown
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  // Get all columns from grid API
  const availableColumns = useMemo(() => {
    if (!gridApi) return [];

    const columnDefs = gridApi.getColumnDefs();
    if (!columnDefs) return [];

    return columnDefs
      .filter((col: any) => col.field && !col.lockVisible)
      .map((col: any) => ({
        id: col.field,
        label: col.headerName || col.field,
        visible: gridApi.getColumn(col.field)?.isVisible() ?? true,
        locked: col.lockVisible || false,
      }));
  }, [gridApi]);

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      gridApi.setGridOption('quickFilterText', value);
      onSearchChange?.(value);
    }, searchDebounceMs),
    [gridApi, searchDebounceMs, onSearchChange]
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    debouncedSearch(value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchValue('');
    gridApi.setGridOption('quickFilterText', '');
    onSearchChange?.('');
  };

  // Toggle filter
  const handleToggleFilter = (filterId: string) => {
    const newFilters = activeFilters.includes(filterId)
      ? activeFilters.filter((id) => id !== filterId)
      : [...activeFilters, filterId];

    if (controlledActiveFilters === undefined) {
      setInternalActiveFilters(newFilters);
    }
    onFiltersChange?.(newFilters);

    // Apply filter to grid
    applyFilters(newFilters);
  };

  // Clear all filters
  const handleClearFilters = () => {
    const newFilters: string[] = [];
    if (controlledActiveFilters === undefined) {
      setInternalActiveFilters(newFilters);
    }
    onFiltersChange?.(newFilters);
    applyFilters(newFilters);
    setShowFilterDropdown(false);
  };

  // Apply filters to grid
  const applyFilters = (filterIds: string[]) => {
    if (filterIds.length === 0) {
      gridApi.setFilterModel(null);
      return;
    }

    // Apply custom filter logic
    const activeFilterOptions = filterOptions.filter((opt) =>
      filterIds.includes(opt.id)
    );

    // For now, we'll use AG Grid's external filter
    // This can be enhanced based on specific filter requirements
    gridApi.onFilterChanged();
  };

  // Toggle column visibility
  const handleToggleColumnVisibility = (columnId: string) => {
    const column = gridApi.getColumn(columnId);
    if (!column) return;

    const isVisible = column.isVisible();
    gridApi.setColumnsVisible([columnId], !isVisible);
    onColumnVisibilityChange?.(columnId, !isVisible);
  };

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-700 ${
        className || ''
      }`}
      style={style}
    >
      {/* Left side: Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-2 flex-1">
        {/* Search Input */}
        {showSearch && (
          <div className="relative flex-1 sm:max-w-xs">
            <div className="absolute inset-y-0 start-0 flex items-center pointer-events-none ps-3">
              <Search className="size-4 text-gray-400 dark:text-neutral-400" />
            </div>
            <input
              type="text"
              value={searchValue}
              onChange={handleSearchChange}
              placeholder={searchPlaceholder}
              className="py-2 px-3 ps-9 pe-9 block w-full border-gray-200 rounded-lg text-sm
                         focus:border-blue-500 focus:ring-blue-500
                         dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-200
                         dark:placeholder-neutral-400 dark:focus:ring-neutral-600"
            />
            {searchValue && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-400 hover:text-gray-600 dark:text-neutral-400 dark:hover:text-neutral-200"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        )}

        {/* Filter Dropdown */}
        {showFilters && filterOptions.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50
                         dark:bg-neutral-800 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-700"
            >
              <Filter className="size-4" />
              Filters
              {activeFilters.length > 0 && (
                <span className="inline-flex items-center justify-center size-5 rounded-full bg-blue-500 text-white text-xs font-semibold">
                  {activeFilters.length}
                </span>
              )}
            </button>

            {showFilterDropdown && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowFilterDropdown(false)}
                />

                {/* Dropdown Menu */}
                <div className="absolute start-0 z-50 mt-2 w-72 bg-white shadow-md rounded-lg border border-gray-200 dark:bg-neutral-800 dark:border-neutral-700">
                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-800 dark:text-neutral-200">
                        Filter by
                      </span>
                      {activeFilters.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearFilters}
                          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    {filterOptions.map((option) => {
                      const isActive = activeFilters.includes(option.id);
                      return (
                        <label
                          key={option.id}
                          className="flex items-center gap-x-3 py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isActive}
                            onChange={() => handleToggleFilter(option.id)}
                            className="shrink-0 size-4 border-gray-200 rounded text-blue-600 focus:ring-blue-500
                                     dark:bg-neutral-800 dark:border-neutral-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-neutral-800"
                          />
                          <span className="flex-1 text-sm text-gray-800 dark:text-neutral-200">
                            {option.label}
                          </span>
                          {option.count !== undefined && (
                            <span className="text-xs text-gray-500 dark:text-neutral-400">
                              {option.count}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Column Visibility Toggle */}
        {showColumnToggle && availableColumns.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColumnDropdown(!showColumnDropdown)}
              className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50
                         dark:bg-neutral-800 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-700"
            >
              <Columns className="size-4" />
              Columns
            </button>

            {showColumnDropdown && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowColumnDropdown(false)}
                />

                {/* Dropdown Menu */}
                <div className="absolute start-0 z-50 mt-2 w-64 bg-white shadow-md rounded-lg border border-gray-200 dark:bg-neutral-800 dark:border-neutral-700">
                  <div className="p-3 space-y-2">
                    <div className="mb-2">
                      <span className="text-sm font-semibold text-gray-800 dark:text-neutral-200">
                        Show/Hide Columns
                      </span>
                    </div>

                    {availableColumns.map((column) => (
                      <label
                        key={column.id}
                        className="flex items-center gap-x-3 py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={column.visible}
                          onChange={() => handleToggleColumnVisibility(column.id)}
                          disabled={column.locked}
                          className="shrink-0 size-4 border-gray-200 rounded text-blue-600 focus:ring-blue-500
                                   dark:bg-neutral-800 dark:border-neutral-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-neutral-800
                                   disabled:opacity-50 disabled:pointer-events-none"
                        />
                        <span className="flex-1 text-sm text-gray-800 dark:text-neutral-200">
                          {column.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Refresh Button */}
        {showRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50
                       dark:bg-neutral-800 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-700"
            title="Refresh"
          >
            <RotateCcw className="size-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}
      </div>

      {/* Right side: Custom Actions */}
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

GridToolbar.displayName = 'GridToolbar';
