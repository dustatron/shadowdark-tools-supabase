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
    equipment: AdventureListItem[];
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
      equipment: items.equipment.map((item) => ({
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
    equipment: AdventureListItem[];
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

  // Add equipment
  items.equipment.forEach((item) => {
    const costStr =
      item.details && item.details.cost
        ? `${item.details.cost.amount} ${item.details.cost.currency}`
        : "";
    const details = item.details
      ? [item.details.item_type, costStr].filter(Boolean).join(", ")
      : "";
    rows.push([
      "Equipment",
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

/**
 * Exports an adventure list as a Markdown file
 * @param list The adventure list to export
 * @param items The items in the adventure list
 */
export function exportAdventureListAsMarkdown(
  list: AdventureList,
  items: {
    monsters: AdventureListItem[];
    spells: AdventureListItem[];
    magic_items: AdventureListItem[];
    equipment: AdventureListItem[];
  },
) {
  const lines: string[] = [];

  // Title and metadata
  lines.push(`# ${list.title}`);
  lines.push("");

  if (list.description) {
    lines.push(list.description);
    lines.push("");
  }

  if (list.notes) {
    lines.push("## Notes");
    lines.push("");
    lines.push(list.notes);
    lines.push("");
  }

  // Summary
  const totalItems =
    items.monsters.length +
    items.spells.length +
    items.magic_items.length +
    items.equipment.length;

  lines.push("## Summary");
  lines.push("");
  lines.push(`- **Total Items**: ${totalItems}`);
  lines.push(`- **Monsters**: ${items.monsters.length}`);
  lines.push(`- **Spells**: ${items.spells.length}`);
  lines.push(`- **Magic Items**: ${items.magic_items.length}`);
  lines.push(`- **Equipment**: ${items.equipment.length}`);
  lines.push("");

  // Monsters section
  if (items.monsters.length > 0) {
    lines.push("## Monsters");
    lines.push("");
    lines.push("| Name | Quantity | CL | HP | AC | Notes |");
    lines.push("|------|----------|----|----|-------|-------|");

    items.monsters.forEach((item) => {
      const cl = item.details?.challenge_level || "-";
      const hp = item.details?.hit_points || "-";
      const ac = item.details?.armor_class || "-";
      const notes = item.notes || "";
      lines.push(
        `| ${item.name} | ${item.quantity} | ${cl} | ${hp} | ${ac} | ${notes} |`,
      );
    });
    lines.push("");
  }

  // Spells section
  if (items.spells.length > 0) {
    lines.push("## Spells");
    lines.push("");
    lines.push("| Name | Quantity | Tier | Range | Duration | Notes |");
    lines.push("|------|----------|------|-------|----------|-------|");

    items.spells.forEach((item) => {
      const tier = item.details?.tier || "-";
      const range = item.details?.range || "-";
      const duration = item.details?.duration || "-";
      const notes = item.notes || "";
      lines.push(
        `| ${item.name} | ${item.quantity} | ${tier} | ${range} | ${duration} | ${notes} |`,
      );
    });
    lines.push("");
  }

  // Magic Items section
  if (items.magic_items.length > 0) {
    lines.push("## Magic Items");
    lines.push("");
    lines.push("| Name | Quantity | Traits | Notes |");
    lines.push("|------|----------|--------|-------|");

    items.magic_items.forEach((item) => {
      const traits =
        item.details && item.details.traits
          ? item.details.traits.join(", ")
          : "-";
      const notes = item.notes || "";
      lines.push(`| ${item.name} | ${item.quantity} | ${traits} | ${notes} |`);
    });
    lines.push("");
  }

  // Equipment section
  if (items.equipment.length > 0) {
    lines.push("## Equipment");
    lines.push("");
    lines.push("| Name | Quantity | Type | Cost | Notes |");
    lines.push("|------|----------|------|------|-------|");

    items.equipment.forEach((item) => {
      const itemType = item.details?.item_type || "-";
      const cost =
        item.details && item.details.cost
          ? `${item.details.cost.amount} ${item.details.cost.currency}`
          : "-";
      const notes = item.notes || "";
      lines.push(
        `| ${item.name} | ${item.quantity} | ${itemType} | ${cost} | ${notes} |`,
      );
    });
    lines.push("");
  }

  // Add footer
  lines.push("---");
  lines.push("");
  lines.push(
    `*Generated from Dungeon Exchange on ${new Date().toLocaleDateString()}*`,
  );

  const markdown = lines.join("\n");
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${list.title.replace(/\s+/g, "_")}_adventure_list.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
