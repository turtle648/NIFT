"use client";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import React from "react";

type Option = {
  label: string;
  value: string;
};

type Props = {
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedBrand: string;
  setSelectedBrand: (value: string) => void;
  orderStatus: string;
  setOrderStatus: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  resetFilters: () => void;
  categories: Option[];
  brands: Option[];
};

export default function FilterPanel({
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  orderStatus,
  setOrderStatus,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  resetFilters,
  categories,
  brands,
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 p-4 bg-gray-50 rounded-md">
      {/* 카테고리 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">카테고리</label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="bg-white">
              전체
            </SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value} className="bg-white">
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 브랜드 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">브랜드</label>
        <Select value={selectedBrand} onValueChange={setSelectedBrand}>
          <SelectTrigger>
            <SelectValue placeholder="전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="bg-white">
              전체
            </SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand.value} value={brand.value} className="bg-white">
                {brand.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div> 
    </div>
  );
}
