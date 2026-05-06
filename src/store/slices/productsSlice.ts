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
}

interface FetchProductsPayload extends ProductsResponse {
  cacheKey: string;
  fetchedAt: number;
}

interface FetchCategoriesArgs {
  force?: boolean;
}

interface FetchCategoriesPayload {
  categories: Category[];
  fetchedAt: number;
}

const PRODUCT_CACHE_DURATION_MS = 5 * 60 * 1000;

const initialState: ProductState = {
  items: [],
  categories: [],
  selectedProduct: null,
  searchQuery: "",
  selectedCategory: null,
  listStatus: "idle",
  categoriesStatus: "idle",
  detailsStatus: "idle",
  error: null,
  lastLoadedKey: null,
  lastFetched: null,
  categoriesLastFetched: null,
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
    const cacheKey = buildCacheKey({ query, category });
    const cachedEntry = thunkApi.getState().products.cacheByKey[cacheKey];

    if (cachedEntry && !isCacheExpired(cachedEntry.fetchedAt) && !args?.force) {
      return {
        ...cachedEntry,
        cacheKey,
      };
    }

    const fetchedAt = Date.now();

    try {
      if (query) {
        const response = await searchProducts(query);
        return {
          ...response,
          cacheKey,
          fetchedAt,
        };
      }

      if (category) {
        const response = await getProductsByCategory(category);
        return {
          ...response,
          cacheKey,
          fetchedAt,
        };
      }

      const response = await getProducts();
      return {
        ...response,
        cacheKey,
        fetchedAt,
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
      const cacheKey = buildCacheKey({ query, category });
      const { products } = getState();
      const cachedEntry = products.cacheByKey[cacheKey];

      if (force) {
        return true;
      }

      if (products.listStatus === "loading" && products.lastLoadedKey === cacheKey) {
        return false;
      }

      if (
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
      state.error = null;
      state.lastLoadedKey = cacheKey;
      state.lastFetched = cachedEntry.fetchedAt;
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
      .addCase(fetchProducts.pending, (state) => {
        state.listStatus = "loading";
        state.error = null;
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
        state.items = action.payload.products;
        state.error = null;
        state.lastLoadedKey = currentKey;
        state.lastFetched = action.payload.fetchedAt;
        state.cacheByKey[action.payload.cacheKey] = {
          products: action.payload.products,
          total: action.payload.total,
          skip: action.payload.skip,
          limit: action.payload.limit,
          fetchedAt: action.payload.fetchedAt,
        };
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        const actionKey = buildCacheKey({
          query: action.meta.arg?.query,
          category: action.meta.arg?.category,
        });
        const currentKey = buildCacheKey({
          query: state.searchQuery,
          category: state.selectedCategory,
        });

        if (actionKey !== currentKey) {
          return;
        }

        state.listStatus = "failed";
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
