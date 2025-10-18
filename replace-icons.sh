#!/bin/bash

# Replace Tabler icons with Lucide icons in all component files except IconSelector

cd src/components

find . -name "*.tsx" -type f ! -name "IconSelector.tsx" | while read file; do
  sed -i '' 's/@tabler\/icons-react/lucide-react/g' "$file"
  sed -i '' 's/IconSearch/Search/g' "$file"
  sed -i '' 's/IconX\b/X/g' "$file"
  sed -i '' 's/IconHeart/Heart/g' "$file"
  sed -i '' 's/IconShield/Shield/g' "$file"
  sed -i '' 's/IconRun/Footprints/g' "$file"
  sed -i '' 's/IconSword/Sword/g' "$file"
  sed -i '' 's/IconUsers/Users/g' "$file"
  sed -i '' 's/IconClock/Clock/g' "$file"
  sed -i '' 's/IconRuler/Ruler/g' "$file"
  sed -i '' 's/IconStar/Star/g' "$file"
  sed -i '' 's/IconBook/Book/g' "$file"
done

echo "Icon replacements complete"
