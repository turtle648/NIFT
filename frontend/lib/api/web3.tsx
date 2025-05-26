import { ethers, TransactionResponse, TransactionReceipt } from "ethers";
import { GetGifticonResponse } from "./CreateGiftHistory";
import axios from "axios";
import exp from "constants";
import { apiClient } from "./CustomAxios";

// ✅ 환경 변수에서 컨트랙트 주소 가져오기
export const SSF_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_SSF_CONTRACT_ADDRESS || "";
export const NFT_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || "";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ✅ SSF 토큰 및 NFT 컨트랙트 ABI
const SSF_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

const NFT_ABI = [
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])",
  "function uri(uint256 id) view returns (string)",
  "function purchaseBySerial(uint256 serialNumber)",
  "function getSerialInfo(uint256 serialNumber) view returns (uint256 price, address seller, address owner, address originalOwner, uint256 expirationDate, bool redeemed, uint256 redeemedAt, bool isPending, uint256 pendingDate, address pendingRecipient)",
  "function getSerialsByOwner(address) view returns (uint256[])",
  "function getTokenIdBySerial(uint256 serialNumber) view returns (uint256)",
  "function getTokenInfo(uint256 tokenId) view returns (string name, string description, uint256 totalSupply, string metadataURI)",
  "function isApprovedForAll(address account, address operator) view returns (bool)",
  "function giftToFriend(uint256 serialNumber, address recipient)",
  "function giftToFriendByAlias(uint256 serialNumber, string calldata aliasName)",
  "function claimGiftByAlias(string calldata aliasName, uint256 serialNumber)",
  "function getPendingGiftsByKakaoId(string) view returns (uint256[])",

  "function listForSale(uint256 serialNumber, uint256 price)",
  "function cancelSale(uint256 serialNumber)",
  "function redeem(uint256 serialNumber, address brandAdress)",
];

// const ETH_ABI = [
//   "function balanceOf(address account, uint256 id) view returns (uint256)",
//   "function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])",
//   "function uri(uint256 id) view returns (string)",
//   "function purchaseBySerial(uint256 serialNumber) payable", // payable로 변경
//   "function getSerialInfo(uint256 serialNumber) view returns (uint256 price, address seller, address owner, uint256 expirationDate, bool isRedeemed, uint256 redeemedAt)",
//   "function getTokenIdBySerial(uint256 serialNumber) view returns (uint256)",
//   "function getTokenInfo(uint256 tokenId) view returns (string name, string description, uint256 totalSupply, string metadataURI)",
// ];

/**
 * ✅ Metamask 연결 및 provider 반환
 * @returns {Promise<ethers.BrowserProvider | null>}
 */
async function getProvider(): Promise<ethers.BrowserProvider | null> {
  if (typeof window === "undefined" || !window.ethereum) {
    console.error("Metamask가 설치되지 않음");
    return null;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []); // 지갑 연결 요청
    return provider;
  } catch (error) {
    console.error("Metamask 연결 실패:", error);
    return null;
  }
}

/**
 * ✅ 사용자의 SSF 토큰 잔액 가져오기
 * @param userAddress - 조회할 사용자 지갑 주소
 * @returns {Promise<string>} - 잔액을 문자열로 반환
 */
export async function getSSFBalance(userAddress: string): Promise<string> {
  const provider = await getProvider();
  if (!provider) return "0";

  try {
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(SSF_CONTRACT_ADDRESS, SSF_ABI, signer);

    const balance = await contract.balanceOf(userAddress);
    const decimals = await contract.decimals();
    return ethers.formatUnits(balance, decimals);
  } catch (error) {
    console.error("SSF 잔액 조회 실패:", error);
    return "0";
  }
}

// ✅ IPFS 주소 변환 유틸
export const convertIpfsUrl = (url: string): string => {
  if (!url) return "";
  return url.replace("ipfs://", "https://ipfs.io/ipfs/");
};

// ✅ 메타데이터 가져오기
export const fetchMetadata = async (
  metadataUrl: string,
  serialNumber: number,
  tokenId: number // 🔥 tokenId 파라미터 추가!
) => {
  try {
    // ✅ 여기에 디버깅 코드 추가 👇
    // console.log("🎯 metadataURI:", metadataUrl);
    // console.log("🌐 실제 요청 주소:", convertIpfsUrl(metadataUrl));

    const response = await fetch(convertIpfsUrl(metadataUrl));

    // ✅ 응답 타입 확인
    // const contentType = response.headers.get("content-type");
    // console.log("📦 콘텐츠 타입:", contentType);
    // if (!contentType?.includes("application/json")) {
    //   throw new Error("😡 이건 JSON이 아닌 파일입니다. CID를 확인하세요!");
    // }

    const metadata = await response.json();

    // attributes에서 정보 추출
    const attributes = metadata.attributes || [];
    const brandAttr = attributes.find(
      (attr: any) => attr.trait_type === "Brand"
    );
    const categoryAttr = attributes.find(
      (attr: any) => attr.trait_type === "Category"
    );
    const expiryAttr = attributes.find(
      (attr: any) => attr.trait_type === "Valid Until"
    );

    return {
      id: tokenId || `Unknown`,
      serialNum: serialNumber,
      title: metadata.name || `NFT 기프티콘`,
      brand: brandAttr ? brandAttr.value : "알 수 없음",
      category: categoryAttr ? categoryAttr.value : "알 수 없음", // ✅ 수정된 부분!
      image: convertIpfsUrl(metadata.image),
    };
  } catch (error) {
    console.error("❌ NFT 메타데이터 로딩 실패:", error);
    return null;
  }
};

export interface UserNFT {
  brand: string;
  category: string;
  expirationDate: bigint;
  id: number;
  image: string;
  isPending: boolean;
  isSelling: boolean;
  pendingDate: bigint;
  pendingRecipient: string;
  expiryDate: string;
  price: number;
  redeemed: false;
  redeemedAt: bigint;
  seller: string;
  serialNum: bigint;
  title: string;
  tokenId: number;
  owner?: string;
}

// ✅ 시리얼 기반으로 사용자 NFT 목록 가져오기
export async function getUserNFTsAsJson(userAddress: string): Promise<any[]> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, signer);

    // 1. 시리얼 리스트 가져오기
    const serials: any = await contract.getSerialsByOwner(userAddress);

    // 2. 각 시리얼에 대해 정보 가져오기
    const nftData = await Promise.all(
      serials.map(async (serialBigNum: any) => {
        const serial = serialBigNum;

        // tokenId 및 메타데이터 URI 조회
        const tokenId = await contract.getTokenIdBySerial(Number(serial));

        // 로그 찍어보기
        const info = await contract.getSerialInfo(serial);
        console.log("📦 전체 SerialInfo 결과:", info); // <-- ✅ 이거 추가

        // ⭐ 시리얼 정보 조회해서 유효기간 받기
        const [
          price, // 0
          seller, // 1
          owner, // 2
          originalOwner, // 3
          expirationDate, // ✅ 진짜 유효기간
          redeemed,
          redeemedAt,
          isPending,
          pendingDate,
          pendingRecipient,
        ] = await contract.getSerialInfo(serial);

        // 날짜 로그
        console.log("📅 expirationDate(raw):", Number(expirationDate));

        // ✅ 유효기간 포맷팅 (YYYY-MM-DD 형식)
        let expiryDateFormatted = "무제한";
        if (expirationDate && Number(expirationDate) > 0) {
          const date = new Date(Number(expirationDate) * 1000);
          if (!isNaN(date.getTime())) {
            expiryDateFormatted = date.toISOString().split("T")[0];
          }
        }
        const [, , , metadataURI] = await contract.getTokenInfo(tokenId);

        const metadata = await fetchMetadata(
          metadataURI,
          serial,
          Number(tokenId)
        );

        return {
          ...metadata,
          tokenId: Number(tokenId),
          id: Number(tokenId),
          serialNum: serial,
          price: Number(price),
          seller: seller,
          isSelling:
            Number(price) > 0 &&
            seller !== "0x0000000000000000000000000000000000000000",
          expiryDate: expiryDateFormatted, // ✅ 꼭 필요!
          expirationDate: expirationDate,
          redeemed: redeemed,
          redeemedAt: redeemedAt,
          isPending: isPending,
          pendingDate: pendingDate,
          pendingRecipient: pendingRecipient,
        };
      })
    );

    console.log(`🪙 사용자 보유 토큰 정보: `, nftData);

    return nftData;
  } catch (error) {
    console.error("❌ 사용자 NFT 조회 실패:", error);
    return [];
  }
}

export async function listGifticonForSale(serialNumber: number, price: number) {
  if (!window.ethereum) throw new Error("Metamask not found");

  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []); // 연결 요청
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, signer);

  try {
    const tx = await contract.listForSale(serialNumber, price);
    const receipt = await tx.wait();

    console.log("✅ Success:", receipt);
    return receipt;
  } catch (error: any) {
    console.error(
      "❌ 트랜잭션 실패:",
      error?.reason || error?.message || error
    );
    throw error;
  }
}

export async function isSellerApprovedForSerial(
  serialNumber: number
): Promise<boolean> {
  const provider = new ethers.BrowserProvider(window.ethereum);
  if (!provider) return false;

  try {
    const signer = await provider.getSigner();
    const nftContract = new ethers.Contract(
      NFT_CONTRACT_ADDRESS,
      NFT_ABI,
      signer
    );

    // 시리얼 넘버로부터 판매자 주소 조회
    const [, seller] = await nftContract.getSerialInfo(serialNumber);

    // 판매자가 NFT 컨트랙트에 전송 권한을 위임했는지 확인
    const isApproved = await nftContract.isApprovedForAll(
      seller,
      NFT_CONTRACT_ADDRESS
    );
    console.log(`🔍 판매자 ${seller} 의 approval 상태:`, isApproved);

    return isApproved;
  } catch (error) {
    console.error("❌ approval 상태 확인 실패:", error);
    return false;
  }
}

export type GiftNFTResponse = {
  success: boolean;
  txHashPurchase?: string;
  txHashGift?: string;
};

export async function giftToFriend(
  serialNumber: number,
  friendId: string
): Promise<GiftNFTResponse> {
  console.log("giftToFriend 호출됨");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const fail: GiftNFTResponse = { success: false };
  if (!provider) return fail;

  try {
    const signer = await provider.getSigner();

    if (!NFT_CONTRACT_ADDRESS || !SSF_CONTRACT_ADDRESS) {
      console.error("❌ 컨트랙트 주소가 설정되지 않았습니다.");
      return fail;
    }

    const nftContract = new ethers.Contract(
      NFT_CONTRACT_ADDRESS,
      NFT_ABI,
      signer
    );
    const ssfToken = new ethers.Contract(SSF_CONTRACT_ADDRESS, SSF_ABI, signer);

    const serial = BigInt(serialNumber);
    const [
      price,
      seller,
      owner,
      originalOwner,
      expirationDate,
      isRedeemed,
      redeemedAt,
      isPending,
      pendingDate,
      pendingRecipient,
    ] = (await nftContract.getSerialInfo(serial)) as [
      bigint,
      string,
      string,
      string,
      bigint,
      boolean,
      bigint,
      boolean,
      bigint,
      string
    ];

    if (isRedeemed) {
      throw new Error(`❌ 이미 사용된 NFT입니다. ${serialNumber}`);
    }

    if (isPending) {
      throw new Error(`❌ 이미 선물 대기 중인 NFT입니다.`);
    }

    const buyer = await signer.getAddress();
    const ssfBalance: bigint = await ssfToken.balanceOf(buyer);
    const allowance: bigint = await ssfToken.allowance(
      buyer,
      NFT_CONTRACT_ADDRESS
    );
    let txHashPurchase: string = "";
    if (owner.toLowerCase() !== buyer.toLowerCase()) {
      console.log("🔐 [구매자 정보]", {
        구매자: buyer,
        SSF_잔액: ssfBalance.toString(),
        결제_금액: price.toString(),
        승인_허용량: allowance.toString(),
      });

      const response = await buyNFT(serialNumber);

      if (!response.success) {
        throw Error("❌ 구매 실패");
      }
      txHashPurchase = String(response.txHash);
    }

    if (ssfBalance < price) throw new Error("❌ SSF 잔액이 부족합니다.");

    if (allowance < price) {
      console.log("⚠️ 허용량 부족. approve 실행 중...");
      const approveTx = await ssfToken.approve(NFT_CONTRACT_ADDRESS, price);
      await approveTx.wait();
      console.log("✅ 토큰 승인 완료");
    } else {
      console.log("✅ 승인량 충분. approve 생략");
    }

    console.log("🚀 NFT 선물 트랜잭션 실행 시작...");
    const tx = await nftContract.giftToFriendByAlias(serial, friendId);
    console.log("⏳ 트랜잭션 전송됨. 대기 중...");
    const receipt = await tx.wait();
    console.log("✅ SSF로 NFT 선물 완료");
    console.log("✅ Success:", receipt);

    return {
      success: true,
      txHashPurchase: txHashPurchase,
      txHashGift: tx.hash,
    };
  } catch (error) {
    console.error("❌ NFT 선물 실패:", error);
    return fail;
  }
}

export type BuyNFTResponse = {
  success: boolean;
  txHash?: string;
};

export async function buyNFT(serialNumber: number): Promise<BuyNFTResponse> {
  console.log(
    "✅ 프론트에서 사용하는 컨트랙트 주소:",
    process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS
  );

  const provider = new ethers.BrowserProvider(window.ethereum);

  const fail: BuyNFTResponse = { success: false };
  if (!provider) return fail;

  try {
    const signer = await provider.getSigner();

    if (!NFT_CONTRACT_ADDRESS || !SSF_CONTRACT_ADDRESS) {
      console.error("❌ 컨트랙트 주소가 설정되지 않았습니다.");
      return fail;
    }

    const nftContract = new ethers.Contract(
      NFT_CONTRACT_ADDRESS,
      NFT_ABI,
      signer
    );
    const ssfToken = new ethers.Contract(SSF_CONTRACT_ADDRESS, SSF_ABI, signer);

    const [
      price,
      seller,
      owner,
      originalOwner,
      expirationDate,
      isRedeemed,
      redeemedAt,
      isPending,
      pendingDate,
      pendingRecipient,
    ] = (await nftContract.getSerialInfo(serialNumber)) as [
      bigint,
      string,
      string,
      string,
      bigint,
      boolean,
      bigint,
      boolean,
      bigint,
      string
    ];

    // expirationDate와 redeemedAt을 Date 객체로 변환 (필요한 경우)
    const expirationDateObj = new Date(Number(expirationDate) * 1000);
    const redeemedAtObj =
      Number(redeemedAt) === 0 ? null : new Date(Number(redeemedAt) * 1000);

    console.log({
      Price: String(price),
      Seller: seller,
      Owner: owner,
      OriginalOwner: originalOwner,
      ExpirationDate: String(expirationDateObj),
      IsRedeemed: isRedeemed,
      RedeemedAt: redeemedAtObj ? String(redeemedAtObj) : "Not redeemed",
      IsPending: isPending,
      PendingDate: String(pendingDate),
      PendingRecipient: pendingRecipient,
    });

    const isApproved = await isSellerApprovedForSerial(serialNumber);
    if (!isApproved) {
      throw new Error("❌ 판매자가 NFT 전송 권한을 위임하지 않았습니다.");
    }

    if (seller === ethers.ZeroAddress) {
      throw new Error("❌ 판매되지 않은 NFT입니다.");
    }
    if (isRedeemed) {
      throw new Error("❌ 이미 사용된 NFT입니다. " + serialNumber);
    }
    if (price <= 0n) {
      throw new Error("❌ 가격이 설정되지 않은 NFT입니다.");
    }

    const buyer = await signer.getAddress();
    const ssfBalance: bigint = await ssfToken.balanceOf(buyer);
    const allowance: bigint = await ssfToken.allowance(
      buyer,
      NFT_CONTRACT_ADDRESS
    );

    console.log("🔐 [구매자 정보]");
    console.log("👤 구매자:", buyer);
    console.log("💰 SSF 잔액:", ssfBalance.toString());
    console.log("🧾 결제 금액:", price.toString());
    console.log("🔓 승인 허용량:", allowance.toString());

    if (ssfBalance < price) {
      throw new Error("❌ SSF 잔액이 부족합니다.");
    }

    if (allowance < price) {
      console.log("⚠️ 허용량 부족. approve 실행 중...");
      const approveTx = await ssfToken.approve(NFT_CONTRACT_ADDRESS, price);
      await approveTx.wait();
      console.log("✅ 토큰 승인 완료");
    } else {
      console.log("✅ 승인량 충분. approve 생략");
    }

    console.log("🚀 NFT 구매 트랜잭션 실행 시작...");
    const tx = await nftContract.purchaseBySerial(serialNumber);
    console.log("⏳ 트랜잭션 전송됨. 대기 중...");
    const receipt = await tx.wait();
    console.log("✅ SSF로 NFT 구매 완료: ", receipt);

    return { success: true, txHash: tx.hash };
  } catch (error) {
    console.error("❌ NFT 구매 실패:", error);
    return fail;
  }
}

export async function fetchTokenInfoBySerial(serialNumber: number) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const nftContract = new ethers.Contract(
      NFT_CONTRACT_ADDRESS,
      NFT_ABI,
      signer
    );

    const tokenId = await nftContract.getTokenIdBySerial(serialNumber);
    const [name, description, totalSupply, metadataURI] =
      await nftContract.getTokenInfo(tokenId);

    return {
      tokenId,
      name,
      description,
      totalSupply,
      metadataURI,
    };
  } catch (error) {
    console.error("❌ [fetchTokenInfoBySerial] 토큰 정보 조회 실패:", error);
    return null;
  }
}

export type CancelSaleResponse = {
  success: boolean;
  txHash?: string;
};

// NFT 상태 [판매중] -> [판매중] 취소
export async function cancelSale(
  serialNumber: number
): Promise<CancelSaleResponse> {
  const fail: CancelSaleResponse = { success: false };

  if (!window.ethereum) {
    console.error("Metamask not found");
    return fail;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, signer);

    const tx = await contract.cancelSale(serialNumber);
    const receipt = await tx.wait();

    console.log("✅ 판매 취소 완료! ", receipt);

    return {
      success: true,
      txHash: tx.hash,
    };
  } catch (error) {
    console.error("❌ 판매 취소 실패:", error);
    return fail;
  }
}

export async function isSellingNFT(serialNumber: number): Promise<boolean> {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, signer);

  const [price, seller] = await contract.getSerialInfo(serialNumber);

  return (
    Number(price) > 0 && seller !== "0x0000000000000000000000000000000000000000"
  );
}

// 시리얼 넘버로 tokenID 가져오기
export async function getTokenIdBySerial(
  serialNumber: number
): Promise<number> {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, signer);

  const tokenId = await contract.getTokenIdBySerial(serialNumber);
  return Number(tokenId);
}

export async function getSerialInfo(
  serialNum: number
): Promise<GetGifticonResponse> {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, signer);
  const tokenInfo = await fetchTokenInfoBySerial(serialNum);

  const tokenMetadate = await fetchMetadata(
    tokenInfo?.metadataURI,
    serialNum,
    tokenInfo?.tokenId
  );

  const tokenMoreData = await axios.get(
    `${BASE_URL}/gifticons/${tokenInfo?.tokenId}`
  );

  const [
    price,
    seller,
    owner,
    originalOwner,
    expirationDate,
    redeemed,
    redeemedAt,
    isPending,
    pendingDate,
    pendingRecipient,
  ] = await contract.getSerialInfo(serialNum);

  const response: GetGifticonResponse = {
    gifticonId: tokenInfo?.tokenId,
    serialNum: serialNum,
    gifticonTitle: tokenInfo?.name,
    description: tokenInfo?.description,
    imageUrl: String(tokenMetadate?.image),
    price: Number(price),
    brandName: tokenMetadate?.brand,
    originalPrice: tokenMoreData.data.price,
  };

  console.log(response);

  return response;
}

export async function getNFTDetailInfo(serial: bigint): Promise<any> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, signer);

    const tokenId = await contract.getTokenIdBySerial(Number(serial));

    // 로그 찍어보기
    const info = await contract.getSerialInfo(serial);
    console.log("📦 전체 SerialInfo 결과:", info); // <-- ✅ 이거 추가

    // ⭐ 시리얼 정보 조회해서 유효기간 받기
    const [
      price, // 0
      seller, // 1
      owner, // 2
      originalOwner, // 3
      expirationDate, // ✅ 진짜 유효기간
      redeemed,
      redeemedAt,
      isPending,
      pendingDate,
      pendingRecipient,
    ] = await contract.getSerialInfo(serial);

    // 날짜 로그
    console.log("📅 expirationDate(raw):", Number(expirationDate));

    // ✅ 유효기간 포맷팅 (YYYY-MM-DD 형식)
    let expiryDateFormatted = "무제한";
    if (expirationDate && Number(expirationDate) > 0) {
      const date = new Date(Number(expirationDate) * 1000);
      if (!isNaN(date.getTime())) {
        expiryDateFormatted = date.toISOString().split("T")[0];
      }
    }
    const [, , , metadataURI] = await contract.getTokenInfo(tokenId);

    const metadata = await fetchMetadata(
      metadataURI,
      Number(serial),
      Number(tokenId)
    );

    return {
      ...metadata,
      tokenId: Number(tokenId),
      id: Number(tokenId),
      serialNum: serial,
      price: Number(price),
      seller: seller,
      owner: owner,
      isSelling:
        Number(price) > 0 &&
        seller !== "0x0000000000000000000000000000000000000000",
      expiryDate: expiryDateFormatted, // ✅ 꼭 필요!
      expirationDate: expirationDate,
      redeemed: redeemed,
      redeemedAt: redeemedAt,
      isPending: isPending,
      pendingDate: pendingDate,
      pendingRecipient: pendingRecipient,
    };
  } catch (error) {
    console.error("❌ 사용자 NFT 조회 실패:", error);
    return null;
  }
}

export interface UseNftResponse {
  success: boolean;
  txHash?: string;
}

export async function useNft(
  serialNum: number,
  brandAddr: string
): Promise<UseNftResponse> {
  const fail: UseNftResponse = { success: false };

  if (!window.ethereum) {
    console.error("Metamask not found");
    return fail;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, signer);

    const tx = await contract.redeem(serialNum, brandAddr);
    const receipt = await tx.wait();

    console.log("✅ 사용 완료! ", receipt);

    return {
      success: true,
      txHash: tx.hash,
    };
  } catch (error) {
    console.error("❌ 사용 실패:", error);
    return fail;
  }
}

export async function getGift(kakaoId: string): Promise<UserNFT[]> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, signer);

    const serials: bigint[] = await contract.getPendingGiftsByKakaoId(kakaoId);
    const data: UserNFT[] = await Promise.all(
      serials.map(async (num) => {
        const nft = await getNFTDetailInfo(num);
        return {
          brand: nft.brand,
          category: nft.category,
          expirationDate: nft.expirationDate,
          id: nft.id,
          owner:nft.owner,
          image: nft.image,
          isPending: nft.isPending,
          isSelling: nft.isSelling,
          pendingDate: nft.pendingDate,
          pendingRecipient: nft.pendingRecipient,
          expiryDate: nft.expiryDate,
          price: nft.price,
          redeemed: nft.redeemed,
          redeemedAt: nft.redeemedAt,
          seller: nft.seller,
          serialNum: nft.serialNum,
          title: nft.title,
          tokenId: nft.tokenId,
        };
      })
    );

    console.log(`🎁 선물 받은 목록`, data);
    return data;
  } catch (error) {
    console.error("❌ 선물 받은 목록 조회 실패:", error);
    return [];
  }
}

export interface RecieveResponse {
  success: boolean;
  txHash?: string;
  serialNum?: bigint;
}

export async function receiveNFT(
  serialNum: bigint,
  kakaoId: string
): Promise<RecieveResponse> {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const fail: RecieveResponse = { success: false };
  if (!provider) return fail;

  if (!kakaoId || kakaoId.trim().length === 0) {
    alert("❌ 카카오 ID가 유효하지 않습니다.");
    return fail;
  }

  // ✅ 3. serialNum 유효성 확인
  if (!serialNum || serialNum <= 0n) {
    alert("❌ 시리얼 넘버가 유효하지 않습니다.");
    return fail;
  }

  try {
    const signer = await provider.getSigner();

    if (!NFT_CONTRACT_ADDRESS || !SSF_CONTRACT_ADDRESS) {
      console.error("❌ 컨트랙트 주소가 설정되지 않았습니다.");
      return fail;
    }

    const nftContract = new ethers.Contract(
      NFT_CONTRACT_ADDRESS,
      NFT_ABI,
      signer
    );

    console.log("🚀 NFT 선물 받기 트랜잭션 실행 시작...");
    const tx = await nftContract.claimGiftByAlias(kakaoId, serialNum);
    console.log("⏳ 트랜잭션 전송됨. 대기 중...");
    const receipt = await tx.wait();
    console.log("✅ NFT 선물 받기 완료");
    console.log("✅ Success:", receipt);

    return {
      success: true,
      txHash: tx.hash,
      serialNum: serialNum,
    };
  } catch (error) {
    console.error("❌ NFT 선물 실패:", error);
    return fail;
  }
}

/**
 * 트랜잭션 전송: 사용자가 메타마스크 컨펌을 누른 후 실제 트랜잭션을 전송하고
 * ethers Transaction 객체를 반환합니다.
 */
export async function sendReceiveNFT(
  serialNum: bigint,
  kakaoId: string
): Promise<ethers.TransactionResponse | null> {
  const provider = new ethers.BrowserProvider(window.ethereum);
  if (!provider) {
    console.error("Metamask가 설치되지 않음");
    return null;
  }

  if (!kakaoId || kakaoId.trim().length === 0) {
    alert("❌ 카카오 ID가 유효하지 않습니다.");
    return null;
  }

  if (!serialNum || serialNum <= 0n) {
    alert("❌ 시리얼 넘버가 유효하지 않습니다.");
    return null;
  }

  try {
    const signer = await provider.getSigner();

    if (!NFT_CONTRACT_ADDRESS || !SSF_CONTRACT_ADDRESS) {
      console.error("❌ 컨트랙트 주소가 설정되지 않았습니다.");
      return null;
    }

    const nftContract = new ethers.Contract(
      NFT_CONTRACT_ADDRESS,
      NFT_ABI,
      signer
    );

    console.log("🚀 NFT 선물 받기 트랜잭션 전송 시작...");
    // sendReceiveNFT에서는 tx.wait()를 호출하지 않고 tx 객체만 반환합니다.
    const tx = await nftContract.claimGiftByAlias(kakaoId, serialNum);
    console.log("⏳ 트랜잭션 전송됨. MetaMask 컨펌 완료 후 tx 객체 반환:", tx.hash);
    return tx;
  } catch (error) {
    console.error("❌ NFT 선물 받기 트랜잭션 전송 실패:", error);
    return null;
  }
}

/**
 * 트랜잭션 확정: 이전에 전송된 Transaction 객체를 받아서
 * tx.wait()로 블록체인에서 확정되는 것을 기다립니다.
 */
export async function confirmReceiveNFT(
  tx: TransactionResponse // 이제 직접 import한 TransactionResponse 사용
): Promise<TransactionReceipt | null> {
  try {
    console.log("⏳ 트랜잭션 확정 대기 시작...");
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error("❌ NFT 선물 받기 트랜잭션 확정 실패:", error);
    return null;
  }
}

