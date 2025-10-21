# Implementation Plan: AG Grid with Preline Design Integration

**Branch**: `001-ag-grid-preline` | **Date**: 2025-10-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ag-grid-preline/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Integrate AG Grid enterprise data table functionality with Preline Pro's modern design system to create a visually cohesive, high-performance data table component. The integration will preserve all AG Grid features (filtering, sorting, grouping, virtual scrolling, inline editing) while applying Tailwind CSS and custom theming to match Preline's aesthetic. This creates reusable table components that combine enterprise-grade functionality with modern UX patterns.

## Technical Context

**Language/Version**: TypeScript 5.x with strict mode enabled (Next.js 15 with React 19)
**Primary Dependencies**:
- AG Grid Community (v34.2.0) - already installed
- AG Grid React (v34.2.0) - already installed
- Preline UI (v3.2.3) - already installed
- Tailwind CSS (v3.4.1) - already installed
- Lucide React (v0.511.0) - for icons

**Storage**: N/A (client-side component library, data provided by parent components)
**Testing**: NEEDS CLARIFICATION - test framework not yet configured (Jest/Vitest + React Testing Library recommended)
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge - last 2 years)
**Project Type**: Web application (Next.js App Router structure with `app/` and `components/` directories)
**Performance Goals**:
- Initial render <500ms for 10k rows
- 60fps scrolling with virtual rendering
- Search/filter updates <200ms
- Sort operations <300ms

**Constraints**:
- Must maintain all AG Grid enterprise features
- Must achieve 100% visual design token alignment with Preline
- Must support both light and dark modes
- Must be keyboard accessible (WCAG AA compliant)
- Client-side only ("use client" components)

**Scale/Scope**:
- Reusable component library for data tables
- Support datasets up to 10,000 rows (virtual scrolling)
- 4 priority levels of features (P1: visual styling, P2: search/filter, P3: sort/paginate, P4: advanced operations)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. Type Safety First

**Status**: COMPLIANT

- TypeScript strict mode already enabled in tsconfig.json
- All AG Grid components will use typed interfaces for column definitions, row data, and grid options
- Custom cell renderers and components will have proper TypeScript definitions
- Zod validation for component props (optional but recommended for public API)

### ✅ II. Security-First Multi-Tenancy (NON-NEGOTIABLE)

**Status**: NOT APPLICABLE

**Justification**: This feature is a client-side UI component library. Multi-tenant data isolation is enforced by parent components and server actions that provide data to the grid. The table component itself does not interact with the database or handle authentication/authorization. RLS and organization context validation remain the responsibility of data-fetching layers.

### ✅ III. Server Actions for Mutations

**Status**: NOT APPLICABLE with CAVEAT

**Justification**: AG Grid is a client-side component ("use client") for data display and interaction. If inline editing is enabled, the component will emit events that parent components handle via Server Actions. The grid itself does not perform mutations—it delegates to parent components who must use Server Actions per the constitution.

**Caveat**: Documentation and examples must clearly demonstrate that edit callbacks should call Server Actions for persistence.

### ✅ IV. Component Composition Over Duplication

**Status**: COMPLIANT

- Will create composable table components in `components/ag-grid/`
- Shared styling utilities and theme configuration extracted to dedicated files
- Custom cell renderers will be reusable across different table instances
- Props will use typed interfaces (not inline types)
- Will avoid duplicating similar table variants

### ✅ V. Progressive Enhancement & Accessibility

**Status**: COMPLIANT with LIMITATION

**Limitation**: AG Grid requires JavaScript to function (not progressively enhanced). However, accessibility requirements will be met:
- Full keyboard navigation support (tab, arrow keys, enter, escape)
- Proper ARIA labels and roles for screen readers
- WCAG AA color contrast in custom theme
- Dark mode support via CSS custom properties
- Focus indicators matching application styles

**Justification**: Data tables with advanced features (sorting, filtering, grouping, virtual scrolling) inherently require JavaScript. The tradeoff is acceptable for this feature type.

### ✅ VI. Testing Strategy

**Status**: NEEDS SETUP

**Current State**: No testing framework configured in project.

**Required Actions**:
1. Set up Jest or Vitest with React Testing Library
2. Focus tests on:
   - Theme application (correct CSS classes/styles applied)
   - Accessibility (keyboard navigation, ARIA labels)
   - Integration with parent components (data flow, event handlers)
3. Skip unit tests for AG Grid internals (already tested by library)
4. Optional: Visual regression tests for dark mode theme

**Gate Decision**: May proceed with Phase 0 research. Testing framework setup will be included in implementation tasks.

### Architecture Standards Compliance

**✅ Next.js 15 App Router Conventions**:
- Components will be placed in `components/ag-grid/`
- Will use "use client" directive (AG Grid requires client-side rendering)
- Will follow shadcn/ui patterns for component structure

**✅ Database Schema & Supabase Integration**:
- N/A (no database interaction in this component)

**✅ Authentication & Clerk Integration**:
- N/A (UI component library, no auth logic)

**✅ Complexity Budget**:
- COMPLIANT: No new backend frameworks, state management libraries, or custom auth
- AG Grid itself is acceptable complexity (educational value: demonstrates enterprise table integration)
- Custom theming demonstrates production-grade design system integration

### Gate Result

**STATUS**: ✅ **PASSED** - Proceed to Phase 0 Research

**Notes**:
- Testing framework setup required but not blocking for research phase
- All constitution principles either compliant or properly justified as N/A
- No unjustified complexity violations

## Project Structure

### Documentation (this feature)

```
specs/001-ag-grid-preline/
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0: AG Grid theming + Preline research
├── data-model.md        # Phase 1: TypeScript interfaces and data structures
├── quickstart.md        # Phase 1: Usage guide and examples
├── contracts/           # Phase 1: Component interface contracts
│   ├── README.md
│   ├── DataGrid.interface.ts
│   ├── GridToolbar.interface.ts
│   └── GridPagination.interface.ts
├── checklists/          # Validation checklists
│   └── requirements.md  # Spec quality validation
└── spec.md              # Feature specification (user stories, requirements)
```

### Source Code (repository root)

**Project Type**: Next.js 15 web application with App Router

```
components/
├── ag-grid/                    # AG Grid + Preline components
│   ├── DataGrid.tsx           # Main grid component
│   ├── GridToolbar.tsx        # Search, filters, actions toolbar
│   ├── GridPagination.tsx     # Pagination controls
│   ├── renderers/             # Custom cell renderers
│   │   ├── StatusBadge.tsx    # Status badge renderer
│   │   └── ActionButtons.tsx  # Row action buttons
│   └── hooks/                 # Grid-related hooks
│       ├── useGridTheme.ts    # Theme configuration hook
│       └── useGridState.ts    # Grid state persistence hook
│
├── ui/                         # Existing shadcn/ui components (already exists)
└── invoices/                   # Existing invoice components (already exists)

lib/
├── ag-grid/                    # AG Grid utilities
│   ├── theme.ts               # Preline theme configuration
│   ├── types/                 # TypeScript type exports
│   │   └── index.ts           # Re-export all types
│   └── utils.ts               # Grid utility functions
│
├── supabase/                   # Existing Supabase integration (already exists)
├── types/                      # Existing type definitions (already exists)
└── utils.ts                    # Existing utilities (already exists)

app/
├── globals.css                 # Global styles (AG Grid CSS variables added)
├── dashboard/                  # Existing dashboard routes (already exists)
└── [other routes]/             # Existing routes (already exists)

tests/                          # Testing (to be set up during implementation)
├── components/
│   └── ag-grid/
│       ├── DataGrid.test.tsx
│       └── GridToolbar.test.tsx
└── integration/
    └── grid-theme.test.tsx

```

**Structure Decision**:

This is a **Next.js 15 web application** using the App Router architecture. The AG Grid integration is implemented as:

1. **Component Library** (`components/ag-grid/`): Reusable data grid components with Preline styling
2. **Theme Configuration** (`lib/ag-grid/theme.ts`): Bridges Tailwind/Preline design tokens to AG Grid theming API
3. **Type Definitions** (`lib/ag-grid/types/`): Centralized TypeScript interfaces for type safety
4. **Global Styles** (`app/globals.css`): CSS custom properties mapping Tailwind → AG Grid

**Key Directories**:
- `components/ag-grid/`: All grid-related React components (client-side with `"use client"`)
- `lib/ag-grid/`: Grid utilities, theme config, and TypeScript types
- `app/globals.css`: Enhanced with AG Grid CSS variable mappings for light/dark modes

**Integration Points**:
- Existing invoice management pages will consume `DataGrid` component
- Preline UI components (buttons, dropdowns, inputs) wrapped in toolbar
- Dark mode via existing `next-themes` provider (no changes needed)

## Complexity Tracking

*No constitution violations - complexity budget compliant*

This feature adds no prohibited complexity:
- ✅ No new backend frameworks (client-side component library)
- ✅ No state management libraries (React hooks + local state sufficient)
- ✅ No custom auth (uses existing Clerk integration)
- ✅ No ORM layers (no database access)

**Justified Complexity** (educational value):
- AG Grid integration demonstrates enterprise-grade table patterns
- Theming API shows modern design system integration
- TypeScript strict mode enforces type safety best practices
- Custom cell renderers demonstrate React composition patterns

---

## Planning Summary

**Branch**: `001-ag-grid-preline`
**Status**: ✅ **Planning Complete - Ready for Task Generation**

### Deliverables Created

#### Phase 0: Research
- ✅ `research.md`: Comprehensive AG Grid theming and Preline design pattern research
  - AG Grid v34 Theming API (CSS variables + JavaScript API)
  - Tailwind CSS integration strategies
  - Custom cell renderer best practices
  - Preline component patterns and design tokens
  - Common pitfalls and solutions

#### Phase 1: Design
- ✅ `data-model.md`: TypeScript interfaces for all data structures
  - Grid configuration types
  - Column definitions
  - User preferences
  - Event handlers
  - Search/filter/pagination state

- ✅ `contracts/`: Component interface contracts
  - `DataGrid.interface.ts`: Main grid component API
  - `GridToolbar.interface.ts`: Toolbar controls API
  - `GridPagination.interface.ts`: Pagination API
  - `README.md`: Contract usage guidelines

- ✅ `quickstart.md`: Usage guide and examples
  - Basic grid setup
  - Search and filter integration
  - Custom cell renderers
  - Server Actions integration
  - Dark mode support
  - Performance optimization

- ✅ Agent context updated (`CLAUDE.md`): TypeScript + Next.js 15 context added

### Technical Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Theming Approach** | AG Grid Theming API + CSS Variables | TypeScript safety, prevents CSS conflicts, maintains upgrade path |
| **Design Token Bridge** | CSS custom properties | Single source of truth (Tailwind), supports light/dark modes |
| **Component Architecture** | Client-side ("use client") | AG Grid requires JavaScript for virtual scrolling |
| **Testing Framework** | Vitest + React Testing Library | Faster than Jest, better Next.js integration |
| **Dark Mode** | `data-ag-theme-mode` attribute | Integrates with next-themes, avoids SSR hydration issues |
| **Type Safety** | TypeScript generics | Type-safe row data and column definitions |

### Project Structure

Components organized into three layers:
1. **Foundation**: Theme configuration (`lib/ag-grid/theme.ts`)
2. **Components**: Grid, Toolbar, Pagination (`components/ag-grid/`)
3. **Renderers**: Custom cell renderers (`components/ag-grid/renderers/`)

### Constitution Compliance

- ✅ **Type Safety First**: TypeScript strict mode with comprehensive interfaces
- ✅ **Security-First Multi-Tenancy**: N/A (UI component, parent handles data isolation)
- ✅ **Server Actions for Mutations**: Examples demonstrate Server Action integration for edits
- ✅ **Component Composition**: Reusable components following shadcn/ui patterns
- ✅ **Progressive Enhancement**: Limited by AG Grid requirements, full accessibility supported
- ✅ **Testing Strategy**: Focus on theme application and integration, skip AG Grid internals

### Next Phase

Run `/speckit.tasks` to generate dependency-ordered implementation tasks based on:
- 4 prioritized user stories from `spec.md`
- Technical design from `plan.md`
- Component contracts from `contracts/`
- Data models from `data-model.md`

Tasks will be organized by user story priority:
1. **P1**: View data in modern styled table (visual foundation)
2. **P2**: Search and filter with modern controls
3. **P3**: Sort and paginate large datasets
4. **P4**: Perform advanced operations (grouping, editing)

