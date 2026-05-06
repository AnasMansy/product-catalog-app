import Link from "next/link";

export default function HomePage() {
  return (
    <section className="space-y-10">
      <div className="rounded-[2.75rem] border border-black/10 bg-slate-950 p-8 text-white shadow-xl sm:p-10 lg:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-300">
          Next.js product management starter
        </p>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <h1 className="max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              A responsive App Router frontend wired for auth, products, and
              scalable state.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">
              The starter includes Redux Toolkit slices, a typed DummyJSON API
              layer, protected catalog routes, Tailwind styling, reusable
              components, and page-level placeholders you can build on.
            </p>
          </div>
          <div className="grid gap-3 text-sm text-slate-300">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Stack
              </p>
              <p className="mt-2 font-semibold">
                Next.js 16, React 19, TypeScript, Redux Toolkit, Tailwind 4
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Routes
              </p>
              <p className="mt-2 font-semibold">
                Login, register, products, dynamic product details
              </p>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/login"
            className="rounded-full bg-teal-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-400"
          >
            Open login flow
          </Link>
          <Link
            href="/products"
            className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Jump to protected products
          </Link>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Authentication slice",
            description:
              "Handles login, logout, token storage, user profile state, and localStorage hydration.",
          },
          {
            title: "Products slice",
            description:
              "Handles category loading, search state, selected product state, error states, and cache-aware requests.",
          },
          {
            title: "Reusable UI",
            description:
              "Includes Navbar, SearchBar, CategoryFilter, ProductCard, LoadingSpinner, ErrorMessage, and ProtectedRoute.",
          },
          {
            title: "Frontend-only setup",
            description:
              "Consumes the DummyJSON public API directly with no custom backend or API routes required.",
          },
        ].map((item) => (
          <article
            key={item.title}
            className="rounded-[2rem] border border-black/10 bg-white/90 p-6 shadow-sm backdrop-blur"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
              Starter area
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-slate-950">
              {item.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {item.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
