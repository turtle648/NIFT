"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { UserCard } from "@/components/mypage/user-card";
import { UserSidebar } from "@/components/mypage/user-sidebar";
import { GiftTab } from "@/components/mypage/gift-tab";
import { TransactionsTab } from "@/components/mypage/transactions-tab";
import { SettingsTab } from "@/components/mypage/settings-tab";
import { WishList } from "@/components/mypage/wish-list";
import { EmptyState } from "@/components/mypage/empty-state";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  getGift,
  getSSFBalance,
  getUserNFTsAsJson,
  UserNFT,
} from "@/lib/api/web3";
import {
  updateUserNickname,
  updateWallet,
  fetchLikedArticles,
  fetchUsedGifticons
} from "@/lib/api/mypage";
import type { ArticleCardProps } from "@/components/article/article-card";
import { Gift, Clock, Package, Heart, Settings } from "lucide-react";
import { GiftMemories } from "@/components/mypage/gift-memory";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const ITEMS_PER_PAGE = 6;
const PAGE_GROUP_SIZE = 5;

const getAccessToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
const getKakaoToken = () =>
  typeof window !== "undefined"
    ? localStorage.getItem("kakao_access_token")
    : null;

export interface User {
  profileImage: string;
  nickname: string;
  walletAddress: string;
  balance: number;
  kakaoId: string;
  role: number;
}

export default function MyPage() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState({
    profileImage: "/placeholder.svg",
    nickname: "",
    walletAddress: "",
    balance: 0,
    kakaoId: "",
    role: 0
  });
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [ssfBalance, setSsfBalance] = useState("0");
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [allLikedArticles, setAllLikedArticles] = useState<ArticleCardProps[]>(
    []
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const [availableGiftCards, setAvailableGiftCards] = useState<any[]>([]);
  const [calculatedCards, setCalculatedCards] = useState<any[]>([]);
  const [availableCurrentPage, setAvailableCurrentPage] = useState(0);
  const [calculatedCurrentPage, setCalculatedCurrentPage] = useState(0);
  const [activeTab, setActiveTab] = useState("gifticons");
  const [giftCardTab, setGiftCardTab] = useState("available");
  const [usedGiftCards, setUsedGiftCards] = useState<any[]>([]);
  const [usedCurrentPage, setUsedCurrentPage] = useState(0)
  const [usedTotalPage, setUsedTotalPage] = useState(1);
  const [usedTotalCount, setUsedTotalCount] = useState(0);

  const calculateDday = (expiry: string): number => {
    const today = new Date();
    const date = new Date(expiry);
    // console.log(date);

    return Math.ceil(
      (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  const copyToClipboard = () => {
    if (user.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const connectOrUpdateWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("wallet_requestPermissions", [
          { eth_accounts: {} },
        ]);
        const accounts = await provider.send("eth_requestAccounts", []);
        const newWalletAddress = ethers.getAddress(accounts[0]);
        setWalletAddress(newWalletAddress);
        const data = await updateWallet(newWalletAddress);
        if (data.status === 204) {
          alert("지갑 주소가 성공적으로 등록되었습니다.");
          window.location.reload();
        } else {
          alert("지갑 주소 업데이트에 실패했습니다.");
        }
      } catch (error) {
        console.error("Metamask 연결 또는 DB 업데이트 실패:", error);
      }
    } else {
      alert("Metamask가 설치되어 있지 않습니다.");
    }
  };

  const deleteProcess = async () => {
    try {
      const kakaoAccessToken = getKakaoToken();
      const accessToken = getAccessToken();
      if (!kakaoAccessToken || !accessToken) return;
      const response = await fetch(`${BASE_URL}/users/me`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Kakao-Authorization": `Bearer ${kakaoAccessToken}`,
          "Content-Type": "application/json",
        },
      });
      if (response.status === 204) {
        setShowDeleteConfirm(false);
        localStorage.clear();
        router.push("/");
      }
    } catch (error) {
      console.error("회원 탈퇴 실패:", error);
    }
  };

  const updateNickname = async () => {
    try {
      const data = await updateUserNickname(nickname);
      if (data.status === 204) {
        alert("닉네임이 수정되었습니다.");
        window.location.reload();
      }
    } catch (error) {
      console.error("닉네임 업데이트 중 오류 발생:", error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const token = getAccessToken();
      if (!token) return;
      try {
        const response = await fetch(`${BASE_URL}/users/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) throw new Error(`API 요청 실패: ${response.status}`);
        const data = await response.json();
        setUser({
          profileImage: data.profileImage || "/placeholder.svg",
          nickname: data.nickname,
          walletAddress: data.walletAddress,
          balance: data.balance || 0,
          kakaoId: data.kakaoId,
          role: data.role || 0
        });
        setNickname(data.nickname);
        setWalletAddress(data.walletAddress || null);
        setAccessToken(token);
        // console.log("사용자 정보 : ", data.role)
      } catch (error) {
        console.error("유저 정보 불러오기 실패:", error);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchSSFBalance = async () => {
      if (!walletAddress) return;
      try {
        const balance = await getSSFBalance(walletAddress);
        setSsfBalance(balance);
      } catch (error) {
        console.error("SSF 잔액 가져오기 실패:", error);
      }
    };
    fetchSSFBalance();
  }, [walletAddress]);

  useEffect(() => {
    const loadAllLikedArticles = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/secondhand-articles/likes`,
          {
            headers: {
              Authorization: `Bearer ${getAccessToken()}`,
            },
          }
        );
        const data = await res.json();
        const transformed = data.map((article: any) => ({
          articleId: article.articleId,
          title: article.title,
          brandName: "",
          currentPrice: article.currentPrice,
          originalPrice: article.currentPrice,
          discountRate: 0,
          imageUrl: article.imageUrl,
          isLiked: true,
          state: article.state,
        }));
        setAllLikedArticles(transformed);
        setTotalPage(Math.ceil(transformed.length / ITEMS_PER_PAGE));
      } catch (error) {
        console.error("전체 찜 목록 가져오기 실패:", error);
      }
    };
    loadAllLikedArticles();
  }, []);

  useEffect(() => {
    const loadGifticons = async () => {
      if (!user.walletAddress) return;
      try {
        const nfts = await getUserNFTsAsJson(user.walletAddress);
        const now = new Date();
        const available: any[] = [];
        const calculated: any[] = [];

        for (const nft of nfts) {
          const expiry = new Date(Number(nft.expirationDate) * 1000);
          if (nft.redeemed || expiry.getTime() < now.getTime()) calculated.push(nft);
          else available.push(nft);
        }

        setAvailableGiftCards(available);
        setCalculatedCards(calculated);
      } catch (err) {
        console.error("NIFT 불러오기 실패", err);
      }
    };
    loadGifticons();
  }, [user.walletAddress]);

  const [startPage, setStartPage] = useState(0);
  const [endPage, setEndPage] = useState(PAGE_GROUP_SIZE);

  useEffect(() => {
    const currentGroup = Math.ceil((currentPage + 1) / PAGE_GROUP_SIZE);
    const newStartPage = (currentGroup - 1) * PAGE_GROUP_SIZE;
    const newEndPage = Math.min(newStartPage + PAGE_GROUP_SIZE, totalPage);

    setStartPage(newStartPage);
    setEndPage(newEndPage);
  }, [currentPage, totalPage]);

  const sidebarItems = [
    { icon: Gift, label: "보유 NIFT", value: "gifticons" },
    { icon: Clock, label: "거래 내역", value: "transactions" },
    { icon: Package, label: "선물 추억", value: "memories" },
    { icon: Heart, label: "찜한 상품", value: "favorites" },
    { icon: Settings, label: "설정", value: "settings" },
  ];

  const handleGifticonCalculated = (serialNum: number) => {
    setAvailableGiftCards((prev) =>
      prev.filter((item) => Number(item.serialNum) !== Number(serialNum))
    );
    const calculatedCards = availableGiftCards.find(
      (item) => Number(item.serialNum) === Number(serialNum)
    );
    if (calculatedCards) {
      setCalculatedCards((prev) => [...prev, { ...calculatedCards, redeemed: true }]);
    }
  };

  useEffect(() => {
    const fetchUsedGifts = async () => {
      try {
        const data = await fetchUsedGifticons(usedCurrentPage, 6); // ✅ 현재 페이지 반영
        setUsedGiftCards(data.content || []);
        setUsedTotalPage(data.totalPages || 1); // ✅ 전체 페이지도 저장
        setUsedTotalCount(data.totalElements || 0); // ✅ 총 개수 저장
      } catch (err) {
        console.error("사용 완료 선물 불러오기 실패:", err);
      }
    };

    if (accessToken) {
      fetchUsedGifts();
    }
  }, [accessToken, usedCurrentPage]); // ✅ 페이지 변경 감지

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-white py-12">
        <div className="container">
          {!accessToken ? (
            <EmptyState />
          ) : (
            <>
              <h1 className="mb-8 text-3xl font-bold">마이페이지</h1>
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_1fr]">
                <aside className="space-y-6">
                  <UserCard
                    user={user}
                    walletAddress={walletAddress}
                    ssfBalance={ssfBalance}
                    copied={copied}
                    copyToClipboard={copyToClipboard}
                    connectOrUpdateWallet={connectOrUpdateWallet}
                  />
                  {/* ✅ 이 부분만 모바일에서 숨김 */}
                  <div className="hidden lg:block">
                    <UserSidebar
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                    />
                  </div>
                </aside>
                <div>
                  <Card className="border-none shadow-md">
                    <CardContent className="p-6">
                      <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                      >
                        <TabsList className="mb-8 grid w-full grid-cols-5">
                          {sidebarItems.map((item) => (
                            <TabsTrigger key={item.value} value={item.value}>
                              <item.icon className="mr-2 h-4 w-4" />
                              <span className="hidden sm:inline">
                                {item.label}
                              </span>
                            </TabsTrigger>
                          ))}
                        </TabsList>

                        <TabsContent value="gifticons">
                          <div>
                            <h2 className="mb-4 text-xl font-semibold">
                              보유 NIFT
                            </h2>
                            <p className="mb-6 text-sm text-muted-foreground">
                              {giftCardTab === "available" &&
                                  `사용 가능한 기프티콘이 ${availableGiftCards.length}개 있어요.`}
                              {giftCardTab === "used" &&
                                  `사용 완료된 기프티콘이 ${usedTotalCount}개 있어요.`}
                              {giftCardTab === "calculated" &&
                                  `정산 완료된 기프티콘이 ${calculatedCards.length}개 있어요.`}
                            </p>
                          </div>
                          <GiftTab
                              userRole={user.role}
                              availableGiftCards={availableGiftCards}
                              usedGiftCards={usedGiftCards}
                              calculatedCards={calculatedCards}
                              ITEMS_PER_PAGE={ITEMS_PER_PAGE}
                              availableCurrentPage={availableCurrentPage}
                              setAvailableCurrentPage={setAvailableCurrentPage}
                              usedCurrentPage={usedCurrentPage}
                              setUsedCurrentPage={setUsedCurrentPage}
                              calculatedCurrentPage={calculatedCurrentPage}
                              setCalculatedCurrentPage={setCalculatedCurrentPage}
                              calculateDday={calculateDday}
                              giftCardTab={giftCardTab}
                              setGiftCardTab={setGiftCardTab}
                              onGifticonCalculated={handleGifticonCalculated}
                              usedTotalPage={usedTotalPage}
                              usedTotalCount={usedTotalCount}
                          />
                        </TabsContent>

                        <TabsContent value="transactions">
                          <TransactionsTab />
                        </TabsContent>

                        <TabsContent value="memories">
                          <div>
                            <h2 className="mb-4 text-xl font-semibold">
                              선물 추억
                            </h2>
                            <p className="mb-6 text-sm text-muted-foreground">
                              소중한 사람들과 주고받은 NIFT 카드를 확인해보세요.
                            </p>
                          </div>
                          <GiftMemories
                            user={user}
                            availableGiftCards={availableGiftCards}
                            setAvailableGiftCards={setAvailableGiftCards}
                          />
                        </TabsContent>

                        <TabsContent value="favorites">
                          <WishList
                            allLikedArticles={allLikedArticles}
                            setAllLikedArticles={setAllLikedArticles}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            startPage={startPage}
                            endPage={endPage}
                            totalPage={totalPage}
                            setTotalPage={setTotalPage}
                          />
                        </TabsContent>

                        <TabsContent value="settings">
                          <SettingsTab
                            nickname={nickname}
                            setNickname={setNickname}
                            walletAddress={walletAddress}
                            copied={copied}
                            copyToClipboard={copyToClipboard}
                            connectOrUpdateWallet={connectOrUpdateWallet}
                            updateNickname={updateNickname}
                            deleteProcess={deleteProcess}
                            showDeleteConfirm={showDeleteConfirm}
                            setShowDeleteConfirm={setShowDeleteConfirm}
                          />
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
