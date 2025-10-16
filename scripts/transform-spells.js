const fs = require("fs");
const path = require("path");

// Function to transform the spell data to our schema
function transformSpell(spell) {
  return {
    name: spell.name,
    slug: spell.slug,
    description: spell.description,
    classes: JSON.stringify(spell.classes),
    duration: spell.duration,
    range: spell.range,
    tier: parseInt(spell.tier, 10),
    source: "Shadowdark Core",
    author_notes: null,
    icon_url: null,
    art_url: null,
  };
}

// Read and transform the spells
const spellsPath = path.join(__dirname, "..", "starter-data", "spells.json");
const spells = JSON.parse(fs.readFileSync(spellsPath, "utf8"));

const transformedSpells = spells.map(transformSpell);

// Generate SQL statements
const sqlStatements = transformedSpells.map((spell) => {
  const values = [
    `'${spell.name.replace(/'/g, "''")}'`,
    `'${spell.slug.replace(/'/g, "''")}'`,
    `'${spell.description.replace(/'/g, "''")}'`,
    `'${spell.classes}'::jsonb`,
    `'${spell.duration.replace(/'/g, "''")}'`,
    `'${spell.range.replace(/'/g, "''")}'`,
    spell.tier,
    `'${spell.source.replace(/'/g, "''")}'`,
    spell.author_notes ? `'${spell.author_notes.replace(/'/g, "''")}'` : "NULL",
    spell.icon_url ? `'${spell.icon_url}'` : "NULL",
    spell.art_url ? `'${spell.art_url}'` : "NULL",
  ];

  return `INSERT INTO public.official_spells (name, slug, description, classes, duration, range, tier, source, author_notes, icon_url, art_url) VALUES (${values.join(", ")});`;
});

// Write to migration file
const migrationContent = `-- Seed official spells from Shadowdark starter data
-- Generated from starter-data/spells.json

${sqlStatements.join("\n")}
`;

const migrationPath = path.join(
  __dirname,
  "..",
  "supabase",
  "migrations",
  "20250921000019_seed_official_spells.sql",
);
fs.writeFileSync(migrationPath, migrationContent);

console.log(`Generated migration with ${transformedSpells.length} spells`);
console.log(`Migration saved to: ${migrationPath}`);
