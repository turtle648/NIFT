const { ethers } = require("hardhat");
const { execSync } = require("child_process");

async function main() {
  const contractAddress = "0x127D23DCAdC78B9438d9B6c46F75E21a647c3AD6";
  const sellerAddress = "0xe911090F1ca13EE23f3C1eE964c5d4e323987e9f";

  const tokenId = 1;
  const mintAmount = 8;

  const ssfDecimals = 0;
  const price = ethers.parseUnits("10", ssfDecimals);

  const name = "스타벅스 기프티콘";
  const description = "아메리카노 T size";
  const metadataURI =
    "ipfs://bafkreidpioogd7mj4t5sovbw2nkn3tavw3zrq4qmqwvkxptm52scasxfl4";

  const gifticonNFT = await ethers.getContractAt(
    "GifticonNFT",
    contractAddress
  );
  const [deployer] = await ethers.getSigners();

  console.log("🚀 NFT 민팅 중...");
  const tx = await gifticonNFT.mintBatchWithSerials(
    deployer.address,
    tokenId,
    mintAmount,
    price,
    name,
    description,
    metadataURI
  );
  const receipt = await tx.wait();
  console.log("✅ 민팅 완료");

  console.log("🔍 시리얼 넘버 추출 중...");
  const topicMinted = ethers.id("Minted(address,uint256,uint256,uint256)");
  const logs = receipt.logs.filter((log) => log.topics[0] === topicMinted);

  const serials = logs.map((log) => {
    const parsed = gifticonNFT.interface.parseLog(log);
    return parsed.args.serialNumber.toString();
  });

  console.log("✅ 추출된 시리얼 넘버:", serials);

  console.log("🚚 판매자에게 NFT 전송 중...");
  for (const serial of serials) {
    const serialInfo = await gifticonNFT.getSerialInfo(serial);
    const actualOwner = serialInfo.owner;

    console.log(`📌 Serial ${serial} - 실제 소유자: ${actualOwner}`);
    console.log(`🤖 deployer 주소: ${deployer.address}`);

    if (actualOwner.toLowerCase() === deployer.address.toLowerCase()) {
      const tx = await gifticonNFT
        .connect(deployer)
        .authorizedTransferBySerial(deployer.address, sellerAddress, serial);
      const receipt = await tx.wait();

      // console.log(`🔄 전송 완료: Serial ${serial} ${JSON.stringify(receipt)}`);
      console.log(`🔄 전송 완료: Serial ${serial} ${receipt.blockNumber}`);
    } else {
      console.log(`⚠️ 소유자가 deployer가 아님. 전송 생략: Serial ${serial}`);
    }
  }

  // ✅ 자동 판매 등록
  console.log("🎉 전송 완료! 이제 전부 자동 판매 등록 시작");

  // const sellPrice = ethers.parseUnits("2", ssfDecimals);
  // for (const serial of serials) {
  //   console.log(`🚀 listForSale.js 실행 중 (Serial: ${serial})`);
  //   try {
  //     execSync(
  //       `node scripts/listForSale.js ${serial} ${sellPrice.toString()}`,
  //       {
  //         stdio: "inherit",
  //       }
  //     );
  //   } catch (error) {
  //     console.error(`❌ listForSale.js 실행 중 오류 발생:`, error.message);
  //   }
  // }
}

main().catch((err) => {
  console.error("❌ 실행 오류:", err.message);
  process.exit(1);
});
