export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      adventure_list_items: {
        Row: {
          created_at: string;
          id: string;
          item_id: string;
          item_type: string;
          list_id: string;
          notes: string | null;
          quantity: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          item_id: string;
          item_type: string;
          list_id: string;
          notes?: string | null;
          quantity?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          item_id?: string;
          item_type?: string;
          list_id?: string;
          notes?: string | null;
          quantity?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "adventure_list_items_list_id_fkey";
            columns: ["list_id"];
            isOneToOne: false;
            referencedRelation: "adventure_lists";
            referencedColumns: ["id"];
          },
        ];
      };
      adventure_lists: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          image_url: string | null;
          is_public: boolean;
          notes: string | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_public?: boolean;
          notes?: string | null;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_public?: boolean;
          notes?: string | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "adventure_lists_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_logs: {
        Row: {
          action_type: string;
          admin_user_id: string;
          details: Json | null;
          id: string;
          notes: string | null;
          target_id: string | null;
          target_type: string | null;
          timestamp: string;
        };
        Insert: {
          action_type: string;
          admin_user_id: string;
          details?: Json | null;
          id?: string;
          notes?: string | null;
          target_id?: string | null;
          target_type?: string | null;
          timestamp?: string;
        };
        Update: {
          action_type?: string;
          admin_user_id?: string;
          details?: Json | null;
          id?: string;
          notes?: string | null;
          target_id?: string | null;
          target_type?: string | null;
          timestamp?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_admin_user_id_fkey";
            columns: ["admin_user_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      deck_items: {
        Row: {
          added_at: string;
          deck_id: string;
          id: string;
          item_type: string;
          magic_item_id: string | null;
          position: number | null;
          spell_id: string | null;
        };
        Insert: {
          added_at?: string;
          deck_id: string;
          id?: string;
          item_type?: string;
          magic_item_id?: string | null;
          position?: number | null;
          spell_id?: string | null;
        };
        Update: {
          added_at?: string;
          deck_id?: string;
          id?: string;
          item_type?: string;
          magic_item_id?: string | null;
          position?: number | null;
          spell_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "deck_items_deck_id_fkey";
            columns: ["deck_id"];
            isOneToOne: false;
            referencedRelation: "decks";
            referencedColumns: ["id"];
          },
        ];
      };
      decks: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      encounter_table_entries: {
        Row: {
          created_at: string;
          id: string;
          monster_id: string | null;
          monster_snapshot: Json;
          roll_number: number;
          table_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          monster_id?: string | null;
          monster_snapshot: Json;
          roll_number: number;
          table_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          monster_id?: string | null;
          monster_snapshot?: Json;
          roll_number?: number;
          table_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "encounter_table_entries_table_id_fkey";
            columns: ["table_id"];
            isOneToOne: false;
            referencedRelation: "encounter_tables";
            referencedColumns: ["id"];
          },
        ];
      };
      encounter_tables: {
        Row: {
          created_at: string;
          description: string | null;
          die_size: number;
          filters: Json;
          id: string;
          is_public: boolean;
          name: string;
          public_slug: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          die_size: number;
          filters: Json;
          id?: string;
          is_public?: boolean;
          name: string;
          public_slug?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          die_size?: number;
          filters?: Json;
          id?: string;
          is_public?: boolean;
          name?: string;
          public_slug?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      equipment: {
        Row: {
          armor: string | null;
          attack_type: string | null;
          cost: Json;
          created_at: string | null;
          damage: string | null;
          id: string;
          image_url: string | null;
          item_type: string;
          name: string;
          properties: string[] | null;
          quantity: string | null;
          range: string | null;
          slot: number;
          updated_at: string | null;
          uuid: string | null;
        };
        Insert: {
          armor?: string | null;
          attack_type?: string | null;
          cost: Json;
          created_at?: string | null;
          damage?: string | null;
          id?: string;
          image_url?: string | null;
          item_type: string;
          name: string;
          properties?: string[] | null;
          quantity?: string | null;
          range?: string | null;
          slot?: number;
          updated_at?: string | null;
          uuid?: string | null;
        };
        Update: {
          armor?: string | null;
          attack_type?: string | null;
          cost?: Json;
          created_at?: string | null;
          damage?: string | null;
          id?: string;
          image_url?: string | null;
          item_type?: string;
          name?: string;
          properties?: string[] | null;
          quantity?: string | null;
          range?: string | null;
          slot?: number;
          updated_at?: string | null;
          uuid?: string | null;
        };
        Relationships: [];
      };
      favorites: {
        Row: {
          created_at: string | null;
          id: string;
          item_id: string;
          item_type: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          item_id: string;
          item_type: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          item_id?: string;
          item_type?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      flags: {
        Row: {
          admin_notes: string | null;
          comment: string;
          created_at: string;
          flagged_item_id: string;
          flagged_item_type: string;
          id: string;
          reason: string;
          reporter_user_id: string;
          resolved_at: string | null;
          resolved_by: string | null;
          status: string;
        };
        Insert: {
          admin_notes?: string | null;
          comment: string;
          created_at?: string;
          flagged_item_id: string;
          flagged_item_type: string;
          id?: string;
          reason: string;
          reporter_user_id: string;
          resolved_at?: string | null;
          resolved_by?: string | null;
          status?: string;
        };
        Update: {
          admin_notes?: string | null;
          comment?: string;
          created_at?: string;
          flagged_item_id?: string;
          flagged_item_type?: string;
          id?: string;
          reason?: string;
          reporter_user_id?: string;
          resolved_at?: string | null;
          resolved_by?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "flags_reporter_user_id_fkey";
            columns: ["reporter_user_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "flags_resolved_by_fkey";
            columns: ["resolved_by"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      list_items: {
        Row: {
          created_at: string;
          id: string;
          item_id: string;
          item_type: string;
          list_id: string;
          quantity: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          item_id: string;
          item_type: string;
          list_id: string;
          quantity?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          item_id?: string;
          item_type?: string;
          list_id?: string;
          quantity?: number;
        };
        Relationships: [
          {
            foreignKeyName: "list_items_list_id_fkey";
            columns: ["list_id"];
            isOneToOne: false;
            referencedRelation: "user_lists";
            referencedColumns: ["id"];
          },
        ];
      };
      official_magic_items: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          image_url: string | null;
          name: string;
          slug: string;
          traits: Json;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          id?: string;
          image_url?: string | null;
          name: string;
          slug: string;
          traits?: Json;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          image_url?: string | null;
          name?: string;
          slug?: string;
          traits?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      official_monsters: {
        Row: {
          abilities: Json;
          alignment: string | null;
          armor_class: number;
          art_url: string | null;
          attacks: Json;
          author_notes: string | null;
          challenge_level: number;
          charisma_mod: number | null;
          constitution_mod: number | null;
          created_at: string;
          description: string | null;
          dexterity_mod: number | null;
          gm_notes: string | null;
          hit_points: number;
          icon_url: string | null;
          id: string;
          intelligence_mod: number | null;
          name: string;
          source: string;
          speed: string;
          strength_mod: number | null;
          tactics: string | null;
          tags: Json;
          treasure: Json | null;
          updated_at: string;
          wants: string | null;
          wisdom_mod: number | null;
          xp: number | null;
        };
        Insert: {
          abilities?: Json;
          alignment?: string | null;
          armor_class: number;
          art_url?: string | null;
          attacks?: Json;
          author_notes?: string | null;
          challenge_level: number;
          charisma_mod?: number | null;
          constitution_mod?: number | null;
          created_at?: string;
          description?: string | null;
          dexterity_mod?: number | null;
          gm_notes?: string | null;
          hit_points: number;
          icon_url?: string | null;
          id?: string;
          intelligence_mod?: number | null;
          name: string;
          source: string;
          speed: string;
          strength_mod?: number | null;
          tactics?: string | null;
          tags?: Json;
          treasure?: Json | null;
          updated_at?: string;
          wants?: string | null;
          wisdom_mod?: number | null;
          xp?: number | null;
        };
        Update: {
          abilities?: Json;
          alignment?: string | null;
          armor_class?: number;
          art_url?: string | null;
          attacks?: Json;
          author_notes?: string | null;
          challenge_level?: number;
          charisma_mod?: number | null;
          constitution_mod?: number | null;
          created_at?: string;
          description?: string | null;
          dexterity_mod?: number | null;
          gm_notes?: string | null;
          hit_points?: number;
          icon_url?: string | null;
          id?: string;
          intelligence_mod?: number | null;
          name?: string;
          source?: string;
          speed?: string;
          strength_mod?: number | null;
          tactics?: string | null;
          tags?: Json;
          treasure?: Json | null;
          updated_at?: string;
          wants?: string | null;
          wisdom_mod?: number | null;
          xp?: number | null;
        };
        Relationships: [];
      };
      official_spells: {
        Row: {
          art_url: string | null;
          author_notes: string | null;
          classes: Json;
          created_at: string;
          description: string;
          duration: string;
          icon_url: string | null;
          id: string;
          name: string;
          range: string;
          slug: string;
          source: string;
          tier: number;
          updated_at: string;
        };
        Insert: {
          art_url?: string | null;
          author_notes?: string | null;
          classes?: Json;
          created_at?: string;
          description: string;
          duration: string;
          icon_url?: string | null;
          id?: string;
          name: string;
          range: string;
          slug: string;
          source?: string;
          tier: number;
          updated_at?: string;
        };
        Update: {
          art_url?: string | null;
          author_notes?: string | null;
          classes?: Json;
          created_at?: string;
          description?: string;
          duration?: string;
          icon_url?: string | null;
          id?: string;
          name?: string;
          range?: string;
          slug?: string;
          source?: string;
          tier?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      tag_locations: {
        Row: {
          created_at: string;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      tag_types: {
        Row: {
          created_at: string;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      user_equipment: {
        Row: {
          armor: string | null;
          attack_type: string | null;
          cost: Json;
          created_at: string;
          damage: string | null;
          description: string | null;
          id: string;
          image_url: string | null;
          is_public: boolean;
          item_type: string;
          name: string;
          properties: string[] | null;
          quantity: string | null;
          range: string | null;
          slot: number;
          slug: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          armor?: string | null;
          attack_type?: string | null;
          cost?: Json;
          created_at?: string;
          damage?: string | null;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_public?: boolean;
          item_type: string;
          name: string;
          properties?: string[] | null;
          quantity?: string | null;
          range?: string | null;
          slot?: number;
          slug: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          armor?: string | null;
          attack_type?: string | null;
          cost?: Json;
          created_at?: string;
          damage?: string | null;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_public?: boolean;
          item_type?: string;
          name?: string;
          properties?: string[] | null;
          quantity?: string | null;
          range?: string | null;
          slot?: number;
          slug?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_equipment_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_groups: {
        Row: {
          combined_stats: Json;
          created_at: string;
          description: string | null;
          id: string;
          is_public: boolean;
          monsters: Json;
          name: string;
          tags: Json;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          combined_stats?: Json;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_public?: boolean;
          monsters?: Json;
          name: string;
          tags?: Json;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          combined_stats?: Json;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_public?: boolean;
          monsters?: Json;
          name?: string;
          tags?: Json;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_groups_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_lists: {
        Row: {
          challenge_level_max: number | null;
          challenge_level_min: number | null;
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          party_level: number | null;
          updated_at: string;
          user_id: string;
          xp_budget: number | null;
        };
        Insert: {
          challenge_level_max?: number | null;
          challenge_level_min?: number | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          party_level?: number | null;
          updated_at?: string;
          user_id: string;
          xp_budget?: number | null;
        };
        Update: {
          challenge_level_max?: number | null;
          challenge_level_min?: number | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          party_level?: number | null;
          updated_at?: string;
          user_id?: string;
          xp_budget?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_lists_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_magic_items: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          image_url: string | null;
          is_ai_generated: boolean | null;
          is_public: boolean;
          name: string;
          slug: string;
          traits: Json;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          id?: string;
          image_url?: string | null;
          is_ai_generated?: boolean | null;
          is_public?: boolean;
          name: string;
          slug: string;
          traits?: Json;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          image_url?: string | null;
          is_ai_generated?: boolean | null;
          is_public?: boolean;
          name?: string;
          slug?: string;
          traits?: Json;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_magic_items_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_monsters: {
        Row: {
          abilities: Json;
          alignment: string | null;
          armor_class: number;
          art_url: string | null;
          attacks: Json;
          author_notes: string | null;
          challenge_level: number;
          charisma_mod: number | null;
          constitution_mod: number | null;
          created_at: string;
          description: string | null;
          dexterity_mod: number | null;
          gm_notes: string | null;
          hit_points: number;
          icon_url: string | null;
          id: string;
          intelligence_mod: number | null;
          is_public: boolean;
          name: string;
          source: string;
          speed: string;
          strength_mod: number | null;
          tactics: string | null;
          tags: Json;
          treasure: Json | null;
          updated_at: string;
          user_id: string;
          wants: string | null;
          wisdom_mod: number | null;
          xp: number | null;
        };
        Insert: {
          abilities?: Json;
          alignment?: string | null;
          armor_class: number;
          art_url?: string | null;
          attacks?: Json;
          author_notes?: string | null;
          challenge_level: number;
          charisma_mod?: number | null;
          constitution_mod?: number | null;
          created_at?: string;
          description?: string | null;
          dexterity_mod?: number | null;
          gm_notes?: string | null;
          hit_points: number;
          icon_url?: string | null;
          id?: string;
          intelligence_mod?: number | null;
          is_public?: boolean;
          name: string;
          source: string;
          speed: string;
          strength_mod?: number | null;
          tactics?: string | null;
          tags?: Json;
          treasure?: Json | null;
          updated_at?: string;
          user_id: string;
          wants?: string | null;
          wisdom_mod?: number | null;
          xp?: number | null;
        };
        Update: {
          abilities?: Json;
          alignment?: string | null;
          armor_class?: number;
          art_url?: string | null;
          attacks?: Json;
          author_notes?: string | null;
          challenge_level?: number;
          charisma_mod?: number | null;
          constitution_mod?: number | null;
          created_at?: string;
          description?: string | null;
          dexterity_mod?: number | null;
          gm_notes?: string | null;
          hit_points?: number;
          icon_url?: string | null;
          id?: string;
          intelligence_mod?: number | null;
          is_public?: boolean;
          name?: string;
          source?: string;
          speed?: string;
          strength_mod?: number | null;
          tactics?: string | null;
          tags?: Json;
          treasure?: Json | null;
          updated_at?: string;
          user_id?: string;
          wants?: string | null;
          wisdom_mod?: number | null;
          xp?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_monsters_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          display_name: string | null;
          id: string;
          is_admin: boolean;
          updated_at: string;
          username: string;
          username_slug: string;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          display_name?: string | null;
          id: string;
          is_admin?: boolean;
          updated_at?: string;
          username: string;
          username_slug: string;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          is_admin?: boolean;
          updated_at?: string;
          username?: string;
          username_slug?: string;
        };
        Relationships: [];
      };
      user_spells: {
        Row: {
          art_url: string | null;
          author_notes: string | null;
          classes: Json;
          created_at: string;
          creator_id: string | null;
          description: string;
          duration: string;
          icon_url: string | null;
          id: string;
          is_public: boolean;
          name: string;
          range: string;
          slug: string;
          source: string;
          tier: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          art_url?: string | null;
          author_notes?: string | null;
          classes?: Json;
          created_at?: string;
          creator_id?: string | null;
          description: string;
          duration: string;
          icon_url?: string | null;
          id?: string;
          is_public?: boolean;
          name: string;
          range: string;
          slug: string;
          source?: string;
          tier: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          art_url?: string | null;
          author_notes?: string | null;
          classes?: Json;
          created_at?: string;
          creator_id?: string | null;
          description?: string;
          duration?: string;
          icon_url?: string | null;
          id?: string;
          is_public?: boolean;
          name?: string;
          range?: string;
          slug?: string;
          source?: string;
          tier?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_spells_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      all_equipment: {
        Row: {
          armor: string | null;
          attack_type: string | null;
          cost: Json | null;
          created_at: string | null;
          creator_name: string | null;
          damage: string | null;
          description: string | null;
          id: string | null;
          image_url: string | null;
          is_public: boolean | null;
          item_type: string | null;
          name: string | null;
          properties: string[] | null;
          quantity: string | null;
          range: string | null;
          slot: number | null;
          slug: string | null;
          source_type: string | null;
          updated_at: string | null;
          user_id: string | null;
          uuid: string | null;
        };
        Relationships: [];
      };
      all_magic_items: {
        Row: {
          created_at: string | null;
          creator_name: string | null;
          description: string | null;
          id: string | null;
          image_url: string | null;
          is_public: boolean | null;
          item_type: string | null;
          name: string | null;
          slug: string | null;
          traits: Json | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Relationships: [];
      };
      all_monsters: {
        Row: {
          abilities: Json | null;
          alignment: string | null;
          armor_class: number | null;
          art_url: string | null;
          attacks: Json | null;
          author_notes: string | null;
          challenge_level: number | null;
          charisma_mod: number | null;
          constitution_mod: number | null;
          created_at: string | null;
          description: string | null;
          dexterity_mod: number | null;
          gm_notes: string | null;
          hit_points: number | null;
          icon_url: string | null;
          id: string | null;
          intelligence_mod: number | null;
          is_official: boolean | null;
          is_public: boolean | null;
          monster_type: string | null;
          name: string | null;
          source: string | null;
          speed: string | null;
          strength_mod: number | null;
          tactics: string | null;
          tags: Json | null;
          treasure: Json | null;
          updated_at: string | null;
          user_id: string | null;
          wants: string | null;
          wisdom_mod: number | null;
          xp: number | null;
        };
        Relationships: [];
      };
      all_spells: {
        Row: {
          art_url: string | null;
          author_notes: string | null;
          classes: Json | null;
          created_at: string | null;
          creator_id: string | null;
          description: string | null;
          duration: string | null;
          icon_url: string | null;
          id: string | null;
          is_public: boolean | null;
          name: string | null;
          range: string | null;
          slug: string | null;
          source: string | null;
          spell_type: string | null;
          tier: number | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      calculate_group_stats: { Args: { group_monsters: Json }; Returns: Json };
      calculate_list_totals: { Args: { list_uuid: string }; Returns: Json };
      create_audit_log: {
        Args: {
          p_action_type: string;
          p_details?: Json;
          p_notes?: string;
          p_target_id?: string;
          p_target_type?: string;
        };
        Returns: string;
      };
      create_audit_log_partition: {
        Args: { partition_date: string };
        Returns: undefined;
      };
      generate_username_slug: { Args: { username: string }; Returns: string };
      get_adventure_list_items: {
        Args: { list_uuid: string };
        Returns: {
          description: string;
          details: Json;
          id: string;
          item_id: string;
          item_type: string;
          list_id: string;
          name: string;
          notes: string;
          quantity: number;
          slug: string;
        }[];
      };
      get_database_stats: {
        Args: never;
        Returns: {
          index_size: string;
          row_count: number;
          table_name: string;
          table_size: string;
        }[];
      };
      get_random_monsters: {
        Args: {
          count_limit?: number;
          location_tags?: string[];
          max_challenge_level?: number;
          min_challenge_level?: number;
          monster_types?: string[];
        };
        Returns: {
          abilities: Json;
          armor_class: number;
          art_url: string;
          attacks: Json;
          author_notes: string;
          challenge_level: number;
          charisma_mod: number;
          constitution_mod: number;
          created_at: string;
          dexterity_mod: number;
          hit_points: number;
          icon_url: string;
          id: string;
          intelligence_mod: number;
          is_official: boolean;
          is_public: boolean;
          monster_type: string;
          name: string;
          source: string;
          speed: string;
          strength_mod: number;
          tags: Json;
          treasure: Json;
          updated_at: string;
          user_id: string;
          wisdom_mod: number;
          xp: number;
        }[];
      };
      refresh_search_cache: { Args: never; Returns: undefined };
      search_all_content: {
        Args: {
          include_equipment?: boolean;
          include_magic_items?: boolean;
          include_monsters?: boolean;
          include_spells?: boolean;
          result_limit?: number;
          search_query: string;
          source_filter?: string;
        };
        Returns: {
          content_type: string;
          description: string;
          detail_url: string;
          id: string;
          name: string;
          relevance: number;
          source: string;
        }[];
      };
      search_monsters: {
        Args: {
          limit_count?: number;
          location_tags?: string[];
          max_challenge_level?: number;
          min_challenge_level?: number;
          monster_types?: string[];
          offset_count?: number;
          search_query?: string;
          source_filter?: string;
        };
        Returns: {
          abilities: Json;
          armor_class: number;
          art_url: string;
          attacks: Json;
          author_notes: string;
          challenge_level: number;
          charisma_mod: number;
          constitution_mod: number;
          created_at: string;
          dexterity_mod: number;
          hit_points: number;
          icon_url: string;
          id: string;
          intelligence_mod: number;
          is_official: boolean;
          is_public: boolean;
          monster_type: string;
          name: string;
          relevance: number;
          source: string;
          speed: string;
          strength_mod: number;
          tags: Json;
          treasure: Json;
          updated_at: string;
          user_id: string;
          wisdom_mod: number;
          xp: number;
        }[];
      };
      search_spells: {
        Args: {
          max_tier?: number;
          min_tier?: number;
          page_number?: number;
          page_size?: number;
          search_query?: string;
          spell_classes?: string[];
          spell_durations?: string[];
          spell_ranges?: string[];
          spell_sources?: string[];
        };
        Returns: {
          art_url: string;
          author_notes: string;
          classes: Json;
          created_at: string;
          creator_id: string;
          description: string;
          duration: string;
          icon_url: string;
          id: string;
          is_public: boolean;
          name: string;
          range: string;
          slug: string;
          source: string;
          spell_type: string;
          tier: number;
          total_count: number;
          updated_at: string;
          user_id: string;
        }[];
      };
      show_limit: { Args: never; Returns: number };
      show_trgm: { Args: { "": string }; Returns: string[] };
      update_search_statistics: { Args: never; Returns: undefined };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
