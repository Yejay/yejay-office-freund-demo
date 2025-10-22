'use client';

import { useState, useEffect, Suspense } from 'react';
import { Invoice } from '@/lib/types/invoice';
// Using AG Grid table instead of the basic table component
import { InvoiceTableAgGrid } from '@/components/invoices/invoice-table-ag-grid';
import { InvoiceDialog } from '@/components/invoices/invoice-dialog';
import { Plus, FileText, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { getInvoices } from '@/app/actions/invoices';
import { useRouter, useSearchParams } from 'next/navigation';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setIsLoading(true);
    try {
      const data = await getInvoices();
      setInvoices(data);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Open create dialog if ?new=invoice is present (e.g., from command palette)
  useEffect(() => {
    const shouldOpen = searchParams.get('new') === 'invoice';
    if (shouldOpen) {
      setSelectedInvoice(null);
      setDialogOpen(true);
      // Remove the query param to avoid reopening on back/forward
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.delete('new');
      const next = params.toString();
      router.replace(next ? `/dashboard?${next}` : '/dashboard');
    }
  }, [searchParams, router]);

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedInvoice(null);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedInvoice(null);
      loadInvoices();
    }
  };

  // Calculate statistics
  const stats = {
    total: invoices.length,
    totalAmount: invoices.reduce((sum, inv) => sum + inv.amount, 0),
    paid: invoices.filter((inv) => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0),
    pending: invoices.filter((inv) => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0),
    overdue: invoices.filter((inv) => inv.status === 'overdue').length,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-neutral-200">Invoices</h1>
          <p className="text-gray-500 dark:text-neutral-400 mt-1">
            Manage and track your invoices
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none shadow-sm"
        >
          <Plus className="h-4 w-4" />
          New Invoice
        </button>
      </div>

      {/* Stats Cards */}
      {!isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 dark:bg-neutral-800 dark:border-neutral-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500 dark:text-neutral-400">Total Invoices</h3>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-800 dark:text-neutral-200">{stats.total}</div>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
              {formatCurrency(stats.totalAmount)} total value
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 dark:bg-neutral-800 dark:border-neutral-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500 dark:text-neutral-400">Paid</h3>
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(stats.paid)}
            </div>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
              {invoices.filter((inv) => inv.status === 'paid').length} invoices
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 dark:bg-neutral-800 dark:border-neutral-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500 dark:text-neutral-400">Pending</h3>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(stats.pending)}
            </div>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
              {invoices.filter((inv) => inv.status === 'pending').length} invoices
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 dark:bg-neutral-800 dark:border-neutral-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500 dark:text-neutral-400">Overdue</h3>
              <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.overdue}</div>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
              Requires immediate attention
            </p>
          </div>
        </div>
      )}

      {/* Invoice Table */}
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-500 dark:text-neutral-400">Loading invoices...</div>
        </div>
      ) : (
        <InvoiceTableAgGrid invoices={invoices} onEdit={handleEdit} />
      )}

      {/* Invoice Dialog */}
      <InvoiceDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        invoice={selectedInvoice}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 dark:text-neutral-400">Loading...</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
