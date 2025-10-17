import {
  Card,
  Text,
  Button,
  Group,
  Container,
  Stack,
  SimpleGrid,
} from "@mantine/core";
import { IconSword, IconWand, IconDice } from "@tabler/icons-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home | Shadowdark GM Tools",
  description:
    "Shadowdark GM Tools - Your complete toolkit for running Shadowdark RPG sessions. Browse monsters, search spells, and create balanced encounters for your campaigns.",
  openGraph: {
    title: "Shadowdark GM Tools - Complete GM Toolkit for Shadowdark RPG",
    description:
      "Browse official monsters and spells, create custom content, and build balanced encounters for your Shadowdark RPG campaigns.",
  },
};

export default function Home() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {/* Hero Section */}
        <Stack gap="md" align="center" ta="center">
          <Text size="3rem" fw={800} lh={1.2}>
            Shadowdark GM Tools
          </Text>
          <Text size="xl" c="dimmed" maw={600}>
            Manage your monsters, create encounters, and organize your campaigns
            for Shadowdark RPG
          </Text>
        </Stack>

        {/* Feature Cards */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg" mt="xl">
          <Card
            component={Link}
            href="/monsters"
            style={{ textDecoration: "none", height: "100%" }}
            p="lg"
          >
            <Stack gap="md" h="100%">
              <Group>
                <IconSword
                  size={32}
                  stroke={1.5}
                  color="var(--mantine-color-shadowdark-5)"
                />
                <Text size="xl" fw={700}>
                  Monsters
                </Text>
              </Group>
              <Text size="sm" c="dimmed">
                Access a comprehensive database of official Shadowdark monsters.
                Search, filter by challenge level, and create your own custom
                monsters.
              </Text>
              <Button variant="light" fullWidth mt="auto">
                Browse Monsters
              </Button>
            </Stack>
          </Card>

          <Card
            component={Link}
            href="/spells"
            style={{ textDecoration: "none", height: "100%" }}
            p="lg"
          >
            <Stack gap="md" h="100%">
              <Group>
                <IconWand
                  size={32}
                  stroke={1.5}
                  color="var(--mantine-color-magic-5)"
                />
                <Text size="xl" fw={700}>
                  Spells
                </Text>
              </Group>
              <Text size="sm" c="dimmed">
                Browse the complete spell database for Shadowdark. Filter by
                tier, class, and search by name or description.
              </Text>
              <Button variant="light" fullWidth mt="auto">
                Browse Spells
              </Button>
            </Stack>
          </Card>

          <Card p="lg" style={{ height: "100%", opacity: 0.6 }}>
            <Stack gap="md" h="100%">
              <Group>
                <IconDice
                  size={32}
                  stroke={1.5}
                  color="var(--mantine-color-treasure-5)"
                />
                <Text size="xl" fw={700}>
                  Encounters
                </Text>
              </Group>
              <Text size="sm" c="dimmed">
                Create balanced encounters for your party. Roll on encounter
                tables or build custom encounters with your monster collection.
              </Text>
              <Button variant="light" fullWidth mt="auto" disabled>
                Coming Soon
              </Button>
            </Stack>
          </Card>
        </SimpleGrid>

        {/* CTA Section */}
        <Stack gap="md" align="center" ta="center" mt="xl">
          <Text size="2rem" fw={700}>
            Get Started
          </Text>
          <Text c="dimmed" maw={600}>
            Start by browsing the monster database, or sign up to create custom
            monsters and manage your own campaigns.
          </Text>
          <Group justify="center" mt="md">
            <Button size="lg" component={Link} href="/monsters">
              Explore Monsters
            </Button>
            <Button
              size="lg"
              variant="light"
              component={Link}
              href="/auth/sign-up"
            >
              Create Account
            </Button>
          </Group>
        </Stack>
      </Stack>
    </Container>
  );
}
