# OfficeFreund Demo - Setup Guide

This is a demo onboarding application showcasing:
- **Clerk** for B2B authentication with organizations
- **Supabase** for database with Row Level Security (RLS)
- **shadcn/ui** components with Tailwind CSS
- **Next.js 15** with App Router
- **Invoice Management** with full CRUD operations

## Prerequisites

1. Node.js 18+ installed
2. A Clerk account (free tier works)
3. A Supabase account (free tier works)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. **Important**: Enable Organizations:
   - Go to "Configure" → "Organizations"
   - Enable "Organizations" feature
   - Set organization creation to "Anyone can create"
4. Copy your API keys from the API Keys section

### 3. Set Up Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project
3. Wait for the database to initialize
4. Go to the SQL Editor
5. Copy the contents of `supabase-schema.sql` and run it
   - This will create the invoices table
   - Set up RLS policies
   - Insert mock data

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your credentials in `.env.local`:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=eyJxxx...
```

### 5. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## How to Test

### Testing Organizations

1. **Create Your First User**:
   - Click "Sign Up" on the home page
   - Create an account
   - You'll be prompted to create an organization

2. **Create an Organization**:
   - After signing up, create your first organization
   - Give it a name (e.g., "Acme Corp")

3. **View Demo Invoices**:
   - Go to the Dashboard
   - You'll see invoices for `demo_org_1`
   - These are the mock invoices from the SQL script

4. **Test CRUD Operations**:
   - Click "New Invoice" to create an invoice
   - Click the three dots menu on any invoice to Edit, Duplicate, or Delete
   - Test the search and filter functionality

5. **Test Multi-Organization**:
   - Sign out and create a new user
   - Create a different organization
   - Notice that you don't see invoices from the first organization
   - This demonstrates RLS (Row Level Security)

### Understanding the Organization Context

The app uses Clerk's organization context to filter data:
- Each invoice is tied to an `org_id` (Clerk organization ID)
- Server actions automatically fetch the current user's organization
- Supabase queries filter by `org_id` to ensure data isolation
- Users can only see/edit invoices from their current organization

## Features Implemented

### Authentication & Authorization
- ✅ Clerk B2B authentication
- ✅ Organization switching
- ✅ Protected routes (middleware)
- ✅ User management

### Database & RLS
- ✅ Supabase PostgreSQL database
- ✅ Row Level Security policies
- ✅ Organization-based data isolation
- ✅ Automatic timestamp updates

### Invoice Management
- ✅ Create invoices with line items
- ✅ Edit existing invoices
- ✅ Delete invoices (with confirmation)
- ✅ Duplicate invoices
- ✅ Search by invoice number, customer name, or email
- ✅ Filter by status (All, Paid, Pending, Overdue)
- ✅ Status badges with color coding
- ✅ Automatic total calculation from line items

### UI/UX
- ✅ Dark/Light mode support
- ✅ Responsive design (mobile-friendly)
- ✅ shadcn/ui components
- ✅ Tailwind CSS styling
- ✅ Loading states
- ✅ Error handling
- ✅ Dashboard with statistics

## Project Structure

```
├── app/
│   ├── actions/
│   │   └── invoices.ts          # Server actions for CRUD
│   ├── dashboard/
│   │   ├── layout.tsx           # Dashboard layout with nav
│   │   └── page.tsx             # Main dashboard page
│   ├── sign-in/                 # Clerk sign-in page
│   ├── sign-up/                 # Clerk sign-up page
│   └── page.tsx                 # Home page
├── components/
│   ├── invoices/
│   │   ├── invoice-table.tsx    # Invoice table with search/filter
│   │   └── invoice-dialog.tsx   # Create/Edit dialog
│   ├── ui/                      # shadcn components
│   └── clerk-auth-button.tsx    # Auth button with org switcher
├── lib/
│   ├── types/
│   │   └── invoice.ts           # TypeScript types
│   └── supabase/
│       └── clerk-server.ts      # Supabase client with Clerk
├── middleware.ts                # Clerk middleware
└── supabase-schema.sql          # Database schema
```

## Learning Points

### 1. Clerk Organizations
- Organizations allow B2B multi-tenancy
- Users can belong to multiple organizations
- Organization context is available in server components
- OrganizationSwitcher component for easy switching

### 2. Supabase RLS
- Row Level Security ensures data isolation
- Policies control who can SELECT, INSERT, UPDATE, DELETE
- Can be combined with JWT claims for advanced security
- In this demo, we handle filtering in the application layer

### 3. Server Actions
- Type-safe data mutations
- Automatic revalidation with `revalidatePath`
- Error handling and loading states
- Works seamlessly with client components

### 4. shadcn/ui
- Copy-paste component library
- Full control over component code
- Built on Radix UI primitives
- Easy to customize and extend

## Next Steps for Production

To make this production-ready, consider:

1. **Enhanced Security**:
   - Use Clerk JWT in Supabase RLS policies
   - Add rate limiting
   - Implement proper error logging

2. **Features**:
   - PDF invoice generation
   - Email notifications
   - Payment integration
   - Invoice numbering customization
   - Multi-currency support

3. **Performance**:
   - Implement pagination for large datasets
   - Add caching strategies
   - Optimize database indexes

4. **UX Improvements**:
   - Add invoice preview
   - Implement drag-and-drop for file attachments
   - Add bulk operations
   - Export to CSV/Excel

## Troubleshooting

### "Missing environment variables" error
- Make sure `.env.local` exists and has all required variables
- Restart the dev server after changing env variables

### Can't see any invoices
- Make sure you ran the SQL schema in Supabase
- Check that your `org_id` matches the mock data (`demo_org_1`)
- Check browser console for errors

### Clerk organization not working
- Ensure Organizations are enabled in Clerk dashboard
- Make sure you created an organization after signing up
- Check that `OrganizationSwitcher` is rendering

## Support

For issues or questions:
- Check the [Clerk Documentation](https://clerk.com/docs)
- Check the [Supabase Documentation](https://supabase.com/docs)
- Check the [shadcn/ui Documentation](https://ui.shadcn.com/)
