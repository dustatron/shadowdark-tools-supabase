import fs from "fs";
import path from "path";

interface Trait {
  name: string;
  description: string;
}

interface MagicItem {
  name: string;
  slug: string;
  description: string;
  traits: Trait[];
}

const items: MagicItem[] = JSON.parse(
  fs.readFileSync("starter-data/magic-items.json", "utf-8"),
);

// CSV header
let csv = "name,slug,description,traits\n";

// Escape CSV fields
const escapeCsv = (str: string) => {
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
};

// Convert each item to CSV row
items.forEach((item) => {
  const traitsJson = JSON.stringify(item.traits);
  const row = [
    escapeCsv(item.name),
    escapeCsv(item.slug),
    escapeCsv(item.description),
    escapeCsv(traitsJson),
  ].join(",");
  csv += row + "\n";
});

// Write to file
const outputPath = "starter-data/magic-items.csv";
fs.writeFileSync(outputPath, csv);

console.log(`✅ Generated ${outputPath} with ${items.length} items`);
