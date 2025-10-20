<!--
SYNC IMPACT REPORT
==================
Version Change: Initial → 1.0.0
Modified Principles: N/A (Initial constitution)
Added Sections: All sections (initial creation)
Removed Sections: N/A
Templates Requiring Updates:
  ✅ plan-template.md - Constitution Check section already in place
  ✅ spec-template.md - Requirements and user scenarios align with principles
  ✅ tasks-template.md - Test-driven approach and organization align
Follow-up TODOs: None
==================
-->

# OfficeFreund Demo Constitution

## Core Principles

### I. Type Safety First

Every component, function, and data structure MUST use TypeScript with strict type checking enabled. Type definitions MUST be comprehensive and accurate, reflecting the actual runtime behavior.

**Rules**:
- All TypeScript strict mode flags MUST be enabled
- No `any` types permitted without explicit justification and TODO comment
- Type definitions MUST be co-located with implementation or in dedicated `types/` directory
- Server Actions MUST define input/output types using Zod or similar validation library
- Database query results MUST have typed interfaces

**Rationale**: Type safety catches bugs at compile time, improves developer experience with autocomplete, and serves as living documentation. In a multi-tenant B2B application, type errors can lead to data leakage between organizations.

### II. Security-First Multi-Tenancy (NON-NEGOTIABLE)

All data access MUST enforce organization-level isolation. Row Level Security (RLS) policies MUST be the primary defense, with application-level checks as secondary validation.

**Rules**:
- Every database query MUST include organization context from authenticated user
- Supabase RLS policies MUST be enabled for all tables containing tenant data
- Server Actions MUST validate organization membership before data operations
- No client-side filtering for multi-tenant data segregation
- Test MUST verify data isolation between organizations

**Rationale**: Multi-tenant data breaches are catastrophic. Defense-in-depth (RLS + application validation) ensures security even if one layer fails. This is non-negotiable for B2B SaaS applications.

### III. Server Actions for Mutations

All data mutations (Create, Update, Delete) MUST use Next.js Server Actions. Direct client-side database access is prohibited for mutations.

**Rules**:
- Server Actions MUST be defined in `app/actions/` directory
- Each action MUST validate authentication and authorization
- Actions MUST use `"use server"` directive
- Actions MUST return type-safe results with error handling
- Client components call actions via imported functions, not API routes

**Rationale**: Server Actions provide built-in CSRF protection, automatic request deduplication, and progressive enhancement. They eliminate the need for separate API routes for simple mutations while maintaining security.

### IV. Component Composition Over Duplication

UI components MUST be composable and reusable. Use shadcn/ui patterns for extensibility. Avoid duplicating similar components.

**Rules**:
- Components MUST follow single responsibility principle
- Shared UI patterns MUST be extracted to `components/ui/`
- Feature-specific components go in `components/[feature]/`
- Props MUST be typed interfaces, not inline types
- Avoid prop drilling beyond 2 levels—use composition or context

**Rationale**: Composition reduces maintenance burden, improves testability, and ensures consistent UX. The shadcn/ui approach (copy-paste + customize) requires discipline to avoid divergent copies.

### V. Progressive Enhancement & Accessibility

Applications MUST work without JavaScript where feasible. All interactive elements MUST be keyboard accessible and screen-reader friendly.

**Rules**:
- Forms MUST use native HTML form submission with Server Actions
- Loading states MUST use React Suspense and `loading.tsx` conventions
- All interactive elements MUST have proper ARIA labels
- Color contrast MUST meet WCAG AA standards
- Dark mode MUST be fully supported across all components

**Rationale**: Progressive enhancement ensures resilience. Accessibility is both ethical and often legally required for B2B applications. Supporting dark mode improves user comfort and reduces eye strain.

### VI. Testing Strategy

Testing MUST be risk-based and pragmatic. Focus on critical paths (authentication, authorization, data isolation) and user journeys. Unit tests are optional; integration/E2E tests are preferred for full-stack features.

**Rules**:
- Multi-tenant data isolation MUST have automated tests
- Authentication/authorization flows MUST be tested
- Server Actions MUST validate organization context (test with multiple orgs)
- UI testing is optional but recommended for complex interactive components
- Tests MUST use realistic data (not overly mocked)

**Rationale**: In a demo/learning project, over-testing reduces velocity. Focus testing effort on what breaks trust: security, auth, and data isolation. Full-stack tests catch more real bugs than isolated unit tests.

## Architecture Standards

### Next.js 15 App Router Conventions

All routing, layouts, and data fetching MUST follow Next.js 15 App Router conventions.

**Rules**:
- Use `app/` directory for all routes (no `pages/` directory)
- Server Components by default; mark Client Components with `"use client"`
- Co-locate route handlers (`route.ts`) with page components when needed
- Use `layout.tsx` for shared UI and `loading.tsx` for Suspense boundaries
- Middleware (`middleware.ts`) for auth checks, not per-route guards

**Why**: Next.js 15 App Router provides better performance (Server Components), simpler data fetching (async components), and improved developer experience. Consistency with framework conventions reduces cognitive load.

### Database Schema & Supabase Integration

Database schema MUST be version-controlled in SQL files. Schema changes MUST use migrations. Direct database modifications are prohibited.

**Rules**:
- All schema definitions MUST be in `supabase-schema.sql` or migration files
- RLS policies MUST be defined alongside table creation
- Use `organization_id` as the tenant identifier column
- Foreign key constraints MUST be defined for relational integrity
- Indexes MUST be added for query performance on filtered columns

**Why**: Version-controlled schema enables reproducibility, collaboration, and safe deployments. RLS policies defined with schema ensure they're never forgotten.

### Authentication & Clerk Integration

Authentication MUST use Clerk Organizations feature. Direct password handling is prohibited. All auth state MUST come from Clerk.

**Rules**:
- Use `@clerk/nextjs` server helpers (`auth()`) in Server Components/Actions
- Organization context MUST be retrieved from `auth().orgId`
- Sign-in/sign-up pages MUST use Clerk prebuilt components
- Organization switcher MUST be available in main navigation
- Do not store passwords or implement custom auth logic

**Why**: Clerk handles security best practices, compliance, and edge cases (password reset, MFA, SSO). Using Organizations feature ensures proper B2B multi-tenancy patterns.

## Development Workflow

### Feature Development Process

1. **Specification**: Document user stories and acceptance criteria in `specs/[###-feature-name]/spec.md`
2. **Planning**: Run `/speckit.plan` to generate implementation plan and design artifacts
3. **Task Generation**: Run `/speckit.tasks` to create dependency-ordered task list
4. **Implementation**: Execute tasks in order, test incrementally
5. **Review**: Verify constitution compliance before committing

### Code Review Standards

All code changes MUST be reviewed for:
- Type safety (no `any` escapes without justification)
- Security (organization context validated in Server Actions)
- Accessibility (keyboard nav, ARIA labels, color contrast)
- Performance (avoid N+1 queries, use indexes)
- Consistency (follows existing patterns and conventions)

### Commit Message Format

Use conventional commits format:

```
<type>(<scope>): <subject>

<body>
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

Example: `feat(invoices): add duplicate invoice action`

## Governance

### Constitution Authority

This constitution supersedes ad-hoc decisions. When conflict arises between convenience and principles, principles win unless explicitly amended.

### Amendment Process

1. Propose change with rationale (why current principle inadequate)
2. Document impact on existing code
3. Update constitution version (MAJOR/MINOR/PATCH per semver)
4. Propagate changes to dependent templates and docs
5. Commit with clear message

### Compliance Review

Before merging features:
- ✅ Type safety verified (no `any` without justification)
- ✅ Multi-tenant isolation tested (RLS + app-level checks)
- ✅ Server Actions used for all mutations
- ✅ Accessibility checked (keyboard nav, ARIA, contrast)
- ✅ Dark mode supported
- ✅ No hardcoded secrets or environment variables in code

### Complexity Budget

This is a **demo/learning project**. Complexity MUST be justified by educational value or demonstrating production patterns.

**Prohibited without justification**:
- Additional backend frameworks (we have Next.js API routes + Server Actions)
- State management libraries (React context or URL state sufficient for this scale)
- Custom auth implementation (we have Clerk)
- ORM layers (Supabase client is sufficient)

**Permitted complexity** (demonstrates B2B SaaS patterns):
- RLS policies (teaches database security)
- Server Actions (teaches modern Next.js patterns)
- Clerk Organizations (teaches multi-tenant auth)
- TypeScript strict mode (teaches type safety)

---

**Version**: 1.0.0 | **Ratified**: 2025-10-20 | **Last Amended**: 2025-10-20
