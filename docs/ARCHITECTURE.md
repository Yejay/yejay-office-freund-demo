# Architecture Overview

## Stack

- **Next.js 15** - App Router + Server Components
- **Clerk** - Auth + B2B Organizations
- **Supabase** - PostgreSQL database
- **AG Grid** - Data tables
- **Preline** - UI components
- **Tailwind CSS** - Styling

---

## Key Patterns

### Authentication

**File:** `middleware.ts`

```typescript
// Protects all routes except /sign-in, /sign-up, /
export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});
```

### Multi-Tenancy

**File:** `lib/supabase/clerk-server.ts`

```typescript
'use server';

export async function createClerkSupabaseClient() {
  const { userId, orgId } = await auth();
  // Returns Supabase client with org context
  return { supabase, userId, orgId };
}
```

**Usage:**
```typescript
'use server';

export async function myAction() {
  const { supabase, orgId } = await createClerkSupabaseClient();

  // All queries automatically filtered by org_id
  const { data } = await supabase
    .from('table')
    .select()
    .eq('org_id', orgId);
}
```

### Server Components + Client Components

**Server Component** (fetches data):
```typescript
// app/dashboard/page.tsx
export default function Dashboard() {
  return <OrderTable orders={mockOrders} />;
}
```

**Client Component** (interactivity):
```typescript
// components/orders/order-table.tsx
'use client';

export function OrderTable({ orders }) {
  // AG Grid, sorting, filtering, etc.
}
```

---

## File Structure

```
app/
  ├── actions/           # Server actions
  ├── dashboard/         # Dashboard page
  ├── globals.css        # Tailwind + brand colors
  └── ag-grid-officefreund-theme.css

components/
  ├── orders/
  │   └── order-table.tsx  # AG Grid component
  └── preline-init.tsx     # Preline JS initialization

lib/
  ├── types/             # TypeScript types
  ├── data/              # Mock data
  └── supabase/          # Supabase utilities
```

---

## Data Flow

1. **User visits** `/dashboard`
2. **Middleware** checks auth (Clerk)
3. **Page component** loads (server)
4. **Mock data** passed to AG Grid (client component)
5. **AG Grid renders** with OfficeFreund branding

---

## Environment Variables

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Supabase (optional, not used in current implementation)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=
```

---

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Run ESLint
```

---

## Key Files

- `middleware.ts` - Auth guard
- `lib/supabase/clerk-server.ts` - Clerk + Supabase bridge
- `app/globals.css` - Brand colors (Tailwind)
- `app/ag-grid-officefreund-theme.css` - AG Grid styling
- `components/orders/order-table.tsx` - Main data table
