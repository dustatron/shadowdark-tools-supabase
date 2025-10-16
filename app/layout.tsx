import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { MantineProvider } from "@/src/components/providers/MantineProvider";
import { RootProvider } from "@/src/components/providers/RootProvider";
import "@mantine/core/styles.css";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MantineProvider>
            <Notifications />
            <RootProvider>{children}</RootProvider>
          </MantineProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
