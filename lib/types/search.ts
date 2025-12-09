export type ContentType = "monster" | "magic_item" | "equipment" | "spell";
export type SourceType = "official" | "user";

export type SearchResult = {
  id: string;
  name: string;
  type: ContentType;
  source: SourceType;
  detailUrl: string;
  relevance: number;
  description?: string; // optional, for magic items
};

export type SearchResponse = {
  results: SearchResult[];
  total: number;
  query: string;
  filters: {
    source: string;
    includeMonsters: boolean;
    includeMagicItems: boolean;
    includeEquipment: boolean;
    includeSpells: boolean;
    limit: number;
  };
};

export type SearchFilters = {
  q: string;
  source: "all" | "core" | "user";
  includeMonsters: boolean;
  includeMagicItems: boolean;
  includeEquipment: boolean;
  includeSpells: boolean;
  limit: 25 | 50 | 100;
};

export type SearchAllContentRow = {
  id: string;
  name: string;
  content_type: ContentType;
  source: SourceType;
  detail_url: string;
  relevance: number;
  description?: string;
};
