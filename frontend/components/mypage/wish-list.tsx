"use client";

import { useState, useEffect } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArticleCard, ArticleCardProps } from "@/components/article/article-card";

interface WishListProps {
  allLikedArticles: ArticleCardProps[];
  setAllLikedArticles: React.Dispatch<React.SetStateAction<ArticleCardProps[]>>;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  startPage: number;
  endPage: number;
  totalPage: number;
  setTotalPage: React.Dispatch<React.SetStateAction<number>>;
}

export const WishList = ({
  allLikedArticles,
  setAllLikedArticles,
  currentPage,
  setCurrentPage,
  startPage,
  endPage,
  totalPage,
  setTotalPage,
}: WishListProps) => {
  const [likedArticles, setLikedArticles] = useState<ArticleCardProps[]>([]);

  // 현재 페이지에 맞게 sliced likedArticles 설정
  useEffect(() => {
    const start = currentPage * 6;
    const end = start + 6;

    if (start >= allLikedArticles.length && currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    } else {
      setLikedArticles(allLikedArticles.slice(start, end));
    }
  }, [allLikedArticles, currentPage, setCurrentPage]);

  // 찜 해제 시 전체 데이터에서 제거 + 페이지 보정 + 현재 페이지 다시 slice
  const handleRemoveFromLiked = (articleId: number) => {
    const updatedAll = allLikedArticles.filter(
      (article) => article.articleId !== articleId
    );

    setAllLikedArticles(updatedAll);

    const updatedTotalPages = Math.ceil(updatedAll.length / 6);
    setTotalPage(updatedTotalPages);

    const start = currentPage * 6;
    const end = start + 6;

    if (start >= updatedAll.length && currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }

    // UI 반영을 위해 likedArticles도 slice 다시 수행
    setLikedArticles(updatedAll.slice(start, end));
  };

  const hasArticles = likedArticles.length > 0;

  return (
    <TabsContent value="favorites" className="mt-6">
      <div>
        <h2 className="mb-4 text-xl font-semibold">찜한 상품</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          관심 있는 기프티콘을 모아볼 수 있습니다.
        </p>
      </div>

      {hasArticles ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {likedArticles.map((article) => (
              <ArticleCard
                key={article.articleId}
                {...article}
                onUnlike={handleRemoveFromLiked}
              />
            ))}
          </div>

          <div className="mt-8 flex justify-center items-center gap-2">
            <Button
              variant="ghost"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
            >
              ‹ 이전
            </Button>

            {Array.from({ length: endPage - startPage }, (_, i) => startPage + i).map(
              (pageNum) => (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "ghost"}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum + 1}
                </Button>
              )
            )}

            <Button
              variant="ghost"
              disabled={currentPage === totalPage - 1}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPage - 1))
              }
            >
              다음 ›
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          찜한 상품이 없습니다.
        </div>
      )}
    </TabsContent>
  );
};
