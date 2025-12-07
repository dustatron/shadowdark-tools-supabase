import fs from "fs";
import path from "path";

interface EquipmentItem {
  name: string;
  cost: {
    amount: number;
    currency: string;
  };
  attackType?: string;
  range?: string;
  damage?: string;
  properties: string[];
  slot: number;
  itemType: string;
  uuid: string;
  armor?: string;
  quanity?: string; // Corrected typo from original JSON
}

const items: EquipmentItem[] = JSON.parse(
  fs.readFileSync("starter-data/equipment.json", "utf-8"),
);

const escapeSql = (str: string | undefined) =>
  str ? `'${str.replace(/'/g, "''")}'` : "NULL";

const sqlContent = `-- Generated from starter-data/equipment.json
-- Total items: ${items.length}

INSERT INTO equipment (name, item_type, cost, attack_type, range, damage, armor, properties, slot, quantity, uuid) VALUES
${items
  .map((item) => {
    const costJson = JSON.stringify(item.cost).replace(/'/g, "''");
    const propertiesArray =
      item.properties && item.properties.length > 0
        ? `ARRAY[${item.properties
            .map((prop) => `'${prop.replace(/'/g, "''")}'`)
            .join(", ")}]::TEXT[]`
        : "NULL";

    return `  (
    ${escapeSql(item.name)},
    ${escapeSql(item.itemType)},
    '${costJson}'::jsonb,
    ${escapeSql(item.attackType)},
    ${escapeSql(item.range)},
    ${escapeSql(item.damage)},
    ${escapeSql(item.armor)},
    ${propertiesArray},
    ${item.slot},
    ${escapeSql(item.quanity)},
    ${escapeSql(item.uuid)}
  )`;
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
  `supabase/migrations/${timestamp}_seed_equipment_table.sql`,
);

fs.writeFileSync(filename, sqlContent);
console.log(`✅ Generated ${filename} with ${items.length} items`);
