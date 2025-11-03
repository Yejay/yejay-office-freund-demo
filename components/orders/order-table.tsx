'use client';

/**
 * Simple AG Grid Order Table
 * Matches Preline data table example with basic columns
 */

import { useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ModuleRegistry } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import { Order, OrderStatus, PaymentStatus } from '@/lib/types/order';
import { MoreHorizontal } from 'lucide-react';
import { useTheme } from 'next-themes';

// Import OfficeFreund custom theme (new theming API - no ag-grid.css needed)
import { officeFreundTheme } from '@/lib/ag-grid-theme';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface OrderTableProps {
  orders: Order[];
}

// Status badge styles
const statusStyles: Record<OrderStatus, string> = {
  ready_for_pickup: 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
  fulfilled: 'bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800',
  unfulfilled: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
};

// Payment status badge styles
const paymentStatusStyles: Record<PaymentStatus, string> = {
  paid: 'bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800',
  pending: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
  refunded: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
  partially_refunded: 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800',
};

// Status display names
const statusNames: Record<OrderStatus, string> = {
  ready_for_pickup: 'Ready for pickup',
  fulfilled: 'Fulfilled',
  unfulfilled: 'Unfulfilled',
};

// Payment status display names
const paymentStatusNames: Record<PaymentStatus, string> = {
  paid: 'Paid',
  pending: 'Pending',
  refunded: 'Refunded',
  partially_refunded: 'Partially refunded',
};

export function OrderTable({ orders }: OrderTableProps) {
  const { theme } = useTheme();
  const gridRef = useRef<AgGridReact>(null);

  // Order number renderer (green text like in screenshot)
  const OrderNumberRenderer = (props: { value: string }) => {
    return (
      <span className="font-semibold text-green-600 dark:text-green-400">
        {props.value}
      </span>
    );
  };

  // Status badge renderer
  const StatusRenderer = (props: { value: OrderStatus }) => {
    return (
      <span className={`inline-flex items-center gap-x-1.5 py-1 px-2 rounded-full text-xs font-medium ${statusStyles[props.value]}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
        {statusNames[props.value]}
      </span>
    );
  };

  // Payment method renderer
  const PaymentMethodRenderer = (props: { data: Order }) => {
    const { payment_method, payment_last_four } = props.data;

    // Icon colors based on payment method
    const iconClass = payment_method === 'mastercard'
      ? 'text-orange-500'
      : payment_method === 'visa'
      ? 'text-blue-500'
      : payment_method === 'paypal'
      ? 'text-blue-600'
      : 'text-gray-500';

    return (
      <div className="flex items-center gap-2">
        <svg className={`w-8 h-5 ${iconClass}`} fill="currentColor" viewBox="0 0 32 20" xmlns="http://www.w3.org/2000/svg">
          {payment_method === 'mastercard' && (
            <>
              <circle cx="12" cy="10" r="8" opacity="0.8" />
              <circle cx="20" cy="10" r="8" opacity="0.6" />
            </>
          )}
          {payment_method === 'bank_transfer' && (
            <rect x="2" y="4" width="28" height="12" rx="2" opacity="0.8" />
          )}
        </svg>
        {payment_last_four && <span className="text-sm">**** {payment_last_four}</span>}
      </div>
    );
  };

  // Payment status badge renderer
  const PaymentStatusRenderer = (props: { value: PaymentStatus }) => {
    return (
      <span className={`inline-flex items-center gap-x-1.5 py-1 px-2 rounded-full text-xs font-medium ${paymentStatusStyles[props.value]}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
        {paymentStatusNames[props.value]}
      </span>
    );
  };

  // Actions menu renderer
  const ActionsRenderer = () => {
    return (
      <div className="hs-dropdown relative inline-flex">
        <button
          type="button"
          className="hs-dropdown-toggle py-2 px-2 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    );
  };

  // Column definitions
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        field: 'order_number',
        headerName: 'Order',
        flex: 0.8,          // Flexible width
        minWidth: 120,
        sortable: true,
        filter: true,
        cellRenderer: OrderNumberRenderer,
      },
      {
        field: 'purchased',
        headerName: 'Purchased',
        flex: 1.5,          // Wider for date/time
        minWidth: 200,
        sortable: true,
        filter: true,
      },
      {
        field: 'status',
        headerName: 'Status',
        flex: 1,
        minWidth: 140,
        sortable: true,
        filter: true,
        cellRenderer: StatusRenderer,
      },
      {
        field: 'customer',
        headerName: 'Customer',
        flex: 1.2,
        minWidth: 150,
        sortable: true,
        filter: true,
      },
      {
        field: 'payment_method',
        headerName: 'Payment method',
        flex: 1.2,
        minWidth: 160,
        sortable: true,
        cellRenderer: PaymentMethodRenderer,
      },
      {
        field: 'payment_status',
        headerName: 'Payment status',
        flex: 1,
        minWidth: 140,
        sortable: true,
        filter: true,
        cellRenderer: PaymentStatusRenderer,
      },
      {
        field: 'items',
        headerName: 'Items',
        flex: 0.5,
        minWidth: 80,
        sortable: true,
        filter: 'agNumberColumnFilter',
        type: 'rightAligned',
      },
      {
        headerName: '',
        width: 60,
        cellRenderer: ActionsRenderer,
        sortable: false,
        filter: false,
        pinned: 'right',
      },
    ],
    []
  );

  // Default column settings
  const defaultColDef = useMemo<ColDef>(() => ({
    resizable: true,
    sortable: true,
    filter: true,
  }), []);

  return (
    <div
      data-ag-theme-mode={theme === 'dark' ? 'dark' : 'light'}
      style={{ height: 400, width: '100%' }}
      suppressHydrationWarning
    >
      <AgGridReact
        ref={gridRef}
        rowData={orders}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        rowHeight={56}      // Preline-style taller rows for better readability
        headerHeight={48}   // Slightly shorter headers
        rowSelection={{
          mode: 'multiRow',
          checkboxes: true,
          headerCheckbox: true,
          enableClickSelection: false,
        }}
        animateRows={true}
        theme={officeFreundTheme}
      />
    </div>
  );
}
