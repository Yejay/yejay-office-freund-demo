/**
 * Subscription Limits Helper
 *
 * This file handles subscription plan limits and feature gating.
 * Once Clerk Billing is configured, replace the mock plan check with:
 * - `has({ plan: 'pro' })` from @clerk/nextjs
 * - `has({ feature: 'unlimited_invoices' })` for feature checks
 *
 * For now, this is a demo implementation that shows how limits work.
 */

export interface SubscriptionPlan {
  id: string;
  name: string;
  invoiceLimit: number; // Invoices per month
  features: string[];
}

// ============================================================================
// Plan Definitions
// ============================================================================
export const PLANS: Record<string, SubscriptionPlan> = {
  free: {
    id: 'free',
    name: 'Free',
    invoiceLimit: 10,
    features: ['basic_templates', 'email_support'],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    invoiceLimit: 100,
    features: [
      'basic_templates',
      'advanced_templates',
      'priority_support',
      'export_csv',
      'export_pdf',
      'custom_branding',
      'api_access',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    invoiceLimit: Infinity,
    features: [
      'basic_templates',
      'advanced_templates',
      'priority_support',
      'export_csv',
      'export_pdf',
      'custom_branding',
      'api_access',
      'dedicated_support',
      'custom_integrations',
      'sla',
    ],
  },
};

// ============================================================================
// Current Plan Helper
// ============================================================================
/**
 * Get the current plan for an organization
 *
 * TODO: Replace with actual Clerk Billing check
 * Example: const { has } = useAuth(); const isPro = has({ plan: 'pro' });
 *
 * For now, this returns 'free' for demo purposes
 */
export function getCurrentPlan(): SubscriptionPlan {
  // TODO: Query Clerk to get actual plan with orgId
  // For demo, everyone is on free plan
  return PLANS.free;
}

// ============================================================================
// Usage Tracking
// ============================================================================
/**
 * Count invoices created this month for an organization
 */
export async function getMonthlyInvoiceCount(
  invoices: Array<{ created_at: string }>
): Promise<number> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const thisMonthInvoices = invoices.filter(
    (inv) => new Date(inv.created_at) >= startOfMonth
  );

  return thisMonthInvoices.length;
}

// ============================================================================
// Limit Checking
// ============================================================================
export interface LimitCheckResult {
  allowed: boolean;
  reason?: string;
  currentUsage: number;
  limit: number;
  planName: string;
}

/**
 * Check if an organization can create a new invoice
 *
 * Returns:
 * - allowed: true if invoice can be created
 * - reason: error message if not allowed
 * - currentUsage: how many invoices created this month
 * - limit: the plan's invoice limit
 */
export async function canCreateInvoice(
  invoices: Array<{ created_at: string }>
): Promise<LimitCheckResult> {
  const plan = getCurrentPlan();
  const currentUsage = await getMonthlyInvoiceCount(invoices);

  const allowed = currentUsage < plan.invoiceLimit;

  return {
    allowed,
    reason: allowed
      ? undefined
      : `You've reached your ${plan.name} plan limit of ${plan.invoiceLimit} invoices per month. Upgrade to Pro for more invoices.`,
    currentUsage,
    limit: plan.invoiceLimit,
    planName: plan.name,
  };
}

/**
 * Check if an organization has access to a specific feature
 *
 * TODO: Replace with Clerk Billing feature check
 * Example: has({ feature: 'export_csv' })
 */
export function hasFeature(
  feature: string
): boolean {
  const plan = getCurrentPlan();
  return plan.features.includes(feature);
}
