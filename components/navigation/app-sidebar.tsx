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
  Search,
  ChevronDown,
  Skull,
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/src/components/providers/AuthProvider";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";

// Sub-menu item type
interface SubMenuItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresAuth?: boolean;
}

// Category group type
interface CategoryGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: SubMenuItem[];
  defaultOpen?: boolean;
  defaultLink: string; // Link to navigate when collapsed
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { state } = useSidebar();
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

  // Category groups
  const categories: CategoryGroup[] = React.useMemo(
    () => [
      {
        label: "Monsters",
        icon: Skull,
        defaultLink: "/monsters",
        defaultOpen:
          pathname.startsWith("/monsters") ||
          pathname.includes("/dashboard/monsters") ||
          pathname.includes("/favorites/monsters"),
        items: [
          { href: "/monsters", label: "Search", icon: Search },
          {
            href: "/dashboard/monsters",
            label: "Your Monsters",
            icon: Swords,
            requiresAuth: true,
          },
          {
            href: "/dashboard/favorites/monsters",
            label: "Favorites",
            icon: Heart,
            requiresAuth: true,
          },
        ],
      },
      {
        label: "Spells",
        icon: Sparkles,
        defaultLink: "/spells",
        defaultOpen:
          pathname.startsWith("/spells") ||
          pathname.includes("/dashboard/spells") ||
          pathname.includes("/favorites/spells"),
        items: [
          { href: "/spells", label: "Search", icon: Search },
          {
            href: "/dashboard/spells",
            label: "Your Spells",
            icon: Sparkles,
            requiresAuth: true,
          },
          {
            href: "/dashboard/favorites/spells",
            label: "Favorites",
            icon: Heart,
            requiresAuth: true,
          },
        ],
      },
      {
        label: "Encounters",
        icon: Dice6,
        defaultLink: "/encounter-tables",
        defaultOpen:
          pathname.startsWith("/encounter-tables") ||
          pathname.includes("/dashboard/encounters"),
        items: [
          { href: "/encounter-tables", label: "Browse Tables", icon: Search },
          {
            href: "/dashboard/encounters",
            label: "Your Encounters",
            icon: Dice6,
            requiresAuth: true,
          },
        ],
      },
      {
        label: "Decks",
        icon: Library,
        defaultLink: "/dashboard/decks",
        defaultOpen: pathname.includes("/dashboard/decks"),
        items: [
          {
            href: "/dashboard/decks",
            label: "Your Decks",
            icon: Library,
            requiresAuth: true,
          },
        ],
      },
      {
        label: "Account",
        icon: User,
        defaultLink: "/settings",
        defaultOpen:
          pathname.startsWith("/settings") || pathname.startsWith("/users/"),
        items: [
          {
            href: user?.username_slug
              ? `/users/${user.username_slug}`
              : "/settings",
            label: "Profile",
            icon: User,
            requiresAuth: true,
          },
          {
            href: "/settings",
            label: "Settings",
            icon: Settings,
            requiresAuth: true,
          },
        ],
      },
    ],
    [pathname, user],
  );

  // Check if link is active
  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  // Filter category items based on auth
  const filterCategoryItems = (category: CategoryGroup): SubMenuItem[] => {
    return category.items.filter((item) => {
      if (item.requiresAuth && !user) return false;
      return true;
    });
  };

  // Handle category click - navigate if collapsed, toggle if expanded
  const handleCategoryClick = (e: React.MouseEvent, defaultLink: string) => {
    if (state === "collapsed") {
      router.push(defaultLink);
    }
    // If expanded, let CollapsibleTrigger handle the toggle
  };

  // Render collapsible category group
  const renderCategoryGroup = (category: CategoryGroup) => {
    const filteredItems = filterCategoryItems(category);
    if (filteredItems.length === 0) return null;

    return (
      <Collapsible
        key={category.label}
        defaultOpen={category.defaultOpen}
        className="group/collapsible"
      >
        <SidebarGroup>
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                tooltip={category.label}
                onClick={(e) => handleCategoryClick(e, category.defaultLink)}
              >
                <category.icon />
                <span className="group-data-[collapsible=icon]:hidden">
                  {category.label}
                </span>
                <ChevronDown className="ml-auto transition-transform group-data-[collapsible=icon]:hidden group-data-[state=open]/collapsible:rotate-180" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {filteredItems.map((item) => (
                  <SidebarMenuSubItem key={item.href}>
                    <SidebarMenuSubButton
                      asChild
                      isActive={isLinkActive(item.href)}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </SidebarGroup>
      </Collapsible>
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
        {/* Home & About */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isLinkActive("/")}
                tooltip="Home"
              >
                <Link href="/">
                  <Home />
                  <span className="group-data-[collapsible=icon]:hidden">
                    Home
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isLinkActive("/about")}
                tooltip="About"
              >
                <Link href="/about">
                  <Info />
                  <span className="group-data-[collapsible=icon]:hidden">
                    About
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Category Groups */}
        <SidebarMenu>{categories.map(renderCategoryGroup)}</SidebarMenu>

        {/* Admin Section */}
        {user && (user.role === "admin" || user.role === "moderator") && (
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isLinkActive("/admin")}
                  tooltip="Admin"
                >
                  <Link href="/admin">
                    <Shield />
                    <span className="group-data-[collapsible=icon]:hidden">
                      Admin
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* Logout (visible when logged in) */}
        {user && (
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
                  <LogOut />
                  <span className="group-data-[collapsible=icon]:hidden">
                    Logout
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
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
