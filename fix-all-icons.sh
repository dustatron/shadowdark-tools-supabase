#!/bin/bash

# Fix ALL remaining Icon* prefixes in component files

cd src/components

# Find all tsx files and fix Icon* names
find . -name "*.tsx" -type f | while read file; do
  sed -i '' 's/IconDots/MoreVertical/g' "$file"
  sed -i '' 's/IconEdit/Pencil/g' "$file"
  sed -i '' 's/IconEye/Eye/g' "$file"
  sed -i '' 's/IconTrash/Trash2/g' "$file"
  sed -i '' 's/HeartFilled/Heart/g' "$file"  # Lucide doesn't have HeartFilled
done

echo "All Icon* references fixed"
