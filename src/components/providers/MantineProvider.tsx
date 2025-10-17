"use client";

import {
  MantineProvider as BaseMantineProvider,
  createTheme,
  MantineColorsTuple,
} from "@mantine/core";
import { ReactNode } from "react";

// Custom Shadowdark palette (10 shades required)
const shadowdark: MantineColorsTuple = [
  "#f5f5f5", // 0 - lightest (for dark mode text/backgrounds)
  "#e0e0e0", // 1
  "#bdbdbd", // 2
  "#9e9e9e", // 3
  "#757575", // 4
  "#616161", // 5 - mid tone (default primary shade)
  "#424242", // 6
  "#2c2c2c", // 7
  "#1a1a1a", // 8
  "#0d0d0d", // 9 - darkest (for light mode text/backgrounds)
];

// Blood red for danger/critical actions
const blood: MantineColorsTuple = [
  "#fee2e2",
  "#fecaca",
  "#fca5a5",
  "#f87171",
  "#ef4444",
  "#dc2626",
  "#b91c1c",
  "#991b1b",
  "#7f1d1d",
  "#450a0a",
];

// Gold for treasure/rewards
const treasure: MantineColorsTuple = [
  "#fef3c7",
  "#fde68a",
  "#fcd34d",
  "#fbbf24",
  "#f59e0b",
  "#d97706",
  "#b45309",
  "#92400e",
  "#78350f",
  "#451a03",
];

// Magic purple/blue for spells
const magic: MantineColorsTuple = [
  "#ede9fe",
  "#ddd6fe",
  "#c4b5fd",
  "#a78bfa",
  "#8b5cf6",
  "#7c3aed",
  "#6d28d9",
  "#5b21b6",
  "#4c1d95",
  "#2e1065",
];

const theme = createTheme({
  /** Primary color - use our custom Shadowdark palette */
  primaryColor: "shadowdark",

  /** Primary shade - index 5 is mid-tone, works well for both light/dark */
  primaryShade: { light: 6, dark: 4 },

  /** Font configuration */
  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  headings: {
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: "700",
    sizes: {
      h1: { fontSize: "2.5rem", fontWeight: "800", lineHeight: "1.2" },
      h2: { fontSize: "2rem", fontWeight: "700", lineHeight: "1.3" },
      h3: { fontSize: "1.5rem", fontWeight: "600", lineHeight: "1.4" },
    },
  },

  /** Custom color palettes */
  colors: {
    shadowdark,
    blood,
    treasure,
    magic,
  },

  /** Component defaults */
  components: {
    Button: {
      defaultProps: {
        variant: "filled",
      },
    },
    Card: {
      defaultProps: {
        shadow: "sm",
        radius: "md",
        withBorder: true,
      },
    },
    Table: {
      defaultProps: {
        striped: true,
        highlightOnHover: true,
      },
    },
    NavLink: {
      defaultProps: {
        variant: "filled",
      },
    },
  },
});

interface MantineProviderProps {
  children: ReactNode;
}

export function MantineProvider({ children }: MantineProviderProps) {
  return (
    <BaseMantineProvider theme={theme} defaultColorScheme="dark">
      {children}
    </BaseMantineProvider>
  );
}
