/**
 * ActionButtons Cell Renderer
 *
 * Preline-styled action buttons for row operations in AG Grid cells.
 * Provides common actions like edit, delete, view with customizable handlers.
 *
 * @module components/ag-grid/renderers/ActionButtons
 */

'use client';

import React, { memo, useCallback } from 'react';
import type { CustomCellRendererProps } from 'ag-grid-react';
import { Edit2, Trash2, Eye, MoreVertical } from 'lucide-react';

/**
 * Action button configuration
 */
export interface ActionButton {
  /**
   * Unique action identifier
   */
  id: string;

  /**
   * Button label (for accessibility)
   */
  label: string;

  /**
   * Icon component (Lucide React icon)
   */
  icon?: React.ComponentType<{ className?: string }>;

  /**
   * Button variant
   */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';

  /**
   * Click handler
   */
  onClick: (data: any) => void;

  /**
   * Show condition (optional)
   */
  show?: (data: any) => boolean;
}

/**
 * Props for ActionButtons renderer
 */
export interface ActionButtonsProps extends CustomCellRendererProps {
  /**
   * Array of action button configurations
   */
  actions?: ActionButton[];

  /**
   * Callback when any action is clicked
   * Alternative to individual onClick handlers
   */
  onAction?: (actionId: string, data: any) => void;
}

/**
 * ActionButtons cell renderer component
 *
 * Renders a row of action buttons with Preline styling.
 * Supports common actions and custom handlers.
 *
 * @example
 * ```tsx
 * // In column definition
 * {
 *   headerName: 'Actions',
 *   cellRenderer: ActionButtons,
 *   cellRendererParams: {
 *     actions: [
 *       {
 *         id: 'edit',
 *         label: 'Edit',
 *         icon: Edit2,
 *         onClick: (data) => console.log('Edit', data)
 *       },
 *       {
 *         id: 'delete',
 *         label: 'Delete',
 *         icon: Trash2,
 *         variant: 'danger',
 *         onClick: (data) => console.log('Delete', data)
 *       }
 *     ]
 *   },
 *   sortable: false,
 *   filter: false,
 *   width: 120
 * }
 * ```
 */
export const ActionButtons = memo<ActionButtonsProps>((props) => {
  const { data, actions = [], onAction } = props;

  // Handle action click
  const handleClick = useCallback(
    (e: React.MouseEvent, action: ActionButton) => {
      e.stopPropagation(); // Prevent row click event

      if (action.onClick) {
        action.onClick(data);
      }

      if (onAction) {
        onAction(action.id, data);
      }
    },
    [data, onAction]
  );

  // Filter actions based on show condition
  const visibleActions = actions.filter(
    (action) => !action.show || action.show(data)
  );

  if (visibleActions.length === 0) return null;

  // Get button classes based on variant
  const getButtonClasses = (variant: ActionButton['variant'] = 'ghost') => {
    const baseClasses =
      'inline-flex items-center justify-center size-8 text-sm rounded-lg transition-colors';

    const variantClasses = {
      primary:
        'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600',
      secondary:
        'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600',
      danger:
        'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-500/10 dark:text-red-500 dark:hover:bg-red-500/20',
      ghost:
        'text-gray-600 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-700',
    };

    return `${baseClasses} ${variantClasses[variant]}`;
  };

  return (
    <div className="flex items-center gap-1">
      {visibleActions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.id}
            type="button"
            onClick={(e) => handleClick(e, action)}
            className={getButtonClasses(action.variant)}
            title={action.label}
            aria-label={action.label}
          >
            {Icon ? <Icon className="size-4" /> : null}
          </button>
        );
      })}
    </div>
  );
});

ActionButtons.displayName = 'ActionButtons';

/**
 * Pre-configured action button factories
 * Convenience functions for common actions
 */

/**
 * Create an Edit action button
 */
export const createEditAction = (onClick: (data: any) => void): ActionButton => ({
  id: 'edit',
  label: 'Edit',
  icon: Edit2,
  variant: 'ghost',
  onClick,
});

/**
 * Create a Delete action button
 */
export const createDeleteAction = (onClick: (data: any) => void): ActionButton => ({
  id: 'delete',
  label: 'Delete',
  icon: Trash2,
  variant: 'danger',
  onClick,
});

/**
 * Create a View action button
 */
export const createViewAction = (onClick: (data: any) => void): ActionButton => ({
  id: 'view',
  label: 'View',
  icon: Eye,
  variant: 'ghost',
  onClick,
});

/**
 * Create a More action button (for dropdown menus)
 */
export const createMoreAction = (onClick: (data: any) => void): ActionButton => ({
  id: 'more',
  label: 'More actions',
  icon: MoreVertical,
  variant: 'ghost',
  onClick,
});
