# Research: Magic Item Image Support

## Technical Context Resolution

### Image Hosting: Cloudinary

**Decision**: Use existing Cloudinary integration
**Rationale**: Already integrated for avatar uploads in `components/settings/AvatarUpload.tsx`. Same upload pattern can be reused. Unsigned upload preset already configured.
**Alternatives considered**: Supabase Storage (would require new setup), Uploadthing (new dependency)

### Image Size Limits

**Decision**: 15MB max file size
**Rationale**: User requirement. Larger than avatar limit (5MB) to accommodate higher resolution item artwork.
**Implementation**: Client-side validation before upload

### Image Transforms (Multiple Sizes)

**Decision**: Cloudinary URL-based transforms at runtime
**Rationale**: No storage duplication. Single upload generates all sizes on-demand via URL parameters.
**Transform presets**:

- `thumb`: 80x80, c_fill, q_auto, f_auto (list views)
- `card`: 200x200, c_fill, q_auto, f_auto (card views)
- `detail`: 400x400, q_auto, f_auto (detail pages)
- `pdf`: 600w, q_90 (PDF export)

### Default Icons Source

**Decision**: game-icons.net (CC BY 3.0)
**Rationale**: 3000+ icons, consistent style, good fantasy RPG coverage. User confirmed preference.
**Attribution requirement**: Add "Icons by game-icons.net" to footer/about page
**Initial set**: 15 icons covering common magic item categories

### Default Icons Storage

**Decision**: Hardcoded config file
**Rationale**: Simple for 15-20 icons, no DB query needed, type-safe
**Location**: `lib/config/default-magic-item-images.ts`

### Database Field

**Decision**: Add `image_url TEXT NULL` to `user_magic_items` only
**Rationale**: User requirement to scope to user items first. Official items can be added later.
**Storage**: Full Cloudinary URL (for user uploads) or public_id reference (for defaults)

### Image Moderation

**Decision**: Skip for MVP
**Rationale**: User confirmed. Trust users initially, add moderation later if needed.

## Existing Patterns Discovered

### Cloudinary Upload Pattern (AvatarUpload.tsx)

```typescript
const formData = new FormData();
formData.append("file", file);
formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET!);
formData.append("folder", `shadowdark/avatars/${userId}`);

const response = await fetch(
  `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
  { method: "POST", body: formData },
);
const data = await response.json(); // Contains secure_url
```

### Form Pattern (MagicItemForm.tsx)

- Uses react-hook-form with zodResolver
- Card-based sections for organization
- useFieldArray for dynamic traits
- Client-side form with API submission

### Schema Pattern (magic-items.ts)

- Zod schemas for validation
- TypeScript types inferred from schemas
- Separate create/update schemas

### Database Pattern

- `user_magic_items` table with RLS policies
- `all_magic_items` view combining official + public user items
- Triggers for updated_at

## Environment Variables Required

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<cloud_name>
NEXT_PUBLIC_CLOUDINARY_PRESET=<upload_preset>
```

Both already exist for avatar functionality.

## Dependencies

- No new npm dependencies required
- Reuse existing Cloudinary setup
- Extend existing shadcn/ui components (Tabs, Grid patterns)

## Risks & Mitigations

| Risk                               | Mitigation                        |
| ---------------------------------- | --------------------------------- |
| Large image uploads slow           | Show progress indicator           |
| Cloudinary quota exceeded          | Monitor usage, upgrade if needed  |
| Default icons licensing            | Include attribution per CC BY 3.0 |
| Image URL persistence on item edit | Only update on explicit change    |
