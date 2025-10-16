'use client';

import { useState, useEffect } from 'react';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { Layout } from '@/src/components/layout/Layout';
import { MonsterList } from '@/src/components/monsters/MonsterList';
import { MonsterFilters } from '@/src/components/monsters/MonsterFilters';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

interface Monster {
  id: string;
  name: string;
  challenge_level: number;
  hit_points: number;
  armor_class: number;
  speed: string;
  attacks: Array<{
    name: string;
    type: 'melee' | 'ranged';
    damage: string;
    range: string;
    description?: string;
  }>;
  abilities: Array<{
    name: string;
    description: string;
  }>;
  tags: {
    type: string[];
    location: string[];
  };
  source: string;
  author_notes?: string;
  monster_type?: 'official' | 'user';
  creator_id?: string;
}

interface FilterValues {
  search: string;
  challengeLevelRange: [number, number];
  types: string[];
  locations: string[];
  sources: string[];
}

const DEFAULT_FILTERS: FilterValues = {
  search: '',
  challengeLevelRange: [1, 20],
  types: [],
  locations: [],
  sources: []
};

export default function MonstersPage() {
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Available filter options
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [availableSources, setAvailableSources] = useState<string[]>([]);

  useEffect(() => {
    fetchMonsters();
  }, [filters, pagination.page, pagination.limit]);

  const fetchMonsters = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate offset from page and limit
      const offset = (pagination.page - 1) * pagination.limit;

      // Build query parameters - matching the API's expected parameter names
      const params = new URLSearchParams({
        offset: offset.toString(),
        limit: pagination.limit.toString(),
      });

      // API expects 'q' for search query
      if (filters.search) {
        params.append('q', filters.search);
      }

      // API expects 'min_cl' and 'max_cl' for challenge level
      if (filters.challengeLevelRange[0] > 1) {
        params.append('min_cl', filters.challengeLevelRange[0].toString());
      }

      if (filters.challengeLevelRange[1] < 20) {
        params.append('max_cl', filters.challengeLevelRange[1].toString());
      }

      // API expects 'tags' for both types and locations
      if (filters.types.length > 0) {
        params.append('tags', filters.types.join(','));
      }

      // Note: The current API doesn't support separate location filtering yet
      // It only supports tag-based filtering

      const response = await fetch(`/api/monsters?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch monsters');
      }

      const data = await response.json();

      setMonsters(data.monsters || []);

      // Calculate total pages from the API response
      const totalPages = Math.ceil((data.total || 0) / pagination.limit);

      setPagination(prev => ({
        ...prev,
        total: data.total || 0,
        totalPages: totalPages
      }));

      // Extract unique filter options from results
      if (data.monsters && data.monsters.length > 0) {
        const types = new Set<string>();
        const locations = new Set<string>();
        const sources = new Set<string>();

        data.monsters.forEach((monster: Monster) => {
          if (monster.tags?.type) {
            monster.tags.type.forEach(t => types.add(t));
          }
          if (monster.tags?.location) {
            monster.tags.location.forEach(l => locations.add(l));
          }
          if (monster.source) {
            sources.add(monster.source);
          }
        });

        setAvailableTypes(Array.from(types).sort());
        setAvailableLocations(Array.from(locations).sort());
        setAvailableSources(Array.from(sources).sort());
      }
    } catch (err) {
      console.error('Error fetching monsters:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 when filters change
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPagination(prev => ({ ...prev, limit: pageSize, page: 1 }));
  };

  return (
    <MantineProvider>
      <Notifications />
      <Layout>
        <div style={{ padding: '20px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            Monsters
          </h1>

          <div style={{ marginBottom: '20px' }}>
            <MonsterFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              availableTypes={availableTypes}
              availableLocations={availableLocations}
              availableSources={availableSources}
              loading={loading}
            />
          </div>

          <MonsterList
            monsters={monsters}
            pagination={pagination}
            loading={loading}
            error={error || undefined}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onRetry={fetchMonsters}
          />
        </div>
      </Layout>
    </MantineProvider>
  );
}
