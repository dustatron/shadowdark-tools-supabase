import {
  AdventureList,
  GroupedAdventureListItems,
} from "@/lib/types/adventure-lists";

/**
 * Exports an adventure list as a JSON file
 * @param list The adventure list to export
 * @param items The items in the adventure list
 */
export function exportAdventureListAsJson(
  list: AdventureList,
  items: GroupedAdventureListItems,
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
        challenge_level: item.details.challenge_level,
        hit_points: item.details.hit_points,
        armor_class: item.details.armor_class,
        speed: item.details.speed,
        source: item.details.source,
        tags: item.details.tags,
      })),
      spells: items.spells.map((item) => ({
        name: item.name,
        slug: item.slug,
        description: item.description,
        quantity: item.quantity,
        notes: item.notes,
        tier: item.details.tier,
        classes: item.details.classes,
        duration: item.details.duration,
        range: item.details.range,
        source: item.details.source,
      })),
      magic_items: items.magic_items.map((item) => ({
        name: item.name,
        slug: item.slug,
        description: item.description,
        quantity: item.quantity,
        notes: item.notes,
        traits: item.details.traits,
      })),
      equipment: items.equipment.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        notes: item.notes,
        item_type: item.details.item_type,
        cost: item.details.cost,
        attack_type: item.details.attack_type,
        range: item.details.range,
        damage: item.details.damage,
        armor: item.details.armor,
        properties: item.details.properties,
        slot: item.details.slot,
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
  items: GroupedAdventureListItems,
) {
  // Create CSV header with all possible columns
  const headers = [
    "Type",
    "Name",
    "Quantity",
    "Notes",
    "CL",
    "HP",
    "AC",
    "Speed",
    "Tier",
    "Classes",
    "Duration",
    "Range",
    "Traits",
    "Item Type",
    "Cost",
    "Damage",
    "Armor",
    "Properties",
    "Source",
  ];

  // Create rows for each item
  const rows: string[][] = [];

  // Add monsters
  items.monsters.forEach((item) => {
    const tags = item.details.tags
      ? [
          ...(item.details.tags.type || []),
          ...(item.details.tags.location || []),
        ].join("; ")
      : "";
    rows.push([
      "Monster",
      item.name,
      item.quantity.toString(),
      item.notes || "",
      item.details.challenge_level?.toString() || "",
      item.details.hit_points?.toString() || "",
      item.details.armor_class?.toString() || "",
      item.details.speed || "",
      "", // Tier
      "", // Classes
      "", // Duration
      "", // Range (spell)
      tags, // Using Traits column for tags
      "", // Item Type
      "", // Cost
      "", // Damage
      "", // Armor
      "", // Properties
      item.details.source || "",
    ]);
  });

  // Add spells
  items.spells.forEach((item) => {
    rows.push([
      "Spell",
      item.name,
      item.quantity.toString(),
      item.notes || "",
      "", // CL
      "", // HP
      "", // AC
      "", // Speed
      item.details.tier?.toString() || "",
      item.details.classes?.join(", ") || "",
      item.details.duration || "",
      item.details.range || "",
      "", // Traits
      "", // Item Type
      "", // Cost
      "", // Damage
      "", // Armor
      "", // Properties
      item.details.source || "",
    ]);
  });

  // Add magic items
  items.magic_items.forEach((item) => {
    rows.push([
      "Magic Item",
      item.name,
      item.quantity.toString(),
      item.notes || "",
      "", // CL
      "", // HP
      "", // AC
      "", // Speed
      "", // Tier
      "", // Classes
      "", // Duration
      "", // Range
      item.details.traits?.join(", ") || "",
      "", // Item Type
      "", // Cost
      "", // Damage
      "", // Armor
      "", // Properties
      "", // Source
    ]);
  });

  // Add equipment
  items.equipment.forEach((item) => {
    const costStr = item.details.cost
      ? `${item.details.cost.amount} ${item.details.cost.currency}`
      : "";
    rows.push([
      "Equipment",
      item.name,
      item.quantity.toString(),
      item.notes || "",
      "", // CL
      "", // HP
      item.details.armor?.toString() || "", // AC (for armor items)
      "", // Speed
      "", // Tier
      "", // Classes
      "", // Duration
      item.details.range || "", // Range (for weapons)
      "", // Traits
      item.details.item_type || "",
      costStr,
      item.details.damage || "",
      item.details.armor?.toString() || "",
      item.details.properties?.join(", ") || "",
      "", // Source
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
  items: GroupedAdventureListItems,
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
    lines.push("| Name | Qty | CL | HP | AC | Speed | Tags | Source |");
    lines.push("|------|-----|----|----|----|----|------|--------|");

    items.monsters.forEach((item) => {
      const cl = item.details.challenge_level ?? "-";
      const hp = item.details.hit_points ?? "-";
      const ac = item.details.armor_class ?? "-";
      const speed = item.details.speed || "-";
      const tags = item.details.tags
        ? [
            ...(item.details.tags.type || []),
            ...(item.details.tags.location || []),
          ].join(", ")
        : "-";
      const source = item.details.source || "-";
      lines.push(
        `| ${item.name} | ${item.quantity} | ${cl} | ${hp} | ${ac} | ${speed} | ${tags} | ${source} |`,
      );
      if (item.notes) {
        lines.push(`| | *${item.notes}* | | | | | | |`);
      }
    });
    lines.push("");
  }

  // Spells section
  if (items.spells.length > 0) {
    lines.push("## Spells");
    lines.push("");
    lines.push("| Name | Qty | Tier | Classes | Range | Duration | Source |");
    lines.push("|------|-----|------|---------|-------|----------|--------|");

    items.spells.forEach((item) => {
      const tier = item.details.tier ?? "-";
      const classes = item.details.classes?.join(", ") || "-";
      const range = item.details.range || "-";
      const duration = item.details.duration || "-";
      const source = item.details.source || "-";
      lines.push(
        `| ${item.name} | ${item.quantity} | ${tier} | ${classes} | ${range} | ${duration} | ${source} |`,
      );
      if (item.description) {
        lines.push(
          `| | *${item.description.substring(0, 100)}${item.description.length > 100 ? "..." : ""}* | | | | | |`,
        );
      }
      if (item.notes) {
        lines.push(`| | **Note:** ${item.notes} | | | | | |`);
      }
    });
    lines.push("");
  }

  // Magic Items section
  if (items.magic_items.length > 0) {
    lines.push("## Magic Items");
    lines.push("");
    lines.push("| Name | Qty | Traits |");
    lines.push("|------|-----|--------|");

    items.magic_items.forEach((item) => {
      const traits = item.details.traits?.join(", ") || "-";
      lines.push(`| ${item.name} | ${item.quantity} | ${traits} |`);
      if (item.description) {
        lines.push(
          `| | *${item.description.substring(0, 100)}${item.description.length > 100 ? "..." : ""}* | |`,
        );
      }
      if (item.notes) {
        lines.push(`| | **Note:** ${item.notes} | |`);
      }
    });
    lines.push("");
  }

  // Equipment section
  if (items.equipment.length > 0) {
    lines.push("## Equipment");
    lines.push("");
    lines.push(
      "| Name | Qty | Type | Cost | Damage | Range | Armor | Properties |",
    );
    lines.push(
      "|------|-----|------|------|--------|-------|-------|------------|",
    );

    items.equipment.forEach((item) => {
      const itemType = item.details.item_type || "-";
      const cost = item.details.cost
        ? `${item.details.cost.amount} ${item.details.cost.currency}`
        : "-";
      const damage = item.details.damage || "-";
      const range = item.details.range || "-";
      const armor = item.details.armor ?? "-";
      const properties = item.details.properties?.join(", ") || "-";
      lines.push(
        `| ${item.name} | ${item.quantity} | ${itemType} | ${cost} | ${damage} | ${range} | ${armor} | ${properties} |`,
      );
      if (item.notes) {
        lines.push(`| | *${item.notes}* | | | | | | |`);
      }
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
