"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import Image from "next/image";
import { Navbar, UserMenuItem } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  Swords,
  Sparkles,
  Dice6,
  Heart,
} from "lucide-react";
import { useAuth, UserData } from "@/src/components/providers/AuthProvider";

export function AppNavbar() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, loading, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);

  console.log("AppNavbar - user:", user);
  console.log("AppNavbar - loading:", loading);
  console.log("AppNavbar - mounted:", mounted);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  }, [signOut, router]);

  const getUserInitials = (user: UserData) => {
    if (user.display_name) {
      return user.display_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email.charAt(0).toUpperCase();
  };

  const isAdmin = user?.role === "admin" || user?.role === "moderator";

  // Build user menu items for mobile drawer
  const userMenuItems = useMemo<UserMenuItem[]>(() => {
    if (!user) return [];

    const items: UserMenuItem[] = [
      {
        label: "My Monsters",
        href: "/dashboard/monsters",
        icon: <Swords className="h-4 w-4" />,
      },
      {
        label: "My Spells",
        href: "/dashboard/spells",
        icon: <Sparkles className="h-4 w-4" />,
      },
      {
        label: "Encounters",
        href: "/dashboard/encounters",
        icon: <Dice6 className="h-4 w-4" />,
      },
      {
        label: "Fav Monsters",
        href: "/dashboard/favorites/monsters",
        icon: <Heart className="h-4 w-4" />,
      },
      {
        label: "Fav Spells",
        href: "/dashboard/favorites/spells",
        icon: <Heart className="h-4 w-4" />,
      },
    ];

    // Only show profile link if username_slug exists
    if (user.username_slug) {
      items.push({
        label: "Profile",
        href: `/users/${user.username_slug}`,
        icon: <User className="h-4 w-4" />,
      });
    }

    items.push({
      label: "Settings",
      href: "/settings",
      icon: <Settings className="h-4 w-4" />,
    });

    if (isAdmin) {
      items.push({ separator: true });
      items.push({
        label: "Admin Dashboard",
        href: "/admin",
        icon: <LayoutDashboard className="h-4 w-4" />,
      });
    }

    items.push({ separator: true });
    items.push({
      label: "Logout",
      onClick: handleLogout,
      icon: <LogOut className="h-4 w-4" />,
      destructive: true,
    });

    return items;
  }, [user, isAdmin, handleLogout]);

  // Theme toggle - always visible, separate from auth state
  const renderThemeToggle = () => {
    if (!mounted) return null; // Prevent hydration mismatch

    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          setTheme(theme === "dark" ? "light" : "dark");
          e.currentTarget.blur();
        }}
        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </Button>
    );
  };

  // User menu or sign in button
  const renderAuthContent = () => {
    if (!mounted || loading) {
      return null; // Placeholder during SSR/loading
    }

    return user ? (
      /* Authenticated user menu */
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 px-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getUserInitials(user)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Dashboard</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/monsters"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Swords className="h-4 w-4" />
              My Monsters
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/spells"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              My Spells
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/encounters"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Dice6 className="h-4 w-4" />
              Encounters
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/favorites/monsters"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Heart className="h-4 w-4" />
              Fav Monsters
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/favorites/spells"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Heart className="h-4 w-4" />
              Fav Spells
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Account</DropdownMenuLabel>
          {user.username_slug && (
            <DropdownMenuItem asChild>
              <Link
                href={`/users/${user.username_slug}`}
                className="flex items-center gap-2 cursor-pointer"
              >
                <User className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link
              href="/settings"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>

          {isAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Administration</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link
                  href="/admin"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Admin Dashboard
                </Link>
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ) : (
      /* Guest user - Sign In button */
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/auth/login")}
      >
        Sign In
      </Button>
    );
  };

  // Combine theme toggle + auth content
  const renderRightContent = () => {
    return (
      <div className="flex items-center gap-2">
        {renderThemeToggle()}
        {renderAuthContent()}
      </div>
    );
  };

  // Logo with image and text
  const renderLogo = () => {
    return (
      <div className="flex items-center gap-2">
        <Image
          src="/legend.png"
          alt="Dungeon Exchange"
          width={32}
          height={32}
          className="h-8 w-8"
        />
        <span className="font-bold hidden sm:inline">Dungeon Exchange</span>
      </div>
    );
  };

  return (
    <Navbar
      logo={renderLogo()}
      navigationLinks={[
        { href: "/", label: "Home" },
        { href: "/monsters", label: "Monsters" },
        { href: "/spells", label: "Spells" },
        { href: "/encounter-tables", label: "Encounter Tables" },
        { href: "/about", label: "About" },
      ]}
      userdata={user}
      userMenuItems={userMenuItems}
      signInButton={
        !user
          ? {
              label: "Sign In",
              onClick: () => router.push("/auth/login"),
            }
          : undefined
      }
      themeToggle={renderThemeToggle()}
      rightContent={renderRightContent()}
    />
  );
}
