'use client';

import {
  startTransition,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import ThemeToggle from "@/components/ThemeToggle";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutAndClearSession } from "@/store/slices/authSlice";
import type { User } from "@/types/auth";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getDisplayName(firstName: string, lastName: string, username: string): string {
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || username;
}

function getInitials(firstName: string, lastName: string, username: string): string {
  const firstInitial = firstName.trim().charAt(0);
  const lastInitial = lastName.trim().charAt(0);
  const fullInitials = `${firstInitial}${lastInitial}`.trim();

  if (fullInitials) {
    return fullInitials.toUpperCase();
  }

  return username.trim().slice(0, 2).toUpperCase() || "AC";
}

interface AuthenticatedUserMenuProps {
  user: User;
  onLogout: () => void;
}

function AuthenticatedUserMenu({
  user,
  onLogout,
}: AuthenticatedUserMenuProps) {
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const accountDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isAccountDropdownOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!accountDropdownRef.current?.contains(event.target as Node)) {
        setIsAccountDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsAccountDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAccountDropdownOpen]);

  const displayName = getDisplayName(user.firstName, user.lastName, user.username);
  const userInitials = getInitials(user.firstName, user.lastName, user.username);

  return (
    <div className="relative" ref={accountDropdownRef}>
      <button
        type="button"
        aria-expanded={isAccountDropdownOpen}
        aria-controls="account-dropdown"
        onClick={() => {
          setIsAccountDropdownOpen((currentValue) => !currentValue);
        }}
        className={[
          "glass-stat flex items-center gap-3 rounded-full px-3 py-2 text-left transition",
          isAccountDropdownOpen
            ? "ring-2 ring-teal-500/30 theme-foreground"
            : "theme-soft hover:brightness-105",
        ].join(" ")}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-700 text-xs font-bold uppercase tracking-[0.18em] text-white">
          {userInitials}
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="theme-foreground block max-w-40 truncate text-sm font-semibold">
            {displayName}
          </span>
          <span className="theme-muted block max-w-40 truncate text-xs">
            @{user.username}
          </span>
        </span>
        <span
          aria-hidden="true"
          className={[
            "theme-muted text-xs transition",
            isAccountDropdownOpen ? "rotate-180" : "",
          ].join(" ")}
        >
          ▼
        </span>
      </button>

      {isAccountDropdownOpen ? (
        <div
          id="account-dropdown"
          className="app-dropdown absolute right-0 top-[calc(100%+0.75rem)] w-72 rounded-[1.5rem] p-4"
        >
          <p className="app-accent-text text-xs font-semibold uppercase tracking-[0.24em]">
            Signed in
          </p>
          <div className="app-subtle-surface mt-3 flex items-start gap-3 rounded-[1.25rem] p-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-700 text-sm font-bold uppercase tracking-[0.16em] text-white">
              {userInitials}
            </div>
            <div className="min-w-0 space-y-1">
              <p className="theme-foreground truncate text-sm font-semibold">
                {displayName}
              </p>
              <p className="theme-soft truncate text-sm">
                @{user.username}
              </p>
              <p className="theme-muted truncate text-sm">
                {user.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="app-danger-button mt-4 w-full rounded-full px-4 py-3 text-sm font-semibold transition"
          >
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isHydrated, token, user } = useAppSelector((state) => state.auth);

  const navLinks = token
    ? [
        { href: "/", label: "Overview" },
        { href: "/products", label: "Products" },
      ]
    : [
        { href: "/", label: "Overview" },
        { href: "/login", label: "Login" },
        { href: "/register", label: "Register" },
      ];

  const handleLogout = () => {
    dispatch(logoutAndClearSession());
    startTransition(() => {
      router.push("/login");
    });
  };

  return (
    <header className="app-nav sticky top-0 z-40">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="min-w-0">
          <p className="app-accent-text text-xs font-semibold uppercase tracking-[0.28em]">
            Product Starter
          </p>
          <p className="theme-foreground truncate text-lg font-semibold">
            Catalog Pilot
          </p>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                isActive(pathname, item.href)
                  ? "app-nav-link-active"
                  : "app-nav-link-inactive",
              ].join(" ")}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {!isHydrated ? (
            <span className="glass-stat rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] theme-muted">
              Syncing session
            </span>
          ) : token && user ? (
            <AuthenticatedUserMenu
              key={pathname}
              user={user}
              onLogout={handleLogout}
            />
          ) : (
            <Link
              href="/login"
              className="app-primary-button rounded-full px-4 py-2 text-sm font-semibold transition"
            >
              Open demo
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
