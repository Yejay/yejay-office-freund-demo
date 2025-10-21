/**
 * AG Grid Test Page
 *
 * Demo page for PrelineProDataTable - AG Grid with Preline Pro design.
 * Access at: http://localhost:3000/test-grid
 */

'use client';

import React, { useMemo, useState } from 'react';
import { PrelineProDataTable } from '@/components/ag-grid/PrelineProDataTable';
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
  const [selectedRows, setSelectedRows] = useState<Invoice[]>([]);

  // Sample data - expanded dataset for better testing
  const invoices: Invoice[] = useMemo(() => [
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
    {
      id: '9',
      invoiceNumber: 'INV-009',
      customer: 'Cloud Services Ltd',
      email: 'billing@cloudservices.com',
      amount: 5500.00,
      status: 'paid',
      date: '2024-02-01',
    },
    {
      id: '10',
      invoiceNumber: 'INV-010',
      customer: 'Data Analytics Co',
      email: 'finance@dataanalytics.com',
      amount: 2750.00,
      status: 'pending',
      date: '2024-02-05',
    },
    {
      id: '11',
      invoiceNumber: 'INV-011',
      customer: 'Security Solutions',
      email: 'accounts@security.com',
      amount: 1950.00,
      status: 'overdue',
      date: '2024-01-05',
    },
    {
      id: '12',
      invoiceNumber: 'INV-012',
      customer: 'Mobile Apps Inc',
      email: 'billing@mobileapps.io',
      amount: 3850.00,
      status: 'paid',
      date: '2024-02-10',
    },
  ], []);

  // Status tabs configuration
  const statusTabs = useMemo(() => [
    {
      key: 'all',
      label: 'All',
      count: invoices.length,
    },
    {
      key: 'paid',
      label: 'Paid',
      count: invoices.filter((i) => i.status === 'paid').length,
      filterValue: 'paid',
    },
    {
      key: 'pending',
      label: 'Pending',
      count: invoices.filter((i) => i.status === 'pending').length,
      filterValue: 'pending',
    },
    {
      key: 'overdue',
      label: 'Overdue',
      count: invoices.filter((i) => i.status === 'overdue').length,
      filterValue: 'overdue',
    },
  ], [invoices]);

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

  // Handle export action
  const handleExport = () => {
    console.log('Exporting data...', selectedRows);
    alert(`Exporting ${selectedRows.length || invoices.length} invoices`);
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-neutral-900 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-stone-900 dark:text-white mb-2">
            Preline Pro Data Table
          </h1>
          <p className="text-stone-600 dark:text-neutral-400">
            Hybrid component combining Preline Pro UI with AG Grid API - Built using TDD
          </p>
        </div>

        {/* PrelineProDataTable Component */}
        <GridErrorBoundary>
          <PrelineProDataTable<Invoice>
            gridId="preline-pro-grid"
            rowData={invoices}
            columnDefs={columnDefs}
            pagination
            paginationPageSize={5}
            paginationPageSizeOptions={[5, 10, 25, 50]}
            showSearch
            searchPlaceholder="Search invoices..."
            searchDebounceMs={300}
            showFilters
            showDateFilter
            dateFilterField="date"
            statusTabs={statusTabs}
            statusFilterField="status"
            defaultStatusTab="all"
            showRowCount
            rowSelection="multiple"
            height="600px"
            toolbarActions={[
              {
                label: 'Export',
                onClick: handleExport,
                icon: 'download',
                variant: 'primary',
              },
            ]}
            onSelectionChanged={(event) => {
              const selected = event.api.getSelectedRows();
              setSelectedRows(selected);
              console.log('Selected rows:', selected);
            }}
            onRowClicked={(event) => {
              console.log('Row clicked:', event.data);
            }}
          />
        </GridErrorBoundary>

        {/* Feature Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-400 mb-3">
              🎯 Hybrid Preline Pro + AG Grid Features
            </h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
              <li>✅ <strong>Status Nav Tabs:</strong> Filter by status (All, Paid, Pending, Overdue)</li>
              <li>✅ <strong>Stone Color Palette:</strong> Preline Pro's exact design system</li>
              <li>✅ <strong>Advanced Search:</strong> Debounced search with icon</li>
              <li>✅ <strong>Date Range Filter:</strong> Calendar dropdown (placeholder ready)</li>
              <li>✅ <strong>Column Filters:</strong> Checkboxes with count badge</li>
              <li>✅ <strong>Custom Pagination:</strong> Preline Pro "X of Y" format</li>
              <li>✅ <strong>Row Selection:</strong> Multi-select with checkboxes</li>
              <li>✅ <strong>Dark Mode:</strong> Full dark mode support</li>
              <li>✅ <strong>Shadow-2xs:</strong> Preline Pro shadow utilities</li>
              <li>✅ <strong>AG Grid Power:</strong> Sorting, filtering, resizing via API</li>
            </ul>
          </div>

          {/* Statistics */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-stone-500 dark:text-neutral-400 mb-1">
                    Total Invoices
                  </div>
                  <div className="text-2xl font-bold text-stone-900 dark:text-white">
                    {invoices.length}
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-stone-500 dark:text-neutral-400 mb-1">
                    Paid Invoices
                  </div>
                  <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                    {invoices.filter((i) => i.status === 'paid').length}
                  </div>
                </div>
                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-stone-500 dark:text-neutral-400 mb-1">
                    Overdue Invoices
                  </div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {invoices.filter((i) => i.status === 'overdue').length}
                  </div>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {selectedRows.length > 0 && (
              <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl p-4">
                <div className="text-sm text-green-600 dark:text-green-400 font-semibold mb-1">
                  Selected Rows
                </div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {selectedRows.length}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* TDD Badge */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-500/10 dark:to-pink-500/10 border border-purple-200 dark:border-purple-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300">
                Built with Test-Driven Development
              </h3>
              <p className="text-sm text-purple-700 dark:text-purple-400 mt-1">
                This component was developed using TDD methodology. Tests were written first,
                then the component was built to pass all tests. Run <code className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-500/20 rounded">npm test</code> to verify.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
