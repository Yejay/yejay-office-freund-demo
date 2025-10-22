# Architecture Guide

Technical overview of the multi-tenant B2B SaaS architecture using Clerk, Supabase, and Next.js 15.

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Authentication Flow](#authentication-flow)
3. [Data Isolation](#data-isolation)
4. [Key Patterns](#key-patterns)
5. [Component Architecture](#component-architecture)
6. [Advanced Features](#advanced-features)

---

## Core Concepts

### The Three Pillars

1. **Clerk Organizations** - Handles user authentication and provides organization context (`orgId`)
2. **Supabase RLS** - Enforces data isolation at the database level (currently permissive, application-layer filtering)
3. **Next.js Server Actions** - Connects Clerk auth with Supabase queries securely on the server

### Multi-Tenancy Model

```
Company A (org_2abc) ─┐
├─ User Alice         │
├─ User Bob           │
└─ Invoices: INV-001, INV-002, ...

Company B (org_2xyz) ─┐
├─ User David         │
├─ User Emma          │
└─ Invoices: INV-101, INV-102, ...
```

**Key Principle**: Every database record MUST have `org_id` to ensure data isolation.

---

## Authentication Flow

### Clerk Middleware

`middleware.ts` runs on every request:

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/"]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect(); // Redirects to sign-in if not authenticated
  }
});
```

**What it does:**
- ✅ Public routes: `/`, `/sign-in`, `/sign-up`
- 🔒 Protected routes: `/dashboard`, `/billing`
- ↪️ Redirects unauthenticated users to `/sign-in`

### Getting Current Organization

```typescript
// lib/supabase/clerk-server.ts
import { auth } from '@clerk/nextjs/server';

export async function createClerkSupabaseClient() {
  const { orgId, userId } = await auth();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
  );

  return { supabase, orgId: orgId || 'demo_org_1', userId: userId || 'demo_user' };
}
```

**Every server action uses this pattern** to get authenticated context.

---

## Data Isolation

### Row Level Security (RLS)

Supabase RLS enforces access control at the database level:

```sql
-- Policy: Users can only see invoices from their organization
CREATE POLICY "Users can view invoices from their organization"
  ON invoices
  FOR SELECT
  USING (org_id = current_setting('app.current_org_id', true));
```

### Application-Layer Filtering

**Current implementation** uses application-layer filtering:

```typescript
// app/actions/invoices.ts
export async function getInvoices() {
  const { supabase, orgId } = await createClerkSupabaseClient();

  // Query automatically filters by org_id in application code
  const { data } = await supabase
    .from('invoices')
    .select('*')
    .eq('org_id', orgId) // Filter by current organization
    .order('created_at', { ascending: false });

  return data;
}
```

**Security Model:**
- RLS is enabled but policies are currently permissive
- Application code handles filtering by `org_id`
- For production: tighten RLS policies to validate `org_id` against Clerk JWT

---

## Key Patterns

### Pattern 1: Server Action with Org Context

```typescript
'use server';

export async function createInvoice(input: CreateInvoiceInput) {
  // 1. Get auth context
  const { supabase, orgId, userId } = await createClerkSupabaseClient();

  // 2. Validate with Zod
  const validation = validateCreateInvoice(input);
  if (!validation.success) {
    return { success: false, error: 'Invalid data' };
  }

  // 3. Include org_id and user_id
  const invoiceData = {
    ...validation.data,
    invoice_number: await generateInvoiceNumber(supabase, orgId),
    org_id: orgId,
    user_id: userId,
  };

  // 4. Insert into database
  const { data, error } = await supabase
    .from('invoices')
    .insert(invoiceData)
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  // 5. Revalidate cache
  revalidatePath('/dashboard');

  return { success: true, data };
}
```

**This pattern is used for all CRUD operations.**

### Pattern 2: Server Component + Client Component

**Server Component** (fetches data):
```typescript
// app/dashboard/page.tsx
export default async function Dashboard() {
  const invoices = await getInvoices(); // Server action
  return <InvoiceTable initialInvoices={invoices} />;
}
```

**Client Component** (handles interactivity):
```typescript
// components/invoices/invoice-table.tsx
'use client';

export function InvoiceTable({ initialInvoices }: Props) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [searchQuery, setSearchQuery] = useState('');

  // Client-side search and interactivity
  const filtered = invoices.filter(inv =>
    inv.invoice_number.includes(searchQuery)
  );

  return <div>{/* Interactive table */}</div>;
}
```

### Pattern 3: Optimistic UI Updates

```typescript
const handleDelete = async (id: string) => {
  // Update UI immediately
  setInvoices(prev => prev.filter(i => i.id !== id));

  // Call server
  const result = await deleteInvoice(id);

  // Rollback on failure
  if (!result.success) {
    router.refresh();
  }
};
```

### Pattern 4: Zod Runtime Validation

```typescript
// lib/schemas/invoice.schema.ts
export const CreateInvoiceSchema = z.object({
  customer_name: z.string().min(1, 'Customer name is required'),
  amount: z.number().nonnegative().min(0.01),
  status: z.enum(['paid', 'pending', 'overdue', 'cancelled']),
  items: z.array(InvoiceItemSchema).min(1),
}).refine((data) => {
  return new Date(data.due_date) >= new Date(data.issue_date);
}, {
  message: 'Due date must be on or after issue date',
  path: ['due_date'],
});

// Type inference from schema
export type Invoice = z.infer<typeof InvoiceSchema>;
```

**Used in both client and server** for consistent validation.

---

## Component Architecture

### Core Files

| File | Purpose |
|------|---------|
| `middleware.ts` | Clerk authentication guard |
| `lib/supabase/clerk-server.ts` | Bridge between Clerk and Supabase |
| `app/actions/invoices.ts` | All invoice CRUD operations |
| `components/invoices/invoice-table-ag-grid.tsx` | AG Grid table component |
| `components/invoices/invoice-dialog.tsx` | Create/edit invoice modal |
| `components/command-palette.tsx` | Keyboard command interface |

### Data Flow

```
1. User Request
   ↓
2. middleware.ts (Clerk authenticates)
   ↓
3. Server Component (app/dashboard/page.tsx)
   ↓
4. Server Action (app/actions/invoices.ts)
   ↓
5. createClerkSupabaseClient() (gets orgId)
   ↓
6. Supabase Query (filtered by org_id)
   ↓
7. Return Data → Client Component
   ↓
8. Revalidate Cache (after mutations)
```

### Preline UI Integration

The app uses Preline's HTML + Tailwind patterns directly:

**Modals (HSOverlay):**
```tsx
// Programmatic control
useEffect(() => {
  if (typeof window !== 'undefined' && window.HSOverlay) {
    if (open) {
      window.HSOverlay.open('#invoice-dialog-modal');
    } else {
      window.HSOverlay.close('#invoice-dialog-modal');
    }
  }
}, [open]);
```

**Dropdowns:**
```tsx
<div className="hs-dropdown relative inline-flex">
  <button className="hs-dropdown-toggle ...">
    <MoreHorizontal className="h-4 w-4" />
  </button>
  <div className="hs-dropdown-menu transition-[opacity,margin] ...">
    {/* Dropdown items */}
  </div>
</div>
```

See `components/command-palette.tsx` and `components/invoices/invoice-dialog.tsx` for complete examples.

---

## Advanced Features

### 1. AG Grid Integration

Professional data grid with sorting, filtering, pagination, and CSV export:

```typescript
import { AgGridReact } from 'ag-grid-react';
import { useTheme } from 'next-themes';

export function InvoiceTableAgGrid({ invoices, onEdit }: Props) {
  const { theme } = useTheme();
  const gridRef = useRef<AgGridReact>(null);

  const columnDefs = useMemo<ColDef[]>(() => [
    {
      field: 'invoice_number',
      headerName: 'Invoice',
      sortable: true,
      filter: true,
      pinned: 'left',
    },
    {
      field: 'amount',
      cellRenderer: (props) => formatCurrency(props.value),
    },
    // ... more columns
  ], []);

  return (
    <div className={theme === 'dark' ? 'ag-theme-quartz-dark' : 'ag-theme-quartz'}>
      <AgGridReact
        ref={gridRef}
        rowData={invoices}
        columnDefs={columnDefs}
        pagination={true}
        paginationPageSize={20}
      />
    </div>
  );
}
```

**Key features:**
- Dynamic dark mode with `useTheme()`
- Custom cell renderers for status badges and currency
- CSV export: `gridRef.current?.api.exportDataAsCsv()`
- Custom Preline theme: `app/ag-grid-preline-theme.css`

### 2. Command Palette

Keyboard-driven interface powered by Fuse.js:

```typescript
// lib/commands/registry.ts
export const commandRegistry: CommandRegistry = [
  {
    id: 'new-invoice',
    label: 'New Invoice',
    description: 'Create a new invoice',
    icon: Plus,
    keywords: ['new', 'create', 'invoice', 'add'],
    group: 'actions',
    shortcut: '⌘N',
  },
  // ... more commands
];
```

**Features:**
- Global keyboard shortcut: `cmd+k` (Mac) / `ctrl+k` (Windows)
- Fuzzy search with Fuse.js
- Keyboard navigation (↑↓ to navigate, Enter to execute)
- Grouped commands (actions, navigation, settings)

### 3. Subscription Billing

Usage tracking and plan limits:

```typescript
// lib/billing/subscription-limits.ts
export const PLANS = {
  free: { id: 'free', invoiceLimit: 10 },
  pro: { id: 'pro', invoiceLimit: 100 },
  enterprise: { id: 'enterprise', invoiceLimit: Infinity },
};

// Enforce limits before invoice creation
export async function canCreateInvoice(invoices: Invoice[], orgId: string) {
  const monthlyCount = await getMonthlyInvoiceCount(invoices);
  const plan = await getCurrentPlan(orgId);
  const limit = PLANS[plan].invoiceLimit;

  return {
    allowed: monthlyCount < limit,
    planName: plan,
    usage: monthlyCount,
    limit,
  };
}
```

Checked in `app/actions/invoices.ts` before creating invoices.

### 4. Dark Mode

Uses `next-themes` for theme management:

```tsx
// app/layout.tsx
import { ThemeProvider } from 'next-themes';

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Components use:**
```tsx
import { useTheme } from 'next-themes';

const { theme, setTheme } = useTheme();
// theme === 'dark' | 'light' | 'system'
```

For third-party components like AG Grid, use dynamic class switching (see AG Grid section).

---

## Database Schema

### Invoices Table

```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  invoice_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('paid', 'pending', 'overdue', 'cancelled')),
  due_date DATE NOT NULL,
  issue_date DATE NOT NULL,
  items JSONB NOT NULL,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (org_id, invoice_number)
);

-- Indexes for performance
CREATE INDEX idx_invoices_org_id ON invoices(org_id);
CREATE INDEX idx_invoices_status ON invoices(status);
```

### Mock Data

`supabase-schema.sql` includes 12 test invoices:
- 10 invoices for `demo_org_1`
- 2 invoices for `demo_org_2`

This demonstrates data isolation between organizations.

---

## Common Development Tasks

### Adding a New Server Action

```typescript
'use server';

export async function myAction(input: MyInput) {
  const { supabase, orgId, userId } = await createClerkSupabaseClient();

  // Validate
  const validation = MySchema.safeParse(input);
  if (!validation.success) return { success: false, error: 'Invalid' };

  // Database operation
  const { data, error } = await supabase
    .from('table')
    .insert({ ...validation.data, org_id: orgId, user_id: userId });

  if (error) return { success: false, error: error.message };

  revalidatePath('/path');
  return { success: true, data };
}
```

### Adding a Command to Command Palette

1. Define in `lib/commands/registry.ts`
2. Handle in `components/command-palette.tsx`'s `executeCommand()` switch statement

### Styling Third-Party Components

1. Create scoped CSS file: `app/[component]-preline-theme.css`
2. Map app's CSS variables to component's theming system
3. Apply Preline's design patterns (typography, spacing, colors)
4. Implement dynamic dark mode switching

See `docs/STYLING.md` for detailed guide.

---

## Production Considerations

### Security Enhancements

1. **Tighten RLS Policies**: Use Clerk JWT claims in Supabase RLS policies
2. **Rate Limiting**: Add rate limiting to server actions
3. **Input Sanitization**: Ensure all user input is validated and sanitized
4. **Error Logging**: Implement proper error tracking (Sentry, etc.)

### Performance Optimizations

1. **Pagination**: Implement server-side pagination for large datasets
2. **Caching**: Use Next.js cache strategies (`unstable_cache`)
3. **Database Indexes**: Ensure proper indexes on frequently queried columns
4. **Image Optimization**: Use Next.js Image component for all images

### Feature Enhancements

1. **PDF Generation**: Generate printable invoices
2. **Email Notifications**: Send invoice emails to customers
3. **Payment Integration**: Connect Stripe/PayPal for payments
4. **Audit Logs**: Track all invoice changes
5. **Bulk Operations**: Support bulk delete, status updates

---

## Summary

**Core Architecture Pattern:**

```typescript
// Every server action follows this:
'use server';

export async function action(input) {
  const { supabase, orgId, userId } = await createClerkSupabaseClient();
  const validation = validate(input);
  const { data, error } = await supabase.from('table').insert({
    ...validation.data,
    org_id: orgId,
    user_id: userId
  });
  revalidatePath('/path');
  return { success: !error, data };
}
```

**Key Principles:**
1. Always use `createClerkSupabaseClient()` for auth context
2. Always include `org_id` and `user_id` in database records
3. Validate with Zod on both client and server
4. Use `revalidatePath()` after mutations
5. Keep Server Components for data fetching, Client Components for interactivity

---

For more details:
- **Styling Guide**: `docs/STYLING.md`
- **Development Guide**: `../CLAUDE.md`
- **Quick Start**: `../README.md`
