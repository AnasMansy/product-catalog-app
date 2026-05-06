import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";

import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types/product";

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    src,
    alt,
  }: {
    src: string;
    alt: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const product: Product = {
  id: 42,
  title: "Travel Backpack",
  description: "A compact carry-on backpack with hidden compartments.",
  category: "travel-accessories",
  price: 149.5,
  discountPercentage: 10,
  rating: 4.7,
  stock: 12,
  tags: ["travel", "bags"],
  brand: "Atlas Works",
  thumbnail: "https://dummyjson.com/image/400x300",
  images: ["https://dummyjson.com/image/400x300"],
};

describe("ProductCard", () => {
  it("renders the product content and link target", () => {
    render(<ProductCard product={product} />);

    expect(screen.getByRole("link")).toHaveAttribute("href", "/products/42");
    expect(screen.getByText("Travel Backpack")).toBeInTheDocument();
    expect(screen.getByText("$149.50")).toBeInTheDocument();
    expect(screen.getByText("travel accessories")).toBeInTheDocument();
    expect(screen.getByAltText("Travel Backpack")).toBeInTheDocument();
  });

  it("falls back to the default brand label when brand is missing", () => {
    render(
      <ProductCard
        product={{
          ...product,
          brand: undefined,
        }}
      />,
    );

    expect(screen.getByText("Independent label")).toBeInTheDocument();
  });
});
