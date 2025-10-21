/**
 * AG Grid Type Definitions Index
 *
 * Central export point for all grid-related TypeScript types.
 * Includes data models, component contracts, and AG Grid re-exports.
 *
 * @module lib/ag-grid/types
 */

// ============================================================================
// Data Model Types (from data-model.md)
// ============================================================================

/**
 * Grid theme configuration
 * Encapsulates all design system tokens and AG Grid theme parameters
 */
export interface GridThemeConfig {
  // Core color parameters (CSS variable references)
  backgroundColor: string;
  foregroundColor: string;
  accentColor: string;

  // Typography
  fontFamily: string;
  fontSize: number;
  headerFontSize?: number;

  // Spacing
  spacing: number;
  cellHorizontalPadding: number;
  cellVerticalPadding?: number;

  // Borders
  borderRadius: number;
  wrapperBorderRadius: number;
  borderColor?: string;

  // Additional overrides
  headerBackgroundColor?: string;
  rowHoverColor?: string;
  selectedRowBackgroundColor?: string;
}

/**
 * Column definition with Preline styling extensions
 * Extends AG Grid's ColDef with additional properties
 */
export interface PrelineColumnDef<TData = any> {
  // Core properties
  field: string;
  headerName?: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  flex?: number;

  // Sorting & Filtering
  sortable?: boolean;
  filter?: boolean | string;
  comparator?: (a: any, b: any) => number;

  // Cell Rendering
  cellRenderer?: string | any;
  cellRendererParams?: any;
  valueFormatter?: (params: any) => string;

  // Styling
  cellClass?: string | string[] | ((params: any) => string | string[]);
  cellClassRules?: {
    [cssClass: string]: (params: any) => boolean;
  };
  headerClass?: string | string[];

  // Editing
  editable?: boolean | ((params: any) => boolean);
  cellEditor?: string | any;
  cellEditorParams?: any;

  // Visibility & Interaction
  hide?: boolean;
  lockVisible?: boolean;
  suppressMovable?: boolean;
  resizable?: boolean;

  // Grouping & Aggregation
  rowGroup?: boolean;
  aggFunc?: string | ((values: any[]) => any);
}

/**
 * Generic row data type with AG Grid internal properties
 */
export type RowData<T = any> = T & {
  __ag_grid_id__?: string;
  __ag_grid_selected__?: boolean;
  __ag_grid_editing__?: boolean;
};

/**
 * User preferences for grid layout and state
 * Persisted to localStorage or user settings API
 */
export interface UserPreferences {
  // Column configuration
  columnState: ColumnState[];

  // Sorting
  sortModel: SortModel[];

  // Filtering
  filterModel: FilterModel;

  // Pagination
  paginationPageSize: number;

  // View state
  expandedGroups?: string[];

  // Metadata
  savedAt: string;
  version: string;
}

/**
 * Column state (width, order, visibility, sort)
 */
export interface ColumnState {
  colId: string;
  width?: number;
  hide?: boolean;
  pinned?: 'left' | 'right' | null;
  sort?: 'asc' | 'desc' | null;
  sortIndex?: number;
}

/**
 * Sort model for a column
 */
export interface SortModel {
  colId: string;
  sort: 'asc' | 'desc';
}

/**
 * Filter model for all columns
 */
export interface FilterModel {
  [colId: string]: {
    filterType: string;
    type: string;
    filter: any;
    filterTo?: any;
  };
}

/**
 * Grid event handlers
 * Type-safe callbacks for grid interactions
 */
export interface GridEventHandlers<TData = any> {
  // Row interactions
  onRowClicked?: (event: any) => void;
  onRowDoubleClicked?: (event: any) => void;
  onRowSelected?: (event: any) => void;

  // Cell interactions
  onCellClicked?: (event: any) => void;
  onCellDoubleClicked?: (event: any) => void;
  onCellValueChanged?: (event: any) => void;

  // Grid state changes
  onSortChanged?: (event: any) => void;
  onFilterChanged?: (event: any) => void;
  onColumnResized?: (event: any) => void;

  // Selection
  onSelectionChanged?: (event: any) => void;

  // Lifecycle
  onGridReady?: (event: any) => void;
  onFirstDataRendered?: (event: any) => void;
}

/**
 * Search and filter state
 * Manages external search bar and filter controls
 */
export interface SearchFilterState {
  // Global search
  searchQuery: string;
  searchDebounceMs: number;

  // Column filters
  activeFilters: Map<string, FilterValue>;

  // Filter visibility
  showFilters: boolean;
}

/**
 * Filter value representation
 */
export interface FilterValue {
  column: string;
  operator: FilterOperator;
  value: any;
  displayLabel: string;
}

/**
 * Filter operator types
 */
export type FilterOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual'
  | 'inRange';

/**
 * Pagination state
 * Manages pagination controls and computed values
 */
export interface PaginationState {
  // Current state
  currentPage: number;
  pageSize: number;
  totalRows: number;

  // Available page sizes
  pageSizeOptions: number[];

  // Computed properties
  totalPages: number;
  startRow: number;
  endRow: number;
}

// ============================================================================
// Component Contract Types (from contracts/)
// ============================================================================

// Re-export component props interfaces
export type { DataGridProps, ColumnStateChangedEvent } from '@/specs/001-ag-grid-preline/contracts/DataGrid.interface';
export type { GridToolbarProps, FilterOption, ColumnToggleOption } from '@/specs/001-ag-grid-preline/contracts/GridToolbar.interface';
export type { GridPaginationProps, PaginationState as GridPaginationState } from '@/specs/001-ag-grid-preline/contracts/GridPagination.interface';

// ============================================================================
// AG Grid Type Re-exports (for convenience)
// ============================================================================

export type {
  ColDef,
  GridOptions,
  GridApi,
  ColumnApi,
  CustomCellRendererProps,
  RowClickedEvent,
  SelectionChangedEvent,
  CellValueChangedEvent,
  SortChangedEvent,
  FilterChangedEvent,
  ColumnResizedEvent,
  ValueFormatterParams,
  CellClassParams
} from 'ag-grid-community';
