# AG-Grid Preline Pro Integration Research & Strategy

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Target Design Requirements](#target-design-requirements)
4. [AG-Grid Theming Capabilities](#ag-grid-theming-capabilities)
5. [Component Mapping Strategy](#component-mapping-strategy)
6. [Implementation Approach](#implementation-approach)
7. [Technical Challenges & Solutions](#technical-challenges-solutions)
8. [Proof of Concept Plan](#proof-of-concept-plan)

## Executive Summary

This document outlines the strategy for integrating Preline Pro's "Advanced with Searchable Filter Bar" component design with our existing AG-Grid implementation. The goal is to achieve pixel-perfect visual alignment with Preline Pro while maintaining all AG-Grid functionality.

### Key Objectives
- Achieve 100% visual compliance with Preline Pro design
- Maintain all current AG-Grid features (sorting, filtering, pagination, export)
- Support dark mode with proper color scheme
- Ensure responsive design across all viewports
- Keep performance optimized for large datasets

## Current State Analysis

### Existing Implementation
- **Component**: `/components/invoices/invoice-table-ag-grid.tsx`
- **Theme**: Custom CSS in `/app/ag-grid-preline-theme.css`
- **Framework**: AG-Grid Community v31+ with React
- **Features**: Sorting, filtering, pagination, CSV export, row selection, custom cell renderers

### Current Styling Approach
- Uses AG-Grid's Quartz theme as base
- Custom CSS variables for colors
- Overrides for padding, borders, typography
- Dark mode support with theme switching

### Strengths
1. Working AG-Grid integration
2. Custom theme already in place
3. Dark mode support
4. Custom cell renderers for status badges, actions

### Gaps to Address
1. Tab navigation (All, Archived, Publish, Unpublish)
2. Advanced search with icon placement
3. Date range selector with calendar widget
4. Filter dropdown with checkbox options
5. Preline Pro specific UI components
6. Empty states for each tab
7. More sophisticated pagination controls

## Target Design Requirements

### Visual Elements from Preline Pro

#### 1. Card Container
- **Light**: `bg-white border border-stone-200 shadow-2xs rounded-xl`
- **Dark**: `bg-neutral-800 border-neutral-700`
- Padding: `p-5 space-y-4`

#### 2. Tab Navigation
- Tabs with underline indicator
- Tab states: active/inactive
- Counter badges per tab
- Bottom border effect

#### 3. Search & Filters Bar
- Search input with left icon
- Date range dropdown with dual calendar
- Filter button with badge counter
- Grid layout: `md:grid-cols-2`

#### 4. Table Structure
- Checkbox column for selection
- Sortable headers with dropdown menus
- Status badges with specific colors
- Payment method icons
- Actions dropdown per row
- Responsive scrolling

#### 5. Pagination
- "X of Y results" text
- Page navigation with prev/next
- "1 of 3" page indicator

#### 6. Empty States
- Custom SVG illustration
- Title and description text
- Call-to-action button

## AG-Grid Theming Capabilities

### 1. CSS Variable System
AG-Grid provides comprehensive CSS variables for customization:
```css
--ag-background-color
--ag-foreground-color
--ag-border-color
--ag-header-background-color
--ag-row-hover-color
```

### 2. Custom Components
AG-Grid allows complete replacement of components:
- Header components
- Cell renderers
- Filter components
- Overlay components
- Tool panels

### 3. Theme Builder Options
- Start from existing theme (Quartz)
- Override specific properties
- Custom component injection
- Dynamic theme switching

### 4. Layout Control
- DOM structure customization
- Grid container wrapping
- External component integration
- Custom toolbar placement

## Component Mapping Strategy

### Preline Pro → AG-Grid Mapping

| Preline Pro Element | AG-Grid Feature | Implementation Method |
|-------------------|-----------------|----------------------|
| Tab Navigation | External Component | Wrap AG-Grid with tabs |
| Search Bar | Quick Filter API | Custom search component |
| Date Range | Column Filter | Custom date filter |
| Filter Dropdown | Column Filters | Custom filter UI |
| Checkbox Selection | Row Selection | Built-in with styling |
| Sort Dropdowns | Sort API | Custom header component |
| Status Badges | Cell Renderer | Existing, needs styling |
| Payment Icons | Cell Renderer | Add icon mapping |
| Actions Menu | Cell Renderer | Update dropdown styling |
| Pagination | Pagination Bar | Custom pagination component |
| Empty States | No Rows Overlay | Custom overlay component |

## Implementation Approach

### Phase 1: Container & Layout (Week 1)
1. Create new wrapper component `InvoiceTablePrelinePro.tsx`
2. Implement tab navigation structure
3. Add search and filter bar layout
4. Integrate existing AG-Grid component

### Phase 2: Component Styling (Week 1-2)
1. Update card container styling
2. Implement Preline Pro color scheme
3. Apply typography and spacing
4. Update cell renderers for badges/icons

### Phase 3: Advanced Features (Week 2)
1. Implement date range picker
2. Create filter dropdown component
3. Add calendar widget integration
4. Update pagination controls

### Phase 4: Interactions & Polish (Week 2-3)
1. Add empty states per tab
2. Implement dropdown animations
3. Add loading states
4. Test responsive behavior

## Technical Challenges & Solutions

### Challenge 1: Tab Navigation Integration
**Issue**: AG-Grid doesn't have built-in tab navigation
**Solution**:
- Create wrapper component with tabs
- Filter data based on active tab
- Maintain separate state per tab

### Challenge 2: Custom Header Components
**Issue**: Preline Pro uses dropdown menus in headers
**Solution**:
```typescript
const CustomHeader = (props) => {
  return (
    <div className="flex items-center justify-between">
      <span>{props.displayName}</span>
      <DropdownMenu />
    </div>
  );
};
```

### Challenge 3: Date Range Picker
**Issue**: Complex calendar widget integration
**Solution**:
- Use external date picker library
- Connect to AG-Grid filter API
- Implement as toolbar component

### Challenge 4: Maintaining Performance
**Issue**: Additional UI components may impact performance
**Solution**:
- Use React.memo for custom components
- Implement virtual scrolling
- Lazy load calendar widget
- Debounce search input

### Challenge 5: Dark Mode Consistency
**Issue**: Multiple component libraries with different theming
**Solution**:
- Use CSS variables for all colors
- Implement theme context provider
- Map Preline colors to AG-Grid variables

## Proof of Concept Plan

### Step 1: Basic Integration (Day 1)
```typescript
// Create wrapper component
export function InvoiceTablePrelinePro() {
  return (
    <div className="p-5 space-y-4 bg-white border border-stone-200 shadow-2xs rounded-xl">
      <TabNavigation />
      <SearchFilterBar />
      <AgGridReact />
      <CustomPagination />
    </div>
  );
}
```

### Step 2: Style Mapping (Day 2)
- Apply Preline Pro colors via CSS
- Update existing theme file
- Test dark mode switching

### Step 3: Component Integration (Day 3)
- Add one custom header
- Implement search functionality
- Create basic empty state

### Success Criteria
1. Visual match to Preline Pro screenshot
2. All AG-Grid features functional
3. Performance metrics maintained
4. Dark mode working correctly
5. Responsive on mobile/tablet

## Migration Path

### From Current to New Implementation
1. **Parallel Development**: Keep existing component while developing new
2. **Feature Flag**: Use environment variable to switch between versions
3. **Gradual Rollout**: Test with subset of users
4. **Fallback Plan**: Easy revert if issues arise

### Code Organization
```
components/
  invoices/
    invoice-table-ag-grid.tsx         (current)
    invoice-table-preline-pro.tsx     (new)
    components/
      tab-navigation.tsx
      search-filter-bar.tsx
      custom-pagination.tsx
      empty-states.tsx
```

## Resource Requirements

### Dependencies
- AG-Grid Community (existing)
- Date picker library (react-datepicker or similar)
- Icon library for payment methods
- Preline UI CSS classes

### Development Time
- Research & Planning: 1 day ✓
- Implementation: 3-5 days
- Testing & Refinement: 2 days
- Total: ~1 week

## Next Steps

1. **Immediate Actions**:
   - Set up new component structure
   - Create basic wrapper with tabs
   - Test integration approach

2. **Validation**:
   - Review with design team
   - Get stakeholder approval
   - Confirm feature requirements

3. **Implementation**:
   - Start with Phase 1 layout
   - Incremental feature addition
   - Regular testing checkpoints

## Appendix

### Color Mappings
```css
/* Preline Pro → AG-Grid Variables */
--ag-background-color: white;           /* Preline: bg-white */
--ag-border-color: rgb(231 229 228);    /* Preline: border-stone-200 */
--ag-header-background-color: rgb(250 250 249); /* Preline: bg-stone-50 */
--ag-row-hover-color: rgb(250 250 249); /* Preline: hover:bg-stone-100 */
```

### Typography Mappings
```css
/* Headers */
font-size: 0.75rem;  /* text-xs */
font-weight: 600;    /* font-semibold */

/* Body */
font-size: 0.875rem; /* text-sm */
line-height: 1.25rem;
```

### Spacing Mappings
```css
/* Cell Padding */
padding: 0.75rem 1.25rem; /* py-3 px-5 */

/* Container */
padding: 1.25rem;         /* p-5 */
gap: 1rem;               /* space-y-4 */
```