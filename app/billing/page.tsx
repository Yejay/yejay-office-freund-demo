'use client';

/**
 * Billing Page - Clerk Billing Integration
 *
 * This page demonstrates Clerk Billing for B2B SaaS applications.
 * Clerk Billing (currently in Beta) handles subscription management automatically.
 *
 * SETUP REQUIRED IN CLERK DASHBOARD:
 * ===================================
 * 1. Navigate to "Billing Settings" in Clerk Dashboard
 * 2. Connect your Stripe account (required for production)
 * 3. Create subscription plans under "Plans for Organizations" tab
 * 4. Define features/entitlements for each plan
 * 5. Make plans publicly available
 *
 * Recommended Plan Structure for Invoice App:
 * -------------------------------------------
 * FREE TIER:
 *   - 10 invoices/month
 *   - Basic features
 *
 * PRO TIER ($29/month):
 *   - 100 invoices/month
 *   - Priority support
 *   - Export features
 *   - Custom branding
 *
 * ENTERPRISE TIER (Custom):
 *   - Unlimited invoices
 *   - Dedicated support
 *   - API access
 *   - Custom integrations
 *
 * For now, this page shows a UI mockup. Once you configure plans
 * in Clerk Dashboard, you can use:
 * - `has({ plan: 'pro' })` to check plan access
 * - `has({ feature: 'export' })` to check feature access
 * - `<Protect plan="pro">` component to gate content
 */

import { useState, useEffect } from 'react';
import { useOrganization } from '@clerk/nextjs';
import { Check, Zap, Crown, Building2, ArrowRight } from 'lucide-react';
import { getInvoices } from '@/app/actions/invoices';

export default function BillingPage() {
  const { organization } = useOrganization();
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // ============================================================================
  // Load invoice usage data
  // ============================================================================
  useEffect(() => {
    async function loadUsage() {
      try {
        const invoices = await getInvoices();
        // Count invoices created this month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthInvoices = invoices.filter(
          (inv) => new Date(inv.created_at) >= startOfMonth
        );
        setInvoiceCount(thisMonthInvoices.length);
      } catch (error) {
        console.error('Error loading invoice usage:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUsage();
  }, []);

  // ============================================================================
  // Plan Definitions
  // ============================================================================
  // These should match the plans you configure in Clerk Dashboard

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      description: 'Perfect for getting started',
      icon: Zap,
      iconColor: 'text-blue-600',
      features: [
        '20 invoices per month',
        'Basic invoice templates',
        'Email support',
        'Dashboard analytics',
      ],
      invoiceLimit: 20,
      cta: 'Current Plan',
      highlighted: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$29',
      period: '/month',
      description: 'For growing businesses',
      icon: Crown,
      iconColor: 'text-purple-600',
      features: [
        '100 invoices per month',
        'All invoice templates',
        'Priority email support',
        'Advanced analytics',
        'Export to CSV/PDF',
        'Custom branding',
        'API access',
      ],
      invoiceLimit: 100,
      cta: 'Upgrade to Pro',
      highlighted: true,
      badge: 'Most Popular',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations',
      icon: Building2,
      iconColor: 'text-orange-600',
      features: [
        'Unlimited invoices',
        'All Pro features',
        'Dedicated account manager',
        '24/7 phone support',
        'Custom integrations',
        'SLA guarantee',
        'Training & onboarding',
        'White-label options',
      ],
      invoiceLimit: Infinity,
      cta: 'Contact Sales',
      highlighted: false,
    },
  ];

  // ============================================================================
  // Determine current plan
  // ============================================================================
  // TODO: Replace with actual Clerk Billing checks once configured
  // Example: const currentPlan = has({ plan: 'pro' }) ? 'pro' : 'free';
  const currentPlan = 'free'; // Default to free for now

  const currentPlanData = plans.find((p) => p.id === currentPlan) || plans[0];
  const usagePercentage = (invoiceCount / currentPlanData.invoiceLimit) * 100;

  // ============================================================================
  // Handle plan upgrade
  // ============================================================================
  const handleUpgrade = (planId: string) => {
    // TODO: Implement Clerk Billing upgrade flow
    // This would typically open Clerk's payment flow
    console.log(`Upgrading to ${planId}`);
    alert(
      `To enable plan upgrades, configure Clerk Billing in your Clerk Dashboard:\n\n` +
        `1. Go to Billing Settings\n` +
        `2. Connect your Stripe account\n` +
        `3. Create subscription plans\n` +
        `4. Use <PricingTable /> component from @clerk/nextjs\n\n` +
        `For now, this is a demo UI.`
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription plan and view usage
        </p>
      </div>

      {/* Current Usage Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-neutral-800 dark:border-neutral-700">
        <div className="p-5 border-b border-gray-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Current Usage</h3>
              <p className="text-sm text-gray-500 dark:text-neutral-400">
                {organization?.name || 'Your organization'} - {currentPlanData.name} Plan
              </p>
            </div>
            <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
              {currentPlanData.name}
            </span>
          </div>
        </div>
        <div className="p-5 space-y-4">
          {isLoading ? (
            <p className="text-gray-500 dark:text-neutral-400">Loading usage data...</p>
          ) : (
            <>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-neutral-300">Invoices this month</span>
                  <span className="text-sm text-gray-500 dark:text-neutral-400">
                    {invoiceCount} / {currentPlanData.invoiceLimit === Infinity ? '∞' : currentPlanData.invoiceLimit}
                  </span>
                </div>
                <div className="flex w-full h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-neutral-700">
                  <div
                    className="flex flex-col justify-center rounded-full overflow-hidden bg-blue-600 text-xs text-white text-center whitespace-nowrap transition duration-500"
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  ></div>
                </div>
              </div>

              {usagePercentage >= 80 && usagePercentage < 100 && (
                <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-4 text-sm text-yellow-800 dark:text-yellow-400">
                  You&apos;ve used {Math.round(usagePercentage)}% of your invoice limit. Consider upgrading to Pro for more invoices.
                </div>
              )}

              {usagePercentage >= 100 && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-800 dark:text-red-400">
                  You&apos;ve reached your invoice limit for this month. Upgrade to Pro to create more invoices.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Pricing Plans */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Choose Your Plan</h2>
          <p className="text-gray-500 dark:text-neutral-400 mt-2">
            Select the perfect plan for your business needs
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = plan.id === currentPlan;

            return (
              <div
                key={plan.id}
                className={`relative bg-white border rounded-xl shadow-sm dark:bg-neutral-800 dark:border-neutral-700 ${
                  plan.highlighted
                    ? 'border-purple-500 dark:border-purple-400 shadow-purple-100 dark:shadow-purple-900/20'
                    : 'border-gray-200'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-purple-600 text-white">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <Icon className={`h-8 w-8 ${plan.iconColor}`} />
                    {isCurrentPlan && (
                      <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                        Active
                      </span>
                    )}
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-gray-800 dark:text-white">{plan.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-neutral-400">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-800 dark:text-white">{plan.price}</span>
                    {plan.period && (
                      <span className="text-gray-500 dark:text-neutral-400">{plan.period}</span>
                    )}
                  </div>
                </div>

                <div className="p-5 border-t border-gray-200 dark:border-neutral-700">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 dark:text-neutral-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 border-t border-gray-200 dark:border-neutral-700">
                  <button
                    type="button"
                    className={`w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border disabled:opacity-50 disabled:pointer-events-none ${
                      plan.highlighted
                        ? 'border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700'
                        : 'border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700'
                    }`}
                    disabled={isCurrentPlan}
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    {isCurrentPlan ? plan.cta : (
                      <>
                        {plan.cta}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl shadow-sm dark:bg-blue-900/10 dark:border-blue-800">
        <div className="p-5 border-b border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">
            Setup Clerk Billing (Beta)
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            To enable real billing functionality, follow these steps:
          </p>
        </div>
        <div className="p-5 space-y-3 text-sm text-blue-900 dark:text-blue-100">
          <ol className="list-decimal list-inside space-y-2">
            <li>Go to your Clerk Dashboard → Billing Settings</li>
            <li>Connect your Stripe account (required for payments)</li>
            <li>Create subscription plans under &quot;Plans for Organizations&quot;</li>
            <li>Define features and pricing for each plan</li>
            <li>Make plans publicly available</li>
            <li>Use has() helper or Protect component to gate features</li>
          </ol>
          <p className="mt-4 text-xs text-blue-700 dark:text-blue-400">
            <strong>Note:</strong> Clerk Billing is currently in Beta. APIs may change. Pin your SDK versions.
          </p>
        </div>
      </div>
    </div>
  );
}
