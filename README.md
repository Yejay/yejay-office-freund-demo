# OfficeFreund Demo - Invoice Management

A modern invoice management application demonstrating multi-tenant B2B SaaS architecture with Clerk Organizations and Supabase.

---

## ✨ Features

### 🔐 Authentication & Multi-Tenancy
- **Clerk B2B Organizations** - Complete organization management
- **Organization Switcher** - Seamless switching between organizations
- **Secure Sign-up/Sign-in** - Professional auth UI with dark mode support

### 📊 Invoice Management
- **Advanced Data Table**
  - Real-time search across invoice number, customer name, and email
  - Status filtering (All, Paid, Pending, Overdue)
  - Sortable columns
  - Row actions (Edit, Duplicate, Delete)

- **Full CRUD Operations**
  - Create invoices with line items
  - Edit existing invoices
  - Delete with confirmation
  - Duplicate invoices (auto-generates new number)
  - Automatic total calculation

- **Dashboard Statistics**
  - Total invoices count and value
  - Paid invoices amount
  - Pending invoices amount
  - Overdue invoices count

### 🎨 UI/UX
- **Preline-Inspired Design** - Clean, modern interface
- **Dark Mode** - Full theme support with system preference detection
- **Responsive Design** - Mobile-first, works on all devices

### 🔒 Security
- **Row Level Security (RLS)** - Organization-based data isolation
- **Type Safety** - End-to-end TypeScript
- **Server-side Enforcement** - Users only see their org's data

---

## 🛠 Tech Stack

- **Next.js 15** - React framework with App Router
- **React 19** - Server Components
- **TypeScript** - Type-safe development
- **Clerk** - B2B authentication with Organizations
- **Supabase** - PostgreSQL with Row Level Security
- **shadcn/ui** - Component library
- **Tailwind CSS** - Styling

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- [Clerk account](https://dashboard.clerk.com)
- [Supabase account](https://supabase.com)

### 1. Install Dependencies

```bash
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

Update `.env.local`:

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

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Detailed technical guide for new developers
- **[PRESENTATION.md](./PRESENTATION.md)** - Demo script and presentation notes
- **[SETUP.md](./SETUP.md)** - Step-by-step setup instructions

---

## 📁 Project Structure

```
├── app/
│   ├── actions/invoices.ts        # Server actions for CRUD
│   ├── dashboard/                 # Dashboard pages
│   ├── sign-in/                   # Clerk sign-in
│   ├── sign-up/                   # Clerk sign-up
│   └── page.tsx                   # Landing page
│
├── components/
│   ├── invoices/                  # Invoice components
│   ├── ui/                        # shadcn components
│   └── clerk-auth-button.tsx     # Auth UI
│
├── lib/
│   ├── types/invoice.ts          # TypeScript types
│   ├── supabase/clerk-server.ts  # Supabase + Clerk integration
│   └── utils.ts                   # Utilities
│
└── supabase-schema.sql           # Database schema + mock data
```

---

## 🎓 Learning Outcomes

This demo teaches:

1. ✅ Multi-tenant B2B authentication with Clerk Organizations
2. ✅ Database security with Supabase Row Level Security
3. ✅ Server Actions for data mutations
4. ✅ Production-ready UI with shadcn/ui
5. ✅ Next.js 15 App Router architecture
6. ✅ Dark mode implementation
7. ✅ Type-safe full-stack development

---

## 📝 License

This is a demo/training project. Free to use as reference.

---

**Built for learning and demonstration purposes** 🎓
