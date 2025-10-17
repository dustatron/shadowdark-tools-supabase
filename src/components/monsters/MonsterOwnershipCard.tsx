"use client";

import {
  Paper,
  Group,
  Text,
  Avatar,
  Badge,
  Button,
  Stack,
  Divider,
} from "@mantine/core";
import {
  IconEdit,
  IconTrash,
  IconEye,
  IconEyeOff,
  IconCopy,
  IconUser,
} from "@tabler/icons-react";
import Link from "next/link";

interface Author {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface MonsterOwnershipCardProps {
  monsterId: string;
  monsterName: string;
  monsterType: "official" | "user" | "custom";
  isPublic: boolean;
  author: Author | null;
  isOwner: boolean;
  createdAt?: string;
  updatedAt?: string;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleVisibility?: () => void;
}

export function MonsterOwnershipCard({
  monsterId,
  monsterName,
  monsterType,
  isPublic,
  author,
  isOwner,
  createdAt,
  updatedAt,
  onDelete,
  onDuplicate,
  onToggleVisibility,
}: MonsterOwnershipCardProps) {
  const isCustomMonster = monsterType === "user" || monsterType === "custom";
  const isOfficialMonster = monsterType === "official";

  // Format dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Paper shadow="sm" p="xl" withBorder>
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Text size="lg" fw={600} mb="xs">
              {isOwner ? "Your Monster" : "Monster Information"}
            </Text>
            {isOfficialMonster && (
              <Text size="sm" c="dimmed">
                Official Shadowdark content
              </Text>
            )}
          </div>
          <Badge
            variant={isOwner ? "filled" : "light"}
            color={isOwner ? "blue" : "gray"}
            size="lg"
          >
            {isOfficialMonster
              ? "Official"
              : isOwner
                ? "Owned"
                : isPublic
                  ? "Community"
                  : "Private"}
          </Badge>
        </Group>

        {/* Author Information */}
        {isCustomMonster && author && (
          <>
            <Divider />
            <Group gap="md">
              <Avatar
                src={author.avatar_url}
                alt={author.display_name || "User"}
                radius="xl"
                size="md"
              >
                <IconUser size={20} />
              </Avatar>
              <div>
                <Text size="sm" c="dimmed">
                  Created by
                </Text>
                <Text size="md" fw={500}>
                  {author.display_name || "Anonymous"}
                </Text>
              </div>
            </Group>
          </>
        )}

        {/* Dates */}
        {isCustomMonster && (createdAt || updatedAt) && (
          <Group gap="xl">
            {createdAt && (
              <div>
                <Text size="xs" c="dimmed">
                  Created
                </Text>
                <Text size="sm">{formatDate(createdAt)}</Text>
              </div>
            )}
            {updatedAt && updatedAt !== createdAt && (
              <div>
                <Text size="xs" c="dimmed">
                  Last Updated
                </Text>
                <Text size="sm">{formatDate(updatedAt)}</Text>
              </div>
            )}
          </Group>
        )}

        {/* Action Buttons */}
        {isOwner && isCustomMonster && (
          <>
            <Divider />
            <Group gap="sm">
              <Button
                component={Link}
                href={`/monsters/${monsterId}/edit`}
                leftSection={<IconEdit size={16} />}
                variant="filled"
              >
                Edit Monster
              </Button>
              {onToggleVisibility && (
                <Button
                  onClick={onToggleVisibility}
                  leftSection={
                    isPublic ? <IconEyeOff size={16} /> : <IconEye size={16} />
                  }
                  variant="light"
                >
                  {isPublic ? "Make Private" : "Make Public"}
                </Button>
              )}
              <Button
                onClick={onDelete}
                leftSection={<IconTrash size={16} />}
                color="red"
                variant="light"
              >
                Delete
              </Button>
            </Group>
          </>
        )}

        {/* Duplicate button for non-owners */}
        {!isOwner && (
          <>
            <Divider />
            <Button
              onClick={onDuplicate}
              leftSection={<IconCopy size={16} />}
              variant="light"
              fullWidth
            >
              Duplicate to My Collection
            </Button>
          </>
        )}
      </Stack>
    </Paper>
  );
}
