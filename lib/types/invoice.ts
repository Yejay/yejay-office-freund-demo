export type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'cancelled';
export type PaymentMethod = 'credit_card' | 'bank_transfer' | 'paypal' | 'cash' | 'other';

export interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email?: string;
  amount: number;
  status: InvoiceStatus;
  due_date: string;
  issue_date: string;
  items: InvoiceItem[];
  payment_method?: PaymentMethod;
  notes?: string;
  org_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInvoiceInput {
  customer_name: string;
  customer_email?: string;
  amount: number;
  status: InvoiceStatus;
  due_date: string;
  issue_date: string;
  items: InvoiceItem[];
  payment_method?: PaymentMethod;
  notes?: string;
}

export interface UpdateInvoiceInput extends Partial<CreateInvoiceInput> {
  id: string;
}
