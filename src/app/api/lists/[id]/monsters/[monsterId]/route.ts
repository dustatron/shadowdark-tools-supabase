import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// DELETE /api/lists/[id]/monsters/[monsterId] - Remove monster from list
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; monsterId: string } }
) {
  try {
    const supabase = createSupabaseServerClient();
    const { id: listId, monsterId } = params;

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

    // Check if monster is in the list
    const { data: listMonster, error: listMonsterError } = await supabase
      .from('user_list_monsters')
      .select('id')
      .eq('list_id', listId)
      .eq('monster_id', monsterId)
      .single();

    if (listMonsterError || !listMonster) {
      return NextResponse.json(
        { error: 'Monster not found in list' },
        { status: 404 }
      );
    }

    // Remove monster from list
    const { error } = await supabase
      .from('user_list_monsters')
      .delete()
      .eq('list_id', listId)
      .eq('monster_id', monsterId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to remove monster from list' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Monster removed from list successfully' });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}