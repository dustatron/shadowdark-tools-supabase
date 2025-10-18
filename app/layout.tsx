import type { Metadata } from "next";
import { RootProvider } from "@/src/components/providers/RootProvider";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "Shadowdark GM Tools",
    template: "%s | Shadowdark GM Tools",
  },
  description:
    "Comprehensive tools for Shadowdark RPG Game Masters. Browse official monsters and spells, create custom content, build balanced encounters, and manage your campaigns.",
  keywords: [
    "Shadowdark",
    "RPG",
    "TTRPG",
    "Game Master",
    "GM Tools",
    "Monster Database",
    "Spell Database",
    "Encounter Builder",
    "D&D",
    "OSR",
  ],
  authors: [{ name: "Shadowdark GM Tools" }],
  creator: "Shadowdark GM Tools",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: defaultUrl,
    siteName: "Shadowdark GM Tools",
    title: "Shadowdark GM Tools",
    description:
      "Comprehensive tools for Shadowdark RPG Game Masters. Browse official monsters and spells, create custom content, and build encounters.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Shadowdark GM Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shadowdark GM Tools",
    description:
      "Comprehensive tools for Shadowdark RPG Game Masters. Browse monsters, spells, and build encounters.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <MantineProvider>
          <Notifications />
          <ThemeProvider attribute="class" defaultTheme="dark">
            <RootProvider>{children}</RootProvider>
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
