import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import {
  getCategories,
  getProduct,
  getProducts,
  getProductsByCategory,
  searchProducts,
} from "@/lib/api";
import type { RootState } from "@/store/store";
import type {
  Category,
  ProductState,
  ProductsResponse,
} from "@/types/product";

interface FetchProductsArgs {
  query?: string;
  category?: string | null;
  force?: boolean;
  skip?: number;
  limit?: number;
  append?: boolean;
}

interface FetchProductsPayload extends ProductsResponse {
  cacheKey: string;
  fetchedAt: number;
  append: boolean;
  nextSkip: number;
  hasMore: boolean;
}

interface FetchCategoriesArgs {
  force?: boolean;
}

interface FetchCategoriesPayload {
  categories: Category[];
  fetchedAt: number;
}

const PRODUCT_CACHE_DURATION_MS = 5 * 60 * 1000;
export const PRODUCTS_PAGE_SIZE = 12;

const initialState: ProductState = {
  items: [],
  categories: [],
  selectedProduct: null,
  searchQuery: "",
  selectedCategory: null,
  listStatus: "idle",
  loadMoreStatus: "idle",
  categoriesStatus: "idle",
  detailsStatus: "idle",
  error: null,
  lastLoadedKey: null,
  lastFetched: null,
  categoriesLastFetched: null,
  total: 0,
  nextSkip: 0,
  hasMore: false,
  pageSize: PRODUCTS_PAGE_SIZE,
  cacheByKey: {},
};

function normalizeValue(value?: string | null): string {
  return value?.trim() ?? "";
}

function buildCacheKey({
  query,
  category,
}: Pick<FetchProductsArgs, "query" | "category">): string {
  return `${normalizeValue(query)}::${normalizeValue(category)}`;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to load product data right now.";
}

function isCacheExpired(timestamp: number | null): boolean {
  if (timestamp === null) {
    return true;
  }

  return Date.now() - timestamp >= PRODUCT_CACHE_DURATION_MS;
}

export const fetchProducts = createAsyncThunk<
  FetchProductsPayload,
  FetchProductsArgs | undefined,
  { rejectValue: string; state: RootState }
>(
  "products/fetchProducts",
  async (args, thunkApi) => {
    const query = normalizeValue(args?.query);
    const category = normalizeValue(args?.category);
    const skip = args?.skip ?? 0;
    const limit = args?.limit ?? PRODUCTS_PAGE_SIZE;
    const append = args?.append ?? false;
    const cacheKey = buildCacheKey({ query, category });
    const cachedEntry = thunkApi.getState().products.cacheByKey[cacheKey];

    if (
      !append &&
      cachedEntry &&
      !isCacheExpired(cachedEntry.fetchedAt) &&
      !args?.force
    ) {
      return {
        products: cachedEntry.products,
        total: cachedEntry.total,
        skip: 0,
        limit,
        cacheKey,
        fetchedAt: cachedEntry.fetchedAt,
        append: false,
        nextSkip: cachedEntry.nextSkip,
        hasMore: cachedEntry.hasMore,
      };
    }

    const fetchedAt = Date.now();

    try {
      if (query) {
        const response = await searchProducts(query, { limit, skip });
        return {
          ...response,
          cacheKey,
          fetchedAt,
          append,
          nextSkip: skip + response.products.length,
          hasMore: skip + response.products.length < response.total,
        };
      }

      if (category) {
        const response = await getProductsByCategory(category, { limit, skip });
        return {
          ...response,
          cacheKey,
          fetchedAt,
          append,
          nextSkip: skip + response.products.length,
          hasMore: skip + response.products.length < response.total,
        };
      }

      const response = await getProducts({ limit, skip });
      return {
        ...response,
        cacheKey,
        fetchedAt,
        append,
        nextSkip: skip + response.products.length,
        hasMore: skip + response.products.length < response.total,
      };
    } catch (error) {
      return thunkApi.rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (args, { getState }) => {
      const query = normalizeValue(args?.query);
      const category = normalizeValue(args?.category);
      const force = args?.force ?? false;
      const skip = args?.skip ?? 0;
      const limit = args?.limit ?? PRODUCTS_PAGE_SIZE;
      const append = args?.append ?? false;
      const cacheKey = buildCacheKey({ query, category });
      const { products } = getState();
      const cachedEntry = products.cacheByKey[cacheKey];

      if (force) {
        return true;
      }

      if (
        append &&
        products.loadMoreStatus === "loading" &&
        products.lastLoadedKey === cacheKey
      ) {
        return false;
      }

      if (
        !append &&
        products.listStatus === "loading" &&
        products.lastLoadedKey === cacheKey
      ) {
        return false;
      }

      if (append && cachedEntry && skip >= cachedEntry.total) {
        return false;
      }

      if (
        append &&
        cachedEntry &&
        !isCacheExpired(cachedEntry.fetchedAt) &&
        cachedEntry.products.length >= skip + limit
      ) {
        return false;
      }

      if (
        !append &&
        cachedEntry &&
        !isCacheExpired(cachedEntry.fetchedAt) &&
        products.lastLoadedKey === cacheKey
      ) {
        return false;
      }

      return true;
    },
  },
);

export const fetchCategories = createAsyncThunk<
  FetchCategoriesPayload,
  FetchCategoriesArgs | undefined,
  { rejectValue: string; state: RootState }
>(
  "products/fetchCategories",
  async (args, thunkApi) => {
    const { categories, categoriesLastFetched } = thunkApi.getState().products;

    if (
      categories.length > 0 &&
      !isCacheExpired(categoriesLastFetched) &&
      !args?.force
    ) {
      return {
        categories,
        fetchedAt: categoriesLastFetched ?? Date.now(),
      };
    }

    try {
      return {
        categories: await getCategories(),
        fetchedAt: Date.now(),
      };
    } catch (error) {
      return thunkApi.rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (args, { getState }) => {
      const { products } = getState();
      const force = args?.force ?? false;

      if (products.categoriesStatus === "loading") {
        return false;
      }

      if (
        !force &&
        products.categories.length > 0 &&
        !isCacheExpired(products.categoriesLastFetched)
      ) {
        return false;
      }

      return true;
    },
  },
);

export const fetchProductById = createAsyncThunk<
  Awaited<ReturnType<typeof getProduct>>,
  number,
  { rejectValue: string; state: RootState }
>(
  "products/fetchProductById",
  async (id, thunkApi) => {
    try {
      return await getProduct(id);
    } catch (error) {
      return thunkApi.rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (id, { getState }) => {
      const { products } = getState();

      if (products.detailsStatus === "loading") {
        return false;
      }

      if (
        products.detailsStatus === "succeeded" &&
        products.selectedProduct?.id === id
      ) {
        return false;
      }

      return true;
    },
  },
);

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    restoreProductsFromCache(
      state,
      action: PayloadAction<
        Pick<FetchProductsArgs, "query" | "category"> & {
          requestedAt: number;
        }
      >,
    ) {
      const cacheKey = buildCacheKey({
        query: action.payload.query,
        category: action.payload.category,
      });
      const cachedEntry = state.cacheByKey[cacheKey];

      if (
        !cachedEntry ||
        action.payload.requestedAt - cachedEntry.fetchedAt >=
          PRODUCT_CACHE_DURATION_MS
      ) {
        return;
      }

      state.items = cachedEntry.products;
      state.listStatus = "succeeded";
      state.loadMoreStatus = "idle";
      state.error = null;
      state.lastLoadedKey = cacheKey;
      state.lastFetched = cachedEntry.fetchedAt;
      state.total = cachedEntry.total;
      state.nextSkip = cachedEntry.nextSkip;
      state.hasMore = cachedEntry.hasMore;
      state.pageSize = cachedEntry.limit;
    },
    setSearchQuery(state, action: { payload: string }) {
      state.searchQuery = action.payload;
      state.error = null;
    },
    setSelectedCategory(state, action: { payload: string | null }) {
      state.selectedCategory = action.payload;
      state.error = null;
    },
    clearSelectedProduct(state) {
      state.selectedProduct = null;
      state.detailsStatus = "idle";
      state.error = null;
    },
    clearProductsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state, action) => {
        const append = action.meta.arg?.append ?? false;
        const actionKey = buildCacheKey({
          query: action.meta.arg?.query,
          category: action.meta.arg?.category,
        });

        state.error = null;

        if (append) {
          state.loadMoreStatus = "loading";
          return;
        }

        state.listStatus = "loading";
        state.loadMoreStatus = "idle";
        state.lastLoadedKey = actionKey;

        if (!state.cacheByKey[actionKey] || isCacheExpired(state.cacheByKey[actionKey].fetchedAt)) {
          state.items = [];
          state.total = 0;
          state.nextSkip = 0;
          state.hasMore = false;
        }
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        const actionKey = action.payload.cacheKey;
        const currentKey = buildCacheKey({
          query: state.searchQuery,
          category: state.selectedCategory,
        });

        if (actionKey !== currentKey) {
          return;
        }

        state.listStatus = "succeeded";
        state.loadMoreStatus = "idle";
        state.items = action.payload.append
          ? [
              ...state.items,
              ...action.payload.products.filter(
                (incomingProduct) =>
                  !state.items.some(
                    (currentProduct) => currentProduct.id === incomingProduct.id,
                  ),
              ),
            ]
          : action.payload.products;
        state.error = null;
        state.lastLoadedKey = currentKey;
        state.lastFetched = action.payload.fetchedAt;
        state.total = action.payload.total;
        state.nextSkip = action.payload.nextSkip;
        state.hasMore = action.payload.hasMore;
        state.pageSize = action.payload.limit;
        state.cacheByKey[action.payload.cacheKey] = {
          products: state.items,
          total: action.payload.total,
          skip: 0,
          limit: action.payload.limit,
          fetchedAt: action.payload.fetchedAt,
          nextSkip: action.payload.nextSkip,
          hasMore: action.payload.hasMore,
        };
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        const actionKey = buildCacheKey({
          query: action.meta.arg?.query,
          category: action.meta.arg?.category,
        });
        const append = action.meta.arg?.append ?? false;
        const currentKey = buildCacheKey({
          query: state.searchQuery,
          category: state.selectedCategory,
        });

        if (actionKey !== currentKey) {
          return;
        }

        if (append) {
          state.loadMoreStatus = "failed";
          state.error = action.payload ?? "Unable to load more products.";
          return;
        }

        state.listStatus = "failed";
        state.loadMoreStatus = "idle";
        state.error = action.payload ?? "Unable to load products.";
      })
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesStatus = "loading";
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesStatus = "succeeded";
        state.categories = action.payload.categories;
        state.categoriesLastFetched = action.payload.fetchedAt;
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categoriesStatus = "failed";
        state.error = action.payload ?? "Unable to load categories.";
      })
      .addCase(fetchProductById.pending, (state) => {
        state.detailsStatus = "loading";
        state.selectedProduct = null;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.detailsStatus = "succeeded";
        state.selectedProduct = action.payload;
        state.error = null;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.detailsStatus = "failed";
        state.error = action.payload ?? "Unable to load product details.";
      });
  },
});

export const {
  clearProductsError,
  clearSelectedProduct,
  restoreProductsFromCache,
  setSearchQuery,
  setSelectedCategory,
} = productsSlice.actions;

export default productsSlice.reducer;
