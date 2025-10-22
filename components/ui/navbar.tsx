"use client";

import * as React from "react";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Types
export interface NavigationLink {
  href: string;
  label: string;
  external?: boolean;
}

export interface NavbarProps {
  logo?: React.ReactNode;
  navigationLinks?: NavigationLink[];
  signInButton?: {
    label: string;
    onClick: () => void;
  };
  ctaButton?: {
    label: string;
    onClick: () => void;
    variant?:
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | "link";
  };
  rightContent?: React.ReactNode;
  className?: string;
}

// Hamburger Icon Component with animation
function HamburgerIcon({
  isOpen,
  className,
}: {
  isOpen: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn("flex flex-col gap-1.5 w-5 h-5 justify-center", className)}
    >
      <span
        className={cn(
          "block h-0.5 w-full bg-current transition-all duration-300 ease-out",
          isOpen && "rotate-45 translate-y-2",
        )}
      />
      <span
        className={cn(
          "block h-0.5 w-full bg-current transition-all duration-300 ease-out",
          isOpen && "opacity-0",
        )}
      />
      <span
        className={cn(
          "block h-0.5 w-full bg-current transition-all duration-300 ease-out",
          isOpen && "-rotate-45 -translate-y-2",
        )}
      />
    </div>
  );
}

// Default Shadowdark Logo
function DefaultLogo() {
  return (
    <div className="flex items-center gap-2">
      <span className="font-bold hidden sm:inline">ShadowGM Tools</span>
    </div>
  );
}

export function Navbar({
  logo,
  navigationLinks = [],
  signInButton,
  ctaButton,
  rightContent,
  className,
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on route change or outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className,
      )}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center hover:opacity-80 transition-opacity"
        >
          {logo || <DefaultLogo />}
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navigationLinks.length > 0 && (
            <NavigationMenu>
              <NavigationMenuList>
                {navigationLinks.map((link) => (
                  <NavigationMenuItem key={link.href}>
                    <Link
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 transition-colors outline-none"
                    >
                      {link.label}
                    </Link>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          )}

          <div className="flex items-center gap-2">
            {rightContent ? (
              rightContent
            ) : (
              <>
                {signInButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={signInButton.onClick}
                  >
                    {signInButton.label}
                  </Button>
                )}
                {ctaButton && (
                  <Button
                    variant={ctaButton.variant || "default"}
                    size="sm"
                    onClick={ctaButton.onClick}
                  >
                    {ctaButton.label}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden" ref={popoverRef}>
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Toggle menu"
                aria-expanded={isOpen}
              >
                <HamburgerIcon isOpen={isOpen} />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-[200px] p-2"
              sideOffset={8}
            >
              <div className="flex flex-col gap-1">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                {(rightContent || signInButton || ctaButton) &&
                  navigationLinks.length > 0 && (
                    <div className="my-1 border-t" />
                  )}
                {rightContent ? (
                  <div className="px-2 py-1" onClick={() => setIsOpen(false)}>
                    {rightContent}
                  </div>
                ) : (
                  <>
                    {signInButton && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          signInButton.onClick();
                          setIsOpen(false);
                        }}
                        className="w-full justify-start"
                      >
                        {signInButton.label}
                      </Button>
                    )}
                    {ctaButton && (
                      <Button
                        variant={ctaButton.variant || "default"}
                        size="sm"
                        onClick={() => {
                          ctaButton.onClick();
                          setIsOpen(false);
                        }}
                        className="w-full"
                      >
                        {ctaButton.label}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </nav>
  );
}
