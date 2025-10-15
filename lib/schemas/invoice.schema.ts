import { z } from 'zod';

/**
 * Zod Schemas for Invoice Validation
 *
 * These schemas provide runtime validation for invoice data.
 * Unlike TypeScript types which only exist at compile time,
 * Zod schemas validate data at runtime, catching errors before
 * they reach the database.
 *
 * Benefits:
 * - Catch invalid data from forms, APIs, or user input
 * - Automatic type inference (no need to duplicate TypeScript types)
 * - Helpful error messages for users
 * - Transform/coerce data (e.g., trim strings, parse dates)
 */

// ============================================================================
// Enums - Define allowed values
// ============================================================================

/**
 * Invoice status enum
 * These are the only valid values for an invoice status
 */
export const InvoiceStatusEnum = z.enum(['paid', 'pending', 'overdue', 'cancelled']);

/**
 * Payment method enum
 * These are the only valid values for payment methods
 */
export const PaymentMethodEnum = z.enum(['credit_card', 'bank_transfer', 'paypal', 'cash', 'other']);

// ============================================================================
// Object Schemas - Define data structures
// ============================================================================

/**
 * Invoice Item Schema
 * Represents a single line item on an invoice
 *
 * Validation rules:
 * - name: Required, must be at least 1 character after trimming
 * - quantity: Required, must be positive integer >= 1
 * - price: Required, must be positive number >= 0
 */
export const InvoiceItemSchema = z.object({
  name: z.string().trim().min(1, 'Item name is required'),
  quantity: z.number().int('Quantity must be a whole number').min(1, 'Quantity must be at least 1'),
  price: z.number().nonnegative('Price cannot be negative'),
});

/**
 * Create Invoice Input Schema
 * Used when creating a new invoice via form submission
 *
 * This validates ALL user input before it reaches the database.
 * Note: org_id and user_id are NOT included here because they
 * come from Clerk authentication, not user input.
 */
export const CreateInvoiceSchema = z.object({
  customer_name: z
    .string()
    .trim()
    .min(1, 'Customer name is required')
    .max(255, 'Customer name must be less than 255 characters'),

  customer_email: z
    .string()
    .trim()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')), // Allow empty string

  amount: z
    .number()
    .nonnegative('Amount cannot be negative')
    .min(0.01, 'Amount must be at least $0.01'),

  status: InvoiceStatusEnum,

  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format')
    .refine((date) => {
      const d = new Date(date);
      return d instanceof Date && !isNaN(d.getTime());
    }, 'Invalid due date'),

  issue_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Issue date must be in YYYY-MM-DD format')
    .refine((date) => {
      const d = new Date(date);
      return d instanceof Date && !isNaN(d.getTime());
    }, 'Invalid issue date'),

  items: z
    .array(InvoiceItemSchema)
    .min(1, 'At least one item is required')
    .max(100, 'Maximum 100 items per invoice'),

  payment_method: PaymentMethodEnum.optional(),

  notes: z
    .string()
    .trim()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
    .or(z.literal('')), // Allow empty string
}).refine((data) => {
  // Additional validation: due_date should be >= issue_date
  const issueDate = new Date(data.issue_date);
  const dueDate = new Date(data.due_date);
  return dueDate >= issueDate;
}, {
  message: 'Due date must be on or after issue date',
  path: ['due_date'], // Show error on due_date field
});

/**
 * Update Invoice Input Schema
 * Used when updating an existing invoice
 *
 * All fields except 'id' are optional (partial update).
 * This allows updating just one field without providing all fields.
 */
export const UpdateInvoiceSchema = z.object({
  id: z.string().uuid('Invalid invoice ID'),
  customer_name: z
    .string()
    .trim()
    .min(1, 'Customer name is required')
    .max(255, 'Customer name must be less than 255 characters')
    .optional(),

  customer_email: z
    .string()
    .trim()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),

  amount: z
    .number()
    .nonnegative('Amount cannot be negative')
    .min(0.01, 'Amount must be at least $0.01')
    .optional(),

  status: InvoiceStatusEnum.optional(),

  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format')
    .refine((date) => {
      const d = new Date(date);
      return d instanceof Date && !isNaN(d.getTime());
    }, 'Invalid due date')
    .optional(),

  issue_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Issue date must be in YYYY-MM-DD format')
    .refine((date) => {
      const d = new Date(date);
      return d instanceof Date && !isNaN(d.getTime());
    }, 'Invalid issue date')
    .optional(),

  items: z
    .array(InvoiceItemSchema)
    .min(1, 'At least one item is required')
    .max(100, 'Maximum 100 items per invoice')
    .optional(),

  payment_method: PaymentMethodEnum.optional(),

  notes: z
    .string()
    .trim()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
});

/**
 * Full Invoice Schema
 * Represents the complete invoice object as stored in the database
 *
 * This includes fields that are auto-generated (id, timestamps)
 * and fields that come from authentication (org_id, user_id)
 */
export const InvoiceSchema = z.object({
  id: z.string().uuid(),
  invoice_number: z.string(),
  customer_name: z.string(),
  customer_email: z.string().optional(),
  amount: z.number(),
  status: InvoiceStatusEnum,
  due_date: z.string(),
  issue_date: z.string(),
  items: z.array(InvoiceItemSchema),
  payment_method: PaymentMethodEnum.optional(),
  notes: z.string().optional(),
  org_id: z.string(),
  user_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

// ============================================================================
// TypeScript Type Inference
// ============================================================================

/**
 * These types are automatically inferred from the Zod schemas.
 * This means you only define the validation rules once (in Zod),
 * and TypeScript types are derived automatically.
 *
 * No more duplicating types!
 */

export type InvoiceStatus = z.infer<typeof InvoiceStatusEnum>;
export type PaymentMethod = z.infer<typeof PaymentMethodEnum>;
export type InvoiceItem = z.infer<typeof InvoiceItemSchema>;
export type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof UpdateInvoiceSchema>;
export type Invoice = z.infer<typeof InvoiceSchema>;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validate data and return typed result
 *
 * Usage:
 *   const result = validateInvoice(userInput);
 *   if (result.success) {
 *     // result.data is properly typed
 *     console.log(result.data.customer_name);
 *   } else {
 *     // result.error contains validation errors
 *     console.log(result.error.issues);
 *   }
 */
export function validateCreateInvoice(data: unknown) {
  return CreateInvoiceSchema.safeParse(data);
}

export function validateUpdateInvoice(data: unknown) {
  return UpdateInvoiceSchema.safeParse(data);
}

/**
 * Format Zod errors for user-friendly display
 *
 * Converts Zod's error format into a simple object:
 * { fieldName: 'error message' }
 *
 * Example:
 *   { customer_name: 'Customer name is required', amount: 'Amount must be at least $0.01' }
 */
export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    errors[path] = issue.message;
  });

  return errors;
}
