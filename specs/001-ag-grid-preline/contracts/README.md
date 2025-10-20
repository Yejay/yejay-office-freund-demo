# Component Contracts

This directory contains TypeScript interface definitions for all components in the AG Grid with Preline integration.

## Purpose

Component contracts serve as the **single source of truth** for:

1. **Component APIs**: Props, events, and public methods
2. **Type Safety**: TypeScript definitions for strict typing
3. **Documentation**: JSDoc comments explain usage and behavior
4. **Testing**: Interface mocks for unit/integration tests
5. **Implementation Guide**: Clear contract for component developers

## Files

### Core Components

- **`DataGrid.interface.ts`**: Main data grid component
  - Primary integration point for AG Grid + Preline
  - Configures columns, data, features, and styling
  - Emits events for parent component integration

- **`GridToolbar.interface.ts`**: Toolbar controls
  - Search bar (with debounce)
  - Filter dropdown
  - Column visibility toggle
  - Density controls
  - Export and custom actions

- **`GridPagination.interface.ts`**: Pagination controls
  - Page navigation buttons
  - Page size selector
  - Row count display
  - Page jump input

### Cell Renderers

(To be added during implementation)

- `StatusBadge.interface.ts`: Status badge renderer
- `ActionButtons.interface.ts`: Row action buttons renderer
- Custom renderers as needed

## Usage Guidelines

### Importing Contracts

```typescript
// Import specific interfaces
import { DataGridProps, GridThemeConfig } from './contracts/DataGrid.interface';
import { GridToolbarProps } from './contracts/GridToolbar.interface';

// Or import all from index (if created)
import type { DataGridProps, GridToolbarProps } from '@/contracts';
```

### Implementing Components

Components **must** satisfy their contract interfaces:

```typescript
// ✅ Correct: Component matches contract
import { DataGridProps } from './contracts/DataGrid.interface';

export function DataGrid<TData = any>(props: DataGridProps<TData>) {
  // Implementation
}

// ❌ Wrong: Missing required props or incorrect types
export function DataGrid(props: any) {
  // Type safety lost
}
```

### Extending Contracts

If a component needs additional props not in the contract, extend the interface:

```typescript
// contracts/DataGrid.interface.ts
export interface DataGridProps<TData = any> {
  rowData: TData[];
  // ... base props
}

// components/InvoiceDataGrid.tsx
interface InvoiceDataGridProps extends DataGridProps<Invoice> {
  onInvoicePaid?: (invoiceId: string) => void;
  // Invoice-specific props
}
```

## Contract Principles

### 1. Required vs Optional

- **Required props**: No `?` suffix, must be provided by consumer
- **Optional props**: `?` suffix, has sensible defaults

```typescript
interface MyProps {
  data: any[];          // Required
  pageSize?: number;    // Optional (has default)
}
```

### 2. Generic Types

Use TypeScript generics for type-safe row data:

```typescript
interface DataGridProps<TData = any> {
  rowData: TData[];
  onRowClicked?: (row: TData) => void;
}

// Usage with specific type
<DataGrid<Invoice> rowData={invoices} />
```

### 3. Event Handlers

Event handlers follow React conventions:

- Prefix: `on` (e.g., `onRowClicked`)
- Return type: `void` (events are fire-and-forget)
- Parameter: Descriptive event object

```typescript
interface MyProps {
  onRowClicked?: (event: RowClickedEvent) => void;
}
```

### 4. Defaults in JSDoc

Document default values in JSDoc comments:

```typescript
/**
 * Rows per page
 *
 * @default 50
 */
pageSize?: number;
```

### 5. Styling Props

All components accept standard styling props:

```typescript
/**
 * Additional CSS class names
 */
className?: string;

/**
 * Inline styles
 */
style?: React.CSSProperties;
```

## Type Export Pattern

Each contract file exports:

1. **Primary interface**: Component props (e.g., `DataGridProps`)
2. **Supporting types**: Config objects, event types, enums
3. **Re-exports**: Commonly used third-party types (AG Grid, React)

```typescript
// Component props
export interface DataGridProps { ... }

// Supporting types
export interface GridThemeConfig { ... }
export interface ColumnState { ... }

// Re-exports for convenience
export type {
  ColDef,
  GridApi
} from 'ag-grid-community';
```

## Validation

### Runtime Validation (Optional)

For public APIs, consider Zod schemas:

```typescript
import { z } from 'zod';

const DataGridPropsSchema = z.object({
  rowData: z.array(z.any()),
  columnDefs: z.array(z.any()),
  gridId: z.string().optional(),
  // ... rest of schema
});

// Use in component
export function DataGrid(props: DataGridProps) {
  const validated = DataGridPropsSchema.parse(props);
  // ...
}
```

### Compile-Time Type Checking

TypeScript strict mode ensures contract compliance:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

## Testing with Contracts

Use contracts to create type-safe mocks:

```typescript
import { DataGridProps } from '../contracts/DataGrid.interface';

const mockProps: DataGridProps<TestData> = {
  rowData: [{ id: 1, name: 'Test' }],
  columnDefs: [{ field: 'name' }],
  onRowClicked: jest.fn()
};

render(<DataGrid {...mockProps} />);
```

## Next Steps

1. ✅ Contracts defined (this directory)
2. 📝 Generate quickstart.md with usage examples
3. 🔨 Implement components satisfying contracts
4. ✅ Verify TypeScript compliance during build
5. 🧪 Write tests using contract types
