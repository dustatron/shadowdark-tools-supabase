<!--
Sync Impact Report:
Version change: 1.2.0 → 1.3.0
Modified sections:
- Development Standards (updated to reflect Mantine UI instead of shadcn/ui)
- Technology stack corrected: Mantine UI with Emotion for styling, @tabler/icons-react for icons
- Component library changed from shadcn/ui to Mantine for better accessibility and documentation
Templates requiring updates:
- ✅ .specify/templates/plan-template.md (Constitution Check references this document)
- ✅ .specify/templates/spec-template.md (Review checklist aligns with principles)
- ✅ .specify/templates/tasks-template.md (TDD workflow enforced by Test-First principle)
-->

# SD GM Tools Constitution

## Core Principles

### I. Component-First

Every feature starts as a reusable React component with clear responsibilities. Components MUST be self-contained, independently testable, and thoroughly documented. Each component serves a specific functional purpose for the Shadowdark Monster Manager web application.

**Rationale**: Modular component architecture enables easier testing, reuse across different UI contexts, and cleaner separation of concerns for complex gaming features.

### II. API-First

Every feature exposes functionality via well-defined API contracts. RESTful endpoints with consistent request/response patterns. MUST support JSON for data exchange and proper HTTP status codes for error handling.

**Rationale**: API-first design ensures clear separation between frontend and backend, enables testing of business logic independently, and provides flexibility for future integrations.

### III. Test-First (NON-NEGOTIABLE)

Test-Driven Development is mandatory: Tests written → User approved → Tests fail → Then implement. Red-Green-Refactor cycle strictly enforced. Target 40% test coverage minimum with both unit tests (Vitest) and E2E tests (Playwright).

**Rationale**: Gaming tools require high reliability - incorrect monster stats, encounter generation, or data validation can disrupt game master preparation and live sessions.

### IV. Integration Testing

Focus areas requiring integration tests: Database operations, Authentication flows, File uploads, Search functionality, Encounter generation algorithms. All user workflows from login to content creation MUST have E2E test coverage.

**Rationale**: Web applications have complex interdependencies (user auth, data persistence, external services) that unit tests alone cannot validate. Gaming data flows are critical to user experience.

### V. Simplicity

Start with MVP features, apply YAGNI principles. Structured logging required for all user-facing operations. Prefer explicit Shadowdark rule implementations over generic gaming frameworks. Avoid premature optimization.

**Rationale**: Game masters need tools that work reliably and intuitively - unnecessary complexity increases development time, bug potential, and user confusion.

### VI. Data Integrity

All gaming data MUST be validated using Zod schemas at API boundaries. Shadowdark rule compliance is enforced (e.g., XP calculations, stat ranges). Database constraints prevent invalid states. User-generated content undergoes validation before persistence.

**Rationale**: Incorrect gaming data can invalidate entire encounters or sessions. Data integrity ensures game masters can trust the tool's calculations and recommendations.

### VII. Community Safety

Public content sharing requires moderation capabilities. Flagging system with admin review processes. Clear content policies and enforcement mechanisms. User-generated content defaults to private with explicit opt-in for public sharing.

**Rationale**: Community features enable valuable content sharing but require safeguards against inappropriate content that could harm user experience or violate platform policies.

## Development Standards

Web application MUST follow Next.js App Router conventions with TypeScript. Component library uses Mantine UI with Emotion for CSS-in-JS styling and theming. Database operations use Supabase with Row Level Security (RLS) and @supabase/ssr for cookie-based authentication. All gaming data schemas use Zod validation and MUST be version-controlled and backward-compatible.

**Technology Stack**:

- **Frontend**: Next.js 15+ (App Router), TypeScript, React 19, Mantine UI, Emotion CSS-in-JS, @tabler/icons-react
- **Backend**: Supabase (Postgres + Auth + RLS), @supabase/ssr for server-side auth
- **Development**: ESLint, Prettier, Mantine built-in dark mode
- **Deployment**: Vercel with automatic GitHub integration

**Project Structure Requirements**:

```
app/
├── app/                 # Next.js App Router pages
├── components/          # Reusable React components
├── lib/                # Utilities and Supabase clients
├── middleware.ts       # Auth and routing middleware
└── package.json        # Dependencies and scripts
```

Performance targets: Page loads under 2 seconds, search results within 500ms, optimized images, infinite scrolling for large datasets.

## Quality Assurance

Code review requirements include constitutional compliance verification. All Shadowdark rule calculations MUST have corresponding validation tests. Database policies MUST be tested in development environment before deployment.

**Security Requirements**:

- Supabase RLS for data access control with proper policies for user-owned and public content
- @supabase/ssr for secure cookie-based authentication across SSR and client components
- Zod validation at all API boundaries and form inputs
- Next.js middleware for route protection and auth checks
- Environment variables properly configured for Supabase connection

**Testing Requirements**:

- Unit tests for components and utilities (target 40% coverage minimum)
- Integration tests for Supabase operations and auth flows
- E2E tests for critical user journeys (auth, content creation, search)
- Database policy testing in development environment

Content moderation: Flagging system for user-generated content, admin dashboard for content review, audit logging for moderation actions.

## Governance

This Constitution supersedes all other development practices. Amendments require documentation of change rationale, approval process, and migration plan for existing tools.

All pull requests and reviews MUST verify compliance with constitutional principles. Complexity that violates principles must be justified with specific game master needs. Development guidance is maintained in agent-specific files (e.g., CLAUDE.md, GEMINI.md) for runtime development support.

**Version**: 1.3.0 | **Ratified**: 2025-09-21 | **Last Amended**: 2025-09-21
