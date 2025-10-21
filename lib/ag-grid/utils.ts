/**
 * AG Grid Utility Functions
 *
 * Common operations and helpers for AG Grid components.
 * Includes date formatting, currency formatting, and column ID generation.
 *
 * @module lib/ag-grid/utils
 */

import type { ColDef } from 'ag-grid-community';

/**
 * Formats a date value for display in the grid
 *
 * @param value - Date value (Date object, ISO string, or timestamp)
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 *
 * @example
 * ```typescript
 * // In a column definition
 * {
 *   field: 'createdAt',
 *   valueFormatter: (params) => formatDate(params.value)
 * }
 *
 * // With custom format
 * formatDate(new Date(), { year: 'numeric', month: 'long', day: 'numeric' })
 * // => "October 20, 2025"
 * ```
 */
export function formatDate(
  value: Date | string | number | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string {
  if (!value) return '';

  try {
    const date = typeof value === 'string' || typeof value === 'number'
      ? new Date(value)
      : value;

    if (isNaN(date.getTime())) return '';

    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch {
    return '';
  }
}

/**
 * Formats a currency value for display in the grid
 *
 * @param value - Numeric currency value
 * @param currency - Currency code (ISO 4217)
 * @param locale - Locale for formatting
 * @returns Formatted currency string
 *
 * @example
 * ```typescript
 * // In a column definition
 * {
 *   field: 'amount',
 *   valueFormatter: (params) => formatCurrency(params.value)
 * }
 *
 * formatCurrency(1234.56) // => "$1,234.56"
 * formatCurrency(1234.56, 'EUR', 'de-DE') // => "1.234,56 €"
 * ```
 */
export function formatCurrency(
  value: number | null | undefined,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  if (value === null || value === undefined) return '';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(value);
  } catch {
    return String(value);
  }
}

/**
 * Formats a number value for display in the grid
 *
 * @param value - Numeric value
 * @param options - Intl.NumberFormat options
 * @returns Formatted number string
 *
 * @example
 * ```typescript
 * formatNumber(1234.567) // => "1,234.567"
 * formatNumber(0.856, { style: 'percent' }) // => "85.6%"
 * formatNumber(1234, { minimumFractionDigits: 2 }) // => "1,234.00"
 * ```
 */
export function formatNumber(
  value: number | null | undefined,
  options: Intl.NumberFormatOptions = {}
): string {
  if (value === null || value === undefined) return '';

  try {
    return new Intl.NumberFormat('en-US', options).format(value);
  } catch {
    return String(value);
  }
}

/**
 * Generates a unique column ID from a field name
 * Handles nested object paths and ensures uniqueness
 *
 * @param field - Field name or object path
 * @returns Column ID
 *
 * @example
 * ```typescript
 * generateColumnId('name') // => "col_name"
 * generateColumnId('customer.email') // => "col_customer_email"
 * ```
 */
export function generateColumnId(field: string): string {
  return `col_${field.replace(/\./g, '_')}`;
}

/**
 * Creates a column definition with common defaults
 * Useful for reducing boilerplate when creating multiple similar columns
 *
 * @param overrides - Column definition overrides
 * @returns Complete column definition with defaults
 *
 * @example
 * ```typescript
 * const columns = [
 *   createColumnDef({ field: 'name', headerName: 'Name' }),
 *   createColumnDef({ field: 'email', headerName: 'Email', flex: 2 }),
 * ];
 * ```
 */
export function createColumnDef<TData = any>(
  overrides: ColDef<TData>
): ColDef<TData> {
  return {
    sortable: true,
    filter: true,
    resizable: true,
    ...overrides,
  };
}

/**
 * Generates default column definitions from object keys
 * Useful for quickly creating a grid from data without manually defining columns
 *
 * @param data - Sample data object or array
 * @param options - Column generation options
 * @returns Array of column definitions
 *
 * @example
 * ```typescript
 * const sampleData = { id: 1, name: 'Alice', email: 'alice@example.com' };
 * const columns = generateColumnsFromData(sampleData);
 * // => [
 * //   { field: 'id', headerName: 'Id' },
 * //   { field: 'name', headerName: 'Name' },
 * //   { field: 'email', headerName: 'Email' }
 * // ]
 * ```
 */
export function generateColumnsFromData<TData extends Record<string, any>>(
  data: TData | TData[],
  options: {
    exclude?: string[];
    headerNameTransform?: (field: string) => string;
  } = {}
): ColDef<TData>[] {
  const sample = Array.isArray(data) ? data[0] : data;
  if (!sample) return [];

  const { exclude = [], headerNameTransform = capitalizeFirst } = options;

  return Object.keys(sample)
    .filter((key) => !exclude.includes(key))
    .map((field) => ({
      field,
      headerName: headerNameTransform(field),
      sortable: true,
      filter: true,
      resizable: true,
    }));
}

/**
 * Capitalizes the first letter of a string
 * Used for auto-generating header names from field names
 *
 * @param str - Input string
 * @returns String with first letter capitalized
 *
 * @example
 * ```typescript
 * capitalizeFirst('firstName') // => "FirstName"
 * capitalizeFirst('email') // => "Email"
 * ```
 */
export function capitalizeFirst(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts camelCase or snake_case to Title Case
 * Useful for generating readable header names from field names
 *
 * @param str - Input string (camelCase or snake_case)
 * @returns Title Case string
 *
 * @example
 * ```typescript
 * toTitleCase('firstName') // => "First Name"
 * toTitleCase('customer_email') // => "Customer Email"
 * toTitleCase('totalAmount') // => "Total Amount"
 * ```
 */
export function toTitleCase(str: string): string {
  if (!str) return '';

  return str
    .replace(/([A-Z])/g, ' $1') // Insert space before capitals
    .replace(/[_-]/g, ' ') // Replace underscores and hyphens with spaces
    .trim()
    .split(' ')
    .map((word) => capitalizeFirst(word))
    .join(' ');
}

/**
 * Debounces a function call
 * Useful for search inputs and other frequently triggered events
 *
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 *
 * @example
 * ```typescript
 * const handleSearch = debounce((query: string) => {
 *   gridApi.setQuickFilter(query);
 * }, 300);
 * ```
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Safely gets a nested property value from an object
 * Useful for accessing deeply nested data in custom cell renderers
 *
 * @param obj - Source object
 * @param path - Property path (dot notation)
 * @param defaultValue - Default value if path doesn't exist
 * @returns Property value or default
 *
 * @example
 * ```typescript
 * const data = { customer: { name: 'Alice', address: { city: 'NYC' } } };
 * getNestedValue(data, 'customer.name') // => "Alice"
 * getNestedValue(data, 'customer.address.city') // => "NYC"
 * getNestedValue(data, 'customer.phone', 'N/A') // => "N/A"
 * ```
 */
export function getNestedValue<T = any>(
  obj: any,
  path: string,
  defaultValue?: T
): T {
  const result = path.split('.').reduce((acc, part) => acc?.[part], obj);
  return result !== undefined ? result : (defaultValue as T);
}
