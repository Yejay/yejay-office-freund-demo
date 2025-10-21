/**
 * AG Grid Examples Page
 *
 * Demonstrates all features of the AG Grid with Preline integration.
 * Shows basic usage, advanced features, and customization options.
 */

'use client';

import React, { useMemo, useState } from 'react';
import { DataGrid } from '@/components/ag-grid/DataGrid';
import { GridErrorBoundary } from '@/components/ag-grid/GridErrorBoundary';
import { StatusBadge } from '@/components/ag-grid/renderers/StatusBadge';
import {
  ActionButtons,
  createEditAction,
  createDeleteAction,
  createViewAction,
} from '@/components/ag-grid/renderers/ActionButtons';
import type { ColDef } from 'ag-grid-community';
import { formatCurrency, formatDate } from '@/lib/ag-grid/utils';

/**
 * Sample invoice data type
 */
interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  createdAt: string;
}

/**
 * Generate sample invoice data
 */
function generateSampleData(count: number = 50): Invoice[] {
  const statuses: Invoice['status'][] = ['paid', 'pending', 'overdue'];
  const customers = [
    'Acme Corp',
    'TechStart Inc',
    'Global Solutions',
    'Innovation Labs',
    'Future Systems',
    'Digital Dynamics',
    'Smart Solutions',
    'Tech Innovations',
  ];

  return Array.from({ length: count }, (_, i) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 60) - 30);

    return {
      id: `inv-${i + 1}`,
      invoiceNumber: `INV-${String(i + 1).padStart(4, '0')}`,
      customerName: customers[Math.floor(Math.random() * customers.length)],
      customerEmail: `contact${i + 1}@example.com`,
      amount: Math.floor(Math.random() * 10000) + 100,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      dueDate: dueDate.toISOString(),
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });
}

export default function AGGridExamplesPage() {
  // Sample data
  const [rowData] = useState<Invoice[]>(() => generateSampleData(100));

  // Column definitions with all features
  const columnDefs = useMemo<ColDef<Invoice>[]>(
    () => [
      {
        field: 'invoiceNumber',
        headerName: 'Invoice #',
        width: 130,
        pinned: 'left',
        checkboxSelection: true,
        headerCheckboxSelection: true,
      },
      {
        field: 'customerName',
        headerName: 'Customer',
        width: 180,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'customerEmail',
        headerName: 'Email',
        width: 220,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'amount',
        headerName: 'Amount',
        width: 140,
        valueFormatter: (params) => formatCurrency(params.value),
        filter: 'agNumberColumnFilter',
        cellClass: 'text-right tabular-nums font-semibold',
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 120,
        cellRenderer: StatusBadge,
        filter: 'agSetColumnFilter',
      },
      {
        field: 'dueDate',
        headerName: 'Due Date',
        width: 140,
        valueFormatter: (params) => formatDate(params.value),
        filter: 'agDateColumnFilter',
      },
      {
        field: 'createdAt',
        headerName: 'Created',
        width: 140,
        valueFormatter: (params) => formatDate(params.value),
        filter: 'agDateColumnFilter',
      },
      {
        headerName: 'Actions',
        cellRenderer: ActionButtons,
        cellRendererParams: {
          actions: [
            createViewAction((data) => {
              console.log('View invoice:', data);
              alert(`Viewing invoice: ${data.invoiceNumber}`);
            }),
            createEditAction((data) => {
              console.log('Edit invoice:', data);
              alert(`Editing invoice: ${data.invoiceNumber}`);
            }),
            createDeleteAction((data) => {
              console.log('Delete invoice:', data);
              if (confirm(`Delete invoice ${data.invoiceNumber}?`)) {
                alert('Invoice deleted (demo)');
              }
            }),
          ],
        },
        width: 120,
        sortable: false,
        filter: false,
        pinned: 'right',
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-neutral-100">
            AG Grid Examples
          </h1>
          <p className="text-gray-600 dark:text-neutral-400">
            Comprehensive examples of AG Grid with Preline design integration
          </p>
        </div>

        {/* Features List */}
        <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 mb-4">
            Features Demonstrated
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureItem>✅ Search & Filter</FeatureItem>
            <FeatureItem>✅ Pagination</FeatureItem>
            <FeatureItem>✅ Row Selection</FeatureItem>
            <FeatureItem>✅ Custom Cell Renderers</FeatureItem>
            <FeatureItem>✅ Column Pinning</FeatureItem>
            <FeatureItem>✅ State Persistence</FeatureItem>
            <FeatureItem>✅ Dark Mode</FeatureItem>
            <FeatureItem>✅ Keyboard Navigation</FeatureItem>
            <FeatureItem>✅ Column Resize & Reorder</FeatureItem>
            <FeatureItem>✅ Responsive Design</FeatureItem>
            <FeatureItem>✅ Action Buttons</FeatureItem>
            <FeatureItem>✅ Status Badges</FeatureItem>
          </div>
        </div>

        {/* Grid with Error Boundary */}
        <GridErrorBoundary>
          <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg overflow-hidden">
            <DataGrid<Invoice>
              gridId="examples-grid"
              rowData={rowData}
              columnDefs={columnDefs}
              pagination
              paginationPageSize={25}
              paginationPageSizeOptions={[10, 25, 50, 100]}
              showSearch
              searchPlaceholder="Search invoices..."
              showFilters
              showColumnToggle
              rowSelection="multiple"
              height="600px"
              animateRows
              onRowClicked={(event) => {
                console.log('Row clicked:', event.data);
              }}
            />
          </div>
        </GridErrorBoundary>

        {/* Code Example */}
        <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 mb-4">
            Usage Example
          </h2>
          <pre className="bg-gray-50 dark:bg-neutral-900 p-4 rounded-lg overflow-x-auto">
            <code className="text-sm text-gray-800 dark:text-neutral-200">
              {`<DataGrid<Invoice>
  gridId="invoices-grid"
  rowData={invoices}
  columnDefs={columnDefs}
  pagination
  showSearch
  showFilters
  showColumnToggle
  rowSelection="multiple"
  height="600px"
/>`}
            </code>
          </pre>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-400 mb-2">
            💡 Tips
          </h3>
          <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-300">
            <li>• Use keyboard shortcuts: Arrow keys to navigate, Tab to move between cells</li>
            <li>• Try toggling dark mode to see theme switching in action</li>
            <li>• Column state is automatically saved to localStorage (gridId="examples-grid")</li>
            <li>• Resize, reorder, hide/show columns - your preferences will persist!</li>
            <li>• Click on action buttons to see interactive features</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/**
 * Feature item component
 */
function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-neutral-300">
      {children}
    </div>
  );
}
