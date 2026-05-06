import ProductDetailsPageClient from "@/components/pages/ProductDetailsPageClient";

export default async function ProductDetailsPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;

  return <ProductDetailsPageClient productId={id} />;
}
