# Styling Guide - CSS Variables ↔ Tailwind

## OfficeFreund Brand Colors

```
Primary:    #3a86ff  →  hsl(220, 100%, 61%)
Charcoal:   #1e1e1e  →  hsl(0, 0%, 12%)
Gray:       #8d95a3  →  hsl(214, 14%, 61%)
White:      #ffffff  →  hsl(0, 0%, 100%)
```

**Font:** Rethink Sans (Google Fonts)

---

## Two Systems, One Brand

### 1. Preline Components (Tailwind)

**Location:** `app/globals.css`

```css
:root {
  --primary: 220 100% 61%;              /* #3a86ff */
  --foreground: 0 0% 12%;               /* #1e1e1e */
  --muted-foreground: 214 14% 61%;      /* #8d95a3 */
}
```

**Usage in components:**
```jsx
<button className="bg-primary text-primary-foreground">
  Click me
</button>
```

**Dark mode:**
```css
.dark {
  --primary: 220 100% 65%;  /* Lighter for dark mode */
}
```

---

### 2. AG Grid Tables (CSS Variables)

**Location:** `app/ag-grid-officefreund-theme.css`

```css
.ag-theme-quartz {
  --ag-background-color: hsl(0, 0%, 100%);       /* White */
  --ag-foreground-color: hsl(0, 0%, 12%);        /* Charcoal */
  --ag-border-color: hsl(214, 14%, 90%);         /* Light gray */
}

/* Brand color for interactive elements */
.ag-theme-quartz .ag-paging-button {
  color: hsl(220, 100%, 61%) !important;  /* #3a86ff */
}
```

**Dark mode:**
```css
.ag-theme-quartz-dark {
  --ag-background-color: hsl(0, 0%, 12%);   /* Charcoal */
  --ag-foreground-color: hsl(0, 0%, 98%);   /* White */
}
```

---

## Converting Colors

### Hex → HSL (for Tailwind/CSS variables)

```javascript
// #3a86ff → hsl(220, 100%, 61%)
// Use online tool: https://www.rapidtables.com/convert/color/hex-to-hsl.html
```

### Extracting from Preline

1. Inspect Preline component in browser DevTools
2. Find computed color (e.g., `rgb(58, 134, 255)`)
3. Convert to HSL: `hsl(220, 100%, 61%)`
4. Apply to your system:
   - **Tailwind:** `--primary: 220 100% 61%` (no `hsl()` wrapper)
   - **AG Grid:** `hsl(220, 100%, 61%)` (with `hsl()` wrapper)

---

## Dark Mode

### Tailwind (Automatic)
```css
.dark {
  --primary: 220 100% 65%;  /* Lighter version */
}
```

### AG Grid (Manual)
```jsx
const { theme } = useTheme();

<div className={theme === 'dark' ? 'ag-theme-quartz-dark' : 'ag-theme-quartz'}>
  <AgGridReact ... />
</div>
```

---

## Updating Brand Colors

### Step 1: Update Tailwind (Preline components)

**File:** `app/globals.css`

```css
:root {
  --primary: [NEW HSL];  /* Light mode */
}

.dark {
  --primary: [NEW HSL LIGHTER];  /* Dark mode */
}
```

### Step 2: Update AG Grid

**File:** `app/ag-grid-officefreund-theme.css`

Search and replace:
- `hsl(220, 100%, 61%)` → New primary color
- `hsl(0, 0%, 12%)` → New charcoal color
- `hsl(214, 14%, 61%)` → New gray color

---

## Typography

### Tailwind
```css
body {
  font-family: 'Rethink Sans', sans-serif;
}
```

### AG Grid
```css
.ag-theme-quartz {
  font-family: 'Rethink Sans', sans-serif !important;
}
```

---

## Quick Reference

| Component Type | System | File | Format |
|----------------|--------|------|--------|
| Buttons, Cards, Forms | Tailwind | `globals.css` | `--primary: 220 100% 61%` |
| Data Tables | CSS Variables | `ag-grid-officefreund-theme.css` | `hsl(220, 100%, 61%)` |

**Key Difference:** Tailwind CSS variables don't use `hsl()` wrapper, AG Grid CSS does.

---

## Testing

```bash
npm run dev
```

1. Check Preline components use brand colors (buttons, badges, links)
2. Check AG Grid table uses brand colors (selected rows, pagination, focus)
3. Toggle dark mode → verify both systems switch correctly

---

## Maintenance

**When rebranding:**
1. Update `app/globals.css` (2 places: `:root` and `.dark`)
2. Update `app/ag-grid-officefreund-theme.css` (search/replace)
3. Test light and dark modes

