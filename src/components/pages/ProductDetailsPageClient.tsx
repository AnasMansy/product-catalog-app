'use client';

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import ErrorMessage from "@/components/ErrorMessage";
import LoadingSpinner from "@/components/LoadingSpinner";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearSelectedProduct,
  fetchProductById,
} from "@/store/slices/productsSlice";

interface ProductDetailsPageClientProps {
  productId: string;
}

export default function ProductDetailsPageClient({
  productId,
}: ProductDetailsPageClientProps) {
  const dispatch = useAppDispatch();
  const { detailsStatus, error, selectedProduct } = useAppSelector(
    (state) => state.products,
  );
  const numericId = Number(productId);

  useEffect(() => {
    if (!Number.isInteger(numericId)) {
      return;
    }

    void dispatch(fetchProductById(numericId));

    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [dispatch, numericId]);

  const handleRetry = () => {
    if (!Number.isInteger(numericId)) {
      return;
    }

    void dispatch(fetchProductById(numericId));
  };

  let content: React.ReactNode = null;

  if (!Number.isInteger(numericId)) {
    content = (
      <ErrorMessage
        title="Invalid product id"
        message="The requested product identifier is not valid."
      />
    );
  } else if (detailsStatus === "loading" && !selectedProduct) {
    content = <LoadingSpinner label="Loading product details..." fullscreen />;
  } else if (error) {
    content = (
      <ErrorMessage
        title="Unable to load product details"
        message={error}
        actionLabel="Retry"
        onAction={handleRetry}
      />
    );
  } else if (!selectedProduct) {
    content = (
      <div className="rounded-[2.5rem] border border-dashed border-black/15 bg-white/80 p-10 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Empty state
        </p>
        <h2 className="mt-4 text-2xl font-semibold text-slate-950">
          Product details are not available yet.
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Try loading the item again or go back to the product grid.
        </p>
      </div>
    );
  } else {
    content = (
      <section className="space-y-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/products"
            className="rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white"
          >
            Back to products
          </Link>
          <span className="rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700">
            {selectedProduct.category.replaceAll("-", " ")}
          </span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-[2.5rem] border border-black/10 bg-white/90 shadow-xl">
            <div className="relative aspect-[4/3] bg-slate-100">
              <Image
                src={selectedProduct.thumbnail || selectedProduct.images[0]}
                alt={selectedProduct.title}
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
              {selectedProduct.images.slice(0, 4).map((image, index) => (
                <div
                  key={`${selectedProduct.id}-${image}-${index}`}
                  className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100"
                >
                  <Image
                    src={image}
                    alt={`${selectedProduct.title} preview ${index + 1}`}
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-black/10 bg-slate-950 p-8 text-white shadow-xl sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">
              Product details
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight">
              {selectedProduct.title}
            </h1>
            <p className="mt-5 text-base leading-8 text-slate-300">
              {selectedProduct.description}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Price
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  ${selectedProduct.price.toFixed(2)}
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Rating
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {selectedProduct.rating.toFixed(1)}
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Brand
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {selectedProduct.brand ?? "Independent label"}
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Stock
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {selectedProduct.stock} units
                </p>
              </div>
            </div>

            <dl className="mt-8 space-y-4 text-sm text-slate-300">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                <dt className="font-semibold text-white">Availability</dt>
                <dd>{selectedProduct.availabilityStatus ?? "Available"}</dd>
              </div>
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                <dt className="font-semibold text-white">Warranty</dt>
                <dd>{selectedProduct.warrantyInformation ?? "Not provided"}</dd>
              </div>
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                <dt className="font-semibold text-white">Shipping</dt>
                <dd>{selectedProduct.shippingInformation ?? "Standard"}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="font-semibold text-white">Tags</dt>
                <dd className="text-right">
                  {selectedProduct.tags.length > 0
                    ? selectedProduct.tags.join(", ")
                    : "None"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    );
  }

  return <ProtectedRoute>{content}</ProtectedRoute>;
}
