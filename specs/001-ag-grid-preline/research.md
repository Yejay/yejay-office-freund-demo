# Research: AG Grid with Preline Design Integration

**Feature**: AG Grid with Preline Design Integration
**Date**: 2025-10-20
**Purpose**: Research technical approaches for integrating AG Grid v34 with Preline Pro design system

## Executive Summary

Successfully integrating AG Grid with Preline requires a layered approach combining AG Grid's modern Theming API (v32+) with CSS custom properties that bridge Tailwind/Preline design tokens. The recommended strategy uses four tiers: (1) Theming API + CSS variables for base styling, (2) targeted CSS overrides for fine-tuning, (3) cellClass utilities for dynamic cell styling, and (4) custom React cell renderers for complex interactive elements.

**Key Decision**: Use AG Grid's Theming API rather than legacy CSS imports to maintain TypeScript safety, prevent style conflicts, and ensure upgrade compatibility.

## Research Findings

### 1. AG Grid Theming Architecture (v34)

**Modern Theming API** (Introduced v32.2, Enhanced v34):

AG Grid v34 provides a JavaScript-based theming system built on CSS custom properties:

```typescript
import { themeQuartz, colorSchemeVariable } from 'ag-grid-community';

const myTheme = themeQuartz
  .withPart(colorSchemeVariable)
  .withParams({
    backgroundColor: 'var(--tw-color-background)',
    foregroundColor: 'var(--tw-color-foreground)',
    accentColor: 'var(--tw-color-primary)',
    spacing: 8,
    cellHorizontalPadding: 12,
    borderRadius: 6
  });
```

**Three Foundational Colors**: AG Grid derives ~50+ secondary colors from three base parameters:
- `backgroundColor`: Opaque page background
- `foregroundColor`: Primary text color
- `accentColor`: Highlights and selections

**100+ Theme Parameters** organized by type:
- Length values (Width, Height, Padding, Spacing)
- Color values (with mixing and blending support)
- Border values (CSS syntax or object notation)
- Font, Shadow, and Duration parameters

**Critical Constraint**: Cannot mix Theming API with traditional CSS imports on the same page. Choose one approach.

**CSS Layers Support**: `themeCssLayer` option controls cascade order, crucial for Tailwind integration:

```typescript
gridOptions = {
  themeCssLayer: 'ag-grid-layer'
}
```

### 2. Tailwind CSS Integration Strategy

**Challenge**: AG Grid lacks official Tailwind support. Main issues:
- Class-based utilities vs CSS variables architecture
- Dark mode incompatibility (Tailwind's `dark:` prefix doesn't work with AG Grid theme classes)
- SSR hydration challenges in Next.js
- CSS specificity conflicts

**Recommended Pattern - CSS Custom Properties Bridge**:

```css
/* globals.css */
@layer base {
  :root {
    /* Bridge Tailwind tokens to AG Grid */
    --tw-color-background: theme('colors.white');
    --tw-color-foreground: theme('colors.gray.900');
    --tw-color-primary: theme('colors.blue.500');
    --tw-font-sans: theme('fontFamily.sans');
  }

  .dark {
    --tw-color-background: theme('colors.gray.900');
    --tw-color-foreground: theme('colors.gray.100');
    --tw-color-primary: theme('colors.blue.400');
  }
}

@layer utilities {
  .ag-theme-quartz {
    --ag-background-color: var(--tw-color-background);
    --ag-foreground-color: var(--tw-color-foreground);
    --ag-accent-color: var(--tw-color-primary);
    --ag-font-family: var(--tw-font-sans);
    --ag-header-background-color: theme('colors.gray.50');
    --ag-border-color: theme('colors.gray.200');
  }

  .dark .ag-theme-quartz {
    --ag-header-background-color: theme('colors.gray.800');
    --ag-border-color: theme('colors.gray.700');
  }
}
```

**Dark Mode Implementation**:

Avoid `dark:` prefix on AG Grid theme classes. Instead, use:

1. **data-ag-theme-mode attribute** (recommended):
```typescript
<div data-ag-theme-mode={isDark ? 'dark' : 'light'}>
  <AgGridReact theme={myTheme} />
</div>
```

2. **CSS variables with .dark class** (integrates with next-themes):
```css
.dark {
  --ag-background-color: theme('colors.gray.900');
}
```

**Next.js SSR Handling**:

Use `next-themes` with conditional rendering to avoid hydration mismatches:

```typescript
'use client';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export default function MyGrid() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null; // Prevent SSR mismatch

  return (
    <div data-ag-theme-mode={theme === 'dark' ? 'dark' : 'light'}>
      <AgGridReact theme={myTheme} />
    </div>
  );
}
```

### 3. Custom Cell Renderers

**TypeScript Types**:

```typescript
import { CustomCellRendererProps } from 'ag-grid-react';

interface MyData {
  id: number;
  status: 'active' | 'inactive';
}

const StatusRenderer = (props: CustomCellRendererProps<MyData, string>) => {
  // props.value typed as string
  // props.data typed as MyData | undefined
  return <span>{props.value}</span>;
};
```

**Available Props**:
- `value`: Cell's value
- `data`: Complete row data
- `node`: Row node reference
- `colDef`: Column definition
- `api`: Grid API access
- `getValue()`, `setValue()`, `setTooltip()`: Convenience functions

**Performance Hierarchy** (fastest to slowest):

1. **Value Formatter** (best performance):
```typescript
{ field: 'price', valueFormatter: p => `$${p.value}` }
```

2. **Vanilla JS Renderer**:
```typescript
{
  field: 'status',
  cellRenderer: params => {
    const span = document.createElement('span');
    span.textContent = params.value;
    return span;
  }
}
```

3. **Memoized React Component**:
```typescript
import { memo } from 'react';

const StatusBadge = memo((props: CustomCellRendererProps) => {
  return <span>{props.value}</span>;
});
```

4. **Deferred React Component** (for heavy components):
```typescript
{
  field: 'chart',
  cellRenderer: ChartRenderer,
  cellRendererParams: { deferRender: true }
}
```

**Best Practices**:
- Wrap renderers with `React.memo()` to prevent unnecessary re-renders
- Use `useCallback` for event handlers
- Prefer `valueFormatter` for simple text transformations
- Keep `cellClassRules` functions simple (executed on every cell update)

### 4. Preline UI Design Patterns

**Component Structure**:

Preline is built entirely on Tailwind CSS utility classes with:
- Data attributes for JavaScript functionality (`data-hs-*`)
- State-based styling prefixes (`hs-dropdown-open:`, `hs-tab-active:`)
- Dark mode via Tailwind's `dark:` prefix
- Mobile-first responsive design

**Search Bar Pattern**:

```html
<div class="relative">
  <div class="absolute inset-y-0 start-0 flex items-center pointer-events-none ps-3">
    <svg class="size-4 text-gray-400 dark:text-neutral-400"><!-- icon --></svg>
  </div>
  <input
    type="text"
    class="py-2 px-3 ps-9 block w-full border-gray-200 rounded-lg text-sm
           focus:border-blue-500 focus:ring-blue-500
           dark:bg-neutral-900 dark:border-neutral-700"
    placeholder="Search">
</div>
```

**Pagination Pattern**:

```html
<button type="button"
  class="min-h-[38px] min-w-[38px] flex justify-center items-center
         bg-gray-200 text-gray-800 py-2 px-3 text-sm rounded-lg
         dark:bg-neutral-600 dark:text-white"
  aria-current="page">
  2
</button>
```

**Table Styling**:

```html
<table class="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
  <thead class="bg-gray-50 dark:bg-neutral-800">
    <tr>
      <th class="px-6 py-3 text-start text-xs font-semibold uppercase
                 text-gray-800 dark:text-neutral-200">
        Order
      </th>
    </tr>
  </thead>
  <tbody class="divide-y divide-gray-200 dark:divide-neutral-700">
    <tr class="hover:bg-gray-100 dark:hover:bg-neutral-700">
      <td class="px-6 py-4 text-sm text-gray-800 dark:text-neutral-200">
        #1234
      </td>
    </tr>
  </tbody>
</table>
```

**Status Badge Styling**:

```html
<span class="py-1 px-1.5 inline-flex items-center gap-x-1 text-xs font-medium
             rounded-full bg-teal-100 text-teal-800
             dark:bg-teal-500/10 dark:text-teal-500">
  Active
</span>
```

### 5. Design Token Mapping

**Preline → AG Grid Token Mapping**:

| Preline Token | AG Grid Parameter | Value |
|---------------|-------------------|-------|
| `colors.white` | `backgroundColor` | `#ffffff` |
| `colors.gray.900` | `foregroundColor` | `#111827` |
| `colors.blue.500` | `accentColor` | `#3b82f6` |
| `colors.gray.50` | `headerBackgroundColor` | `#f9fafb` |
| `colors.gray.200` | `borderColor` | `#e5e7eb` |
| `spacing.2` (8px) | `spacing` | `8` |
| `spacing.4` (16px) | `cellHorizontalPadding` | `16` |
| `fontSize.sm` (14px) | `fontSize` | `14` |
| `fontFamily.sans` | `fontFamily` | `Inter, system-ui, sans-serif` |
| `borderRadius.lg` (8px) | `borderRadius` | `8` |

**Color Architecture**:

Preline uses OKLCH color space for improved accuracy:
- Grayscale: `gray-50` through `gray-950`
- Dark mode: `neutral-50` through `neutral-950`
- Semantic: `teal` (success), `yellow` (warning), `red` (error)

**Dark Mode Colors**:

| Element | Light | Dark |
|---------|-------|------|
| Background (primary) | `white` | `neutral-800` |
| Background (secondary) | `gray-50` | `neutral-900` |
| Border | `gray-200` | `neutral-700` |
| Text (primary) | `gray-800` | `neutral-200` |
| Text (secondary) | `gray-500` | `neutral-400` |

### 6. Common Integration Pitfalls & Solutions

**Pitfall 1: CSS Specificity Issues**

❌ Problem:
```css
.ag-header { background-color: red; } /* Insufficient specificity */
```

✅ Solution:
```css
.ag-theme-quartz {
  --ag-header-background-color: red; /* Use CSS variables */
}
```

**Pitfall 2: React Component Re-renders**

❌ Problem:
```typescript
const MyGrid = () => {
  const columnDefs = [{ field: 'name' }]; // New reference each render!
  return <AgGridReact columnDefs={columnDefs} />;
};
```

✅ Solution:
```typescript
const MyGrid = () => {
  const columnDefs = useMemo(() => [
    { field: 'name' }
  ], []);

  return <AgGridReact columnDefs={columnDefs} />;
};
```

**Pitfall 3: Tailwind dark: Prefix Not Working**

❌ Problem:
```html
<div className="ag-theme-alpine dark:ag-theme-alpine-dark">
```

✅ Solution:
```html
<div data-ag-theme-mode={isDark ? 'dark' : 'light'}>
  <AgGridReact theme={myTheme} />
</div>
```

**Pitfall 4: SSR Hydration Mismatches**

✅ Solution:
```typescript
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return null;
```

**Pitfall 5: Performance with Custom Renderers**

Use performance hierarchy:
1. Value Formatter (fastest)
2. Vanilla JS renderer
3. Memoized React component
4. Deferred React component (slowest but safe for heavy components)

## Recommended Implementation Approach

### Tier 1: Foundation (Theming API + CSS Variables)

Create base theme using AG Grid's Theming API with CSS variable bridge:

```typescript
// lib/ag-grid/theme.ts
import { themeQuartz, colorSchemeVariable } from 'ag-grid-community';

export const createPrelineGridTheme = () => {
  return themeQuartz
    .withPart(colorSchemeVariable)
    .withParams({
      backgroundColor: 'var(--ag-preline-bg)',
      foregroundColor: 'var(--ag-preline-fg)',
      accentColor: 'var(--ag-preline-accent)',
      fontFamily: 'var(--ag-preline-font)',
      fontSize: 14,
      spacing: 8,
      cellHorizontalPadding: 24, // px-6
      borderRadius: 8,
      wrapperBorderRadius: 8
    });
};
```

```css
/* app/globals.css */
@layer base {
  :root {
    --ag-preline-bg: theme('colors.white');
    --ag-preline-fg: theme('colors.gray.900');
    --ag-preline-accent: theme('colors.blue.500');
    --ag-preline-font: theme('fontFamily.sans');
  }

  .dark {
    --ag-preline-bg: theme('colors.neutral.900');
    --ag-preline-fg: theme('colors.neutral.100');
    --ag-preline-accent: theme('colors.blue.400');
  }
}
```

### Tier 2: Component-Level Overrides

Fine-tune specific elements:

```css
@layer utilities {
  .ag-theme-quartz {
    --ag-header-background-color: theme('colors.gray.50');
    --ag-header-foreground-color: theme('colors.gray.700');
    --ag-row-hover-color: theme('colors.gray.100');
    --ag-border-color: theme('colors.gray.200');
  }

  .dark .ag-theme-quartz {
    --ag-header-background-color: theme('colors.neutral.800');
    --ag-row-hover-color: theme('colors.neutral.700');
    --ag-border-color: theme('colors.neutral.700');
  }
}
```

### Tier 3: Cell-Level Styling

Use Tailwind utilities via `cellClass` and `cellClassRules`:

```typescript
const columnDefs: ColDef[] = [
  {
    field: 'status',
    cellClassRules: {
      'bg-teal-100 text-teal-800 dark:bg-teal-500/10 dark:text-teal-500':
        params => params.value === 'active',
      'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-500':
        params => params.value === 'inactive'
    }
  }
];
```

### Tier 4: Custom Cell Renderers

For complex interactive elements:

```typescript
// components/ag-grid/renderers/StatusBadge.tsx
import { memo } from 'react';
import { CustomCellRendererProps } from 'ag-grid-react';

export const StatusBadge = memo((props: CustomCellRendererProps) => {
  const statusClasses = {
    active: 'bg-teal-100 text-teal-800 dark:bg-teal-500/10 dark:text-teal-500',
    inactive: 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-500'
  };

  return (
    <span className={`inline-flex items-center px-1.5 py-1 rounded-full text-xs font-medium ${statusClasses[props.value]}`}>
      {props.value}
    </span>
  );
});
```

## Technical Decisions

### Decision 1: Use Theming API (Not Legacy CSS)

**Rationale**:
- TypeScript safety with autocomplete
- Prevents CSS cascade conflicts
- Maintains upgrade path (CSS structure changes in minor versions)
- Enables dynamic theme switching

**Alternative Rejected**: Legacy CSS imports (`ag-theme-alpine.css`)
- Breaks with framework updates
- No TypeScript validation
- Cannot mix with Theming API

### Decision 2: CSS Custom Properties Bridge

**Rationale**:
- Maintains single source of truth (Tailwind config)
- Supports both light and dark modes
- Works with next-themes
- Respects Tailwind's design token system

**Alternative Rejected**: Direct Tailwind classes on AG Grid elements
- Specificity battles
- Doesn't work for all AG Grid internals
- Breaks virtual scrolling performance

### Decision 3: Client-Side Components Only

**Rationale**:
- AG Grid requires JavaScript (virtual scrolling, interactivity)
- Next.js Server Components don't support client interactivity
- Avoids SSR hydration complexity

**Implementation**: All grid components use `"use client"` directive

### Decision 4: Testing Framework - Vitest + React Testing Library

**Rationale**:
- Vitest: Faster than Jest, better Vite/Next.js integration
- React Testing Library: Aligns with accessibility testing goals
- Skip AG Grid internals (already tested by library)
- Focus on theme application and integration points

**Alternative Considered**: Jest (slower, more configuration for Next.js 15)

## References

### AG Grid Documentation
- Theming API: https://www.ag-grid.com/react-data-grid/theming-api/
- Theme Parameters: https://www.ag-grid.com/react-data-grid/theming-parameters/
- Cell Renderers: https://www.ag-grid.com/react-data-grid/component-cell-renderer/
- React Hooks: https://www.ag-grid.com/react-data-grid/react-hooks/
- TypeScript Generics: https://www.ag-grid.com/react-data-grid/typescript-generics/

### Preline UI Documentation
- Main Docs: https://preline.co/docs/
- Tables: https://preline.co/docs/tables.html
- Dark Mode: https://preline.co/docs/dark-mode.html
- Pro Example: https://preline.co/pro/examples/tables-orders.html

### Community Resources
- AG Grid Tailwind Integration (GitHub #5708): https://github.com/ag-grid/ag-grid/issues/5708
- AG Grid Blog - New Theming API: https://blog.ag-grid.com/introducing-our-new-theming-api/
- LogRocket AG Grid Guide: https://blog.logrocket.com/ag-grid-react-guide-alternatives/

## Next Steps

After research completion, proceed to Phase 1:
1. Generate data-model.md (UI state models, grid configuration types)
2. Generate contracts/ (component prop interfaces, event handlers)
3. Generate quickstart.md (setup instructions, example usage)
4. Update agent context with learned technologies
