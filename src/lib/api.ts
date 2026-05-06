import type { AuthResponse, LoginCredentials } from "@/types/auth";
import type { Category, Product, ProductsResponse } from "@/types/product";

const DEFAULT_API_BASE_URL = "https://dummyjson.com";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;
const PUBLIC_REVALIDATE_SECONDS = 300;

type ApiRequestInit = RequestInit & {
  next?: {
    revalidate?: number;
    tags?: string[];
  };
};

interface ProductListQuery {
  limit?: number;
  skip?: number;
}

function createHeaders(
  headers?: HeadersInit,
  hasBody?: boolean,
): Headers {
  const resolvedHeaders = new Headers(headers);
  resolvedHeaders.set("Accept", "application/json");

  if (hasBody && !resolvedHeaders.has("Content-Type")) {
    resolvedHeaders.set("Content-Type", "application/json");
  }

  return resolvedHeaders;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while calling DummyJSON.";
}

async function request<T>(
  path: string,
  options: ApiRequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: createHeaders(options.headers, Boolean(options.body)),
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}.`;

    try {
      const payload = (await response.json()) as { message?: string };
      if (payload.message) {
        message = payload.message;
      }
    } catch { 
    }

    throw new Error(message);
  }

  try {
    return (await response.json()) as T;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

function buildPublicGetOptions(tags: string[]): ApiRequestInit {
  return {
    cache: "force-cache",
    next: {
      revalidate: PUBLIC_REVALIDATE_SECONDS,
      tags,
    },
  };
}

function buildProductListQueryString({
  limit,
  skip,
}: ProductListQuery): string {
  const params = new URLSearchParams();

  if (typeof limit === "number") {
    params.set("limit", String(limit));
  }

  if (typeof skip === "number") {
    params.set("skip", String(skip));
  }

  const queryString = params.toString();

  return queryString ? `?${queryString}` : "";
}

export function loginUser(
  credentials: LoginCredentials,
): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      ...credentials,
      expiresInMins: credentials.expiresInMins ?? 60,
    }),
    credentials: "include",
    cache: "no-store",
  });
}

export function getProducts(query: ProductListQuery = {}): Promise<ProductsResponse> {
  const queryString = buildProductListQueryString(query);

  return request<ProductsResponse>(
    `/products${queryString}`,
    buildPublicGetOptions([`products${queryString}`]),
  );
}

export function searchProducts(
  query: string,
  pagination: ProductListQuery = {},
): Promise<ProductsResponse> {
  const queryString = buildProductListQueryString(pagination);

  return request<ProductsResponse>(
    `/products/search?q=${encodeURIComponent(query)}${
      queryString ? `&${queryString.slice(1)}` : ""
    }`,
    buildPublicGetOptions([
      `products-search-${query}-${pagination.limit ?? "default"}-${
        pagination.skip ?? 0
      }`,
    ]),
  );
}

export function getCategories(): Promise<Category[]> {
  return request<Category[]>(
    "/products/categories",
    buildPublicGetOptions(["product-categories"]),
  );
}

export function getProductsByCategory(
  category: string,
  pagination: ProductListQuery = {},
): Promise<ProductsResponse> {
  const queryString = buildProductListQueryString(pagination);

  return request<ProductsResponse>(
    `/products/category/${encodeURIComponent(category)}${queryString}`,
    buildPublicGetOptions([
      `products-category-${category}-${pagination.limit ?? "default"}-${
        pagination.skip ?? 0
      }`,
    ]),
  );
}

export function getProduct(id: number): Promise<Product> {
  return request<Product>(
    `/products/${id}`,
    buildPublicGetOptions([`product-${id}`]),
  );
}
