"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Swords,
  Sparkles,
  Dice6,
  Info,
  User,
  Settings,
  LogOut,
  Heart,
  Shield,
  LayoutDashboard,
  Sun,
  Moon,
  Library,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/src/components/providers/AuthProvider";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";

// Navigation link type
interface NavigationLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  external?: boolean;
}

// User menu item type
interface UserMenuItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon: React.ComponentType<{ className?: string }>;
  groupLabel?: string;
  requiresRole?: "admin" | "moderator";
  condition?: (user: any) => boolean;
}

// Public navigation links (always visible)
const publicLinks: NavigationLink[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/monsters", label: "Monsters", icon: Swords },
  { href: "/spells", label: "Spells", icon: Sparkles },
  { href: "/encounter-tables", label: "Encounter Tables", icon: Dice6 },
  { href: "/about", label: "About", icon: Info },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Handle logout
  const handleLogout = React.useCallback(async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  }, [signOut, router]);

  // Dashboard menu items (authenticated users only)
  const dashboardItems: UserMenuItem[] = React.useMemo(() => {
    if (!user) return [];
    return [
      {
        label: "My Monsters",
        href: "/dashboard/monsters",
        icon: Swords,
        groupLabel: "Dashboard",
      },
      {
        label: "My Spells",
        href: "/dashboard/spells",
        icon: Sparkles,
        groupLabel: "Dashboard",
      },
      {
        label: "Decks",
        href: "/dashboard/decks",
        icon: Library,
        groupLabel: "Dashboard",
      },
      {
        label: "Encounters",
        href: "/dashboard/encounters",
        icon: Dice6,
        groupLabel: "Dashboard",
      },
      {
        label: "Fav Monsters",
        href: "/dashboard/favorites/monsters",
        icon: Heart,
        groupLabel: "Dashboard",
      },
      {
        label: "Fav Spells",
        href: "/dashboard/favorites/spells",
        icon: Heart,
        groupLabel: "Dashboard",
      },
    ];
  }, [user]);

  // Account menu items (authenticated users only)
  const accountItems: UserMenuItem[] = React.useMemo(() => {
    if (!user) return [];
    return [
      {
        label: "Profile",
        href: user.username_slug ? `/users/${user.username_slug}` : "/settings",
        icon: User,
        groupLabel: "Account",
      },
      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
        groupLabel: "Account",
      },
      {
        label: "Logout",
        onClick: handleLogout,
        icon: LogOut,
        groupLabel: "Account",
      },
    ];
  }, [user, handleLogout]);

  // Admin menu items (admin/moderator only)
  const adminItems: UserMenuItem[] = React.useMemo(() => {
    if (!user || (user.role !== "admin" && user.role !== "moderator"))
      return [];
    return [
      {
        label: "Admin Dashboard",
        href: "/admin",
        icon: Shield,
        groupLabel: "Administration",
        requiresRole: "admin",
      },
    ];
  }, [user]);

  // Filter menu items based on conditions
  const filterMenuItems = (items: UserMenuItem[]) => {
    return items.filter((item) => {
      if (
        item.requiresRole &&
        user?.role !== item.requiresRole &&
        user?.role !== "moderator"
      ) {
        return false;
      }
      if (item.condition && !item.condition(user)) {
        return false;
      }
      return true;
    });
  };

  // Check if link is active
  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  // Render menu group
  const renderMenuGroup = (items: UserMenuItem[], label: string) => {
    const filteredItems = filterMenuItems(items);
    if (filteredItems.length === 0) return null;

    return (
      <SidebarGroup>
        <SidebarGroupLabel>{label}</SidebarGroupLabel>
        <SidebarMenu>
          {filteredItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              {item.href ? (
                <SidebarMenuButton
                  asChild
                  isActive={isLinkActive(item.href)}
                  aria-current={isLinkActive(item.href) ? "page" : undefined}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span className="group-data-[collapsible=icon]:hidden">
                      {item.label}
                    </span>
                  </Link>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton onClick={item.onClick} tooltip={item.label}>
                  <item.icon />
                  <span className="group-data-[collapsible=icon]:hidden">
                    {item.label}
                  </span>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    );
  };

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between gap-2 px-2 py-2">
          <div className="flex items-center gap-2">
            <Image
              src="/legend.png"
              alt="Dungeon Exchange"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="font-bold text-sm group-data-[collapsible=icon]:hidden">
              Dungeon Exchange
            </span>
          </div>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* Public Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {publicLinks.map((link) => (
              <SidebarMenuItem key={link.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isLinkActive(link.href)}
                  aria-current={isLinkActive(link.href) ? "page" : undefined}
                  tooltip={link.label}
                >
                  <Link
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                  >
                    <link.icon />
                    <span className="group-data-[collapsible=icon]:hidden">
                      {link.label}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Authenticated User Sections */}
        {user && (
          <>
            {renderMenuGroup(dashboardItems, "Dashboard")}
            {renderMenuGroup(accountItems, "Account")}
            {renderMenuGroup(adminItems, "Administration")}
          </>
        )}

        {/* Guest Sign In */}
        {!user && !loading && (
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Sign In">
                  <Link href="/auth/login">
                    <User />
                    <span className="group-data-[collapsible=icon]:hidden">
                      Sign In
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        {/* Theme Toggle */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full justify-start group-data-[collapsible=icon]:justify-center"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <>
                <Sun className="h-4 w-4 mr-2 group-data-[collapsible=icon]:mr-0" />
                <span className="group-data-[collapsible=icon]:hidden">
                  Light Mode
                </span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 mr-2 group-data-[collapsible=icon]:mr-0" />
                <span className="group-data-[collapsible=icon]:hidden">
                  Dark Mode
                </span>
              </>
            )}
          </Button>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
