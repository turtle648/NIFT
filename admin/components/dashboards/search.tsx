"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/products/search?term=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative mb-8">
      <Input
        className="pl-10 pr-4 h-12"
        placeholder="상품명, 설명으로 검색..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <Button
        type="submit"
        className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white"
      >
        검색
      </Button>
    </form>
  );
}