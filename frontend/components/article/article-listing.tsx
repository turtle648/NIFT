"use client";

import type React from "react";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
// import { ArticleGrid } from "@/components/article/article-grid"; // No longer used here
import { ArticleWrappingGrid } from "@/components/article/article-wrapping-grid"; // Import the new grid
import { ArticleList } from "@/components/article/article-list"; // Import ArticleList
import { useIsMobile } from "@/hooks/use-mobile"; // Import useIsMobile hook
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { CategoryNavigation } from "@/components/article/category-navigation";
import { useLoading } from "@/components/LoadingContext";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// 간단한 debounce 유틸리티 함수 구현
const debounce = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): void => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
};

// access_token 가져오기
const getAccessToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token") || null;
  }
  return null;
};

// 백엔드 API에서 상품 데이터를 가져오는 함수
const fetchArticles = async ({
  categories = [],
  sort = "newest",
  page = 0,
  size = 10,
  userId,
  priceRange = [0, 30000],
}: {
  categories?: number[];
  sort?: string;
  page?: number;
  size?: number;
  userId?: number;
  priceRange?: number[];
}) => {
  try {
    const accessToken = getAccessToken();

    // URL 쿼리 파라미터 구성
    const params = new URLSearchParams();

    if (categories.length > 0) {
      categories.forEach((cat) => params.append("category", cat.toString()));
    }

    // Add price range parameters
    params.append("min-price", priceRange[0].toString());
    params.append("max-price", priceRange[1].toString());

    if (sort) params.append("sort", sort);
    params.append("page", page.toString());
    params.append("size", size.toString());

    const queryString = params.toString();
    const url = `${BASE_URL}/secondhand-articles${
      queryString ? `?${queryString}` : ""
    }`;

    console.log("Fetching articles from:", url);

    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const res = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!res.ok) throw new Error("Failed to fetch articles");

    const data = await res.json();

    console.log("API Response:", data);
    return data;
  } catch (error) {
    console.error("Error fetching articles:", error);
    return { content: [], totalPages: 1, totalElements: 0 };
  }
};

// 클라이언트 측 필터링 함수 - 검색어만 처리
const filterArticles = (articles: any[], searchQuery: string) => {
  return articles.filter((article) => {
    // 검색어 필터링
    if (
      searchQuery &&
      !article.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    return true;
  });
};

// 서버에서 최대 가격 가져오는 함수
const fetchMaxPrice = async () => {
  try {
    const res = await fetch(`${BASE_URL}/secondhand-articles/max-price`);
    const data = await res.json();
    return Math.ceil(data.maxPrice || 30000); // 소수점 방지
  } catch (e) {
    console.error("최대 가격 불러오기 실패", e);
    return 30000;
  }
};

export function ArticleListing() {
  // React Transition 사용
  const [isPending, startTransition] = useTransition();
  const isMobile = useIsMobile(); // Use the hook

  // 추가: URL 쿼리 파라미터 가져오기
  const searchParams = useSearchParams();
  const router = useRouter();

  // 상품 데이터 및 로딩 상태
  const [articles, setArticles] = useState<any[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<any[]>([]);
  const { isLoading, setIsLoading } = useLoading();
  const [localLoading, setLocalLoading] = useState(false); // 로컬 로딩 상태 추가
  const [totalItems, setTotalItems] = useState(0);

  // 필터링 및 정렬 상태
  const [searchQuery, setSearchQuery] = useState("");
  // 수정: URL에서 카테고리 파라미터 가져와서 초기값 설정
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const categoryParam = searchParams.get("category");
    return categoryParam ? [categoryParam] : [];
  });
  const [priceRange, setPriceRange] = useState([0, 30000]);
  const [maxPrice, setMaxPrice] = useState(30000);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState("newest");

  // 페이지네이션 상태
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 사용자 ID (로그인 기능 구현 시 실제 사용자 ID로 대체)
  const [userId, setUserId] = useState<number | undefined>(undefined);

  // URL 업데이트 함수 - 화면 깜박임 방지
  const updateUrlWithoutRefresh = useCallback((params: URLSearchParams) => {
    // 현재 URL 가져오기
    const url = new URL(window.location.href);

    // 새 쿼리 파라미터로 URL 업데이트
    url.search = params.toString();

    // 브라우저 히스토리 업데이트 (페이지 새로고침 없이)
    window.history.pushState({}, "", url.toString());
  }, []);

  // 상품 데이터 가져오기 - 최적화된 버전
  const loadArticles = useCallback(async () => {
    // 로딩 상태를 즉시 변경하지 않고, 지연 시간 후에만 표시
    let loadingTimeout: NodeJS.Timeout | null = null;

    // 300ms 이상 로딩이 지속되는 경우에만 로딩 인디케이터 표시
    loadingTimeout = setTimeout(() => {
      setLocalLoading(true);
    }, 300);

    try {
      const fetchedData = await fetchArticles({
        categories: selectedCategories.map(Number),
        sort: sortOption,
        page,
        size: pageSize,
        userId,
        priceRange: [Math.floor(priceRange[0]), Math.ceil(priceRange[1])],
      });

      const articlesData = fetchedData.content || [];

      // 상태 업데이트를 트랜지션으로 감싸서 UI 응답성 유지
      startTransition(() => {
        setArticles(articlesData);
        setFilteredArticles(articlesData);
        setTotalPages(fetchedData.totalPages || 1);
        setTotalItems(fetchedData.totalElements || 0);
      });
    } catch (error) {
      console.error("Failed to load articles:", error);
    } finally {
      // 타임아웃 취소 및 로딩 상태 해제
      if (loadingTimeout) clearTimeout(loadingTimeout);
      setLocalLoading(false);
    }
  }, [selectedCategories, sortOption, page, pageSize, userId, priceRange]);

  // 컴포넌트 마운트 시 maxPrice 먼저 설정
  useEffect(() => {
    const initMaxPrice = async () => {
      const max = await fetchMaxPrice();
      setPriceRange([0, max]);
      setMaxPrice(max);
    };
    initMaxPrice();
  }, []);

  // 컴포넌트 마운트 시 상품 데이터 로드
  useEffect(() => {
    loadArticles();
  }, [selectedCategories, sortOption, page, priceRange, loadArticles]);

  // 클라이언트 측 필터링 적용 (검색어만 처리)
  useEffect(() => {
    if (articles.length > 0) {
      if (searchQuery) {
        // 검색어 필터만 적용
        startTransition(() => {
          const filtered = filterArticles(articles, searchQuery);
          setFilteredArticles(filtered);
        });
      } else {
        // 필터가 없으면 모든 상품 표시
        startTransition(() => {
          setFilteredArticles(articles);
        });
      }
    } else {
      setFilteredArticles([]);
    }
  }, [articles, searchQuery]);

  // 브라우저 뒤로가기/앞으로가기 처리
  useEffect(() => {
    const handlePopState = () => {
      // URL에서 파라미터 읽기
      const params = new URLSearchParams(window.location.search);

      // 카테고리 파라미터 처리
      const categoryParam = params.getAll("category");
      startTransition(() => {
        if (categoryParam.length > 0) {
          setSelectedCategories(categoryParam);
        } else {
          setSelectedCategories([]);
        }

        // 가격 범위 파라미터 처리
        const minPrice = params.get("min-price");
        const maxPrice = params.get("max-price");
        if (minPrice && maxPrice) {
          setPriceRange([Number(minPrice), Number(maxPrice)]);
        }

        // 정렬 옵션 파라미터 처리
        const sort = params.get("sort");
        if (sort) {
          setSortOption(sort);
        }

        // 페이지 파라미터 처리
        const pageParam = params.get("page");
        if (pageParam) {
          setPage(Number(pageParam));
        }
      });
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    const categoryParam = searchParams.getAll("category");
    const minPrice = searchParams.get("min-price");
    const maxPrice = searchParams.get("max-price");
    const sort = searchParams.get("sort");
    const pageParam = searchParams.get("page");

    startTransition(() => {
      setSelectedCategories(categoryParam || []);
      if (minPrice && maxPrice) {
        setPriceRange([+minPrice, +maxPrice]);
      }
      if (sort) {
        setSortOption(sort);
      }
      if (pageParam) {
        setPage(Number(pageParam));
      }
    });
  }, [searchParams]);

  // 디바운스된 가격 범위 변경 핸들러
  const debouncedPriceChange = useCallback(
    debounce((value: number[]) => {
      // 먼저 URL 업데이트 (사용자에게 즉시 피드백 제공)
      const params = new URLSearchParams(window.location.search);
      params.set("min-price", value[0].toString());
      params.set("max-price", value[1].toString());
      params.set("page", "1");
      updateUrlWithoutRefresh(params);

      // 그 다음 상태 업데이트 (트랜지션으로 감싸서)
      startTransition(() => {
        setPriceRange(value);
        setPage(1); // 가격 범위 변경 시 첫 페이지로 이동
      });
    }, 300),
    [updateUrlWithoutRefresh]
  );

  // 필터 초기화
  const resetFilters = () => {
    // 먼저 URL 업데이트
    updateUrlWithoutRefresh(new URLSearchParams());

    // 그 다음 상태 업데이트
    startTransition(() => {
      setSelectedCategories([]);
      setPriceRange([0, maxPrice]);
      setSearchQuery("");
      setSortOption("newest");
      setPage(1);
    });

    // 데이터 다시 로드
    loadArticles();
  };

  // 카테고리 필터 제거
  const removeCategory = (category: string) => {
    const newCategories = selectedCategories.filter((c) => c !== category);

    // 먼저 URL 업데이트
    const params = new URLSearchParams(window.location.search);
    params.delete("category");
    newCategories.forEach((cat) => params.append("category", cat));
    params.set("page", "1");
    updateUrlWithoutRefresh(params);

    // 그 다음 상태 업데이트
    startTransition(() => {
      setSelectedCategories(newCategories);
      setPage(1); // 카테고리 변경 시 첫 페이지로 이동
    });
  };

  // 카테고리 값과 이름 매핑 객체 생성
  const categoryMap: Record<string, string> = {
    "1": "카페",
    "2": "베이커리/도넛/떡",
    "3": "아이스크림/빙수",
    "4": "치킨/피자",
    "5": "패스트푸드",
    "6": "편의점/마트",
    "7": "상품권/금액권",
    "8": "영화/도서",
  };

  // 검색 제출 핸들러
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // URL 업데이트
    const params = new URLSearchParams(window.location.search);
    if (searchQuery) {
      params.set("search", searchQuery);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    updateUrlWithoutRefresh(params);
  };

  // 정렬 변경 핸들러
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortOption = e.target.value;

    // 먼저 URL 업데이트
    const params = new URLSearchParams(window.location.search);
    params.set("sort", newSortOption);
    params.set("page", "1");
    updateUrlWithoutRefresh(params);

    // 그 다음 상태 업데이트
    startTransition(() => {
      setSortOption(newSortOption);
      setPage(1); // 정렬 변경 시 첫 페이지로 이동
    });
  };

  // 페이지네이션 버튼 생성 함수
  const renderPaginationButtons = () => {
    // 항상 표시할 최대 페이지 버튼 수
    const maxButtons = 4;
    const buttons = [];

    // 실제 표시할 버튼 수 (totalPages와 maxButtons 중 작은 값)
    const displayButtons = Math.min(maxButtons, totalPages);

    // 시작 페이지 계산
    let startPage = 1;

    if (page > 2 && totalPages > maxButtons) {
      // 현재 페이지가 3 이상이고 총 페이지가 maxButtons보다 크면
      // 현재 페이지를 중앙에 배치하되, 마지막 페이지에 가까워지면 조정
      startPage = Math.min(page - 1, totalPages - displayButtons + 1);
      startPage = Math.max(1, startPage); // 시작 페이지는 최소 1
    }

    // 버튼 생성
    for (let i = 0; i < displayButtons; i++) {
      const pageNum = startPage + i;
      if (pageNum <= totalPages) {
        buttons.push(
          <Button
            key={pageNum}
            variant="outline"
            size="sm"
            className={`h-8 w-8 border-none ${
              pageNum === page ? "bg-primary text-white hover:bg-primary" : ""
            }`}
            onClick={() => {
              const pageNumValue = pageNum;

              // 먼저 URL 업데이트
              const params = new URLSearchParams(window.location.search);
              params.set("page", pageNumValue.toString());
              updateUrlWithoutRefresh(params);

              // 그 다음 상태 업데이트
              startTransition(() => {
                setPage(pageNumValue);
              });
            }}
          >
            {pageNum}
          </Button>
        );
      }
    }

    return buttons;
  };

  return (
    <div className="container py-8 relative">
      <style jsx global>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .loading-indicator {
          position: absolute;
          inset: 0;
          background-color: rgba(255, 255, 255, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10;
        }

        .loading-spinner {
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          border: 2px solid transparent;
          border-top-color: var(--primary);
          border-bottom-color: var(--primary);
          animation: spin 1s linear infinite;
        }

        html {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
          overflow-y: auto;
        }

        html::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }

        body {
          width: 100%;
          overflow-x: hidden;
        }
      `}</style>

      {/* 로딩 오버레이 - 로컬 로딩 상태에 따라 표시 */}
      {localLoading && (
        <div className="loading-indicator">
          <div className="loading-spinner"></div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">NIFT 몰</h1>
        <p className="text-gray-500">
          다양한 기프티콘을 합리적인 가격에 만나보세요.
        </p>
      </div>

      {/* 카테고리 네비게이션 */}
      <CategoryNavigation
        categories={[
          { name: "커피/음료", value: "1" },
          { name: "베이커리/디저트", value: "2" },
          { name: "아이스크림/빙수", value: "3" },
          { name: "치킨", value: "4" },
          { name: "피자/버거", value: "5" },
          { name: "편의점/마트", value: "6" },
          { name: "상품권/금액권", value: "7" },
          { name: "영화/도서", value: "8" },
        ]}
        selectedCategories={selectedCategories}
        onCategoryChange={(categories) => {
          // 먼저 URL 업데이트 (사용자에게 즉시 피드백 제공)
          const params = new URLSearchParams(window.location.search);
          params.delete("category");
          if (categories.length > 0) {
            categories.forEach((cat) => params.append("category", cat));
          }
          params.set("page", "1");
          updateUrlWithoutRefresh(params);

          // 그 다음 상태 업데이트 (트랜지션으로 감싸서)
          startTransition(() => {
            setSelectedCategories(categories);
            setPage(1);
          });
        }}
        className="mb-6"
      />

      {/* 검색 및 필터 영역 */}
      <div className="mb-8 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <Input
              type="search"
              placeholder="상품명으로 검색..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            variant="default"
            className="hidden sm:inline-flex"
          >
            검색
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-primary/10" : ""}
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
          </Button>
        </form>

        {/* 필터 영역 */}
        {showFilters && (
          <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">필터</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-8 text-xs"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                초기화
              </Button>
            </div>

            <div className="space-y-4">
              {/* 가격 범위 필터 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium">가격 범위</h4>
                  <span className="text-xs text-gray-500">
                    {priceRange[0].toLocaleString()}원 -{" "}
                    {priceRange[1].toLocaleString()}원
                  </span>
                </div>
                <Slider
                  defaultValue={[0, maxPrice]}
                  min={0}
                  max={maxPrice}
                  step={0.1}
                  value={priceRange}
                  onValueChange={debouncedPriceChange}
                  className="py-4"
                />
              </div>
            </div>
          </div>
        )}

        {/* 활성화된 필터 표시 */}
        {(selectedCategories.length > 0 ||
          priceRange[0] > 0 ||
          priceRange[1] < maxPrice ||
          searchQuery) && (
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((categoryValue) => (
              <Badge
                key={categoryValue}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {categoryMap[categoryValue]}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 cursor-pointer"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  onClick={() => removeCategory(categoryValue)}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Badge>
            ))}
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                검색: {searchQuery}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 cursor-pointer"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  onClick={() => setSearchQuery("")}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Badge>
            )}
            {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {priceRange[0].toLocaleString()}원-
                {priceRange[1].toLocaleString()}원
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 cursor-pointer"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  onClick={() => setPriceRange([0, maxPrice])}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-6 text-xs px-2 text-gray-500"
            >
              모두 지우기
            </Button>
          </div>
        )}
      </div>

      {/* 상품 목록 */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-gray-500">총 {totalItems}개의 상품</p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">정렬:</span>
          <select
            className="text-sm border rounded-md px-2 py-1"
            value={sortOption}
            onChange={handleSortChange}
          >
            <option value="newest">최신순</option>
            <option value="highest">높은 가격순</option>
            <option value="lowest">낮은 가격순</option>
            <option value="likes">좋아요순</option>
            <option value="views">조회수순</option>
          </select>
        </div>
      </div>

      {/* 로딩 상태 및 상품 목록 - 애니메이션 효과 제거 */}
      <div className="min-h-[300px] relative">
        <div className="article-display-container">
          {" "}
          {/* Renamed container class for clarity */}
          {filteredArticles.length > 0 ? (
            <>
              {console.log("ArticleListing articles:", filteredArticles)}
              {isMobile ? (
                <ArticleList
                  articles={filteredArticles.map((article) => ({
                    ...article,
                    isLiked: article.liked, // Ensure isLiked is passed correctly
                    // Map other necessary props from filteredArticles to ArticleCardProps if needed
                    articleId: article.articleId,
                    title: article.title,
                    brandName: article.brandName,
                    currentPrice: article.priceInfo.currentPrice,
                    originalPrice: article.priceInfo.originalPrice,
                    discountRate: article.discountRate,
                    imageUrl: article.imageUrl,
                    state: article.state,
                    likeCount: article.interestCount, // Map interestCount to likeCount
                  }))}
                  className="mb-8" // Removed border here, will add to item
                  // Add onUnlike handler if needed based on ArticleListProps
                />
              ) : (
                <ArticleWrappingGrid // Use the new wrapping grid component
                  articles={filteredArticles.map((article) => ({
                    ...article,
                    isLiked: article.liked, // Ensure isLiked is passed correctly
                    // Map other necessary props from filteredArticles to ArticleCardProps if needed
                    articleId: article.articleId,
                    title: article.title,
                    brandName: article.brandName,
                    currentPrice: article.priceInfo.currentPrice,
                    originalPrice: article.priceInfo.originalPrice,
                    discountRate: article.discountRate,
                    imageUrl: article.imageUrl,
                    state: article.state,
                    likeCount: article.interestCount, // Map interestCount to likeCount
                  }))}
                  className="mb-8"
                />
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 rounded-full bg-gray-100 p-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                검색 결과가 없습니다
              </h3>
              <p className="mb-6 text-gray-500">
                다른 검색어나 필터를 사용해 보세요.
              </p>
              <Button onClick={resetFilters}>필터 초기화</Button>
            </div>
          )}
        </div>
      </div>

      {/* 페이지네이션 - Show only if more than one page */}
      {filteredArticles.length > 0 && totalPages > 1 && (
        <div className="flex flex-col items-center justify-center mt-8 space-y-2">
          {/* Page X of Y indicator removed */}
          {/* Navigation buttons */}
          <nav className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={page === 1}
              onClick={() => {
                const newPage = page - 1;

                // 먼저 URL 업데이트
                const params = new URLSearchParams(window.location.search);
                params.set("page", newPage.toString());
                updateUrlWithoutRefresh(params);

                // 그 다음 상태 업데이트
                startTransition(() => {
                  setPage(newPage);
                });
              }}
            >
              ‹ 이전
            </Button>

            {/* 페이지 번호 버튼 */}
            {renderPaginationButtons()}

            <Button
              variant="ghost"
              size="sm"
              disabled={page === totalPages}
              onClick={() => {
                const newPage = page + 1;

                // 먼저 URL 업데이트
                const params = new URLSearchParams(window.location.search);
                params.set("page", newPage.toString());
                updateUrlWithoutRefresh(params);

                // 그 다음 상태 업데이트
                startTransition(() => {
                  setPage(newPage);
                });
              }}
            >
              다음 ›
            </Button>
          </nav>
        </div>
      )}
    </div>
  );
}
