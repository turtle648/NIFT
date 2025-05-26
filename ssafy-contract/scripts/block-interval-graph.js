const fs = require("fs");
const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider("https://rpc.ssafy-blockchain.com");

async function collectBlockIntervals(count = 20) {
  const latestBlockNumber = await provider.getBlockNumber();
  const data = [];

  for (let i = 0; i < count; i++) {
    const current = await provider.getBlock(latestBlockNumber - i);
    const prev = await provider.getBlock(latestBlockNumber - i - 1);
    const interval = current.timestamp - prev.timestamp;
    const date = new Date(current.timestamp * 1000).toISOString().slice(11, 19); // HH:mm:ss
    data.push({ block: current.number, time: date, interval });
  }

  fs.writeFileSync(
    "interval-data.json",
    JSON.stringify(data.reverse(), null, 2)
  );
  console.log("✅ interval-data.json 파일 생성 완료");
}

collectBlockIntervals().catch(console.error);
