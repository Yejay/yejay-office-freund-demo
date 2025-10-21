/**
 * GridErrorBoundary Component
 *
 * Error boundary for AG Grid components with Preline-styled error display.
 * Gracefully handles grid initialization errors and rendering issues.
 *
 * @module components/ag-grid/GridErrorBoundary
 */

'use client';

import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface GridErrorBoundaryProps {
  /**
   * Child components to render
   */
  children: ReactNode;

  /**
   * Optional fallback component to render on error
   */
  fallback?: ReactNode;

  /**
   * Optional error handler callback
   */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface GridErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary for AG Grid components
 *
 * Catches errors during grid initialization or rendering and displays
 * a user-friendly error message with Preline styling.
 *
 * @example
 * ```tsx
 * <GridErrorBoundary>
 *   <DataGrid rowData={data} columnDefs={columns} />
 * </GridErrorBoundary>
 * ```
 *
 * @example
 * ```tsx
 * // With custom fallback
 * <GridErrorBoundary
 *   fallback={<div>Custom error message</div>}
 *   onError={(error) => console.error(error)}
 * >
 *   <DataGrid rowData={data} columnDefs={columns} />
 * </GridErrorBoundary>
 * ```
 */
export class GridErrorBoundary extends Component<
  GridErrorBoundaryProps,
  GridErrorBoundaryState
> {
  constructor(props: GridErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): GridErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('AG Grid Error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI with Preline styling
      return (
        <div className="flex items-center justify-center min-h-[400px] p-6 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg">
          <div className="text-center max-w-md">
            {/* Error Icon */}
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center justify-center size-16 rounded-full bg-red-100 dark:bg-red-500/10">
                <AlertCircle className="size-8 text-red-600 dark:text-red-500" />
              </div>
            </div>

            {/* Error Message */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 mb-2">
              Grid Error
            </h3>
            <p className="text-sm text-gray-600 dark:text-neutral-400 mb-4">
              Something went wrong while loading the data grid.
            </p>

            {/* Error Details (Development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-left">
                <p className="text-xs font-mono text-red-800 dark:text-red-400 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            {/* Retry Button */}
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center gap-x-2 py-2 px-4 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
            >
              <RefreshCw className="size-4" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
