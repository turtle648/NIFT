"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProductDetails from "@/components/details/product-details";
import ProductImage from "@/components/details/product-image";
import PageHeader from "@/components/page-header";

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gifticons/${params.id}`);
        if (!res.ok) throw new Error("상품을 찾을 수 없습니다.");
        const data = await res.json();
        setProduct(data);
      } catch (err: any) {
        setError(err.message || "오류가 발생했습니다.");
        setTimeout(() => router.push("/products/search"), 3000);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-lg font-medium">{error}</p>
        <p className="text-gray-500 mt-2 mb-4">잠시 후 검색 페이지로 이동합니다.</p>
        <Link href="/products/search">
          <Button variant="outline">지금 이동하기</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href="/products/search">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      <div>
        <PageHeader title="상품 상세" description="NFT 기프티콘 상품의 상세 정보입니다." />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <ProductImage imageUrl={product.imageUrl} altText={product.gifticonTitle} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <ProductDetails
              name={product.gifticonTitle}
              price={product.price}
              category={product.categoryName}
              brand={product.brandName}
              validity={product.validUntil || "없음"}
              createdAt={product.createdAt?.slice(0, 10) || "알 수 없음"}
              description={product.description}
            />

            <div className="flex justify-end mt-6 gap-4">
              <Link href="/products/search">
                <Button variant="outline">목록으로</Button>
              </Link>
              <Link href={`/products/edit/${product.gifticonId}`}>
                <Button className="bg-red-500 hover:bg-red-600 text-white">수정</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
