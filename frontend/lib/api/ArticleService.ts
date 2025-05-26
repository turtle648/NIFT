import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL; // 백엔드 API 주소

export const ArticleService = {
  async getArticles(
    sort: string = "newest",
    category?: number,
    page: number = 0,
    size: number = 15,
    userId?: number
  ) {
    try {
      const response = await axios.get(`${API_BASE_URL}/secondhand-articles`, {
        params: {
          sort,
          category,
          page,
          size,
          userId,
        },
      });
      return response.data;
    } catch (error) {
      console.error("상품 목록을 가져오는 중 오류 발생:", error);
      throw error;
    }
  },

  // 좋아요 추가 또는 삭제
  async toggleLike(articleId: number, isLiked: boolean) {
    const accessToken =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;

    if (!accessToken) {
      alert("로그인이 필요합니다.");
      return false;
    }

    const url = `${API_BASE_URL}/secondhand-articles/${articleId}/likes`;
    const method = isLiked ? "DELETE" : "POST";

    try {
      await axios({
        method,
        url,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      return true;
    } catch (error) {
      console.error("좋아요 처리 중 오류 발생 : ", error);
      return false;
    }
  },

  // 게시글 작성
  async createArticle(postData: {
    title: string;
    description: string;
    currentPrice: number;
    serialNum: string;
    expiryDate: string; // ISO 형식 (e.g. "2025-12-31T00:00:00")
    gifticonId: number;
    imageUrl: string;
  }) {
    const accessToken =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;

    if (!accessToken) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/secondhand-articles`,
        postData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("게시글 등록 중 오류 발생:", error);
      throw error;
    }
  },

  // 게시글 삭제
  async deleteArticle(articleId: number): Promise<void> {
    const accessToken =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;

    if (!accessToken) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/secondhand-articles/${articleId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      console.error("게시글 삭제 중 오류 발생:", error);
      throw error;
    }
  },

  // 특정 판매자의 ON_SALE 중인 다른 상품 조회
  async getOtherArticlesByUser(userId: number, page: number = 0, size: number = 6) {
    try {
      const response = await axios.get(`${API_BASE_URL}/secondhand-articles/others`, {
        params: {
          userId,
          page,
          size,
        },
      });
      return response.data;
    } catch (error) {
      console.error("🔥 판매자의 다른 상품 조회 실패:", error);
      return { content: [], totalPages: 0, totalElements: 0 };
    }
  },
};

export async function getArticleById(id: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/secondhand-articles/${id}`);

    if (!res.ok) throw new Error("second-articles 조회 실패");

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("중고거래 상품 조회 실패: ", err)
    throw err;
  }
}

export async function Article5AService() {
  try {
    const response = await axios.get(`${API_BASE_URL}/secondhand-articles`, {
      params: {
        sort: "likes",
        page: 1,
        size: 5
      }
    });

    return response.data;
  } catch (error) {
    console.error("🔥 인기 상위 5개 조회 실패:", error);
    return { content: [], totalPages: 0 };
  }
}

export const brandColors: Record<string, string> = {
  "이디야커피": "#3C4A6A",
  "스타벅스": "#3E6A57",
  "던킨도너츠": "#D16733",
  "배스킨라빈스": "#D46C9C",
  "교촌치킨": "#B69470",
  "버거킹": "#D6363B",
  "맥도날드": "#FFD65A",
  "BBQ": "#D94D58",
  "굽네치킨": "#D8352A",
  "파리바게뜨": "#2C4A80",
  "뚜레쥬르": "#7FA570",
  "이마트24": "#FFDD55",
  "GS25": "#3DB1C5",
  "CU": "#A261C2",
  "컬리": "#6D4C8D",
  "신세계상품권": "#C33C46",
  "교보문고": "#3E6559",
  "YES24": "#4A98D1",
  "투썸플레이스": "#4B4B4B",
  "CGV": "#D6555A",
  "BHC": "#E46F2A", 
  "설빙": "#AD6585",
  "롯데리아": "#D83A4D",
  "도미노 피자": "#3A5BA0",
  "메가 커피": "#F5D56B",
};

