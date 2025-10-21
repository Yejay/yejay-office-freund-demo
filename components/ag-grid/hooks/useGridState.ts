/**
 * useGridState Hook
 *
 * Manages AG Grid state persistence to localStorage.
 * Automatically saves and restores column state, filters, and sort configuration.
 *
 * @module components/ag-grid/hooks/useGridState
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';
import type { GridApi } from 'ag-grid-community';
import type { ColumnState, SortModel, FilterModel } from '@/lib/ag-grid/types';

/**
 * Grid state that will be persisted
 */
interface PersistedGridState {
  columnState: ColumnState[];
  filterModel: FilterModel;
  sortModel: SortModel[];
  savedAt: string;
  version: string;
}

/**
 * Options for useGridState hook
 */
export interface UseGridStateOptions {
  /**
   * Unique identifier for this grid instance
   * Used as the localStorage key
   */
  gridId: string;

  /**
   * Grid API instance
   */
  gridApi: GridApi | null;

  /**
   * Enable/disable state persistence
   * @default true
   */
  enabled?: boolean;

  /**
   * Debounce delay for saving state (ms)
   * @default 500
   */
  saveDebounceMs?: number;

  /**
   * Schema version for the persisted state
   * Change this to invalidate old cached states
   * @default '1.0'
   */
  version?: string;
}

/**
 * Hook to persist and restore AG Grid state
 *
 * Automatically saves grid state (columns, filters, sorting) to localStorage
 * and restores it when the component mounts.
 *
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * function MyGrid() {
 *   const [gridApi, setGridApi] = useState<GridApi | null>(null);
 *
 *   // Enable state persistence
 *   useGridState({
 *     gridId: 'invoices-grid',
 *     gridApi,
 *   });
 *
 *   return (
 *     <DataGrid
 *       gridId="invoices-grid"
 *       onGridReady={setGridApi}
 *       // ... other props
 *     />
 *   );
 * }
 * ```
 */
export function useGridState(options: UseGridStateOptions) {
  const {
    gridId,
    gridApi,
    enabled = true,
    saveDebounceMs = 500,
    version = '1.0',
  } = options;

  // Storage key
  const storageKey = `ag-grid-state-${gridId}`;

  // Debounce timer ref
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track if state has been loaded
  const stateLoadedRef = useRef(false);

  /**
   * Load persisted state from localStorage
   */
  const loadState = useCallback(() => {
    if (!enabled || !gridApi || stateLoadedRef.current) return;

    try {
      const savedState = localStorage.getItem(storageKey);
      if (!savedState) return;

      const state: PersistedGridState = JSON.parse(savedState);

      // Check version compatibility
      if (state.version !== version) {
        console.log(
          `Grid state version mismatch. Expected ${version}, got ${state.version}. Ignoring cached state.`
        );
        localStorage.removeItem(storageKey);
        return;
      }

      // Restore column state (order, width, visibility, sort)
      if (state.columnState && state.columnState.length > 0) {
        gridApi.applyColumnState({
          state: state.columnState,
          applyOrder: true,
        });
      }

      // Restore filter model
      if (state.filterModel) {
        gridApi.setFilterModel(state.filterModel);
      }

      stateLoadedRef.current = true;
      console.log(`Grid state restored for: ${gridId}`);
    } catch (error) {
      console.error('Failed to load grid state:', error);
      localStorage.removeItem(storageKey);
    }
  }, [enabled, gridApi, storageKey, version, gridId]);

  /**
   * Save current state to localStorage (debounced)
   */
  const saveState = useCallback(() => {
    if (!enabled || !gridApi) return;

    // Clear existing timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    // Debounce save
    saveTimerRef.current = setTimeout(() => {
      try {
        const state: PersistedGridState = {
          columnState: gridApi.getColumnState(),
          filterModel: gridApi.getFilterModel() || {},
          sortModel: gridApi.getSortModel() || [],
          savedAt: new Date().toISOString(),
          version,
        };

        localStorage.setItem(storageKey, JSON.stringify(state));
        console.log(`Grid state saved for: ${gridId}`);
      } catch (error) {
        console.error('Failed to save grid state:', error);
      }
    }, saveDebounceMs);
  }, [enabled, gridApi, storageKey, version, saveDebounceMs, gridId]);

  /**
   * Clear persisted state
   */
  const clearState = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      stateLoadedRef.current = false;
      console.log(`Grid state cleared for: ${gridId}`);
    } catch (error) {
      console.error('Failed to clear grid state:', error);
    }
  }, [storageKey, gridId]);

  // Load state when grid API is ready
  useEffect(() => {
    if (gridApi && enabled) {
      loadState();
    }
  }, [gridApi, enabled, loadState]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  return {
    saveState,
    clearState,
    loadState,
  };
}
