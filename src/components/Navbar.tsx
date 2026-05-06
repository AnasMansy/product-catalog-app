'use client';

import { startTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutAndClearSession } from "@/store/slices/authSlice";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
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
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
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
            <>
              <div className="hidden rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-slate-700 sm:block">
                {user.firstName} {user.lastName}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
              >
                Logout
              </button>
            </>
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
