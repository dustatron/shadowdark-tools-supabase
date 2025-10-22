# Product Requirements Document (PRD): Shadowdark Monster Manager Web App

## 1. Document Overview

### 1.1 Purpose

This PRD defines the requirements for "Shadowdark Monster Manager," a web application to assist Game Masters (GMs) in managing monsters and generating encounters for the _Shadowdark_ TTRPG. Built with Next.js (App Router) and Supabase, the app enables looking up monster stats, creating/saving monster lists and groups, generating random roll tables for encounters, fuzzy searching, random selections, and custom monster/group creation. It includes user authentication, public sharing of custom content with flagging, guest access, and admin tools for the MVP.

This document captures decisions from iterative clarifying questions to ensure alignment on MVP scope. Post-MVP expansions (e.g., advanced sharing, real-time collab) are noted but not detailed.

### 1.2 Version History

- **Version 2.0**: Full MVP specification incorporating user clarifications (Date: [Current Date]).
- **Previous**: Version 1.0 (initial draft, incomplete).
- **Scope**: MVP focuses on core GM tools, personal management, and basic community features. Excludes non-essential items like full accessibility, analytics, or CI/CD pipelines.

### 1.3 Key Assumptions and Dependencies

- _Shadowdark_ data: Official monsters pre-loaded via user-provided JSON import script (validated with Zod, flattened nested structures like attacks into JSONB fields).
- Compliance: All data handles comply with _Shadowdark_ licensing (e.g., no unauthorized scraping). Public customs assume fair use for community sharing.
- Development: Single admin account (boolean `isAdmin` in Supabase users table). JSON import script runs once during deployment.
- Hosting: Deployed on Vercel with GitHub integration.
- Testing: 40% unit/integration coverage with Vitest; E2E with Playwright on key flows (no automated CI/CD).

### 1.4 Glossary

- **Monster**: Individual entity with stats (e.g., Name, Challenge Level (CL), HP, AC, Speed, Attacks (JSONB), Special Abilities (JSONB), Treasure (JSONB), Tags (type/location), Source, Author Notes (Markdown), Icon/Art URL).
- **Group/Pack**: Reusable collection of monsters (e.g., "Goblin Patrol: 3 Goblins x1"), with aggregated stats (total XP, HP), quantities, and inherited/override tags.
- **List**: User-saved collection of monsters/groups for encounters.
- **Encounter Table**: Saved random roll table (user-selectable/custom die size, e.g., d6/d20), with slots assigned monsters/groups (uniform distribution or manual).
- **Fuzzy Search**: Live results (debounced, low/medium/high fuzziness via pg_trgm) across all fields, no autocomplete (results show after 2-3 chars).
- **Public**: Custom monsters/groups set to public; visible in global searches/community; flaggable by users.
- **Guest**: Pre-login users with limited access (e.g., search public, temp lists in localStorage, max 3 lists/5 tables/10 randoms per session).

## 2. Business Goals and Objectives

### 2.1 Problem Statement

GMs waste time referencing _Shadowdark_ monster stats, building lists, and generating balanced encounters. This app digitizes these tasks with search, customization, and randomization, while fostering a safe community for shared content.

### 2.2 Goals

- **Primary**: MVP delivering core tools for personal monster management and encounter prep, with basic community discovery.
- **Secondary**: Encourage sign-ups via guest demos; enable admin moderation for growth.
- **Out of Scope for MVP**: Advanced sharing (e.g., invites), real-time collab, offline caching beyond saved lists, full WCAG accessibility, analytics, rate limiting, i18n, version history, search history, soft deletes.

### 2.3 Success Metrics

- Engagement: 500+ users in 6 months; 30% weekly active (tracked manually post-launch).
- Retention: Users creating ≥1 list/table in first session.
- Feedback: In-app surveys (NPS >7); monitor flag reports for moderation needs.

### 2.4 Target Audience and User Personas

- **Primary**: _Shadowdark_ GMs (18-45, TTRPG hobbyists).
- **Personas**:
  - **Hobbyist GM (Primary)**: Casual player prepping weekly sessions; needs quick searches, custom tweaks, random tables. Values fuzzy search, tags, exports.
  - **Community Creator**: Shares homebrew monsters; uses public features, monitors flags via profile.
  - **Admin/Dev**: Single user managing official data/tags/flags; accesses dashboard for reviews.
  - **Guest Visitor**: Browses public content on landing page; converts via temp features.

## 3. Features and Requirements

### 3.1 Core User Flows (MVP)

1. **Authentication & Onboarding**:
   - Supabase Auth: Email/password + OAuth (Google, etc.). Password reset, email verification.
   - Post-login: Redirect to dashboard. Guests: Temp localStorage lists (migrate on login).
   - No tutorial; quick start via dashboard tabs.

2. **Global Search & Discovery**:
   - Unified search bar (top nav): Fuzzy/live results from `all_monsters` view (official + public customs/groups). Filters: Party level, CL, XP budget, tags (type/location), fuzziness (low/medium/high dropdown).
   - Results: Infinite scrolling, sorting (name, CL, alpha), bulk select (add to list/group/export). Cards with icon, stats, tags, source/author.
   - Random Monster: Button for instant selection (respects filters/tags; from saved lists or global).
   - Community Section: Browse/filter public monsters/groups (searchable list/grid, infinite scroll). Guests: View-only, add to temp lists.

3. **Monster Management**:
   - **Official Lookup**: Pre-loaded, read-only (separate `official_monsters` table). View details: Full stats, JSONB-rendered attacks/abilities/treasure, source ("Shadowdark Core"), tags.
   - **Custom Creation/Editing**: Standalone entities (`user_monsters` table). Full _Shadowdark_ fields (required: Name, CL; validated with Zod/React Hook Form: XP=CLx25, AC 1-21, etc.). Nested JSONB via repeatable forms (add/remove attacks). Tags: Predefined dropdowns (admin-editable types/locations) + custom. Markdown author notes (preview/render). Source editable. Icon: Game-icons.net API search/modal + Cloudinary upload (64x64px optimized). Art: Single Cloudinary upload (300x400px WebP). Private/public toggle.
   - Details Page: Stats, tags, notes (visible/editable only by author/admin), source/author info. Click-through to group sources. Tooltips: Hardcoded _Shadowdark_ rules (e.g., CL explanation).
   - Copy Official: Duplicate to custom for edits.

4. **Groups/Packs**:
   - Creation/Editing: Multi-select from search (official/custom/public), quantities (e.g., "Goblin x3"), auto-aggregate stats (total XP/HP, effective CL/AC). Inherited/override tags. Stored in `user_groups` table (private/public). JSONB for nested if needed.
   - UI: Repeatable form for items, drag-and-drop reordering (within group). Preview combined stats.
   - Usage: Searchable/filterable like monsters; add to lists/tables as single entry (indivisible in rolls).

5. **Saved Lists**:
   - Multiple named lists (`user_lists` + junction `list_items` table; item_type/id, quantity). Tags/metadata (party level, CL, XP budget; editable).
   - Actions: Create/edit (add/remove via search/bulk/drag-reorder within list), duplicate, delete, archive. Edit/delete individuals without affecting customs/groups.
   - Offline: Cache in localStorage for logged-in (view-only when offline).

6. **Encounter Generation**:
   - From lists/global/public: Generate roll tables (uniform random/manual assignment). User-selectable/custom die size (numeric input, ≥2, cap d100; validated).
   - Slots: Monsters/groups (single entry for groups). Auto-calc total XP/CL/difficulty. Filters/tags apply.
   - Saved Tables: `user_encounter_tables` + junction `encounter_slots` (slot_number, item_type/id). Name, die_size, tags. Edit/reorder (drag/manual swap). Roll Simulator: Instant random result (no animation/logging).
   - Guests: Temp generations (max 5/session, localStorage).

7. **Public & Community Features**:
   - Public customs/groups: Visible in global/community searches (`all_monsters` view). Attribution: Author profile (name, avatar, bio).
   - Flagging: In-app form (reason enum + comment; `flags` table). Users insert; admins review/resolve/remove/edit (no email notifications).
   - No sharing lists/tables yet.

8. **Dashboard & Navigation**:
   - Post-login: Tabs (Monsters, Lists, Encounters, Favorites, Community) via shadcn tabs (top bar desktop; hamburger mobile).
   - Sections: Recent items, random button, search. Favorites: List view (searchable/filterable by type; quick actions: unfavorite, add to list, view). My Public Items: Tabbed list (monsters/groups/lists/tables; actions: edit, toggle private, delete).
   - Profile/Settings: Edit name/bio/avatar (Cloudinary widget, initials fallback via shadcn avatar). View public items.

9. **Exports & Printing**:
   - JSON/Markdown for monsters/lists/tables/groups. No PDF.
   - Print-Friendly: CSS @media for clean views (monsters/groups/tables); browser dialog.

10. **Guest/Landing Page**:
    - Public: Hero with demo search bar (public only, condensed cards, "Sign up to save"). Feature showcase, sign-up CTA with modals.
    - Guests: Search public, temp lists (max 3/session), generations (max 5), random (max 10). Migrate to account on login. Limits reset on refresh.

11. **Admin Dashboard**:
    - Access: `isAdmin` boolean in users table; middleware check.
    - Sections: Manage official monsters (edit/insert via forms, bulk import script). Tags: Add/edit predefined lists (types/locations). Flags: Searchable table (shadcn data table; actions: resolve/remove/edit). Audit Log: For flag actions (`audit_logs` table; admin-only).
    - Single admin; no multi-user roles.

### 3.2 Non-Core Features

- Dark Mode: Toggle (localStorage/system pref).
- Settings: Remember last (fuzziness, filters, die size) via localStorage.
- Bulk Actions: Multi-select in searches/community/favorites/lists (add to list/group/export).
- SEO: Dynamic meta (titles/descriptions/sitemaps) for landing/community/details. No Open Graph/Twitter Cards.
- Loading: Skeleton/spinners (shadcn).
- Errors: Global handling (React Boundaries + shadcn toasts).
- Validation: Zod everywhere (forms, imports); _Shadowdark_ rules (e.g., XP calc, stat warnings).
- Drag-and-Drop: Reordering within lists/tables/groups (@dnd-kit; no cross-movement/visual extras).

## 4. Technical Stack

- **Frontend**: Next.js (App Router, TypeScript), shadcn/ui (UI components built on Radix UI), React Hook Form + Zod (forms), Zustand (global state: filters, search, lists).
- **Backend/Database**: Supabase (Postgres: two monster tables + views/junctions for lists/groups/tables/flags/favorites/audit; RLS for ownership/public; pg_trgm for fuzzy; Edge Functions for calculations/uploads/searches). JSON import script (Node.js/Zod).
- **Images/Icons**: Cloudinary (widget for uploads: icons/art/avatars; auto-optimize: formats, resize/compress). Game-icons.net API (dynamic search, cache none).
- **Other**: @dnd-kit (drag), Markdown rendering (e.g., react-markdown). No state mgmt beyond Zustand.
- **Testing**: Vitest (40% coverage: components/queries); Playwright (E2E: login/search/create/generate).
- **Deployment**: Vercel (auto from GitHub; ISR for static pages like landing).
- **Dev Tools**: ESLint/Prettier (manual linting).

### 4.1 Database Schema (High-Level)

- **official_monsters**: id, name, cl, hp, ac, ... , attacks (JSONB), tags (JSONB), source (text).
- **user_monsters**: id, user_id, is_public, name, cl, ..., icon_url, art_url, author_notes (text), source (text).
- **user_groups**: id, user_id, is_public, name, combined_stats (JSONB), ...
- **user_lists** + **list_items** (junction: list_id, item_type/id, quantity).
- **user_encounter_tables** + **encounter_slots** (junction: table_id, slot_number, item_type/id).
- **flags**: id, flagged_item_type/id, reporter_user_id, reason (enum), comment, status (enum).
- **user_favorites**: user_id, item_type/id.
- **audit_logs**: admin_user_id, action_type, target_id, timestamp, notes.
- **user_profiles**: user_id, display_name, bio, avatar_url.
- **tags_types/locations**: id, name (admin-managed).
- **all_monsters** (view): UNION official + public user_monsters/groups.
- RLS: User-owned (auth.uid()=user_id), public read, admin full, official read-only.

## 5. UI/UX Guidelines

- **Design**: shadcn/ui theme (responsive: mobile hamburger, desktop tabs). Dark mode (localStorage). Infinite scroll for lists/searches.
- **Components**: Forms (repeatable for JSONB), cards for results, data tables for admin/dashboards, dialogs for uploads/searches.
- **Interactions**: Live search (debounced), toasts for actions, tooltips for rules.
- **Mobile**: Responsive (Tailwind/shadcn); touch-friendly (no full keyboard shortcuts).
- **Print**: @media queries for clean sheets.

## 6. Non-Functional Requirements

- **Performance**: Lazy-load images; no heavy optimizations (e.g., no service workers beyond basics). Target <2s load for searches.
- **Security**: Supabase RLS/Edge Functions for sensitive ops (e.g., uploads, calcs). No rate limiting MVP.
- **Scalability**: Supabase free tier MVP; monitor for growth.
- **Accessibility**: Basic (ARIA/Mantine defaults); no full WCAG.
- **Offline**: LocalStorage for saved lists (view-only); no official caching.
- **SEO**: Next.js metadata/sitemaps for public pages.

## 7. Risks and Mitigations

- **Risk**: JSON import errors → Mitigation: Zod validation/logging.
- **Risk**: RLS misconfig → Mitigation: Test policies in dev.
- **Risk**: Public content abuse → Mitigation: Flagging + admin review.
- **Risk**: Image costs (Cloudinary) → Mitigation: Optimization rules; monitor usage.

## 8. Next Steps

- **Development Phases**: 1. Setup (Next/Supabase/Mantine). 2. Auth/Database/Import. 3. Core Features (Search/Customs/Lists). 4. Generation/Community. 5. Admin/Guests. 6. Testing/Deploy.
- **Timeline Estimate**: 4-6 weeks for MVP (solo dev).
- **Open Items**: Finalize JSON schema for import; review _Shadowdark_ rules for tooltips/validation.

This PRD is now complete and ready for implementation. If you'd like expansions, wireframes, or adjustments, let me know!
