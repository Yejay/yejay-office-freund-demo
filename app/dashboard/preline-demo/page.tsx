'use client';

import { useState, useEffect, Suspense } from 'react';
import { Invoice } from '@/lib/types/invoice';
import { InvoiceTablePrelinePro } from '@/components/invoices/invoice-table-preline-pro';
import { InvoiceTableAgGrid } from '@/components/invoices/invoice-table-ag-grid';
import { InvoiceDialog } from '@/components/invoices/invoice-dialog';
import { getInvoices } from '@/app/actions/invoices';

// Import the new Preline Pro theme CSS
import '@/app/ag-grid-preline-pro-theme.css';

function PrelineDemoContent() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showComparison, setShowComparison] = useState(false);

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

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedInvoice(null);
      loadInvoices();
    }
  };

  return (
    <div className="p-6 space-y-8 bg-gray-50 dark:bg-neutral-900 min-h-screen">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-neutral-200">
          Preline Pro AG-Grid Integration Demo
        </h1>
        <p className="text-gray-500 dark:text-neutral-400">
          Demonstrating AG-Grid with Preline Pro&apos;s Advanced Table styling
        </p>

        {/* Toggle Comparison View */}
        <div className="flex items-center gap-4 pt-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showComparison}
              onChange={(e) => setShowComparison(e.target.checked)}
              className="shrink-0 border-stone-300 rounded-sm text-green-600 focus:ring-green-600"
            />
            <span className="text-sm text-gray-600 dark:text-neutral-400">
              Show side-by-side comparison
            </span>
          </label>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : showComparison ? (
        <div className="space-y-8">
          {/* New Preline Pro Implementation */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-neutral-200">
              New: Preline Pro Styled AG-Grid
            </h2>
            <p className="text-sm text-gray-500 dark:text-neutral-400">
              AG-Grid with Preline Pro&apos;s &quot;Advanced with Searchable Filter Bar&quot; design
            </p>
            <InvoiceTablePrelinePro
              invoices={invoices}
              onEdit={handleEdit}
            />
          </div>

          {/* Current Implementation */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-neutral-200">
              Current: Original AG-Grid
            </h2>
            <p className="text-sm text-gray-500 dark:text-neutral-400">
              Current AG-Grid implementation with custom theme
            </p>
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 dark:bg-neutral-800 dark:border-neutral-700">
              <InvoiceTableAgGrid
                invoices={invoices}
                onEdit={handleEdit}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Show only new implementation */
        <InvoiceTablePrelinePro
          invoices={invoices}
          onEdit={handleEdit}
        />
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

export default function PrelineDemo() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PrelineDemoContent />
    </Suspense>
  );
}