const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface DashboardSummary {
    totalArticlesOnSale: number;
    weeklySalesCount: number;
    weeklyRevenue: number;
    totalUsers: number;
}

export interface RecentGifticon {
    gifticonId: number;
    brandName: string;
    categoryName: string;
    gifticonTitle: string;
    price: number;
    imageUrl: string;
}

// 관리자 요약 정보 가져오기
export async function fetchDashboardSummary(): Promise<DashboardSummary> {
    const res = await fetch(`${BASE_URL}/secondhand-articles/histories/dashboard-summary`);
    if (!res.ok) throw new Error("Failed to fetch dashboard summary");
    return res.json();
  }
  
  // 최근 등록된 기프티콘 4개 가져오기
  export async function fetchRecentGifticons(): Promise<RecentGifticon[]> {
    const res = await fetch(`${BASE_URL}/gifticons/recent`);
    if (!res.ok) throw new Error("Failed to fetch recent gifticons");
    return res.json();
  }