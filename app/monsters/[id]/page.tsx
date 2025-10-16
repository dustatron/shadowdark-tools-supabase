'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MantineProvider, Container, Paper, Title, Group, Badge, Stack, Text, Button, LoadingOverlay, Alert } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { Layout } from '@/src/components/layout/Layout';
import { MonsterStatBlock } from '@/src/components/monsters/MonsterStatBlock';
import { MonsterAttacksDisplay } from '@/src/components/monsters/MonsterAttacksDisplay';
import { MonsterAbilitiesDisplay } from '@/src/components/monsters/MonsterAbilitiesDisplay';
import { IconArrowLeft, IconAlertCircle } from '@tabler/icons-react';
import Link from 'next/link';
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

export default function MonsterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const monsterId = params?.id as string;

  const [monster, setMonster] = useState<Monster | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (monsterId) {
      fetchMonster();
    }
  }, [monsterId]);

  const fetchMonster = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/monsters/${monsterId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('Monster not found');
        } else {
          setError('Failed to load monster');
        }
        return;
      }

      const data = await response.json();
      setMonster(data);
    } catch (err) {
      console.error('Error fetching monster:', err);
      setError('An error occurred while loading the monster');
    } finally {
      setLoading(false);
    }
  };

  const challengeLevelColor = monster
    ? monster.challenge_level <= 3
      ? 'green'
      : monster.challenge_level <= 7
      ? 'yellow'
      : monster.challenge_level <= 12
      ? 'orange'
      : 'red'
    : 'gray';

  return (
    <MantineProvider>
      <Notifications />
      <Layout>
        <Container size="lg" py="xl">
          <Button
            component={Link}
            href="/monsters"
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            mb="xl"
          >
            Back to Monsters
          </Button>

          {loading && (
            <Paper shadow="sm" p="xl" pos="relative" mih={400}>
              <LoadingOverlay visible={true} />
            </Paper>
          )}

          {error && (
            <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
              {error}
            </Alert>
          )}

          {monster && !loading && !error && (
            <Stack gap="lg">
              {/* Header */}
              <Paper shadow="sm" p="xl" withBorder>
                <Group justify="space-between" align="flex-start" mb="md">
                  <div>
                    <Title order={1} mb="sm">
                      {monster.name}
                    </Title>
                    <Group gap="xs">
                      <Badge color={challengeLevelColor} size="lg">
                        Challenge Level {monster.challenge_level}
                      </Badge>
                      <Badge variant="outline" size="lg">
                        {monster.source}
                      </Badge>
                      {monster.monster_type === 'user' && (
                        <Badge variant="light" color="blue" size="lg">
                          Custom
                        </Badge>
                      )}
                    </Group>
                  </div>
                </Group>

                {/* Description */}
                {monster.author_notes && (
                  <Text size="md" c="dimmed" mb="lg">
                    {monster.author_notes}
                  </Text>
                )}

                {/* Tags */}
                <Group gap="xs">
                  {monster.tags.type.map((type, index) => (
                    <Badge key={`type-${index}`} variant="light">
                      {type}
                    </Badge>
                  ))}
                  {monster.tags.location.map((location, index) => (
                    <Badge key={`location-${index}`} variant="outline" color="gray">
                      {location}
                    </Badge>
                  ))}
                </Group>
              </Paper>

              {/* Stats */}
              <MonsterStatBlock
                hitPoints={monster.hit_points}
                armorClass={monster.armor_class}
                speed={monster.speed}
              />

              {/* Attacks */}
              <MonsterAttacksDisplay attacks={monster.attacks} />

              {/* Abilities */}
              <MonsterAbilitiesDisplay abilities={monster.abilities} />
            </Stack>
          )}
        </Container>
      </Layout>
    </MantineProvider>
  );
}
