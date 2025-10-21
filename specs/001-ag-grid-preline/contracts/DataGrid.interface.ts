/**
 * Component Contract: DataGrid
 *
 * Main data grid component integrating AG Grid with Preline design system.
 * Provides enterprise-grade table functionality with modern UX.
 *
 * @module components/ag-grid/DataGrid
 */

import { GridOptions, ColDef, GridApi } from 'ag-grid-community';
import { ReactNode } from 'react';

/**
 * Props for the DataGrid component
 *
 * @template TData - Type of row data objects
 */
export interface DataGridProps<TData = any> {
  // ============================================================================
  // Required Props
  // ============================================================================

  /**
   * Array of row data objects to display in the grid
   *
   * @example
   * ```tsx
   * const rowData = [
   *   { id: 1, name: 'Alice', status: 'active' },
   *   { id: 2, name: 'Bob', status: 'inactive' }
   * ];
   * ```
   */
  rowData: TData[];

  /**
   * Column definitions specifying structure and behavior
   *
   * @example
   * ```tsx
   * const columnDefs: ColDef<MyData>[] = [
   *   { field: 'name', headerName: 'Name', sortable: true },
   *   { field: 'status', cellRenderer: StatusBadge }
   * ];
   * ```
   */
  columnDefs: ColDef<TData>[];

  // ============================================================================
  // Optional Configuration
  // ============================================================================

  /**
   * Unique identifier for the grid instance
   * Used for persisting user preferences
   *
   * @default undefined (no preference persistence)
   */
  gridId?: string;

  /**
   * Default column definition properties applied to all columns
   *
   * @default { sortable: true, filter: true, resizable: true }
   */
  defaultColDef?: ColDef<TData>;

  /**
   * Custom AG Grid options for advanced configuration
   * Merged with default options
   *
   * @see https://www.ag-grid.com/react-data-grid/grid-options/
   */
  gridOptions?: GridOptions<TData>;

  /**
   * Custom theme configuration
   * If not provided, uses default Preline theme
   */
  themeConfig?: Partial<GridThemeConfig>;

  // ============================================================================
  // Feature Flags
  // ============================================================================

  /**
   * Enable pagination
   *
   * @default true
   */
  pagination?: boolean;

  /**
   * Rows per page
   *
   * @default 50
   */
  paginationPageSize?: number;

  /**
   * Available page size options
   *
   * @default [10, 25, 50, 100]
   */
  paginationPageSizeOptions?: number[];

  /**
   * Enable row selection
   *
   * @default false
   */
  rowSelection?: 'single' | 'multiple' | false;

  /**
   * Enable global quick filter (search all columns)
   *
   * @default false
   */
  enableQuickFilter?: boolean;

  /**
   * Enable column filters
   *
   * @default true
   */
  enableColumnFilters?: boolean;

  /**
   * Enable column sorting
   *
   * @default true
   */
  enableSorting?: boolean;

  /**
   * Enable column resizing
   *
   * @default true
   */
  enableColumnResizing?: boolean;

  /**
   * Enable column reordering via drag-and-drop
   *
   * @default true
   */
  enableColumnReordering?: boolean;

  /**
   * Animate rows on sort/filter changes
   *
   * @default true
   */
  animateRows?: boolean;

  // ============================================================================
  // Toolbar Controls
  // ============================================================================

  /**
   * Show search bar in toolbar
   *
   * @default false
   */
  showSearch?: boolean;

  /**
   * Placeholder text for search input
   *
   * @default "Search..."
   */
  searchPlaceholder?: string;

  /**
   * Show filter controls in toolbar
   *
   * @default false
   */
  showFilters?: boolean;

  /**
   * Show column visibility toggle
   *
   * @default false
   */
  showColumnToggle?: boolean;

  /**
   * Show density/spacing controls
   *
   * @default false
   */
  showDensityControl?: boolean;

  /**
   * Custom toolbar actions (buttons, dropdowns, etc.)
   */
  toolbarActions?: ReactNode;

  // ============================================================================
  // Loading & Empty States
  // ============================================================================

  /**
   * Loading state for async data fetching
   *
   * @default false
   */
  loading?: boolean;

  /**
   * Custom loading overlay component
   */
  loadingOverlay?: ReactNode;

  /**
   * Custom empty state component
   * Shown when rowData is empty
   */
  emptyState?: ReactNode;

  /**
   * Custom "no rows match filter" component
   */
  noRowsOverlay?: ReactNode;

  // ============================================================================
  // Event Handlers
  // ============================================================================

  /**
   * Fired when a row is clicked
   */
  onRowClicked?: (event: RowClickedEvent<TData>) => void;

  /**
   * Fired when a row is double-clicked
   */
  onRowDoubleClicked?: (event: RowClickedEvent<TData>) => void;

  /**
   * Fired when row selection changes
   */
  onSelectionChanged?: (event: SelectionChangedEvent<TData>) => void;

  /**
   * Fired when a cell value is edited
   */
  onCellValueChanged?: (event: CellValueChangedEvent<TData>) => void;

  /**
   * Fired when sorting changes
   */
  onSortChanged?: (event: SortChangedEvent<TData>) => void;

  /**
   * Fired when filters change
   */
  onFilterChanged?: (event: FilterChangedEvent<TData>) => void;

  /**
   * Fired when column visibility/order/width changes
   */
  onColumnStateChanged?: (event: ColumnStateChangedEvent<TData>) => void;

  /**
   * Fired when grid is ready (provides Grid API)
   */
  onGridReady?: (api: GridApi<TData>) => void;

  // ============================================================================
  // Styling & Customization
  // ============================================================================

  /**
   * Additional CSS class names for grid wrapper
   */
  className?: string;

  /**
   * Inline styles for grid wrapper
   */
  style?: React.CSSProperties;

  /**
   * Grid height
   *
   * @default "600px"
   */
  height?: string | number;

  /**
   * Grid width
   *
   * @default "100%"
   */
  width?: string | number;

  /**
   * Row height in pixels
   *
   * @default undefined (auto-height based on theme)
   */
  rowHeight?: number;

  /**
   * Header height in pixels
   *
   * @default undefined (auto-height based on theme)
   */
  headerHeight?: number;
}

/**
 * Grid theme configuration options
 */
export interface GridThemeConfig {
  backgroundColor: string;
  foregroundColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: number;
  spacing: number;
  cellHorizontalPadding: number;
  borderRadius: number;
  wrapperBorderRadius: number;
}

/**
 * Event types (re-exported from ag-grid for convenience)
 */
export type {
  RowClickedEvent,
  SelectionChangedEvent,
  CellValueChangedEvent,
  SortChangedEvent,
  FilterChangedEvent
} from 'ag-grid-community';

/**
 * Column state changed event
 */
export interface ColumnStateChangedEvent<TData = any> {
  api: GridApi<TData>;
  columnState: ColumnState[];
}

/**
 * Column state representation
 */
export interface ColumnState {
  colId: string;
  width?: number;
  hide?: boolean;
  pinned?: 'left' | 'right' | null;
  sort?: 'asc' | 'desc' | null;
  sortIndex?: number;
}
