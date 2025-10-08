# Architecture Guide - For New Developers

A comprehensive technical guide explaining how this application works, designed for developers new to Clerk, Supabase, and Next.js 15.

---

## Table of Contents

1. [Overview](#overview)
2. [How Clerk B2B Organizations Work](#how-clerk-b2b-organizations-work)
3. [How Supabase Row Level Security Works](#how-supabase-row-level-security-works)
4. [How Clerk + Supabase Integration Works](#how-clerk--supabase-integration-works)
5. [Mock Data Explained](#mock-data-explained)
6. [Complete Data Flow Examples](#complete-data-flow-examples)
7. [Key Files Explained](#key-files-explained)
8. [Common Patterns](#common-patterns)

---

## Overview

This application demonstrates **multi-tenant B2B SaaS architecture**, where:
- Multiple organizations can use the same application
- Each organization's data is completely isolated from others
- Users can belong to multiple organizations
- Authentication and authorization are handled securely

**The Three Pillars:**

1. **Clerk** - Handles user authentication and organization management
2. **Supabase** - Stores data and enforces access control at the database level
3. **Next.js 15** - Connects everything together with Server Components and Server Actions

---

## How Clerk B2B Organizations Work

### What is Clerk?

Clerk is an authentication service that handles all the complex parts of user management for you. Think of it as a pre-built auth system that you just plug into your app.

### What are Organizations?

In B2B (business-to-business) applications, you don't just have individual users - you have **companies** (organizations) with multiple employees (members).

**Example:**
- Company A (org_123) has 3 employees: Alice, Bob, Charlie
- Company B (org_456) has 2 employees: David, Emma
- Alice should ONLY see Company A's invoices
- David should ONLY see Company B's invoices

### How Clerk Provides This

When a user signs up, Clerk:
1. Creates a user account
2. Creates an organization (or adds them to an existing one)
3. Links the user to that organization
4. Gives you an `orgId` and `userId` you can use

**In our code:**

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/",
]);

export default clerkMiddleware(async (auth, request) => {
  // If the route is not public, require authentication
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});
```

**What this does:**
- Runs on EVERY request to your app
- Checks if the user is signed in
- If not signed in and trying to access `/dashboard`, redirects to sign-in
- If signed in, allows the request to continue

**Getting the current user's org:**

```typescript
// lib/supabase/clerk-server.ts
import { auth } from '@clerk/nextjs/server';

export async function createClerkSupabaseClient() {
  const { orgId, userId } = await auth();
  // orgId = "org_2xxx" (the current organization)
  // userId = "user_2yyy" (the current user)

  return { supabase, orgId, userId };
}
```

### Clerk Components

Clerk provides pre-built React components:

- **`<SignIn />`** - Full sign-in UI
- **`<SignUp />`** - Full sign-up UI with org creation
- **`<UserButton />`** - User profile dropdown
- **`<OrganizationSwitcher />`** - Switch between orgs

These components handle:
- Form validation
- Error messages
- Loading states
- Dark mode
- Mobile responsiveness
- Security (CSRF protection, etc.)

You just drop them in:

```typescript
// app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp />
    </div>
  );
}
```

That's it! You get a full sign-up flow with organization creation.

---

## How Supabase Row Level Security Works

### What is Supabase?

Supabase is a backend-as-a-service built on PostgreSQL. It gives you:
- A PostgreSQL database
- Automatic REST API
- Real-time subscriptions
- Authentication (we're using Clerk instead)
- Storage for files

### What is Row Level Security (RLS)?

RLS is a PostgreSQL feature that enforces access control **at the database level**, not in your application code.

**Without RLS:**
```typescript
// ❌ Application handles filtering
const invoices = await supabase
  .from('invoices')
  .select('*');
// Returns ALL invoices from ALL organizations
// You have to manually filter: .eq('org_id', orgId)
```

**With RLS:**
```typescript
// ✅ Database automatically filters
const invoices = await supabase
  .from('invoices')
  .select('*');
// Returns ONLY invoices for the current org
// Even if you forget to filter, the database protects you
```

### Our RLS Policies

Located in `supabase-schema.sql`:

```sql
-- Policy: Users can only see invoices from their organization
CREATE POLICY "Users can view invoices from their organization"
  ON invoices
  FOR SELECT
  USING (org_id = current_setting('app.current_org_id', true));
```

**Breaking this down:**

1. **`CREATE POLICY`** - Creates a new access rule
2. **`ON invoices`** - Applies to the invoices table
3. **`FOR SELECT`** - Only for reading data (viewing)
4. **`USING (...)`** - The condition that must be true

**The condition:**
```sql
org_id = current_setting('app.current_org_id', true)
```

This means:
- `org_id` - The organization ID stored in the invoice row
- `current_setting('app.current_org_id')` - A variable we set on each request
- Only return rows where these match

### How We Set the Org Context

**In our server actions:**

```typescript
// app/actions/invoices.ts
export async function getInvoices() {
  const { supabase, orgId } = await createClerkSupabaseClient();

  // Tell Supabase which org this request is for
  await supabase.rpc('set_config', {
    setting: 'app.current_org_id',
    value: orgId,
  });

  // Now this query is automatically filtered by RLS
  const { data } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false });

  return data;
}
```

**What happens:**

1. User makes request from browser
2. Clerk middleware authenticates and gets orgId
3. We set the org context in Supabase
4. RLS policies automatically filter the query
5. User only receives their org's data

### Why This Is Secure

Even if someone:
- Bypasses your frontend
- Calls your API directly
- Modifies the request
- Finds a SQL injection vulnerability

**The database STILL enforces the RLS policy.** They can only access data for their organization.

---

## How Clerk + Supabase Integration Works

The magic happens in `lib/supabase/clerk-server.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

export async function createClerkSupabaseClient() {
  // Step 1: Get current user and org from Clerk
  const { orgId, userId } = await auth();

  // Step 2: Create Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
  );

  // Step 3: Return both together
  return {
    supabase,
    orgId: orgId || 'demo_org_1',  // Fallback for demo
    userId: userId || 'demo_user',
  };
}
```

**Every server action uses this:**

```typescript
// app/actions/invoices.ts
'use server';

export async function createInvoice(input: CreateInvoiceInput) {
  // Get authenticated Supabase client + org context
  const { supabase, orgId, userId } = await createClerkSupabaseClient();

  // Automatically include org and user IDs
  const invoiceData = {
    ...input,
    org_id: orgId,    // Links invoice to organization
    user_id: userId,  // Tracks who created it
  };

  const { data, error } = await supabase
    .from('invoices')
    .insert(invoiceData)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  // Tell Next.js to refresh the dashboard page
  revalidatePath('/dashboard');

  return { success: true, data };
}
```

**The flow:**

```
User clicks "Create Invoice"
    ↓
Client component calls server action
    ↓
Server action calls createClerkSupabaseClient()
    ↓
Gets orgId from Clerk (e.g., "org_2xxx")
    ↓
Includes org_id in the database insert
    ↓
RLS policy verifies the insert is valid
    ↓
Invoice created ✅
    ↓
revalidatePath() refreshes the UI
```

---

## Mock Data Explained

Located in `supabase-schema.sql`, we insert 12 test invoices:

```sql
INSERT INTO invoices (invoice_number, customer_name, customer_email, amount, status, due_date, issue_date, items, payment_method, notes, org_id, user_id)
VALUES
  -- 10 invoices for demo_org_1
  ('INV-001', 'Acme Corporation', 'billing@acme.com', 2450.00, 'paid', '2024-02-15', '2024-01-15', '[{"name":"Website Design","quantity":1,"price":1500},{"name":"Logo Design","quantity":1,"price":950}]', 'credit_card', 'Initial project payment', 'demo_org_1', 'demo_user'),

  -- 2 invoices for demo_org_2
  ('INV-201', 'Beta Industries', 'finance@beta.com', 1200.00, 'paid', '2024-02-10', '2024-01-10', '[{"name":"Consulting Services","quantity":4,"price":300}]', 'bank_transfer', NULL, 'demo_org_2', 'demo_user_2'),
  -- ... more invoices
```

### Understanding the Mock Data

**Organization Separation:**
- **demo_org_1** - Has 10 invoices (INV-001 through INV-010)
- **demo_org_2** - Has 2 invoices (INV-201 and INV-202)

**Testing Multi-Tenancy:**

1. Sign up as User A, create "Company A"
2. The org will have an `orgId` like `org_2xxx`
3. You'll see invoices for `demo_org_1` (10 invoices)
4. Sign out

5. Sign up as User B, create "Company B"
6. The org will have a different `orgId` like `org_2yyy`
7. You'll see invoices for `demo_org_2` (2 invoices)

This demonstrates that **data is isolated** between organizations.

**Invoice Fields Explained:**

```typescript
{
  invoice_number: 'INV-001',           // Unique identifier
  customer_name: 'Acme Corporation',   // Who we're billing
  customer_email: 'billing@acme.com',  // For sending invoice
  amount: 2450.00,                     // Total amount in dollars
  status: 'paid',                      // paid | pending | overdue | cancelled
  due_date: '2024-02-15',             // When payment is due
  issue_date: '2024-01-15',           // When invoice was created
  items: [                            // Line items (JSON)
    {
      name: 'Website Design',
      quantity: 1,
      price: 1500
    },
    {
      name: 'Logo Design',
      quantity: 1,
      price: 950
    }
  ],
  payment_method: 'credit_card',      // How they paid
  notes: 'Initial project payment',   // Additional info
  org_id: 'demo_org_1',              // Which organization owns this
  user_id: 'demo_user'               // Who created it
}
```

### Changing Mock Data

To add your own test invoices:

1. Open `supabase-schema.sql`
2. Add to the INSERT statement:

```sql
INSERT INTO invoices (...) VALUES
  -- Your new invoice
  ('INV-011', 'Your Company', 'test@company.com', 5000.00, 'pending', '2024-03-01', '2024-02-01', '[{"name":"Custom Service","quantity":1,"price":5000}]', 'bank_transfer', 'Test invoice', 'demo_org_1', 'demo_user'),
```

3. In Supabase SQL Editor, run:

```sql
DELETE FROM invoices WHERE org_id IN ('demo_org_1', 'demo_org_2');
```

4. Then re-run the entire INSERT statement with your new data

---

## Complete Data Flow Examples

### Example 1: User Signs Up

**Step-by-step:**

1. **User visits `/sign-up`**
   - Renders `app/sign-up/[[...sign-up]]/page.tsx`
   - Shows Clerk's `<SignUp />` component

2. **User fills out form**
   - Email: alice@company.com
   - Password: securePassword123
   - Organization name: "Company A"

3. **Clerk creates:**
   - User account with ID: `user_2abc123`
   - Organization with ID: `org_2xyz789`
   - Links user to organization

4. **Clerk redirects to `/dashboard`**

5. **Middleware runs:**
   - `middleware.ts` checks authentication
   - User is authenticated ✅
   - Request continues to dashboard

6. **Dashboard loads:**
   - `app/dashboard/page.tsx` is a Server Component
   - Calls `getInvoices()` server action
   - Gets orgId from Clerk: `org_2xyz789`
   - Queries Supabase with RLS filtering
   - Returns invoices (probably empty for new org)

### Example 2: Creating an Invoice

**User Flow:**

1. **User clicks "New Invoice" button**
   - Opens dialog from `components/invoices/invoice-dialog.tsx`

2. **User fills out form:**
   ```typescript
   {
     customer_name: "New Client Inc",
     customer_email: "billing@newclient.com",
     amount: 5000,
     status: "pending",
     due_date: "2024-03-15",
     issue_date: "2024-02-15",
     items: [
       { name: "Consulting", quantity: 10, price: 500 }
     ],
     payment_method: "bank_transfer",
     notes: "Q1 services"
   }
   ```

3. **User clicks "Create Invoice"**

4. **Client component calls server action:**
   ```typescript
   await createInvoice(formData);
   ```

5. **Server action runs:**
   ```typescript
   // app/actions/invoices.ts
   export async function createInvoice(input) {
     // Get current org from Clerk
     const { supabase, orgId, userId } = await createClerkSupabaseClient();
     // orgId = "org_2xyz789"
     // userId = "user_2abc123"

     // Generate next invoice number
     const { data: lastInvoice } = await supabase
       .from('invoices')
       .select('invoice_number')
       .order('created_at', { ascending: false })
       .limit(1);

     const nextNumber = generateInvoiceNumber(lastInvoice);
     // Result: "INV-001"

     // Create invoice with org context
     const invoiceData = {
       ...input,
       invoice_number: nextNumber,
       org_id: orgId,      // "org_2xyz789"
       user_id: userId,    // "user_2abc123"
     };

     const { data, error } = await supabase
       .from('invoices')
       .insert(invoiceData)
       .select()
       .single();

     // Refresh the UI
     revalidatePath('/dashboard');

     return { success: true, data };
   }
   ```

6. **Database level (RLS):**
   - Receives INSERT request
   - Checks RLS policy for INSERT
   ```sql
   CREATE POLICY "Users can create invoices for their organization"
     ON invoices
     FOR INSERT
     WITH CHECK (org_id = current_setting('app.current_org_id', true));
   ```
   - Verifies: Does `invoiceData.org_id` match the authenticated org?
   - If yes ✅ - Insert succeeds
   - If no ❌ - Insert fails with permission error

7. **UI updates:**
   - `revalidatePath('/dashboard')` tells Next.js to refresh
   - Dashboard re-renders with new invoice
   - User sees the invoice immediately

### Example 3: Viewing Invoices from Different Organizations

**Scenario:** Alice (Company A) and David (Company B) both use the app.

**Alice's view:**

1. Alice visits `/dashboard`
2. Server calls `getInvoices()`
3. Clerk returns `orgId = "org_2alice"`
4. Supabase RLS filters: `WHERE org_id = 'org_2alice'`
5. Returns only Company A's invoices
6. Alice sees: INV-001, INV-002, INV-003

**David's view:**

1. David visits `/dashboard`
2. Server calls `getInvoices()`
3. Clerk returns `orgId = "org_2david"`
4. Supabase RLS filters: `WHERE org_id = 'org_2david'`
5. Returns only Company B's invoices
6. David sees: INV-101, INV-102

**Important:** Even though both are querying the same table with the same code, they see different data because of RLS.

---

## Key Files Explained

### `middleware.ts`

**Purpose:** Runs on every request before any page loads.

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define which routes are public (no login required)
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/",
]);

export default clerkMiddleware(async (auth, request) => {
  // If route is NOT public, require authentication
  if (!isPublicRoute(request)) {
    await auth.protect();  // Redirects to sign-in if not authenticated
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

**What it does:**
- ✅ Allows anyone to visit `/`, `/sign-in`, `/sign-up`
- ❌ Blocks unauthenticated users from `/dashboard`
- ↪️ Redirects to `/sign-in` if blocked

### `lib/supabase/clerk-server.ts`

**Purpose:** Bridge between Clerk (auth) and Supabase (database).

```typescript
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

export async function createClerkSupabaseClient() {
  // Get current user from Clerk
  const { orgId, userId } = await auth();

  // Create Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
  );

  // Return both together
  return {
    supabase,
    orgId: orgId || 'demo_org_1',
    userId: userId || 'demo_user',
  };
}
```

**Why this file exists:**
- Every server action needs both Clerk auth context AND Supabase access
- Rather than repeat this code everywhere, we centralize it here
- Makes it easy to add logging, error handling, etc. in one place

### `app/actions/invoices.ts`

**Purpose:** All database operations for invoices.

**Pattern used:** Server Actions (Next.js 15 feature)

```typescript
'use server';  // ← This makes all exports Server Actions

export async function getInvoices() {
  // 1. Get authenticated context
  const { supabase, orgId } = await createClerkSupabaseClient();

  // 2. Query database (RLS automatically filters)
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false });

  // 3. Handle errors
  if (error) throw new Error(error.message);

  // 4. Return data
  return data;
}
```

**Why Server Actions?**
- ✅ No need to create API routes
- ✅ Type-safe (TypeScript works automatically)
- ✅ Can be called directly from components
- ✅ Automatically handle serialization
- ✅ Security built-in (never exposed to client)

### `components/invoices/invoice-table.tsx`

**Purpose:** Display invoices with search, filtering, and actions.

**Key features:**

```typescript
'use client';  // ← Client component for interactivity

export function InvoiceTable({ initialInvoices }: { initialInvoices: Invoice[] }) {
  // Local state for client-side filtering
  const [invoices, setInvoices] = useState(initialInvoices);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Client-side search/filter
  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      // Search by invoice number, customer name, or email
      const matchesSearch =
        invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.customer_email?.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by status
      const matchesStatus =
        statusFilter === 'all' ||
        invoice.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, statusFilter]);

  // Delete with optimistic update
  const handleDelete = async (id: string) => {
    // Immediately remove from UI
    setInvoices(prev => prev.filter(i => i.id !== id));

    // Call server action
    const result = await deleteInvoice(id);

    // If failed, refresh to restore
    if (!result.success) {
      router.refresh();
      toast.error('Failed to delete invoice');
    }
  };

  return (
    <div>
      {/* Search bar */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search invoices..."
      />

      {/* Status filter */}
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="all">All</option>
        <option value="paid">Paid</option>
        <option value="pending">Pending</option>
        <option value="overdue">Overdue</option>
      </select>

      {/* Table */}
      <table>
        {filteredInvoices.map(invoice => (
          <tr key={invoice.id}>
            <td>{invoice.invoice_number}</td>
            <td>{invoice.customer_name}</td>
            <td>${invoice.amount}</td>
            <td><StatusBadge status={invoice.status} /></td>
            <td>
              <button onClick={() => handleEdit(invoice)}>Edit</button>
              <button onClick={() => handleDelete(invoice.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </table>
    </div>
  );
}
```

**Why this pattern?**
- Server Component fetches data (secure, fast)
- Passes data to Client Component as props
- Client Component handles interactivity (search, filter, delete)
- Best of both worlds!

### `components/invoices/invoice-dialog.tsx`

**Purpose:** Modal for creating/editing invoices.

**Key features:**

```typescript
'use client';

export function InvoiceDialog({ invoice, open, onOpenChange }: Props) {
  const [formData, setFormData] = useState({
    customer_name: invoice?.customer_name || '',
    customer_email: invoice?.customer_email || '',
    amount: invoice?.amount || 0,
    status: invoice?.status || 'pending',
    due_date: invoice?.due_date || '',
    issue_date: invoice?.issue_date || '',
    items: invoice?.items || [{ name: '', quantity: 1, price: 0 }],
    payment_method: invoice?.payment_method || 'credit_card',
    notes: invoice?.notes || '',
  });

  // Add line item
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 1, price: 0 }],
    }));
  };

  // Auto-calculate total
  const total = useMemo(() => {
    return formData.items.reduce((sum, item) => {
      return sum + (item.quantity * item.price);
    }, 0);
  }, [formData.items]);

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Set the calculated total
    const dataToSubmit = { ...formData, amount: total };

    // Call appropriate server action
    if (invoice) {
      await updateInvoice(invoice.id, dataToSubmit);
    } else {
      await createInvoice(dataToSubmit);
    }

    // Close dialog
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
        <input
          type="text"
          value={formData.customer_name}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            customer_name: e.target.value
          }))}
          placeholder="Customer Name"
        />

        {/* Line items */}
        {formData.items.map((item, index) => (
          <div key={index}>
            <input
              type="text"
              value={item.name}
              onChange={(e) => updateItem(index, 'name', e.target.value)}
              placeholder="Item name"
            />
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
            />
            <input
              type="number"
              value={item.price}
              onChange={(e) => updateItem(index, 'price', Number(e.target.value))}
            />
          </div>
        ))}

        <button type="button" onClick={addItem}>Add Item</button>

        {/* Auto-calculated total */}
        <div>Total: ${total.toFixed(2)}</div>

        <button type="submit">
          {invoice ? 'Update' : 'Create'} Invoice
        </button>
      </form>
    </Dialog>
  );
}
```

---

## Common Patterns

### Pattern 1: Server Component + Client Component

**Server Component (fetches data):**

```typescript
// app/dashboard/page.tsx
import { getInvoices } from '@/app/actions/invoices';
import { InvoiceTable } from '@/components/invoices/invoice-table';

export default async function DashboardPage() {
  // This runs on the server
  const invoices = await getInvoices();

  // Pass data to client component
  return (
    <div>
      <h1>Dashboard</h1>
      <InvoiceTable initialInvoices={invoices} />
    </div>
  );
}
```

**Client Component (handles interactivity):**

```typescript
// components/invoices/invoice-table.tsx
'use client';

export function InvoiceTable({ initialInvoices }: { initialInvoices: Invoice[] }) {
  // This runs on the client
  const [invoices, setInvoices] = useState(initialInvoices);

  return (
    <table>
      {/* Interactive UI */}
    </table>
  );
}
```

**Why split them?**
- Server Components are faster (no JavaScript sent to browser)
- Client Components enable interactivity
- Best performance: Fetch on server, interact on client

### Pattern 2: Optimistic Updates

**Before:**
```typescript
const handleDelete = async (id: string) => {
  const result = await deleteInvoice(id);
  if (result.success) {
    router.refresh();  // Wait for server, then update UI
  }
};
```

**After (Optimistic):**
```typescript
const handleDelete = async (id: string) => {
  // Update UI immediately
  setInvoices(prev => prev.filter(i => i.id !== id));

  // Then update server
  const result = await deleteInvoice(id);

  // If failed, rollback
  if (!result.success) {
    router.refresh();
  }
};
```

**Why?**
- UI feels instant
- Better user experience
- Works well for likely-to-succeed operations

### Pattern 3: Server Actions with Revalidation

```typescript
'use server';

export async function createInvoice(input: CreateInvoiceInput) {
  const { supabase, orgId, userId } = await createClerkSupabaseClient();

  const { data, error } = await supabase
    .from('invoices')
    .insert({ ...input, org_id: orgId, user_id: userId })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  // Tell Next.js to refresh this page
  revalidatePath('/dashboard');

  return { success: true, data };
}
```

**What is `revalidatePath`?**
- Next.js caches Server Components for performance
- When data changes, we need to invalidate the cache
- `revalidatePath('/dashboard')` tells Next.js: "Re-fetch data for /dashboard"
- Next time someone visits, they get fresh data

### Pattern 4: Type-Safe Forms

```typescript
// Define types
interface CreateInvoiceInput {
  customer_name: string;
  customer_email?: string;
  amount: number;
  status: InvoiceStatus;
  due_date: string;
  issue_date: string;
  items: InvoiceItem[];
  payment_method?: PaymentMethod;
  notes?: string;
}

// Server action with typed input
export async function createInvoice(input: CreateInvoiceInput) {
  // TypeScript ensures input has correct shape
  const { supabase, orgId, userId } = await createClerkSupabaseClient();

  const invoiceData: Omit<Invoice, 'id' | 'created_at' | 'updated_at'> = {
    ...input,
    invoice_number: await generateInvoiceNumber(supabase, orgId),
    org_id: orgId,
    user_id: userId,
  };

  // TypeScript verifies invoiceData matches database schema
  const { data, error } = await supabase
    .from('invoices')
    .insert(invoiceData)
    .select()
    .single();

  return { success: true, data };
}
```

**Benefits:**
- Catch errors at compile time, not runtime
- Auto-complete in your editor
- Refactoring is safe (TypeScript finds all usages)

---

## Summary

**Three Core Concepts:**

1. **Clerk Organizations** - Handles authentication and gives you `orgId` + `userId`
2. **Supabase RLS** - Database enforces data isolation using `orgId`
3. **Next.js Server Actions** - Connect Clerk + Supabase securely on the server

**The Magic Formula:**

```typescript
// Every server action follows this pattern:

'use server';

export async function doSomething(input: Input) {
  // 1. Get auth context
  const { supabase, orgId, userId } = await createClerkSupabaseClient();

  // 2. Do database operation (RLS automatically filters)
  const { data, error } = await supabase
    .from('table')
    .insert({ ...input, org_id: orgId, user_id: userId });

  // 3. Handle errors
  if (error) return { success: false, error: error.message };

  // 4. Revalidate cache
  revalidatePath('/some-page');

  // 5. Return result
  return { success: true, data };
}
```

**That's it!** This pattern gives you secure, multi-tenant applications with minimal code.

---

## Next Steps for Learning

1. **Try modifying mock data** - Add your own test invoices in `supabase-schema.sql`
2. **Add a new field** - Add "invoice_terms" field to invoices table and UI
3. **Create a new entity** - Build a "Customers" table with similar RLS policies
4. **Add real-time updates** - Use Supabase subscriptions to see changes live
5. **Deploy** - Deploy to Vercel and see it in production

You now understand how modern B2B SaaS applications work! 🎉
