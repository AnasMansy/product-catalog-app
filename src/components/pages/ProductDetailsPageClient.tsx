'use client';

import { useEffect, useState } from "react";
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

interface ProductImageGalleryProps {
  productId: number;
  productTitle: string;
  thumbnail: string;
  images: string[];
}

const PRODUCT_IMAGE_FALLBACK = "/window.svg";
const MIN_ZOOM_LEVEL = 1;
const MAX_ZOOM_LEVEL = 3;
const ZOOM_STEP = 0.25;

function ProductImageGallery({
  productId,
  productTitle,
  thumbnail,
  images,
}: ProductImageGalleryProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(MIN_ZOOM_LEVEL);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isZoomOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsZoomOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isZoomOpen]);

  const handleImageError = (src: string) => {
    setFailedImages((current) => ({
      ...current,
      [src]: true,
    }));
  };

  const galleryImages = Array.from(
    new Set(
      [thumbnail, ...images].filter(
        (image): image is string => Boolean(image && !failedImages[image]),
      ),
    ),
  );
  const safeImageIndex =
    galleryImages.length === 0
      ? 0
      : Math.min(activeImageIndex, galleryImages.length - 1);
  const activeImage = galleryImages[safeImageIndex] ?? PRODUCT_IMAGE_FALLBACK;
  const canZoomIn = zoomLevel < MAX_ZOOM_LEVEL;
  const canZoomOut = zoomLevel > MIN_ZOOM_LEVEL;

  return (
    <>
      <div className="overflow-hidden rounded-[2.5rem] border border-black/10 bg-white/90 shadow-xl">
        <button
          type="button"
          onClick={() => setIsZoomOpen(true)}
          className="group relative block aspect-[4/3] w-full overflow-hidden bg-slate-100 text-left"
        >
          <Image
            src={activeImage}
            alt={productTitle}
            fill
            priority
            unoptimized
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-contain p-6 transition duration-300 group-hover:scale-[1.03]"
            onError={() => handleImageError(activeImage)}
          />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-slate-950/70 to-transparent px-5 py-4 text-sm text-white">
            <span className="font-semibold">Click image to zoom</span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs uppercase tracking-[0.16em]">
              {galleryImages.length} views
            </span>
          </div>
        </button>

        <div className="border-t border-black/5 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Gallery
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Use the thumbnails to switch images. The main image opens a zoomed
            preview.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
          {galleryImages.length > 0 ? (
            galleryImages.slice(0, 8).map((image, index) => (
              <button
                key={`${productId}-${image}-${index}`}
                type="button"
                onClick={() => setActiveImageIndex(index)}
                className={[
                  "relative aspect-square overflow-hidden rounded-2xl border bg-slate-100 transition",
                  safeImageIndex === index
                    ? "border-teal-500 ring-2 ring-teal-200"
                    : "border-black/10 hover:border-teal-300",
                ].join(" ")}
              >
                <Image
                  src={image}
                  alt={`${productTitle} preview ${index + 1}`}
                  fill
                  unoptimized
                  sizes="200px"
                  className="object-contain p-2"
                  onError={() => handleImageError(image)}
                />
              </button>
            ))
          ) : (
            <div className="col-span-full flex aspect-[4/3] items-center justify-center rounded-2xl border border-dashed border-black/10 bg-slate-50 text-sm text-slate-500">
              Product images are unavailable for this item.
            </div>
          )}
        </div>
      </div>

      {isZoomOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close zoomed image"
            onClick={() => setIsZoomOpen(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            Close
          </button>

          <div className="absolute left-4 top-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setZoomLevel((current) =>
                  Math.max(MIN_ZOOM_LEVEL, current - ZOOM_STEP),
                )
              }
              disabled={!canZoomOut}
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Zoom out
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(MIN_ZOOM_LEVEL)}
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() =>
                setZoomLevel((current) =>
                  Math.min(MAX_ZOOM_LEVEL, current + ZOOM_STEP),
                )
              }
              disabled={!canZoomIn}
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Zoom in
            </button>
          </div>

          <div className="relative flex h-[80vh] w-full max-w-6xl items-center justify-center overflow-hidden rounded-[2rem] bg-white/5">
            <Image
              src={activeImage}
              alt={`${productTitle} zoomed view`}
              fill
              unoptimized
              sizes="100vw"
              className="object-contain p-6 transition duration-200"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: "center center",
              }}
              onError={() => handleImageError(activeImage)}
            />
          </div>
        </div>
      ) : null}
    </>
  );
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
          <ProductImageGallery
            key={selectedProduct.id}
            productId={selectedProduct.id}
            productTitle={selectedProduct.title}
            thumbnail={selectedProduct.thumbnail}
            images={selectedProduct.images}
          />

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
