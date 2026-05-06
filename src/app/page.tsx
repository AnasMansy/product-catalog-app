import Link from "next/link";

export default function HomePage() {
  return (
    <section className="space-y-10">
      <div className="glass-hero theme-foreground rounded-[2.75rem] p-8 sm:p-10 lg:p-12">
        <p className="app-accent-text text-xs font-semibold uppercase tracking-[0.32em]">
          Smart product catalog
        </p>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <h1 className="max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Discover products, explore categories, and view details in one
              clean catalog.
            </h1>

            <p className="theme-soft mt-6 max-w-2xl text-base leading-8">
              Browse a responsive product collection with real product data,
              search by title, filter by category, and open detailed product
              pages with images, prices, descriptions, and category information.
            </p>
          </div>

          <div className="theme-soft grid gap-3 text-sm">
            <div className="glass-stat rounded-2xl p-4">
              <p className="theme-muted text-xs uppercase tracking-[0.2em]">
                Catalog
              </p>
              <p className="mt-2 font-semibold">
                Products, categories, search, filters, and detailed views
              </p>
            </div>

            <div className="glass-stat rounded-2xl p-4">
              <p className="theme-muted text-xs uppercase tracking-[0.2em]">
                Access
              </p>
              <p className="mt-2 font-semibold">
                Protected routes with real DummyJSON auth and local demo login
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/products"
            className="app-contrast-button rounded-full px-6 py-3 text-sm font-semibold transition"
          >
            Browse products
          </Link>
           
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Catalog browsing",
            title: "Explore products",
            description:
              "View products in a responsive card layout with images, names, prices, and quick access to product details.",
          },
          {
            label: "Search",
            title: "Find products faster",
            description:
              "Use the search bar to quickly filter products by title and locate the item you are looking for.",
          },
          {
            label: "Categories",
            title: "Filter by category",
            description:
              "Switch between product categories to narrow the catalog and browse more relevant products.",
          },
          {
            label: "Details",
            title: "View full information",
            description:
              "Open any product to see its image, title, description, price, and category in a clean details page.",
          },
        ].map((item) => (
          <article
            key={item.title}
            className="glass-panel rounded-[2rem] p-6"
          >
            <p className="app-accent-text text-xs font-semibold uppercase tracking-[0.22em]">
              {item.label}
            </p>

            <h2 className="theme-foreground mt-4 text-2xl font-semibold">
              {item.title}
            </h2>

            <p className="theme-soft mt-3 text-sm leading-7">
              {item.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
