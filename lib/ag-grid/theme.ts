/**
 * AG Grid Preline Theme Configuration
 *
 * Creates an AG Grid theme that integrates with Preline's design system.
 * Uses the AG Grid v34 Theming API with CSS custom properties bridge.
 *
 * @module lib/ag-grid/theme
 */

import { themeQuartz, colorSchemeVariable } from 'ag-grid-community';
import type { GridThemeConfig } from './types';

/**
 * Default Preline theme configuration
 * Maps Preline design tokens to AG Grid theme parameters
 */
export const defaultPrelineThemeConfig: GridThemeConfig = {
  // Core colors (CSS variable references to Tailwind/Preline tokens)
  backgroundColor: 'var(--ag-preline-bg)',
  foregroundColor: 'var(--ag-preline-fg)',
  accentColor: 'var(--ag-preline-accent)',

  // Typography
  fontFamily: 'var(--ag-preline-font)',
  fontSize: 14, // Preline default text-sm

  // Spacing (Preline spacing.2 = 8px)
  spacing: 8,
  cellHorizontalPadding: 24, // Preline px-6 (24px)
  cellVerticalPadding: 16, // Preline py-4 (16px)

  // Borders (Preline rounded-lg)
  borderRadius: 8,
  wrapperBorderRadius: 8,
};

/**
 * Creates an AG Grid theme with Preline design system integration
 *
 * Uses the Theming API to create a type-safe theme that references
 * CSS custom properties defined in globals.css. The custom properties
 * bridge Tailwind/Preline design tokens to AG Grid.
 *
 * @param config - Optional theme configuration overrides
 * @returns AG Grid theme instance
 *
 * @example
 * ```typescript
 * import { createPrelineGridTheme } from '@/lib/ag-grid/theme';
 *
 * const myTheme = createPrelineGridTheme();
 *
 * // Or with custom overrides
 * const customTheme = createPrelineGridTheme({
 *   fontSize: 16,
 *   cellHorizontalPadding: 32
 * });
 * ```
 */
export const createPrelineGridTheme = (config?: Partial<GridThemeConfig>) => {
  const finalConfig = { ...defaultPrelineThemeConfig, ...config };

  return themeQuartz
    .withPart(colorSchemeVariable) // Enable color scheme switching
    .withParams({
      // Core color parameters
      backgroundColor: finalConfig.backgroundColor,
      foregroundColor: finalConfig.foregroundColor,
      accentColor: finalConfig.accentColor,

      // Typography
      fontFamily: finalConfig.fontFamily,
      fontSize: finalConfig.fontSize,
      headerFontSize: finalConfig.headerFontSize,

      // Spacing
      spacing: finalConfig.spacing,
      cellHorizontalPadding: finalConfig.cellHorizontalPadding,

      // Borders
      borderRadius: finalConfig.borderRadius,
      wrapperBorderRadius: finalConfig.wrapperBorderRadius,

      // Additional overrides (if provided)
      ...(finalConfig.headerBackgroundColor && {
        headerBackgroundColor: finalConfig.headerBackgroundColor,
      }),
      ...(finalConfig.rowHoverColor && {
        rowHoverColor: finalConfig.rowHoverColor,
      }),
      ...(finalConfig.selectedRowBackgroundColor && {
        selectedRowBackgroundColor: finalConfig.selectedRowBackgroundColor,
      }),
      ...(finalConfig.borderColor && {
        borderColor: finalConfig.borderColor,
      }),
    });
};

/**
 * Default Preline theme instance
 * Can be imported and used directly without creating a new instance
 *
 * @example
 * ```typescript
 * import { prelineGridTheme } from '@/lib/ag-grid/theme';
 * <AgGridReact theme={prelineGridTheme} />
 * ```
 */
export const prelineGridTheme = createPrelineGridTheme();
