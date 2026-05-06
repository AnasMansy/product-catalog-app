import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getCategories,
  getProduct,
  getProducts,
  getProductsByCategory,
  searchProducts,
} from "@/lib/api";
import type { RootState } from "@/store/store";
import type { ProductState, ProductsResponse } from "@/types/product";

interface FetchProductsArgs {
  query?: string;
  category?: string | null;
  force?: boolean;
}

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

export const fetchProducts = createAsyncThunk<
  ProductsResponse,
  FetchProductsArgs | undefined,
  { rejectValue: string; state: RootState }
>(
  "products/fetchProducts",
  async (args, thunkApi) => {
    const query = normalizeValue(args?.query);
    const category = normalizeValue(args?.category);

    try {
      if (query) {
        return await searchProducts(query);
      }

      if (category) {
        return await getProductsByCategory(category);
      }

      return await getProducts();
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

      if (force) {
        return true;
      }

      if (
        products.listStatus === "succeeded" &&
        products.lastLoadedKey === cacheKey
      ) {
        return false;
      }

      return true;
    },
  },
);

export const fetchCategories = createAsyncThunk<
  Awaited<ReturnType<typeof getCategories>>,
  void,
  { rejectValue: string; state: RootState }
>(
  "products/fetchCategories",
  async (_, thunkApi) => {
    try {
      return await getCategories();
    } catch (error) {
      return thunkApi.rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (_, { getState }) => {
      const { products } = getState();

      if (products.categoriesStatus === "loading") {
        return false;
      }

      if (
        products.categoriesStatus === "succeeded" &&
        products.categories.length > 0
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

        state.listStatus = "succeeded";
        state.items = action.payload.products;
        state.error = null;
        state.lastLoadedKey = currentKey;
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
        state.categories = action.payload;
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
  setSearchQuery,
  setSelectedCategory,
} = productsSlice.actions;

export default productsSlice.reducer;
