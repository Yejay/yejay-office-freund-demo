/**
 * Order types for the data table demo
 * Based on Preline data table example
 */

export type OrderStatus = 'ready_for_pickup' | 'fulfilled' | 'unfulfilled';
export type PaymentStatus = 'paid' | 'pending' | 'refunded' | 'partially_refunded';
export type PaymentMethod = 'mastercard' | 'visa' | 'paypal' | 'bank_transfer';

export interface Order {
  id: string;
  order_number: string;
  purchased: string;
  status: OrderStatus;
  customer: string;
  payment_method: PaymentMethod;
  payment_last_four?: string;      // Last 4 digits of card or identifier
  payment_status: PaymentStatus;
  items: number;
}
