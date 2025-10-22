# OfficeFreund - Invoice Management Demo

A modern multi-tenant B2B SaaS invoice management application showcasing production-ready architecture with Clerk Organizations and Supabase.

## Features

- **Multi-Tenant B2B** - Complete organization management with Clerk
- **Secure Data Isolation** - Row Level Security ensures org data separation
- **Advanced Invoice Management** - Full CRUD with search, filtering, and AG Grid table
- **Command Palette** - Keyboard-driven interface (`cmd+k`)
- **Subscription Billing** - Usage tracking and plan limits
- **Modern UI** - Preline design system with dark mode support

## Tech Stack

- **Next.js 15** - App Router, Server Components, Server Actions
- **TypeScript** - End-to-end type safety with Zod validation
- **Clerk** - B2B authentication with Organizations
- **Supabase** - PostgreSQL with Row Level Security
- **Preline UI** - Modern component library
- **AG Grid** - Professional data tables
- **Tailwind CSS** - Utility-first styling

## Quick Start

### Prerequisites
- Node.js 18+
- [Clerk account](https://dashboard.clerk.com) (free tier)
- [Supabase account](https://supabase.com) (free tier)

### 1. Install
```bash
npm install
```

### 2. Set Up Clerk
1. Create an application at [Clerk Dashboard](https://dashboard.clerk.com)
2. **Enable Organizations**: Configure → Organizations → Toggle ON
3. Set "Who can create organizations" to "Anyone"
4. Copy your API keys

### 3. Set Up Supabase
1. Create a project at [Supabase Dashboard](https://app.supabase.com)
2. Go to SQL Editor
3. Copy and run the SQL from `supabase-schema.sql`
   - Creates `invoices` table with RLS policies
   - Inserts 12 mock invoices for testing

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

### 5. Run
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Testing the App

1. **Sign up** and create your first organization
2. **View mock invoices** for `demo_org_1` (10 invoices)
3. **Create, edit, delete** invoices to test CRUD operations
4. **Try the command palette** with `cmd+k` (Mac) or `ctrl+k` (Windows/Linux)
5. **Test multi-tenancy**: Sign out, create a new user with a different organization, and verify you don't see the first org's data

## Project Structure

```
├── app/
│   ├── actions/invoices.ts       # Server actions for CRUD
│   ├── dashboard/page.tsx        # Main dashboard
│   ├── billing/page.tsx          # Subscription UI
│   └── sign-in/, sign-up/        # Clerk auth pages
├── components/
│   ├── invoices/                 # Invoice table and dialog
│   ├── command-palette.tsx       # Keyboard command interface
│   └── preline-init.tsx          # Preline JS initialization
├── lib/
│   ├── supabase/clerk-server.ts  # Clerk + Supabase integration
│   ├── types/invoice.ts          # TypeScript types
│   ├── schemas/invoice.schema.ts # Zod validation
│   ├── commands/registry.ts      # Command palette commands
│   └── billing/                  # Subscription limits
├── docs/
│   ├── ARCHITECTURE.md           # Technical guide
│   └── STYLING.md                # Design system guide
├── CLAUDE.md                     # Guide for Claude Code
└── supabase-schema.sql          # Database schema + mock data
```

## Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Development guide for Claude Code
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Technical architecture guide
- **[docs/STYLING.md](./docs/STYLING.md)** - UI styling and theming guide

## Key Concepts

### Multi-Tenancy
Every invoice belongs to an organization via `org_id`. Server actions use `createClerkSupabaseClient()` to get the current user's organization, ensuring data isolation.

### Command Palette
Press `cmd+k` (Mac) or `ctrl+k` (Windows/Linux) to open. Uses Fuse.js for fuzzy search across all app actions.

### Subscription Limits
- **Free**: 10 invoices/month
- **Pro**: 100 invoices/month
- **Enterprise**: Unlimited

Limits enforced in `app/actions/invoices.ts` before invoice creation.

## Troubleshooting

**Can't see any invoices?**
- Ensure you ran `supabase-schema.sql` in Supabase SQL Editor
- Check browser console for errors
- Verify environment variables are set correctly

**Clerk organization not working?**
- Enable Organizations in Clerk Dashboard → Configure → Organizations
- Make sure you created an organization after signing up

**Build errors?**
- Delete `.next/` folder and `node_modules/`
- Run `npm install` and `npm run dev` again
- Restart dev server after changing `.env.local`

## Development Commands

```bash
npm run dev     # Start development server (port 3000)
npm run build   # Build for production
npm start       # Start production server
npm run lint    # Run ESLint
```

## License

MIT - Free to use as reference for learning and demonstration purposes.

---

**Built to demonstrate modern B2B SaaS architecture patterns** 🚀
