require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0xB234356aE671F22D2bd0E23D843f02D61890b531"; // 컨트랙트 주소
  const userAAddress = "0x4ED78E0a67c2F984D4985D490aAA5bC36340263F"; // 사용자 A
  const userBAddress = "0xe911090F1ca13EE23f3C1eE964c5d4e323987e9f"; // 사용자 B

  const tokenId = 1;
  const mintAmount = 1;

  const ssfDecimals = 0;
  const price = ethers.parseUnits("10", ssfDecimals);

  const name = "테스트 아이템";
  const description = "테스트를 위한 아이템입니다.";
  const metadataURI =
    "ipfs://bafkreidpioogd7mj4t5sovbw2nkn3tavw3zrq4qmqwvkxptm52scasxfl4";

  console.log(`🚀 SSAFY RPC 연결 중...`);
  const provider = new ethers.JsonRpcProvider(
    "https://rpc.ssafy-blockchain.com"
  );

  const deployerPrivateKey = process.env.PRIVATE_KEY;
  if (!deployerPrivateKey) {
    throw new Error("❌ .env에 PRIVATE_KEY 설정되지 않았습니다.");
  }
  const deployerSigner = new ethers.Wallet(deployerPrivateKey, provider);
  console.log(`🛠 Deployer 주소: ${deployerSigner.address}`);

  const userAPrivateKey = process.env.TEST_PRIVATE_KEY; // 사용자 A의 개인 키
  let userASigner = null;
  if (userAPrivateKey) {
    userASigner = new ethers.Wallet(userAPrivateKey, provider);
    console.log(`🛠 사용자 A 주소: ${userASigner.address}`);
  } else {
    console.warn(
      "⚠️ .env에 USER_A_PRIVATE_KEY가 설정되지 않았습니다. 사용자 A로 선물 보내는 기능은 작동하지 않을 수 있습니다."
    );
  }

  const gifticonNFT = await ethers.getContractAt(
    "GifticonNFT",
    contractAddress,
    deployerSigner
  );

  let serialNumber;

  console.log("🚀 NFT 민팅 중...");
  try {
    const txMint = await gifticonNFT.mintBatchWithSerials(
      deployerSigner.address,
      tokenId,
      mintAmount,
      price,
      name,
      description,
      metadataURI
    );
    const receiptMint = await txMint.wait();
    console.log("✅ 민팅 완료:", receiptMint.transactionHash);

    console.log("🔍 시리얼 넘버 추출 중...");
    const topicMinted = ethers.id("Minted(address,uint256,uint256,uint256)");
    const logsMinted = receiptMint.logs.filter(
      (log) => log.topics[0] === topicMinted
    );

    if (logsMinted.length > 0) {
      const parsedLog = gifticonNFT.interface.parseLog(logsMinted[0]);
      serialNumber = parsedLog.args.serialNumber.toString();
      console.log("✅ 추출된 시리얼 넘버:", serialNumber);

      console.log("🚚 사용자 A에게 NFT 전송 중...");
      const txTransfer = await gifticonNFT.authorizedTransferBySerial(
        deployerSigner.address,
        userAAddress,
        serialNumber
      );
      const receiptTransfer = await txTransfer.wait();
      console.log(
        `🔄 사용자 A에게 전송 완료: Serial ${serialNumber} (블록: ${receiptTransfer.blockNumber})`
      );

      if (userASigner) {
        const gifticonNFTUserA = gifticonNFT.connect(userASigner);
        console.log("🎁 사용자 B에게 선물 보내는 중...");
        const txGift = await gifticonNFTUserA.giftToFriendByAlias(
          serialNumber,
          "4100972657"
        );
        const receiptGift = await txGift.wait();
        console.log(
          `✅ 사용자 B에게 선물 보내기 완료: Serial ${serialNumber} (블록: ${receiptGift.blockNumber})`
        );
      } else {
        console.warn(
          "⚠️ .env에 USER_A_PRIVATE_KEY가 설정되지 않아 선물 보내기를 건너뜁니다."
        );
      }
    } else {
      console.log("⚠️ Minted 이벤트에서 시리얼 넘버를 찾을 수 없습니다.");
    }
  } catch (error) {
    console.error("❌ 실행 오류:", error);
  }
}

main().catch((err) => {
  console.error("❌ 실행 오류:", err.message);
  process.exit(1);
});
