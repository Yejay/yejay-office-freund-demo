/**
 * Invoice Types
 *
 * These types are now derived from Zod schemas for runtime validation.
 * This file now just re-exports types from the schema file.
 *
 * Why? By defining validation rules once in Zod schemas, we get:
 * 1. Runtime validation (catch errors from user input)
 * 2. Compile-time type safety (TypeScript types)
 * 3. Single source of truth (no duplicate definitions)
 */

export type {
  InvoiceStatus,
  PaymentMethod,
  InvoiceItem,
  Invoice,
  CreateInvoiceInput,
  UpdateInvoiceInput,
} from '@/lib/schemas/invoice.schema';

// Re-export schemas for convenience
export {
  InvoiceStatusEnum,
  PaymentMethodEnum,
  InvoiceItemSchema,
  InvoiceSchema,
  CreateInvoiceSchema,
  UpdateInvoiceSchema,
  validateCreateInvoice,
  validateUpdateInvoice,
  formatZodErrors,
} from '@/lib/schemas/invoice.schema';
