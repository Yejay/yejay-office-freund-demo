# Quickstart: AG Grid with Preline Design Integration

**Last Updated**: 2025-10-20
**Status**: Implementation Ready

## Overview

This guide shows how to use the AG Grid + Preline components once implemented. It covers basic setup, common use cases, and integration patterns with Next.js 15 and the OfficeFreund Demo application.

## Prerequisites

- ✅ AG Grid Community v34.2.0 (already installed)
- ✅ AG Grid React v34.2.0 (already installed)
- ✅ Preline UI v3.2.3 (already installed)
- ✅ Tailwind CSS v3.4.1 (already installed)
- ✅ Next.js 15 with App Router
- ✅ TypeScript 5.x with strict mode
- ✅ `next-themes` for dark mode support

## Installation

*No additional dependencies required - all packages are already installed.*

## Basic Usage

### 1. Simple Data Grid

The simplest grid with default styling:

```typescript
// app/example/page.tsx
'use client';

import { DataGrid } from '@/components/ag-grid/DataGrid';
import { ColDef } from 'ag-grid-community';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
}

export default function ExamplePage() {
  const rowData: Invoice[] = [
    { id: '1', invoiceNumber: 'INV-001', customer: 'Alice', amount: 500, status: 'paid' },
    { id: '2', invoiceNumber: 'INV-002', customer: 'Bob', amount: 750, status: 'pending' }
  ];

  const columnDefs: ColDef<Invoice>[] = [
    { field: 'invoiceNumber', headerName: 'Invoice #' },
    { field: 'customer', headerName: 'Customer' },
    { field: 'amount', headerName: 'Amount', valueFormatter: p => `$${p.value}` },
    { field: 'status', headerName: 'Status' }
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Invoices</h1>
      <DataGrid
        rowData={rowData}
        columnDefs={columnDefs}
      />
    </div>
  );
}
```

### 2. Grid with Search and Filters

Add search bar and filter controls:

```typescript
'use client';

import { DataGrid } from '@/components/ag-grid/DataGrid';
import { ColDef } from 'ag-grid-community';
import { useState } from 'react';

export default function AdvancedExample() {
  const [rowData] = useState<Invoice[]>(/* ... */);

  const columnDefs: ColDef<Invoice>[] = [
    {
      field: 'status',
      headerName: 'Status',
      cellClassRules: {
        'bg-teal-100 text-teal-800 dark:bg-teal-500/10 dark:text-teal-500':
          params => params.value === 'paid',
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-500':
          params => params.value === 'pending',
        'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-500':
          params => params.value === 'overdue'
      }
    },
    // ... other columns
  ];

  return (
    <DataGrid
      rowData={rowData}
      columnDefs={columnDefs}
      showSearch
      searchPlaceholder="Search invoices..."
      showFilters
      pagination
      paginationPageSize={25}
    />
  );
}
```

### 3. Custom Cell Renderer

Create custom React components for cells:

```typescript
// components/ag-grid/renderers/StatusBadge.tsx
import { memo } from 'react';
import { CustomCellRendererProps } from 'ag-grid-react';

interface Invoice {
  status: 'paid' | 'pending' | 'overdue';
}

export const StatusBadge = memo((props: CustomCellRendererProps<Invoice>) => {
  const statusConfig = {
    paid: {
      className: 'bg-teal-100 text-teal-800 dark:bg-teal-500/10 dark:text-teal-500',
      label: 'Paid'
    },
    pending: {
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-500',
      label: 'Pending'
    },
    overdue: {
      className: 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-500',
      label: 'Overdue'
    }
  };

  const config = statusConfig[props.value];

  return (
    <span className={`inline-flex items-center px-1.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
});

StatusBadge.displayName = 'StatusBadge';

// Usage in column definition
const columnDefs: ColDef<Invoice>[] = [
  {
    field: 'status',
    headerName: 'Status',
    cellRenderer: StatusBadge
  }
];
```

### 4. Interactive Rows with Actions

Handle row clicks and add action buttons:

```typescript
'use client';

import { DataGrid } from '@/components/ag-grid/DataGrid';
import { RowClickedEvent } from 'ag-grid-community';
import { useCallback } from 'react';

export default function InteractiveGrid() {
  const handleRowClicked = useCallback((event: RowClickedEvent<Invoice>) => {
    console.log('Row clicked:', event.data);
    // Navigate to detail page, open modal, etc.
  }, []);

  const handleEdit = useCallback((invoice: Invoice) => {
    // Open edit modal or navigate to edit page
    console.log('Edit invoice:', invoice);
  }, []);

  const columnDefs: ColDef<Invoice>[] = [
    // ... data columns
    {
      headerName: 'Actions',
      cellRenderer: (props: CustomCellRendererProps<Invoice>) => (
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent row click
            handleEdit(props.data);
          }}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
        >
          Edit
        </button>
      ),
      width: 100,
      sortable: false,
      filter: false
    }
  ];

  return (
    <DataGrid
      rowData={rowData}
      columnDefs={columnDefs}
      onRowClicked={handleRowClicked}
    />
  );
}
```

### 5. Server Actions Integration (Inline Editing)

Connect grid editing to Next.js Server Actions:

```typescript
// app/actions/invoices.ts
'use server';

import { auth } from '@clerk/nextjs';
import { createClient } from '@/lib/supabase/clerk-server';

export async function updateInvoiceAmount(invoiceId: string, amount: number) {
  const { orgId } = auth();
  if (!orgId) throw new Error('Unauthorized');

  const supabase = await createClient();

  const { error } = await supabase
    .from('invoices')
    .update({ amount })
    .eq('id', invoiceId)
    .eq('organization_id', orgId);

  if (error) throw error;

  return { success: true };
}

// app/invoices/page.tsx
'use client';

import { DataGrid } from '@/components/ag-grid/DataGrid';
import { CellValueChangedEvent } from 'ag-grid-community';
import { updateInvoiceAmount } from '@/app/actions/invoices';
import { useCallback } from 'react';

export default function EditableGrid() {
  const handleCellValueChanged = useCallback(
    async (event: CellValueChangedEvent<Invoice>) => {
      if (event.colDef.field === 'amount') {
        try {
          await updateInvoiceAmount(event.data.id, event.newValue);
          // Optionally show success notification
        } catch (error) {
          console.error('Update failed:', error);
          // Revert cell value on error
          event.node.setDataValue(event.colDef.field, event.oldValue);
        }
      }
    },
    []
  );

  const columnDefs: ColDef<Invoice>[] = [
    { field: 'invoiceNumber', editable: false },
    { field: 'customer', editable: false },
    { field: 'amount', editable: true }, // Editable column
    { field: 'status', editable: false }
  ];

  return (
    <DataGrid
      rowData={rowData}
      columnDefs={columnDefs}
      onCellValueChanged={handleCellValueChanged}
    />
  );
}
```

### 6. Dark Mode Support

Dark mode works automatically with `next-themes`:

```typescript
// app/layout.tsx (already configured in project)
import { ThemeProvider } from 'next-themes';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

// Data grid automatically adapts to theme
// No additional configuration needed!
```

### 7. Persist User Preferences

Save column state, filters, and sorting:

```typescript
'use client';

import { DataGrid } from '@/components/ag-grid/DataGrid';
import { GridApi, ColumnState } from 'ag-grid-community';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'invoiceGrid_preferences';

export default function PersistentGrid() {
  const [gridApi, setGridApi] = useState<GridApi<Invoice>>();

  // Load preferences on mount
  useEffect(() => {
    if (!gridApi) return;

    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      const { columnState, filterModel, sortModel } = JSON.parse(savedState);
      gridApi.applyColumnState({ state: columnState, applyOrder: true });
      gridApi.setFilterModel(filterModel);
      // Sort model applied via column state
    }
  }, [gridApi]);

  // Save preferences on changes (debounced)
  const handleGridStateChanged = useCallback(() => {
    if (!gridApi) return;

    const state = {
      columnState: gridApi.getColumnState(),
      filterModel: gridApi.getFilterModel(),
      sortModel: gridApi.getSortModel()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [gridApi]);

  return (
    <DataGrid
      gridId="invoices" // Used for preference key
      rowData={rowData}
      columnDefs={columnDefs}
      onGridReady={setGridApi}
      onSortChanged={handleGridStateChanged}
      onFilterChanged={handleGridStateChanged}
      onColumnStateChanged={handleGridStateChanged}
    />
  );
}
```

## Component API Reference

### DataGrid Props

See `contracts/DataGrid.interface.ts` for complete API.

**Key Props**:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `rowData` | `TData[]` | *required* | Array of row data objects |
| `columnDefs` | `ColDef<TData>[]` | *required* | Column definitions |
| `gridId` | `string` | `undefined` | Unique ID for preference persistence |
| `pagination` | `boolean` | `true` | Enable pagination |
| `paginationPageSize` | `number` | `50` | Rows per page |
| `showSearch` | `boolean` | `false` | Show search bar |
| `showFilters` | `boolean` | `false` | Show filter controls |
| `rowSelection` | `'single' \| 'multiple' \| false` | `false` | Enable row selection |
| `onRowClicked` | `(event) => void` | `undefined` | Row click handler |
| `onCellValueChanged` | `(event) => void` | `undefined` | Cell edit handler |

## Styling Customization

### Using Tailwind Utilities

Apply Tailwind classes directly to cells:

```typescript
const columnDefs: ColDef[] = [
  {
    field: 'name',
    cellClass: 'font-semibold text-gray-900 dark:text-white'
  },
  {
    field: 'amount',
    cellClass: 'text-right tabular-nums'
  }
];
```

### Custom Theme Override

Override default Preline theme:

```typescript
<DataGrid
  rowData={rowData}
  columnDefs={columnDefs}
  themeConfig={{
    accentColor: '#10b981', // Green accent
    borderRadius: 12,
    cellHorizontalPadding: 32
  }}
/>
```

## Performance Optimization

### Memoize Column Definitions

```typescript
const columnDefs = useMemo<ColDef<Invoice>[]>(() => [
  { field: 'invoiceNumber' },
  { field: 'customer' }
], []); // Empty deps - stable reference
```

### Memoize Event Handlers

```typescript
const handleRowClicked = useCallback((event: RowClickedEvent<Invoice>) => {
  console.log(event.data);
}, []); // Only create once
```

### Use Value Formatters Over Cell Renderers

```typescript
// ✅ Fast - no extra components
{ field: 'amount', valueFormatter: p => `$${p.value}` }

// ❌ Slower - React component per cell
{ field: 'amount', cellRenderer: AmountRenderer }
```

## Common Patterns

### Loading State

```typescript
const [loading, setLoading] = useState(true);
const [rowData, setRowData] = useState<Invoice[]>([]);

useEffect(() => {
  fetchInvoices().then((data) => {
    setRowData(data);
    setLoading(false);
  });
}, []);

return (
  <DataGrid
    rowData={rowData}
    columnDefs={columnDefs}
    loading={loading}
  />
);
```

### Empty State

```typescript
<DataGrid
  rowData={rowData}
  columnDefs={columnDefs}
  emptyState={
    <div className="text-center py-10">
      <p className="text-gray-500">No invoices found</p>
      <button onClick={createNew}>Create Invoice</button>
    </div>
  }
/>
```

### Export Data

```typescript
import { GridApi } from 'ag-grid-community';

const [gridApi, setGridApi] = useState<GridApi>();

const handleExportCSV = () => {
  gridApi?.exportDataAsCsv({
    fileName: 'invoices.csv'
  });
};

return (
  <>
    <button onClick={handleExportCSV}>Export CSV</button>
    <DataGrid
      onGridReady={setGridApi}
      rowData={rowData}
      columnDefs={columnDefs}
    />
  </>
);
```

## Troubleshooting

### Grid Not Rendering

**Issue**: Grid shows as empty or unstyled.

**Solution**: Ensure component has `"use client"` directive (AG Grid requires client-side rendering):

```typescript
'use client'; // Must be at top of file

import { DataGrid } from '@/components/ag-grid/DataGrid';
```

### Dark Mode Not Working

**Issue**: Grid doesn't switch themes.

**Solution**: Verify `ThemeProvider` is configured in layout and grid has hydration guard:

```typescript
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return null;
```

### TypeScript Errors

**Issue**: Type errors with column definitions or row data.

**Solution**: Use generic type parameters:

```typescript
const columnDefs: ColDef<Invoice>[] = [ /* ... */ ];
<DataGrid<Invoice> rowData={invoices} columnDefs={columnDefs} />
```

### Performance Issues

**Issue**: Grid is slow with large datasets.

**Solution**:
1. Use `useMemo` for columnDefs
2. Use `useCallback` for event handlers
3. Prefer `valueFormatter` over custom renderers
4. Enable virtualization (default in AG Grid)

## Next Steps

1. ✅ Review this quickstart guide
2. 📖 Read `contracts/README.md` for component API details
3. 📖 Read `data-model.md` for TypeScript type definitions
4. 🔨 Implement components per specification
5. 🧪 Test with real invoice data from OfficeFreund Demo
6. 🎨 Customize theme to match application branding

## Resources

- [AG Grid React Documentation](https://www.ag-grid.com/react-data-grid/)
- [Preline UI Documentation](https://preline.co/docs/)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [next-themes Documentation](https://github.com/pacocoursey/next-themes)
