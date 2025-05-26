"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Gift, ShoppingCart } from "lucide-react";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation"; // ✅ 추가

import { useLoading } from "@/components/LoadingContext";
import { buyNFT, fetchTokenInfoBySerial } from "@/lib/api/web3";

import { ArticleImage } from "@/components/articleDetail/ArticleImage";
import { ArticleInfo } from "@/components/articleDetail/ArticleInfo";
import { ArticlePrice } from "@/components/articleDetail/ArticlePrice";
import { ArticleLikeAndShare } from "@/components/articleDetail/ArticleLikeAndShare";
import { ArticlePurchaseDialog } from "@/components/articleDetail/ArticlePurchaseDialog";
import { ArticleSellerTab } from "@/components/articleDetail/ArticleSellerTab";
import { DeleteArticleButton } from "@/components/articleDetail/DeleteArticleButton";
import { postPurchaseHash, PurchaseParams } from "@/lib/api/purchase";
import { PopularArticles } from "@/components/home/popular-articles";

type ArticleDetail = {
  articleId: number;
  serialNum: number;
  title: string;
  description: string;
  userId: number;
  expirationDate: string;
  imageUrl: string;
  gifticonId: number;
  countLikes: number;
  currentPrice: number;
  createAt: string;
  viewCnt: number;
  originalPrice: number;
  brandName: string;
  categoryName: string;
  isLiked: boolean;
  userNickName: string;
  profileImage: string;
  sellerTxs: number;
};

export default function ArticlePage({ params }: { params: { id: string } }) {
  const { id } = params;

  const [amount, setAmount] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState<boolean>(false);
  const [purchaseStatus, setPurchaseStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [article, setArticle] = useState<
    (ArticleDetail & { walletAddress?: string }) | null
  >(null); // article 상태에 walletAddress 추가
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [countLikes, setLikeCount] = useState<number>(0);
  const { isLoading, setIsLoading } = useLoading();
  const router = useRouter();
  const [isPossible, setIsPossible] = useState<boolean>(true);
  const [isSold, setIsSold] = useState<boolean>(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        const accessToken = localStorage.getItem("access_token");
        const headers: HeadersInit = accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : {};

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/secondhand-articles/${id}`,
          { headers }
        );
        if (!res.ok) throw new Error("Failed to fetch article");

        const data = await res.json();
        setArticle(data);
        setIsLiked(data.liked);
        setLikeCount(data.countLikes);
        setIsPossible(data.possible);
        setIsSold(data.sold);
        // console.log("접속자의 거래 참여 상태 : ", data.possible);
      } catch (error) {
        console.error("Error fetching article:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, []);

  const handleLikeToggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    if (!token) return alert("로그인이 필요합니다.");

    const method = isLiked ? "DELETE" : "POST";
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/secondhand-articles/${article?.articleId}/likes`,
      {
        method,
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      console.warn("좋아요 토글 실패");
      setIsLiked((prev) => !prev);
      setLikeCount((prev) => (isLiked ? prev + 1 : prev - 1));
    }
  };

  async function checkWalletValidation(): Promise<
    "ok" | "login" | "no-metamask" | "no-account" | "mismatch" | "error"
  > {
    const token = localStorage.getItem("access_token");
    if (!token) return "login";

    if (!window.ethereum) return "no-metamask";

    try {
      // 1. 메타마스크 연결된 계정 가져오기
      let accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (!accounts || accounts.length === 0) {
        accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
      }
      if (!accounts || accounts.length === 0) return "no-account";

      const metamaskAddress = accounts[0].toLowerCase();

      // 2. 내 유저 정보에서 walletAddress 가져오기
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("유저 정보 조회 실패");

      const me = await res.json();
      const myWalletAddress = me.walletAddress?.toLowerCase();

      if (!myWalletAddress) return "mismatch"; // 유저 정보엔 지갑 주소 없는데 메타마스크 연결돼 있음

      // 3. 메타마스크와 DB 지갑 주소 비교
      if (metamaskAddress !== myWalletAddress) return "mismatch";

      return "ok";
    } catch (err) {
      console.error("지갑 검증 중 에러 발생:", err);
      return "error";
    }
  }

  const validateWallet = async (onSuccess: () => void) => {
    const result = await checkWalletValidation();

    switch (result) {
      case "login":
        alert("로그인이 필요합니다.");
        router.push("/signin");
        break;
      case "no-metamask":
        alert("메타마스크가 설치되어 있지 않습니다.");
        break;
      case "no-account":
        alert("메타마스크 계정이 연결되어 있지 않습니다.");
        break;
      case "mismatch":
        alert(
          "지갑 주소가 일치하지 않습니다. 마이페이지에서 다시 연결해주세요."
        );
        router.push("/mypage");
        break;
      case "error":
        alert("알 수 없는 오류가 발생했습니다.");
        break;
      case "ok":
        onSuccess();
        break;
    }
  };

  const handleClickBuy = () => {
    validateWallet(() => setShowPurchaseDialog(true));
  };

  const handleClickGift = () => {
    validateWallet(() =>
      router.push(`/gift/${params.id}/customize?type=article`)
    );
  };

  const handleBuyNFT = async (serialNumber: number) => {
    if (!window.ethereum) {
      setErrorMessage("MetaMask가 필요합니다.");
      setPurchaseStatus("error");
      return;
    }

    setPurchaseStatus("loading");
    setLoading(true);

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const success = await buyNFT(serialNumber);

      if (success) {
        setPurchaseStatus("success");
        const param: PurchaseParams = {
          articleId: Number(article?.articleId),
          txHash: String(success.txHash),
        };
        await postPurchaseHash(param);
        const tokenInfo = await fetchTokenInfoBySerial(serialNumber);
        console.log("Token Info:", tokenInfo);
      } else {
        setErrorMessage("구매에 실패했습니다.");
        setPurchaseStatus("error");
      }
    } catch (error) {
      console.error("Ethereum 연결 오류:", error);
      setErrorMessage("Ethereum 네트워크 연결 중 문제가 발생했습니다.");
      setPurchaseStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const shareBtn = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      alert("현재 페이지 URL이 복사되었습니다!");
    } catch (err) {
      console.error("URL 복사 실패:", err);
      alert("URL 복사에 실패했습니다.");
    }
  };

  if (!article) return <div className="p-10 text-center">로딩 중...</div>;
  console.log(article);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="container py-8">
          <Link
            href="/articles"
            className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            돌아가기
          </Link>

          <div className="grid gap-8 md:grid-cols-2">
            <ArticleImage imageUrl={article.imageUrl} title={article.title} />

            <div className="flex flex-col rounded-lg bg-white p-6 shadow-sm">
              <ArticleInfo
                title={article.title}
                categoryName={article.categoryName}
                description={article.description}
                expirationDate={article.expirationDate}
                createAt={article.createAt}
                viewCnt={article.viewCnt}
                countLikes={countLikes}
                brandName={article.brandName}
              />

              <ArticlePrice
                currentPrice={article.currentPrice}
                originalPrice={article.originalPrice}
              />

              <div className="mt-auto">
              {!isPossible && (
                <p className="text-sm text-muted-foreground mb-2">
                  판매자는 거래에 참여할 수 없습니다.
                </p>
              )}
                <div className="grid grid-cols-12 gap-1">
                  <div className="col-span-5">
                    {showPurchaseDialog && (
                      <ArticlePurchaseDialog
                        articleTitle={article.title}
                        articlePrice={article.currentPrice}
                        serialNum={article.serialNum}
                        amount={amount}
                        setAmount={setAmount}
                        loading={loading}
                        purchaseStatus={purchaseStatus}
                        errorMessage={errorMessage}
                        onBuy={handleBuyNFT}
                        onClose={() => {
                          setPurchaseStatus("idle");
                          setShowPurchaseDialog(false);
                        }}
                      />
                    )}
                    {!showPurchaseDialog && (
                      <Button
                        className="h-12 w-full px-[16px]"
                        size="lg"
                        onClick={handleClickBuy}
                        disabled={!isPossible || isSold}
                      >
                        <ShoppingCart className="mr-1 h-4 w-4" />
                        구매하기
                      </Button>
                    )}
                  </div>

                  <div className="col-span-5">
                    <Button
                      variant="outline"
                      className="h-12 w-full px-[16px]"
                      size="lg"
                      onClick={handleClickGift} // 이제 조건 검사 잘됨!
                      disabled={!isPossible || isSold}
                    >
                      <Gift className="mr-1 h-4 w-4" />
                      선물하기
                    </Button>
                  </div>

                  <ArticleLikeAndShare
                    isLiked={isLiked}
                    onLikeToggle={handleLikeToggle}
                    onShare={shareBtn}
                  />
                </div>

                <div className="mt-3">
                  <DeleteArticleButton
                    articleId={article.articleId}
                    articleUserId={article.userId}
                    serialNum={article.serialNum}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Tabs defaultValue="seller" className="w-full">
              <TabsList className="w-full justify-start border-b bg-transparent p-0">
                <TabsTrigger
                  value="seller"
                  className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  판매자 정보
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="seller"
                className="mt-6 rounded-lg bg-white p-6 shadow-sm"
              >
                <ArticleSellerTab
                  userId={article.userId}
                  userNickName={article.userNickName}
                  profileImage={article.profileImage}
                  sellerTxs={article.sellerTxs}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
        {/* <ArticleSimilarList /> */}
        <PopularArticles />
      </main>
      <Footer />
    </div>
  );
}
