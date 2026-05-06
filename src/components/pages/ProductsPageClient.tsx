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
  PRODUCTS_PAGE_SIZE,
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
    hasMore,
    items,
    listStatus,
    loadMoreStatus,
    nextSkip,
    selectedCategory,
    total,
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
        skip: 0,
        limit: PRODUCTS_PAGE_SIZE,
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
        skip: 0,
        limit: PRODUCTS_PAGE_SIZE,
        force: true,
      }),
    );
  };

  const handleLoadMore = () => {
    void dispatch(
      fetchProducts({
        query: searchQuery,
        category: selectedCategory,
        skip: nextSkip,
        limit: PRODUCTS_PAGE_SIZE,
        append: true,
      }),
    );
  };

  const selectedCategoryName = selectedCategory
    ? categories.find((category) => category.slug === selectedCategory)?.name
    : null;

  return (
    <ProtectedRoute>
      <section className="space-y-8">
        <div className="glass-hero theme-foreground rounded-[2.5rem] p-8 sm:p-10">
          <p className="app-warm-text text-xs font-semibold uppercase tracking-[0.28em]">
            Product catalog
          </p>

          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
                Browse products, compare prices, and explore every category.
              </h1>

              <p className="theme-soft mt-4 max-w-2xl text-base leading-8">
                Discover products in a clean responsive catalog. Use search to
                find items quickly, filter by category, and open any product to
                view its full details, image, price, and description.
              </p>
            </div>

            <div className="theme-soft grid gap-3 text-sm sm:grid-cols-3">
              <div className="glass-stat rounded-2xl p-4">
                <p className="theme-muted text-xs uppercase tracking-[0.2em]">
                  Catalog status
                </p>
                <p className="mt-2 font-semibold capitalize">{listStatus}</p>
              </div>

              <div className="glass-stat rounded-2xl p-4">
                <p className="theme-muted text-xs uppercase tracking-[0.2em]">
                  Showing
                </p>
                <p className="mt-2 font-semibold">{items.length} products</p>
              </div>

              <div className="glass-stat rounded-2xl p-4">
                <p className="theme-muted text-xs uppercase tracking-[0.2em]">
                  Current view
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

        <div className="flex flex-col justify-between">
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
          <div className="app-empty rounded-[2.5rem] p-10 text-center">
            <p className="theme-muted text-xs font-semibold uppercase tracking-[0.24em]">
              Empty state
            </p>
            <h2 className="theme-foreground mt-4 text-2xl font-semibold">
              No products matched this filter.
            </h2>
            <p className="theme-soft mt-3 text-sm leading-7">
              Clear the search box or switch back to all products to repopulate
              the grid.
            </p>
          </div>
        ) : null}

        {items.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="flex flex-col items-center gap-4 pt-2">
              <p className="theme-muted text-sm">
                Showing {items.length} of {total} products
              </p>

              {hasMore ? (
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadMoreStatus === "loading"}
                  className="app-contrast-button rounded-full px-6 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:bg-slate-400 disabled:text-white"
                >
                  {loadMoreStatus === "loading"
                    ? "Loading more products..."
                    : "Load more products"}
                </button>
              ) : (
                <p className="theme-soft text-sm font-medium">
                  All available products are loaded.
                </p>
              )}
            </div>
          </>
        ) : null}
      </section>
    </ProtectedRoute>
  );
}
