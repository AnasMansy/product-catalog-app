'use client';

import { useSyncExternalStore } from "react";

import {
  DEFAULT_THEME,
  getResolvedTheme,
  setTheme,
  subscribeToTheme,
  type AppTheme,
} from "@/lib/theme";

function subscribeToClientReady() {
  return () => undefined;
}

function ThemeIcon({ theme }: Readonly<{ theme: AppTheme | null }>) {
  if (theme === "dark") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path
          d="M20 15.2A7.9 7.9 0 0 1 8.8 4 8 8 0 1 0 20 15.2Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.2" strokeLinecap="round" />
      <path d="M12 19.3v2.2" strokeLinecap="round" />
      <path d="m4.9 4.9 1.6 1.6" strokeLinecap="round" />
      <path d="m17.5 17.5 1.6 1.6" strokeLinecap="round" />
      <path d="M2.5 12h2.2" strokeLinecap="round" />
      <path d="M19.3 12h2.2" strokeLinecap="round" />
      <path d="m4.9 19.1 1.6-1.6" strokeLinecap="round" />
      <path d="m17.5 6.5 1.6-1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function ThemeToggle() {
  const isClient = useSyncExternalStore(
    subscribeToClientReady,
    () => true,
    () => false,
  );
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getResolvedTheme,
    () => DEFAULT_THEME,
  );

  const resolvedTheme = isClient ? theme : null;
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      aria-label={
        resolvedTheme
          ? `Switch to ${nextTheme} mode`
          : "Toggle color theme"
      }
      onClick={() => setTheme(nextTheme)}
      className="glass-stat flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold theme-soft transition hover:brightness-105"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full app-subtle-surface theme-foreground">
        <ThemeIcon theme={resolvedTheme} />
      </span>
      <span className="hidden sm:block">
        {resolvedTheme
          ? `${resolvedTheme === "dark" ? "Dark" : "Light"} mode`
          : "Theme"}
      </span>
    </button>
  );
}
