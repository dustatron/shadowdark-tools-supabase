"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Container,
  Paper,
  Title,
  Group,
  Badge,
  Stack,
  Text,
  Button,
  LoadingOverlay,
  Alert,
  Modal,
  Menu,
  ActionIcon,
} from "@mantine/core";
import { MonsterStatBlock } from "@/src/components/monsters/MonsterStatBlock";
import { MonsterAttacksDisplay } from "@/src/components/monsters/MonsterAttacksDisplay";
import { MonsterAbilitiesDisplay } from "@/src/components/monsters/MonsterAbilitiesDisplay";
import { MonsterOwnershipCard } from "@/src/components/monsters/MonsterOwnershipCard";
import {
  IconArrowLeft,
  IconAlertCircle,
  IconEdit,
  IconTrash,
  IconDots,
  IconCopy,
} from "@tabler/icons-react";
import Link from "next/link";
import { notifications } from "@mantine/notifications";
import { createClient } from "@/lib/supabase/client";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

interface Author {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

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
  monster_type?: "official" | "user" | "custom";
  creator_id?: string;
  user_id?: string;
  is_public?: boolean;
  author?: Author | null;
  created_at?: string;
  updated_at?: string;
}

export default function MonsterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const monsterId = params?.id as string;

  const [monster, setMonster] = useState<Monster | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (monsterId) {
      fetchMonster();
      checkCurrentUser();
    }
  }, [monsterId]);

  const checkCurrentUser = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const fetchMonster = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/monsters/${monsterId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError("Monster not found");
        } else {
          setError("Failed to load monster");
        }
        return;
      }

      const data = await response.json();
      setMonster(data);
    } catch (err) {
      console.error("Error fetching monster:", err);
      setError("An error occurred while loading the monster");
    } finally {
      setLoading(false);
    }
  };

  const challengeLevelColor = monster
    ? monster.challenge_level <= 3
      ? "green"
      : monster.challenge_level <= 7
        ? "yellow"
        : monster.challenge_level <= 12
          ? "orange"
          : "red"
    : "gray";

  const handleDelete = async () => {
    if (!monster) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/monsters/${monsterId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete monster");
      }

      notifications.show({
        title: "Success",
        message: "Monster deleted successfully",
        color: "green",
      });

      router.push("/monsters");
    } catch (err) {
      console.error("Error deleting monster:", err);
      notifications.show({
        title: "Error",
        message: "Failed to delete monster",
        color: "red",
      });
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  const handleDuplicate = async () => {
    if (!monster) return;

    // Check if user is logged in
    if (!currentUser) {
      // Redirect to login page
      router.push("/auth/login");
      return;
    }

    try {
      // Create a copy of the monster without the ID
      const { id, user_id, ...monsterData } = monster;
      const duplicateData = {
        ...monsterData,
        name: `${monster.name} (Copy)`,
        is_public: false,
      };

      const response = await fetch("/api/monsters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(duplicateData),
      });

      if (!response.ok) {
        throw new Error("Failed to duplicate monster");
      }

      const newMonster = await response.json();

      notifications.show({
        title: "Success",
        message: "Monster duplicated successfully",
        color: "green",
      });

      router.push(`/monsters/${newMonster.id}`);
    } catch (err) {
      console.error("Error duplicating monster:", err);
      notifications.show({
        title: "Error",
        message: "Failed to duplicate monster",
        color: "red",
      });
    }
  };

  const handleToggleVisibility = async () => {
    if (!monster || !isOwner) return;

    try {
      const response = await fetch(`/api/monsters/${monsterId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_public: !monster.is_public,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update visibility");
      }

      const updatedMonster = await response.json();
      setMonster(updatedMonster);

      notifications.show({
        title: "Success",
        message: `Monster is now ${updatedMonster.is_public ? "public" : "private"}`,
        color: "green",
      });
    } catch (err) {
      console.error("Error toggling visibility:", err);
      notifications.show({
        title: "Error",
        message: "Failed to update monster visibility",
        color: "red",
      });
    }
  };

  const isOwner = currentUser && monster && monster.user_id === currentUser.id;

  return (
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
                  {monster.monster_type === "user" && (
                    <Badge variant="light" color="blue" size="lg">
                      Custom
                    </Badge>
                  )}
                  {monster.is_public && (
                    <Badge variant="light" color="green" size="lg">
                      Public
                    </Badge>
                  )}
                </Group>
              </div>

              {/* Action Menu */}
              <Menu position="bottom-end" withinPortal>
                <Menu.Target>
                  <ActionIcon variant="subtle" color="gray">
                    <IconDots size={20} />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  {isOwner && (
                    <>
                      <Menu.Item
                        leftSection={<IconEdit size={16} />}
                        component={Link}
                        href={`/monsters/${monsterId}/edit`}
                      >
                        Edit Monster
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconTrash size={16} />}
                        color="red"
                        onClick={() => setDeleteModalOpen(true)}
                      >
                        Delete Monster
                      </Menu.Item>
                      <Menu.Divider />
                    </>
                  )}
                  <Menu.Item
                    leftSection={<IconCopy size={16} />}
                    onClick={handleDuplicate}
                  >
                    Duplicate Monster
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
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

          {/* Ownership/Author Card */}
          <MonsterOwnershipCard
            monsterId={monster.id}
            monsterName={monster.name}
            monsterType={monster.monster_type || "official"}
            isPublic={monster.is_public || false}
            author={monster.author || null}
            isOwner={isOwner}
            createdAt={monster.created_at}
            updatedAt={monster.updated_at}
            onDelete={() => setDeleteModalOpen(true)}
            onDuplicate={handleDuplicate}
            onToggleVisibility={
              isOwner &&
              (monster.monster_type === "user" ||
                monster.monster_type === "custom")
                ? handleToggleVisibility
                : undefined
            }
          />
        </Stack>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Monster"
        centered
      >
        <Text mb="lg">
          Are you sure you want to delete &quot;{monster?.name}&quot;? This
          action cannot be undone.
        </Text>
        <Group justify="flex-end">
          <Button variant="subtle" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDelete} loading={isDeleting}>
            Delete Monster
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}
