# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **multi-tenant B2B SaaS invoice management application** demonstrating production-ready architecture with:
- **Clerk Organizations** for B2B authentication and org management
- **Supabase** with Row Level Security (RLS) for data isolation
- **Next.js 15** with App Router, Server Components, and Server Actions
- **TypeScript** with runtime validation via Zod
- **AG Grid** for professional data tables
- **Preline UI** with direct HTML + Tailwind patterns (no wrapper components)

## Development Commands

### Running the App
```bash
npm run dev          # Start dev server with Turbopack (port 3000)
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

### Testing Individual Features
The app doesn't have formal tests, but you can test features by:
1. Starting dev server: `npm run dev`
2. Navigate to `/dashboard` to test invoice CRUD operations
3. Press `cmd+k` (Mac) or `ctrl+k` (Windows) to test the command palette
4. Visit `/billing` to test subscription UI

## Visual Development

### Credentials to use during development

- Use the following credentials to login with clerk, during development
- email:jane+clerk_test@example.com
- password: yejaydemirkan

### Design Principles

- Comprehensive design checklist in `/context/design-principles.md`
- Brand style guide in `/context/style-guide.md`
- When making visual (front-end, UI/UX) changes, always refer to these files for guidance

### Quick Visual Check

IMMEDIATELY after implementing any front-end change:

1. **Identify what changed** - Review the modified components/pages
2. **Navigate to affected pages** - Use `mcp_playwright_browser_navigate` to visit each changed view
3. **Verify design compliance** - Compare against `/context/design-principles.md` and `/docs/STYLING.md`
4. **Validate feature implementation** - Ensure the change fulfills the user's specific request
5. **Check acceptance criteria** - Review any provided context files or requirements
6. **Capture evidence** - Take full page screenshot at desktop viewport (1440px) of each changed view
7. **Check for errors** - Run `mcp_playwright_browser_console_messages`

This verification ensures changes meet design standards and user requirements.

### Comprehensive Design Review

Invoke the '@agent-design-review" subagent for thorough design validation when:

- Completing significant UI/UX features
- Before finalizing PRs with visual changes
- Needing comprehensive accessibility and responsiveness testing

### Key Features

- Dashboard for event management
- Content moderation tools
- Export functionality
- Credits system
- Multi-tenant architecture with organization support

## Git Commit Guidelines

Please use Conventional Commits formatting for git commits.

- Please use Conventional Branch naming (prefix-based branch naming convention)
- Please do not mention yourself (Claude) as a co-author when committing, or include any links to Claude Code

## Guidance Memories

- Please ask for clarification upfront, upon the initial prompts, when you need more direction.

## Linting and Code Quality

- Please run "npm run lint' after completing large additions or refactors to ensure adherence to syntactic best practices.

## CLI Tooling Memories

- Please use the gh" CLI tool when appropriate, create issues, open pull requests, read comments, etc.

## Architecture Overview

### Multi-Tenant Data Isolation

**Critical Pattern**: All server actions MUST use `createClerkSupabaseClient()` from `lib/supabase/clerk-server.ts`:

```typescript
'use server';
import { createClerkSupabaseClient } from '@/lib/supabase/clerk-server';

export async function myAction() {
  const { supabase, orgId, userId } = await createClerkSupabaseClient();

  // orgId and userId are automatically from the authenticated user
  // Always include org_id when creating records
  await supabase.from('table').insert({
    ...data,
    org_id: orgId,
    user_id: userId
  });
}
```

**Why this matters**:

- Clerk provides the current organization context via `auth().orgId`
- Every database record MUST have `org_id` to ensure data isolation
- RLS policies (though currently permissive) rely on application-layer filtering
- Queries automatically filter by `org_id` to show only current org's data

### Server Components + Client Components Pattern

**Server Components** (no 'use client'):

- Fetch data using server actions
- Located in `app/*/page.tsx`
- Pass data as props to client components

**Client Components** ('use client'):

- Handle interactivity (forms, modals, search, filtering)
- Located in `components/`
- Receive initial data as props, maintain local state

Example:

```typescript
// app/dashboard/page.tsx (Server Component)
export default async function Dashboard() {
  const invoices = await getInvoices(); // Server action
  return <InvoiceTable initialInvoices={invoices} />; // Client component
}

// components/invoices/invoice-table.tsx (Client Component)
'use client';
export function InvoiceTable({ initialInvoices }: Props) {
  const [invoices, setInvoices] = useState(initialInvoices);
  // Handle client-side interactivity
}
```

### Data Flow

1. **User Authentication**: `middleware.ts` runs on every request, Clerk authenticates user
2. **Authorization**: Protected routes (not in `isPublicRoute`) require authentication
3. **Data Fetching**: Server Components call server actions in `app/actions/invoices.ts`
4. **Org Context**: `createClerkSupabaseClient()` provides `orgId` from Clerk
5. **Database Query**: Supabase queries filter by `org_id` in application code
6. **Revalidation**: After mutations, use `revalidatePath('/path')` to refresh cached data

## Key Files & Their Purpose

### Authentication & Database

- `middleware.ts` - Clerk authentication guard for protected routes
- `lib/supabase/clerk-server.ts` - Bridge between Clerk (auth) and Supabase (data)
- `app/actions/invoices.ts` - All invoice CRUD operations (server actions)

### Type Safety

- `lib/types/invoice.ts` - TypeScript types for invoices
- `lib/schemas/invoice.schema.ts` - Zod schemas for runtime validation
- **Important**: Validate data using Zod before database operations:

  ```typescript
  const validation = validateCreateInvoice(input);
  if (!validation.success) return { error: validation.error };
  ```

### UI Components

- `components/invoices/invoice-table-ag-grid.tsx` - AG Grid table (primary table UI)
- `components/invoices/invoice-dialog.tsx` - Create/edit invoice modal
- `components/command-palette.tsx` - Keyboard-driven command interface (cmd+k)
- `components/preline-init.tsx` - Initializes Preline UI components

### Billing & Subscriptions

- `lib/billing/subscription-limits.ts` - Plan definitions and usage limits
- `app/billing/page.tsx` - Subscription management UI
- **Note**: Clerk Billing is in Beta and requires manual dashboard setup

### Command System

- `lib/commands/registry.ts` - Command palette command definitions
- `lib/commands/types.ts` - TypeScript types for commands
- Uses Fuse.js for fuzzy search

## Environment Variables

Required variables (see `.env.example`):

```bash
# Clerk (from dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase (from app.supabase.com)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=
```

## Database Schema

The `invoices` table is defined in `supabase-schema.sql`:

- Run this SQL in Supabase SQL Editor to set up the database
- Includes mock data for `demo_org_1` (10 invoices) and `demo_org_2` (2 invoices)
- Has indexes on `org_id`, `user_id`, `status`, and `invoice_number`
- RLS is enabled but policies are permissive (application-layer filtering)

Key columns:

- `id` (UUID) - Primary key
- `org_id` (TEXT) - Organization identifier from Clerk
- `user_id` (TEXT) - User identifier from Clerk
- `invoice_number` (TEXT) - Auto-generated, unique per org
- `items` (JSONB) - Array of line items with name, quantity, price
- `status` - Enum: 'paid' | 'pending' | 'overdue' | 'cancelled'

## Common Development Patterns

### Creating a New Server Action

```typescript
'use server';
import { createClerkSupabaseClient } from '@/lib/supabase/clerk-server';
import { revalidatePath } from 'next/cache';

export async function myAction(input: MyInput) {
  // 1. Get auth context
  const { supabase, orgId, userId } = await createClerkSupabaseClient();

  // 2. Validate input with Zod
  const validation = MySchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: 'Validation failed' };
  }

  // 3. Database operation
  const { data, error } = await supabase
    .from('table')
    .insert({ ...validation.data, org_id: orgId, user_id: userId });

  if (error) return { success: false, error: error.message };

  // 4. Revalidate cache
  revalidatePath('/dashboard');

  // 5. Return result
  return { success: true, data };
}
```

### Adding a Command to Command Palette

1. Define in `lib/commands/registry.ts`:

```typescript
{
  id: 'my-command',
  label: 'My Action',
  description: 'Does something useful',
  icon: IconComponent,
  keywords: ['my', 'action', 'search', 'terms'],
  group: 'actions',
  shortcut: '⌘M',
}
```

2. Handle in `components/command-palette.tsx`:

```typescript
case 'my-command':
  // Execute action
  break;
```

### Optimistic UI Updates

```typescript
const handleDelete = async (id: string) => {
  // Update UI immediately
  setInvoices(prev => prev.filter(i => i.id !== id));

  // Call server
  const result = await deleteInvoice(id);

  // Rollback on failure
  if (!result.success) {
    router.refresh();
    toast.error('Failed to delete');
  }
};
```

## Styling & Theming

- **Tailwind CSS** with custom configuration in `tailwind.config.ts`
- **CSS Variables** defined in `app/globals.css` (supports light/dark mode)
- **Dark Mode**: Uses `next-themes` package, toggle with theme switcher
- **AG Grid Theme**: Custom Preline-inspired theme in `app/ag-grid-preline-theme.css`
- **Preline**: Primary UI framework for all components (buttons, cards, modals, dropdowns, forms, etc.)
  - Requires `components/preline-init.tsx` to initialize HS components
  - Components use data attributes like `data-hs-dropdown`, `data-hs-overlay`, `data-hs-tabs`

The app dynamically switches between `ag-theme-quartz` and `ag-theme-quartz-dark` based on theme.

### Preline Component Patterns

The app uses Preline's HTML + Tailwind patterns directly (no wrapper components):

**Buttons:**

```tsx
<button className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
  Button Text
</button>
```

**Cards:**

```tsx
<div className="bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-neutral-800 dark:border-neutral-700">
  <div className="p-5 border-b border-gray-200 dark:border-neutral-700">
    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Title</h3>
  </div>
  <div className="p-5">Content</div>
</div>
```

**Modals (HSOverlay):**

```tsx
<div id="modal-id" className="hs-overlay hs-overlay-backdrop-open:backdrop-blur-sm hidden size-full fixed top-0 start-0 z-[80] overflow-x-hidden overflow-y-auto pointer-events-none">
  <div className="hs-overlay-open:opacity-100 hs-overlay-open:duration-500 transition-all sm:max-w-lg sm:w-full m-3 sm:mx-auto">
    <div className="flex flex-col bg-white border shadow-sm rounded-xl dark:bg-neutral-900 dark:border-neutral-800">
      {/* Modal content */}
    </div>
  </div>
</div>
```

Control modals programmatically:

```tsx
if (typeof window !== 'undefined' && window.HSOverlay) {
  window.HSOverlay.open('#modal-id');
  // or
  window.HSOverlay.close('#modal-id');
}
```

See `components/command-palette.tsx` and `components/invoices/invoice-dialog.tsx` for complete examples.

## Important Implementation Notes

### Clerk Organizations Setup

1. Enable Organizations in Clerk Dashboard → Configure → Organizations
2. Set "Who can create organizations" to "Anyone" for demo purposes
3. Users can belong to multiple organizations
4. Organization switcher is available in the UI via Clerk's `<OrganizationSwitcher />`

### Supabase Row Level Security

- RLS is **enabled** on the `invoices` table
- Current policies are **permissive** (allow all operations)
- Security is enforced in the **application layer** by filtering on `org_id`
- For production, tighten RLS policies to validate `org_id` against Clerk JWT claims

### Invoice Number Generation

- Automatically generated in `app/actions/invoices.ts`
- Format: `INV-XXX` (increments per organization)
- Uses last invoice's number to calculate next

### AG Grid Features

- Sortable columns (click headers)
- Resizable columns (drag borders)
- CSV export via `gridRef.current?.api.exportDataAsCsv()`
- Custom cell renderers for status badges and currency formatting
- Pagination (20 rows per page)

### Billing & Subscription Limits

- **Free Plan**: 10 invoices/month
- **Pro Plan**: 100 invoices/month
- **Enterprise Plan**: Unlimited
- Enforced in `app/actions/invoices.ts` via `canCreateInvoice()`
- To enable real billing, complete Clerk Billing dashboard setup

## Path Aliases

The project uses `@/*` to reference root-level imports:

```typescript
import { createClerkSupabaseClient } from '@/lib/supabase/clerk-server';
import type { Invoice } from '@/lib/types/invoice';
```

## Documentation

- **[README.md](./README.md)** - Project overview, quick start, and setup
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Technical architecture guide (authentication, data flow, key patterns)
- **[docs/STYLING.md](./docs/STYLING.md)** - UI styling guide (Preline integration, theming, dark mode)

## Common Gotchas

1. **Always include `org_id` and `user_id`** when inserting records
2. **Use `revalidatePath()`** after mutations to refresh cached data
3. **Validate with Zod** before database operations (both client and server)
4. **Preline components** need `<PrelineInit />` in root layout to initialize HS JavaScript
5. **AG Grid dark mode** requires dynamic class switching via `useTheme()`
6. **HSOverlay modals** must be controlled programmatically with `window.HSOverlay.open()` and `.close()`
7. **Preline dropdowns** require `data-hs-dropdown` attribute and HSDropdown initialization
8. **Server actions** must have `'use server'` directive
9. **Client components** must have `'use client'` directive for interactivity
10. **Form inputs** should use Preline's Tailwind classes (not wrapper components)

## Tech Stack Summary

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Clerk** - Authentication & Organizations
- **Supabase** - PostgreSQL database
- **Zod** - Runtime validation
- **AG Grid Community** - Data tables
- **Fuse.js** - Fuzzy search
- **Preline** - Primary UI framework (buttons, cards, modals, dropdowns, forms, tabs)
- **Tailwind CSS** - Styling
- **next-themes** - Dark mode
