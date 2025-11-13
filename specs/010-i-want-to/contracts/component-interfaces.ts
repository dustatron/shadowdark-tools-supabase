/**
 * Component Interface Contracts for Sidebar Migration
 *
 * These TypeScript interfaces define the contracts between components.
 * Tests will validate that implementations match these contracts.
 */

import { LucideIcon } from "lucide-react";

/**
 * Navigation link for public pages
 */
export interface NavigationLink {
  /** Route path (e.g., "/monsters") */
  href: string;
  /** Display text */
  label: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Opens in new tab if true */
  external?: boolean;
}

/**
 * User menu item for authenticated users
 */
export interface UserMenuItem {
  /** Display text */
  label: string;
  /** Route path (mutually exclusive with onClick) */
  href?: string;
  /** Click handler (mutually exclusive with href) */
  onClick?: () => void;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Group header label (e.g., "Dashboard") */
  groupLabel?: string;
  /** Role-based visibility filter */
  requiresRole?: "admin" | "moderator";
  /** Custom visibility condition */
  condition?: (user: UserData | null) => boolean;
}

/**
 * User data from AuthProvider (existing)
 */
export interface UserData {
  id: string;
  email: string;
  display_name: string | null;
  username_slug: string | null;
  role: "user" | "admin" | "moderator";
}

/**
 * AppSidebar component props
 */
export interface AppSidebarProps {
  /** Optional className for customization */
  className?: string;
}

/**
 * Expected return type of useSidebar() hook
 */
export interface UseSidebarReturn {
  /** Desktop sidebar collapsed/expanded state */
  open: boolean;
  /** Mobile sidebar open/closed state */
  openMobile: boolean;
  /** Whether viewport is mobile (< 768px) */
  isMobile: boolean;
  /** Set desktop state */
  setOpen: (open: boolean) => void;
  /** Set mobile state */
  setOpenMobile: (open: boolean) => void;
  /** Toggle appropriate state based on viewport */
  toggleSidebar: () => void;
}

/**
 * Theme toggle component props
 */
export interface ThemeToggleProps {
  /** Optional className for styling */
  className?: string;
}

/**
 * Sidebar configuration
 */
export interface SidebarConfig {
  /** Public navigation links (always visible) */
  publicLinks: NavigationLink[];
  /** Menu items for authenticated users */
  authenticatedMenuItems: UserMenuItem[];
  /** Menu items for guest users (e.g., Sign In) */
  guestMenuItems: UserMenuItem[];
  /** Sidebar visual variant */
  variant: "sidebar" | "floating" | "inset";
  /** Collapsible behavior */
  collapsible: "icon" | "offcanvas" | "none";
  /** Sidebar position */
  side: "left" | "right";
}

/**
 * Contract: AppSidebar component behavior
 *
 * Test validation:
 * 1. Renders public links for all users
 * 2. Renders authenticated menu items only when user is logged in
 * 3. Filters menu items based on user role
 * 4. Filters menu items based on custom conditions
 * 5. Highlights active route based on pathname
 * 6. Responds to sidebar toggle events
 * 7. Closes mobile sidebar on navigation
 * 8. Persists collapsed/expanded state via cookies
 */
export interface AppSidebarContract {
  // Component must accept these props
  props: AppSidebarProps;

  // Component must render these elements when user is guest
  guestView: {
    publicLinks: NavigationLink[];
    signInButton: boolean;
    dashboardSection: false;
    adminSection: false;
  };

  // Component must render these elements when user is authenticated
  authenticatedView: {
    publicLinks: NavigationLink[];
    dashboardSection: boolean;
    accountSection: boolean;
    adminSection: boolean; // Only if user.role === 'admin'
    themeToggle: boolean;
  };

  // Component must respond to these events
  interactions: {
    clickNavigationLink: (href: string) => void;
    clickToggleButton: () => void;
    keyboardShortcut: (key: "cmd+b" | "ctrl+b") => void;
  };

  // Component must maintain these states
  states: {
    isCollapsed: boolean; // Desktop only
    isOpen: boolean; // Mobile only
    activeRoute: string;
  };
}

/**
 * Contract: Layout component behavior with sidebar
 *
 * Test validation:
 * 1. Wraps pages with SidebarProvider
 * 2. Places SidebarProvider inside RootProvider (for auth context)
 * 3. Renders AppSidebar before main content
 * 4. Applies correct layout structure (sidebar + main)
 */
export interface LayoutWithSidebarContract {
  // Required providers in order
  providerHierarchy: [
    "ThemeProvider",
    "RootProvider", // Contains AuthProvider
    "SidebarProvider",
  ];

  // Required components in render tree
  components: {
    appSidebar: true;
    main: true;
  };

  // Layout structure
  structure: {
    sidebarPosition: "left";
    mainContentPushes: boolean; // Main content shifts when sidebar expands
  };
}

/**
 * Contract: Theme toggle behavior
 *
 * Test validation:
 * 1. Toggles between light and dark themes
 * 2. Updates icon based on current theme
 * 3. Persists theme preference
 */
export interface ThemeToggleContract {
  props: ThemeToggleProps;

  interactions: {
    click: () => void; // Toggles theme
  };

  states: {
    currentTheme: "light" | "dark";
    icon: "Sun" | "Moon"; // Sun for dark mode, Moon for light mode
  };
}

/**
 * Contract: Sidebar state persistence
 *
 * Test validation:
 * 1. Saves collapsed/expanded state to cookie
 * 2. Restores state on page load
 * 3. Cookie name is "sidebar:state"
 * 4. Cookie value is "true" (expanded) or "false" (collapsed)
 */
export interface SidebarPersistenceContract {
  cookieName: "sidebar:state";
  cookieValues: {
    expanded: "true";
    collapsed: "false";
  };

  behavior: {
    onToggle: () => void; // Updates cookie
    onLoad: () => void; // Reads cookie
  };
}
