/**
 * Mock order data for demo
 * Matches Preline data table example structure
 */

import { Order } from '@/lib/types/order';

export const mockOrders: Order[] = [
  {
    id: '1',
    order_number: '#235325',
    purchased: 'Calvin Klein T-shirts',
    status: 'ready_for_pickup',
    customer: 'Jase Marley',
    payment_method: 'mastercard',
    payment_last_four: '1898',
    payment_status: 'paid',
    items: 2,
  },
  {
    id: '2',
    order_number: '#646344',
    purchased: 'Maroon Wedges',
    status: 'fulfilled',
    customer: 'Mathew Gustaffson',
    payment_method: 'bank_transfer',
    payment_last_four: '5238',
    payment_status: 'paid',
    items: 1,
  },
  {
    id: '3',
    order_number: '#547432',
    purchased: 'Maroon Wedges',
    status: 'fulfilled',
    customer: 'Mathew Gustaffson',
    payment_method: 'bank_transfer',
    payment_last_four: '8542',
    payment_status: 'pending',
    items: 5,
  },
  {
    id: '4',
    order_number: '#989011',
    purchased: 'White Blazer by Armani',
    status: 'unfulfilled',
    customer: 'David Nunez',
    payment_method: 'mastercard',
    payment_last_four: '1284',
    payment_status: 'pending',
    items: 1,
  },
];
