# Research: Spell Card Deck Builder

**Date**: 2025-11-04
**Feature**: 008-deck-building-for

## Research Questions

### 1. PDF Generation Library Selection

**Decision**: @react-pdf/renderer

**Rationale**:

- Supports precise dimensions in inches: `<Page size={{ width: "2.5in", height: "3.5in" }} />`
- React JSX components for card layouts (maintainable, testable)
- Built-in text wrapping with `<Text>` component
- Flexbox layout for 3x3 grids on letter-sized pages
- Industry standard (2.6M weekly downloads)
- Dynamic imports prevent SSR issues and reduce bundle size

**Alternatives Considered**:

- **jsPDF**: More programmatic API, harder to create precise grids, better for simple documents
- **Puppeteer**: Most accurate HTML→PDF but overkill (~300MB Chrome dependency), slow
- **PDFKit**: Node-only, doesn't work client-side in browser
- **react-to-pdf**: Wrapper around html2canvas + jsPDF, less control over exact dimensions

**Best Practices**:

```tsx
// Dynamic import to avoid SSR
const PDFViewer = dynamic(() =>
  import('@react-pdf/renderer').then(mod => mod.PDFViewer),
  { ssr: false }
);

// Precise dimensions
<Page size={{ width: "2.5in", height: "3.5in" }}>
  <View style={styles.card}>
    <Text style={styles.title}>{spell.name}</Text>
    <Text style={styles.description}>{spell.description}</Text>
  </View>
</Page>

// 9-card grid layout
<Page size="LETTER"> {/* 8.5x11 */}
  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
    {spells.slice(0, 9).map(spell => (
      <View style={{ width: '33.33%', height: '33.33%' }}>
        <SpellCard spell={spell} />
      </View>
    ))}
  </View>
</Page>
```

### 2. Auto-Save Strategy

**Decision**: Debounced auto-save with optimistic UI updates

**Rationale**:

- User expectation: modern apps don't lose work
- Draft decks persist immediately on name entry
- Spell additions/removals debounced (500ms) to reduce DB writes
- Optimistic UI shows changes instantly, syncs in background
- Recovery from navigation/refresh

**Best Practices**:

```tsx
const { mutate: updateDeck } = useMutation({
  mutationFn: (deck: DeckUpdate) =>
    fetch(`/api/decks/${deck.id}`, {
      method: "PUT",
      body: JSON.stringify(deck),
    }),
  onMutate: async (newDeck) => {
    // Optimistic update
    await queryClient.cancelQueries(["deck", newDeck.id]);
    const previous = queryClient.getQueryData(["deck", newDeck.id]);
    queryClient.setQueryData(["deck", newDeck.id], newDeck);
    return { previous };
  },
  onError: (err, newDeck, context) => {
    // Rollback on error
    queryClient.setQueryData(["deck", newDeck.id], context.previous);
  },
});

// Debounce spell additions
const debouncedSave = useDebouncedCallback(
  (spellIds: string[]) => updateDeck({ spellIds }),
  500,
);
```

### 3. Unique Spell Constraint Enforcement

**Decision**: Multi-level enforcement (UI + API + DB)

**Rationale**:

- UI: Disable already-selected spells in selector (best UX)
- API: Zod validation rejects duplicates
- DB: Unique constraint on (deck_id, spell_id) prevents race conditions

**Implementation**:

```tsx
// UI level
const availableSpells = allSpells.filter(
  spell => !currentDeck.spellIds.includes(spell.id)
);

// API level (Zod schema)
const DeckSchema = z.object({
  name: z.string().min(1),
  spellIds: z.array(z.string().uuid())
    .max(52)
    .refine(
      (ids) => new Set(ids).size === ids.length,
      'Duplicate spells not allowed'
    )
});

// DB level (migration)
CREATE UNIQUE INDEX deck_spells_unique
ON deck_items(deck_id, spell_id);
```

### 4. Text Wrapping for Long Descriptions

**Decision**: @react-pdf/renderer automatic text wrapping

**Rationale**:

- `<Text>` component wraps automatically within container bounds
- No manual truncation or ellipsis needed
- Maintains readability across all spell lengths
- Consistent with card dimensions

**Best Practices**:

```tsx
<View style={styles.descriptionContainer}>
  <Text style={styles.description}>
    {spell.description} {/* Wraps automatically */}
  </Text>
</View>;

const styles = StyleSheet.create({
  descriptionContainer: {
    width: "100%",
    height: "60%", // Allocate space
    padding: 8,
  },
  description: {
    fontSize: 10,
    lineHeight: 1.3,
    // Text wraps to fit container
  },
});
```

### 5. Spell Deletion Cascade Behavior

**Decision**: ON DELETE CASCADE at DB level + optimistic UI removal

**Rationale**:

- DB cascade removes orphaned deck_items automatically
- Prevents broken references
- UI refetches deck after spell deletion detected
- No manual cleanup required

**Implementation**:

```sql
-- Migration
ALTER TABLE deck_items
ADD CONSTRAINT fk_spell
FOREIGN KEY (spell_id)
REFERENCES official_spells(id)
ON DELETE CASCADE;

ALTER TABLE deck_items
ADD CONSTRAINT fk_user_spell
FOREIGN KEY (spell_id)
REFERENCES user_spells(id)
ON DELETE CASCADE;
```

```tsx
// Client-side detection
const { data: deck } = useQuery(["deck", deckId], fetchDeck, {
  // Refetch on window focus to detect external changes
  refetchOnWindowFocus: true,
  // Show stale data while revalidating
  staleTime: 30000,
});
```

### 6. Database Schema Design

**Decision**: Separate tables for decks and deck_items (junction table)

**Rationale**:

- Normalized design prevents data duplication
- Easy to query deck contents
- Supports future features (reordering via position column)
- Efficient for spell uniqueness checks

**Schema**:

```sql
CREATE TABLE decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE deck_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  spell_id UUID NOT NULL, -- References official_spells OR user_spells
  position INT, -- For future reordering feature
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (deck_id, spell_id)
);

-- RLS Policies
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own decks"
ON decks FOR ALL
USING (auth.uid() = user_id);

ALTER TABLE deck_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own deck items"
ON deck_items FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM decks
    WHERE decks.id = deck_items.deck_id
    AND decks.user_id = auth.uid()
  )
);
```

### 7. Performance Optimization

**Decision**: Lazy-load PDF renderer, paginate spell selector, cache deck queries

**Rationale**:

- PDF lib heavy (~500KB), only load when exporting
- Spell list can be large (100+ spells), use virtual scrolling
- React Query caching reduces redundant fetches

**Implementation**:

```tsx
// Lazy load PDF
const exportPDF = async () => {
  const { PDFDownloadLink } = await import("@react-pdf/renderer");
  // Generate and download
};

// Virtual scrolling for spell selector
import { useVirtualizer } from "@tanstack/react-virtual";

const rowVirtualizer = useVirtualizer({
  count: availableSpells.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 50,
});

// React Query caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});
```

## Technology Stack Confirmation

✅ All technologies in Technical Context are well-established and documented:

- **@react-pdf/renderer**: Official docs at react-pdf.org, active maintenance
- **React Hook Form**: v7.63 stable, zod resolver integration
- **Zod**: v4.1 type-safe validation
- **shadcn/ui**: Radix UI primitives with Tailwind
- **Supabase**: Postgres with RLS, Next.js SSR integration

## Dependencies to Add

```json
{
  "dependencies": {
    "@react-pdf/renderer": "^3.1.0",
    "@tanstack/react-query": "^5.89.0",
    "@tanstack/react-virtual": "^3.0.0"
  },
  "devDependencies": {}
}
```

## Open Questions (All Resolved)

None remaining - all NEEDS CLARIFICATION items addressed in spec.md.

## Next Steps

Proceed to Phase 1: Design data model, API contracts, and quickstart scenarios.
