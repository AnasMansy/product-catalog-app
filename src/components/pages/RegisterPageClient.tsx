'use client';

import { startTransition, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { persistDemoUser } from "@/lib/authStorage";

interface RegisterFormValues {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

type RegisterFormErrors = Partial<Record<keyof RegisterFormValues, string>>;

const initialFormValues: RegisterFormValues = {
  name: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateRegistrationForm(
  values: RegisterFormValues,
): RegisterFormErrors {
  const errors: RegisterFormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Name is required.";
  }

  if (!values.username.trim()) {
    errors.username = "Username is required.";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!isValidEmail(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  } else if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters long.";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Confirm your password.";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

export default function RegisterPageClient() {
  const router = useRouter();
  const [values, setValues] = useState<RegisterFormValues>(initialFormValues);
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (
    field: keyof RegisterFormValues,
    value: string,
  ) => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateRegistrationForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    persistDemoUser({
      name: values.name.trim(),
      username: values.username.trim(),
      email: values.email.trim().toLowerCase(),
      password: values.password,
    });

    startTransition(() => {
      router.push(
        `/login?registered=1&username=${encodeURIComponent(
          values.username.trim(),
        )}`,
      );
    });
  };

  return (
    <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.92fr_1.08fr]">
      <div className="rounded-[2.5rem] border border-black/10 bg-slate-950 p-8 text-white shadow-xl sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">
          Demo registration
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
          Create a local demo account for this frontend-only starter.
        </h1>
        <p className="mt-6 text-base leading-8 text-slate-300">
          This route does not call a backend or database. It validates the
          fields in the browser, stores the account in localStorage under
          <code className="mx-1 rounded bg-white/10 px-2 py-1 text-sm">
            demoUser
          </code>
          , and hands the credentials off to the login screen.
        </p>
        <div className="mt-8 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
          <div className="rounded-2xl bg-white/10 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Validation
            </p>
            <p className="mt-3 leading-7">
              Name, username, email, password, and confirmation are all
              required before the demo account is saved.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Next step
            </p>
            <p className="mt-3 leading-7">
              After registration you can sign in with the same username or
              email and a generated demo token will be treated as authenticated.
            </p>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/login"
            className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Back to login
          </Link>
          <Link
            href="/products"
            className="rounded-full bg-teal-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-300"
          >
            Preview protected route
          </Link>
        </div>
      </div>

      <div className="rounded-[2.5rem] border border-black/10 bg-white/90 p-8 shadow-xl backdrop-blur sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">
          Register
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-slate-950">
          Create your demo credentials
        </h2>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm font-semibold text-slate-800">
                Full name
              </span>
              <input
                type="text"
                value={values.name}
                onChange={(event) => updateField("name", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-black/10 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white"
                placeholder="Alex Johnson"
                autoComplete="name"
              />
              {errors.name ? (
                <p className="mt-2 text-sm text-rose-600">{errors.name}</p>
              ) : null}
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-800">
                Username
              </span>
              <input
                type="text"
                value={values.username}
                onChange={(event) =>
                  updateField("username", event.target.value)
                }
                className="mt-2 w-full rounded-2xl border border-black/10 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white"
                placeholder="alexdemo"
                autoComplete="username"
              />
              {errors.username ? (
                <p className="mt-2 text-sm text-rose-600">{errors.username}</p>
              ) : null}
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-800">
                Email
              </span>
              <input
                type="email"
                value={values.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-black/10 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white"
                placeholder="alex@example.com"
                autoComplete="email"
              />
              {errors.email ? (
                <p className="mt-2 text-sm text-rose-600">{errors.email}</p>
              ) : null}
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-800">
                Password
              </span>
              <input
                type="password"
                value={values.password}
                onChange={(event) =>
                  updateField("password", event.target.value)
                }
                className="mt-2 w-full rounded-2xl border border-black/10 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white"
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
              {errors.password ? (
                <p className="mt-2 text-sm text-rose-600">{errors.password}</p>
              ) : null}
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-800">
                Confirm password
              </span>
              <input
                type="password"
                value={values.confirmPassword}
                onChange={(event) =>
                  updateField("confirmPassword", event.target.value)
                }
                className="mt-2 w-full rounded-2xl border border-black/10 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white"
                placeholder="Repeat your password"
                autoComplete="new-password"
              />
              {errors.confirmPassword ? (
                <p className="mt-2 text-sm text-rose-600">
                  {errors.confirmPassword}
                </p>
              ) : null}
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting ? "Saving demo account..." : "Create demo account"}
          </button>
        </form>
      </div>
    </section>
  );
}
