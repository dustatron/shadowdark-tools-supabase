import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Schema for adding monster to list
const AddMonsterSchema = z.object({
  monsterId: z.string().uuid(),
  monsterType: z.enum(['official', 'user']).default('official'),
  notes: z.string().max(500).optional()
});

// POST /api/lists/[id]/monsters - Add monster to list
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseServerClient();
    const { id: listId } = params;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if list exists and user owns it
    const { data: existingList, error: fetchError } = await supabase
      .from('user_lists')
      .select('creator_id')
      .eq('id', listId)
      .single();

    if (fetchError || !existingList) {
      return NextResponse.json(
        { error: 'List not found' },
        { status: 404 }
      );
    }

    if (existingList.creator_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only modify your own lists' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { monsterId, monsterType, notes } = AddMonsterSchema.parse(body);

    // Verify monster exists
    const table = monsterType === 'official' ? 'official_monsters' : 'user_monsters';
    const { data: monster, error: monsterError } = await supabase
      .from(table)
      .select('id')
      .eq('id', monsterId)
      .single();

    if (monsterError || !monster) {
      return NextResponse.json(
        { error: 'Monster not found' },
        { status: 404 }
      );
    }

    // Check for duplicate
    const { data: existing, error: duplicateError } = await supabase
      .from('user_list_monsters')
      .select('id')
      .eq('list_id', listId)
      .eq('monster_id', monsterId)
      .eq('monster_type', monsterType)
      .single();

    if (!duplicateError && existing) {
      return NextResponse.json(
        { error: 'Monster already in list' },
        { status: 400 }
      );
    }

    // Add monster to list
    const { data: listMonster, error } = await supabase
      .from('user_list_monsters')
      .insert([{
        list_id: listId,
        monster_id: monsterId,
        monster_type: monsterType,
        notes: notes || null
      }])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to add monster to list' },
        { status: 500 }
      );
    }

    return NextResponse.json(listMonster, { status: 201 });

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