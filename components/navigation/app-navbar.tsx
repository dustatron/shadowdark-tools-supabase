"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
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

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

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

  // Custom rendering for auth buttons with theme toggle (desktop)
  const renderRightContent = () => {
    if (!mounted || loading) {
      // Return placeholder during SSR or loading to avoid hydration mismatch
      return null;
    }

    return (
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            setTheme(theme === "dark" ? "light" : "dark");
            e.currentTarget.blur(); // Remove focus after click to prevent yellow highlight
          }}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        {user ? (
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
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={
                    user.username_slug
                      ? `/users/${user.username_slug}`
                      : "/settings"
                  }
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
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
          /* Guest user - Sign In button only */
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/auth/login")}
          >
            Sign In
          </Button>
        )}
      </div>
    );
  };

  return (
    <Navbar
      navigationLinks={[
        { href: "/", label: "Home" },
        { href: "/monsters", label: "Monsters" },
        { href: "/spells", label: "Spells" },
        { href: "/encounter-tables", label: "Encounter Tables" },
      ]}
      userdata={user}
      rightContent={renderRightContent()}
    />
  );
}
