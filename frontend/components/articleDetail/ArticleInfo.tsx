// components/article/ArticleInfo.tsx

import { Clock } from "lucide-react";
import { brandColors } from "@/lib/api/ArticleService";

// 날짜 포맷용
const formatDateOnly = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toISOString().split("T")[0];
}

type ArticleInfoProps = {
  title: string;
  categoryName: string;
  description: string;
  expirationDate: string;
  createAt: string;
  viewCnt: number;
  countLikes: number;
  brandName: string;
};

export function ArticleInfo({
  title,
  categoryName,
  description,
  expirationDate,
  createAt,
  viewCnt,
  countLikes,
  brandName,
}: ArticleInfoProps) {
  return (
    <>
      <div className="mb-2 text-sm text-muted-foreground">{categoryName}</div>

      <h1 className="mb-4 text-2xl font-bold md:text-3xl">{title}</h1>

      <div className="mb-4">
      <span
        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white"
          style={{
            backgroundColor: brandColors[brandName] || "#DD5851",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
            }}
      >{brandName}
      </span>

      </div>

      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>
          등록일: {formatDateOnly(createAt)} · 조회 {viewCnt}회 · 관심 {countLikes}
        </span>
      </div>

      <h1 className="font-bold mb-2 mt-6">상품 상세 설명</h1>

      <div className="mb-6 rounded-lg bg-gray-50 p-4">
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <div className="mt-3 text-sm">
          <span className="font-medium">유효기간:</span> {formatDateOnly(expirationDate)}
        </div>
      </div>
    </>
  );
}
