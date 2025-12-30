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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between mx-auto px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold">Pal-Bench</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            {hasAcceptedDisclaimer && (
              <Link
                href="/browse"
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  location === "/browse"
                    ? "text-foreground"
                    : "text-foreground/60",
                )}
              >
                Browse
              </Link>
            )}
            <Link
              href="/stats"
              className={cn(
                "transition-colors hover:text-foreground/80",
                location === "/stats"
                  ? "text-foreground"
                  : "text-foreground/60",
              )}
            >
              Stats
            </Link>
            <Link
              href="/about"
              className={cn(
                "transition-colors hover:text-foreground/80",
                location === "/about"
                  ? "text-foreground"
                  : "text-foreground/60",
              )}
            >
              About
            </Link>
          </nav>
        </div>

        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
