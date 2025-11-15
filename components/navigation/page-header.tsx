"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function PageHeader() {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === "/") return "Home";
    if (pathname === "/about") return "About";
    if (pathname === "/monsters") return "Monster Search";
    if (pathname.startsWith("/monsters/")) return "Monster Details";
    if (pathname === "/spells") return "Spell Search";
    if (pathname.startsWith("/spells/")) return "Spell Details";
    if (pathname === "/encounter-tables") return "Encounter Tables";
    if (pathname === "/dashboard/monsters") return "Your Monsters";
    if (pathname === "/dashboard/spells") return "Your Spells";
    if (pathname === "/dashboard/encounters") return "Your Encounters";
    if (pathname === "/dashboard/decks") return "Your Decks";
    if (pathname === "/dashboard/favorites/monsters")
      return "Favorite Monsters";
    if (pathname === "/dashboard/favorites/spells") return "Favorite Spells";
    if (pathname === "/settings") return "Settings";
    if (pathname.startsWith("/users/")) return "Profile";
    if (pathname === "/admin") return "Admin";
    return "Dungeon Exchange";
  };

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger />
      <div className="flex items-center gap-2">
        <span className="font-heading font-bold text-xl">
          {getPageTitle() !== "Dungeon Exchange" && `${getPageTitle()}`}
        </span>
      </div>
    </header>
  );
}
