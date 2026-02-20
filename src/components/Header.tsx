/**
 * src/components/Header.tsx
 * Site-wide navigation header with logo, nav links, and theme toggle.
 * Sticky header with backdrop blur effect.
 */
"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Link, useLocation } from "wouter";
import { useDisclaimer } from "../lib/DisclaimerContext";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";

export function Header() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { hasAcceptedDisclaimer } = useDisclaimer();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg tracking-tight">
            <span className="transition-colors hover:text-foreground/80">Pal-Bench</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {hasAcceptedDisclaimer && (
              <Link
                href="/browse"
                className={cn(
                  "transition-all duration-200 hover:text-foreground",
                  location === "/browse" ? "text-foreground font-medium" : "text-muted-foreground",
                )}
              >
                Browse
              </Link>
            )}
            <Link
              href="/stats"
              className={cn(
                "transition-all duration-200 hover:text-foreground",
                location === "/stats" ? "text-foreground font-medium" : "text-muted-foreground",
              )}
            >
              Stats
            </Link>
            <Link
              href="/about"
              className={cn(
                "transition-all duration-200 hover:text-foreground",
                location === "/about" ? "text-foreground font-medium" : "text-muted-foreground",
              )}
            >
              About
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="h-9 w-9"
          >
            <SunIcon className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <MoonIcon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
