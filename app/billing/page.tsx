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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Usage</CardTitle>
              <CardDescription>
                {organization?.name || 'Your organization'} - {currentPlanData.name} Plan
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-200">
              {currentPlanData.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-muted-foreground">Loading usage data...</p>
          ) : (
            <>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Invoices this month</span>
                  <span className="text-sm text-muted-foreground">
                    {invoiceCount} / {currentPlanData.invoiceLimit === Infinity ? '∞' : currentPlanData.invoiceLimit}
                  </span>
                </div>
                <Progress value={Math.min(usagePercentage, 100)} className="h-2" />
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
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">Choose Your Plan</h2>
          <p className="text-muted-foreground mt-2">
            Select the perfect plan for your business needs
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = plan.id === currentPlan;

            return (
              <Card
                key={plan.id}
                className={`relative shadow-sm ${
                  plan.highlighted
                    ? 'border-purple-500 dark:border-purple-400 shadow-purple-100 dark:shadow-purple-900/20'
                    : ''
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-purple-600 text-white">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Icon className={`h-8 w-8 ${plan.iconColor}`} />
                    {isCurrentPlan && (
                      <Badge variant="secondary" className="bg-green-50 text-green-700 border border-green-200">
                        Active
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="mt-4">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground">{plan.period}</span>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? 'default' : 'outline'}
                    disabled={isCurrentPlan}
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    {isCurrentPlan ? plan.cta : (
                      <>
                        {plan.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Setup Instructions */}
      <Card className="shadow-sm bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">
            Setup Clerk Billing (Beta)
          </CardTitle>
          <CardDescription className="text-blue-700 dark:text-blue-300">
            To enable real billing functionality, follow these steps:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-blue-900 dark:text-blue-100">
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
        </CardContent>
      </Card>
    </div>
  );
}
