/**
 * Component Contract: GridPagination
 *
 * Preline-styled pagination controls for AG Grid.
 * Displays page navigation, page size selector, and row count info.
 *
 * @module components/ag-grid/GridPagination
 */

import { GridApi } from 'ag-grid-community';

/**
 * Props for the GridPagination component
 */
export interface GridPaginationProps {
  // ============================================================================
  // Required Props
  // ============================================================================

  /**
   * AG Grid API instance
   * Used to control pagination state
   */
  gridApi: GridApi;

  // ============================================================================
  // Pagination State
  // ============================================================================

  /**
   * Current page number (0-indexed)
   */
  currentPage: number;

  /**
   * Rows per page
   */
  pageSize: number;

  /**
   * Total number of rows
   */
  totalRows: number;

  // ============================================================================
  // Configuration
  // ============================================================================

  /**
   * Available page size options
   *
   * @default [10, 25, 50, 100]
   */
  pageSizeOptions?: number[];

  /**
   * Show page size selector
   *
   * @default true
   */
  showPageSizeSelector?: boolean;

  /**
   * Show row count info (e.g., "Showing 1-50 of 1,234")
   *
   * @default true
   */
  showRowCount?: boolean;

  /**
   * Show quick page jump input
   *
   * @default false
   */
  showPageJump?: boolean;

  /**
   * Maximum number of page buttons to display
   * (before ellipsis)
   *
   * @default 7
   */
  maxPageButtons?: number;

  // ============================================================================
  // Event Handlers
  // ============================================================================

  /**
   * Fired when page changes
   */
  onPageChange?: (page: number) => void;

  /**
   * Fired when page size changes
   */
  onPageSizeChange?: (pageSize: number) => void;

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

  /**
   * Alignment of pagination controls
   *
   * @default "center"
   */
  align?: 'left' | 'center' | 'right' | 'between';
}

/**
 * Computed pagination state (derived values)
 */
export interface PaginationState {
  /**
   * Current page (0-indexed)
   */
  currentPage: number;

  /**
   * Rows per page
   */
  pageSize: number;

  /**
   * Total rows
   */
  totalRows: number;

  /**
   * Total pages (computed)
   */
  totalPages: number;

  /**
   * Start row index (computed, 0-indexed)
   */
  startRow: number;

  /**
   * End row index (computed, 0-indexed)
   */
  endRow: number;

  /**
   * Has previous page
   */
  hasPrevious: boolean;

  /**
   * Has next page
   */
  hasNext: boolean;

  /**
   * Page numbers to display (accounting for ellipsis)
   */
  visiblePages: (number | 'ellipsis')[];
}
