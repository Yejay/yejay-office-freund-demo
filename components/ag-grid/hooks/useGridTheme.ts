/**
 * useGridTheme Hook
 *
 * Manages AG Grid theme configuration with dark mode support.
 * Integrates with next-themes for automatic theme switching.
 *
 * @module components/ag-grid/hooks/useGridTheme
 */

'use client';

import { useMemo } from 'react';
import { useTheme } from 'next-themes';
import { createPrelineGridTheme } from '@/lib/ag-grid/theme';
import type { GridThemeConfig } from '@/lib/ag-grid/types';

/**
 * Options for the useGridTheme hook
 */
export interface UseGridThemeOptions {
  /**
   * Custom theme configuration overrides
   */
  themeConfig?: Partial<GridThemeConfig>;
}

/**
 * Return value from useGridTheme hook
 */
export interface UseGridThemeReturn {
  /**
   * AG Grid theme instance configured with Preline design tokens
   */
  theme: ReturnType<typeof createPrelineGridTheme>;

  /**
   * Current theme mode ('light' | 'dark' | 'system')
   */
  themeMode: string | undefined;

  /**
   * Resolved theme ('light' | 'dark')
   * Accounts for 'system' preference resolution
   */
  resolvedTheme: string | undefined;

  /**
   * Whether the theme is currently dark
   */
  isDark: boolean;

  /**
   * Data attribute value for AG Grid theme mode
   * Use this on the grid wrapper div: data-ag-theme-mode={dataThemeMode}
   */
  dataThemeMode: 'light' | 'dark';
}

/**
 * Hook to manage AG Grid theme with Preline design system integration
 *
 * Automatically handles:
 * - Theme creation with Preline design tokens
 * - Dark mode detection via next-themes
 * - SSR-safe theme resolution
 * - Theme mode attribute for AG Grid
 *
 * @param options - Theme configuration options
 * @returns Theme instance and mode information
 *
 * @example
 * ```tsx
 * function MyGrid() {
 *   const { theme, dataThemeMode } = useGridTheme();
 *
 *   return (
 *     <div data-ag-theme-mode={dataThemeMode}>
 *       <AgGridReact theme={theme} {...otherProps} />
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With custom theme overrides
 * function MyGrid() {
 *   const { theme, dataThemeMode } = useGridTheme({
 *     themeConfig: {
 *       fontSize: 16,
 *       cellHorizontalPadding: 32
 *     }
 *   });
 *
 *   return (
 *     <div data-ag-theme-mode={dataThemeMode}>
 *       <AgGridReact theme={theme} {...otherProps} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useGridTheme(
  options: UseGridThemeOptions = {}
): UseGridThemeReturn {
  const { themeConfig } = options;
  const { theme: themeMode, resolvedTheme } = useTheme();

  // Create theme instance with optional custom configuration
  // Memoized to prevent recreation on every render
  const theme = useMemo(() => {
    return createPrelineGridTheme(themeConfig);
  }, [themeConfig]);

  // Determine if current theme is dark
  // Falls back to 'light' if theme is not yet resolved (SSR safety)
  const isDark = resolvedTheme === 'dark';

  // Data attribute value for AG Grid wrapper
  // AG Grid uses this to apply correct CSS variables
  const dataThemeMode: 'light' | 'dark' = isDark ? 'dark' : 'light';

  return {
    theme,
    themeMode,
    resolvedTheme,
    isDark,
    dataThemeMode,
  };
}
