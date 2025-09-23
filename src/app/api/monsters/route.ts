import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Schema for monster creation/update
const MonsterSchema = z.object({
  name: z.string().min(1).max(100),
  challenge_level: z.number().int().min(1).max(20),
  hit_points: z.number().int().min(1),
  armor_class: z.number().int().min(1).max(25),
  speed: z.string().min(1),
  attacks: z.array(z.object({
    name: z.string(),
    type: z.enum(['melee', 'ranged']),
    damage: z.string(),
    range: z.string(),
    description: z.string().optional()
  })).default([]),
  abilities: z.array(z.object({
    name: z.string(),
    description: z.string()
  })).default([]),
  treasure: z.string().nullable().optional(),
  tags: z.object({
    type: z.array(z.string()),
    location: z.array(z.string())
  }),
  author_notes: z.string().nullable().optional()
});

// GET /api/monsters - List monsters with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const offset = (page - 1) * limit;

    const search = searchParams.get('search') || '';
    const minLevel = searchParams.get('minLevel') ? parseInt(searchParams.get('minLevel')!) : null;
    const maxLevel = searchParams.get('maxLevel') ? parseInt(searchParams.get('maxLevel')!) : null;
    const types = searchParams.get('types')?.split(',').filter(Boolean) || null;
    const locations = searchParams.get('locations')?.split(',').filter(Boolean) || null;
    const sources = searchParams.get('sources')?.split(',').filter(Boolean) || null;

    // Use the search function if we have search parameters
    if (search || minLevel || maxLevel || types || locations || sources) {
      const { data: monsters, error } = await supabase.rpc('search_monsters', {
        search_query: search,
        min_level: minLevel || 1,
        max_level: maxLevel || 20,
        monster_types: types,
        locations: locations,
        sources: sources,
        result_limit: limit,
        result_offset: offset
      });

      if (error) {
        console.error('Search error:', error);
        return NextResponse.json(
          { error: 'Failed to search monsters' },
          { status: 500 }
        );
      }

      // Get total count for pagination
      const { count } = await supabase.rpc('search_monsters', {
        search_query: search,
        min_level: minLevel || 1,
        max_level: maxLevel || 20,
        monster_types: types,
        locations: locations,
        sources: sources,
        result_limit: 999999,
        result_offset: 0
      }).select('*', { count: 'exact', head: true });

      return NextResponse.json({
        monsters,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      });
    }

    // Simple list without search
    const { data: monsters, error, count } = await supabase
      .from('all_monsters')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('name');

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch monsters' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      monsters,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/monsters - Create new user monster
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = MonsterSchema.parse(body);

    // Create the monster
    const { data: monster, error } = await supabase
      .from('user_monsters')
      .insert([{
        ...validatedData,
        attacks: JSON.stringify(validatedData.attacks),
        abilities: JSON.stringify(validatedData.abilities),
        tags: JSON.stringify(validatedData.tags),
        creator_id: user.id
      }])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create monster' },
        { status: 500 }
      );
    }

    // Parse JSON fields back for response
    const responseMonster = {
      ...monster,
      attacks: JSON.parse(monster.attacks),
      abilities: JSON.parse(monster.abilities),
      tags: JSON.parse(monster.tags)
    };

    return NextResponse.json(responseMonster, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      );
    }

    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}