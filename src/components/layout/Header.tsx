"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  LogIn,
  LayoutDashboard,
  Menu,
} from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch for theme toggle
  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = user?.role === "admin" || user?.role === "moderator";
  const activeTab = getActiveTab(pathname);

  const getUserInitials = (user: User) => {
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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Mobile burger menu */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleMobile}
          className="sm:hidden"
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo/Brand */}
        <Link
          href="/"
          className="text-xl font-bold text-primary hover:text-primary/80 transition-colors"
        >
          <span className="sm:hidden">Shadowdark</span>
          <span className="hidden sm:inline">Shadowdark GM Tools</span>
        </Link>

        {/* Center: Tabs Navigation - Hidden on mobile */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            const tab = tabs.find((t) => t.value === value);
            if (tab && !tab.disabled) {
              router.push(tab.path);
            }
          }}
          className="hidden sm:block"
        >
          <TabsList className="bg-transparent border-b-0">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                disabled={tab.disabled}
                className="relative data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Right side: Theme toggle + User menu */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          )}

          {user ? (
            /* Authenticated user menu */
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getUserInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Hide username on very small screens */}
                  <span className="hidden xs:inline text-sm font-medium">
                    {user.display_name || user.email}
                  </span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>

                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Administration</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onLogout}
                  className="flex items-center gap-2 text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* Guest user actions - compact on mobile */
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/login" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                <span className="hidden xs:inline">Login</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
