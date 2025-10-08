# OfficeFreund Demo - Onboarding Application

A comprehensive demo application showcasing modern web technologies and best practices for B2B SaaS applications. Built to demonstrate multi-tenant architecture, secure authentication, and production-ready UI patterns.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Presentation Notes](#presentation-notes)
- [Project Structure](#project-structure)
- [Key Implementation Details](#key-implementation-details)

---

## 🎯 Overview

This demo application demonstrates a complete invoice management system with:
- **Multi-tenant B2B authentication** using Clerk Organizations
- **Secure database access** with Supabase Row Level Security (RLS)
- **Modern UI/UX** with Preline-inspired design and shadcn/ui
- **Full CRUD operations** with optimistic updates
- **Organization-based data isolation** for true multi-tenancy

**Purpose**: Training and demonstration of production-ready patterns for building modern SaaS applications.

---

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with Server Components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality, accessible component library

### Backend & Auth
- **Clerk** - B2B authentication with Organizations
  - Multi-tenant support out of the box
  - Organization switching
  - User management
- **Supabase** - PostgreSQL database with real-time capabilities
  - Row Level Security (RLS) policies
  - Type-safe database client
  - RESTful API

### UI/UX
- **Preline Design System** - Modern, clean design language
- **Lucide Icons** - Consistent iconography
- **next-themes** - Seamless dark mode support
- **date-fns** - Modern date formatting

---

## ✨ Features

### 🔐 Authentication & Authorization
- **Clerk B2B Organizations**
  - Seamless sign-up/sign-in flow
  - Organization creation and management
  - Organization switcher in UI
  - Member invitations (ready to extend)
  - Dark mode support for all auth UI

### 📊 Invoice Management
- **Advanced Data Table**
  - Real-time search across invoice number, customer name, and email
  - Status filtering (All, Paid, Pending, Overdue)
  - Sortable columns
  - Row actions (Edit, Duplicate, Delete)
  - Pagination-ready structure

- **CRUD Operations**
  - Create invoices with line items
  - Edit existing invoices
  - Delete with confirmation
  - Duplicate invoices (auto-generates new number)
  - Automatic total calculation from line items

- **Dashboard Statistics**
  - Total invoices count and value
  - Paid invoices amount
  - Pending invoices amount
  - Overdue invoices count
  - Visual color coding for status

### 🎨 UI/UX Features
- **Preline-Inspired Design**
  - Clean, modern interface
  - Professional color scheme (blue accents)
  - Subtle shadows and borders
  - Excellent contrast and readability

- **Dark Mode**
  - System preference detection
  - Manual toggle
  - Persistent across sessions
  - All components fully support both themes

- **Responsive Design**
  - Mobile-first approach
  - Tablet and desktop optimized
  - Touch-friendly interactions

### 🔒 Security Features
- **Row Level Security (RLS)**
  - Organization-based data isolation
  - Users only see their org's data
  - Server-side enforcement

- **Type Safety**
  - End-to-end TypeScript
  - Database type definitions
  - API response types

---

## 🏗 Architecture

### Multi-Tenancy Model

```
┌─────────────────────────────────────────┐
│           Clerk Organizations            │
│  (Authentication & Org Management)       │
└──────────────┬──────────────────────────┘
               │
               │ org_id + user_id
               ▼
┌─────────────────────────────────────────┐
│         Next.js App Router               │
│  • Server Components                     │
│  • Server Actions                        │
│  • Client Components                     │
└──────────────┬──────────────────────────┘
               │
               │ RLS Filtered Queries
               ▼
┌─────────────────────────────────────────┐
│         Supabase PostgreSQL              │
│  • Row Level Security Policies           │
│  • Organization-scoped Data              │
└─────────────────────────────────────────┘
```

### Data Flow

```
User Action (Create Invoice)
    ↓
Client Component (InvoiceDialog)
    ↓
Server Action (createInvoice)
    ↓
Clerk Auth Context (get org_id, user_id)
    ↓
Supabase Client (with org context)
    ↓
PostgreSQL + RLS (filter by org_id)
    ↓
Response → Revalidate → UI Update
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Clerk account ([dashboard.clerk.com](https://dashboard.clerk.com))
- Supabase account ([supabase.com](https://supabase.com))

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd yejay-office-freund-demo
npm install
```

### 2. Set Up Clerk

1. Create a new application at [Clerk Dashboard](https://dashboard.clerk.com)
2. **Enable Organizations**: Configure → Organizations → Toggle ON
3. Set "Who can create organizations" to "Anyone"
4. Copy your API keys

### 3. Set Up Supabase

1. Create a project at [Supabase Dashboard](https://app.supabase.com)
2. Go to SQL Editor
3. Copy and run the SQL from `supabase-schema.sql`
   - Creates `invoices` table
   - Sets up RLS policies
   - Inserts 12 mock invoices

### 4. Configure Environment

```bash
cp .env.example .env.local
```

Update `.env.local` with your credentials:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJ...
```

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 📊 Presentation Notes

### Key Points to Highlight

#### 1. **Modern Architecture** (2 min)
- **Next.js 15 App Router**: Server Components reduce client bundle, improve performance
- **Type Safety**: TypeScript across the entire stack prevents runtime errors
- **Server Actions**: Simplified data mutations without API routes

#### 2. **Multi-Tenancy Done Right** (3 min)
- **Clerk Organizations**:
  - Production-ready B2B authentication
  - No need to build user management from scratch
  - Organization switching built-in

- **Row Level Security**:
  - Database enforces data isolation
  - Not just application-level filtering
  - Prevents data leaks even with SQL injection

**Demo Flow**:
1. Show sign-up → Create organization
2. Create an invoice
3. Sign out, create new user + different org
4. Show that invoices are isolated
5. Switch orgs (if have multiple) to show filtering

#### 3. **Production-Ready UI** (2 min)
- **Design System**: Preline-inspired, professional appearance
- **Accessibility**: shadcn/ui components are WCAG compliant
- **Dark Mode**: Proper theme support, not an afterthought
- **Responsive**: Works on all device sizes

**Demo Flow**:
1. Show the dashboard stats
2. Use search to find an invoice
3. Filter by status
4. Create a new invoice with line items
5. Show automatic total calculation
6. Toggle dark mode
7. Open on mobile view (responsive)

#### 4. **Developer Experience** (2 min)
- **Clear Code Structure**: Feature-based organization
- **Type Definitions**: Invoice types documented
- **Reusable Components**: Table, Dialog patterns can be copied
- **Documentation**: Setup guide included

**Show in Code**:
- `app/actions/invoices.ts` - Clean server actions
- `components/invoices/` - Modular components
- `lib/types/invoice.ts` - Type definitions

#### 5. **Scalability Considerations** (1 min)
- **Database Indexes**: On org_id, status, invoice_number
- **Optimistic Updates**: UI responds immediately
- **Server Components**: Reduced JavaScript sent to client
- **Static Typing**: Catch errors before deployment

### Quick Demo Script (5 min total)

```
1. Home Page (30s)
   - "Clean, modern landing page"
   - Click Sign Up

2. Authentication (30s)
   - Create account
   - Create organization "Demo Corp"
   - Show organization switcher

3. Dashboard (1 min)
   - "See our stats at a glance"
   - "Mock data shows realistic invoices"
   - Point out color coding

4. Search & Filter (1 min)
   - Search for a customer name
   - Filter by "Pending" status
   - Show results update instantly

5. Create Invoice (1.5 min)
   - Click "New Invoice"
   - Fill in customer details
   - Add 2-3 line items
   - Show total auto-calculates
   - Submit

6. Edit & Actions (1 min)
   - Click three dots menu
   - Edit invoice
   - Show Duplicate feature
   - Delete with confirmation

7. Dark Mode (30s)
   - Toggle theme
   - Show all UI elements adapt
   - Including Clerk components
```

### Questions You Might Get

**Q: Why Clerk instead of NextAuth or Supabase Auth?**
A: Clerk provides B2B organizations out of the box, saving weeks of development. It includes member management, invitations, and RBAC patterns. For B2B SaaS, it's the fastest path to production.

**Q: How does RLS work?**
A: Row Level Security enforces access control at the database level. Our policies check the org_id against the authenticated user's organization. Even if someone bypasses the application layer, the database still protects the data.

**Q: Can this scale?**
A: Yes - we're using database indexes, server components to reduce client JavaScript, and Supabase can handle millions of rows. For massive scale, we'd add caching (Redis) and read replicas.

**Q: What about real-time updates?**
A: Supabase supports real-time subscriptions. We could add `supabase.channel().on('postgres_changes')` to get live updates when other users in the org make changes.

**Q: How long did this take to build?**
A: From scratch, this represents about 2-3 days of work. But standing on the shoulders of giants (Clerk, Supabase, shadcn/ui) means we didn't build auth, database management, or base components.

---

## 📁 Project Structure

```
├── app/
│   ├── actions/
│   │   └── invoices.ts              # Server actions for CRUD
│   ├── dashboard/
│   │   ├── layout.tsx               # Dashboard layout with nav
│   │   └── page.tsx                 # Main dashboard page
│   ├── sign-in/[[...sign-in]]/      # Clerk sign-in page
│   ├── sign-up/[[...sign-up]]/      # Clerk sign-up page
│   ├── globals.css                  # Global styles + theme
│   ├── layout.tsx                   # Root layout with providers
│   └── page.tsx                     # Landing page
│
├── components/
│   ├── invoices/
│   │   ├── invoice-table.tsx        # Data table with search/filter
│   │   └── invoice-dialog.tsx       # Create/Edit modal
│   ├── ui/                          # shadcn components
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   └── ...
│   └── clerk-auth-button.tsx        # Auth button with org switcher
│
├── lib/
│   ├── types/
│   │   └── invoice.ts               # TypeScript interfaces
│   ├── supabase/
│   │   └── clerk-server.ts          # Supabase client with Clerk
│   └── utils.ts                     # Utility functions
│
├── supabase-schema.sql              # Database schema + mock data
├── SETUP.md                         # Detailed setup guide
├── middleware.ts                    # Clerk authentication
└── .env.example                     # Environment variables template
```

---

## 🔍 Key Implementation Details

### 1. Clerk + Supabase Integration

**Challenge**: Connecting Clerk's organization context to Supabase queries.

**Solution**: `lib/supabase/clerk-server.ts`
```typescript
export async function createClerkSupabaseClient() {
  const { orgId, userId } = await auth();
  const supabase = createClient(/* ... */);

  return { supabase, orgId, userId };
}
```

All server actions use this to automatically scope queries to the current organization.

### 2. Server Actions Pattern

**Pattern**: Keep business logic in server actions, not in client components.

```typescript
// app/actions/invoices.ts
'use server';

export async function createInvoice(input: CreateInvoiceInput) {
  const { supabase, orgId, userId } = await createClerkSupabaseClient();

  // Automatically include org context
  const invoiceData = { ...input, org_id: orgId, user_id: userId };

  const { data, error } = await supabase
    .from('invoices')
    .insert(invoiceData);

  revalidatePath('/dashboard'); // Update UI
  return { success: true, data };
}
```

### 3. Optimistic UI Updates

**Pattern**: Show changes immediately, handle errors gracefully.

```typescript
// In invoice-table.tsx
const handleDelete = async (id: string) => {
  // Optimistically remove from UI
  setInvoices(prev => prev.filter(i => i.id !== id));

  const result = await deleteInvoice(id);

  if (!result.success) {
    // Rollback on error
    router.refresh();
    alert('Failed to delete');
  }
};
```

### 4. Type-Safe Database Operations

**Pattern**: Define TypeScript interfaces that match database schema.

```typescript
// lib/types/invoice.ts
export interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  amount: number;
  status: InvoiceStatus;
  org_id: string;
  // ... all fields typed
}
```

Used everywhere: server actions, components, database responses.

### 5. Preline Design Implementation

**Key Changes from Default**:
- Primary color: Blue (`#3b82f6`) instead of black
- Status badges: Soft backgrounds with borders
- Table: White background with subtle shadows
- Cards: Icon backgrounds with matching colors
- Light mode as default (better for demos)

### 6. Dark Mode Architecture

**Implementation**:
```typescript
// Uses next-themes for theme detection
const { resolvedTheme } = useTheme();

// Pass to Clerk components
<OrganizationSwitcher
  appearance={{
    baseTheme: resolvedTheme === "dark" ? dark : undefined
  }}
/>
```

All components (including Clerk's) respond to theme changes.

---

## 📚 Additional Resources

- **Detailed Setup**: See [SETUP.md](./SETUP.md) for step-by-step instructions
- **Database Schema**: See [supabase-schema.sql](./supabase-schema.sql) for table structure
- **Clerk Docs**: https://clerk.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **shadcn/ui**: https://ui.shadcn.com

---

## 🎓 Learning Outcomes

After exploring this demo, you should understand:

1. ✅ How to implement B2B multi-tenancy with Clerk Organizations
2. ✅ How to secure data with Supabase Row Level Security
3. ✅ How to build server-side data mutations with Server Actions
4. ✅ How to create production-ready UI with shadcn/ui
5. ✅ How to structure a Next.js 15 App Router application
6. ✅ How to implement dark mode across an entire application
7. ✅ How to design a scalable, maintainable codebase

---

## 🚢 Next Steps for Production

To make this production-ready:

### Features
- [ ] PDF invoice generation
- [ ] Email notifications (Resend/SendGrid)
- [ ] Payment integration (Stripe)
- [ ] Invoice numbering customization
- [ ] Multi-currency support
- [ ] Recurring invoices
- [ ] Client portal (for customers to view invoices)

### Technical
- [ ] Pagination for large datasets
- [ ] Real-time updates (Supabase subscriptions)
- [ ] Caching layer (Redis)
- [ ] Rate limiting
- [ ] Error tracking (Sentry)
- [ ] Analytics (PostHog/Mixpanel)
- [ ] E2E tests (Playwright)
- [ ] API rate limiting

### Security
- [ ] CSRF protection
- [ ] SQL injection prevention (already handled by Supabase)
- [ ] XSS protection (React handles this)
- [ ] Audit logging
- [ ] 2FA enforcement
- [ ] IP whitelisting (enterprise)

---

## 📝 License

This is a demo/training project. Feel free to use it as a reference or starting point for your own projects.

---

## 🤝 Credits

Built with:
- [Next.js](https://nextjs.org) by Vercel
- [Clerk](https://clerk.com) for authentication
- [Supabase](https://supabase.com) for database
- [shadcn/ui](https://ui.shadcn.com) for components
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Preline](https://preline.co) for design inspiration

---

**Built for learning and demonstration purposes** 🎓
