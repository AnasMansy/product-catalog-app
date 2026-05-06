"use client";

import type { Category } from "@/types/product";

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  isLoading?: boolean;
  onSelectCategory: (category: string | null) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  isLoading = false,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <section className="glass-panel mt-2 w-full rounded-3xl p-4 sm:p-5 lg:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="app-accent-text text-xs font-semibold uppercase tracking-[0.18em] sm:tracking-[0.2em]">
            Browse by category
          </p>

          <p className="theme-soft mt-1 max-w-2xl text-sm leading-6">
            Switch between the full catalog and category-specific lists.
          </p>
        </div>

        {isLoading ? (
          <span className="glass-stat theme-muted w-fit rounded-full px-3 py-1 text-xs font-medium">
            Loading...
          </span>
        ) : null}
      </div>

      <div className="mt-4 -mx-1 overflow-x-auto pb-2">
        <div className="flex min-w-max gap-2 px-1 sm:min-w-0 sm:flex-wrap">
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            aria-pressed={selectedCategory === null}
            className={[
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition",
              "focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:ring-offset-2",
              selectedCategory === null
                ? "app-contrast-button shadow-sm"
                : "glass-stat theme-soft hover:brightness-105",
            ].join(" ")}
          >
            All products
          </button>

          {categories.map((category) => {
            const isActive = selectedCategory === category.slug;

            return (
              <button
                key={category.slug}
                type="button"
                onClick={() => onSelectCategory(category.slug)}
                aria-pressed={isActive}
                className={[
                  "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition",
                  "focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:ring-offset-2",
                  isActive
                    ? "bg-teal-600 text-white shadow-sm"
                    : "glass-stat theme-soft hover:brightness-105",
                ].join(" ")}
              >
                {category.name}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
