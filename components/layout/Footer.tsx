import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t py-4 px-4 text-center text-sm text-muted-foreground">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <span>
          Icons by{" "}
          <Link
            href="https://game-icons.net"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            game-icons.net
          </Link>
        </span>
        <span className="hidden sm:inline">|</span>
        <span>&copy; {new Date().getFullYear()} Dungeon Exchange</span>
      </div>
    </footer>
  );
}
