"use client";

import React, { useEffect, useState } from "react";
import { Package } from "lucide-react";
import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { fetchRecentGifticons } from "@/lib/dashboard";
import Link from "next/link";

interface ProductData {
  id: string;
  name: string;
  price: number;
  image: string;
  metadata: string;
  category?: string;
  brand?: string;
}

export default function RecentProducts() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchRecentGifticons();
        const mapped = data.slice(0, 4).map((item: any) => ({
          id: String(item.gifticonId),
          name: item.gifticonTitle,
          price: item.price,
          image: item.imageUrl || "/placeholder.svg",
          metadata: "", // 빈 값 또는 추후 필요한 값으로
          category: item.categoryName,
          brand: item.brandName
        }));
        setProducts(mapped);
      } catch (err) {
        console.error("Failed to fetch recent products", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">최근 등록된 상품</h2>
        <Link href="/products/search" className="text-blue-600 hover:underline text-sm">
          모든 상품 보기 →
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium">등록된 상품이 없습니다</h3>
          <p className="text-gray-500 mt-2 mb-4">새 상품을 등록해보세요.</p>
          <Link href="/products/register">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">+ 상품 등록</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              image={product.image}
              metadata={product.metadata}
              category={product.category}
              brand={product.brand}
            />
          ))}
        </div>
      )}
    </>
  );
}