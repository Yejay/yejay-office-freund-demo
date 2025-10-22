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

  // Programmatically control HSOverlay based on `open` prop
  useEffect(() => {
    if (typeof window !== 'undefined' && window.HSOverlay) {
      if (open) {
        window.HSOverlay.open('#invoice-dialog-modal');
      } else {
        window.HSOverlay.close('#invoice-dialog-modal');
      }
    }
  }, [open]);

  return (
    <div
      id="invoice-dialog-modal"
      className="hs-overlay hs-overlay-backdrop-open:backdrop-blur-sm hidden size-full fixed top-0 start-0 z-[80] overflow-x-hidden overflow-y-auto pointer-events-none"
      role="dialog"
      tabIndex={-1}
      aria-label="Invoice Dialog"
    >
      <div className="hs-overlay-open:opacity-100 hs-overlay-open:duration-500 ease-out transition-all sm:max-w-2xl sm:w-full m-3 sm:mx-auto">
        <div className="flex flex-col bg-white border shadow-sm rounded-xl pointer-events-auto dark:bg-neutral-800 dark:border-neutral-700 dark:shadow-neutral-700/70">
          {/* Header */}
          <div className="flex justify-between items-center py-3 px-4 border-b dark:border-neutral-700">
            <h3 className="font-bold text-gray-800 dark:text-white">
              {invoice ? 'Edit Invoice' : 'Create New Invoice'}
            </h3>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-8 inline-flex justify-center items-center gap-x-2 rounded-full border border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:bg-gray-200 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:text-neutral-400 dark:focus:bg-neutral-600"
            >
              <X className="shrink-0 size-4" />
            </button>
          </div>
          {/* End Header */}

          {/* Body */}
          <div className="p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
            <p className="text-sm text-gray-500 dark:text-neutral-400 mb-4">
              {invoice ? 'Update invoice details' : 'Fill in the details to create a new invoice'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 dark:text-neutral-300">
                Customer Name *
              </label>
              <input
                type="text"
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) =>
                  setFormData({ ...formData, customer_name: e.target.value })
                }
                required
                className={`py-2 px-3 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600 ${
                  getFieldError('customer_name') ? 'border-red-500' : ''
                }`}
              />
              {getFieldError('customer_name') && (
                <p className="text-sm text-red-600 flex items-center gap-1 dark:text-red-400">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError('customer_name')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="customer_email" className="block text-sm font-medium text-gray-700 dark:text-neutral-300">
                Customer Email
              </label>
              <input
                type="email"
                id="customer_email"
                value={formData.customer_email}
                onChange={(e) =>
                  setFormData({ ...formData, customer_email: e.target.value })
                }
                className={`py-2 px-3 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600 ${
                  getFieldError('customer_email') ? 'border-red-500' : ''
                }`}
              />
              {getFieldError('customer_email') && (
                <p className="text-sm text-red-600 flex items-center gap-1 dark:text-red-400">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError('customer_email')}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="issue_date" className="block text-sm font-medium text-gray-700 dark:text-neutral-300">
                Issue Date *
              </label>
              <input
                type="date"
                id="issue_date"
                value={formData.issue_date}
                onChange={(e) =>
                  setFormData({ ...formData, issue_date: e.target.value })
                }
                required
                className={`py-2 px-3 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600 ${
                  getFieldError('issue_date') ? 'border-red-500' : ''
                }`}
              />
              {getFieldError('issue_date') && (
                <p className="text-sm text-red-600 flex items-center gap-1 dark:text-red-400">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError('issue_date')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 dark:text-neutral-300">
                Due Date *
              </label>
              <input
                type="date"
                id="due_date"
                value={formData.due_date}
                onChange={(e) =>
                  setFormData({ ...formData, due_date: e.target.value })
                }
                required
                className={`py-2 px-3 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600 ${
                  getFieldError('due_date') ? 'border-red-500' : ''
                }`}
              />
              {getFieldError('due_date') && (
                <p className="text-sm text-red-600 flex items-center gap-1 dark:text-red-400">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError('due_date')}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300">
                Line Items
              </label>
              <button
                type="button"
                onClick={addItem}
                className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Item name"
                    value={item.name}
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                    className="flex-1 py-2 px-3 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, 'quantity', parseInt(e.target.value) || 0)
                    }
                    className="w-20 py-2 px-3 block border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                    min="1"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={item.price}
                    onChange={(e) =>
                      updateItem(index, 'price', parseFloat(e.target.value) || 0)
                    }
                    className="w-28 py-2 px-3 block border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                    step="0.01"
                    min="0"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="py-2 px-2 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            {getFieldError('items') && (
              <p className="text-sm text-red-600 flex items-center gap-1 dark:text-red-400">
                <AlertCircle className="h-3 w-3" />
                {getFieldError('items')}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-neutral-300">
                Status *
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as InvoiceStatus })
                }
                className="py-2 px-3 pe-9 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 dark:text-neutral-300">
                Payment Method
              </label>
              <select
                id="payment_method"
                value={formData.payment_method}
                onChange={(e) =>
                  setFormData({ ...formData, payment_method: e.target.value as PaymentMethod })
                }
                className="py-2 px-3 pe-9 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
              >
                <option value="">Select method</option>
                <option value="credit_card">Credit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="paypal">PayPal</option>
                <option value="cash">Cash</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-neutral-300">
              Total Amount *
            </label>
            <input
              type="number"
              id="amount"
              value={formData.amount}
              onChange={(e) => {
                setFormData({ ...formData, amount: e.target.value });
                setAutoCalcAmount(false);
              }}
              step="0.01"
              min="0"
              required
              className={`py-2 px-3 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600 ${
                getFieldError('amount') ? 'border-red-500' : ''
              }`}
            />
            {getFieldError('amount') && (
              <p className="text-sm text-red-600 flex items-center gap-1 dark:text-red-400">
                <AlertCircle className="h-3 w-3" />
                {getFieldError('amount')}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-neutral-300">
              Notes
            </label>
            <input
              type="text"
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              className="py-2 px-3 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end items-center gap-x-2 py-3 px-4 border-t dark:border-neutral-700">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:bg-blue-700"
            >
              {isSubmitting ? 'Saving...' : invoice ? 'Update Invoice' : 'Create Invoice'}
            </button>
          </div>
        </form>
          </div>
          {/* End Body */}
        </div>
      </div>
    </div>
  );
}
