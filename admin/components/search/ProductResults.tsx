"use client";

import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import ProductGrid from "./ProductGrid";
import ProductTable from "./ProductTable";
import Link from "next/link";
import React from "react";

type Product = {
  id: string;
  name: string;
  price: number;
  brand: string;
  metadata: string;
  category: string;
  createdAt?: string;
};

type Props = {
  products: Product[];
  viewMode: "grid" | "table";
  hasSearched: boolean;
  openMintModal: (gifticonId: string) => void;
};

export default function ProductResults({
  products,
  viewMode,
  hasSearched,
  openMintModal,
}: Props) {
  const totalCount = products.length;

  if (totalCount === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium">
          {hasSearched ? "검색 결과가 없습니다" : "등록된 상품이 없습니다"}
        </h3>
        <p className="text-gray-500 mt-2 mb-4">
          {hasSearched
            ? "다른 검색어나 필터를 사용해보세요."
            : "새 상품을 등록해보세요."}
        </p>
        {hasSearched ? (
          <Button variant="outline">모든 상품 보기</Button>
        ) : (
          <Link href="/products/register">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              + 상품 등록
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* 결과 헤더 */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">
          {hasSearched
            ? `검색 결과: ${totalCount}개`
            : `전체 상품: ${totalCount}개`}
        </h2>
      </div>

      {/* 결과 렌더링 */}
      {viewMode === "grid" ? (
        <ProductGrid products={products} openMintModal={openMintModal} />
      ) : (
        <ProductTable products={products} openMintModal={openMintModal} />
      )}
    </div>
  );
}
