import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { mainnet } from "viem/chains";

const CHAINLINK_ETH_USD = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419" as const;
const CACHE_KEY = "ns_eth_usd_price";
const TTL_MS = 3.5 * 60 * 60 * 1000; // 3.5 hours

const AGGREGATOR_ABI = [
  {
    inputs: [],
    name: "latestRoundData",
    outputs: [
      { name: "roundId", type: "uint80" },
      { name: "answer", type: "int256" },
      { name: "startedAt", type: "uint256" },
      { name: "updatedAt", type: "uint256" },
      { name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

function readCache(): number | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { rate, fetchedAt } = JSON.parse(raw);
    if (Date.now() - fetchedAt < TTL_MS) return rate;
  } catch {}
  return null;
}

function writeCache(rate: number) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ rate, fetchedAt: Date.now() })
    );
  } catch {}
}

export function useEthDollarValue(): { ethUsdRate: number | null } {
  const [ethUsdRate, setEthUsdRate] = useState<number | null>(() =>
    readCache()
  );

  const cacheHit = ethUsdRate !== null;

  // Skip the RPC call entirely when localStorage has a fresh value
  const { data } = useReadContract({
    address: CHAINLINK_ETH_USD,
    abi: AGGREGATOR_ABI,
    functionName: "latestRoundData",
    chainId: mainnet.id,
    query: {
      enabled: !cacheHit,
      staleTime: TTL_MS,
      gcTime: TTL_MS + 30 * 60 * 1000,
    },
  });

  useEffect(() => {
    if (!data) return;
    // Chainlink answer has 8 decimal places: e.g. 250000000000 = $2500.00
    const rate = Number(data[1]) / 1e8;
    if (rate > 0) {
      writeCache(rate);
      setEthUsdRate(rate);
    }
  }, [data]);

  return { ethUsdRate };
}
