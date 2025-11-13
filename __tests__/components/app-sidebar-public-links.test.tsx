/**
 * Unit Test: AppSidebar renders public navigation links
 * Test Scenario #1 from contracts/test-scenarios.md
 *
 * Expected: This test MUST FAIL initially (component doesn't exist yet)
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppSidebar } from "@/components/navigation/app-sidebar";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock AuthProvider
vi.mock("@/src/components/providers/AuthProvider", () => ({
  useAuth: () => ({
    user: null, // Guest user
    loading: false,
    signOut: vi.fn(),
  }),
}));

// Mock next-themes
vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "dark",
    setTheme: vi.fn(),
  }),
}));

// Mock sidebar components (they exist after T001)
vi.mock("@/components/ui/sidebar", () => ({
  Sidebar: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar">{children}</div>
  ),
  SidebarProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarGroup: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarGroupLabel: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarMenu: ({ children }: { children: React.ReactNode }) => (
    <ul>{children}</ul>
  ),
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => (
    <li>{children}</li>
  ),
  SidebarMenuButton: ({ children, asChild, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
  SidebarRail: () => <div data-testid="sidebar-rail" />,
  useSidebar: () => ({
    open: true,
    openMobile: false,
    isMobile: false,
    setOpen: vi.fn(),
    setOpenMobile: vi.fn(),
    toggleSidebar: vi.fn(),
  }),
}));

describe("AppSidebar - Public Navigation Links", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Home link with correct href", () => {
    render(<AppSidebar />);
    const homeLink = screen.getByRole("link", { name: /home/i });
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("renders Monsters link with correct href", () => {
    render(<AppSidebar />);
    const monstersLink = screen.getByRole("link", { name: /monsters/i });
    expect(monstersLink).toHaveAttribute("href", "/monsters");
  });

  it("renders Spells link with correct href", () => {
    render(<AppSidebar />);
    const spellsLink = screen.getByRole("link", { name: /spells/i });
    expect(spellsLink).toHaveAttribute("href", "/spells");
  });

  it("renders Encounter Tables link with correct href", () => {
    render(<AppSidebar />);
    const encounterTablesLink = screen.getByRole("link", {
      name: /encounter tables/i,
    });
    expect(encounterTablesLink).toHaveAttribute("href", "/encounter-tables");
  });

  it("renders About link with correct href", () => {
    render(<AppSidebar />);
    const aboutLink = screen.getByRole("link", { name: /about/i });
    expect(aboutLink).toHaveAttribute("href", "/about");
  });

  it("renders all public links with icons", () => {
    render(<AppSidebar />);

    // Verify all 5 public links are present
    const links = screen.getAllByRole("link");
    const publicLinkTexts = [
      "Home",
      "Monsters",
      "Spells",
      "Encounter Tables",
      "About",
    ];

    publicLinkTexts.forEach((text) => {
      expect(
        screen.getByRole("link", { name: new RegExp(text, "i") }),
      ).toBeInTheDocument();
    });
  });

  it("handles external links with target and rel attributes", () => {
    // Note: This test will be relevant if any external links are added
    // Currently all navigation links are internal
    render(<AppSidebar />);

    const internalLinks = screen.getAllByRole("link");
    internalLinks.forEach((link) => {
      // Internal links should NOT have target="_blank"
      expect(link).not.toHaveAttribute("target", "_blank");
    });
  });
});
