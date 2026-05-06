'use client';

import { startTransition, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import ErrorMessage from "@/components/ErrorMessage";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearAuthError, login } from "@/store/slices/authSlice";

const demoCredentials = {
  username: "emilys",
  password: "emilyspass",
};

export default function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { error, isHydrated, status, token } = useAppSelector(
    (state) => state.auth,
  );

  const registeredUsername = searchParams.get("username");
  const isRegisteredRedirect = searchParams.get("registered") === "1";

  const [credentials, setCredentials] = useState(() => ({
    username: registeredUsername ?? demoCredentials.username,
    password: registeredUsername ? "" : demoCredentials.password,
  }));

  const redirectTo = searchParams.get("redirectTo") || "/products";

  useEffect(() => {
    if (isHydrated && token) {
      router.replace(redirectTo);
    }
  }, [isHydrated, redirectTo, router, token]);

  const updateField = (field: "username" | "password", value: string) => {
    if (error) {
      dispatch(clearAuthError());
    }

    setCredentials((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const applyDemoCredentials = () => {
    setCredentials(demoCredentials);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await dispatch(
        login({
          ...credentials,
          expiresInMins: 60,
        }),
      ).unwrap();

      startTransition(() => {
        router.replace(redirectTo);
      });
    } catch {
      // The auth slice stores and displays the login error.
    }
  };

  return (
    <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="glass-hero theme-foreground rounded-[2.5rem] p-8 sm:p-10">
        <p className="app-accent-text text-xs font-semibold uppercase tracking-[0.28em]">
          Product catalog access
        </p>

        <h1 className="mt-4 max-w-lg text-4xl font-semibold leading-tight sm:text-5xl">
          Sign in to browse products, categories, and detailed product pages.
        </h1>

        <p className="theme-soft mt-6 max-w-xl text-base leading-8">
          Access the protected catalog to explore products, search by title,
          filter by category, and view full product details in a responsive
          shopping-style experience.
        </p>

        <div className="glass-panel mt-10 rounded-[2rem] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="theme-foreground text-sm font-semibold">
                Try the demo catalog
              </p>
              <p className="theme-soft mt-1 text-sm">
                Use these sample credentials to enter the product catalog.
              </p>
            </div>

            <button
              type="button"
              onClick={applyDemoCredentials}
              className="app-contrast-button rounded-full px-4 py-2 text-sm font-semibold transition"
            >
              Autofill
            </button>
          </div>

          <div className="theme-soft mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <div className="glass-stat rounded-2xl p-4">
              <p className="theme-muted text-xs uppercase tracking-[0.2em]">
                Username
              </p>
              <p className="mt-2 font-semibold">{demoCredentials.username}</p>
            </div>

            <div className="glass-stat rounded-2xl p-4">
              <p className="theme-muted text-xs uppercase tracking-[0.2em]">
                Password
              </p>
              <p className="mt-2 font-semibold">{demoCredentials.password}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-[2.5rem] p-8 sm:p-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="app-accent-text text-xs font-semibold uppercase tracking-[0.24em]">
              Sign in
            </p>

            <h2 className="theme-foreground mt-3 text-3xl font-semibold">
              Welcome to the catalog
            </h2>
          </div>

          <Link
            href="/register"
            className="app-subtle-button rounded-full px-4 py-2 text-sm font-semibold transition"
          >
            Create account
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {isRegisteredRedirect ? (
            <div className="app-success rounded-2xl px-4 py-3 text-sm">
              Your demo account was created successfully. Sign in with your
              username or email to continue to the product catalog.
            </div>
          ) : null}

          <label className="block">
            <span className="theme-foreground text-sm font-semibold">
              Username or email
            </span>

            <input
              type="text"
              value={credentials.username}
              onChange={(event) => updateField("username", event.target.value)}
              className="app-input mt-2 w-full rounded-2xl px-4 py-3 outline-none transition focus:border-teal-500"
              placeholder="emilys or your registered email"
              autoComplete="username"
            />
          </label>

          <label className="block">
            <span className="theme-foreground text-sm font-semibold">
              Password
            </span>

            <input
              type="password"
              value={credentials.password}
              onChange={(event) => updateField("password", event.target.value)}
              className="app-input mt-2 w-full rounded-2xl px-4 py-3 outline-none transition focus:border-teal-500"
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </label>

          {error ? <ErrorMessage title="Login failed" message={error} /> : null}

          <button
            type="submit"
            disabled={!isHydrated || status === "loading"}
            className="app-primary-button w-full rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:bg-slate-400 disabled:text-white"
          >
            {status === "loading" ? "Signing in..." : "Enter catalog"}
          </button>
        </form>

        <p className="theme-soft mt-6 text-sm leading-7">
          You can sign in with the sample account above or create a demo account
          to access the protected product catalog.
        </p>
      </div>
    </section>
  );
}
