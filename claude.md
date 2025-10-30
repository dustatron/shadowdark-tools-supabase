# Shadowdark Monster Manager - Project Context

- In all interactions and commit messages, be extremely concise and sacrifice grammar for the sake of concision.

## GITHUB

- Your primary method for interacting with GitHub should the GitHub CLI.

## Playwright

- Your Primary method of interacting with playwright should be through the Playwright MCP server

## Supabase Database

- Your primary method for interacting with the Supabase database should be through the Supabase MCP server
- Use MCP tools for: querying tables, executing SQL, applying migrations, checking schemas, getting logs
- Project ID: hvtkkugamifjglxkqsrc

## Plans

- At the end of each plan, give me a list of unresolved questions to answer, if any. Make the questions extremely concise. Sacrifice grammar for sake of concision.

## Project Overview

**Shadowdark Monster Manager** is a comprehensive web application designed to assist Game Masters (GMs) in managing monsters and generating encounters for the Shadowdark TTRPG (tabletop role-playing game). The application provides tools for searching official monsters, creating custom content, building encounter lists, and generating random encounter tables.

### Current Status

- **Phase**: Early Development / Foundation & Database Setup
- **Branch**: main
- **Key Feature**: Monsters and Spells lookup implemented with basic CRUD operations
- **Next Milestones**: Core monster management features, encounter generation, community features

## Tech Stack

### Frontend

- **Framework**: Next.js 15 (App Router) with TypeScript
- **UI Library**: shadcn/ui (built on Radix UI primitives)
- **Styling**: Tailwind CSS 3.4.1
- **Forms**: React Hook Form 7.63 + Zod 4.1.11 validation
- **State Management**: @tanstack/react-query 5.89 (server state), Zustand (planned for client state)
- **Icons**: Lucide React 0.545

### Backend & Infrastructure

- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth (@supabase/ssr, @supabase/supabase-js)
- **ORM/Client**: Direct Supabase client (no additional ORM)
- **API**: Next.js App Router API Routes
- **Deployment**: Vercel (configured, auto-deploy from GitHub)

### Testing

- **Unit/Integration**: Vitest 3.2.4 with jsdom 27.0
- **Component Testing**: @testing-library/react 16.3
- **E2E Testing**: Playwright 1.55
- **Coverage Target**: 40% for MVP

**Note**: API contract tests were removed (2025-01-17) as they were slow, brittle, and required full database setup. The contract tests served their purpose by revealing missing endpoints (POST /api/monsters, /api/monsters/random, UUID validation) which are now implemented. Testing strategy focuses on:

- Unit tests for route handlers (with mocked dependencies)
- E2E tests for critical user flows (Playwright)
- Manual testing during development

### Development Tools

- **Linting**: ESLint 9 with Next.js config + Prettier 3.6.2
- **Type Checking**: TypeScript 5
- **Build Tool**: Next.js with Turbopack (dev mode)

## Architecture Patterns

### Next.js App Router Structure

```
app/
├── api/                    # API route handlers
├── auth/                   # Authentication pages (login, signup, etc.)
├── monsters/               # Monster listing and detail pages
│   ├── [id]/              # Dynamic monster detail page
│   └── page.tsx           # Monster list page
├── spells/                # Spell listing and detail pages
│   ├── [slug]/            # Dynamic spell detail page
│   └── page.tsx           # Spell list page
├── protected/             # Protected routes requiring authentication
├── layout.tsx             # Root layout with providers
└── page.tsx               # Landing page
```

### Database Architecture

**Key Tables:**

- `official_monsters` - Official Shadowdark monsters (read-only)
- `user_monsters` - User-created custom monsters
- `official_spells` - Official Shadowdark spells (read-only)
- `user_spells` - User-created custom spells
- `user_groups` - Monster groups/packs with quantities
- `user_lists` + `list_items` - User encounter lists (junction table)
- `user_encounter_tables` + `encounter_slots` - Saved encounter tables
- `flags` - Community content moderation
- `user_favorites` - User bookmarks
- `audit_logs` - Admin action tracking
- `user_profiles` - Extended user information

**Views:**

- `all_monsters` - UNION of official + public user monsters
- `all_spells` - UNION of official + public user spells

**Security:**

- Row Level Security (RLS) policies on all tables
- User ownership checks (auth.uid() = user_id)
- Public content read access
- Admin full access (isAdmin boolean flag)

### Key Design Patterns

1. **Server Components First**: Default to React Server Components, use 'use client' only when needed
2. **Server Actions**: Form submissions and mutations via Next.js Server Actions
3. **Supabase Client Types**: Separate server/client Supabase client creation
4. **JSONB for Complex Fields**: Attacks, abilities, treasure stored as JSONB for flexibility
5. **Fuzzy Search**: PostgreSQL pg_trgm extension for flexible searching
6. **RLS-First Security**: Database-level security via Row Level Security policies

## Project Philosophy & Constraints

### Shadowdark RPG Specific

- All game mechanics must be faithful to official Shadowdark rules
- Monster stats follow Shadowdark stat block format
- Challenge Level (CL) system for encounter balance
- OSR (Old-School Renaissance) design philosophy
- Emphasis on deadly but fair gameplay

### Development Principles

- **User-Owned Content**: Users own their custom monsters, lists, tables
- **Community-First**: Public sharing with moderation tools
- **Guest-Friendly**: Limited features for pre-auth users (localStorage)
- **Mobile-Responsive**: Touch-friendly interface
- **Performance**: Target <2s page loads, <300ms DB queries
- **Licensing Compliance**: Respect Shadowdark IP/licensing

### MVP Scope (Out of Scope)

- Advanced sharing/collaboration features
- Real-time multiplayer features
- Full WCAG accessibility (basic only)
- Analytics/metrics dashboard
- CI/CD pipelines (manual testing)
- i18n/localization
- Offline-first PWA (basic caching only)

## Current Implementation Status

### ✅ Completed Features

1. **Authentication Flow**
   - Supabase Auth integration (email/password)
   - Login, signup, password reset pages
   - Protected routes with middleware
   - User profile creation

2. **Database Schema**
   - All core tables created (18 migrations)
   - RLS policies configured
   - Fuzzy search function implemented
   - Indexes for optimization

3. **Monsters Feature (Basic)**
   - Official monsters seeded
   - Monster list page with search
   - Monster detail page
   - Basic CRUD operations

4. **Spells Feature (Basic)**
   - Official spells seeded
   - Spell list page with search
   - Spell detail page
   - Search function with fuzzy matching

### 🚧 In Progress / Planned

1. **Custom Monster Creation**
   - Form validation with Zod
   - JSONB fields for attacks/abilities/treasure
   - Icon upload (Cloudinary integration)
   - Public/private toggle

2. **Monster Groups/Packs**
   - Multi-select monster builder
   - Quantity management
   - Aggregated stats calculation

3. **Saved Lists**
   - Personal monster collections
   - Drag-and-drop reordering
   - Bulk operations

4. **Encounter Generation**
   - Random table generation
   - Custom die sizes
   - Roll simulator

5. **Community Features**
   - Public monster browsing
   - Content flagging system
   - Admin dashboard

6. **Guest Experience**
   - Landing page with demo
   - LocalStorage-based temp lists
   - Session limits

## Code Conventions

### File Naming

- Components: PascalCase (e.g., `MonsterCard.tsx`)
- Pages: lowercase (e.g., `page.tsx`)
- Utilities: camelCase (e.g., `createClient.ts`)
- Types: PascalCase with `.types.ts` suffix

### TypeScript

- Strict mode enabled
- Zod schemas for validation (co-located with components)
- Type inference preferred over explicit types
- Interface for object shapes, type for unions/primitives

### Component Structure

```typescript
'use client' // Only if needed

import { /* grouped imports */ }

// Types/Interfaces
interface Props {
  // ...
}

// Component
export default function ComponentName({ props }: Props) {
  // Hooks
  // Event handlers
  // Derived state
  // Render
}
```

### Supabase Client Usage

- **Server Components**: Use `await createClient()` from `@/lib/supabase/server`
- **Client Components**: Use `createClient()` from `@/lib/supabase/client`
- **Server Actions**: Use `await createClient()`, check auth status
- **API Routes**: Use `await createClient()` with proper error handling

**Important**: In Next.js 15, the server-side `createClient()` is async and MUST be awaited.

### Next.js 15 API Route Patterns

**Dynamic Route Parameters** (BREAKING CHANGE in Next.js 15):

```typescript
// ✅ CORRECT - params is a Promise in Next.js 15
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params; // Must await params
  const supabase = await createClient(); // Must await createClient
  // ...
}

// ❌ WRONG - Old Next.js 14 pattern
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { id } = params; // Will cause type errors
  // ...
}
```

**Supabase Client in API Routes**:

```typescript
// ✅ CORRECT
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient(); // Must await
  const { data } = await supabase.from("monsters").select("*");
  return NextResponse.json(data);
}

// ❌ WRONG
import { createSupabaseServerClient } from "@/lib/supabase/server"; // Old export name
const supabase = createClient(); // Missing await
```

**Zod Validation Error Handling**:

```typescript
// ✅ CORRECT
catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json({
      error: "Validation error",
      details: error.issues // Use .issues, not .errors
    }, { status: 400 });
  }
}

// ❌ WRONG
catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json({
      error: "Validation error",
      details: error.errors // Property doesn't exist
    }, { status: 400 });
  }
}
```

### Styling

- Tailwind for utility classes
- shadcn/ui for complex components (forms, tables, modals, dialogs)
- CSS modules only when necessary
- Mobile-first responsive design

## Specialized Agents

This project has custom Claude Code agents for domain-specific tasks:

1. **shadowdark-specialist** - Shadowdark RPG rules expert
   - Monster stat validation
   - Game mechanics implementation
   - Balance and encounter design
   - Character creation rules

2. **supabase-db-architect** - Database design and optimization
   - Schema design
   - RLS policies
   - Query optimization
   - Migrations

3. **nextjs-architect** - Next.js architecture guidance
   - App Router patterns
   - Server/Client component decisions
   - Performance optimization

4. **react-developer** - React component development
   - Component implementation
   - State management
   - Data fetching patterns

5. **shadcn-ui-specialist** - shadcn/ui component expert
   - Component composition and customization
   - Radix UI primitive integration
   - CVA variant creation
   - Accessibility patterns
   - Tailwind CSS styling

6. **form-validation-specialist** - Form validation with react-hook-form + Zod
   - react-hook-form integration
   - Zod schema design
   - shadcn/ui Form components
   - Error handling
   - Type-safe forms

7. **data-migration-specialist** - Supabase migrations
   - SQL migration files
   - Data seeding
   - Schema changes

8. **test-engineer** - Testing implementation
   - Vitest unit tests
   - Playwright E2E tests
   - Component testing

9. **frontend-pm** - Project planning and specs
   - Feature specifications
   - PRD generation
   - Task breakdown

10. **api-route-specialist** - Next.js API route development
    - Route handlers
    - Server actions
    - API error handling

## Custom Slash Commands

Available workflow commands:

- **/playwright-local** - Launch Playwright for local testing at localhost:3001
- **/commit** - Stage and commit changes
- **/start-ticket** - Extract ticket info and create implementation plan
- **/make-pr** - Create standardized pull request
- **/specify** - Create/update feature specification
- **/plan** - Execute implementation planning workflow
- **/tasks** - Generate dependency-ordered tasks.md
- **/implement** - Execute implementation plan from tasks.md
- **/constitution** - Create/update project constitution

## Important Files & Locations

### Configuration

- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `next.config.mjs` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `.env.local` - Environment variables (not in repo)

### Documentation

- `project-plan/prd.md` - Complete Product Requirements Document
- `project-plan/IMPLEMENTATION_PLAN.md` - Development phases and timeline
- `specs/001-create-a-plan/` - Feature specification directory
- `README.md` - General setup instructions

### Database

- `supabase/migrations/` - Database migration files (chronological)
- `supabase/config.toml` - Supabase project configuration

### Source Code

- `app/` - Next.js App Router pages and API routes
- `components/` - Reusable React components
- `lib/` - Utility functions, Supabase clients, types
- `scripts/` - Utility scripts (data transformation, etc.)

### Testing

- `__tests__/` - Test files
- `vitest.config.mjs` - Vitest configuration
- `playwright.config.ts` - Playwright E2E configuration

## Development Workflow

### Starting Development

```bash
npm install              # Install dependencies
npm run dev             # Start dev server (localhost:3000)
```

### Database Work

```bash
# Supabase CLI required for local development
supabase start          # Start local Supabase
supabase db push        # Push migrations to local
supabase db reset       # Reset local DB (rerun migrations)
```

### Code Quality

```bash
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint errors
npm run format          # Format with Prettier
npm run format:check    # Check formatting
```

### Testing

```bash
npm test                # Run unit tests (watch mode)
npm run test:run        # Run unit tests (single run)
npm run test:coverage   # Generate coverage report
npm run test:e2e        # Run Playwright E2E tests
npm run test:e2e:ui     # Run E2E tests with UI
```

### Git Workflow

- Main branch: `main`
- Feature branches: descriptive names (e.g., `feature/monster-groups`)
- Commit messages: Conventional Commits style preferred
- PR template: Use `/make-pr` command for standardized PRs

## Environment Variables Required

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Image uploads (Cloudinary)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

## Common Patterns & Best Practices

### API Route Handler Pattern (Next.js 15)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Schema for validation
const MonsterSchema = z.object({
  name: z.string().min(1),
  challenge_level: z.number().int().min(1).max(20),
});

// GET /api/monsters/[id] - Dynamic route with params
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // params is Promise
) {
  try {
    const supabase = await createClient(); // Must await
    const { id } = await params; // Must await params

    const { data, error } = await supabase
      .from("monsters")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/monsters - Create with validation
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Parse and validate body
    const body = await request.json();
    const validated = MonsterSchema.parse(body);

    // Insert data
    const { data, error } = await supabase
      .from("user_monsters")
      .insert({ ...validated, user_id: user.id })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to create monster" },
        { status: 500 },
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.issues, // Use .issues not .errors
        },
        { status: 400 },
      );
    }

    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

### Data Fetching in Server Components

```typescript
// Server Component (preferred)
import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createClient() // Must await
  const { data } = await supabase.from('monsters').select('*')
  return <MonsterList monsters={data} />
}
```

### Forms with Validation

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  challengeLevel: z.number().min(1).max(20),
});

export function MonsterForm() {
  const form = useForm({
    resolver: zodResolver(schema),
  });
  // ... form implementation
}
```

### RLS Policy Pattern

```sql
-- User can read their own content and public content
CREATE POLICY "Users can read own and public monsters"
ON user_monsters FOR SELECT
USING (
  user_id = auth.uid() OR is_public = true
);
```

## Known Issues & Technical Debt

1. **README.md** - Contains template content from Next.js starter, needs updating for Shadowdark project
2. **Migration Ordering** - Some migrations have been fixed/updated (see 20250921000013_fix_armor_class_constraint.sql)
3. **Type Generation** - Supabase types need to be generated and imported for better type safety
4. **Error Handling** - Need comprehensive error boundaries and toast notifications
5. **Loading States** - Skeleton loaders need to be added consistently

## Resources & References

### Official Documentation

- [Shadowdark RPG](https://www.thearcanelibrary.com/pages/shadowdark) - Official game rules
- [Next.js Docs](https://nextjs.org/docs) - Framework documentation
- [Supabase Docs](https://supabase.com/docs) - Backend/database docs
- [shadcn/ui](https://ui.shadcn.com/) - Component library docs

### Project-Specific

- See `project-plan/prd.md` for complete feature requirements
- See `.claude/agents/shadowdark-specialist-agent.md` for Shadowdark game mechanics reference
- See `specs/001-create-a-plan/` for current feature specification

## Getting Help

When working on this project:

1. **Game Rules Questions**: Use the `shadowdark-specialist` agent
2. **Database Design**: Use the `supabase-db-architect` agent
3. **Architecture Decisions**: Use the `nextjs-architect` agent
4. **Component Development**: Use the `react-developer` agent
5. **Feature Planning**: Use the `frontend-pm` agent or `/specify` command

## Last Updated

- **October 22, 2025** - Migrated from Mantine UI to shadcn/ui
- **October 17, 2025** - Added Next.js 15 API route patterns and async params documentation
- **October 16, 2025** - Initial claude.md creation
