/**
 * Component Contract: GridToolbar
 *
 * Toolbar component with Preline-styled search, filters, and action controls.
 * Sits above the data grid and provides user interaction controls.
 *
 * @module components/ag-grid/GridToolbar
 */

import { ReactNode } from 'react';
import { GridApi } from 'ag-grid-community';

/**
 * Props for the GridToolbar component
 *
 * @template TData - Type of row data objects
 */
export interface GridToolbarProps<TData = any> {
  // ============================================================================
  // Required Props
  // ============================================================================

  /**
   * AG Grid API instance
   * Used to control grid (search, filter, export, etc.)
   */
  gridApi: GridApi<TData>;

  // ============================================================================
  // Search Configuration
  // ============================================================================

  /**
   * Show search input
   *
   * @default false
   */
  showSearch?: boolean;

  /**
   * Search input placeholder text
   *
   * @default "Search..."
   */
  searchPlaceholder?: string;

  /**
   * Initial search value
   */
  defaultSearchValue?: string;

  /**
   * Search debounce delay in milliseconds
   *
   * @default 300
   */
  searchDebounceMs?: number;

  /**
   * Fired when search value changes (debounced)
   */
  onSearchChange?: (value: string) => void;

  // ============================================================================
  // Filter Configuration
  // ============================================================================

  /**
   * Show filter dropdown button
   *
   * @default false
   */
  showFilters?: boolean;

  /**
   * Available filter options
   */
  filterOptions?: FilterOption[];

  /**
   * Active filters
   */
  activeFilters?: string[];

  /**
   * Fired when filters change
   */
  onFiltersChange?: (filters: string[]) => void;

  // ============================================================================
  // Column Visibility
  // ============================================================================

  /**
   * Show column visibility toggle
   *
   * @default false
   */
  showColumnToggle?: boolean;

  /**
   * Columns available for toggling
   */
  columns?: ColumnToggleOption[];

  /**
   * Fired when column visibility changes
   */
  onColumnVisibilityChange?: (columnId: string, visible: boolean) => void;

  // ============================================================================
  // Density Control
  // ============================================================================

  /**
   * Show density/spacing control
   *
   * @default false
   */
  showDensity?: boolean;

  /**
   * Current density setting
   *
   * @default "normal"
   */
  density?: 'compact' | 'normal' | 'comfortable';

  /**
   * Fired when density changes
   */
  onDensityChange?: (density: 'compact' | 'normal' | 'comfortable') => void;

  // ============================================================================
  // Export & Actions
  // ============================================================================

  /**
   * Show export dropdown (CSV, Excel, PDF)
   *
   * @default false
   */
  showExport?: boolean;

  /**
   * Export options to display
   *
   * @default ['csv', 'excel']
   */
  exportFormats?: ('csv' | 'excel' | 'pdf')[];

  /**
   * Fired when export is triggered
   */
  onExport?: (format: 'csv' | 'excel' | 'pdf') => void;

  /**
   * Show refresh/reload button
   *
   * @default false
   */
  showRefresh?: boolean;

  /**
   * Fired when refresh button clicked
   */
  onRefresh?: () => void;

  /**
   * Custom action buttons/elements
   * Rendered on the right side of toolbar
   */
  actions?: ReactNode;

  // ============================================================================
  // Styling
  // ============================================================================

  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * Inline styles
   */
  style?: React.CSSProperties;
}

/**
 * Filter option for dropdown
 */
export interface FilterOption {
  /**
   * Unique filter ID
   */
  id: string;

  /**
   * Display label
   */
  label: string;

  /**
   * Optional icon component
   */
  icon?: ReactNode;

  /**
   * Filter callback applied to grid
   */
  filterFn: (params: any) => boolean;

  /**
   * Optional badge count (e.g., number of items matching filter)
   */
  count?: number;
}

/**
 * Column toggle option
 */
export interface ColumnToggleOption {
  /**
   * Column ID (matches colDef.field)
   */
  id: string;

  /**
   * Display label
   */
  label: string;

  /**
   * Current visibility state
   */
  visible: boolean;

  /**
   * Prevent toggling (always visible)
   *
   * @default false
   */
  locked?: boolean;
}
