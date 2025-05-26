"use client";

import { useEffect, useState, useRef } from "react";
import PageHeader from "@/components/page-header";
import SearchControls from "@/components/search/SearchControls";
import FilterPanel from "@/components/search/FilterPanel";
import ProductResults from "@/components/search/ProductResults";
import MintingModal from "@/components/modals/MintingModal"; // 모달 import
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { ChevronDown, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchBrands, fetchCategories, fetchGifticons } from "@/lib/gifticons";

export default function ProductSearchPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [selectedBrandId, setSelectedBrandId] = useState("all");

  const [brands, setBrands] = useState<{ label: string; value: string }[]>([]);
  const [categories, setCategories] = useState<
    { label: string; value: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");

  // 상태 추가
  const [mintModalOpen, setMintModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const observerRef = useRef<HTMLDivElement>(null);

  const openMintModal = (product: any) => {
    console.log("✅ 민팅 모달 오픈:", product);
    setSelectedProduct(product);
    setMintModalOpen(true);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      const [brandData, categoryData] = await Promise.all([
        fetchBrands(),
        fetchCategories(),
      ]);
      setBrands(
        brandData.map((b: any) => ({
          label: b.brandName,
          value: String(b.brandId),
        }))
      );
      setCategories(
        categoryData.map((c: any) => ({
          label: c.categoryName,
          value: String(c.categoryId),
        }))
      );
    };
    loadInitialData();
  }, []);

  const loadProducts = async (reset = false) => {
    if (!hasNext && !reset) return;
    setIsLoading(true);

    const nextPage = reset ? 0 : page;
    const result = await fetchGifticons({
      term: searchTerm,
      brandId: selectedBrandId === "all" ? "" : selectedBrandId,
      categoryId: selectedCategoryId === "all" ? "" : selectedCategoryId,
      page: nextPage,
    });

    if (reset) {
      setProducts(result.content);
    } else {
      setProducts((prev) => [...prev, ...result.content]);
    }

    setHasNext(!result.last);
    setPage(nextPage + 1);
    setIsLoading(false);
  };

  // 무한 스크롤 트리거
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNext && !isLoading) {
          loadProducts();
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [observerRef, hasNext, isLoading]);

  const handleSearch = () => {
    setPage(0);
    setHasNext(true);
    loadProducts(true);
  };

  return (
    <div>
      <PageHeader
        title="상품 검색"
        description="등록된 NFT 기프티콘 상품을 검색합니다."
      />

      <SearchControls
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        applyFilters={handleSearch}
        viewMode={viewMode}
        setViewMode={setViewMode}
        showFilters={true}
        setShowFilters={() => {}}
      />

      <FilterPanel
        selectedCategory={selectedCategoryId}
        setSelectedCategory={setSelectedCategoryId}
        selectedBrand={selectedBrandId}
        setSelectedBrand={setSelectedBrandId}
        orderStatus="all"
        setOrderStatus={() => {}}
        startDate=""
        setStartDate={() => {}}
        endDate=""
        setEndDate={() => {}}
        resetFilters={() => {}}
        categories={categories}
        brands={brands}
      />

      <ProductResults
        products={products}
        viewMode={viewMode}
        hasSearched={true}
        openMintModal={openMintModal}
      />

      {isLoading && (
        <div className="text-center text-gray-400 py-6">로딩 중...</div>
      )}
      <div ref={observerRef} className="h-1" />

      <MintingModal
        open={mintModalOpen}
        setOpen={setMintModalOpen}
        product={selectedProduct}
      />
    </div>
  );
}
