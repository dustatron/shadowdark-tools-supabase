"use client";

import {
  Group,
  Button,
  Text,
  Menu,
  Avatar,
  UnstyledButton,
  ActionIcon,
  useMantineColorScheme,
} from "@mantine/core";
import {
  IconSun,
  IconMoon,
  IconUser,
  IconSettings,
  IconLogout,
  IconLogin,
  IconUserPlus,
  IconDashboard,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

interface User {
  id: string;
  email: string;
  display_name?: string;
  role?: string;
}

interface HeaderProps {
  user?: User | null;
  onLogout?: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  const router = useRouter();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [userMenuOpened, setUserMenuOpened] = useState(false);

  const isAdmin = user?.role === "admin" || user?.role === "moderator";

  return (
    <Group justify="space-between" h="100%" px="md">
      {/* Logo/Brand */}
      <Group>
        <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
          <Text size="xl" fw={700} c="shadowdark.8">
            Shadowdark Monster Manager
          </Text>
        </Link>
      </Group>

      {/* Navigation */}
      <Group>
        <Button variant="subtle" component={Link} href="/monsters">
          Monsters
        </Button>
        <Button variant="subtle" component={Link} href="/spells">
          Spells
        </Button>
        {/* <Button variant="subtle" component={Link} href="/encounters">
          Encounters
        </Button>
        <Button variant="subtle" component={Link} href="/lists">
          Lists
        </Button> */}
      </Group>

      {/* User actions */}
      <Group>
        {/* Theme toggle */}
        <ActionIcon
          variant="subtle"
          size="lg"
          onClick={() => toggleColorScheme()}
          title="Toggle color scheme"
        >
          {colorScheme === "dark" ? (
            <IconSun size={18} />
          ) : (
            <IconMoon size={18} />
          )}
        </ActionIcon>

        {user ? (
          /* Authenticated user menu */
          <Menu
            width={200}
            position="bottom-end"
            opened={userMenuOpened}
            onChange={setUserMenuOpened}
          >
            <Menu.Target>
              <UnstyledButton>
                <Group gap="xs">
                  <Avatar size="sm" radius="xl">
                    <IconUser size={16} />
                  </Avatar>
                  <Text size="sm" fw={500}>
                    {user.display_name || user.email}
                  </Text>
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Account</Menu.Label>
              <Menu.Item
                leftSection={<IconUser size={14} />}
                component={Link}
                href="/profile"
              >
                Profile
              </Menu.Item>
              <Menu.Item
                leftSection={<IconSettings size={14} />}
                component={Link}
                href="/settings"
              >
                Settings
              </Menu.Item>

              {isAdmin && (
                <>
                  <Menu.Divider />
                  <Menu.Label>Administration</Menu.Label>
                  <Menu.Item
                    leftSection={<IconDashboard size={14} />}
                    component={Link}
                    href="/admin"
                  >
                    Admin Dashboard
                  </Menu.Item>
                </>
              )}

              <Menu.Divider />
              <Menu.Item
                leftSection={<IconLogout size={14} />}
                onClick={onLogout}
                color="red"
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        ) : (
          /* Guest user actions */
          <Group>
            <Button
              variant="subtle"
              leftSection={<IconLogin size={16} />}
              component={Link}
              href="/auth/login"
            >
              Login
            </Button>
          </Group>
        )}
      </Group>
    </Group>
  );
}
