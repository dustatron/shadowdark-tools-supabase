#!/bin/bash

# Migration script to move /src/components/ to /components/

set -e

PROJECT_ROOT="/Users/dmccord/Projects/vibeCode/shadowdark-tools-supabase"
cd "$PROJECT_ROOT"

echo "=== Component Migration Script ==="
echo ""

# Create directory structure
echo "Creating directory structure..."
mkdir -p components/monsters/create-edit
mkdir -p components/spells
mkdir -p components/encounter-tables
mkdir -p components/favorites
mkdir -p components/navigation
mkdir -p components/providers
mkdir -p components/shared

# Move monsters components
echo "Moving monsters components..."
cp src/components/monsters/*.tsx components/monsters/ 2>/dev/null || true
cp src/components/monsters/create-edit/*.tsx components/monsters/create-edit/ 2>/dev/null || true
cp src/components/monsters/create-edit/*.ts components/monsters/create-edit/ 2>/dev/null || true

# Move spells components
echo "Moving spells components..."
cp src/components/spells/*.tsx components/spells/ 2>/dev/null || true

# Move encounter-tables components
echo "Moving encounter-tables components..."
cp src/components/encounter-tables/*.tsx components/encounter-tables/ 2>/dev/null || true
cp src/components/encounter-tables/*.ts components/encounter-tables/ 2>/dev/null || true

# Move favorites components
echo "Moving favorites components..."
cp src/components/favorites/*.tsx components/favorites/ 2>/dev/null || true

# Move navigation components
echo "Moving navigation components..."
cp src/components/navigation/*.tsx components/navigation/ 2>/dev/null || true

# Move providers components
echo "Moving providers components..."
cp src/components/providers/*.tsx components/providers/ 2>/dev/null || true

# Move shared/ui components (non-primitives)
echo "Moving shared UI components..."
cp src/components/ui/ViewModeToggle.tsx components/shared/ 2>/dev/null || true
cp src/components/ui/SourceToggle.tsx components/shared/ 2>/dev/null || true
cp src/components/ui/SearchInput.tsx components/shared/ 2>/dev/null || true
cp src/components/ui/EmptyState.tsx components/shared/ 2>/dev/null || true
cp src/components/ui/IconSelector.tsx components/shared/ 2>/dev/null || true
cp src/components/ui/LoadingSpinner.tsx components/shared/ 2>/dev/null || true
cp src/components/ui/Pagination.tsx components/shared/ 2>/dev/null || true
cp src/components/ui/ErrorAlert.tsx components/shared/ 2>/dev/null || true

echo ""
echo "=== Files copied successfully ==="
echo ""
echo "Next steps:"
echo "1. Run: find . -type f \( -name '*.tsx' -o -name '*.ts' \) -not -path './node_modules/*' -not -path './.next/*' -exec sed -i '' 's|@/src/components/|@/components/|g' {} +"
echo "2. Verify build: npm run build"
echo "3. Delete old directory: rm -rf src/components"
