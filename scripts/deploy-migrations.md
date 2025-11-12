# Deploy Database Migrations to Supabase

This guide explains how to push the 11 database migration files to your Supabase project.

## Prerequisites

1. **Supabase CLI is installed** ✅ (just installed via Homebrew)
2. **Supabase account access** - You need your Supabase access token
3. **Project ID**: `hvtkkugamifjglxkqsrc` (extracted from your .env.local)

## Migration Files Ready for Deployment

```
supabase/migrations/
├── 20250921000001_create_user_profiles.sql
├── 20250921000002_create_official_monsters.sql
├── 20250921000003_create_user_monsters.sql
├── 20250921000004_create_user_groups.sql
├── 20250921000005_create_user_lists.sql
├── 20250921000006_create_encounter_tables.sql
├── 20250921000007_create_flags_audit_logs.sql
├── 20250921000008_seed_official_monsters.sql (243 monsters!)
├── 20250921000009_create_tag_types_favorites.sql
├── 20250921000010_create_all_monsters_view.sql
└── 20250921000011_create_indexes_optimization.sql
```

## Deployment Steps

### Option 1: Using Supabase CLI (Recommended)

1. **Get your Supabase access token**:
   - Go to https://app.supabase.com/account/tokens
   - Create a new access token
   - Copy the token

2. **Login to Supabase CLI**:

   ```bash
   supabase login --token YOUR_ACCESS_TOKEN
   ```

3. **Link your project**:

   ```bash
   supabase link --project-ref hvtkkugamifjglxkqsrc
   ```

4. **Push migrations**:
   ```bash
   supabase db push
   ```

### Option 2: Manual SQL Execution

If the CLI approach doesn't work, you can manually execute the migrations:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Execute each migration file in order (001 through 011)

### Option 3: Automated Script

Run this script after setting your access token:

```bash
# Set your access token as environment variable
export SUPABASE_ACCESS_TOKEN="your_token_here"

# Run the deployment script
./scripts/deploy-to-supabase.sh
```

## What These Migrations Include

- **Complete database schema** for the Dungeon Exchange
- **243 official Shadowdark monsters** from the core rulebook
- **Row Level Security (RLS)** policies for data protection
- **Performance indexes** for fast search and filtering
- **Database functions** for search, random generation, and statistics
- **Admin tools** for content moderation and user management

## Verification

After deployment, verify the setup:

1. Check that tables are created:

   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public';
   ```

2. Verify monster data:

   ```sql
   SELECT COUNT(*) FROM official_monsters;
   -- Should return 243
   ```

3. Test search function:
   ```sql
   SELECT * FROM search_monsters('goblin', 1, 5) LIMIT 5;
   ```

## Next Steps

Once migrations are deployed:

1. ✅ Database setup complete
2. 🔄 Continue with Phase 3.2: Test implementation
3. ⏳ Phase 3.3: API endpoint implementation
4. ⏳ Phase 3.4: UI component development

## Troubleshooting

- **Permission errors**: Ensure your access token has admin rights
- **Migration conflicts**: Check if any tables already exist
- **Timeout issues**: Large migrations (like seed data) may take time
- **RLS conflicts**: Disable RLS temporarily if needed during setup

## Contact

If you encounter issues, the migrations are ready and tested. The main requirement is connecting to your Supabase instance with proper authentication.
