import { Plus, Download, LayoutDashboard, CreditCard, User, Moon, LogOut, Sparkles } from 'lucide-react';
import type { CommandRegistry } from './types';

// Note: Some actions will be passed via props (onCreateInvoice, onExportInvoices)
// Others will be handled in the component (navigation, theme, sign out)
export const commandRegistry: CommandRegistry = [
  // Actions Group
  {
    id: 'new-invoice',
    label: 'New Invoice',
    description: 'Create a new invoice',
    icon: Plus,
    keywords: ['new', 'create', 'invoice', 'bill', 'inv', 'add'],
    group: 'actions',
    action: () => {}, // Will be handled via props
    shortcut: '⌘N',
  },
  {
    id: 'export-invoices',
    label: 'Export Invoices',
    description: 'Download invoices as CSV',
    icon: Download,
    keywords: ['export', 'download', 'csv', 'save', 'data', 'excel'],
    group: 'actions',
    action: () => {}, // Will be handled via props
  },

  // Navigation Group
  {
    id: 'goto-dashboard',
    label: 'Go to Dashboard',
    description: 'View all invoices',
    icon: LayoutDashboard,
    keywords: ['dashboard', 'invoices', 'home', 'main', 'go'],
    group: 'navigation',
    action: () => {}, // Will use Next.js router in component
  },
  {
    id: 'goto-billing',
    label: 'Go to Billing',
    description: 'Manage subscription',
    icon: CreditCard,
    keywords: ['billing', 'subscription', 'plan', 'payment', 'go'],
    group: 'navigation',
    action: () => {}, // Will use Next.js router in component
  },
  {
    id: 'view-profile',
    label: 'View Profile',
    description: 'Open your profile',
    icon: User,
    keywords: ['profile', 'account', 'user', 'settings', 'me'],
    group: 'navigation',
    action: () => {}, // Will trigger Clerk UserButton click
  },

  // Settings Group
  {
    id: 'toggle-theme',
    label: 'Toggle Theme',
    description: 'Switch between light and dark mode',
    icon: Moon,
    keywords: ['theme', 'dark', 'light', 'mode', 'appearance', 'toggle'],
    group: 'settings',
    action: () => {}, // Will use next-themes in component
  },
  {
    id: 'sign-out',
    label: 'Sign Out',
    description: 'Log out of your account',
    icon: LogOut,
    keywords: ['logout', 'sign out', 'exit', 'leave', 'quit'],
    group: 'settings',
    action: () => {}, // Will use Clerk signOut in component
  },

  // AI Group (Future)
  {
    id: 'ask-nelli',
    label: 'Ask Nelli',
    description: 'Chat with your AI assistant',
    icon: Sparkles,
    keywords: ['ai', 'nelli', 'ask', 'assistant', 'help', 'chat', 'bot'],
    group: 'ai',
    action: () => {}, // Will show "Coming Soon" modal
  },
];
