'use client';

/**
 * AG Grid Invoice Table Component
 *
 * This component uses AG Grid (https://www.ag-grid.com/) for advanced table features.
 * AG Grid is a powerful data grid used by Fortune 500 companies.
 *
 * Key Features:
 * - Sortable columns (click headers to sort)
 * - Column resizing & reordering (drag column edges/headers)
 * - Pagination (built-in)
 * - Filtering (per-column or global search)
 * - Export to CSV/Excel
 * - Row selection
 * - Responsive design
 *
 * Why AG Grid?
 * - Professional-grade data grid
 * - Handles large datasets efficiently (virtual scrolling)
 * - Rich feature set out of the box
 * - Highly customizable
 */

import { useState, useMemo, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ModuleRegistry } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import { Invoice, InvoiceStatus } from '@/lib/types/invoice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, MoreHorizontal, Edit, Copy, Trash2, Download } from 'lucide-react';
import { format } from 'date-fns';
import { deleteInvoice, duplicateInvoice } from '@/app/actions/invoices';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

// Import AG Grid styles
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

// Import Preline-themed AG Grid styling
// This custom theme makes AG Grid match Preline's official table design patterns
import '@/app/ag-grid-preline-theme.css';

// ============================================================================
// Register AG Grid Modules
// ============================================================================
// AG Grid v31+ requires explicit module registration
// This gives access to all Community features (sorting, filtering, pagination, export, etc.)
ModuleRegistry.registerModules([AllCommunityModule]);

interface InvoiceTableAgGridProps {
  invoices: Invoice[];
  onEdit: (invoice: Invoice) => void;
}

const statusColors: Record<InvoiceStatus, string> = {
  paid: 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
  pending: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
  overdue: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
  cancelled: 'bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800',
};

export function InvoiceTableAgGrid({ invoices, onEdit }: InvoiceTableAgGridProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const gridRef = useRef<AgGridReact>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // ============================================================================
  // Custom Cell Renderers
  // ============================================================================
  // AG Grid lets you customize how cells are displayed using "cell renderers"

  /**
   * Status Badge Renderer
   * Shows colored badges for invoice status
   */
  const StatusCellRenderer = (props: { value: InvoiceStatus }) => {
    return (
      <Badge variant="secondary" className={statusColors[props.value]}>
        {props.value.charAt(0).toUpperCase() + props.value.slice(1)}
      </Badge>
    );
  };

  /**
   * Customer Cell Renderer
   * Shows customer name and email in a stacked layout
   */
  const CustomerCellRenderer = (props: { data: Invoice }) => {
    return (
      <div>
        <div className="font-medium">{props.data.customer_name}</div>
        {props.data.customer_email && (
          <div className="text-sm text-muted-foreground">{props.data.customer_email}</div>
        )}
      </div>
    );
  };

  /**
   * Currency Renderer
   * Formats numbers as USD currency
   */
  const CurrencyRenderer = (props: { value: number }) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(props.value);
  };

  /**
   * Date Renderer
   * Formats dates in a readable format
   */
  const DateRenderer = (props: { value: string }) => {
    return format(new Date(props.value), 'MMM dd, yyyy');
  };

  /**
   * Actions Cell Renderer
   * Shows edit/duplicate/delete dropdown menu
   */
  const ActionsCellRenderer = (props: { data: Invoice }) => {
    const invoice = props.data;

    const handleDelete = async () => {
      if (!confirm('Are you sure you want to delete this invoice?')) return;

      setIsDeleting(invoice.id);
      const result = await deleteInvoice(invoice.id);

      if (result.success) {
        router.refresh();
      } else {
        alert('Failed to delete invoice: ' + result.error);
      }
      setIsDeleting(null);
    };

    const handleDuplicate = async () => {
      const result = await duplicateInvoice(invoice.id);

      if (result.success) {
        router.refresh();
      } else {
        alert('Failed to duplicate invoice: ' + result.error);
      }
    };

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={isDeleting === invoice.id}
            onClick={(e) => e.stopPropagation()} // Prevent row selection
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(invoice)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete} className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // ============================================================================
  // Column Definitions
  // ============================================================================
  // Define how each column should be displayed and behave

  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        field: 'invoice_number',
        headerName: 'Invoice',
        width: 150,
        sortable: true,
        filter: true,
        pinned: 'left', // Pin to left side (always visible when scrolling)
        cellStyle: { fontWeight: 600 }, // Make text bold
      },
      {
        field: 'customer_name',
        headerName: 'Customer',
        width: 300,
        sortable: true,
        filter: true,
        cellRenderer: CustomerCellRenderer,
        autoHeight: true,
        wrapText: true,
      },
      {
        field: 'amount',
        headerName: 'Amount',
        width: 150,
        sortable: true,
        filter: 'agNumberColumnFilter',
        cellRenderer: CurrencyRenderer,
        type: 'rightAligned', // Right-align numbers
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 140,
        sortable: true,
        filter: true,
        cellRenderer: StatusCellRenderer,
      },
      {
        field: 'due_date',
        headerName: 'Due Date',
        width: 150,
        sortable: true,
        filter: 'agDateColumnFilter',
        cellRenderer: DateRenderer,
      },
      {
        field: 'payment_method',
        headerName: 'Payment Method',
        width: 170,
        sortable: true,
        filter: true,
        valueFormatter: (params) => {
          if (!params.value) return '-';
          return params.value.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
        },
      },
      {
        headerName: 'Actions',
        width: 100,
        cellRenderer: ActionsCellRenderer,
        sortable: false,
        filter: false,
        pinned: 'right', // Pin to right side
      },
    ],
    [onEdit, ActionsCellRenderer]
  );

  // ============================================================================
  // Filtering Logic
  // ============================================================================
  // Filter invoices based on search query and status filter

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.customer_email?.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, statusFilter]);

  // ============================================================================
  // Stats Calculation
  // ============================================================================
  const stats = useMemo(() => ({
    all: invoices.length,
    paid: invoices.filter((i) => i.status === 'paid').length,
    pending: invoices.filter((i) => i.status === 'pending').length,
    overdue: invoices.filter((i) => i.status === 'overdue').length,
  }), [invoices]);

  // ============================================================================
  // Export Functionality
  // ============================================================================
  const handleExportCSV = useCallback(() => {
    gridRef.current?.api.exportDataAsCsv({
      fileName: `invoices-${new Date().toISOString().split('T')[0]}.csv`,
    });
  }, []);

  // ============================================================================
  // Grid Defaults
  // ============================================================================
  const defaultColDef = useMemo<ColDef>(() => ({
    resizable: true, // Allow column resizing
    sortable: true, // Enable sorting by default
    filter: true, // Enable filtering by default
  }), []);

  // ============================================================================
  // Total Calculation
  // ============================================================================
  const totalAmount = useMemo(() => {
    return filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  }, [filteredInvoices]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Tabs
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}
          >
            <TabsList>
              <TabsTrigger value="all">All ({stats.all})</TabsTrigger>
              <TabsTrigger value="paid">Paid ({stats.paid})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
              <TabsTrigger value="overdue">Overdue ({stats.overdue})</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* AG Grid Table */}
      <div
        className={theme === 'dark' ? 'ag-theme-quartz-dark' : 'ag-theme-quartz'}
        style={{ height: 600, width: '100%' }}
      >
        <AgGridReact
          ref={gridRef}
          rowData={filteredInvoices}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={20}
          paginationPageSizeSelector={[10, 20, 50, 100]}
          domLayout="normal"
          animateRows={true}
          rowSelection="multiple"
          suppressRowClickSelection={true}
          enableCellTextSelection={true}
          ensureDomOrder={true}
          theme="legacy"
        />
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {filteredInvoices.length} of {invoices.length} invoices
        </div>
        <div>Total: {formatCurrency(totalAmount)}</div>
      </div>
    </div>
  );
}
