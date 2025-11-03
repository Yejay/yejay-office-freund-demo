# AG Grid Custom Theme - OfficeFreund

This document explains the custom AG Grid theme implementation using AG Grid's **official Theming API** that matches Preline's aesthetic and OfficeFreund's corporate design.

## Overview

We use AG Grid's **official Theming API** (introduced in AG Grid v32+) to create a custom theme based on the Quartz theme. The theme automatically switches between light and dark modes to match the application's theme system.

**Why the Theming API?**
- Modern, maintainable approach (no CSS conflicts)
- Type-safe theme parameters
- Automatic color calculations and consistency
- Better performance
- Official AG Grid recommendation

---

## Brand Colors (Single Source of Truth)

```
OfficeFreund Blue:  #3a86ff  →  hsl(220, 100%, 61%)
Dark Charcoal:      #1e1e1e  →  hsl(0, 0%, 12%)
Muted Gray:         #8d95a3  →  hsl(214, 14%, 61%)
White:              #ffffff  →  hsl(0, 0%, 100%)

Font: Rethink Sans
```

---

## Implementation

### 1. Theme Definition: `lib/ag-grid-theme.ts`

The custom theme is defined using AG Grid's `themeQuartz.withParams()` API:

```typescript
import { themeQuartz } from 'ag-grid-community';

// Light mode parameters
const lightParams = {
  accentColor: '#3a86ff',         // OfficeFreund blue
  backgroundColor: '#ffffff',      // Pure white
  foregroundColor: '#1e1e1e',     // Dark charcoal
  borderRadius: 8,                // Match Preline
  headerBackgroundColor: '#f9fafb',
  headerFontWeight: 600,
  fontFamily: 'Rethink Sans, sans-serif',
  wrapperBorderRadius: 12,
  // ... more parameters
};

// Dark mode parameters
const darkParams = {
  accentColor: '#60a5fa',         // Lighter blue for contrast
  backgroundColor: '#1e1e1e',     // Dark charcoal
  foregroundColor: '#f9fafb',     // Near-white
  // ... matching structure to lightParams
};

// Export responsive theme
export const officeFreundTheme = themeQuartz
  .withParams(lightParams, 'light')
  .withParams(darkParams, 'dark');
```

**Key Features:**
- Based on AG Grid's Quartz theme
- Two parameter sets (light/dark) for automatic theme switching
- Uses OfficeFreund brand colors
- Matches Preline's spacing and border radius

---

### 2. Component Usage: `components/orders/order-table.tsx`

```tsx
import { officeFreundTheme } from '@/lib/ag-grid-theme';
import { useTheme } from 'next-themes';

export function OrderTable({ orders }) {
  const { theme } = useTheme();

  return (
    <div
      data-ag-theme-mode={theme === 'dark' ? 'dark' : 'light'}
      style={{ height: 400, width: '100%' }}
    >
      <AgGridReact
        ref={gridRef}
        rowData={orders}
        columnDefs={columnDefs}
        theme={officeFreundTheme}
        rowSelection={{
          mode: 'multiRow',
          checkboxes: true,
          headerCheckbox: true,
          enableClickSelection: false,
        }}
      />
    </div>
  );
}
```

**Important:**
- ❌ DO NOT import `ag-grid.css` (causes conflicts)
- ✅ Use `data-ag-theme-mode` attribute for theme switching
- ✅ Pass theme object to `theme` prop
- ✅ Use modern `rowSelection` object syntax

---

## Theme Parameters Reference

### Colors

| Parameter | Light Mode | Dark Mode | Purpose |
|-----------|------------|-----------|---------|
| `accentColor` | #3a86ff | #60a5fa | Selections, focus, brand color |
| `backgroundColor` | #ffffff | #1e1e1e | Page background |
| `foregroundColor` | #1e1e1e | #f9fafb | Primary text |
| `headerBackgroundColor` | #f9fafb | #111111 | Column headers |
| `borderColor` | #e5e7eb | #374151 | Cell borders |
| `checkboxCheckedBackgroundColor` | #3a86ff | #60a5fa | Checked checkboxes |

### Typography

- `fontFamily`: 'Rethink Sans, sans-serif'
- `fontSize`: 14
- `headerFontSize`: 14
- `headerFontWeight`: 600

### Spacing & Layout

- `spacing`: 8
- `gridSize`: 8
- `cellHorizontalPaddingScale`: 1.2
- `borderRadius`: 8
- `wrapperBorderRadius`: 12

---

## How Dark Mode Works

1. **Theme System**: `next-themes` provides current theme via `useTheme()`
2. **Mode Attribute**: `data-ag-theme-mode` tells AG Grid which parameter set to use
3. **Automatic Switching**: AG Grid applies dark params when `mode="dark"`

```tsx
// User clicks theme toggle
// → next-themes updates theme state
// → useTheme() returns 'dark'
// → data-ag-theme-mode="dark" updates
// → AG Grid switches to darkParams
```

---

## Customizing the Theme

### Update Brand Colors

Edit `lib/ag-grid-theme.ts`:

```typescript
const lightParams = {
  accentColor: '#YOUR_PRIMARY_COLOR',
  backgroundColor: '#YOUR_BACKGROUND',
  foregroundColor: '#YOUR_TEXT_COLOR',
  // ...
};
```

### Adjust Spacing

```typescript
const lightParams = {
  spacing: 12,                    // Increase padding
  cellHorizontalPaddingScale: 1.5, // More horizontal space
  gridSize: 10,                   // Larger grid cells
};
```

### Change Typography

```typescript
const lightParams = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 16,
  headerFontWeight: 700,  // Bolder headers
};
```

### Available Parameters

See AG Grid documentation:
- [All Parameters](https://www.ag-grid.com/react-data-grid/theming-parameters/)
- [Color Schemes](https://www.ag-grid.com/react-data-grid/theming-colors/)
- [Theme Builder](https://www.ag-grid.com/theme-builder/)

---

## Matching Preline Aesthetic

The theme achieves visual consistency with Preline through:

| Element | Preline | AG Grid Theme |
|---------|---------|---------------|
| Border Radius | 8px | `borderRadius: 8` |
| Container Radius | 12px | `wrapperBorderRadius: 12` |
| Header Background | `bg-gray-50` | `headerBackgroundColor: '#f9fafb'` |
| Accent Color | `bg-primary` (#3a86ff) | `accentColor: '#3a86ff'` |
| Font | Rethink Sans | `fontFamily: 'Rethink Sans'` |
| Border Color | `border-gray-200` | `borderColor: '#e5e7eb'` |

---

## Migration from Legacy CSS

### Before (Old Approach)

```tsx
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import '@/app/ag-grid-officefreund-theme.css';

<div className="ag-theme-quartz">
  <AgGridReact theme="legacy" />
</div>
```

### After (New Theming API)

```tsx
import { officeFreundTheme } from '@/lib/ag-grid-theme';

<div data-ag-theme-mode={theme}>
  <AgGridReact theme={officeFreundTheme} />
</div>
```

**Benefits:**
- ✅ No CSS conflicts
- ✅ Type-safe parameters
- ✅ Automatic dark mode
- ✅ Better performance
- ✅ Future-proof (AG Grid's recommended approach)

---

## Troubleshooting

### Error: "Theming API and Legacy Themes are both used"

**Cause:** You're importing both `ag-grid.css` and using the new API.

**Fix:** Remove this line:
```tsx
import 'ag-grid-community/styles/ag-grid.css'; // ❌ Remove
```

### Dark Mode Not Switching

**Check:**
1. `data-ag-theme-mode` attribute is set
2. `useTheme()` returns correct value
3. Both `lightParams` and `darkParams` are defined

### Colors Don't Match Brand

1. Verify colors in `lib/ag-grid-theme.ts`
2. Check `docs/CORPORATE-DESIGN.md` for correct values
3. Use browser DevTools to inspect computed colors

### Deprecated Warnings

If you see warnings about `rowSelection="multiple"`:

**Old:**
```tsx
rowSelection="multiple"
suppressRowClickSelection={true}
```

**New:**
```tsx
rowSelection={{
  mode: 'multiRow',
  enableClickSelection: false,
}}
```

---

## Files Overview

### Core Files

| File | Purpose |
|------|---------|
| `lib/ag-grid-theme.ts` | Theme definition with parameters |
| `components/orders/order-table.tsx` | AG Grid component using theme |
| `docs/CORPORATE-DESIGN.md` | Brand color reference |

### No Longer Needed

| File | Reason |
|------|--------|
| `app/ag-grid-officefreund-theme.css` | Replaced by Theming API |
| `ag-grid.css` import | Not needed with new API |

---

## Testing

### Verify Light Mode

1. Open `/dashboard`
2. Set theme to light
3. Check:
   - White background
   - Dark text
   - Blue accent color (#3a86ff)
   - Light gray headers

### Verify Dark Mode

1. Click theme toggle
2. Check:
   - Dark charcoal background (#1e1e1e)
   - Light text
   - Lighter blue accent (#60a5fa)
   - Darker headers

### Verify No Console Errors

Open DevTools console - should be clean with:
- ✅ No "Theming API" errors
- ✅ No deprecated warnings
- ✅ No CSS conflicts

---

## Resources

- [AG Grid Theming Documentation](https://www.ag-grid.com/react-data-grid/themes/)
- [AG Grid Theming API](https://www.ag-grid.com/react-data-grid/theming/)
- [AG Grid Theme Builder](https://www.ag-grid.com/theme-builder/)
- [OfficeFreund Corporate Design](./CORPORATE-DESIGN.md)
- [Preline UI](https://preline.co/)

---

## Summary

✅ Modern Theming API (recommended by AG Grid)
✅ Matches OfficeFreund brand colors
✅ Consistent with Preline aesthetic
✅ Automatic light/dark mode
✅ Type-safe and maintainable
✅ No CSS conflicts
✅ Clean console (no errors)
