import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Monster",
  description:
    "Create your own custom monster for Shadowdark RPG. Define stats, attacks, abilities, and more. Share your creations with the community.",
  openGraph: {
    title: "Create Custom Monster | Shadowdark Guild",
    description:
      "Build your own custom Shadowdark monsters with our intuitive monster creation tool.",
  },
};

export default function CreateMonsterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
