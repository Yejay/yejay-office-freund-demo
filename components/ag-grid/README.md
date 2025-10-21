# AG Grid with Preline Design System

Enterprise-grade data grid components with complete Preline design system integration.

## Overview

This package provides fully-styled AG Grid components that seamlessly integrate with the Preline Pro design system. All components support dark mode, are fully accessible (WCAG AA compliant), and maintain 100% visual design token alignment with Preline.

## Quick Start

```tsx
'use client';

import { DataGrid } from '@/components/ag-grid/DataGrid';
import { ColDef } from 'ag-grid-community';

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
}

export default function InvoicesPage() {
  const rowData: Invoice[] = [
    { id: '1', invoiceNumber: 'INV-001', amount: 500, status: 'paid' },
    { id: '2', invoiceNumber: 'INV-002', amount: 750, status: 'pending' },
  ];

  const columnDefs: ColDef<Invoice>[] = [
    { field: 'invoiceNumber', headerName: 'Invoice #' },
    { field: 'amount', valueFormatter: p => `$${p.value}` },
    { field: 'status', headerName: 'Status' },
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Invoices</h1>
      <DataGrid<Invoice>
        rowData={rowData}
        columnDefs={columnDefs}
        pagination
        showSearch
        showFilters
      />
    </div>
  );
}
```

## Components

### DataGrid

Main grid component with full Preline integration.

**Key Features:**
- 🎨 Complete Preline design system alignment
- 🌓 Automatic dark mode support
- 🔍 Built-in search and filters
- 📄 Pagination with custom controls
- ♿ WCAG AA accessible
- 💾 State persistence to localStorage
- 📱 Responsive design

**Props:** See `contracts/DataGrid.interface.ts`

### GridToolbar

Search, filter, and action toolbar.

**Features:**
- Debounced search input
- Multi-select filter dropdown
- Column visibility toggle
- Custom action buttons
- Responsive layout

### GridPagination

Custom pagination controls matching Preline design.

**Features:**
- Page navigation with keyboard support
- Page size selector
- Row count display
- Ellipsis handling for large page counts

### Cell Renderers

#### StatusBadge
Preline-styled status badges for common status types.

```tsx
{
  field: 'status',
  cellRenderer: StatusBadge,
}
```

#### ActionButtons
Row action buttons with customizable handlers.

```tsx
{
  headerName: 'Actions',
  cellRenderer: ActionButtons,
  cellRendererParams: {
    actions: [
      createEditAction((data) => console.log('Edit', data)),
      createDeleteAction((data) => console.log('Delete', data)),
    ]
  }
}
```

## Advanced Features

### State Persistence

Automatically save column order, width, visibility, filters, and sorting:

```tsx
<DataGrid
  gridId="invoices-grid" // Enable persistence with unique ID
  rowData={rowData}
  columnDefs={columnDefs}
/>
```

### Row Grouping

Enable row grouping by setting `rowGroup: true` on column definitions:

```tsx
const columnDefs: ColDef[] = [
  { field: 'category', rowGroup: true },
  { field: 'name' },
];
```

### Inline Editing

Enable cell editing with validation:

```tsx
const columnDefs: ColDef[] = [
  {
    field: 'amount',
    editable: true,
    cellEditor: 'agNumberCellEditor'
  },
];

<DataGrid
  columnDefs={columnDefs}
  onCellValueChanged={async (event) => {
    await updateRecord(event.data.id, event.newValue);
  }}
/>
```

### Custom Cell Renderers

Create custom renderers with Preline styling:

```tsx
const MyRenderer = memo((props: CustomCellRendererProps) => {
  return (
    <span className="text-blue-600 dark:text-blue-400">
      {props.value}
    </span>
  );
});
```

## Hooks

### useGridTheme

Manages theme configuration with dark mode support.

```tsx
const { theme, dataThemeMode } = useGridTheme({
  themeConfig: {
    fontSize: 16,
    cellHorizontalPadding: 32
  }
});
```

### useGridState

Persists grid state to localStorage.

```tsx
const { saveState, clearState } = useGridState({
  gridId: 'my-grid',
  gridApi,
});
```

## Utilities

Located in `lib/ag-grid/utils.ts`:

- `formatDate()` - Format dates for display
- `formatCurrency()` - Format currency values
- `formatNumber()` - Format numbers
- `createColumnDef()` - Create column with defaults
- `generateColumnsFromData()` - Auto-generate columns
- `debounce()` - Debounce function calls

## Accessibility

All components are WCAG AA compliant:

- ✅ Full keyboard navigation (Tab, Arrow keys, Enter, Escape)
- ✅ Proper ARIA labels and roles
- ✅ Color contrast ratios meet WCAG AA standards
- ✅ Focus indicators on all interactive elements
- ✅ Screen reader support

### Keyboard Shortcuts

**Grid:**
- `Tab` - Navigate between cells
- `Arrow keys` - Navigate grid
- `Enter` - Edit cell (if editable)
- `Escape` - Cancel edit

**Pagination:**
- `Arrow Left/Right` - Previous/Next page
- `Home/End` - First/Last page

## Dark Mode

Dark mode is automatically handled via `next-themes`. The grid detects the current theme and applies appropriate styling.

No additional configuration needed!

## Performance

All components are optimized for performance:

- Cell renderers use `React.memo()`
- Event handlers use `useCallback()`
- Column definitions use `useMemo()`
- Virtual scrolling handles 10,000+ rows

## TypeScript

Full TypeScript support with generics:

```tsx
interface MyData {
  id: number;
  name: string;
}

<DataGrid<MyData>
  rowData={data}
  columnDefs={columnDefs}
  onRowClicked={(event) => {
    // event.data is typed as MyData
    console.log(event.data.name);
  }}
/>
```

## Examples

See `/specs/001-ag-grid-preline/quickstart.md` for comprehensive examples.

## Architecture

```
components/ag-grid/
├── DataGrid.tsx           # Main grid component
├── GridToolbar.tsx        # Toolbar with search/filters
├── GridPagination.tsx     # Pagination controls
├── hooks/
│   ├── useGridTheme.ts    # Theme management
│   └── useGridState.ts    # State persistence
└── renderers/
    ├── StatusBadge.tsx    # Status badge renderer
    └── ActionButtons.tsx  # Action buttons renderer

lib/ag-grid/
├── theme.ts               # Theme configuration
├── utils.ts               # Utility functions
└── types/
    └── index.ts           # TypeScript types

app/globals.css
└── AG Grid CSS overrides  # Preline design token mappings
```

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## License

Part of the OfficeFreund Demo application.

## Resources

- [AG Grid Documentation](https://www.ag-grid.com/react-data-grid/)
- [Preline UI Documentation](https://preline.co/docs/)
- [Component Contracts](/specs/001-ag-grid-preline/contracts/)
- [Quickstart Guide](/specs/001-ag-grid-preline/quickstart.md)
