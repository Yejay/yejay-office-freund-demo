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
 */

import { themeQuartz } from 'ag-grid-community';

/**
 * Light mode theme parameters
 * Clean, modern light theme matching Preline's aesthetic
 */
const lightParams = {
  // Core brand colors
  accentColor: '#3a86ff',          // OfficeFreund primary blue
  backgroundColor: '#ffffff',       // Pure white background
  foregroundColor: '#1e1e1e',      // Dark charcoal text

  // Border and dividers
  borderColor: '#e5e7eb',          // Subtle light gray borders
  borderRadius: 8,                 // Consistent with Preline

  // Headers
  headerBackgroundColor: '#f9fafb', // Very light gray
  headerTextColor: '#1e1e1e',      // Dark charcoal
  headerFontSize: 14,
  headerFontWeight: 600,           // Semi-bold

  // Row styling
  rowHoverColor: '#f3f4f6',        // Light hover effect
  oddRowBackgroundColor: '#ffffff', // White

  // Selection and focus
  selectedRowBackgroundColor: '#eff6ff', // Light blue tint
  rangeSelectionBackgroundColor: '#dbeafe',

  // Cell styling
  cellHorizontalPaddingScale: 1.2,  // More breathing room
  fontSize: 14,
  fontFamily: 'Rethink Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',

  // Spacing
  spacing: 8,
  gridSize: 8,

  // Checkboxes and controls
  checkboxCheckedBackgroundColor: '#3a86ff',
  checkboxCheckedBorderColor: '#3a86ff',
  checkboxIndeterminateBackgroundColor: '#3a86ff',

  // Input fields
  inputBackgroundColor: '#ffffff',
  inputBorderColor: '#e5e7eb',
  inputFocusBorderColor: '#3a86ff',

  // Chrome (scrollbars, etc)
  chromeBackgroundColor: '#f9fafb',

  // Wrapper (outer grid container)
  wrapperBorderRadius: 12,         // Rounded corners for the grid container
  wrapperBorder: true,
};

/**
 * Dark mode theme parameters
 * Sleek dark theme with proper contrast
 */
const darkParams = {
  // Core brand colors (adjusted for dark mode)
  accentColor: '#60a5fa',          // Lighter blue for better contrast
  backgroundColor: '#1e1e1e',      // Dark charcoal
  foregroundColor: '#f9fafb',      // Near-white text

  // Border and dividers
  borderColor: '#374151',          // Dark gray borders
  borderRadius: 8,

  // Headers
  headerBackgroundColor: '#111111', // Darker than background
  headerTextColor: '#f9fafb',      // Near-white
  headerFontSize: 14,
  headerFontWeight: 600,

  // Row styling
  rowHoverColor: '#2d2d2d',        // Subtle hover
  oddRowBackgroundColor: '#1e1e1e',

  // Selection and focus
  selectedRowBackgroundColor: '#1e3a8a', // Dark blue
  rangeSelectionBackgroundColor: '#1e40af',

  // Cell styling
  cellHorizontalPaddingScale: 1.2,
  fontSize: 14,
  fontFamily: 'Rethink Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',

  // Spacing
  spacing: 8,
  gridSize: 8,

  // Checkboxes and controls
  checkboxCheckedBackgroundColor: '#60a5fa',
  checkboxCheckedBorderColor: '#60a5fa',
  checkboxIndeterminateBackgroundColor: '#60a5fa',
  checkboxUncheckedBackgroundColor: '#1e1e1e',
  checkboxUncheckedBorderColor: '#4b5563',

  // Input fields
  inputBackgroundColor: '#2d2d2d',
  inputBorderColor: '#374151',
  inputFocusBorderColor: '#60a5fa',

  // Chrome
  chromeBackgroundColor: '#111111',

  // Wrapper
  wrapperBorderRadius: 12,
  wrapperBorder: true,
};

/**
 * Responsive theme that automatically switches between light and dark
 * based on data-ag-theme-mode attribute
 */
export const officeFreundTheme = themeQuartz
  .withParams(lightParams, 'light')
  .withParams(darkParams, 'dark');

/**
 * Individual themes for direct use if needed
 */
export const officeFreundLightTheme = themeQuartz.withParams(lightParams);
export const officeFreundDarkTheme = themeQuartz.withParams(darkParams);
