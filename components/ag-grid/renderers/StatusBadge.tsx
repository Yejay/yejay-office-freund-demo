/**
 * StatusBadge Cell Renderer
 *
 * Preline-styled status badge for displaying status values in AG Grid cells.
 * Supports common status types with predefined color schemes.
 *
 * @module components/ag-grid/renderers/StatusBadge
 */

'use client';

import React, { memo } from 'react';
import type { CustomCellRendererProps } from 'ag-grid-react';

/**
 * Status type definitions
 */
export type StatusType =
  | 'paid'
  | 'pending'
  | 'overdue'
  | 'active'
  | 'inactive'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'default';

/**
 * Status badge configuration
 */
interface StatusConfig {
  label: string;
  className: string;
}

/**
 * Default status configurations with Preline styling
 */
const defaultStatusConfigs: Record<string, StatusConfig> = {
  // Invoice statuses
  paid: {
    label: 'Paid',
    className:
      'bg-teal-100 text-teal-800 dark:bg-teal-500/10 dark:text-teal-500',
  },
  pending: {
    label: 'Pending',
    className:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-500',
  },
  overdue: {
    label: 'Overdue',
    className: 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-500',
  },

  // Generic statuses
  active: {
    label: 'Active',
    className:
      'bg-teal-100 text-teal-800 dark:bg-teal-500/10 dark:text-teal-500',
  },
  inactive: {
    label: 'Inactive',
    className:
      'bg-gray-100 text-gray-800 dark:bg-gray-500/10 dark:text-gray-400',
  },
  success: {
    label: 'Success',
    className:
      'bg-teal-100 text-teal-800 dark:bg-teal-500/10 dark:text-teal-500',
  },
  warning: {
    label: 'Warning',
    className:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-500',
  },
  error: {
    label: 'Error',
    className: 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-500',
  },
  info: {
    label: 'Info',
    className:
      'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-500',
  },
  default: {
    label: 'Default',
    className:
      'bg-gray-100 text-gray-800 dark:bg-gray-500/10 dark:text-gray-400',
  },
};

/**
 * Props for StatusBadge renderer
 */
export interface StatusBadgeProps extends CustomCellRendererProps {
  /**
   * Custom status configurations
   * Allows overriding default configs or adding new status types
   */
  statusConfigs?: Record<string, StatusConfig>;

  /**
   * Custom label transformation function
   * Useful for internationalization or custom formatting
   */
  labelFormatter?: (value: string) => string;
}

/**
 * StatusBadge cell renderer component
 *
 * Renders a Preline-styled badge for status values.
 * Automatically selects appropriate colors based on status type.
 *
 * @example
 * ```tsx
 * // In column definition
 * {
 *   field: 'status',
 *   headerName: 'Status',
 *   cellRenderer: StatusBadge,
 *   cellRendererParams: {
 *     statusConfigs: {
 *       custom: { label: 'Custom', className: 'bg-purple-100 text-purple-800' }
 *     }
 *   }
 * }
 * ```
 */
export const StatusBadge = memo<StatusBadgeProps>((props) => {
  const { value, statusConfigs, labelFormatter } = props;

  if (!value) return null;

  // Merge custom configs with defaults
  const configs = { ...defaultStatusConfigs, ...statusConfigs };

  // Get status value as lowercase for matching
  const statusKey = String(value).toLowerCase();

  // Get configuration or fall back to default
  const config = configs[statusKey] || configs.default;

  // Format label
  const label = labelFormatter ? labelFormatter(value) : config.label;

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.className}`}
    >
      {label}
    </span>
  );
});

StatusBadge.displayName = 'StatusBadge';
