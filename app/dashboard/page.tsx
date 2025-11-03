'use client';

/**
 * Dashboard Page
 * Simple single-page dashboard with AG Grid order table
 */

import { OrderTable } from '@/components/orders/order-table';
import { mockOrders } from '@/lib/data/mock-orders';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground mt-1">
          Manage and track your orders
        </p>
      </div>

      {/* Order Table */}
      <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-sm p-6">
        <OrderTable orders={mockOrders} />
      </div>
    </div>
  );
}
