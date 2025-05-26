"use client";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile"; // Import useIsMobile

interface CategoryNavigationProps {
  categories: {
    name: string;
    value: string;
    highlight?: boolean;
  }[];
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  className?: string;
}

export function CategoryNavigation({
  categories,
  selectedCategories,
  onCategoryChange,
  className,
}: CategoryNavigationProps) {
  const isMobile = useIsMobile(); // Use the hook

  // 카테고리 토글 함수 (기존 로직 유지)
  const toggleCategory = (categoryValue: string) => {
    if (selectedCategories.includes(categoryValue)) {
      // 이미 선택된 카테고리라면 제거
      onCategoryChange(selectedCategories.filter((c) => c !== categoryValue));
    } else {
      // 선택되지 않은 카테고리라면 추가
      onCategoryChange([...selectedCategories, categoryValue]);
    }
  };

  // Split categories for the desktop two-row layout
  const halfLength = Math.ceil(categories.length / 2);
  const firstRow = categories.slice(0, halfLength);
  const secondRow = categories.slice(halfLength);

  return (
    <div className={cn("relative mb-6", className)}>
      {/* Mobile View: Wrapping Buttons */}
      <div className="md:hidden flex flex-wrap gap-2 rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
        {categories.map((category) => {
          const isActive = selectedCategories.includes(category.value);
          return (
            <button
              key={category.value}
              onClick={() => toggleCategory(category.value)}
              className={cn(
                "whitespace-nowrap rounded-md px-3 py-2 text-center text-sm transition-all",
                isActive
                  ? "bg-primary text-white font-medium shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                category.highlight &&
                  !isActive &&
                  "ring-2 ring-offset-1 ring-yellow-400"
              )}
            >
              {category.name}
            </button>
          );
        })}
      </div>

      {/* Desktop View: Original Two Rows */}
      <div className="hidden md:block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        {/* First Row */}
        <div className="flex w-full">
          {firstRow.map((category) => {
            const isActive = selectedCategories.includes(category.value);
            return (
              <button
                key={category.value}
                onClick={() => toggleCategory(category.value)}
                className={cn(
                  "flex-1 whitespace-nowrap px-4 py-3.5 text-center text-sm transition-all relative",
                  isActive
                    ? "bg-primary/10 text-gray-900 font-semibold"
                    : "bg-white text-gray-600 hover:text-gray-800 font-normal",
                  "border-b border-r last:border-r-0 border-gray-200"
                )}
              >
                {category.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></span>
                )}
              </button>
            );
          })}
        </div>
        {/* Second Row */}
        <div className="flex w-full">
          {secondRow.map((category) => {
            const isActive = selectedCategories.includes(category.value);
            return (
              <button
                key={category.value}
                onClick={() => toggleCategory(category.value)}
                className={cn(
                  "flex-1 whitespace-nowrap px-4 py-3.5 text-center text-sm transition-all relative",
                  isActive
                    ? "bg-primary/10 text-gray-900 font-semibold"
                    : "bg-white text-gray-600 hover:text-gray-800 font-normal",
                  "border-r last:border-r-0 border-gray-200"
                )}
              >
                {category.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
