# Data Model: AG Grid with Preline Design Integration

**Feature**: AG Grid with Preline Design Integration
**Date**: 2025-10-20
**Purpose**: Define TypeScript interfaces and data structures for AG Grid components

## Overview

This feature is a client-side UI component library that doesn't persist data. All entities represent configuration, state, and type definitions for the data grid components. Data is provided by parent components and persisted through their mechanisms (Server Actions, localStorage, etc.).

## Core Entities

### 1. Grid Theme Configuration

**Purpose**: Encapsulates all design system tokens and AG Grid theme parameters

**TypeScript Interface**:

```typescript
interface GridThemeConfig {
  // Core color parameters (CSS variable references)
  backgroundColor: string;        // e.g., 'var(--ag-preline-bg)'
  foregroundColor: string;        // e.g., 'var(--ag-preline-fg)'
  accentColor: string;            // e.g., 'var(--ag-preline-accent)'

  // Typography
  fontFamily: string;             // e.g., 'var(--ag-preline-font)'
  fontSize: number;               // Base font size in pixels
  headerFontSize?: number;        // Optional header font size

  // Spacing
  spacing: number;                // Base spacing unit
  cellHorizontalPadding: number;  // Horizontal cell padding (px)
  cellVerticalPadding?: number;   // Vertical cell padding (px)

  // Borders
  borderRadius: number;           // Corner radius for cells/controls
  wrapperBorderRadius: number;    // Corner radius for grid wrapper
  borderColor?: string;           // Custom border color override

  // Additional overrides
  headerBackgroundColor?: string; // Header background override
  rowHoverColor?: string;         // Row hover state color
  selectedRowBackgroundColor?: string; // Selected row background
}
```

**Relationships**:
- Consumed by: `DataGridProps` to create AG Grid theme instance
- Derived from: Tailwind CSS design tokens via CSS custom properties

**Validation Rules**:
- `backgroundColor`, `foregroundColor`, `accentColor` are required
- `fontSize` and `spacing` must be positive numbers
- Color values should be valid CSS (hex, rgb, var(), etc.)

**State Transitions**:
- Initialized once at component mount
- Updated when theme mode changes (light → dark)
- No runtime mutations (immutable configuration)

---

### 2. Column Definition

**Purpose**: Defines structure, behavior, and styling for a single table column

**TypeScript Interface**:

```typescript
import { ColDef, ValueFormatterParams, CellClassParams } from 'ag-grid-community';

interface PrelineColumnDef<TData = any> extends ColDef<TData> {
  // Core properties (inherited from ColDef)
  field: string;                  // Data field name
  headerName?: string;            // Display name (defaults to field)
  width?: number;                 // Column width in pixels
  minWidth?: number;              // Minimum width
  maxWidth?: number;              // Maximum width
  flex?: number;                  // Flex sizing weight

  // Sorting & Filtering
  sortable?: boolean;             // Enable column sorting
  filter?: boolean | string;      // Enable filtering ('text', 'number', 'date', true)
  comparator?: (a: any, b: any) => number; // Custom sort logic

  // Cell Rendering
  cellRenderer?: string | any;    // Custom cell renderer component
  cellRendererParams?: any;       // Parameters for cell renderer
  valueFormatter?: (params: ValueFormatterParams<TData>) => string;

  // Styling
  cellClass?: string | string[] | ((params: CellClassParams<TData>) => string | string[]);
  cellClassRules?: {
    [cssClass: string]: (params: CellClassParams<TData>) => boolean;
  };
  headerClass?: string | string[];

  // Editing
  editable?: boolean | ((params: any) => boolean);
  cellEditor?: string | any;
  cellEditorParams?: any;

  // Visibility & Interaction
  hide?: boolean;                 // Initially hidden
  lockVisible?: boolean;          // Prevent hide/show
  suppressMovable?: boolean;      // Prevent drag reordering
  resizable?: boolean;            // Enable column resizing

  // Grouping & Aggregation
  rowGroup?: boolean;             // Enable row grouping by this column
  aggFunc?: string | ((values: any[]) => any); // Aggregation function
}
```

**Relationships**:
- Contained in: `DataGridProps.columnDefs` array
- Referenced by: Cell Renderers via `colDef` parameter
- Related to: `UserPreferences.columnOrder`, `UserPreferences.columnVisibility`

**Validation Rules**:
- `field` is required and must match a property in `TData`
- If `cellRenderer` is provided, it must be a valid React component or registered renderer name
- `cellClassRules` keys must be valid CSS class names
- `filter` type must match column data type

**State Transitions**:
- Defined at component creation
- Width/order/visibility changed via user interactions
- Updates trigger grid re-render

---

### 3. Row Data

**Purpose**: Represents a single record/row in the data grid

**TypeScript Interface** (Generic):

```typescript
// Generic row data type - actual structure provided by parent component
type RowData<T = any> = T & {
  // Optional AG Grid internal properties
  __ag_grid_id__?: string;        // Internal grid ID
  __ag_grid_selected__?: boolean; // Selection state
  __ag_grid_editing__?: boolean;  // Edit mode state
};

// Example concrete type
interface InvoiceRow {
  id: string;                     // Unique identifier
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;                // ISO date string
  createdAt: string;              // ISO date string
}
```

**Relationships**:
- Provided by: Parent component via `DataGridProps.rowData`
- Consumed by: Cell Renderers, Value Formatters, Cell Class Rules
- Related to: `ColumnDefinition.field` (field names must match)

**Validation Rules**:
- Must be a plain JavaScript object (JSON-serializable)
- Field names referenced in `columnDefs` must exist
- Data types should match column filter types
- Unique identifier recommended (for efficient updates)

**State Transitions**:
- Loaded from parent component
- Updated via inline editing (emits events to parent)
- Sorted/filtered/grouped (view transformations, not data mutations)
- Parent component responsible for persistence

---

### 4. User Preferences

**Purpose**: Stores user's customizations for grid layout and state

**TypeScript Interface**:

```typescript
interface UserPreferences {
  // Column configuration
  columnState: ColumnState[];     // Width, order, visibility per column

  // Sorting
  sortModel: SortModel[];         // Active sort configuration

  // Filtering
  filterModel: FilterModel;       // Active filters per column

  // Pagination
  paginationPageSize: number;     // Rows per page

  // View state
  expandedGroups?: string[];      // IDs of expanded group rows

  // Metadata
  savedAt: string;                // ISO timestamp
  version: string;                // Preferences schema version
}

interface ColumnState {
  colId: string;                  // Column ID (field name)
  width?: number;                 // User-set width
  hide?: boolean;                 // Visibility state
  pinned?: 'left' | 'right' | null; // Pin position
  sort?: 'asc' | 'desc' | null;   // Sort direction
  sortIndex?: number;             // Multi-column sort order
}

interface SortModel {
  colId: string;                  // Column to sort by
  sort: 'asc' | 'desc';           // Sort direction
}

interface FilterModel {
  [colId: string]: {
    filterType: string;           // 'text' | 'number' | 'date' | 'set'
    type: string;                 // 'equals' | 'contains' | 'greaterThan', etc.
    filter: any;                  // Filter value
    filterTo?: any;               // Range filter end value
  };
}
```

**Relationships**:
- Persisted by: Parent component (localStorage, user settings API)
- Applied to: `DataGridProps` via `columnState`, `sortModel`, `filterModel` props
- Updated by: Grid API events (`onColumnResized`, `onSortChanged`, `onFilterChanged`)

**Validation Rules**:
- `columnState.colId` must reference existing columns
- `paginationPageSize` must be positive integer
- `version` must match current schema (for migration)
- Preferences should gracefully degrade if columns removed

**State Transitions**:
- Loaded on component mount
- Updated on user interactions (debounced)
- Persisted to storage (localStorage, API)
- Merged with defaults if incomplete

---

### 5. Grid Event Handlers

**Purpose**: Type-safe event callbacks for grid interactions

**TypeScript Interface**:

```typescript
import {
  RowClickedEvent,
  CellClickedEvent,
  SelectionChangedEvent,
  SortChangedEvent,
  FilterChangedEvent,
  ColumnResizedEvent,
  CellValueChangedEvent
} from 'ag-grid-community';

interface GridEventHandlers<TData = any> {
  // Row interactions
  onRowClicked?: (event: RowClickedEvent<TData>) => void;
  onRowDoubleClicked?: (event: RowClickedEvent<TData>) => void;
  onRowSelected?: (event: SelectionChangedEvent<TData>) => void;

  // Cell interactions
  onCellClicked?: (event: CellClickedEvent<TData>) => void;
  onCellDoubleClicked?: (event: CellClickedEvent<TData>) => void;
  onCellValueChanged?: (event: CellValueChangedEvent<TData>) => void;

  // Grid state changes
  onSortChanged?: (event: SortChangedEvent<TData>) => void;
  onFilterChanged?: (event: FilterChangedEvent<TData>) => void;
  onColumnResized?: (event: ColumnResizedEvent<TData>) => void;

  // Selection
  onSelectionChanged?: (event: SelectionChangedEvent<TData>) => void;

  // Lifecycle
  onGridReady?: (event: any) => void;
  onFirstDataRendered?: (event: any) => void;
}
```

**Relationships**:
- Defined in: `DataGridProps`
- Invoked by: AG Grid internal event system
- Communicate with: Parent component (state updates, Server Actions)

**Validation Rules**:
- All handlers are optional
- Handlers must not throw exceptions (wrap in try-catch)
- Should be wrapped in `useCallback` for performance

**State Transitions**:
- Registered on grid initialization
- Invoked on user interactions
- May trigger parent component state updates

---

### 6. Search and Filter State

**Purpose**: Manages external search bar and filter controls state

**TypeScript Interface**:

```typescript
interface SearchFilterState {
  // Global search
  searchQuery: string;            // Current search text
  searchDebounceMs: number;       // Debounce delay (default: 300ms)

  // Column filters
  activeFilters: Map<string, FilterValue>;

  // Filter visibility
  showFilters: boolean;           // Filter panel visibility
}

interface FilterValue {
  column: string;                 // Column ID
  operator: FilterOperator;       // Comparison operator
  value: any;                     // Filter value
  displayLabel: string;           // User-facing label
}

type FilterOperator =
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
```

**Relationships**:
- Managed by: Search/Filter toolbar components
- Applied to: Grid via `quickFilterText` and `filterModel` props
- Persisted in: `UserPreferences` (optional)

**Validation Rules**:
- `searchQuery` triggers re-filter after debounce
- `activeFilters` must reference existing columns
- Filter operators must match column data types

**State Transitions**:
- Updated on user input (debounced for search)
- Applied to grid via API
- Can be cleared individually or all at once

---

### 7. Pagination State

**Purpose**: Manages pagination controls and state

**TypeScript Interface**:

```typescript
interface PaginationState {
  // Current state
  currentPage: number;            // 0-indexed page number
  pageSize: number;               // Rows per page
  totalRows: number;              // Total row count

  // Available page sizes
  pageSizeOptions: number[];      // e.g., [10, 25, 50, 100]

  // Computed properties (derived)
  totalPages: number;             // Math.ceil(totalRows / pageSize)
  startRow: number;               // currentPage * pageSize
  endRow: number;                 // Math.min(startRow + pageSize, totalRows)
}
```

**Relationships**:
- Managed by: Pagination controls component
- Applied to: Grid via `pagination`, `paginationPageSize` props
- Persisted in: `UserPreferences.paginationPageSize`

**Validation Rules**:
- `currentPage` must be >= 0 and < `totalPages`
- `pageSize` must be in `pageSizeOptions`
- `totalRows` updated when row data changes

**State Transitions**:
- Updated on page navigation
- Updated on page size change
- Reset to page 0 when filters/sort applied

---

## Entity Relationships Diagram

```
┌─────────────────────┐
│ Parent Component    │
│ (Data Provider)     │
└──────────┬──────────┘
           │ provides
           ▼
┌─────────────────────┐         ┌──────────────────┐
│   RowData<T>[]      │────────▶│ ColumnDefinition │
│   (Data Records)    │  refs   │   (Structure)    │
└─────────────────────┘         └────────┬─────────┘
           │                              │
           │ consumed by                  │ uses
           ▼                              ▼
┌─────────────────────┐         ┌──────────────────┐
│   DataGrid          │────────▶│ GridThemeConfig  │
│   (Component)       │  applies│ (Design Tokens)  │
└──────────┬──────────┘         └──────────────────┘
           │
           │ manages
           ▼
┌─────────────────────┐
│  UserPreferences    │
│  (Persisted State)  │
└─────────────────────┘
           │
           │ includes
           ▼
┌─────────────────────┐         ┌──────────────────┐
│ SearchFilterState   │         │ PaginationState  │
│ (View Filtering)    │         │ (View Paging)    │
└─────────────────────┘         └──────────────────┘
```

## Derived/Computed Data

### 1. Visible Rows

Computed from:
- `rowData` (source data)
- `filterModel` (active filters)
- `sortModel` (active sorting)
- `paginationState` (current page/size)

Transformation:
```
rowData → filter → sort → paginate → visibleRows
```

### 2. Column Visibility Map

Computed from `UserPreferences.columnState`:

```typescript
const visibilityMap = columnState.reduce((map, col) => {
  map[col.colId] = !col.hide;
  return map;
}, new Map<string, boolean>());
```

### 3. Total Pages

Computed from pagination state:

```typescript
const totalPages = Math.ceil(totalRows / pageSize);
```

### 4. Active Filter Count

Computed from `SearchFilterState`:

```typescript
const activeFilterCount = activeFilters.size + (searchQuery ? 1 : 0);
```

## Type Export Index

All types should be exported from a central index file for reusability:

```typescript
// lib/ag-grid/types/index.ts
export type {
  GridThemeConfig,
  PrelineColumnDef,
  RowData,
  UserPreferences,
  ColumnState,
  SortModel,
  FilterModel,
  GridEventHandlers,
  SearchFilterState,
  FilterValue,
  FilterOperator,
  PaginationState
};

// Re-export commonly used AG Grid types
export type {
  ColDef,
  GridOptions,
  GridApi,
  ColumnApi,
  CustomCellRendererProps
} from 'ag-grid-community';
```

## Naming Conventions

- **Interfaces**: PascalCase, descriptive names (`GridThemeConfig`, not `Config`)
- **Type Aliases**: PascalCase with `Type` suffix if ambiguous (`FilterOperator`, not `Operator`)
- **Generic Parameters**: Single uppercase letter or `T` prefix (`TData`, `TValue`)
- **Props Interfaces**: Component name + `Props` (`DataGridProps`)
- **Event Handlers**: `on` prefix + event name (`onRowClicked`)
- **Boolean Fields**: `is`/`has`/`show` prefix (`showFilters`, `isEditable`)

## Validation Strategy

Use Zod for runtime validation of component props (optional but recommended):

```typescript
import { z } from 'zod';

const GridThemeConfigSchema = z.object({
  backgroundColor: z.string(),
  foregroundColor: z.string(),
  accentColor: z.string(),
  fontFamily: z.string(),
  fontSize: z.number().positive(),
  spacing: z.number().positive(),
  cellHorizontalPadding: z.number().positive(),
  borderRadius: z.number().nonnegative(),
  wrapperBorderRadius: z.number().nonnegative()
});

// Use in component props validation
export const validateThemeConfig = (config: unknown): GridThemeConfig => {
  return GridThemeConfigSchema.parse(config);
};
```

## Next Steps

With data models defined:
1. Generate contracts/ (component prop interfaces, API contracts)
2. Generate quickstart.md (usage examples with these types)
3. Implement components using these TypeScript definitions
