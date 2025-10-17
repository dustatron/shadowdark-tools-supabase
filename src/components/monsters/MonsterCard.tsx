"use client";

import {
  Card,
  Group,
  Text,
  Badge,
  Stack,
  ActionIcon,
  Menu,
  Tooltip,
  Collapse,
  Button,
  Divider,
  Box,
} from "@mantine/core";
import {
  IconDots,
  IconEdit,
  IconTrash,
  IconEye,
  IconChevronDown,
  IconChevronUp,
  IconHeart,
  IconHeartFilled,
  IconSword,
  IconShield,
  IconRun,
} from "@tabler/icons-react";
import { useState } from "react";
import Link from "next/link";

interface Monster {
  id: string;
  name: string;
  challenge_level: number;
  hit_points: number;
  armor_class: number;
  speed: string;
  attacks: Array<{
    name: string;
    type: "melee" | "ranged";
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
  monster_type?: "official" | "user";
  creator_id?: string;
}

interface MonsterCardProps {
  monster: Monster;
  currentUserId?: string;
  onEdit?: (monster: Monster) => void;
  onDelete?: (monster: Monster) => void;
  onToggleFavorite?: (monster: Monster) => void;
  isFavorited?: boolean;
  showActions?: boolean;
  compact?: boolean;
}

export function MonsterCard({
  monster,
  currentUserId,
  onEdit,
  onDelete,
  onToggleFavorite,
  isFavorited = false,
  showActions = true,
  compact = false,
}: MonsterCardProps) {
  const [expanded, setExpanded] = useState(false);

  const canEdit =
    monster.monster_type === "user" && monster.creator_id === currentUserId;
  const canDelete = canEdit;

  const challengeLevelColor =
    monster.challenge_level <= 3
      ? "green"
      : monster.challenge_level <= 7
        ? "yellow"
        : monster.challenge_level <= 12
          ? "orange"
          : "red";

  return (
    <Card shadow="sm" padding="md" radius="md" withBorder>
      <Stack gap="sm">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <Stack gap="xs" style={{ flex: 1 }}>
            <Group justify="space-between" align="flex-start">
              <div>
                <Text fw={600} size="lg" lineClamp={1}>
                  {monster.name}
                </Text>
                <Group gap="xs" mt={2}>
                  <Badge color={challengeLevelColor} size="sm">
                    Level {monster.challenge_level}
                  </Badge>
                  <Badge variant="outline" size="sm">
                    {monster.source}
                  </Badge>
                  {monster.monster_type === "user" && (
                    <Badge variant="light" color="blue" size="sm">
                      Custom
                    </Badge>
                  )}
                </Group>
              </div>

              {showActions && (
                <Group gap="xs">
                  {onToggleFavorite && (
                    <ActionIcon
                      variant="subtle"
                      color={isFavorited ? "red" : "gray"}
                      onClick={() => onToggleFavorite(monster)}
                    >
                      {isFavorited ? (
                        <IconHeartFilled size={16} />
                      ) : (
                        <IconHeart size={16} />
                      )}
                    </ActionIcon>
                  )}

                  <Menu shadow="md" width={200}>
                    <Menu.Target>
                      <ActionIcon variant="subtle">
                        <IconDots size={16} />
                      </ActionIcon>
                    </Menu.Target>

                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IconEye size={14} />}
                        component={Link}
                        href={`/monsters/${monster.id}`}
                      >
                        View Details
                      </Menu.Item>

                      {canEdit && onEdit && (
                        <Menu.Item
                          leftSection={<IconEdit size={14} />}
                          onClick={() => onEdit(monster)}
                        >
                          Edit Monster
                        </Menu.Item>
                      )}

                      {canDelete && onDelete && (
                        <>
                          <Menu.Divider />
                          <Menu.Item
                            leftSection={<IconTrash size={14} />}
                            color="red"
                            onClick={() => onDelete(monster)}
                          >
                            Delete Monster
                          </Menu.Item>
                        </>
                      )}
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              )}
            </Group>
          </Stack>
        </Group>

        {/* Stats */}
        <Group gap="lg">
          <Tooltip label="Hit Points">
            <Group gap="xs">
              <IconHeart size={16} color="red" />
              <Text size="sm" fw={500}>
                {monster.hit_points}
              </Text>
            </Group>
          </Tooltip>

          <Tooltip label="Armor Class">
            <Group gap="xs">
              <IconShield size={16} color="blue" />
              <Text size="sm" fw={500}>
                {monster.armor_class}
              </Text>
            </Group>
          </Tooltip>

          <Tooltip label="Speed">
            <Group gap="xs">
              <IconRun size={16} color="green" />
              <Text size="sm" fw={500}>
                {monster.speed}
              </Text>
            </Group>
          </Tooltip>
        </Group>

        {/* Tags */}
        <Group gap="xs">
          {monster.tags.type.map((type, index) => (
            <Badge key={`type-${index}`} variant="light" size="xs">
              {type}
            </Badge>
          ))}
          {monster.tags.location.map((location, index) => (
            <Badge
              key={`location-${index}`}
              variant="outline"
              size="xs"
              color="gray"
            >
              {location}
            </Badge>
          ))}
        </Group>

        {/* Expandable Details */}
        {!compact &&
          (monster.attacks.length > 0 || monster.abilities.length > 0) && (
            <>
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
                {expanded ? "Hide Details" : "Show Details"}
              </Button>

              <Collapse in={expanded}>
                <Stack gap="md">
                  {/* Attacks */}
                  {monster.attacks.length > 0 && (
                    <Box>
                      <Group gap="xs" mb="xs">
                        <IconSword size={16} />
                        <Text fw={500} size="sm">
                          Attacks
                        </Text>
                      </Group>
                      <Stack gap="xs">
                        {monster.attacks.map((attack, index) => (
                          <Box key={index} pl="md">
                            <Group gap="xs">
                              <Text size="sm" fw={500}>
                                {attack.name}
                              </Text>
                              <Badge size="xs" variant="outline">
                                {attack.type}
                              </Badge>
                              <Text size="sm" c="dimmed">
                                {attack.damage} ({attack.range})
                              </Text>
                            </Group>
                            {attack.description && (
                              <Text size="xs" c="dimmed" pl="sm">
                                {attack.description}
                              </Text>
                            )}
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* Abilities */}
                  {monster.abilities.length > 0 && (
                    <Box>
                      <Text fw={500} size="sm" mb="xs">
                        Abilities
                      </Text>
                      <Stack gap="xs">
                        {monster.abilities.map((ability, index) => (
                          <Box key={index} pl="md">
                            <Text size="sm" fw={500}>
                              {ability.name}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {ability.description}
                            </Text>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* Author Notes */}
                  {monster.author_notes && (
                    <>
                      <Divider />
                      <Box>
                        <Text fw={500} size="sm" mb="xs">
                          Notes
                        </Text>
                        <Text size="sm" c="dimmed">
                          {monster.author_notes}
                        </Text>
                      </Box>
                    </>
                  )}
                </Stack>
              </Collapse>
            </>
          )}
      </Stack>
    </Card>
  );
}
