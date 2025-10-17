# Shadowdark Monster Manager - Implementation Plan

## Overview

This document outlines the comprehensive implementation plan to transform the current Next.js + Supabase starter into the full Shadowdark Monster Manager web application as specified in the PRD.

## Current State Assessment

### Foundation Strengths

- ✅ Next.js 15 with App Router configured
- ✅ Supabase authentication working
- ✅ TypeScript and ESLint setup
- ✅ Basic component structure with shadcn/ui
- ✅ Tailwind CSS styling
- ✅ Middleware for auth protection

### Migration Requirements

- **UI Framework**: Transition from shadcn/ui to Mantine (gradual migration)
- **State Management**: Add Zustand for global state
- **Database**: Design and implement comprehensive schema
- **Testing**: Add Vitest and Playwright testing infrastructure

## Implementation Phases

### Phase 1: Foundation & Database (2-3 weeks)

#### 1.1 Database Schema Implementation

Create comprehensive Supabase database with the following tables:

**Core Tables:**

```sql
-- Users and profiles
user_profiles (id, user_id, display_name, bio, avatar_url, is_admin, created_at)

-- Monster data
official_monsters (id, name, challenge_level, hit_points, armor_class, speed, attacks, abilities, treasure, tags, source, created_at)
user_monsters (id, user_id, is_public, name, challenge_level, hit_points, armor_class, speed, attacks, abilities, treasure, tags, source, author_notes, icon_url, art_url, created_at, updated_at)

-- Groups and lists
user_groups (id, user_id, is_public, name, description, monsters, combined_stats, tags, created_at, updated_at)
user_lists (id, user_id, name, description, party_level, challenge_level, xp_budget, created_at, updated_at)
list_items (id, list_id, item_type, item_id, quantity, created_at)

-- Encounter tables
user_encounter_tables (id, user_id, name, die_size, tags, created_at, updated_at)
encounter_slots (id, table_id, slot_number, item_type, item_id, created_at)

-- Community features
user_favorites (user_id, item_type, item_id, created_at)
flags (id, flagged_item_type, flagged_item_id, reporter_user_id, reason, comment, status, created_at, resolved_at, resolved_by)
audit_logs (id, admin_user_id, action_type, target_id, timestamp, notes)

-- Admin managed data
tag_types (id, name, created_at)
tag_locations (id, name, created_at)
```

**Views:**

```sql
-- Combined view for search
all_monsters (combining official_monsters and public user_monsters)
all_groups (public user_groups)
```

#### 1.2 Row Level Security (RLS) Policies

```sql
-- User-owned data policies
ALTER TABLE user_monsters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD their own monsters" ON user_monsters
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Everyone can read public monsters" ON user_monsters
  FOR SELECT USING (is_public = true);

-- Admin policies
CREATE POLICY "Admins have full access" ON official_monsters
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );
```

#### 1.3 Package Dependencies

```json
{
  "@mantine/core": "^7.x",
  "@mantine/hooks": "^7.x",
  "@mantine/form": "^7.x",
  "@mantine/modals": "^7.x",
  "@mantine/notifications": "^7.x",
  "@mantine/dropzone": "^7.x",
  "@mantine/dates": "^7.x",
  "zustand": "^4.x",
  "react-hook-form": "^7.x",
  "zod": "^3.x",
  "@hookform/resolvers": "^3.x",
  "@dnd-kit/core": "^6.x",
  "@dnd-kit/sortable": "^8.x",
  "@dnd-kit/utilities": "^3.x",
  "react-markdown": "^9.x",
  "@cloudinary/react": "^1.x",
  "vitest": "^1.x",
  "@playwright/test": "^1.x"
}
```

#### 1.4 State Management Setup

```typescript
// lib/store/monsters.ts
import { create } from "zustand";

interface MonsterStore {
  searchQuery: string;
  searchFilters: SearchFilters;
  searchResults: Monster[];
  isLoading: boolean;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: SearchFilters) => void;
  performSearch: () => Promise<void>;
}

export const useMonsterStore = create<MonsterStore>((set, get) => ({
  searchQuery: "",
  searchFilters: {},
  searchResults: [],
  isLoading: false,
  // ... implementations
}));
```

#### 1.5 Monster Import Script

```typescript
// scripts/import-monsters.ts
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const MonsterSchema = z.object({
  name: z.string(),
  challengeLevel: z.number().min(1).max(20),
  hitPoints: z.number().min(1),
  armorClass: z.number().min(1).max(21),
  speed: z.string(),
  attacks: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      damage: z.string(),
      range: z.string().optional(),
    }),
  ),
  abilities: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
    }),
  ),
  treasure: z
    .object({
      type: z.string(),
      amount: z.string(),
    })
    .optional(),
  tags: z.object({
    type: z.array(z.string()),
    location: z.array(z.string()),
  }),
  source: z.string(),
});

async function importMonsters(jsonFile: string) {
  const data = JSON.parse(await fs.readFile(jsonFile, "utf-8"));
  const validated = z.array(MonsterSchema).parse(data);

  const supabase = createClient(url, serviceKey);
  const { error } = await supabase.from("official_monsters").insert(
    validated.map((monster) => ({
      ...monster,
      attacks: JSON.stringify(monster.attacks),
      abilities: JSON.stringify(monster.abilities),
      treasure: JSON.stringify(monster.treasure),
      tags: JSON.stringify(monster.tags),
    })),
  );

  if (error) throw error;
  console.log(`Imported ${validated.length} monsters`);
}
```

### Phase 2: Core Monster Management (2-3 weeks)

#### 2.1 Search Infrastructure

```typescript
// lib/search/fuzzy-search.ts
export class FuzzySearchService {
  static async searchMonsters(query: string, filters: SearchFilters) {
    const { data, error } = await supabase.rpc("fuzzy_search_monsters", {
      search_term: query,
      fuzziness_level: filters.fuzziness || "medium",
      min_challenge_level: filters.minCL,
      max_challenge_level: filters.maxCL,
      tag_types: filters.tagTypes,
      tag_locations: filters.tagLocations,
    });

    if (error) throw error;
    return data;
  }
}
```

**Database Function:**

```sql
CREATE OR REPLACE FUNCTION fuzzy_search_monsters(
  search_term TEXT,
  fuzziness_level TEXT DEFAULT 'medium',
  min_challenge_level INTEGER DEFAULT NULL,
  max_challenge_level INTEGER DEFAULT NULL,
  tag_types TEXT[] DEFAULT NULL,
  tag_locations TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  challenge_level INTEGER,
  -- ... other fields
  similarity REAL
)
LANGUAGE plpgsql
AS $$
DECLARE
  similarity_threshold REAL;
BEGIN
  -- Set similarity threshold based on fuzziness level
  similarity_threshold := CASE fuzziness_level
    WHEN 'low' THEN 0.8
    WHEN 'medium' THEN 0.6
    WHEN 'high' THEN 0.4
    ELSE 0.6
  END;

  RETURN QUERY
  SELECT
    m.id,
    m.name,
    m.challenge_level,
    -- ... other fields
    GREATEST(
      similarity(m.name, search_term),
      similarity(m.source, search_term)
    ) as similarity
  FROM all_monsters m
  WHERE
    (
      similarity(m.name, search_term) > similarity_threshold OR
      similarity(m.source, search_term) > similarity_threshold OR
      search_term = ''
    )
    AND (min_challenge_level IS NULL OR m.challenge_level >= min_challenge_level)
    AND (max_challenge_level IS NULL OR m.challenge_level <= max_challenge_level)
    -- ... tag filtering logic
  ORDER BY similarity DESC, m.name;
END;
$$;
```

#### 2.2 Monster Components

```typescript
// components/monsters/MonsterCard.tsx
import { Card, Badge, Group, Text, ActionIcon } from '@mantine/core';
import { IconHeart, IconPlus, IconEye } from '@tabler/icons-react';

interface MonsterCardProps {
  monster: Monster;
  onAddToList?: (monster: Monster) => void;
  onFavorite?: (monster: Monster) => void;
  onView?: (monster: Monster) => void;
}

export function MonsterCard({ monster, onAddToList, onFavorite, onView }: MonsterCardProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" mb="xs">
        <Text fw={500}>{monster.name}</Text>
        <Badge color="blue">CL {monster.challengeLevel}</Badge>
      </Group>

      <Text size="sm" c="dimmed" mb="md">
        HP: {monster.hitPoints} | AC: {monster.armorClass}
      </Text>

      <Group gap="xs" mb="md">
        {monster.tags.type.map(tag => (
          <Badge key={tag} variant="light" size="xs">{tag}</Badge>
        ))}
      </Group>

      <Group justify="flex-end" gap="xs">
        <ActionIcon variant="light" onClick={() => onView?.(monster)}>
          <IconEye size="1rem" />
        </ActionIcon>
        <ActionIcon variant="light" onClick={() => onFavorite?.(monster)}>
          <IconHeart size="1rem" />
        </ActionIcon>
        <ActionIcon variant="light" onClick={() => onAddToList?.(monster)}>
          <IconPlus size="1rem" />
        </ActionIcon>
      </Group>
    </Card>
  );
}
```

#### 2.3 Search Interface

```typescript
// components/search/MonsterSearch.tsx
import { TextInput, Select, MultiSelect, Group, Button } from '@mantine/core';
import { IconSearch, IconDice6 } from '@tabler/icons-react';
import { useMonsterStore } from '@/lib/store/monsters';

export function MonsterSearch() {
  const {
    searchQuery,
    searchFilters,
    isLoading,
    setSearchQuery,
    setFilters,
    performSearch,
    getRandomMonster
  } = useMonsterStore();

  return (
    <div className="space-y-4">
      <Group grow>
        <TextInput
          placeholder="Search monsters..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftSection={<IconSearch size="1rem" />}
        />
        <Button
          variant="light"
          leftSection={<IconDice6 size="1rem" />}
          onClick={getRandomMonster}
        >
          Random
        </Button>
      </Group>

      <Group grow>
        <Select
          label="Fuzziness"
          data={[
            { value: 'low', label: 'Low (Exact matches)' },
            { value: 'medium', label: 'Medium (Some tolerance)' },
            { value: 'high', label: 'High (Loose matching)' },
          ]}
          value={searchFilters.fuzziness}
          onChange={(value) => setFilters({ ...searchFilters, fuzziness: value })}
        />
        <Select
          label="Min Challenge Level"
          data={Array.from({ length: 20 }, (_, i) => ({
            value: String(i + 1),
            label: String(i + 1)
          }))}
          value={searchFilters.minCL}
          onChange={(value) => setFilters({ ...searchFilters, minCL: value })}
        />
        <Select
          label="Max Challenge Level"
          data={Array.from({ length: 20 }, (_, i) => ({
            value: String(i + 1),
            label: String(i + 1)
          }))}
          value={searchFilters.maxCL}
          onChange={(value) => setFilters({ ...searchFilters, maxCL: value })}
        />
      </Group>

      <Group grow>
        <MultiSelect
          label="Monster Types"
          data={typeOptions}
          value={searchFilters.tagTypes}
          onChange={(value) => setFilters({ ...searchFilters, tagTypes: value })}
        />
        <MultiSelect
          label="Locations"
          data={locationOptions}
          value={searchFilters.tagLocations}
          onChange={(value) => setFilters({ ...searchFilters, tagLocations: value })}
        />
      </Group>
    </div>
  );
}
```

### Phase 3: Advanced Features (2-3 weeks)

#### 3.1 Monster Groups/Packs

```typescript
// components/groups/GroupBuilder.tsx
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

export function GroupBuilder() {
  const [groupMonsters, setGroupMonsters] = useState<GroupMonster[]>([]);
  const [combinedStats, setCombinedStats] = useState<CombinedStats>();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setGroupMonsters(items => {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const updateCombinedStats = useCallback(() => {
    const stats = calculateCombinedStats(groupMonsters);
    setCombinedStats(stats);
  }, [groupMonsters]);

  useEffect(() => {
    updateCombinedStats();
  }, [updateCombinedStats]);

  return (
    <div className="space-y-6">
      <Card>
        <Text fw={500} mb="md">Combined Group Stats</Text>
        {combinedStats && (
          <div className="grid grid-cols-2 gap-4">
            <div>Total XP: {combinedStats.totalXP}</div>
            <div>Total HP: {combinedStats.totalHP}</div>
            <div>Effective CL: {combinedStats.effectiveCL}</div>
            <div>Monster Count: {combinedStats.count}</div>
          </div>
        )}
      </Card>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={groupMonsters} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {groupMonsters.map(monster => (
              <SortableGroupMonster
                key={monster.id}
                monster={monster}
                onQuantityChange={(id, quantity) => updateQuantity(id, quantity)}
                onRemove={(id) => removeMonster(id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
```

#### 3.2 Encounter Table Generation

```typescript
// lib/encounters/table-generator.ts
export class EncounterTableGenerator {
  static generateTable(
    monsters: Monster[],
    dieSize: number,
    distribution: "uniform" | "manual" = "uniform",
  ): EncounterTable {
    if (distribution === "uniform") {
      return this.generateUniformTable(monsters, dieSize);
    }
    return this.generateManualTable(monsters, dieSize);
  }

  private static generateUniformTable(
    monsters: Monster[],
    dieSize: number,
  ): EncounterTable {
    const slots: EncounterSlot[] = [];
    const monstersPerSlot = Math.ceil(monsters.length / dieSize);

    for (let i = 1; i <= dieSize; i++) {
      const slotMonsters = monsters.slice(
        (i - 1) * monstersPerSlot,
        i * monstersPerSlot,
      );

      if (slotMonsters.length > 0) {
        const randomMonster =
          slotMonsters[Math.floor(Math.random() * slotMonsters.length)];
        slots.push({
          slotNumber: i,
          itemType: "monster",
          itemId: randomMonster.id,
          monster: randomMonster,
        });
      }
    }

    return {
      dieSize,
      slots,
      totalXP: this.calculateTotalXP(slots),
      averageCL: this.calculateAverageCL(slots),
    };
  }

  static rollTable(table: EncounterTable): EncounterSlot {
    const roll = Math.floor(Math.random() * table.dieSize) + 1;
    return (
      table.slots.find((slot) => slot.slotNumber === roll) || table.slots[0]
    );
  }
}
```

### Phase 4: Community & Admin (1-2 weeks)

#### 4.1 Public Sharing & Discovery

```typescript
// components/community/CommunityBrowser.tsx
export function CommunityBrowser() {
  const [contentType, setContentType] = useState<'monsters' | 'groups'>('monsters');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'name'>('recent');

  const { data: publicContent, isLoading } = useQuery({
    queryKey: ['public-content', contentType, sortBy],
    queryFn: () => fetchPublicContent(contentType, sortBy),
  });

  return (
    <div className="space-y-6">
      <Group justify="space-between">
        <SegmentedControl
          value={contentType}
          onChange={setContentType}
          data={[
            { label: 'Monsters', value: 'monsters' },
            { label: 'Groups', value: 'groups' },
          ]}
        />
        <Select
          value={sortBy}
          onChange={setSortBy}
          data={[
            { label: 'Most Recent', value: 'recent' },
            { label: 'Most Popular', value: 'popular' },
            { label: 'Alphabetical', value: 'name' },
          ]}
        />
      </Group>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {publicContent?.map(item => (
          <CommunityContentCard
            key={item.id}
            content={item}
            onFlag={(item, reason) => flagContent(item, reason)}
            onAddToList={(item) => addToList(item)}
          />
        ))}
      </div>
    </div>
  );
}
```

#### 4.2 Flagging System

```typescript
// components/moderation/FlagModal.tsx
export function FlagModal({ content, opened, onClose, onSubmit }: FlagModalProps) {
  const form = useForm({
    initialValues: {
      reason: '',
      comment: '',
    },
    validate: {
      reason: (value) => !value ? 'Please select a reason' : null,
      comment: (value) => value.length < 10 ? 'Please provide more details' : null,
    },
  });

  const flagReasons = [
    { value: 'inappropriate', label: 'Inappropriate Content' },
    { value: 'copyright', label: 'Copyright Violation' },
    { value: 'spam', label: 'Spam or Low Quality' },
    { value: 'inaccurate', label: 'Inaccurate Game Data' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <Modal opened={opened} onClose={onClose} title="Report Content">
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Select
          label="Reason for reporting"
          placeholder="Select a reason"
          data={flagReasons}
          {...form.getInputProps('reason')}
          mb="md"
        />

        <Textarea
          label="Additional details"
          placeholder="Please provide more information about the issue"
          minRows={3}
          {...form.getInputProps('comment')}
          mb="md"
        />

        <Group justify="flex-end">
          <Button variant="subtle" onClick={onClose}>Cancel</Button>
          <Button type="submit" color="red">Report</Button>
        </Group>
      </form>
    </Modal>
  );
}
```

#### 4.3 Admin Dashboard

```typescript
// app/admin/page.tsx
export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader title="Admin Dashboard" />

      <Tabs defaultValue="flags">
        <Tabs.List>
          <Tabs.Tab value="flags">Content Flags</Tabs.Tab>
          <Tabs.Tab value="monsters">Official Monsters</Tabs.Tab>
          <Tabs.Tab value="tags">Manage Tags</Tabs.Tab>
          <Tabs.Tab value="audit">Audit Log</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="flags">
          <FlagsManagement />
        </Tabs.Panel>

        <Tabs.Panel value="monsters">
          <OfficialMonstersManagement />
        </Tabs.Panel>

        <Tabs.Panel value="tags">
          <TagsManagement />
        </Tabs.Panel>

        <Tabs.Panel value="audit">
          <AuditLog />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
```

### Phase 5: Polish & Testing (1-2 weeks)

#### 5.1 Performance Optimizations

```typescript
// components/search/VirtualizedResults.tsx
import { FixedSizeList as List } from 'react-window';

export function VirtualizedResults({ monsters }: { monsters: Monster[] }) {
  const Row = ({ index, style }: { index: number; style: CSSProperties }) => (
    <div style={style}>
      <MonsterCard monster={monsters[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={monsters.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </List>
  );
}
```

#### 5.2 Testing Infrastructure

```typescript
// __tests__/utils/test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        {children}
      </MantineProvider>
    </QueryClientProvider>
  );
};

const customRender = (ui: React.ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

**Test Examples:**

```typescript
// __tests__/components/MonsterCard.test.tsx
import { render, screen, fireEvent } from '../utils/test-utils';
import { MonsterCard } from '@/components/monsters/MonsterCard';

describe('MonsterCard', () => {
  const mockMonster = createMockMonster();

  it('displays monster information correctly', () => {
    render(<MonsterCard monster={mockMonster} />);

    expect(screen.getByText(mockMonster.name)).toBeInTheDocument();
    expect(screen.getByText(`CL ${mockMonster.challengeLevel}`)).toBeInTheDocument();
    expect(screen.getByText(`HP: ${mockMonster.hitPoints}`)).toBeInTheDocument();
  });

  it('calls onAddToList when add button is clicked', () => {
    const onAddToList = vi.fn();
    render(<MonsterCard monster={mockMonster} onAddToList={onAddToList} />);

    fireEvent.click(screen.getByLabelText('Add to list'));
    expect(onAddToList).toHaveBeenCalledWith(mockMonster);
  });
});
```

```typescript
// e2e/monster-search.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Monster Search", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
  });

  test("should search for monsters and display results", async ({ page }) => {
    // Enter search term
    await page.fill("[data-testid=search-input]", "goblin");
    await page.waitForSelector("[data-testid=search-results]");

    // Verify results are displayed
    const results = page.locator("[data-testid=monster-card]");
    await expect(results).not.toHaveCount(0);

    // Verify first result contains search term
    const firstResult = results.first();
    await expect(firstResult).toContainText("goblin", { ignoreCase: true });
  });

  test("should filter by challenge level", async ({ page }) => {
    // Set challenge level filter
    await page.selectOption("[data-testid=min-cl-filter]", "3");
    await page.selectOption("[data-testid=max-cl-filter]", "5");

    // Perform search
    await page.fill("[data-testid=search-input]", "");
    await page.waitForSelector("[data-testid=search-results]");

    // Verify all results are within CL range
    const clBadges = page.locator("[data-testid=cl-badge]");
    const count = await clBadges.count();

    for (let i = 0; i < count; i++) {
      const clText = await clBadges.nth(i).textContent();
      const cl = parseInt(clText?.replace("CL ", "") || "0");
      expect(cl).toBeGreaterThanOrEqual(3);
      expect(cl).toBeLessThanOrEqual(5);
    }
  });
});
```

## Environment Configuration

### Required Environment Variables

```env
# Existing Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Cloudinary for image uploads
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Game Icons API (optional, for rate limiting)
GAME_ICONS_API_KEY=your-api-key

# Admin configuration
ADMIN_EMAIL=admin@yourdomain.com
```

### Vercel Deployment Configuration

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/api/search",
      "destination": "/api/search/monsters"
    }
  ]
}
```

## Security Considerations

### Input Validation

- All user inputs validated with Zod schemas
- JSONB fields sanitized before storage
- Markdown content sanitized to prevent XSS
- File uploads restricted by type and size

### Database Security

- Row Level Security (RLS) on all user tables
- Service role key only in server-side functions
- Regular backup strategy for user data
- Audit logging for all admin actions

### Content Moderation

- Automated content scanning for inappropriate material
- Community flagging system with admin review
- Rate limiting on content creation
- IP-based restrictions for repeat offenders

## Performance Targets

### Page Load Performance

- **Landing Page**: < 1.5 seconds
- **Dashboard**: < 2 seconds
- **Search Results**: < 500ms for response
- **Monster Details**: < 1 second

### Database Performance

- **Search Queries**: < 300ms average
- **CRUD Operations**: < 100ms average
- **Image Uploads**: < 5 seconds
- **Bulk Operations**: < 10 seconds

### Scalability Targets

- **Concurrent Users**: 100+ simultaneous
- **Database Size**: 10,000+ monsters, 1,000+ users
- **Storage**: 1GB+ images and assets
- **API Calls**: 1,000+ requests/minute

## Success Metrics

### User Engagement

- **Monthly Active Users**: 500+ within 6 months
- **Session Duration**: 15+ minutes average
- **Feature Adoption**: 70%+ users create lists
- **Return Rate**: 30%+ weekly active users

### Content Quality

- **User-Generated Content**: 100+ custom monsters/month
- **Flag Rate**: < 5% of public content
- **Admin Response Time**: < 24 hours for flags
- **Content Approval Rate**: > 90%

### Technical Performance

- **Uptime**: 99.9%
- **Error Rate**: < 1% of requests
- **Page Speed Score**: > 90
- **Mobile Performance**: > 85

## Risk Mitigation

### Technical Risks

- **Database Performance**: Implement proper indexing and query optimization
- **Image Storage Costs**: Set Cloudinary optimization rules and monitoring
- **Search Accuracy**: Fine-tune fuzzy search algorithms with user feedback
- **Mobile Performance**: Progressive Web App features for offline access

### Content Risks

- **Copyright Infringement**: Clear terms of service and DMCA process
- **Inappropriate Content**: Robust moderation tools and community reporting
- **Data Loss**: Regular backups and disaster recovery procedures
- **Privacy Compliance**: GDPR-compliant data handling and user controls

### Business Risks

- **User Adoption**: Strong onboarding flow and feature discovery
- **Community Growth**: Incentivize high-quality content creation
- **Revenue Model**: Plan for premium features and sustainability
- **Competition**: Focus on unique Shadowdark-specific features

## Next Steps

1. **Setup Development Environment** (Week 1)
   - Configure local Supabase instance
   - Set up testing infrastructure
   - Implement basic database schema

2. **Phase 1 Implementation** (Weeks 2-4)
   - Database schema and RLS policies
   - Monster import script
   - Basic search functionality

3. **MVP Release** (Week 12)
   - Core features complete
   - Basic community features
   - Admin dashboard functional

4. **Post-MVP Iterations** (Months 4-6)
   - Advanced sharing features
   - Mobile app considerations
   - Performance optimizations
   - Community growth features

This implementation plan provides a comprehensive roadmap from the current Next.js starter to a production-ready Shadowdark Monster Manager that meets all PRD requirements while maintaining high code quality and performance standards.
