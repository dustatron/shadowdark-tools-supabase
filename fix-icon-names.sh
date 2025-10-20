#!/bin/bash

# Fix remaining Icon* prefixes in lucide-react imports

cd src/components

# MobileNav icons
sed -i '' 's/IconWand/Wand/g' layout/MobileNav.tsx
sed -i '' 's/IconUser/User/g' layout/MobileNav.tsx
sed -i '' 's/IconSettings/Settings/g' layout/MobileNav.tsx
sed -i '' 's/IconDashboard/LayoutDashboard/g' layout/MobileNav.tsx
sed -i '' 's/IconLogout/LogOut/g' layout/MobileNav.tsx

# Filter icons in both files
for file in spells/SpellFilters.tsx monsters/MonsterFilters.tsx; do
  sed -i '' 's/IconFilter\b/Filter/g' "$file"
  sed -i '' 's/IconFilterOff/FilterX/g' "$file"
  sed -i '' 's/IconChevronUp/ChevronUp/g' "$file"
  sed -i '' 's/IconChevronDown/ChevronDown/g' "$file"
done

echo "Icon names fixed"
