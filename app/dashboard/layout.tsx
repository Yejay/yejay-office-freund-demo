import { ClerkAuthButton } from "@/components/clerk-auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { CommandPalette } from "@/components/command-palette";
import { CommandTrigger } from "@/components/command-trigger";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-950/95 dark:supports-[backdrop-filter]:bg-gray-950/60">
        <div className="container flex h-16 items-center gap-4 px-4 mx-auto max-w-7xl">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              OfficeFreund
            </span>
          </Link>

          {/* Command Trigger (centered) */}
          <div className="hidden md:flex flex-1 justify-center px-4">
            <CommandTrigger />
          </div>

          {/* Right side navigation */}
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/dashboard"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Invoices
              </Link>
              <Link
                href="/billing"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Billing
              </Link>
            </nav>
            <nav className="flex items-center space-x-2">
              <ClerkAuthButton />
              <ThemeSwitcher />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
            <p className="text-center text-sm text-muted-foreground">
              Built with Clerk, Supabase, Next.js & shadcn/ui
            </p>
            <p className="text-center text-sm text-muted-foreground">
              Press{' '}
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>{' '}
              to open command palette
            </p>
          </div>
        </div>
      </footer>

      {/* Command Palette */}
      <CommandPalette />
    </div>
  );
}
