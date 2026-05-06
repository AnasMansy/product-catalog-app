'use client';

import {
  startTransition,
  useDeferredValue,
  useEffect,
  useState,
} from "react";

import CategoryFilter from "@/components/CategoryFilter";
import ErrorMessage from "@/components/ErrorMessage";
import LoadingSpinner from "@/components/LoadingSpinner";
import ProductCard from "@/components/ProductCard";
import ProtectedRoute from "@/components/ProtectedRoute";
import SearchBar from "@/components/SearchBar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchCategories,
  fetchProducts,
  restoreProductsFromCache,
  setSearchQuery,
  setSelectedCategory,
} from "@/store/slices/productsSlice";

export default function ProductsPageClient() {
  const dispatch = useAppDispatch();
  const { searchQuery } = useAppSelector((state) => state.products);
  const [draftSearchQuery, setDraftSearchQuery] = useState(searchQuery);
  const deferredSearchQuery = useDeferredValue(draftSearchQuery);
  const {
    categories,
    categoriesStatus,
    error,
    items,
    listStatus,
    selectedCategory,
  } = useAppSelector((state) => state.products);

  useEffect(() => {
    void dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const normalizedQuery = deferredSearchQuery.trim();

    if (normalizedQuery !== searchQuery) {
      startTransition(() => {
        dispatch(setSearchQuery(normalizedQuery));

        if (normalizedQuery) {
          dispatch(setSelectedCategory(null));
        }
      });
      return;
    }

    dispatch(
      restoreProductsFromCache({
        query: searchQuery,
        category: selectedCategory,
        requestedAt: Date.now(),
      }),
    );

    void dispatch(
      fetchProducts({
        query: searchQuery,
        category: selectedCategory,
      }),
    );
  }, [deferredSearchQuery, dispatch, searchQuery, selectedCategory]);

  const handleSearchChange = (value: string) => {
    setDraftSearchQuery(value);
  };

  const handleCategorySelect = (value: string | null) => {
    startTransition(() => {
      dispatch(setSelectedCategory(value));
      dispatch(setSearchQuery(""));
    });
    setDraftSearchQuery("");
  };

  const handleRetry = () => {
    void dispatch(fetchCategories({ force: true }));
    void dispatch(
      fetchProducts({
        query: searchQuery,
        category: selectedCategory,
        force: true,
      }),
    );
  };

  const selectedCategoryName = selectedCategory
    ? categories.find((category) => category.slug === selectedCategory)?.name
    : null;

  return (
    <ProtectedRoute>
      <section className="space-y-8">
        <div className="rounded-[2.5rem] border border-black/10 bg-slate-950 p-8 text-white shadow-xl sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">
            Product management starter
          </p>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
                Search, filter, and inspect a public product catalog.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
                Redux Toolkit keeps query state, category state, loading,
                errors, and product details in one predictable store.
              </p>
            </div>
            <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Status
                </p>
                <p className="mt-2 font-semibold capitalize">{listStatus}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Products
                </p>
                <p className="mt-2 font-semibold">{items.length}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Active filter
                </p>
                <p className="mt-2 font-semibold">
                  {searchQuery
                    ? `Search: ${searchQuery}`
                    : selectedCategoryName ?? "All products"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
          <SearchBar
            value={draftSearchQuery}
            onValueChange={handleSearchChange}
          />
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            isLoading={categoriesStatus === "loading"}
            onSelectCategory={handleCategorySelect}
          />
        </div>

        {error && listStatus === "failed" ? (
          <ErrorMessage
            title="Catalog request failed"
            message={error}
            actionLabel="Try again"
            onAction={handleRetry}
          />
        ) : null}

        {listStatus === "loading" && items.length === 0 ? (
          <LoadingSpinner label="Loading products from DummyJSON..." fullscreen />
        ) : null}

        {listStatus !== "loading" && items.length === 0 && !error ? (
          <div className="rounded-[2.5rem] border border-dashed border-black/15 bg-white/80 p-10 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Empty state
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-slate-950">
              No products matched this filter.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Clear the search box or switch back to all products to repopulate
              the grid.
            </p>
          </div>
        ) : null}

        {items.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : null}
      </section>
    </ProtectedRoute>
  );
}
