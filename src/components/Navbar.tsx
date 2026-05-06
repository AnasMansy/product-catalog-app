'use client';

import {
  startTransition,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

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
          "flex items-center gap-3 rounded-full border px-3 py-2 text-left transition",
          isAccountDropdownOpen
            ? "border-teal-300 bg-teal-50 text-slate-950"
            : "border-amber-200 bg-amber-50 text-slate-700 hover:border-amber-300 hover:bg-amber-100",
        ].join(" ")}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold uppercase tracking-[0.18em] text-white">
          {userInitials}
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block max-w-40 truncate text-sm font-semibold">
            {displayName}
          </span>
          <span className="block max-w-40 truncate text-xs text-slate-500">
            @{user.username}
          </span>
        </span>
        <span
          aria-hidden="true"
          className={[
            "text-xs text-slate-500 transition",
            isAccountDropdownOpen ? "rotate-180" : "",
          ].join(" ")}
        >
          ▼
        </span>
      </button>

      {isAccountDropdownOpen ? (
        <div
          id="account-dropdown"
          className="absolute right-0 top-[calc(100%+0.75rem)] w-72 rounded-[1.5rem] border border-black/10 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.16)]"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">
            Signed in
          </p>
          <div className="mt-3 flex items-start gap-3 rounded-[1.25rem] bg-slate-50 p-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold uppercase tracking-[0.16em] text-white">
              {userInitials}
            </div>
            <div className="min-w-0 space-y-1">
              <p className="truncate text-sm font-semibold text-slate-950">
                {displayName}
              </p>
              <p className="truncate text-sm text-slate-600">
                @{user.username}
              </p>
              <p className="truncate text-sm text-slate-500">
                {user.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="mt-4 w-full rounded-full bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
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
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">
            Product Starter
          </p>
          <p className="truncate text-lg font-semibold text-slate-950">
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
                  ? "bg-amber-200  text-cyan-100"
                  : "  hover:bg-slate-100 ",
              ].join(" ")}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {!isHydrated ? (
            <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
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
              className="rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              Open demo
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
