# Shadowdark Monster Manager - Implementation Plan

## Overview

This document outlines the comprehensive implementation plan to transform the current Next.js + Supabase starter into the full Shadowdark Monster Manager web application as specified in the PRD.

## Current State Assessment

### Foundation Strengths

- ✅ Next.js 15 with App Router configured
- ✅ Supabase authentication working
- ✅ TypeScript and ESLint setup
- ✅ shadcn/ui component library integrated
- ✅ Tailwind CSS styling
- ✅ Middleware for auth protection

### Migration Requirements

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
  "@radix-ui/react-dialog": "^1.x",
  "@radix-ui/react-dropdown-menu": "^2.x",
  "@radix-ui/react-tabs": "^1.x",
  "@radix-ui/react-toast": "^1.x",
  "@radix-ui/react-avatar": "^1.x",
  "@radix-ui/react-select": "^2.x",
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
  "@playwright/test": "^1.x",
  "lucide-react": "^0.x"
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Plus, Eye } from 'lucide-react';

interface MonsterCardProps {
  monster: Monster;
  onAddToList?: (monster: Monster) => void;
  onFavorite?: (monster: Monster) => void;
  onView?: (monster: Monster) => void;
}

export function MonsterCard({ monster, onAddToList, onFavorite, onView }: MonsterCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{monster.name}</CardTitle>
          <Badge variant="secondary">CL {monster.challengeLevel}</Badge>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          HP: {monster.hitPoints} | AC: {monster.armorClass}
        </p>

        <div className="flex gap-2 mb-4">
          {monster.tags.type.map(tag => (
            <Badge key={tag} variant="outline">{tag}</Badge>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={() => onView?.(monster)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onFavorite?.(monster)}>
            <Heart className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onAddToList?.(monster)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

#### 2.3 Search Interface

```typescript
// components/search/MonsterSearch.tsx
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Dices } from 'lucide-react';
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
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search monsters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button
          variant="outline"
          onClick={getRandomMonster}
        >
          <Dices className="mr-2 h-4 w-4" />
          Random
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Fuzziness</label>
          <Select
            value={searchFilters.fuzziness}
            onValueChange={(value) => setFilters({ ...searchFilters, fuzziness: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low (Exact matches)</SelectItem>
              <SelectItem value="medium">Medium (Some tolerance)</SelectItem>
              <SelectItem value="high">High (Loose matching)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">Min Challenge Level</label>
          <Select
            value={searchFilters.minCL}
            onValueChange={(value) => setFilters({ ...searchFilters, minCL: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 20 }, (_, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>
                  {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">Max Challenge Level</label>
          <Select
            value={searchFilters.maxCL}
            onValueChange={(value) => setFilters({ ...searchFilters, maxCL: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 20 }, (_, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>
                  {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function CommunityBrowser() {
  const [contentType, setContentType] = useState<'monsters' | 'groups'>('monsters');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'name'>('recent');

  const { data: publicContent, isLoading } = useQuery({
    queryKey: ['public-content', contentType, sortBy],
    queryFn: () => fetchPublicContent(contentType, sortBy),
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Tabs value={contentType} onValueChange={(v) => setContentType(v as 'monsters' | 'groups')}>
          <TabsList>
            <TabsTrigger value="monsters">Monsters</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="name">Alphabetical</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const flagSchema = z.object({
  reason: z.string().min(1, 'Please select a reason'),
  comment: z.string().min(10, 'Please provide more details'),
});

export function FlagModal({ content, open, onClose, onSubmit }: FlagModalProps) {
  const form = useForm({
    resolver: zodResolver(flagSchema),
    defaultValues: {
      reason: '',
      comment: '',
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Content</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="reason">Reason for reporting</Label>
            <Select {...form.register('reason')}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {flagReasons.map(reason => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.reason && (
              <p className="text-sm text-destructive">{form.formState.errors.reason.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="comment">Additional details</Label>
            <Textarea
              {...form.register('comment')}
              placeholder="Please provide more information about the issue"
              rows={3}
            />
            {form.formState.errors.comment && (
              <p className="text-sm text-destructive">{form.formState.errors.comment.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="destructive">Report</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

#### 4.3 Admin Dashboard

```typescript
// app/admin/page.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <Tabs defaultValue="flags">
        <TabsList>
          <TabsTrigger value="flags">Content Flags</TabsTrigger>
          <TabsTrigger value="monsters">Official Monsters</TabsTrigger>
          <TabsTrigger value="tags">Manage Tags</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="flags">
          <FlagsManagement />
        </TabsContent>

        <TabsContent value="monsters">
          <OfficialMonstersManagement />
        </TabsContent>

        <TabsContent value="tags">
          <TagsManagement />
        </TabsContent>

        <TabsContent value="audit">
          <AuditLog />
        </TabsContent>
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
      {children}
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
