const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// 1. 기프티콘 정보 수정 (PATCH)
export async function updateGifticon(id: number, data: any) {
    const res = await fetch(`${BASE_URL}/admin/gifticons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("기프티콘 수정 실패");
    return true;
}
  
// 2. 카테고리 목록 가져오기
export async function fetchCategories() {
    const res = await fetch(`${BASE_URL}/categories`);
    if (!res.ok) throw new Error("카테고리 목록 조회 실패");
    return res.json();
}
  
// 3. 브랜드 목록 가져오기
export async function fetchBrands() {
    const res = await fetch(`${BASE_URL}/brands`);
    if (!res.ok) throw new Error("브랜드 목록 조회 실패");
    return res.json();
}
  
// 4. 기프티콘 상세정보 가져오기
export async function fetchGifticonDetail(id: number) {
    const res = await fetch(`${BASE_URL}/gifticons/${id}`);
    if (!res.ok) throw new Error("기프티콘 상세정보 조회 실패");
    return res.json();
}

// 5. 필터 조건에 따른 기프티콘 목록 조회 + 스크롤 페이지네이션 지원
export async function fetchGifticons({
  term = "",
  brandId = "",
  categoryId = "",
  page = 0,
  size = 10,
}: {
  term?: string;
  brandId?: string;
  categoryId?: string;
  page?: number;
  size?: number;
}) {
  const params = new URLSearchParams();
  if (term) params.append("term", term);
  if (brandId) params.append("brand", brandId);
  if (categoryId) params.append("category", categoryId);
  params.append("page", String(page));
  params.append("size", String(size));

  const res = await fetch(`${BASE_URL}/gifticons/search?${params.toString()}`);
  if (!res.ok) throw new Error("기프티콘 목록 조회 실패");
  return res.json();
}
