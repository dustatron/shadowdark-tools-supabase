#!/bin/bash

# Deploy migrations to Supabase
# Usage: ./scripts/deploy-to-supabase.sh

set -e

PROJECT_REF="hvtkkugamifjglxkqsrc"
MIGRATIONS_DIR="supabase/migrations"

echo "🚀 Deploying Shadowdark Monster Manager migrations to Supabase..."

# Check if access token is set
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "❌ Error: SUPABASE_ACCESS_TOKEN environment variable is not set"
    echo "   Get your token from: https://app.supabase.com/account/tokens"
    echo "   Then run: export SUPABASE_ACCESS_TOKEN='your_token_here'"
    exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI is not installed"
    echo "   Install with: brew install supabase/tap/supabase"
    exit 1
fi

echo "🔐 Logging in to Supabase..."
supabase login --token "$SUPABASE_ACCESS_TOKEN"

echo "🔗 Linking project..."
supabase link --project-ref "$PROJECT_REF"

echo "📊 Checking migration status..."
supabase migration list

echo "🗃️ Pushing migrations..."
supabase db push

echo "✅ Migration deployment complete!"
echo ""
echo "📋 Summary of deployed migrations:"
ls -1 "$MIGRATIONS_DIR" | cat -n

echo ""
echo "🔍 Verification commands:"
echo "   supabase db diff --schema public"
echo "   supabase sql --file scripts/verify-deployment.sql"

echo ""
echo "🎯 Next steps:"
echo "   1. Run verification queries in Supabase dashboard"
echo "   2. Continue with Phase 3.2: Test implementation"
echo "   3. Begin API endpoint development"