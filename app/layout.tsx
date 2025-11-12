import type { Metadata } from "next";
import { RootProvider } from "@/src/components/providers/RootProvider";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { AppNavbar } from "@/components/navigation/app-navbar";
import { getServerSession } from "@/lib/auth-helpers";
import "./globals.css";

// Force dynamic rendering since we use server-side authentication
export const dynamic = "force-dynamic";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "Shadowdark Guild",
    template: "%s | Shadowdark Guild",
  },
  description:
    "A community-driven guild for Shadowdark RPG Game Masters. Share custom monsters, spells, and magic items, build encounter tables, create card decks, and collaborate with thousands of GMs.",
  keywords: [
    "Shadowdark",
    "Shadowdark Guild",
    "RPG",
    "TTRPG",
    "Game Master",
    "GM Tools",
    "Monster Database",
    "Spell Database",
    "Encounter Builder",
    "community",
    "sharing",
    "homebrew",
    "custom content",
    "collaboration",
    "D&D",
    "OSR",
  ],
  authors: [{ name: "Shadowdark Guild" }],
  creator: "Shadowdark Guild",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: defaultUrl,
    siteName: "Shadowdark Guild",
    title: "Shadowdark Guild",
    description:
      "A community-driven guild for Shadowdark RPG Game Masters. Share custom monsters, spells, and magic items, build encounter tables, create card decks, and collaborate with thousands of GMs.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Shadowdark Guild",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shadowdark Guild",
    description:
      "A community-driven guild for Shadowdark RPG Game Masters. Share custom monsters, spells, and magic items, build encounter tables, create card decks, and collaborate with thousands of GMs.",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialSession = await getServerSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark">
          <RootProvider initialSession={initialSession}>
            <AppNavbar />
            {children}
          </RootProvider>
          <Toaster richColors position="top-right" closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
