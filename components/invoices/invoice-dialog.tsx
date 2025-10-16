'use client';

import { useState, useEffect } from 'react';
import {
  Invoice,
  InvoiceItem,
  InvoiceStatus,
  PaymentMethod,
  validateCreateInvoice,
  validateUpdateInvoice,
  formatZodErrors,
} from '@/lib/types/invoice';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createInvoice, updateInvoice } from '@/app/actions/invoices';
import { useRouter } from 'next/navigation';
import { Plus, X, AlertCircle } from 'lucide-react';

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: Invoice | null;
}

export function InvoiceDialog({ open, onOpenChange, invoice }: InvoiceDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoCalcAmount, setAutoCalcAmount] = useState(true);

  // ============================================================================
  // Validation Errors State
  // ============================================================================
  // Stores field-specific validation errors from Zod
  // Example: { customer_name: 'Customer name is required', amount: 'Amount must be positive' }
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    amount: '',
    status: 'pending' as InvoiceStatus,
    due_date: '',
    issue_date: new Date().toISOString().split('T')[0],
    payment_method: '' as PaymentMethod | '',
    notes: '',
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { name: '', quantity: 1, price: 0 },
  ]);

  useEffect(() => {
    // Clear validation errors when dialog opens/closes
    setValidationErrors({});

    if (invoice) {
      setFormData({
        customer_name: invoice.customer_name,
        customer_email: invoice.customer_email || '',
        amount: invoice.amount.toString(),
        status: invoice.status,
        due_date: invoice.due_date,
        issue_date: invoice.issue_date,
        payment_method: invoice.payment_method || '',
        notes: invoice.notes || '',
      });
      setItems(invoice.items.length > 0 ? invoice.items : [{ name: '', quantity: 1, price: 0 }]);
      setAutoCalcAmount(true);
    } else {
      // Reset form for new invoice
      setFormData({
        customer_name: '',
        customer_email: '',
        amount: '',
        status: 'pending',
        due_date: '',
        issue_date: new Date().toISOString().split('T')[0],
        payment_method: '',
        notes: '',
      });
      setItems([{ name: '', quantity: 1, price: 0 }]);
      setAutoCalcAmount(true);
    }
  }, [invoice, open]);

  // Calculate total from items
  useEffect(() => {
    if (!autoCalcAmount) return;
    const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    setFormData((prev) => ({ ...prev, amount: total.toFixed(2) }));
  }, [items, autoCalcAmount]);

  const addItem = () => {
    setItems([...items, { name: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  // ============================================================================
  // Helper: Get error message for a field
  // ============================================================================
  const getFieldError = (fieldName: string) => {
    return validationErrors[fieldName];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setValidationErrors({}); // Clear previous errors

    // ============================================================================
    // STEP 1: Prepare invoice data
    // ============================================================================
    const invoiceData = {
      customer_name: formData.customer_name,
      customer_email: formData.customer_email || undefined,
      amount: parseFloat(formData.amount),
      status: formData.status,
      due_date: formData.due_date,
      issue_date: formData.issue_date,
      items: items.filter((item) => item.name.trim() !== ''),
      payment_method: formData.payment_method || undefined,
      notes: formData.notes || undefined,
    };

    // ============================================================================
    // STEP 2: Client-side validation with Zod
    // ============================================================================
    // Validate BEFORE sending to server
    // This gives immediate feedback to the user
    const validation = invoice
      ? validateUpdateInvoice({ id: invoice.id, ...invoiceData })
      : validateCreateInvoice(invoiceData);

    if (!validation.success) {
      // Show validation errors to the user
      const errors = formatZodErrors(validation.error);
      setValidationErrors(errors);
      setIsSubmitting(false);
      return; // Stop here, don't submit to server
    }

    // ============================================================================
    // STEP 3: Submit to server
    // ============================================================================
    let result;
    if (invoice) {
      result = await updateInvoice({ id: invoice.id, ...invoiceData });
    } else {
      result = await createInvoice(invoiceData);
    }

    // ============================================================================
    // STEP 4: Handle result
    // ============================================================================
    if (result.success) {
      // Success! Close dialog and refresh
      onOpenChange(false);
      router.refresh();
    } else {
      // Server-side validation failed or database error
      // Display errors from server
      if (result.validationErrors) {
        setValidationErrors(result.validationErrors);
      } else {
        alert('Failed to save invoice: ' + result.error);
      }
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{invoice ? 'Edit Invoice' : 'Create New Invoice'}</DialogTitle>
          <DialogDescription>
            {invoice ? 'Update invoice details' : 'Fill in the details to create a new invoice'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_name">Customer Name *</Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) =>
                  setFormData({ ...formData, customer_name: e.target.value })
                }
                required
                className={getFieldError('customer_name') ? 'border-red-500' : ''}
              />
              {getFieldError('customer_name') && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError('customer_name')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_email">Customer Email</Label>
              <Input
                id="customer_email"
                type="email"
                value={formData.customer_email}
                onChange={(e) =>
                  setFormData({ ...formData, customer_email: e.target.value })
                }
                className={getFieldError('customer_email') ? 'border-red-500' : ''}
              />
              {getFieldError('customer_email') && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError('customer_email')}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issue_date">Issue Date *</Label>
              <Input
                id="issue_date"
                type="date"
                value={formData.issue_date}
                onChange={(e) =>
                  setFormData({ ...formData, issue_date: e.target.value })
                }
                required
                className={getFieldError('issue_date') ? 'border-red-500' : ''}
              />
              {getFieldError('issue_date') && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError('issue_date')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date *</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) =>
                  setFormData({ ...formData, due_date: e.target.value })
                }
                required
                className={getFieldError('due_date') ? 'border-red-500' : ''}
              />
              {getFieldError('due_date') && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError('due_date')}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Line Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Item name"
                    value={item.name}
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, 'quantity', parseInt(e.target.value) || 0)
                    }
                    className="w-20"
                    min="1"
                  />
                  <Input
                    type="number"
                    placeholder="Price"
                    value={item.price}
                    onChange={(e) =>
                      updateItem(index, 'price', parseFloat(e.target.value) || 0)
                    }
                    className="w-28"
                    step="0.01"
                    min="0"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            {getFieldError('items') && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {getFieldError('items')}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as InvoiceStatus })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) =>
                  setFormData({ ...formData, payment_method: value as PaymentMethod })
                }
              >
                <SelectTrigger id="payment_method">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Total Amount *</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => {
                setFormData({ ...formData, amount: e.target.value });
                setAutoCalcAmount(false);
              }}
              step="0.01"
              min="0"
              required
              className={getFieldError('amount') ? 'border-red-500' : ''}
            />
            {getFieldError('amount') && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {getFieldError('amount')}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : invoice ? 'Update Invoice' : 'Create Invoice'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
