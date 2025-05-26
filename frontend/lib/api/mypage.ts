import axios from "axios";

import { apiClient } from "./CustomAxios";
import { getUserNFTsAsJson } from './web3'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface LikedArticle {
  articleId: number;
  title: string;
  imageUrl: string;
  countLikes: number;
  currentPrice: number;
  state: string;
}

export interface GiftMemoryResponse {
  content: GiftMemory[];
  totalPages: number;
  number: number;
  size: number;
  totalElements: number;
}

export interface GiftMemory {
  giftHistoryId: number;
  createdAt: string;
  senderNickname: string;
  cardDesign: CardDesign;
}

export interface CardDesign {
  id: string;
  message: string;
  recipientName: string;
  frontTemplate: Record<string, any>;
  backTemplate: Record<string, any>;
  frontElements: Record<string, any>[];
  backElements: Record<string, any>[];
  flipped: boolean;
}

export interface PendingGiftMemory {
  id: string;
  senderName: string;
  senderNickname: string;
  sentDate: string;
  isAccepted: boolean;
  acceptedDate?: string;
  cardData: CardDesign;
  giftItem?: {
    id: string;
    title: string;
    brand: string;
    price: number;
    image: string;
  };
}

// 받은 선물은 GiftHistory 기반
export interface ReceivedGiftMemory {
  giftHistoryId: number;
  createdAt: string;
  senderNickname: string;
  cardDesign: CardDesign;
}

export const deleteUser = async () => {
  const response = await apiClient.delete("/users/me");
  return response;
};

export const updateUserNickname = async (nickname: string) => {
  const response = await apiClient.patch("/users/nickname", {
    nickname: nickname,
  });
  return response;
};

export const updateWallet = async (walletAddress: string) => {
  const response = await apiClient.patch("/users/wallet", {
    walletAddress: walletAddress,
  });
  return response;
};

export async function fetchLikedArticles(
  page: number
): Promise<{ totalPage: number; likes: LikedArticle[] }> {
  const accessToken = localStorage.getItem("access_token");

  if (!accessToken) {
    console.error("Access Token이 없습니다. 로그인 필요.");
    return { totalPage: 1, likes: [] };
  }

  try {
    const response = await fetch(`${BASE_URL}/users/likes?page=${page}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    return await response.json(); // { totalPage, likes: [...] }
  } catch (error) {
    console.error("찜한 상품 불러오기 실패:", error);
    return { totalPage: 1, likes: [] };
  }
}

export async function fetchReceivedGifts(page = 0, size = 8) {
  const token = localStorage.getItem("access_token");
  const url = `${BASE_URL}/gift-histories/received?page=${page}&size=${size}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("받은 선물 불러오기 실패");
  }

  return await response.json();
}

export async function fetchUsedGifticons(page = 0, size = 8) {
  const token = localStorage.getItem("access_token");
  const url = `${BASE_URL}/users/gifticons/used?page=${page}&size=${size}&sort=createdAt`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("사용한 기프티콘 불러오기 실패");
  }

  return await response.json();
}

export const markGifticonUsedAsRedeemed = async (tsHash: string) => {
  try {
    const response = await apiClient.post(`/users/gifticons/${tsHash}`);
    console.log("Gifticon marked as used response:", response);
    // Assuming the backend returns a success status or relevant data
    // You might want to return response.data or a boolean based on status
    return { success: response.status === 200 || response.status === 204 }; // Adjust status codes as needed
  } catch (error) {
    console.error("Failed to mark gifticon as used:", error);
    // Rethrow or return an error object/flag
    return { success: false, error };
  }
};
