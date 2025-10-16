"use client";

import {
  Card,
  Group,
  Text,
  Badge,
  Stack,
  Collapse,
  Button,
  Box,
} from "@mantine/core";
import {
  IconChevronDown,
  IconChevronUp,
  IconBook,
  IconClock,
  IconUsers,
  IconRuler,
} from "@tabler/icons-react";
import { useState } from "react";
import Link from "next/link";

interface Spell {
  id: string;
  name: string;
  slug: string;
  description: string;
  classes: string[];
  duration: string;
  range: string;
  tier: number;
  source: string;
  author_notes?: string;
  spell_type?: "official" | "user";
  creator_id?: string;
}

interface SpellCardProps {
  spell: Spell;
}

export function SpellCard({ spell }: SpellCardProps) {
  const [expanded, setExpanded] = useState(false);

  const tierColor =
    spell.tier <= 1
      ? "gray"
      : spell.tier <= 2
        ? "blue"
        : spell.tier <= 3
          ? "grape"
          : spell.tier <= 4
            ? "red"
            : "dark";

  return (
    <Card shadow="sm" padding="md" radius="md" withBorder>
      <Stack gap="sm">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <Stack gap="xs" style={{ flex: 1 }}>
            <Link
              href={`/spells/${spell.slug}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Text fw={600} size="lg" lineClamp={1}>
                {spell.name}
              </Text>
            </Link>
            <Group gap="xs" mt={2}>
              <Badge color={tierColor} size="sm">
                Tier {spell.tier}
              </Badge>
              <Badge variant="outline" size="sm">
                {spell.source}
              </Badge>
            </Group>
          </Stack>
        </Group>

        {/* Stats */}
        <Group gap="lg">
          <Group gap="xs">
            <IconUsers size={16} />
            <Text size="sm" fw={500}>
              {spell.classes.join(", ")}
            </Text>
          </Group>
          <Group gap="xs">
            <IconClock size={16} />
            <Text size="sm" fw={500}>
              {spell.duration}
            </Text>
          </Group>
          <Group gap="xs">
            <IconRuler size={16} />
            <Text size="sm" fw={500}>
              {spell.range}
            </Text>
          </Group>
        </Group>

        {/* Expandable Details */}
        <Button
          variant="subtle"
          size="xs"
          rightSection={
            expanded ? (
              <IconChevronUp size={14} />
            ) : (
              <IconChevronDown size={14} />
            )
          }
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Hide Description" : "Show Description"}
        </Button>

        <Collapse in={expanded}>
          <Stack gap="md">
            <Box>
              <Group gap="xs" mb="xs">
                <IconBook size={16} />
                <Text fw={500} size="sm">
                  Description
                </Text>
              </Group>
              <Text size="sm" c="dimmed">
                {spell.description}
              </Text>
            </Box>
            {spell.author_notes && (
              <Box>
                <Text fw={500} size="sm" mb="xs">
                  Notes
                </Text>
                <Text size="sm" c="dimmed">
                  {spell.author_notes}
                </Text>
              </Box>
            )}
          </Stack>
        </Collapse>
      </Stack>
    </Card>
  );
}
