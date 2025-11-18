import fs from "fs";
import path from "path";

interface MagicItem {
  name: string;
  slug: string;
  description: string;
  traits: { name: string; description: string }[];
}

const items: MagicItem[] = JSON.parse(
  fs.readFileSync("starter-data/magic-items.json", "utf-8"),
);

const escapeSql = (str: string) => str.replace(/'/g, "''");

const sql = `-- Generated from starter-data/magic-items.json
-- Total items: ${items.length}

INSERT INTO official_magic_items (name, slug, description, traits) VALUES
${items
  .map((item) => {
    const traitsJson = JSON.stringify(item.traits).replace(/'/g, "''");
    return `  ('${escapeSql(item.name)}', '${item.slug}', '${escapeSql(item.description)}', '${traitsJson}'::jsonb)`;
  })
  .join(",\n")}
;
`;

const timestamp = new Date()
  .toISOString()
  .replace(/[-:]/g, "")
  .replace(/\..+/, "")
  .replace("T", "");
const filename = path.join(
  process.cwd(),
  `supabase/migrations/${timestamp}_seed_official_magic_items.sql`,
);

fs.writeFileSync(filename, sql);
console.log(`✅ Generated ${filename} with ${items.length} items`);
