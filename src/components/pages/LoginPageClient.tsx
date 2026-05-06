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
      <div className="rounded-[2.5rem] border border-black/10 bg-slate-950 p-8 text-white shadow-xl sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-300">
          Product catalog access
        </p>

        <h1 className="mt-4 max-w-lg text-4xl font-semibold leading-tight sm:text-5xl">
          Sign in to browse products, categories, and detailed product pages.
        </h1>

        <p className="mt-6 max-w-xl text-base leading-8 text-slate-300">
          Access the protected catalog to explore products, search by title,
          filter by category, and view full product details in a responsive
          shopping-style experience.
        </p>

        <div className="mt-10 rounded-[2rem] bg-white/8 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">
                Try the demo catalog
              </p>
              <p className="mt-1 text-sm text-slate-300">
                Use these sample credentials to enter the product catalog.
              </p>
            </div>

            <button
              type="button"
              onClick={applyDemoCredentials}
              className="rounded-full bg-teal-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-300"
            >
              Autofill
            </button>
          </div>

          <div className="mt-5 grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Username
              </p>
              <p className="mt-2 font-semibold">{demoCredentials.username}</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Password
              </p>
              <p className="mt-2 font-semibold">{demoCredentials.password}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[2.5rem] border border-black/10 bg-white/90 p-8 shadow-xl backdrop-blur sm:p-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">
              Sign in
            </p>

            <h2 className="mt-3 text-3xl font-semibold text-slate-950">
              Welcome to the catalog
            </h2>
          </div>

          <Link
            href="/register"
            className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Create account
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {isRegisteredRedirect ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Your demo account was created successfully. Sign in with your
              username or email to continue to the product catalog.
            </div>
          ) : null}

          <label className="block">
            <span className="text-sm font-semibold text-slate-800">
              Username or email
            </span>

            <input
              type="text"
              value={credentials.username}
              onChange={(event) => updateField("username", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-black/10 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white"
              placeholder="emilys or your registered email"
              autoComplete="username"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-800">
              Password
            </span>

            <input
              type="password"
              value={credentials.password}
              onChange={(event) => updateField("password", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-black/10 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white"
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </label>

          {error ? <ErrorMessage title="Login failed" message={error} /> : null}

          <button
            type="submit"
            disabled={!isHydrated || status === "loading"}
            className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {status === "loading" ? "Signing in..." : "Enter catalog"}
          </button>
        </form>

        <p className="mt-6 text-sm leading-7 text-slate-600">
          You can sign in with the sample account above or create a demo account
          to access the protected product catalog.
        </p>
      </div>
    </section>
  );
}