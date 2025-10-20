"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Sword,
  Wand,
  User,
  Settings,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

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

interface NavLinkProps {
  href?: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  variant?: "default" | "danger";
}

function NavLink({
  href,
  label,
  icon,
  active,
  onClick,
  variant = "default",
}: NavLinkProps) {
  const baseStyles =
    "flex items-center gap-3 px-3 py-2.5 rounded-md text-base font-medium transition-colors min-h-[44px]";
  const activeStyles = active
    ? "bg-primary/10 text-primary"
    : "text-foreground hover:bg-accent hover:text-accent-foreground";
  const dangerStyles =
    variant === "danger"
      ? "text-destructive hover:bg-destructive/10"
      : activeStyles;

  const content = (
    <>
      <span className="flex-shrink-0">{icon}</span>
      <span>{label}</span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={cn(baseStyles, dangerStyles)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={cn(baseStyles, dangerStyles)}>
      {content}
    </button>
  );
}

interface SectionHeaderProps {
  label: string;
}

function SectionHeader({ label }: SectionHeaderProps) {
  return (
    <div className="relative flex items-center py-2">
      <Separator className="flex-1" />
      <span className="px-3 text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <Separator className="flex-1" />
    </div>
  );
}

export function MobileNav({ opened, onClose, user, onLogout }: MobileNavProps) {
  const pathname = usePathname();
  const isAdmin = user?.role === "admin" || user?.role === "moderator";

  return (
    <Sheet open={opened} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[300px] sm:hidden">
        <SheetHeader>
          <SheetTitle className="text-left text-lg font-bold">
            Shadowdark GM Tools
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col gap-1 mt-6">
          {/* Main Navigation */}
          <NavLink
            label="Monsters"
            icon={<Sword size={20} />}
            href="/monsters"
            active={pathname === "/monsters"}
            onClick={onClose}
          />
          <NavLink
            label="Spells"
            icon={<Wand size={20} />}
            href="/spells"
            active={pathname === "/spells"}
            onClick={onClose}
          />

          {user && (
            <>
              <SectionHeader label="Account" />

              <NavLink
                label="Profile"
                icon={<User size={20} />}
                href="/profile"
                active={pathname === "/profile"}
                onClick={onClose}
              />
              <NavLink
                label="Settings"
                icon={<Settings size={20} />}
                href="/settings"
                active={pathname === "/settings"}
                onClick={onClose}
              />

              {isAdmin && (
                <>
                  <SectionHeader label="Admin" />
                  <NavLink
                    label="Dashboard"
                    icon={<LayoutDashboard size={20} />}
                    href="/admin"
                    active={pathname === "/admin"}
                    onClick={onClose}
                  />
                </>
              )}

              <Separator className="my-4" />

              <NavLink
                label="Logout"
                icon={<LogOut size={20} />}
                onClick={() => {
                  onLogout?.();
                  onClose();
                }}
                variant="danger"
              />
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
