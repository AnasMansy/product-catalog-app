import Image from "next/image";
import Link from "next/link";

import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const heroImage = product.thumbnail || product.images[0];

  return (
    <Link
      href={`/products/${product.id}`}
      className="glass-panel group flex h-full flex-col overflow-hidden rounded-[2rem] transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="app-image-surface relative aspect-[4/3] overflow-hidden">
        <Image
          src={heroImage}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="glass-stat theme-soft absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em]">
          {product.category.replaceAll("-", " ")}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="theme-foreground text-lg font-semibold leading-7">
            {product.title}
          </h3>
          <span className="app-accent-chip rounded-full px-3 py-1 text-sm font-semibold">
            ${product.price.toFixed(2)}
          </span>
        </div>
        <p className="theme-soft mt-3 line-clamp-3 text-sm leading-7">
          {product.description}
        </p>
        <div className="theme-muted mt-5 flex items-center justify-between gap-3 text-sm">
          <span>{product.brand ?? "Independent label"}</span>
          <span>
            {product.rating.toFixed(1)} rating • {product.stock} in stock
          </span>
        </div>
      </div>
    </Link>
  );
}
