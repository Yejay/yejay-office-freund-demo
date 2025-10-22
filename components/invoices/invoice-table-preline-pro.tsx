'use client';

/**
 * Invoice Table with Preline Pro Styling
 *
 * This component wraps AG-Grid with Preline Pro's "Advanced with Searchable Filter Bar" design.
 * It demonstrates how to integrate AG-Grid's powerful features with Preline Pro's UI components.
 */

import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ModuleRegistry } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import { Invoice, InvoiceStatus } from '@/lib/types/invoice';
import { format } from 'date-fns';
import { deleteInvoice, duplicateInvoice } from '@/app/actions/invoices';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

// Import AG Grid styles
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

// Import custom theme
import '@/app/ag-grid-preline-theme.css';

// Register AG Grid Modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface InvoiceTablePrelineProProps {
  invoices: Invoice[];
  onEdit: (invoice: Invoice) => void;
}

// Tab types matching Preline Pro design
type TabType = 'all' | 'archived' | 'publish' | 'unpublish';

// Status colors matching Preline Pro stone color scheme
const statusStyles = {
  paid: {
    badge: 'bg-stone-100 text-stone-800 dark:bg-neutral-700 dark:text-neutral-200',
    dot: 'bg-stone-800 dark:bg-neutral-200'
  },
  pending: {
    badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-500',
    dot: 'bg-yellow-800 dark:bg-yellow-500'
  },
  overdue: {
    badge: 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-500',
    dot: 'bg-red-800 dark:bg-red-500'
  },
  cancelled: {
    badge: 'bg-stone-100 text-stone-800 dark:bg-neutral-700 dark:text-neutral-200',
    dot: 'bg-stone-800 dark:bg-neutral-200'
  }
} as const;

// Payment method icons (simplified for demo)
const paymentIcons: Record<string, string> = {
  credit_card: '💳',
  paypal: '🅿️',
  bank_transfer: '🏦',
  cash: '💵'
};

export function InvoiceTablePrelinePro({ invoices, onEdit }: InvoiceTablePrelineProProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const gridRef = useRef<AgGridReact>(null);

  // State management
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '25 Jul', end: '25 Aug' });
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Filter checkboxes state
  const [filterColumns, setFilterColumns] = useState({
    order: true,
    purchased: true,
    status: true,
    customer: true,
    paymentMethod: true,
    paymentStatus: true,
    items: true
  });

  // Initialize Preline components
  useEffect(() => {
    // This would initialize Preline's HS components
    // if (typeof window !== 'undefined' && window.HSOverlay) {
    //   window.HSOverlay.autoInit();
    // }
  }, []);

  // Custom Cell Renderers matching Preline Pro design
  const StatusCellRenderer = (props: { value: InvoiceStatus }) => {
    const style = statusStyles[props.value];
    return (
      <span className={`py-1.5 px-2 inline-flex items-center gap-x-1.5 text-xs font-medium rounded-full ${style.badge}`}>
        <span className={`size-1.5 inline-block rounded-full ${style.dot}`}></span>
        {props.value === 'paid' ? 'Paid' :
         props.value === 'pending' ? 'Pending' :
         props.value === 'overdue' ? 'Pending' : // Match Preline Pro which shows "Pending" for overdue
         'Refunded'}
      </span>
    );
  };

  const OrderNumberRenderer = (props: { value: string }) => {
    return (
      <a className="text-sm text-green-600 decoration-2 hover:underline font-medium focus:outline-hidden focus:underline dark:text-green-400 dark:hover:text-green-500" href="#">
        #{props.value.replace('INV-', '')}
      </a>
    );
  };

  const PaymentMethodRenderer = (props: { value: string }) => {
    const icon = paymentIcons[props.value] || '💳';
    return (
      <span className="inline-flex items-center gap-x-1 text-sm text-stone-600 dark:text-neutral-400">
        <span className="text-base">{icon}</span>
        **** {Math.floor(Math.random() * 9000) + 1000}
      </span>
    );
  };

  const PaymentStatusRenderer = (props: { data: Invoice }) => {
    // Map invoice status to payment status
    const paymentStatus = props.data.status === 'paid' ? 'Paid' :
                         props.data.status === 'pending' ? 'Pending' :
                         props.data.status === 'overdue' ? 'Pending' :
                         'Refunded';

    const style = paymentStatus === 'Paid' || paymentStatus === 'Refunded'
      ? statusStyles.paid
      : statusStyles.pending;

    return (
      <span className={`py-1.5 px-2 inline-flex items-center gap-x-1.5 text-xs font-medium rounded-full ${style.badge}`}>
        <span className={`size-1.5 inline-block rounded-full ${style.dot}`}></span>
        {paymentStatus}
      </span>
    );
  };

  const ActionsCellRenderer = (props: { data: Invoice }) => {
    const invoice = props.data;

    const handleDelete = async () => {
      if (!confirm('Are you sure you want to delete this invoice?')) return;
      setIsDeleting(invoice.id);
      const result = await deleteInvoice(invoice.id);
      if (result.success) {
        router.refresh();
      }
      setIsDeleting(null);
    };

    const handleDuplicate = async () => {
      const result = await duplicateInvoice(invoice.id);
      if (result.success) {
        router.refresh();
      }
    };

    return (
      <div className="hs-dropdown [--auto-close:inside] [--placement:bottom-right] relative inline-flex">
        <button
          type="button"
          className="size-7 inline-flex justify-center items-center gap-x-2 rounded-lg border border-stone-200 bg-white text-stone-800 shadow-2xs hover:bg-stone-50 disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden focus:bg-stone-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
          disabled={isDeleting === invoice.id}
          data-hs-dropdown-auto-close="inside"
        >
          <svg className="shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
          </svg>
        </button>

        <div className="hs-dropdown-menu hs-dropdown-open:opacity-100 w-24 transition-[opacity,margin] duration opacity-0 hidden z-10 bg-white rounded-xl shadow-xl dark:bg-neutral-900" role="menu">
          <div className="p-1">
            <button type="button" onClick={() => onEdit(invoice)} className="w-full flex items-center gap-x-3 py-1.5 px-2 rounded-lg text-[13px] text-stone-800 hover:bg-stone-100 dark:text-neutral-300 dark:hover:bg-neutral-800">
              Edit
            </button>
            <button type="button" onClick={handleDuplicate} className="w-full flex items-center gap-x-3 py-1.5 px-2 rounded-lg text-[13px] text-stone-800 hover:bg-stone-100 dark:text-neutral-300 dark:hover:bg-neutral-800">
              Duplicate
            </button>
            <div className="my-1 border-t border-stone-200 dark:border-neutral-800"></div>
            <button type="button" onClick={handleDelete} className="w-full flex items-center gap-x-3 py-1.5 px-2 rounded-lg text-[13px] text-stone-800 hover:bg-stone-100 dark:text-neutral-300 dark:hover:bg-neutral-800">
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Column Definitions with Preline Pro styling
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerCheckboxSelection: true,
        checkboxSelection: true,
        width: 50,
        pinned: 'left',
        headerClass: 'px-3 py-2.5',
        cellClass: 'px-3 py-4'
      },
      {
        field: 'invoice_number',
        headerName: 'Order',
        width: 120,
        cellRenderer: OrderNumberRenderer,
        headerClass: 'text-stone-500',
        cellClass: 'px-4 py-1'
      },
      {
        field: 'items',
        headerName: 'Purchased',
        width: 200,
        valueFormatter: (params) => {
          // Simulate product names
          const products = ['Calvin Klein T-shirts', 'Maroon Wedges', 'Pattern Winter Sweater', 'White Blazer by Armani'];
          return products[Math.floor(Math.random() * products.length)];
        },
        cellClass: 'px-4 py-1 text-sm text-stone-600 dark:text-neutral-400'
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 180,
        cellRenderer: StatusCellRenderer,
        cellClass: 'px-4 py-1'
      },
      {
        field: 'customer_name',
        headerName: 'Customer',
        width: 180,
        cellClass: 'px-4 py-1 text-sm text-stone-600 dark:text-neutral-400'
      },
      {
        field: 'payment_method',
        headerName: 'Payment method',
        width: 165,
        cellRenderer: PaymentMethodRenderer,
        cellClass: 'px-4 py-1'
      },
      {
        field: 'status',
        headerName: 'Payment status',
        width: 155,
        cellRenderer: PaymentStatusRenderer,
        cellClass: 'px-4 py-1'
      },
      {
        field: 'items',
        headerName: 'Items',
        width: 80,
        valueFormatter: () => Math.floor(Math.random() * 9) + 1,
        cellClass: 'px-4 py-1 text-sm text-stone-600 dark:text-neutral-400'
      },
      {
        headerName: '',
        width: 80,
        cellRenderer: ActionsCellRenderer,
        sortable: false,
        filter: false,
        pinned: 'right',
        cellClass: 'px-4 py-1 text-end'
      }
    ],
    [onEdit, ActionsCellRenderer]
  );

  // Filter data based on search and tab
  const filteredInvoices = useMemo(() => {
    let filtered = invoices;

    // Tab filtering (simulated since we don't have archived/publish data)
    if (activeTab === 'archived') {
      filtered = []; // Empty for demo
    } else if (activeTab === 'publish') {
      filtered = []; // Empty for demo
    } else if (activeTab === 'unpublish') {
      filtered = []; // Empty for demo
    }

    // Search filtering
    if (searchQuery) {
      filtered = filtered.filter((invoice) => {
        return invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
               invoice.customer_name.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    return filtered;
  }, [invoices, activeTab, searchQuery]);

  // Calculate visible columns count for filter badge
  const visibleColumnsCount = Object.values(filterColumns).filter(Boolean).length;

  // Empty state component
  const EmptyState = () => (
    <div className="p-5 flex flex-col justify-center items-center text-center">
      <svg className="w-48 mx-auto mb-4" width="178" height="90" viewBox="0 0 178 90" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="27" y="50.5" width="124" height="39" rx="7.5" fill="currentColor" className="fill-white dark:fill-neutral-800"/>
        <rect x="27" y="50.5" width="124" height="39" rx="7.5" stroke="currentColor" className="stroke-stone-50 dark:stroke-neutral-700/10"/>
        <rect x="34.5" y="58" width="24" height="24" rx="4" fill="currentColor" className="fill-stone-50 dark:fill-neutral-700/30"/>
        <rect x="66.5" y="61" width="60" height="6" rx="3" fill="currentColor" className="fill-stone-50 dark:fill-neutral-700/30"/>
        <rect x="66.5" y="73" width="77" height="6" rx="3" fill="currentColor" className="fill-stone-50 dark:fill-neutral-700/30"/>
      </svg>
      <div className="max-w-sm mx-auto">
        <p className="mt-2 font-medium text-stone-800 dark:text-neutral-200">
          Your data will appear here soon.
        </p>
        <p className="mb-5 text-sm text-stone-500 dark:text-neutral-500">
          In the meantime, you can create new custom insights to monitor your most important metrics.
        </p>
      </div>
      <button className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-stone-200 bg-white text-stone-800 shadow-2xs hover:bg-stone-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-700">
        Learn more
      </button>
    </div>
  );

  return (
    <div className="p-5 space-y-4 flex flex-col bg-white border border-stone-200 shadow-2xs rounded-xl dark:bg-neutral-800 dark:border-neutral-700">
      {/* Tab Navigation */}
      <nav className="flex gap-1 relative after:absolute after:bottom-0 after:inset-x-0 after:border-b-2 after:border-stone-200 dark:after:border-neutral-700" role="tablist">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-2.5 py-1.5 mb-2 relative inline-flex justify-center items-center gap-x-2 hover:bg-stone-100 text-sm rounded-lg focus:outline-hidden focus:bg-stone-100 after:absolute after:-bottom-2 after:inset-x-0 after:z-10 after:h-0.5 after:pointer-events-none dark:hover:bg-neutral-700 dark:focus:bg-neutral-700 ${
            activeTab === 'all'
              ? 'text-stone-800 after:bg-stone-800 dark:text-neutral-200 dark:after:bg-neutral-400'
              : 'text-stone-500 dark:text-neutral-500 hover:text-stone-800 dark:hover:text-neutral-300'
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('archived')}
          className={`px-2.5 py-1.5 mb-2 relative inline-flex justify-center items-center gap-x-2 hover:bg-stone-100 text-sm rounded-lg focus:outline-hidden focus:bg-stone-100 after:absolute after:-bottom-2 after:inset-x-0 after:z-10 after:h-0.5 after:pointer-events-none dark:hover:bg-neutral-700 dark:focus:bg-neutral-700 ${
            activeTab === 'archived'
              ? 'text-stone-800 after:bg-stone-800 dark:text-neutral-200 dark:after:bg-neutral-400'
              : 'text-stone-500 dark:text-neutral-500 hover:text-stone-800 dark:hover:text-neutral-300'
          }`}
        >
          Archived
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('publish')}
          className={`px-2.5 py-1.5 mb-2 relative inline-flex justify-center items-center gap-x-2 hover:bg-stone-100 text-sm rounded-lg focus:outline-hidden focus:bg-stone-100 after:absolute after:-bottom-2 after:inset-x-0 after:z-10 after:h-0.5 after:pointer-events-none dark:hover:bg-neutral-700 dark:focus:bg-neutral-700 ${
            activeTab === 'publish'
              ? 'text-stone-800 after:bg-stone-800 dark:text-neutral-200 dark:after:bg-neutral-400'
              : 'text-stone-500 dark:text-neutral-500 hover:text-stone-800 dark:hover:text-neutral-300'
          }`}
        >
          Publish
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('unpublish')}
          className={`px-2.5 py-1.5 mb-2 relative inline-flex justify-center items-center gap-x-2 hover:bg-stone-100 text-sm rounded-lg focus:outline-hidden focus:bg-stone-100 after:absolute after:-bottom-2 after:inset-x-0 after:z-10 after:h-0.5 after:pointer-events-none dark:hover:bg-neutral-700 dark:focus:bg-neutral-700 ${
            activeTab === 'unpublish'
              ? 'text-stone-800 after:bg-stone-800 dark:text-neutral-200 dark:after:bg-neutral-400'
              : 'text-stone-500 dark:text-neutral-500 hover:text-stone-800 dark:hover:text-neutral-300'
          }`}
        >
          Unpublish
        </button>
      </nav>

      {/* Filter Group */}
      <div className="grid md:grid-cols-2 gap-y-2 md:gap-y-0 md:gap-x-5">
        <div>
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center pointer-events-none z-20 ps-3.5">
              <svg className="shrink-0 size-4 text-stone-500 dark:text-neutral-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-1.5 sm:py-2 ps-10 pe-8 block w-full min-w-75 bg-stone-100 border-transparent rounded-lg sm:text-sm placeholder:text-stone-500 focus:bg-white focus:border-green-500 focus:ring-green-600 dark:bg-neutral-700 dark:border-transparent dark:text-neutral-400 dark:placeholder:text-neutral-400 dark:focus:bg-neutral-800 dark:focus:ring-neutral-600"
              placeholder="Search orders"
            />
          </div>
        </div>

        <div className="flex md:justify-end items-center gap-x-2">
          {/* Calendar Dropdown */}
          <div className="relative inline-flex">
            <button
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="py-[9px] px-2.5 inline-flex items-center gap-x-1.5 text-xs font-medium rounded-lg border border-stone-200 bg-white text-stone-800 shadow-2xs hover:bg-stone-50 focus:outline-hidden focus:bg-stone-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
            >
              {dateRange.start} - {dateRange.end}
              <svg className="shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
          </div>

          {/* Filter Dropdown */}
          <div className="relative inline-flex">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="py-[9px] px-2.5 inline-flex items-center gap-x-1.5 text-xs font-medium rounded-lg border border-stone-200 bg-white text-stone-800 shadow-2xs hover:bg-stone-50 focus:outline-hidden focus:bg-stone-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
            >
              <svg className="shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/>
              </svg>
              Filter
              <span className="font-medium text-[10px] py-0.5 px-[5px] bg-stone-800 text-white leading-3 rounded-full dark:bg-neutral-500">
                {visibleColumnsCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* AG Grid or Empty State */}
      {filteredInvoices.length > 0 ? (
        <>
          {/* AG Grid Table */}
          <div className="overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-stone-100 [&::-webkit-scrollbar-thumb]:bg-stone-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
            <div
              className={`${theme === 'dark' ? 'ag-theme-quartz-dark' : 'ag-theme-quartz'} ag-preline-pro`}
              style={{ height: 600, width: '100%' }}
            >
              <AgGridReact
                ref={gridRef}
                rowData={filteredInvoices}
                columnDefs={columnDefs}
                pagination={true}
                paginationPageSize={12}
                domLayout="normal"
                animateRows={true}
                rowSelection="multiple"
                suppressRowClickSelection={true}
                enableCellTextSelection={true}
                ensureDomOrder={true}
                theme="legacy"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-5 flex flex-wrap justify-between items-center gap-2">
            <p className="text-sm text-stone-800 dark:text-neutral-200">
              <span className="font-medium">{filteredInvoices.length}</span>
              <span className="text-stone-500 dark:text-neutral-500"> results</span>
            </p>

            {/* Custom Pagination matching Preline Pro */}
            <nav className="flex justify-end items-center gap-x-1" aria-label="Pagination">
              <button
                type="button"
                className="min-h-9.5 min-w-9.5 py-2 px-2.5 inline-flex justify-center items-center gap-x-2 text-sm rounded-lg text-stone-800 hover:bg-stone-100 focus:outline-hidden focus:bg-stone-100 dark:text-white dark:hover:bg-white/10 dark:focus:bg-neutral-700"
                onClick={() => {
                  const api = gridRef.current?.api;
                  if (api && api.paginationGetCurrentPage() > 0) {
                    api.paginationGoToPreviousPage();
                  }
                }}
              >
                <svg className="shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </button>
              <div className="flex items-center gap-x-1">
                <span className="min-h-9.5 min-w-9.5 flex justify-center items-center bg-stone-100 text-stone-800 py-2 px-3 text-sm rounded-lg dark:bg-neutral-700 dark:text-white">
                  {(gridRef.current?.api?.paginationGetCurrentPage() || 0) + 1}
                </span>
                <span className="min-h-9.5 flex justify-center items-center text-stone-500 py-2 px-1.5 text-sm dark:text-neutral-500">of</span>
                <span className="min-h-9.5 flex justify-center items-center text-stone-500 py-2 px-1.5 text-sm dark:text-neutral-500">
                  {gridRef.current?.api?.paginationGetTotalPages() || 1}
                </span>
              </div>
              <button
                type="button"
                className="min-h-9.5 min-w-9.5 py-2 px-2.5 inline-flex justify-center items-center gap-x-2 text-sm rounded-lg text-stone-800 hover:bg-stone-100 focus:outline-hidden focus:bg-stone-100 dark:text-white dark:hover:bg-white/10 dark:focus:bg-neutral-700"
                onClick={() => {
                  const api = gridRef.current?.api;
                  if (api && api.paginationGetCurrentPage() < api.paginationGetTotalPages() - 1) {
                    api.paginationGoToNextPage();
                  }
                }}
              >
                <svg className="shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            </nav>
          </div>
        </>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}