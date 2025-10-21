# Tasks: AG Grid with Preline Design Integration

**Input**: Design documents from `/specs/001-ag-grid-preline/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are NOT requested in the specification. Tasks focus on implementation only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions
- **Next.js 15 App Router**: `app/` for routes, `components/` for components, `lib/` for utilities
- All AG Grid components in `components/ag-grid/`
- Theme configuration in `lib/ag-grid/`
- Global CSS in `app/globals.css`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for AG Grid integration

- [ ] T001 Create directory structure for AG Grid components at components/ag-grid/
- [ ] T002 Create directory structure for AG Grid utilities at lib/ag-grid/
- [ ] T003 Create directory structure for cell renderers at components/ag-grid/renderers/
- [ ] T004 Create directory structure for grid hooks at components/ag-grid/hooks/
- [ ] T005 Create directory structure for TypeScript types at lib/ag-grid/types/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Create TypeScript type definitions index file at lib/ag-grid/types/index.ts exporting all grid-related types from data-model.md and contracts
- [ ] T007 Create Preline theme configuration in lib/ag-grid/theme.ts implementing AG Grid Theming API with CSS custom properties bridge
- [ ] T008 Add CSS custom property mappings to app/globals.css for light mode (--ag-preline-bg, --ag-preline-fg, --ag-preline-accent, --ag-preline-font)
- [ ] T009 Add CSS custom property mappings to app/globals.css for dark mode using .dark selector
- [ ] T010 Add AG Grid CSS variable overrides to app/globals.css in @layer utilities for header colors, borders, and row hover states
- [ ] T011 Create grid utility functions in lib/ag-grid/utils.ts for common operations (format dates, format currency, generate column IDs)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Data in Modern Styled Table (Priority: P1) 🎯 MVP

**Goal**: Render a data grid with complete visual integration matching Preline design system

**Independent Test**: Render grid with sample invoice data and verify colors, fonts, spacing match existing application components in both light and dark modes

### Implementation for User Story 1

- [ ] T012 [P] [US1] Create DataGrid component skeleton in components/ag-grid/DataGrid.tsx with "use client" directive and TypeScript interface from contracts/DataGrid.interface.ts
- [ ] T013 [P] [US1] Create useGridTheme hook in components/ag-grid/hooks/useGridTheme.ts to load theme from lib/ag-grid/theme.ts and handle dark mode via next-themes
- [ ] T014 [US1] Implement DataGrid core rendering in components/ag-grid/DataGrid.tsx applying theme via themeQuartz.withParams() and rendering AgGridReact component
- [ ] T015 [US1] Add SSR hydration guard to DataGrid component using useState and useEffect to prevent theme mismatch
- [ ] T016 [US1] Implement defaultColDef configuration in DataGrid component with sortable, filter, and resizable defaults
- [ ] T017 [US1] Add data-ag-theme-mode attribute wrapper div in DataGrid component that responds to theme changes
- [ ] T018 [US1] Implement grid wrapper styling in DataGrid component with height prop support and responsive container classes
- [ ] T019 [US1] Add loading overlay support in DataGrid component using loading prop and custom overlay component
- [ ] T020 [US1] Add empty state support in DataGrid component using emptyState prop with Preline-styled empty message
- [ ] T021 [US1] Implement column auto-sizing and responsive behavior in DataGrid component for mobile/tablet viewports
- [ ] T022 [US1] Add proper TypeScript generics support to DataGrid component for typed row data

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - grid renders with Preline styling in light/dark modes

---

## Phase 4: User Story 2 - Search and Filter Data with Modern Controls (Priority: P2)

**Goal**: Add toolbar with Preline-styled search bar and filter controls that work with AG Grid's filtering system

**Independent Test**: Type in search bar to filter records, apply dropdown filters, and verify Preline styling matches application form components

### Implementation for User Story 2

- [ ] T023 [P] [US2] Create GridToolbar component skeleton in components/ag-grid/GridToolbar.tsx with "use client" directive and interface from contracts/GridToolbar.interface.ts
- [ ] T024 [P] [US2] Create search input component in GridToolbar using Preline input styling (border-gray-200, rounded-lg, focus:ring-blue-500) with icon
- [ ] T025 [US2] Implement search debounce logic in GridToolbar using useState and useEffect with 300ms delay calling gridApi.setQuickFilter()
- [ ] T026 [US2] Add search clear button to GridToolbar search input with Preline icon button styling
- [ ] T027 [US2] Create filter dropdown button in GridToolbar with Preline button styling (border, shadow-sm, hover:bg-gray-50)
- [ ] T028 [US2] Implement filter dropdown menu in GridToolbar using Preline dropdown classes (hidden, hs-dropdown-open:opacity-100, shadow-md, rounded-lg)
- [ ] T029 [US2] Add active filter count badge to GridToolbar filter button with Preline badge styling (rounded-full, bg-gray-500, text-xs)
- [ ] T030 [US2] Implement filter application logic in GridToolbar calling gridApi.setFilterModel() when filters change
- [ ] T031 [US2] Add filter clear/reset functionality in GridToolbar dropdown menu
- [ ] T032 [US2] Integrate GridToolbar into DataGrid component as optional toolbar above grid with showSearch and showFilters props
- [ ] T033 [US2] Add toolbar responsive layout in GridToolbar (stack on mobile, horizontal on desktop) using Tailwind responsive classes

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - grid has search and filter controls matching Preline design

---

## Phase 5: User Story 3 - Sort and Paginate Large Datasets (Priority: P3)

**Goal**: Add Preline-styled pagination controls and ensure sorting visual indicators match design system

**Independent Test**: Click column headers to sort, use pagination controls to navigate pages, verify Preline button and navigation styling

### Implementation for User Story 3

- [ ] T034 [P] [US3] Create GridPagination component skeleton in components/ag-grid/GridPagination.tsx with "use client" directive and interface from contracts/GridPagination.interface.ts
- [ ] T035 [P] [US3] Implement pagination button styling in GridPagination using Preline classes (min-h-[38px], min-w-[38px], rounded-lg, hover:bg-gray-100)
- [ ] T036 [US3] Create active page button styling in GridPagination with Preline active state (bg-gray-200, dark:bg-neutral-600)
- [ ] T037 [US3] Implement page navigation logic in GridPagination calling gridApi.paginationGoToPage() for prev/next/specific page
- [ ] T038 [US3] Add page size selector dropdown in GridPagination with Preline select styling (border-gray-200, rounded-lg, pe-9)
- [ ] T039 [US3] Implement page size change logic in GridPagination calling gridApi.paginationSetPageSize()
- [ ] T040 [US3] Add row count display in GridPagination showing "Showing X-Y of Z" with Preline text styling
- [ ] T041 [US3] Implement pagination state calculation in GridPagination (totalPages, startRow, endRow, hasPrevious, hasNext)
- [ ] T042 [US3] Add ellipsis handling in GridPagination for large page counts showing first, last, and nearby pages
- [ ] T043 [US3] Integrate GridPagination into DataGrid component below grid with pagination prop enabling it
- [ ] T044 [US3] Customize AG Grid sort icons in app/globals.css to match Preline icon styling using CSS custom properties
- [ ] T045 [US3] Add keyboard navigation support to GridPagination (arrow keys, enter, home, end) with proper ARIA labels

**Checkpoint**: All user stories should now be independently functional - grid has full pagination and sorting with Preline styling

---

## Phase 6: User Story 4 - Perform Advanced Data Operations (Priority: P4)

**Goal**: Add row grouping, inline editing, and column customization features with Preline styling

**Independent Test**: Group rows by a column, edit cell values, toggle column visibility, verify all advanced features maintain Preline design consistency

### Implementation for User Story 4

- [ ] T046 [P] [US4] Create StatusBadge cell renderer in components/ag-grid/renderers/StatusBadge.tsx with Preline badge styling (rounded-full, inline-flex, text-xs, font-medium)
- [ ] T047 [P] [US4] Create ActionButtons cell renderer in components/ag-grid/renderers/ActionButtons.tsx with Preline button styling for row actions
- [ ] T048 [US4] Implement row grouping configuration in DataGrid component enabling grouping via columnDef.rowGroup property
- [ ] T049 [US4] Style row group headers in app/globals.css using AG Grid CSS variables to match Preline collapsed/expanded states
- [ ] T050 [US4] Add group expansion icons customization in app/globals.css to use Lucide icons matching Preline style
- [ ] T051 [US4] Implement inline editing configuration in DataGrid component with editable columnDef property and cellEditor support
- [ ] T052 [US4] Style inline edit inputs in app/globals.css to match Preline form input styling (border-gray-200, focus:ring-blue-500)
- [ ] T053 [US4] Add edit validation and error display in DataGrid using Preline error message styling (text-red-600, bg-red-50)
- [ ] T054 [US4] Create column visibility toggle in GridToolbar as dropdown with checkboxes styled per Preline checkbox component
- [ ] T055 [US4] Implement column visibility logic in GridToolbar calling gridApi.setColumnsVisible() when checkboxes change
- [ ] T056 [US4] Create useGridState hook in components/ag-grid/hooks/useGridState.ts to persist user preferences to localStorage
- [ ] T057 [US4] Integrate useGridState hook into DataGrid component to save/restore column state, filter model, and sort model
- [ ] T058 [US4] Add column reordering visual feedback in app/globals.css styling drag indicators to match Preline interaction patterns
- [ ] T059 [US4] Add column resizing visual feedback in app/globals.css styling resize handles to match Preline hover states

**Checkpoint**: All user stories complete - grid supports advanced features (grouping, editing, column management) with consistent Preline styling

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final refinements

- [ ] T060 [P] Add comprehensive JSDoc comments to all components in components/ag-grid/ documenting props and usage examples
- [ ] T061 [P] Add README.md to components/ag-grid/ directory with component overview and quick start guide referencing quickstart.md
- [ ] T062 [P] Verify ARIA labels and roles on all interactive elements in DataGrid, GridToolbar, and GridPagination components
- [ ] T063 [P] Test keyboard navigation (tab, arrow keys, enter, escape) across all grid features and fix any focus trap issues
- [ ] T064 [P] Verify WCAG AA color contrast for all text in light and dark modes using browser DevTools
- [ ] T065 [P] Add focus visible indicators to all interactive elements matching Preline focus ring styling
- [ ] T066 Add responsive breakpoint handling in DataGrid for mobile view (hide less important columns, adjust pagination)
- [ ] T067 Optimize performance by adding React.memo() to cell renderer components (StatusBadge, ActionButtons)
- [ ] T068 Add grid loading skeleton component with Preline skeleton styling for better perceived performance
- [ ] T069 Create example usage page at app/examples/ag-grid/page.tsx demonstrating all features with invoice sample data
- [ ] T070 Add error boundary component around DataGrid to handle grid initialization errors gracefully with Preline error styling

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 DataGrid but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Integrates with US1 DataGrid but independently testable
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Uses US1 DataGrid and may reference US2 GridToolbar but independently testable

### Within Each User Story

- **US1**: Core grid rendering tasks sequential (T012→T013→T014), styling tasks can run parallel after T014
- **US2**: Toolbar skeleton and search (T023-T026) can run parallel, dropdown and integration sequential
- **US3**: Pagination skeleton and button styling (T034-T036) can run parallel, logic and integration sequential
- **US4**: Cell renderers (T046-T047) can run parallel, grouping/editing/column features mostly sequential

### Parallel Opportunities

- **Setup Phase**: All 5 directory creation tasks (T001-T005) can run in parallel
- **Foundational Phase**: Type definitions (T006), theme (T007), and utilities (T011) can run in parallel; CSS tasks (T008-T010) sequential
- **User Story 1**: After core grid (T014), styling tasks T018-T021 can run in parallel
- **User Story 2**: Search input (T024) and filter dropdown button (T027) creation can run in parallel
- **User Story 3**: Pagination component (T034) and sort icon customization (T044) can run in parallel initially
- **User Story 4**: Cell renderers (T046-T047) can run in parallel; hooks (T056) independent from UI tasks
- **Polish Phase**: Documentation (T060-T061), accessibility checks (T062-T065), and optimization (T067-T068) can run in parallel

---

## Parallel Example: User Story 1 (MVP)

```bash
# After Foundational phase complete, launch core grid tasks:
Task T012: Create DataGrid component skeleton
Task T013: Create useGridTheme hook
# Then after T014 (core rendering) completes, launch styling in parallel:
Task T018: Implement grid wrapper styling
Task T019: Add loading overlay support
Task T020: Add empty state support
Task T021: Implement responsive behavior
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T011) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T012-T022)
4. **STOP and VALIDATE**: Render grid with sample data, verify Preline styling in light/dark modes
5. Deploy/demo if ready

**MVP Deliverable**: A visually integrated data grid that renders data with 100% Preline design system alignment

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (T001-T011)
2. Add User Story 1 → Test independently → Deploy/Demo (MVP! T012-T022)
3. Add User Story 2 → Test search/filter → Deploy/Demo (T023-T033)
4. Add User Story 3 → Test pagination/sort → Deploy/Demo (T034-T045)
5. Add User Story 4 → Test advanced features → Deploy/Demo (T046-T059)
6. Polish Phase → Final refinements → Production release (T060-T070)

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T011)
2. Once Foundational is done:
   - **Developer A**: User Story 1 (T012-T022) - Core grid
   - **Developer B**: User Story 2 (T023-T033) - Search/filter toolbar
   - **Developer C**: User Story 3 (T034-T045) - Pagination
   - **Developer D**: User Story 4 (T046-T059) - Advanced features
3. Stories complete and integrate independently via shared DataGrid component

---

## Notes

- **[P] tasks**: Different files, no dependencies on incomplete tasks
- **[Story] label**: Maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All components use `"use client"` directive (AG Grid requires client-side rendering)
- TypeScript strict mode enforced - no `any` types without justification
- All styling must use Preline design tokens via Tailwind CSS
- Dark mode support via `next-themes` is built into foundation (T008-T009)
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Task Summary

**Total Tasks**: 70
- Phase 1 (Setup): 5 tasks
- Phase 2 (Foundational): 6 tasks
- Phase 3 (User Story 1 - P1): 11 tasks
- Phase 4 (User Story 2 - P2): 11 tasks
- Phase 5 (User Story 3 - P3): 12 tasks
- Phase 6 (User Story 4 - P4): 14 tasks
- Phase 7 (Polish): 11 tasks

**Parallel Opportunities**: 20+ tasks marked with [P] across all phases

**MVP Scope**: Phases 1-3 (22 tasks) delivers a fully functional, Preline-styled data grid

**Independent Testing**: Each user story (P1-P4) has clear test criteria and can be validated independently
