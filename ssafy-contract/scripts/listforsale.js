require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const nftContractAddress = "0x1B4dC71e7B1248BE5a894214e7dDBA985Dccc759"; // GifticonNFT
  const targetAddress = "0xe911090F1ca13EE23f3C1eE964c5d4e323987e9f";
  const sellerAddress = "0x4ED78E0a67c2F984D4985D490aAA5bC36340263F";
  const ssfDecimals = 0;

  const serialNumber = process.argv[2];
  const sellPrice = ethers.parseUnits(process.argv[3] || "1", ssfDecimals);

  if (!serialNumber || !sellPrice) {
    throw new Error("❌ serialNumber와 sellPrice를 모두 입력하세요.");
  }

  console.log(`🚀 SSAFY RPC 연결 중...`);
  const provider = new ethers.JsonRpcProvider(
    "https://rpc.ssafy-blockchain.com"
  );

  const privateKey = process.env.TEST_PRIVATE_KEY;
  if (!privateKey)
    throw new Error("❌ .env에 TEST_PRIVATE_KEY가 설정되지 않았습니다.");

  const signer = new ethers.Wallet(privateKey, provider);
  if (signer.address.toLowerCase() !== sellerAddress.toLowerCase()) {
    console.log("signer.address.toLowerCase()", signer.address.toLowerCase());
    console.log("sellerAddress.toLowerCase()", sellerAddress.toLowerCase());

    throw new Error("❌ 서명자 주소가 판매자 주소와 일치하지 않습니다.");
  }

  console.log(`🛠 판매자 주소: ${signer.address}`);

  const gifticonNFT = await ethers.getContractAt(
    "GifticonNFT",
    nftContractAddress,
    signer
  );

  // ✅ 마켓플레이스에 NFT 전송 권한 위임
  console.log("🔑 마켓플레이스에 NFT 전송 권한 위임 중...");
  await gifticonNFT.setApprovalForAll(targetAddress, true);

  try {
    console.log(`🔍 시리얼 넘버(${serialNumber})로 tokenId 조회 중...`);
    const tokenId = await gifticonNFT.getTokenIdBySerial(serialNumber);
    console.log(`📌 tokenId: ${tokenId}`);

    const serialInfo = await gifticonNFT.getSerialInfo(serialNumber);
    const redeemed = serialInfo[5]; // ✅ 사용 여부
    const seller = serialInfo[1];

    if (redeemed) throw new Error("❌ 이미 사용된 NFT입니다.");
    if (seller !== ethers.ZeroAddress)
      throw new Error("❌ 이미 판매 등록된 NFT입니다.");

    console.log("🚀 판매 정보 등록 중...");
    const tx = await gifticonNFT.listForSale(serialNumber, sellPrice);
    await tx.wait();

    const updatedInfo = await gifticonNFT.getSerialInfo(serialNumber);
    const updatedPrice = updatedInfo[0];
    const updatedSeller = updatedInfo[1];

    console.log("✅ 판매 등록 완료!");
    console.log(`📌 등록된 판매자: ${updatedSeller}`);
    console.log(
      `💰 판매 가격: ${ethers.formatUnits(updatedPrice, ssfDecimals)} SSF`
    );

    const isApprovedAfter = await gifticonNFT.isApprovedForAll(
      sellerAddress,
      targetAddress
    );
    console.log(
      `🔍 승인 상태 확인 결과: ${
        isApprovedAfter ? "✅ 승인 완료!" : "❌ 승인 실패!"
      }`
    );
  } catch (err) {
    console.error(`❌ 오류 발생: ${err.message}`);
  }
}

main().catch((err) => {
  console.error("❌ 실행 중 오류:", err);
  process.exit(1);
});
