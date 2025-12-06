import { AdventureList, AdventureListItem } from "@/lib/types/adventure-lists";

/**
 * Exports an adventure list as a JSON file
 * @param list The adventure list to export
 * @param items The items in the adventure list
 */
export function exportAdventureListAsJson(
  list: AdventureList,
  items: {
    monsters: AdventureListItem[];
    spells: AdventureListItem[];
    magic_items: AdventureListItem[];
  },
) {
  const exportData = {
    list: {
      id: list.id,
      title: list.title,
      description: list.description,
      notes: list.notes,
      image_url: list.image_url,
      is_public: list.is_public,
      created_at: list.created_at,
      updated_at: list.updated_at,
    },
    items: {
      monsters: items.monsters.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        notes: item.notes,
        details: item.details,
      })),
      spells: items.spells.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        notes: item.notes,
        details: item.details,
      })),
      magic_items: items.magic_items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        notes: item.notes,
        details: item.details,
      })),
    },
  };

  // Pretty-print the JSON with 2-space indentation
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${list.title.replace(/\s+/g, "_")}_adventure_list.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports an adventure list as a CSV file
 * @param list The adventure list to export
 * @param items The items in the adventure list
 */
export function exportAdventureListAsCsv(
  list: AdventureList,
  items: {
    monsters: AdventureListItem[];
    spells: AdventureListItem[];
    magic_items: AdventureListItem[];
  },
) {
  // Create CSV header
  const headers = ["Type", "Name", "Quantity", "Notes", "Details"];

  // Create rows for each item
  const rows: string[][] = [];

  // Add monsters
  items.monsters.forEach((item) => {
    const details = item.details
      ? `CL ${item.details.challenge_level}, HP ${item.details.hit_points}, AC ${item.details.armor_class}`
      : "";
    rows.push([
      "Monster",
      item.name,
      item.quantity.toString(),
      item.notes || "",
      details,
    ]);
  });

  // Add spells
  items.spells.forEach((item) => {
    const details = item.details
      ? `Tier ${item.details.tier}, Range ${item.details.range}, Duration ${item.details.duration}`
      : "";
    rows.push([
      "Spell",
      item.name,
      item.quantity.toString(),
      item.notes || "",
      details,
    ]);
  });

  // Add magic items
  items.magic_items.forEach((item) => {
    const details =
      item.details && item.details.traits ? item.details.traits.join(", ") : "";
    rows.push([
      "Magic Item",
      item.name,
      item.quantity.toString(),
      item.notes || "",
      details,
    ]);
  });

  // Convert to CSV string, ensuring quotes are properly escaped
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","),
    ),
  ].join("\n");

  // Create and download the file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${list.title.replace(/\s+/g, "_")}_adventure_list.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
