require("dotenv").config();
const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider("https://rpc.ssafy-blockchain.com");

async function detectBlockIntervals(count = 10) {
  const latestBlockNumber = await provider.getBlockNumber();
  const intervals = [];

  console.log("블록 번호 | 생성 시간               | 간격 (초)");
  console.log("--------------------------------------------------");

  for (let i = 0; i < count; i++) {
    const current = await provider.getBlock(latestBlockNumber - i);
    const prev = await provider.getBlock(latestBlockNumber - i - 1);
    const interval = current.timestamp - prev.timestamp;
    intervals.push(interval);

    const dateStr = new Date(current.timestamp * 1000)
      .toISOString()
      .replace("T", " ")
      .slice(0, 19);
    console.log(
      `${current.number.toString().padEnd(9)} | ${dateStr} | ${interval
        .toString()
        .padStart(5)}초`
    );
  }

  const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  console.log(`\n📊 평균 블록 생성 간격: ${avg.toFixed(2)}초`);
}

detectBlockIntervals().catch(console.error);
