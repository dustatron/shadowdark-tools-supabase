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
} from "@mantine/core";
import { SpellDetailBlock } from "@/src/components/spells/SpellDetailBlock";
import { IconArrowLeft, IconAlertCircle } from "@tabler/icons-react";
import Link from "next/link";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

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
}

export default function SpellDetailPage() {
  const params = useParams();
  const router = useRouter();
  const spellSlug = params?.slug as string;

  const [spell, setSpell] = useState<Spell | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (spellSlug) {
      fetchSpell();
    }
  }, [spellSlug]);

  const fetchSpell = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/spells/${spellSlug}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError("Spell not found");
        } else {
          setError("Failed to load spell");
        }
        return;
      }

      const data = await response.json();
      setSpell(data);
    } catch (err) {
      console.error("Error fetching spell:", err);
      setError("An error occurred while loading the spell");
    } finally {
      setLoading(false);
    }
  };

  const tierColor = spell
    ? spell.tier <= 1
      ? "gray"
      : spell.tier <= 2
        ? "blue"
        : spell.tier <= 3
          ? "grape"
          : spell.tier <= 4
            ? "red"
            : "dark"
    : "gray";

  return (
    <Container size="lg" py="xl">
      <Button
        component={Link}
        href="/spells"
        variant="subtle"
        leftSection={<IconArrowLeft size={16} />}
        mb="xl"
      >
        Back to Spells
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

      {spell && !loading && !error && (
        <Stack gap="lg">
          <Paper shadow="sm" p="xl" withBorder>
            <Group justify="space-between" align="flex-start" mb="md">
              <div>
                <Title order={1} mb="sm">
                  {spell.name}
                </Title>
                <Group gap="xs">
                  <Badge color={tierColor} size="lg">
                    Tier {spell.tier}
                  </Badge>
                  <Badge variant="outline" size="lg">
                    {spell.source}
                  </Badge>
                </Group>
              </div>
            </Group>

            <Text size="md" c="dimmed" mb="lg">
              {spell.description}
            </Text>
          </Paper>

          <SpellDetailBlock
            tier={spell.tier}
            classes={spell.classes}
            duration={spell.duration}
            range={spell.range}
          />
        </Stack>
      )}
    </Container>
  );
}
