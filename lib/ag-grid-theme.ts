/**
 * OfficeFreund AG Grid Theme
 *
 * Custom AG Grid theme based on Material design that matches Preline's aesthetic
 * and OfficeFreund's corporate design.
 *
 * Brand Colors:
 * - Primary:  #3a86ff  (hsl 220, 100%, 61%)
 * - Charcoal: #1e1e1e  (hsl 0, 0%, 12%)
 * - Gray:     #8d95a3  (hsl 214, 14%, 61%)
 * - White:    #ffffff  (hsl 0, 0%, 100%)
 *
 * Font: Rethink Sans
 *
 * Preline Aesthetic:
 * - Stone colors (stone-100, stone-200, etc.)
 * - Clean horizontal borders only
 * - Green focus states
 * - Minimal shadows
 * - No vertical grid lines
 */

import { themeMaterial } from 'ag-grid-community';

/**
 * Light mode theme parameters
 * Clean, modern light theme matching Preline's aesthetic with stone colors
 */
const lightParams = {
  // Core brand colors - OfficeFreund
  accentColor: '#3a86ff',          // OfficeFreund blue
  backgroundColor: '#ffffff',       // Pure white background
  foregroundColor: '#292524',      // Stone-800 text (darker, better contrast)

  // Border and dividers - Preline uses stone colors
  borderColor: '#e7e5e4',          // Stone-200 for subtle borders
  borderRadius: 8,                 // Consistent with Preline
  columnBorder: false,             // NO vertical borders (Preline style)
  rowBorder: true,                 // Only horizontal borders

  // Headers - very light stone background
  headerBackgroundColor: '#f5f5f4', // Stone-100 (lighter than gray-50)
  headerTextColor: '#292524',      // Stone-800
  headerFontSize: 14,
  headerFontWeight: 600,           // Semi-bold

  // Row styling - clean and minimal
  rowHoverColor: '#fafaf9',        // Stone-50 for subtle hover
  oddRowBackgroundColor: '#ffffff', // White (no alternating rows for cleaner look)

  // Selection and focus - OfficeFreund blue
  selectedRowBackgroundColor: '#eff6ff', // Blue-50 tint
  rangeSelectionBackgroundColor: '#dbeafe', // Blue-100

  // Cell styling - Preline-like spacing
  cellHorizontalPaddingScale: 1.2,  // Balanced horizontal spacing
  cellVerticalPaddingScale: 1.4,    // More vertical breathing room
  fontSize: 14,
  fontFamily: 'Rethink Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',

  // Spacing
  spacing: 8,
  gridSize: 8,

  // Checkboxes and controls - OfficeFreund blue
  checkboxCheckedBackgroundColor: '#3a86ff', // OfficeFreund blue
  checkboxCheckedBorderColor: '#3a86ff',
  checkboxIndeterminateBackgroundColor: '#3a86ff',
  checkboxUncheckedBorderColor: '#d6d3d1',  // Stone-300

  // Input fields
  inputBackgroundColor: '#f5f5f4',  // Stone-100 background
  inputBorderColor: 'transparent',   // Transparent border (Preline style)
  inputFocusBorderColor: '#3a86ff', // OfficeFreund blue on focus
  inputFocusBackgroundColor: '#ffffff', // White on focus

  // Chrome (scrollbars, etc)
  chromeBackgroundColor: '#fafaf9', // Stone-50

  // Wrapper (outer grid container)
  wrapperBorderRadius: 12,         // Rounded corners
  wrapperBorder: true,
  wrapperBorderColor: '#e7e5e4',   // Stone-200
};

/**
 * Dark mode theme parameters
 * Sleek dark theme matching Preline dark mode
 */
const darkParams = {
  // Core brand colors (adjusted for dark mode)
  accentColor: '#60a5fa',          // Lighter blue for dark mode
  backgroundColor: '#1c1917',      // Stone-900 (Preline dark)
  foregroundColor: '#fafaf9',      // Stone-50 text

  // Border and dividers
  borderColor: '#44403c',          // Stone-700 borders
  borderRadius: 8,
  columnBorder: false,             // NO vertical borders
  rowBorder: true,                 // Only horizontal borders

  // Headers
  headerBackgroundColor: '#0c0a09', // Stone-950 (darker)
  headerTextColor: '#fafaf9',      // Stone-50
  headerFontSize: 14,
  headerFontWeight: 600,

  // Row styling
  rowHoverColor: '#292524',        // Stone-800 subtle hover
  oddRowBackgroundColor: '#1c1917', // Stone-900

  // Selection and focus - OfficeFreund blue
  selectedRowBackgroundColor: '#1e3a8a', // Blue-900
  rangeSelectionBackgroundColor: '#1e40af', // Blue-800

  // Cell styling - Preline-like spacing
  cellHorizontalPaddingScale: 1.2,  // Balanced horizontal spacing
  cellVerticalPaddingScale: 1.4,    // More vertical breathing room
  fontSize: 14,
  fontFamily: 'Rethink Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',

  // Spacing
  spacing: 8,
  gridSize: 8,

  // Checkboxes and controls - OfficeFreund blue
  checkboxCheckedBackgroundColor: '#60a5fa', // Lighter blue
  checkboxCheckedBorderColor: '#60a5fa',
  checkboxIndeterminateBackgroundColor: '#60a5fa',
  checkboxUncheckedBackgroundColor: '#1c1917', // Stone-900
  checkboxUncheckedBorderColor: '#57534e',  // Stone-600

  // Input fields
  inputBackgroundColor: '#292524',  // Stone-800
  inputBorderColor: 'transparent',
  inputFocusBorderColor: '#60a5fa', // Blue focus
  inputFocusBackgroundColor: '#1c1917', // Stone-900 on focus

  // Chrome
  chromeBackgroundColor: '#0c0a09', // Stone-950

  // Wrapper
  wrapperBorderRadius: 12,
  wrapperBorder: true,
  wrapperBorderColor: '#44403c',   // Stone-700
};

/**
 * Responsive theme that automatically switches between light and dark
 * based on data-ag-theme-mode attribute
 *
 * Uses Material theme as base for cleaner, more minimal aesthetic
 */
export const officeFreundTheme = themeMaterial
  .withParams(lightParams, 'light')
  .withParams(darkParams, 'dark');

/**
 * Individual themes for direct use if needed
 */
export const officeFreundLightTheme = themeMaterial.withParams(lightParams);
export const officeFreundDarkTheme = themeMaterial.withParams(darkParams);
