require("@nomicfoundation/hardhat-toolbox");
require("solidity-coverage");
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
    ganache: {
      url: "http://127.0.0.1:7545", // Ganache GUI의 기본 URL
      accounts: [
        // Ganache에서 제공하는 첫 번째 계정의 private key
        "0xb008e23b2ee3ebfc7d21c808b588bc358106613152039be271d9a8c76cbd8d1f",
      ],
    },
    ssafy: {
      url: "https://rpc.ssafy-blockchain.com",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 31221,
      gas: "auto",
      gasPrice: 0,
      timeout: 120000, // <-- 2분까지 여유
    },
  },
  solidity: {
    version: "0.8.20", // 현재 사용하는 버전 유지
    settings: {
      optimizer: {
        enabled: true,
        runs: 50, // 낮을수록 코드 사이즈 줄어듦
      },
    },
  },
};
