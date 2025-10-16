"use client";

import { Paper, Group, Text, Grid, Badge } from "@mantine/core";
import { IconUsers, IconClock, IconRuler, IconStar } from "@tabler/icons-react";

interface SpellDetailBlockProps {
  tier: number;
  classes: string[];
  duration: string;
  range: string;
}

export function SpellDetailBlock({
  tier,
  classes,
  duration,
  range,
}: SpellDetailBlockProps) {
  const tierColor =
    tier <= 1
      ? "gray"
      : tier <= 2
        ? "blue"
        : tier <= 3
          ? "grape"
          : tier <= 4
            ? "red"
            : "dark";

  return (
    <Paper shadow="sm" p="xl" withBorder>
      <Grid>
        <Grid.Col span={{ base: 12, sm: 3 }}>
          <Group gap="md">
            <IconStar size={24} color={tierColor} />
            <div>
              <Text size="xs" c="dimmed" tt="uppercase">
                Tier
              </Text>
              <Text size="xl" fw={700}>
                {tier}
              </Text>
            </div>
          </Group>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 3 }}>
          <Group gap="md">
            <IconUsers size={24} />
            <div>
              <Text size="xs" c="dimmed" tt="uppercase">
                Classes
              </Text>
              <Text size="lg" fw={500}>
                {classes.join(", ")}
              </Text>
            </div>
          </Group>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 3 }}>
          <Group gap="md">
            <IconClock size={24} />
            <div>
              <Text size="xs" c="dimmed" tt="uppercase">
                Duration
              </Text>
              <Text size="lg" fw={500}>
                {duration}
              </Text>
            </div>
          </Group>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 3 }}>
          <Group gap="md">
            <IconRuler size={24} />
            <div>
              <Text size="xs" c="dimmed" tt="uppercase">
                Range
              </Text>
              <Text size="lg" fw={500}>
                {range}
              </Text>
            </div>
          </Group>
        </Grid.Col>
      </Grid>
    </Paper>
  );
}
