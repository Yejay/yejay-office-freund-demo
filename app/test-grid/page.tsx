/**
 * AG Grid Test Page
 *
 * Simple test page to demo the AG Grid + Preline integration.
 * Access at: http://localhost:3000/test-grid
 */

'use client';

import React, { useMemo } from 'react';
import { DataGrid } from '@/components/ag-grid/DataGrid';
import { GridErrorBoundary } from '@/components/ag-grid/GridErrorBoundary';
import { StatusBadge } from '@/components/ag-grid/renderers/StatusBadge';
import type { ColDef } from 'ag-grid-community';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: string;
  email: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  date: string;
}

export default function TestGridPage() {
  // Sample data
  const invoices: Invoice[] = [
    {
      id: '1',
      invoiceNumber: 'INV-001',
      customer: 'Acme Corp',
      email: 'billing@acme.com',
      amount: 1250.00,
      status: 'paid',
      date: '2024-01-15',
    },
    {
      id: '2',
      invoiceNumber: 'INV-002',
      customer: 'TechStart Inc',
      email: 'accounts@techstart.io',
      amount: 3500.00,
      status: 'pending',
      date: '2024-01-18',
    },
    {
      id: '3',
      invoiceNumber: 'INV-003',
      customer: 'Global Solutions',
      email: 'finance@global.com',
      amount: 875.50,
      status: 'overdue',
      date: '2024-01-10',
    },
    {
      id: '4',
      invoiceNumber: 'INV-004',
      customer: 'Innovation Labs',
      email: 'payment@innovation.co',
      amount: 2100.00,
      status: 'paid',
      date: '2024-01-20',
    },
    {
      id: '5',
      invoiceNumber: 'INV-005',
      customer: 'Future Systems',
      email: 'billing@future.net',
      amount: 4250.75,
      status: 'pending',
      date: '2024-01-22',
    },
    {
      id: '6',
      invoiceNumber: 'INV-006',
      customer: 'Digital Dynamics',
      email: 'accounts@digital.com',
      amount: 1680.00,
      status: 'paid',
      date: '2024-01-25',
    },
    {
      id: '7',
      invoiceNumber: 'INV-007',
      customer: 'Smart Solutions',
      email: 'finance@smart.io',
      amount: 950.25,
      status: 'overdue',
      date: '2024-01-08',
    },
    {
      id: '8',
      invoiceNumber: 'INV-008',
      customer: 'Tech Innovations',
      email: 'billing@techinno.com',
      amount: 3200.00,
      status: 'pending',
      date: '2024-01-28',
    },
  ];

  // Column definitions
  const columnDefs = useMemo<ColDef<Invoice>[]>(
    () => [
      {
        field: 'invoiceNumber',
        headerName: 'Invoice #',
        width: 140,
        pinned: 'left',
        checkboxSelection: true,
      },
      {
        field: 'customer',
        headerName: 'Customer',
        width: 200,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'email',
        headerName: 'Email',
        width: 240,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'amount',
        headerName: 'Amount',
        width: 140,
        valueFormatter: (params) => {
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(params.value);
        },
        filter: 'agNumberColumnFilter',
        cellClass: 'text-right font-semibold',
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 130,
        cellRenderer: StatusBadge,
        filter: 'agSetColumnFilter',
      },
      {
        field: 'date',
        headerName: 'Date',
        width: 140,
        filter: 'agDateColumnFilter',
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            AG Grid + Preline Test
          </h1>
          <p className="text-gray-600 dark:text-neutral-400">
            Testing the AG Grid component with Preline design system integration
          </p>
        </div>

        {/* Grid Card */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm">
          <GridErrorBoundary>
            <DataGrid<Invoice>
              gridId="test-grid"
              rowData={invoices}
              columnDefs={columnDefs}
              pagination
              paginationPageSize={10}
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
          </GridErrorBoundary>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-400 mb-3">
            🎯 Test Features
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
            <li>✅ <strong>Search:</strong> Type in the search bar to filter rows</li>
            <li>✅ <strong>Filters:</strong> Click the Filters button to apply column filters</li>
            <li>✅ <strong>Columns:</strong> Click Columns to hide/show columns</li>
            <li>✅ <strong>Sort:</strong> Click column headers to sort</li>
            <li>✅ <strong>Pagination:</strong> Use pagination controls at the bottom</li>
            <li>✅ <strong>Selection:</strong> Check checkboxes to select rows</li>
            <li>✅ <strong>Resize:</strong> Drag column edges to resize</li>
            <li>✅ <strong>Reorder:</strong> Drag column headers to reorder</li>
            <li>✅ <strong>Dark Mode:</strong> Toggle your system dark mode to see themes</li>
            <li>✅ <strong>Persistence:</strong> Your settings are saved to localStorage</li>
          </ul>
        </div>

        {/* Status Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-4">
            <div className="text-sm text-gray-500 dark:text-neutral-400 mb-1">
              Total Invoices
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {invoices.length}
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-4">
            <div className="text-sm text-gray-500 dark:text-neutral-400 mb-1">
              Paid
            </div>
            <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              {invoices.filter((i) => i.status === 'paid').length}
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-4">
            <div className="text-sm text-gray-500 dark:text-neutral-400 mb-1">
              Overdue
            </div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {invoices.filter((i) => i.status === 'overdue').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
