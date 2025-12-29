/**
 * src/components/Header.tsx
 * Site-wide navigation header with logo, nav links, and theme toggle.
 * Sticky header with backdrop blur effect.
 */
"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Link, useLocation } from "wouter";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";

export function Header() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">Poke-Bench</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
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
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none" />
          <nav className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
