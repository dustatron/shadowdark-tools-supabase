'use client';

import { Paper, Group, Text, Grid } from '@mantine/core';
import { IconHeart, IconShield, IconRun } from '@tabler/icons-react';

interface MonsterStatBlockProps {
  hitPoints: number;
  armorClass: number;
  speed: string;
  compact?: boolean;
}

export function MonsterStatBlock({
  hitPoints,
  armorClass,
  speed,
  compact = false
}: MonsterStatBlockProps) {
  if (compact) {
    return (
      <Group gap="lg">
        <Group gap="xs">
          <IconHeart size={16} color="red" />
          <Text size="sm" fw={500}>
            {hitPoints}
          </Text>
        </Group>
        <Group gap="xs">
          <IconShield size={16} color="blue" />
          <Text size="sm" fw={500}>
            {armorClass}
          </Text>
        </Group>
        <Group gap="xs">
          <IconRun size={16} color="green" />
          <Text size="sm" fw={500}>
            {speed}
          </Text>
        </Group>
      </Group>
    );
  }

  return (
    <Paper shadow="sm" p="xl" withBorder>
      <Grid>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Group gap="md">
            <IconHeart size={24} color="red" />
            <div>
              <Text size="xs" c="dimmed" tt="uppercase">
                Hit Points
              </Text>
              <Text size="xl" fw={700}>
                {hitPoints}
              </Text>
            </div>
          </Group>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Group gap="md">
            <IconShield size={24} color="blue" />
            <div>
              <Text size="xs" c="dimmed" tt="uppercase">
                Armor Class
              </Text>
              <Text size="xl" fw={700}>
                {armorClass}
              </Text>
            </div>
          </Group>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Group gap="md">
            <IconRun size={24} color="green" />
            <div>
              <Text size="xs" c="dimmed" tt="uppercase">
                Speed
              </Text>
              <Text size="xl" fw={700}>
                {speed}
              </Text>
            </div>
          </Group>
        </Grid.Col>
      </Grid>
    </Paper>
  );
}
