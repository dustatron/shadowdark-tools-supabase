"use client";

import { useState, useMemo } from "react";
import {
  Modal,
  Button,
  TextInput,
  SimpleGrid,
  Paper,
  Text,
  ScrollArea,
  Group,
  ActionIcon,
} from "@mantine/core";
import * as TablerIcons from "@tabler/icons-react";
import { IconSearch, IconX } from "@tabler/icons-react";

// Popular monster-related icons for quick access
const POPULAR_ICONS = [
  "IconSword",
  "IconShield",
  "IconSkull",
  "IconFlame",
  "IconBolt",
  "IconHeart",
  "IconStar",
  "IconCrown",
  "IconGhost",
  "IconAlien",
  "IconBug",
  "IconFish",
  "IconPaw",
  "IconFeather",
  "IconMoon",
  "IconSun",
  "IconSnowflake",
  "IconDroplet",
  "IconWind",
  "IconMountain",
  "IconTree",
  "IconHome",
  "IconCastle",
  "IconTower",
  "IconDiamond",
  "IconCoin",
  "IconGem",
  "IconKey",
  "IconLock",
  "IconMagicWand",
];

interface IconSelectorProps {
  value?: string;
  onChange: (iconName: string | null) => void;
  label?: string;
  placeholder?: string;
  error?: string;
}

export function IconSelector({
  value,
  onChange,
  label = "Icon",
  placeholder = "Select an icon",
  error,
}: IconSelectorProps) {
  const [opened, setOpened] = useState(false);
  const [search, setSearch] = useState("");

  // Get all icon names and components
  const allIcons = useMemo(() => {
    return Object.entries(TablerIcons)
      .filter(([name]) => name.startsWith("Icon"))
      .map(([name, component]) => ({
        name,
        component: component as React.ComponentType<{
          size?: number;
          stroke?: number;
        }>,
      }));
  }, []);

  // Filter icons based on search
  const filteredIcons = useMemo(() => {
    if (!search) return allIcons;

    const searchLower = search.toLowerCase();
    return allIcons.filter(({ name }) =>
      name.toLowerCase().includes(searchLower),
    );
  }, [allIcons, search]);

  // Get popular icons
  const popularIcons = useMemo(() => {
    return POPULAR_ICONS.map((iconName) => {
      const icon = allIcons.find(({ name }) => name === iconName);
      return icon;
    }).filter(Boolean);
  }, [allIcons]);

  // Get current icon component
  const CurrentIcon = value
    ? allIcons.find(({ name }) => name === value)?.component
    : null;

  return (
    <>
      <div>
        {label && (
          <Text size="sm" fw={500} mb={4}>
            {label}
          </Text>
        )}
        <Group gap="xs">
          <Button
            variant="default"
            onClick={() => setOpened(true)}
            leftSection={
              CurrentIcon ? <CurrentIcon size={20} stroke={1.5} /> : null
            }
            fullWidth
            styles={{
              root: {
                justifyContent: "flex-start",
              },
            }}
          >
            {value ? value.replace("Icon", "") : placeholder}
          </Button>
          {value && (
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => onChange(null)}
              aria-label="Clear icon"
            >
              <IconX size={16} />
            </ActionIcon>
          )}
        </Group>
        {error && (
          <Text size="xs" c="red" mt={4}>
            {error}
          </Text>
        )}
      </div>

      <Modal
        opened={opened}
        onClose={() => {
          setOpened(false);
          setSearch("");
        }}
        title="Select Icon"
        size="lg"
      >
        <TextInput
          placeholder="Search icons..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          mb="md"
        />

        {!search && (
          <>
            <Text size="sm" fw={500} mb="xs">
              Popular Icons
            </Text>
            <SimpleGrid cols={6} spacing="xs" mb="xl">
              {popularIcons.map((icon) => {
                if (!icon) return null;
                const { name, component: Icon } = icon;
                const isSelected = value === name;

                return (
                  <Paper
                    key={name}
                    p="xs"
                    withBorder
                    style={{
                      cursor: "pointer",
                      backgroundColor: isSelected
                        ? "var(--mantine-color-blue-light)"
                        : undefined,
                      borderColor: isSelected
                        ? "var(--mantine-color-blue-filled)"
                        : undefined,
                    }}
                    onClick={() => {
                      onChange(name);
                      setOpened(false);
                      setSearch("");
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Icon size={24} stroke={1.5} />
                      <Text size="xs" truncate style={{ maxWidth: "100%" }}>
                        {name.replace("Icon", "")}
                      </Text>
                    </div>
                  </Paper>
                );
              })}
            </SimpleGrid>

            <Text size="sm" fw={500} mb="xs">
              All Icons
            </Text>
          </>
        )}

        <ScrollArea h={400}>
          <SimpleGrid cols={6} spacing="xs">
            {filteredIcons.map(({ name, component: Icon }) => {
              const isSelected = value === name;

              return (
                <Paper
                  key={name}
                  p="xs"
                  withBorder
                  style={{
                    cursor: "pointer",
                    backgroundColor: isSelected
                      ? "var(--mantine-color-blue-light)"
                      : undefined,
                    borderColor: isSelected
                      ? "var(--mantine-color-blue-filled)"
                      : undefined,
                  }}
                  onClick={() => {
                    onChange(name);
                    setOpened(false);
                    setSearch("");
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Icon size={24} stroke={1.5} />
                    <Text size="xs" truncate style={{ maxWidth: "100%" }}>
                      {name.replace("Icon", "")}
                    </Text>
                  </div>
                </Paper>
              );
            })}
          </SimpleGrid>
        </ScrollArea>
      </Modal>
    </>
  );
}
