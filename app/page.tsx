import { ClerkAuthButton } from "@/components/clerk-auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { SignedIn } from "@clerk/nextjs";

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-950/95">
        <div className="container flex h-16 items-center px-4 mx-auto max-w-7xl">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              OfficeFreund
            </span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <ClerkAuthButton />
              <ThemeSwitcher />
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center">
        <div className="container px-4 py-16 mx-auto max-w-5xl">
          <div className="flex flex-col gap-8 items-center text-center">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                Welcome to OfficeFreund
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                A modern demo showcasing Clerk B2B Organizations, Supabase with RLS policies, and beautiful UI components for invoice management.
              </p>
            </div>

            <SignedIn>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 shadow-lg shadow-blue-500/25"
              >
                Go to Dashboard
              </Link>
            </SignedIn>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full">
              <div className="p-6 rounded-lg border bg-white dark:bg-gray-900/50 shadow-sm">
                <div className="text-3xl mb-3">🔐</div>
                <h3 className="font-semibold mb-2">Clerk Auth</h3>
                <p className="text-sm text-muted-foreground">
                  B2B Organizations with seamless authentication
                </p>
              </div>
              <div className="p-6 rounded-lg border bg-white dark:bg-gray-900/50 shadow-sm">
                <div className="text-3xl mb-3">🗄️</div>
                <h3 className="font-semibold mb-2">Supabase</h3>
                <p className="text-sm text-muted-foreground">
                  PostgreSQL with Row Level Security policies
                </p>
              </div>
              <div className="p-6 rounded-lg border bg-white dark:bg-gray-900/50 shadow-sm">
                <div className="text-3xl mb-3">🎨</div>
                <h3 className="font-semibold mb-2">Modern UI</h3>
                <p className="text-sm text-muted-foreground">
                  Preline UI with Tailwind CSS
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Powered by</span>
            <a
              href="https://clerk.com"
              target="_blank"
              className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
              rel="noreferrer"
            >
              Clerk
            </a>
            <span>&</span>
            <a
              href="https://supabase.com"
              target="_blank"
              className="font-semibold text-green-600 hover:text-green-700 dark:text-green-400"
              rel="noreferrer"
            >
              Supabase
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
