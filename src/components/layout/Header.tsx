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
  Tabs,
  Container,
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
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import classes from "./Header.module.css";

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

// Tab configuration
const tabs = [
  { value: "home", label: "Home", path: "/" },
  { value: "monsters", label: "Monsters", path: "/monsters" },
  { value: "spells", label: "Spells", path: "/spells" },
  {
    value: "encounters",
    label: "Encounters",
    path: "/encounters",
    disabled: true,
  },
];

// Active tab detection based on pathname
function getActiveTab(pathname: string): string {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/monsters")) return "monsters";
  if (pathname.startsWith("/spells")) return "spells";
  if (pathname.startsWith("/encounters")) return "encounters";
  // Protected routes and other pages - no tab active
  if (
    pathname.startsWith("/profile") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/admin")
  ) {
    return "";
  }
  return "home"; // Default to home
}

export function Header({
  user,
  onLogout,
  mobileOpened,
  onToggleMobile,
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [userMenuOpened, setUserMenuOpened] = useState(false);

  const isAdmin = user?.role === "admin" || user?.role === "moderator";
  const activeTab = getActiveTab(pathname);

  return (
    <div className={classes.header}>
      <Container className={classes.mainSection} size="xl">
        <Group justify="space-between" h={60}>
          {/* Mobile burger menu */}
          <Burger
            opened={mobileOpened}
            onClick={onToggleMobile}
            hiddenFrom="sm"
            size="sm"
            aria-label="Toggle navigation"
          />

          {/* Logo/Brand */}
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
            <Text size="xl" fw={700} c="shadowdark.2" hiddenFrom="sm">
              Shadowdark
            </Text>
            <Text size="xl" fw={700} c="shadowdark.2" visibleFrom="sm">
              Shadowdark GM Tools
            </Text>
          </Link>

          {/* Center: Tabs Navigation - Hidden on mobile */}
          <Tabs
            value={activeTab}
            onChange={(value) => {
              const tab = tabs.find((t) => t.value === value);
              if (tab && !tab.disabled) {
                router.push(tab.path);
              }
            }}
            variant="outline"
            visibleFrom="sm"
            classNames={{
              root: classes.tabs,
              list: classes.tabsList,
              tab: classes.tab,
            }}
          >
            <Tabs.List>
              {tabs.map((tab) => (
                <Tabs.Tab
                  key={tab.value}
                  value={tab.value}
                  disabled={tab.disabled}
                >
                  {tab.label}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>

          {/* Right side: Theme toggle + User menu */}
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
      </Container>
    </div>
  );
}
