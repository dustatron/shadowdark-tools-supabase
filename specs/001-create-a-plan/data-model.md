# Data Model: Dungeon Exchange

## Core Entities

### Monster

**Purpose**: Individual creature with complete Shadowdark statistics
**Primary Key**: id (UUID)

**Fields**:

- id: UUID (primary key)
- name: string (required, indexed)
- challenge_level: integer (1-20, required)
- hit_points: integer (1+, required)
- armor_class: integer (1-21, required)
- speed: string (e.g., "30 ft", required)
- attacks: JSONB (array of attack objects)
- abilities: JSONB (array of ability objects)
- treasure: JSONB (treasure object, optional)
- tags: JSONB (type and location arrays)
- source: string (required, e.g., "Shadowdark Core")
- author_notes: text (markdown, optional)
- icon_url: string (optional)
- art_url: string (optional)
- is_official: boolean (default false)
- created_at: timestamp
- updated_at: timestamp

**Validation Rules**:

- XP calculation: XP = challenge_level × 25
- Challenge level range: 1-20
- Armor class range: 1-21
- Hit points minimum: 1

**Relationships**:

- Belongs to User (if custom)
- Used in Groups (many-to-many)
- Used in Lists (many-to-many)

### User

**Purpose**: Account information and preferences
**Primary Key**: id (UUID, from Supabase Auth)

**Fields**:

- id: UUID (from auth.users)
- display_name: string (optional)
- bio: text (optional)
- avatar_url: string (optional)
- is_admin: boolean (default false)
- created_at: timestamp
- updated_at: timestamp

**Relationships**:

- Has many Monsters (custom)
- Has many Groups
- Has many Lists
- Has many Encounter Tables
- Has many Flags (as reporter)
- Has many Favorites

### Group

**Purpose**: Collection of monsters with quantities and aggregated stats
**Primary Key**: id (UUID)

**Fields**:

- id: UUID (primary key)
- user_id: UUID (foreign key to users)
- name: string (required)
- description: text (optional)
- monsters: JSONB (array of {monster_id, quantity})
- combined_stats: JSONB (calculated totals)
- tags: JSONB (inherited/override tags)
- is_public: boolean (default false)
- created_at: timestamp
- updated_at: timestamp

**Validation Rules**:

- At least one monster required
- Quantities must be positive integers
- Combined stats auto-calculated

**Relationships**:

- Belongs to User
- Contains many Monsters (via JSONB)
- Used in Lists (many-to-many)

### List

**Purpose**: User-organized collection of monsters and groups
**Primary Key**: id (UUID)

**Fields**:

- id: UUID (primary key)
- user_id: UUID (foreign key to users)
- name: string (required)
- description: text (optional)
- party_level: integer (optional)
- challenge_level_min: integer (optional)
- challenge_level_max: integer (optional)
- xp_budget: integer (optional)
- created_at: timestamp
- updated_at: timestamp

**Relationships**:

- Belongs to User
- Has many List Items

### List Item

**Purpose**: Junction table for lists containing monsters/groups
**Primary Key**: id (UUID)

**Fields**:

- id: UUID (primary key)
- list_id: UUID (foreign key to lists)
- item_type: enum ('monster', 'group')
- item_id: UUID (foreign key to monsters or groups)
- quantity: integer (default 1)
- created_at: timestamp

**Relationships**:

- Belongs to List
- References Monster or Group

### Encounter Table

**Purpose**: Saved random generation template
**Primary Key**: id (UUID)

**Fields**:

- id: UUID (primary key)
- user_id: UUID (foreign key to users)
- name: string (required)
- die_size: integer (2-100, required)
- tags: JSONB (optional filter tags)
- created_at: timestamp
- updated_at: timestamp

**Relationships**:

- Belongs to User
- Has many Encounter Slots

### Encounter Slot

**Purpose**: Individual slot in encounter table
**Primary Key**: id (UUID)

**Fields**:

- id: UUID (primary key)
- table_id: UUID (foreign key to encounter_tables)
- slot_number: integer (1 to die_size)
- item_type: enum ('monster', 'group')
- item_id: UUID (foreign key to monsters or groups)
- created_at: timestamp

**Relationships**:

- Belongs to Encounter Table
- References Monster or Group

### Tag Type

**Purpose**: Admin-managed monster type categories
**Primary Key**: id (UUID)

**Fields**:

- id: UUID (primary key)
- name: string (unique, required)
- created_at: timestamp

### Tag Location

**Purpose**: Admin-managed location categories
**Primary Key**: id (UUID)

**Fields**:

- id: UUID (primary key)
- name: string (unique, required)
- created_at: timestamp

### Favorite

**Purpose**: User's favorited content
**Primary Key**: Composite (user_id, item_type, item_id)

**Fields**:

- user_id: UUID (foreign key to users)
- item_type: enum ('monster', 'group')
- item_id: UUID (foreign key to monsters or groups)
- created_at: timestamp

### Flag

**Purpose**: Community content moderation
**Primary Key**: id (UUID)

**Fields**:

- id: UUID (primary key)
- flagged_item_type: enum ('monster', 'group')
- flagged_item_id: UUID
- reporter_user_id: UUID (foreign key to users)
- reason: enum ('inappropriate', 'copyright', 'spam', 'inaccurate', 'other')
- comment: text (required)
- status: enum ('pending', 'resolved', 'dismissed')
- resolved_at: timestamp (optional)
- resolved_by: UUID (foreign key to users, optional)
- created_at: timestamp

### Audit Log

**Purpose**: Admin action tracking
**Primary Key**: id (UUID)

**Fields**:

- id: UUID (primary key)
- admin_user_id: UUID (foreign key to users)
- action_type: string (required)
- target_id: UUID (optional)
- notes: text (optional)
- timestamp: timestamp

## Database Views

### All Monsters

**Purpose**: Combined view of official and public custom monsters

```sql
SELECT
  id, name, challenge_level, hit_points, armor_class,
  attacks, abilities, treasure, tags, source,
  'official' as type, null as user_id
FROM official_monsters
UNION ALL
SELECT
  id, name, challenge_level, hit_points, armor_class,
  attacks, abilities, treasure, tags, source,
  'custom' as type, user_id
FROM user_monsters
WHERE is_public = true
```

## JSONB Structures

### Monster Attacks

```json
[
  {
    "name": "Sword",
    "type": "melee",
    "damage": "1d8+2",
    "range": "5 ft",
    "description": "Slashing damage"
  }
]
```

### Monster Abilities

```json
[
  {
    "name": "Keen Senses",
    "description": "Advantage on Perception checks"
  }
]
```

### Monster Treasure

```json
{
  "type": "coins",
  "amount": "2d6 gold pieces",
  "items": ["leather armor", "shortsword"]
}
```

### Monster Tags

```json
{
  "type": ["humanoid", "warrior"],
  "location": ["forest", "road"]
}
```

### Group Combined Stats

```json
{
  "total_xp": 125,
  "total_hp": 42,
  "effective_cl": 3,
  "monster_count": 3,
  "average_ac": 14
}
```

## Indexes

### Performance Indexes

- monsters: GIN index on tags JSONB
- monsters: GIN index on name using pg_trgm
- monsters: Composite index on (challenge_level, is_public)
- list_items: Composite index on (list_id, item_type, item_id)
- encounter_slots: Composite index on (table_id, slot_number)

### Search Indexes

- monsters: Full-text search index on searchable fields
- groups: GIN index on name using pg_trgm
- users: Index on display_name for author searches

## Row Level Security Policies

### User Monsters

- Users can CRUD their own monsters
- Everyone can read public monsters
- Admins have full access

### Groups, Lists, Encounter Tables

- Users can CRUD their own content
- Everyone can read public groups
- Private content only accessible to owner

### Flags

- Users can insert flags
- Only admins can update/delete flags
- Reporters can view their own flags

### Admin Tables

- Only admins can access audit logs
- Only admins can manage tag types/locations
