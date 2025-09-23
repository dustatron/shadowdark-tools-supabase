import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Schema for list updates
const ListUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(10).max(1000).optional(),
  is_public: z.boolean().optional(),
  category: z.string().max(50).nullable().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});

// GET /api/lists/[id] - Get specific list with monsters
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseServerClient();
    const { id } = params;

    // Get current user (optional)
    const { data: { user } } = await supabase.auth.getUser();

    // Get the list
    const { data: list, error: listError } = await supabase
      .from('user_lists')
      .select('*')
      .eq('id', id)
      .single();

    if (listError || !list) {
      return NextResponse.json(
        { error: 'List not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    if (!list.is_public && (!user || list.creator_id !== user.id)) {
      return NextResponse.json(
        { error: 'Access denied to private list' },
        { status: 403 }
      );
    }

    // Get list monsters with monster details
    const { data: listMonsters, error: monstersError } = await supabase
      .from('user_list_monsters')
      .select(`
        monster_id,
        monster_type,
        added_at,
        notes
      `)
      .eq('list_id', id)
      .order('added_at');

    if (monstersError) {
      console.error('Database error:', monstersError);
      return NextResponse.json(
        { error: 'Failed to fetch list monsters' },
        { status: 500 }
      );
    }

    // Get monster details for each monster in the list
    const monsters = [];
    for (const listMonster of listMonsters) {
      let monster = null;

      if (listMonster.monster_type === 'official') {
        const { data, error } = await supabase
          .from('official_monsters')
          .select('*')
          .eq('id', listMonster.monster_id)
          .single();

        if (!error && data) {
          monster = {
            ...data,
            monster_type: 'official',
            attacks: typeof data.attacks === 'string' ? JSON.parse(data.attacks) : data.attacks,
            abilities: typeof data.abilities === 'string' ? JSON.parse(data.abilities) : data.abilities,
            tags: typeof data.tags === 'string' ? JSON.parse(data.tags) : data.tags
          };
        }
      } else if (listMonster.monster_type === 'user') {
        const { data, error } = await supabase
          .from('user_monsters')
          .select('*')
          .eq('id', listMonster.monster_id)
          .single();

        if (!error && data) {
          monster = {
            ...data,
            monster_type: 'user',
            attacks: typeof data.attacks === 'string' ? JSON.parse(data.attacks) : data.attacks,
            abilities: typeof data.abilities === 'string' ? JSON.parse(data.abilities) : data.abilities,
            tags: typeof data.tags === 'string' ? JSON.parse(data.tags) : data.tags
          };
        }
      }

      if (monster) {
        monsters.push({
          ...monster,
          list_metadata: {
            added_at: listMonster.added_at,
            notes: listMonster.notes
          }
        });
      }
    }

    return NextResponse.json({
      ...list,
      monsters
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/lists/[id] - Update list
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseServerClient();
    const { id } = params;

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
      .eq('id', id)
      .single();

    if (fetchError || !existingList) {
      return NextResponse.json(
        { error: 'List not found' },
        { status: 404 }
      );
    }

    if (existingList.creator_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only edit your own lists' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = ListUpdateSchema.parse(body);

    // Update the list
    const { data: list, error } = await supabase
      .from('user_lists')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update list' },
        { status: 500 }
      );
    }

    return NextResponse.json(list);

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

// DELETE /api/lists/[id] - Delete list
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseServerClient();
    const { id } = params;

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
      .eq('id', id)
      .single();

    if (fetchError || !existingList) {
      return NextResponse.json(
        { error: 'List not found' },
        { status: 404 }
      );
    }

    if (existingList.creator_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own lists' },
        { status: 403 }
      );
    }

    // Delete the list (cascade will handle list_monsters)
    const { error } = await supabase
      .from('user_lists')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to delete list' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'List deleted successfully' });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}