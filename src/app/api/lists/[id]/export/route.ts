import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// GET /api/lists/[id]/export - Export list in various formats
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseServerClient();
    const { id } = params;
    const { searchParams } = new URL(request.url);

    const format = searchParams.get('format') || 'json';

    // Get current user (optional)
    const { data: { user } } = await supabase.auth.getUser();

    // Get the list with monsters
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
          list_notes: listMonster.notes,
          added_at: listMonster.added_at
        });
      }
    }

    const exportData = {
      list: {
        name: list.name,
        description: list.description,
        category: list.category,
        created_at: list.created_at,
        updated_at: list.updated_at
      },
      monsters,
      exported_at: new Date().toISOString(),
      exported_by: user?.email || 'anonymous'
    };

    // Return data in requested format
    switch (format.toLowerCase()) {
      case 'json':
        return NextResponse.json(exportData, {
          headers: {
            'Content-Disposition': `attachment; filename="${list.name.replace(/[^a-z0-9]/gi, '_')}.json"`,
            'Content-Type': 'application/json'
          }
        });

      case 'csv':
        // Convert to CSV format
        const csvHeaders = [
          'Name', 'Challenge Level', 'Hit Points', 'Armor Class', 'Speed',
          'Type', 'Location', 'Source', 'Notes'
        ];

        const csvRows = monsters.map(monster => [
          `"${monster.name.replace(/"/g, '""')}"`,
          monster.challenge_level,
          monster.hit_points,
          monster.armor_class,
          `"${monster.speed.replace(/"/g, '""')}"`,
          `"${monster.tags.type.join(', ')}"`,
          `"${monster.tags.location.join(', ')}"`,
          `"${monster.source.replace(/"/g, '""')}"`,
          `"${(monster.list_notes || '').replace(/"/g, '""')}"`
        ]);

        const csvContent = [
          csvHeaders.join(','),
          ...csvRows.map(row => row.join(','))
        ].join('\n');

        return new NextResponse(csvContent, {
          headers: {
            'Content-Disposition': `attachment; filename="${list.name.replace(/[^a-z0-9]/gi, '_')}.csv"`,
            'Content-Type': 'text/csv'
          }
        });

      case 'txt':
        // Convert to plain text format
        let textContent = `${list.name}\n`;
        textContent += `${'='.repeat(list.name.length)}\n\n`;
        textContent += `${list.description}\n\n`;

        monsters.forEach((monster, index) => {
          textContent += `${index + 1}. ${monster.name}\n`;
          textContent += `   Challenge Level: ${monster.challenge_level}\n`;
          textContent += `   HP: ${monster.hit_points}, AC: ${monster.armor_class}\n`;
          textContent += `   Speed: ${monster.speed}\n`;
          textContent += `   Type: ${monster.tags.type.join(', ')}\n`;
          textContent += `   Location: ${monster.tags.location.join(', ')}\n`;
          if (monster.list_notes) {
            textContent += `   Notes: ${monster.list_notes}\n`;
          }
          textContent += '\n';
        });

        return new NextResponse(textContent, {
          headers: {
            'Content-Disposition': `attachment; filename="${list.name.replace(/[^a-z0-9]/gi, '_')}.txt"`,
            'Content-Type': 'text/plain'
          }
        });

      default:
        return NextResponse.json(
          { error: 'Unsupported export format. Use json, csv, or txt.' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}