"use client";

import ProductCard from "@/components/product-card";

export default function ProductGrid({
  products,
  openMintModal,
}: {
  products: any[];
  openMintModal: (gifticonId: string) => void;
}) {
  const toValidImageUrl = (
    url: string | null | undefined
  ): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith("http")) return url;
    if (url.startsWith("ipfs://"))
      return `https://ipfs.io/ipfs/${url.replace("ipfs://", "")}`;
    return undefined;
  };

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <div key={product.gifticonId}>
          <ProductCard
            key={product.gifticonId}
            id={String(product.gifticonId)}
            name={product.gifticonTitle ?? "제목 없음"}
            price={Math.floor(product.price)}
            metadata={product.metadata}
            image={toValidImageUrl(product.imageUrl) ?? "/default.png"}
            category={product.categoryName ?? "기타"}
            brand={product.brandName ?? "브랜드 없음"}
            openMintModal={() => openMintModal(product)}
          />
        </div>
      ))}
    </div>
  );
}
