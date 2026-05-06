'use client';

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
    <div className="rounded-[2rem] border border-black/10 bg-white/80 p-4 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
            Browse by category
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Switch between the full catalog and category-specific lists.
          </p>
        </div>
        {isLoading ? (
          <span className="text-xs font-medium text-slate-500">
            Loading...
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          className={[
            "whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition",
            selectedCategory === null
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200",
          ].join(" ")}
        >
          All products
        </button>
        {categories.map((category) => (
          <button
            key={category.slug}
            type="button"
            onClick={() => onSelectCategory(category.slug)}
            className={[
              "whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition",
              selectedCategory === category.slug
                ? "bg-teal-600 text-white"
                : "bg-amber-50 text-slate-700 hover:bg-amber-100",
            ].join(" ")}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
