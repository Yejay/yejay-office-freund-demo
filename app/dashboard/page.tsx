'use client';

import { useState, useEffect } from 'react';
import { Invoice } from '@/lib/types/invoice';
// Using AG Grid table instead of the basic table component
import { InvoiceTableAgGrid } from '@/components/invoices/invoice-table-ag-grid';
import { InvoiceDialog } from '@/components/invoices/invoice-dialog';
import { Button } from '@/components/ui/button';
import { Plus, FileText, DollarSign, Clock, AlertCircle, Home, CreditCard, Table2, Grid3x3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getInvoices } from '@/app/actions/invoices';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your invoices
          </p>
        </div>
        <Button onClick={handleCreate} size="lg" className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          New Invoice
        </Button>
      </div>

      {/* Navigation Links */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="gap-2 bg-primary/10">
                <FileText className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/billing">
              <Button variant="outline" className="gap-2">
                <CreditCard className="h-4 w-4" />
                Billing
              </Button>
            </Link>
            <Link href="/examples/ag-grid">
              <Button variant="outline" className="gap-2">
                <Grid3x3 className="h-4 w-4" />
                AG Grid Example
              </Button>
            </Link>
            <Link href="/test-grid">
              <Button variant="outline" className="gap-2">
                <Table2 className="h-4 w-4" />
                Test Grid
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      {!isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Invoices</CardTitle>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(stats.totalAmount)} total value
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Paid</CardTitle>
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(stats.paid)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {invoices.filter((inv) => inv.status === 'paid').length} invoices
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(stats.pending)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {invoices.filter((inv) => inv.status === 'pending').length} invoices
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
              <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.overdue}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Requires immediate attention
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Invoice Table */}
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-muted-foreground">Loading invoices...</div>
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
