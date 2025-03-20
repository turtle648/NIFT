require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  defaultNetwork: "hardhat", // 🟢 테스트 시 Hardhat 네트워크 사용
  networks: {
    hardhat: {
      // ✅ Hardhat 테스트 네트워크 추가
      accounts: {
        count: 10, // 🟢 기본적으로 10개의 테스트 계정 생성
        initialBalance: "10000000000000000000000", // 10,000 ETH
      },
    },
    ssafy: {
      url: "https://rpc.ssafy-blockchain.com", // SSAFY 네트워크 RPC URL
      accounts: [process.env.PRIVATE_KEY], // Metamask Private Key
      chainId: 31221, // SSAFY 네트워크 Chain ID
      gas: "auto", // ✅ 자동 설정
      gasPrice: 0, // ✅ 기본 통화를 SSF로 사용하려면 gasPrice를 0으로 설정
    },
  },
  solidity: "0.8.20",
};
