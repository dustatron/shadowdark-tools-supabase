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
  Burger,
} from "@mantine/core";
import {
  IconSun,
  IconMoon,
  IconUser,
  IconSettings,
  IconLogout,
  IconLogin,
  IconDashboard,
} from "@tabler/icons-react";
import { usePathname } from "next/navigation";
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
  mobileOpened?: boolean;
  onToggleMobile?: () => void;
}

export function Header({
  user,
  onLogout,
  mobileOpened,
  onToggleMobile,
}: HeaderProps) {
  const pathname = usePathname();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [userMenuOpened, setUserMenuOpened] = useState(false);

  const isAdmin = user?.role === "admin" || user?.role === "moderator";

  return (
    <Group justify="space-between" h="100%" px="md">
      {/* Mobile burger menu */}
      <Burger
        opened={mobileOpened}
        onClick={onToggleMobile}
        hiddenFrom="sm"
        size="sm"
        aria-label="Toggle navigation"
      />

      {/* Logo/Brand - responsive sizing */}
      <Group>
        <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
          <Text size="xl" fw={700} c="shadowdark.2" hiddenFrom="sm">
            Shadowdark
          </Text>
          <Text size="xl" fw={700} c="shadowdark.2" visibleFrom="sm">
            Shadowdark GM Tools
          </Text>
        </Link>
      </Group>

      {/* Desktop Navigation - hidden on mobile */}
      <Group gap="xs" visibleFrom="sm">
        <Button
          variant={pathname === "/monsters" ? "light" : "subtle"}
          component={Link}
          href="/monsters"
        >
          Monsters
        </Button>
        <Button
          variant={pathname === "/spells" ? "light" : "subtle"}
          component={Link}
          href="/spells"
        >
          Spells
        </Button>
      </Group>

      {/* User actions */}
      <Group gap="xs">
        {/* Theme toggle */}
        <ActionIcon
          variant="subtle"
          size="lg"
          onClick={() => toggleColorScheme()}
          title={`Switch to ${colorScheme === "dark" ? "light" : "dark"} mode`}
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
                  <Avatar size="sm" radius="xl" color="shadowdark">
                    <IconUser size={16} />
                  </Avatar>
                  {/* Hide username on very small screens */}
                  <Text size="sm" fw={500} visibleFrom="xs">
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
          /* Guest user actions - compact on mobile */
          <Button
            variant="subtle"
            leftSection={<IconLogin size={16} />}
            component={Link}
            href="/auth/login"
            size="sm"
          >
            <Text visibleFrom="xs">Login</Text>
          </Button>
        )}
      </Group>
    </Group>
  );
}
