import type { RequestStatus } from "@/types/auth";

export interface Category {
  slug: string;
  name: string;
  url: string;
}

export interface ProductDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface ProductReview {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export interface ProductMeta {
  createdAt?: string;
  updatedAt?: string;
  barcode?: string;
  qrCode?: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand?: string;
  sku?: string;
  weight?: number;
  dimensions?: ProductDimensions;
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  reviews?: ProductReview[];
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  meta?: ProductMeta;
  thumbnail: string;
  images: string[];
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface CachedProductList extends ProductsResponse {
  fetchedAt: number;
  nextSkip: number;
  hasMore: boolean;
}

export interface ProductState {
  items: Product[];
  categories: Category[];
  selectedProduct: Product | null;
  searchQuery: string;
  selectedCategory: string | null;
  listStatus: RequestStatus;
  categoriesStatus: RequestStatus;
  detailsStatus: RequestStatus;
  error: string | null;
  lastLoadedKey: string | null;
  lastFetched: number | null;
  categoriesLastFetched: number | null;
  total: number;
  nextSkip: number;
  hasMore: boolean;
  pageSize: number;
  loadMoreStatus: RequestStatus;
  cacheByKey: Record<string, CachedProductList>;
}
