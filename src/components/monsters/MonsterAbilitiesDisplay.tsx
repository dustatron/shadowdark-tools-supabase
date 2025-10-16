'use client';

import { Paper, Title, Stack, Text, Divider } from '@mantine/core';

interface Ability {
  name: string;
  description: string;
}

interface MonsterAbilitiesDisplayProps {
  abilities: Ability[];
  title?: string;
}

export function MonsterAbilitiesDisplay({
  abilities,
  title = 'Special Abilities'
}: MonsterAbilitiesDisplayProps) {
  if (abilities.length === 0) {
    return null;
  }

  return (
    <Paper shadow="sm" p="xl" withBorder>
      <Title order={3} mb="md">
        {title}
      </Title>
      <Stack gap="md">
        {abilities.map((ability, index) => (
          <div key={index}>
            <Text fw={600} size="lg" mb="xs">
              {ability.name}
            </Text>
            <Text size="sm">{ability.description}</Text>
            {index < abilities.length - 1 && <Divider mt="md" />}
          </div>
        ))}
      </Stack>
    </Paper>
  );
}
