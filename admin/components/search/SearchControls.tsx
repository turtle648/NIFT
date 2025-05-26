"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, Search, X } from "lucide-react";
import React from "react";

type Props = {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  applyFilters: () => void;
  viewMode: "grid" | "table";
  setViewMode: (mode: "grid" | "table") => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  activeFiltersCount?: number; // 선택사항
};

export default function SearchControls({
  searchTerm,
  setSearchTerm,
  applyFilters,
  viewMode,
  setViewMode,
  showFilters,
  setShowFilters,
  activeFiltersCount = 0,
}: Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-4">
      <div className="flex gap-2">
        {/* 검색창 */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            className="pl-10 pr-4"
            placeholder="상품번호, 상품명, 설명 등 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* 검색 버튼 */}
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          검색
        </Button>

        {/* 필터 버튼 */}
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="relative"
        >
          <Filter className="h-4 w-4 mr-2" />
          필터
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {activeFiltersCount}
            </span>
          )}
        </Button>

        {/* 보기 전환 */}
        <Button
          type="button"
          variant="outline"
          onClick={() => setViewMode(viewMode === "grid" ? "table" : "grid")}
        >
          {viewMode === "grid" ? "테이블 보기" : "그리드 보기"}
        </Button>
      </div>
    </form>
  );
}
