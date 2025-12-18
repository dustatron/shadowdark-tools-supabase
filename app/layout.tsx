import type { Metadata } from "next";
import { RootProvider } from "@/components/providers/RootProvider";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/primitives/sonner";
import { SidebarProvider, SidebarInset } from "@/components/primitives/sidebar";
import { AppSidebar } from "@/components/navigation/app-sidebar";
import { PageHeader } from "@/components/navigation/page-header";
import { Roboto, Source_Code_Pro } from "next/font/google";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
});

const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-mono",
});

// Force dynamic rendering since we use server-side authentication
export const dynamic = "force-dynamic";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "Dungeon Exchange",
    template: "%s | Dungeon Exchange",
  },
  description:
    "Exchange, trade, and discover custom content for Shadowdark RPG. Share monsters, spells, magic items, and encounter tables with GMs worldwide. Build card decks and explore community creations.",
  keywords: [
    "Shadowdark",
    "Dungeon Exchange",
    "content exchange",
    "RPG marketplace",
    "TTRPG",
    "Game Master",
    "GM Tools",
    "Monster Database",
    "Spell Database",
    "Encounter Builder",
    "trading",
    "sharing",
    "community marketplace",
    "homebrew",
    "custom content",
    "collaboration",
    "D&D",
    "OSR",
  ],
  authors: [{ name: "Dungeon Exchange" }],
  creator: "Dungeon Exchange",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: defaultUrl,
    siteName: "Dungeon Exchange",
    title: "Dungeon Exchange",
    description:
      "Exchange, trade, and discover custom content for Shadowdark RPG. Share monsters, spells, magic items, and encounter tables with GMs worldwide.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Dungeon Exchange",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dungeon Exchange",
    description:
      "Exchange, trade, and discover custom content for Shadowdark RPG. Share monsters, spells, magic items, and encounter tables with GMs worldwide.",
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
  // Fetch user server-side
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user profile if authenticated
  let initialUser = null;
  if (user) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("username_slug")
      .eq("id", user.id)
      .single();

    initialUser = {
      id: user.id,
      email: user.email!,
      display_name: user.user_metadata?.display_name,
      role: user.app_metadata?.role,
      username_slug: profile?.username_slug,
    };
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${roboto.variable} ${sourceCodePro.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark">
          <RootProvider initialUser={initialUser}>
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <PageHeader />
                <div className="flex-1 overflow-auto p-4">{children}</div>
              </SidebarInset>
            </SidebarProvider>
          </RootProvider>
          <Toaster richColors position="top-right" closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
