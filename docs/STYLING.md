# Styling Guide - Preline UI Integration

This guide documents how we style third-party components to match our Preline-inspired design system.

---

## Table of Contents

1. [Overview](#overview)
2. [Our Design System](#our-design-system)
3. [Preline Research Findings](#preline-research-findings)
4. [AG Grid Styling Case Study](#ag-grid-styling-case-study)
5. [General Styling Patterns](#general-styling-patterns)
6. [Color Palette Reference](#color-palette-reference)
7. [Typography Guidelines](#typography-guidelines)
8. [Dark Mode Strategy](#dark-mode-strategy)
9. [How to Style Other Components](#how-to-style-other-components)

---

## Overview

**The Challenge:** Third-party components like AG Grid, charting libraries, or date pickers often come with their own styling that doesn't match your design system.

**Our Approach:**
1. Research Preline's official design patterns
2. Extract color palette and typography from Preline examples
3. Map our application's CSS variables to the third-party component's styling system
4. Create custom CSS overlays that match both Preline patterns and our app's exact colors

**Result:** Seamless visual consistency across all components, native and third-party.

---

## Our Design System

Located in `app/globals.css`, we use CSS variables following Preline's color scheme with a **blue-tinted slate** palette for dark mode:

### Light Mode
```css
:root {
  --background: 0 0% 98%;           /* #fafafa - very light gray */
  --foreground: 240 10% 3.9%;       /* #09090b - almost black */
  --card: 0 0% 100%;                /* #ffffff - pure white */
  --border: 214.3 31.8% 91.4%;      /* #e5e7eb - light gray */
  --primary: 221 83% 53%;           /* #3b82f6 - blue-500 */
  --muted: 210 40% 96.1%;           /* #f3f4f6 - gray-100 */
  --muted-foreground: 215.4 16.3% 46.9%; /* #6b7280 - gray-500 */
}
```

### Dark Mode
```css
.dark {
  --background: 222.2 84% 4.9%;     /* #020617 - slate-950 (blue-tinted) */
  --foreground: 210 40% 98%;        /* #f8fafc - almost white */
  --card: 222.2 84% 4.9%;           /* #020617 - matches background */
  --border: 217.2 32.6% 17.5%;      /* #1e293b - slate-800 */
  --primary: 217.2 91.2% 59.8%;     /* #60a5fa - blue-400 (lighter) */
  --muted: 217.2 32.6% 17.5%;       /* #1e293b - slate-800 */
  --muted-foreground: 215 20.2% 65.1%; /* #94a3b8 - slate-400 */
}
```

**Key Insight:** Our dark mode uses a **slate color scheme** (`hsl(222.2, 84%, 4.9%)`) rather than pure black or neutral grays. This gives the app a modern, cohesive blue-tinted look.

---

## Preline Research Findings

### Official Documentation Status

**Finding:** Preline does **NOT** have an official styling guide for integrating third-party components.

**What Preline Provides:**
- ✅ Official table examples: [Application Tables](https://preline.co/examples/application-tables.html)
- ✅ Base table components: [Tables Docs](https://preline.co/docs/tables.html)
- ❌ No official theming API for third-party libraries
- ❌ No CSS variable system for external components

### Extracting Preline's Design Language

Since Preline doesn't provide a formal styling guide, we **reverse-engineered** their design patterns from their official examples:

#### 1. Tables (from preline.co/examples/application-tables.html)

**Light Mode:**
```html
<!-- Header Row -->
<thead class="bg-gray-50 dark:bg-neutral-800">
  <th class="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-800">
    Invoice
  </th>
</thead>

<!-- Body Rows -->
<tbody class="divide-y divide-gray-200 dark:divide-neutral-700">
  <tr class="hover:bg-gray-100 dark:hover:bg-gray-700">
    <td class="px-6 py-3 text-sm text-gray-800 dark:text-neutral-200">
      INV-001
    </td>
  </tr>
</tbody>
```

**Extracted Patterns:**
- **Header Background:** `bg-gray-50` (#f9fafb)
- **Header Text:** `text-xs font-semibold uppercase tracking-wide`
- **Cell Padding:** `px-6 py-3` (24px horizontal, 12px vertical)
- **Borders:** `divide-gray-200` (#e5e7eb)
- **Hover:** `hover:bg-gray-100` (#f3f4f6)
- **Text Color:** `text-gray-800` (#1f2937)

**Dark Mode:**
- **Header Background:** `dark:bg-neutral-800` (#1f2937)
- **Borders:** `dark:divide-neutral-700` (#404040)
- **Hover:** `dark:hover:bg-gray-700` (#374151)
- **Text:** `dark:text-neutral-200` (#e5e7eb)

#### 2. Cards (from Preline examples)

```html
<div class="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-sm">
  <!-- Card content -->
</div>
```

**Extracted Patterns:**
- **Border Radius:** `rounded-xl` (0.75rem / 12px)
- **Shadow:** `shadow-sm` (subtle)
- **Border:** 1px solid border-color

---

## AG Grid Styling Case Study

AG Grid is a perfect example of styling a complex third-party component to match Preline patterns.

### Challenge

AG Grid ships with its own theme system (`ag-theme-quartz`) that uses:
- Neutral grays (`#171717`, `#1f2937`)
- Different padding and borders
- Generic styling that doesn't match Preline

**The Problem:**
```css
/* AG Grid's default dark theme */
.ag-theme-quartz-dark {
  --ag-background-color: #171717;  /* ❌ Neutral gray, not slate */
  --ag-border-color: #404040;       /* ❌ Doesn't match our borders */
}
```

This creates visual inconsistency - the table looks like it's from a different app.

### Solution: Custom Theme Override

We created `app/ag-grid-preline-theme.css` that:
1. Overrides AG Grid's default colors
2. Applies Preline's design patterns
3. Uses our application's exact CSS variables

### Implementation Breakdown

#### Step 1: Map App Colors to AG Grid Variables

```css
.ag-theme-quartz-dark {
  /* Use our app's colors instead of AG Grid's defaults */
  --ag-background-color: hsl(222.2, 84%, 4.9%);  /* ✅ Our --background */
  --ag-foreground-color: hsl(210, 40%, 98%);      /* ✅ Our --foreground */
  --ag-border-color: hsl(217.2, 32.6%, 17.5%);   /* ✅ Our --border */
  --ag-border-radius: 0.75rem;                    /* ✅ Preline's rounded-xl */

  /* Apply to container */
  border: 1px solid hsl(217.2, 32.6%, 17.5%) !important;
  border-radius: 0.75rem !important;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.3) !important;
  overflow: hidden;
}
```

**Why This Works:**
- AG Grid's CSS variables control the base colors
- We override them with our app's exact HSL values
- The grid now uses the same colors as cards, buttons, and other UI elements

#### Step 2: Apply Preline Typography

```css
.ag-theme-quartz-dark .ag-header-cell {
  /* Preline's table header styling */
  background-color: hsl(217.2, 32.6%, 17.5%) !important;  /* slate-800 */
  color: hsl(210, 40%, 98%) !important;                   /* foreground */
  font-size: 0.75rem !important;          /* text-xs */
  font-weight: 600 !important;            /* font-semibold */
  text-transform: uppercase !important;   /* uppercase */
  letter-spacing: 0.05em !important;      /* tracking-wide */
  padding: 12px 24px !important;          /* py-3 px-6 */
  border-right: none !important;          /* No vertical dividers */
}
```

**Preline Pattern Applied:**
| Property | Preline Class | CSS Value |
|----------|---------------|-----------|
| Font Size | `text-xs` | `0.75rem` (12px) |
| Font Weight | `font-semibold` | `600` |
| Transform | `uppercase` | `uppercase` |
| Letter Spacing | `tracking-wide` | `0.05em` |
| Padding | `px-6 py-3` | `24px 12px` |

#### Step 3: Match Preline's Interaction States

```css
/* Row Hover */
.ag-theme-quartz-dark .ag-row:hover {
  background-color: hsl(217.2, 32.6%, 17.5%) !important;  /* slate-800 */
}

/* Selected Row */
.ag-theme-quartz-dark .ag-row-selected {
  background-color: hsl(217.2, 32.6%, 17.5%) !important;
  border-left: 2px solid hsl(217.2, 91.2%, 59.8%) !important;  /* primary accent */
}

/* Focus Border */
.ag-theme-quartz-dark .ag-cell-focus {
  border: 1px solid hsl(217.2, 91.2%, 59.8%) !important;  /* primary */
  outline: none !important;
}
```

**Preline Pattern Applied:**
- Hover uses the same slate-800 as Preline tables
- Selected rows get a primary-colored accent border (common Preline pattern)
- Focus states use the primary color for consistency

#### Step 4: Dynamic Dark Mode Switching

AG Grid requires JavaScript for dark mode (Tailwind's `dark:` classes don't work on external CSS):

```tsx
import { useTheme } from 'next-themes';

export function InvoiceTableAgGrid() {
  const { theme } = useTheme();

  return (
    <div className={theme === 'dark' ? 'ag-theme-quartz-dark' : 'ag-theme-quartz'}>
      <AgGridReact ... />
    </div>
  );
}
```

**Why This Pattern:**
- `next-themes` provides the current theme state
- We dynamically set the wrapper class based on theme
- The grid immediately re-renders with the correct theme when toggled

### Result

**Before:** AG Grid looked like a generic data grid with neutral colors.

**After:** AG Grid is indistinguishable from a native Preline table - same colors, typography, spacing, and interactions.

**Verification:**
- ✅ Headers match Preline's `bg-gray-50` (light) / `slate-800` (dark)
- ✅ Cell padding matches Preline's `px-6 py-3`
- ✅ Borders use app's `--border` color
- ✅ Dark mode uses app's slate color scheme, not neutral grays
- ✅ Hover states match Preline table hover color exactly

---

## General Styling Patterns

### Pattern 1: Override Component CSS Variables

Many modern components expose CSS variables (aka CSS custom properties) for theming.

**Example: AG Grid**
```css
.ag-theme-quartz {
  --ag-background-color: #ffffff;
  --ag-foreground-color: #000000;
  --ag-border-color: #ddd;
}
```

**Strategy:**
1. Read the component's documentation to find CSS variables
2. Map your app's colors to their variables
3. Override in a custom CSS file

**Template:**
```css
/* components/your-component-theme.css */
.component-theme {
  --component-bg: hsl(var(--background));
  --component-text: hsl(var(--foreground));
  --component-border: hsl(var(--border));
  --component-primary: hsl(var(--primary));
}
```

### Pattern 2: Extract Design Tokens from Preline

When styling a new component, reference Preline's actual HTML:

**Steps:**
1. Go to [Preline Examples](https://preline.co/examples)
2. Find a similar component (table, card, form, etc.)
3. Inspect the HTML in browser DevTools
4. Extract Tailwind classes
5. Convert to CSS values

**Example: Button Styling**

Preline button:
```html
<button class="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700">
  Click me
</button>
```

Extract design tokens:
- `py-3` = padding-top/bottom: 12px
- `px-4` = padding-left/right: 16px
- `text-sm` = font-size: 0.875rem (14px)
- `font-medium` = font-weight: 500
- `rounded-lg` = border-radius: 0.5rem (8px)
- `bg-blue-600` = background: #3b82f6
- `hover:bg-blue-700` = hover: #2563eb

Apply to your component:
```css
.custom-button {
  padding: 12px 16px;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.5rem;
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

.custom-button:hover {
  background-color: hsl(var(--primary) / 0.9);
}
```

### Pattern 3: Scoped CSS Files

Keep component styling organized:

```
app/
├── globals.css (base styles)
├── ag-grid-preline-theme.css (AG Grid overrides)
├── chart-preline-theme.css (chart library overrides)
└── datepicker-preline-theme.css (datepicker overrides)
```

Import in the component that uses it:
```tsx
import '@/app/ag-grid-preline-theme.css';
```

**Why:**
- Easy to find and modify
- Won't affect other components
- Clear ownership

### Pattern 4: Document Your Decisions

Always add comments explaining why you chose specific values:

```css
/* ============================================================================
   DARK MODE STYLING - Matching App's Slate Color Scheme
   ============================================================================ */

.ag-theme-quartz-dark {
  /* Use app's slate background instead of AG Grid's neutral gray (#171717) */
  --ag-background-color: hsl(222.2, 84%, 4.9%); /* --background: #020617 */

  /* Use app's border color for consistency with cards and dialogs */
  --ag-border-color: hsl(217.2, 32.6%, 17.5%); /* --border: #1e293b */
}
```

**Benefits:**
- Future developers understand your reasoning
- Easier to maintain as the design evolves
- Clear connection between app colors and component colors

---

## Color Palette Reference

### Light Mode Colors

| Purpose | Preline Class | Hex | HSL | Usage |
|---------|---------------|-----|-----|-------|
| Background | `bg-white` | `#ffffff` | `0 0% 100%` | Page background, cards |
| Headers | `bg-gray-50` | `#f9fafb` | `210 20% 98%` | Table headers, subtle sections |
| Borders | `border-gray-200` | `#e5e7eb` | `214 32% 91%` | All borders and dividers |
| Hover | `hover:bg-gray-100` | `#f3f4f6` | `214 32% 96%` | Interactive hover states |
| Text Primary | `text-gray-800` | `#1f2937` | `216 28% 17%` | Body text, headings |
| Text Muted | `text-gray-500` | `#6b7280` | `215 16% 47%` | Secondary text, labels |
| Primary | `bg-blue-600` | `#3b82f6` | `221 83% 53%` | Buttons, links, accents |

### Dark Mode Colors

| Purpose | Our Color | Hex | HSL | Usage |
|---------|-----------|-----|-----|-------|
| Background | `--background` | `#020617` | `222.2 84% 4.9%` | Page background, cards |
| Headers | `slate-800` | `#1e293b` | `217.2 33% 17%` | Table headers, sections |
| Borders | `--border` | `#1e293b` | `217.2 33% 17%` | All borders and dividers |
| Hover | `slate-800` | `#1e293b` | `217.2 33% 17%` | Interactive hover states |
| Text Primary | `--foreground` | `#f8fafc` | `210 40% 98%` | Body text, headings |
| Text Muted | `slate-400` | `#94a3b8` | `215 20% 65%` | Secondary text, labels |
| Primary | `blue-400` | `#60a5fa` | `217.2 91% 60%` | Buttons, links, accents |

**Key Difference:** We use a **slate color scheme** instead of Preline's suggested neutrals. This gives a more modern, cohesive look.

---

## Typography Guidelines

Preline uses a consistent typographic scale. Here are the most common patterns:

### Headings

```css
/* Page Title */
.page-title {
  font-size: 1.875rem;    /* text-3xl: 30px */
  font-weight: 700;       /* font-bold */
  line-height: 2.25rem;
  letter-spacing: -0.025em; /* tracking-tight */
}

/* Section Title */
.section-title {
  font-size: 1.5rem;      /* text-2xl: 24px */
  font-weight: 700;       /* font-bold */
  line-height: 2rem;
}

/* Card Title */
.card-title {
  font-size: 1.125rem;    /* text-lg: 18px */
  font-weight: 600;       /* font-semibold */
  line-height: 1.75rem;
}
```

### Body Text

```css
/* Regular Body */
.body {
  font-size: 0.875rem;    /* text-sm: 14px */
  font-weight: 400;       /* font-normal */
  line-height: 1.25rem;
}

/* Small Text */
.small {
  font-size: 0.75rem;     /* text-xs: 12px */
  font-weight: 400;       /* font-normal */
  line-height: 1rem;
}

/* Muted Text */
.muted {
  font-size: 0.875rem;    /* text-sm: 14px */
  font-weight: 400;       /* font-normal */
  color: hsl(var(--muted-foreground));
}
```

### Special Cases

```css
/* Table Headers (uppercase labels) */
.table-header {
  font-size: 0.75rem;     /* text-xs: 12px */
  font-weight: 600;       /* font-semibold */
  text-transform: uppercase;
  letter-spacing: 0.05em; /* tracking-wide */
}

/* Badges / Tags */
.badge {
  font-size: 0.75rem;     /* text-xs: 12px */
  font-weight: 500;       /* font-medium */
  line-height: 1rem;
}

/* Buttons */
.button {
  font-size: 0.875rem;    /* text-sm: 14px */
  font-weight: 500;       /* font-medium */
  line-height: 1.25rem;
}
```

---

## Dark Mode Strategy

### Approach: CSS Variables + Dynamic Classes

**Our app uses:**
```tsx
import { ThemeProvider } from 'next-themes';

function App() {
  return (
    <ThemeProvider attribute="class">
      {children}
    </ThemeProvider>
  );
}
```

This adds a `class="dark"` to the `<html>` element when dark mode is active.

### For Tailwind Components

Tailwind's `dark:` modifier works automatically:

```tsx
<div className="bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100">
  Content
</div>
```

### For Third-Party Components

Most third-party components don't support Tailwind's `dark:` modifier. Use dynamic class switching:

```tsx
import { useTheme } from 'next-themes';

export function ThirdPartyComponent() {
  const { theme } = useTheme();

  return (
    <div className={theme === 'dark' ? 'component-dark' : 'component-light'}>
      <ExternalComponent />
    </div>
  );
}
```

**CSS:**
```css
/* Light theme */
.component-light {
  --component-bg: #ffffff;
  --component-text: #000000;
}

/* Dark theme */
.component-dark {
  --component-bg: hsl(222.2, 84%, 4.9%);  /* Your app's dark background */
  --component-text: hsl(210, 40%, 98%);   /* Your app's dark text */
}
```

### Ensuring Consistent Colors

**Problem:** Many libraries use hardcoded colors like `#171717` or `#1f2937` (neutral grays).

**Solution:** Override with your app's exact colors:

```css
/* ❌ Don't use generic grays */
.component-dark {
  background: #171717;  /* Generic neutral gray */
}

/* ✅ Use your app's colors */
.component-dark {
  background: hsl(222.2, 84%, 4.9%);  /* Your --background with blue tint */
}
```

This ensures the component matches your overall color scheme, not just "dark mode" in general.

---

## How to Style Other Components

Follow this checklist when integrating a new third-party component:

### 1. Research Phase

- [ ] Check if the component has a theming API or CSS variables
- [ ] Find similar components in [Preline Examples](https://preline.co/examples)
- [ ] Extract design tokens (colors, spacing, typography)
- [ ] Identify interaction states (hover, focus, active, disabled)

### 2. Color Mapping

- [ ] List all colors the component uses
- [ ] Map each color to your app's CSS variables:
  - Background → `hsl(var(--background))`
  - Text → `hsl(var(--foreground))`
  - Borders → `hsl(var(--border))`
  - Primary/Accent → `hsl(var(--primary))`
  - Muted → `hsl(var(--muted))`

### 3. Implementation

- [ ] Create a scoped CSS file: `app/[component]-preline-theme.css`
- [ ] Override component's CSS variables or classes
- [ ] Apply Preline typography patterns
- [ ] Implement dark mode support
- [ ] Test with both light and dark themes

### 4. Documentation

- [ ] Add comments explaining color choices
- [ ] Reference Preline examples you based styling on
- [ ] Document any deviations from Preline patterns
- [ ] Update this STYLING_GUIDE.md if you discover new patterns

### Example: Styling a Chart Library

**Scenario:** You're adding Chart.js or Recharts to display invoice statistics.

**Steps:**

1. **Find Preline's chart examples:**
   - Visit [Preline Examples](https://preline.co/examples)
   - Look for dashboard or analytics examples
   - Note the colors used for charts

2. **Extract color palette:**
   ```tsx
   // From Preline dashboard examples
   const chartColors = {
     primary: '#3b82f6',    // blue-600
     success: '#10b981',    // green-500
     warning: '#f59e0b',    // amber-500
     danger: '#ef4444',     // red-500
     muted: '#6b7280',      // gray-500
   };
   ```

3. **Create theme file:**
   ```typescript
   // app/chart-preline-theme.ts
   import { useTheme } from 'next-themes';

   export function useChartTheme() {
     const { theme } = useTheme();

     return {
       backgroundColor: theme === 'dark'
         ? 'hsl(222.2, 84%, 4.9%)'  // Our dark background
         : '#ffffff',

       textColor: theme === 'dark'
         ? 'hsl(210, 40%, 98%)'     // Our dark text
         : 'hsl(240, 10%, 3.9%)',   // Our light text

       gridColor: theme === 'dark'
         ? 'hsl(217.2, 32.6%, 17.5%)'  // Our dark borders
         : 'hsl(214.3, 31.8%, 91.4%)', // Our light borders

       colors: [
         'hsl(221, 83%, 53%)',      // primary
         'hsl(142, 71%, 45%)',      // success
         'hsl(38, 92%, 50%)',       // warning
         'hsl(0, 84%, 60%)',        // danger
       ],
     };
   }
   ```

4. **Apply to chart:**
   ```tsx
   import { useChartTheme } from '@/app/chart-preline-theme';

   export function InvoiceChart() {
     const chartTheme = useChartTheme();

     return (
       <LineChart
         data={data}
         style={{ backgroundColor: chartTheme.backgroundColor }}
         axisColor={chartTheme.gridColor}
         colors={chartTheme.colors}
       />
     );
   }
   ```

5. **Document:**
   ```typescript
   /**
    * Chart Theme - Preline Integration
    *
    * This theme makes Chart.js match Preline's dashboard examples.
    * Color palette extracted from: https://preline.co/examples/dashboard.html
    *
    * Dark mode uses our app's slate color scheme (hsl(222.2, 84%, 4.9%))
    * instead of Chart.js's default neutral grays.
    */
   ```

---

## Summary

**Key Principles:**

1. **Always reference Preline examples** - Don't guess, extract actual patterns
2. **Use your app's CSS variables** - Don't hardcode colors
3. **Slate over neutral** - Dark mode uses blue-tinted slate, not neutral grays
4. **Document everything** - Explain why, not just what
5. **Test both themes** - Ensure consistency in light and dark mode

**Quick Reference:**

| Task | Pattern |
|------|---------|
| Override colors | Use CSS variables: `hsl(var(--background))` |
| Match typography | Use Preline's text classes: `text-xs font-semibold uppercase` |
| Dark mode | Dynamic class switching with `useTheme()` |
| Spacing | Follow Preline: `px-6 py-3` for tables, `rounded-xl` for cards |
| Borders | Always use `hsl(var(--border))` for consistency |

**Files to Reference:**

- `app/globals.css` - Your app's color variables
- `app/ag-grid-preline-theme.css` - Complete example of styling a third-party component
- [Preline Examples](https://preline.co/examples) - Source of truth for design patterns

---

**Questions?** This is a living document. If you find new patterns or styling challenges, add them here for the team! 🎨
