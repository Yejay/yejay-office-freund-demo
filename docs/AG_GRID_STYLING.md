# AG Grid Styling Guide - Matching Corporate Brand

## Our Approach

**Problem:** AG Grid uses CSS variables. Tailwind uses utility classes. How do we keep them visually consistent?

**Solution:** Define brand colors once → Apply to both systems.

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

## Step 1: Apply to Tailwind (Preline Components)

**File:** `app/globals.css`

```css
:root {
  /* OfficeFreund brand colors */
  --primary: 220 100% 61%;              /* #3a86ff */
  --foreground: 0 0% 12%;               /* #1e1e1e */
  --muted-foreground: 214 14% 61%;      /* #8d95a3 */
}

.dark {
  /* Adjust for dark mode */
  --primary: 220 100% 65%;              /* Lighter blue */
  --foreground: 0 0% 98%;               /* Near-white */
}

body {
  font-family: 'Rethink Sans', sans-serif;
}
```

**Result:** All Preline components (buttons, cards, badges) use brand colors.

```jsx
<button className="bg-primary text-primary-foreground">
  // Automatically uses #3a86ff
</button>
```

---

## Step 2: Apply to AG Grid

**File:** `app/ag-grid-officefreund-theme.css`

### Light Mode

```css
.ag-theme-quartz {
  /* Base colors */
  --ag-background-color: hsl(0, 0%, 100%);        /* White */
  --ag-foreground-color: hsl(0, 0%, 12%);         /* #1e1e1e */
  --ag-border-color: hsl(214, 14%, 90%);          /* Light gray */

  font-family: 'Rethink Sans', sans-serif !important;
}

/* Brand color for interactive elements */
.ag-theme-quartz .ag-paging-button {
  color: hsl(220, 100%, 61%) !important;          /* #3a86ff */
}

.ag-theme-quartz .ag-row-selected {
  background-color: hsl(220, 100%, 97%) !important; /* Very light blue */
  border-left: 3px solid hsl(220, 100%, 61%) !important; /* #3a86ff */
}

.ag-theme-quartz .ag-cell-focus {
  border: 1px solid hsl(220, 100%, 61%) !important; /* #3a86ff */
}
```

### Dark Mode

```css
.ag-theme-quartz-dark {
  --ag-background-color: hsl(0, 0%, 12%);         /* #1e1e1e */
  --ag-foreground-color: hsl(0, 0%, 98%);         /* White */

  font-family: 'Rethink Sans', sans-serif !important;
}

.ag-theme-quartz-dark .ag-paging-button {
  color: hsl(220, 100%, 65%) !important;          /* Lighter for dark mode */
}
```

---

## Step 3: Connect AG Grid to Theme System

**File:** `components/orders/order-table.tsx`

```tsx
import { useTheme } from 'next-themes';

export function OrderTable({ orders }) {
  const { theme } = useTheme();

  return (
    <div className={theme === 'dark' ? 'ag-theme-quartz-dark' : 'ag-theme-quartz'}>
      <AgGridReact rowData={orders} ... />
    </div>
  );
}
```

---

## How It All Works Together

### 1. Define Colors Once

```
#3a86ff → hsl(220, 100%, 61%)
```

### 2. Apply to Tailwind

```css
/* globals.css */
--primary: 220 100% 61%;  /* No hsl() wrapper */
```

### 3. Apply to AG Grid

```css
/* ag-grid-officefreund-theme.css */
color: hsl(220, 100%, 61%);  /* With hsl() wrapper */
```

### 4. Both Systems Match

- Preline button: Uses `bg-primary` → `#3a86ff`
- AG Grid pagination: Uses `hsl(220, 100%, 61%)` → `#3a86ff`
- **Result:** Visually identical across entire app

---

## Customizing for Your Brand

### Update Colors (10 minutes)

**Step 1:** Define your brand colors in Hex

```
Your Primary:   #FF5733
Your Dark:      #2C3E50
Your Gray:      #95A5A6
```

**Step 2:** Convert to HSL

Use: https://www.rapidtables.com/convert/color/hex-to-hsl.html

```
#FF5733 → hsl(9, 100%, 60%)
#2C3E50 → hsl(210, 29%, 24%)
#95A5A6 → hsl(184, 9%, 62%)
```

**Step 3:** Update `globals.css`

```css
:root {
  --primary: 9 100% 60%;
  --foreground: 210 29% 24%;
  --muted-foreground: 184 9% 62%;
}
```

**Step 4:** Update `ag-grid-officefreund-theme.css`

Find and replace:
- `hsl(220, 100%, 61%)` → `hsl(9, 100%, 60%)`
- `hsl(0, 0%, 12%)` → `hsl(210, 29%, 24%)`
- `hsl(214, 14%, 61%)` → `hsl(184, 9%, 62%)`

**Done!** Both systems now use your brand colors.

---

## Key Differences

| System | Format | Example |
|--------|--------|---------|
| **Tailwind** | `H S% L%` (no wrapper) | `--primary: 220 100% 61%` |
| **AG Grid** | `hsl(H, S%, L%)` (with wrapper) | `color: hsl(220, 100%, 61%)` |

**Why?** Tailwind's CSS variable system expects space-separated values. AG Grid expects standard CSS `hsl()` format.

---

## Verifying Consistency

### Check Preline Components
```jsx
<button className="bg-primary">
  Button
</button>
```
→ Should be `#3a86ff`

### Check AG Grid
```css
.ag-theme-quartz .ag-paging-button {
  color: hsl(220, 100%, 61%);
}
```
→ Should also be `#3a86ff`

### Browser DevTools
1. Inspect Preline button → Check computed color
2. Inspect AG Grid pagination → Check computed color
3. Both should show same RGB value: `rgb(58, 134, 255)`

---

## Files to Edit

When changing brand colors:

1. `app/globals.css` (Tailwind/Preline)
2. `app/ag-grid-officefreund-theme.css` (AG Grid)

That's it! Everything else updates automatically.

---

## Result

✅ Single brand color definition
✅ Applied to both Tailwind and AG Grid
✅ Entire app looks cohesive
✅ Easy to update (2 files)
✅ Dark mode works in both systems
