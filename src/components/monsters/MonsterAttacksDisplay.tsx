"use client";

import {
  Paper,
  Title,
  Stack,
  Text,
  Group,
  Badge,
  Divider,
} from "@mantine/core";
import { IconSword } from "@tabler/icons-react";

interface Attack {
  name: string;
  type: "melee" | "ranged";
  damage: string;
  range: string;
  description?: string;
}

interface MonsterAttacksDisplayProps {
  attacks: Attack[];
}

export function MonsterAttacksDisplay({ attacks }: MonsterAttacksDisplayProps) {
  if (attacks.length === 0) {
    return null;
  }

  return (
    <Paper shadow="sm" p="xl" withBorder>
      <Group gap="xs" mb="md">
        <IconSword size={20} />
        <Title order={3}>Attacks</Title>
      </Group>
      <Stack gap="md">
        {attacks.map((attack, index) => (
          <div key={index}>
            <Group gap="xs" mb="xs">
              <Text fw={600} size="lg">
                {attack.name}
              </Text>
              <Badge size="sm" variant="outline">
                {attack.type}
              </Badge>
            </Group>
            <Group gap="md">
              <Text size="sm" c="dimmed">
                <strong>Damage:</strong> {attack.damage}
              </Text>
              <Text size="sm" c="dimmed">
                <strong>Range:</strong> {attack.range}
              </Text>
            </Group>
            {attack.description && (
              <Text size="sm" mt="xs">
                {attack.description}
              </Text>
            )}
            {index < attacks.length - 1 && <Divider mt="md" />}
          </div>
        ))}
      </Stack>
    </Paper>
  );
}
