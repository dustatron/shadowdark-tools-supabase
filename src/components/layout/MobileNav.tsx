"use client";

import { Drawer, Stack, NavLink, Divider, Text } from "@mantine/core";
import {
  IconSword,
  IconWand,
  IconUser,
  IconSettings,
  IconDashboard,
  IconLogout,
} from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  display_name?: string;
  role?: string;
}

interface MobileNavProps {
  opened: boolean;
  onClose: () => void;
  user?: User | null;
  onLogout?: () => void;
}

export function MobileNav({ opened, onClose, user, onLogout }: MobileNavProps) {
  const pathname = usePathname();
  const isAdmin = user?.role === "admin" || user?.role === "moderator";

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      size="xs"
      padding="md"
      title={
        <Text size="lg" fw={700} c="shadowdark.2">
          Shadowdark GM Tools
        </Text>
      }
      hiddenFrom="sm"
    >
      <Stack gap="xs">
        {/* Main Navigation */}
        <NavLink
          label="Monsters"
          leftSection={<IconSword size={20} />}
          href="/monsters"
          component={Link}
          active={pathname === "/monsters"}
          onClick={onClose}
        />
        <NavLink
          label="Spells"
          leftSection={<IconWand size={20} />}
          href="/spells"
          component={Link}
          active={pathname === "/spells"}
          onClick={onClose}
        />

        {user && (
          <>
            <Divider my="sm" label="Account" labelPosition="center" />

            <NavLink
              label="Profile"
              leftSection={<IconUser size={20} />}
              href="/profile"
              component={Link}
              active={pathname === "/profile"}
              onClick={onClose}
            />
            <NavLink
              label="Settings"
              leftSection={<IconSettings size={20} />}
              href="/settings"
              component={Link}
              active={pathname === "/settings"}
              onClick={onClose}
            />

            {isAdmin && (
              <>
                <Divider my="sm" label="Admin" labelPosition="center" />
                <NavLink
                  label="Dashboard"
                  leftSection={<IconDashboard size={20} />}
                  href="/admin"
                  component={Link}
                  active={pathname === "/admin"}
                  onClick={onClose}
                />
              </>
            )}

            <Divider my="sm" />

            <NavLink
              label="Logout"
              leftSection={<IconLogout size={20} />}
              onClick={() => {
                onLogout?.();
                onClose();
              }}
              color="red"
            />
          </>
        )}
      </Stack>
    </Drawer>
  );
}
