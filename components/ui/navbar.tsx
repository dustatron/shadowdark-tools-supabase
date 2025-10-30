"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { UserData } from "@/src/components/providers/AuthProvider";

// Types
export interface NavigationLink {
  href: string;
  label: string;
  external?: boolean;
}

export interface UserMenuItem {
  label?: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  separator?: boolean;
  destructive?: boolean;
}

export interface NavbarProps {
  logo?: React.ReactNode;
  navigationLinks?: NavigationLink[];
  signInButton?: {
    label: string;
    onClick: () => void;
  };
  userdata: UserData | null;
  userMenuItems?: UserMenuItem[]; // User menu items for mobile drawer
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
  themeToggle?: React.ReactNode; // Theme toggle separate from auth content
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
  themeToggle,
  className,
  userdata,
  userMenuItems = [],
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

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
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Toggle menu"
                aria-expanded={isOpen}
              >
                <HamburgerIcon isOpen={isOpen} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-3/4 sm:max-w-sm">
              <div className="flex flex-col gap-1 mt-8">
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
                {(themeToggle || rightContent || signInButton || ctaButton) &&
                  navigationLinks.length > 0 && (
                    <div className="my-1 border-t" />
                  )}

                {/* Theme toggle - always visible in mobile menu */}
                {themeToggle && <div className="px-3 py-2">{themeToggle}</div>}

                {userMenuItems.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {userMenuItems.map((item, index) => {
                      if (item.separator) {
                        return (
                          <div
                            key={`separator-${index}`}
                            className="my-1 border-t"
                          />
                        );
                      }

                      if (item.href) {
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors",
                              item.destructive &&
                                "text-destructive hover:text-destructive",
                            )}
                          >
                            {item.icon}
                            {item.label}
                          </Link>
                        );
                      }

                      return (
                        <button
                          key={item.label}
                          onClick={() => {
                            item.onClick?.();
                            setIsOpen(false);
                          }}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-left",
                            item.destructive &&
                              "text-destructive hover:text-destructive",
                          )}
                        >
                          {item.icon}
                          {item.label}
                        </button>
                      );
                    })}
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
                        size="icon"
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
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
