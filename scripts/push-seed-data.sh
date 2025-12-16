#!/bin/bash

# Push seed data to remote Supabase database
# This script deletes and re-inserts all official monsters with alignment data

set -e

echo "🔄 Pushing seed data to remote Supabase..."

# Get the seed SQL file
SEED_FILE="supabase/migrations/20250921000014_seed_official_monsters.sql"

if [ ! -f "$SEED_FILE" ]; then
    echo "❌ Error: Seed file not found at $SEED_FILE"
    exit 1
fi

echo "📦 Seed file: $SEED_FILE"
echo "📊 Contains $(grep -c "INSERT INTO" $SEED_FILE) monster records"

# Create a temporary SQL file for execution
TEMP_SQL=$(mktemp)
cat "$SEED_FILE" > "$TEMP_SQL"

echo ""
echo "Attempting to execute SQL..."

# Try method 1: Use supabase CLI with project link
if supabase link --help > /dev/null 2>&1; then
    echo "Using Supabase CLI with linked project..."

    # Execute the SQL by creating a temporary migration
    TIMESTAMP=$(date +%Y%m%d%H%M%S)
    TEMP_MIGRATION="supabase/migrations/${TIMESTAMP}_temp_reseed.sql"

    cp "$SEED_FILE" "$TEMP_MIGRATION"

    echo "Created temporary migration: $TEMP_MIGRATION"
    echo "Pushing to remote database..."

    if supabase db push --include-all; then
        echo "✅ Seed data pushed successfully!"
        rm "$TEMP_MIGRATION"
        rm "$TEMP_SQL"
        exit 0
    else
        echo "⚠️  Migration push failed, cleaning up..."
        rm "$TEMP_MIGRATION"
    fi
fi

# Clean up
rm "$TEMP_SQL"

# Manual instructions
PROJECT_REF="anradzoxmwjpzlldneac"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Manual Steps Required:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Open Supabase SQL Editor:"
echo "   https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
echo ""
echo "2. Copy the seed file contents:"
echo "   cat $SEED_FILE | pbcopy"
echo ""
echo "3. Paste into SQL Editor and click 'Run'"
echo ""
echo "This will:"
echo "  • Delete all existing official monsters"
echo "  • Insert 243 monsters with alignment data"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
