import { useState } from "react";
import { formatUnits, parseAbi, parseUnits, type Address } from "viem";
import { sepolia } from "viem/chains";
import { useAccount, usePublicClient, useReadContracts, useSwitchChain, useWriteContract } from "wagmi";
import { getEnsV2Deployment } from "@thenamespace/ens-components";

// ENSv2's Sepolia mock DAI has an open mint, so testers can fund themselves.
export const SEPOLIA_DAI: Address = "0xf6fac8a58a0be13b9197f27c41b73162fe32572b";
export const SEPOLIA_USDC: Address = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
export const SEPOLIA_ETH_FAUCET = "https://cloud.google.com/application/web3/faucet/ethereum/sepolia";
export const SEPOLIA_USDC_FAUCET = "https://faucet.circle.com";

const DAI_MINT_AMOUNT = parseUnits("1000", 18);

const tokenAbi = parseAbi([
  "function balanceOf(address owner) view returns (uint256)",
  "function mint(address to, uint256 amount)",
]);

const fmt = (value: bigint | undefined, decimals: number) =>
  value === undefined
    ? "…"
    : Number(formatUnits(value, decimals)).toLocaleString("en-US", { maximumFractionDigits: 2 });

export function useTestFunds() {
  const { address, chainId } = useAccount();
  const publicClient = usePublicClient({ chainId: sepolia.id });
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const balances = useReadContracts({
    contracts: [
      { address: SEPOLIA_DAI, abi: tokenAbi, functionName: "balanceOf", args: [address!], chainId: sepolia.id },
      { address: SEPOLIA_USDC, abi: tokenAbi, functionName: "balanceOf", args: [address!], chainId: sepolia.id },
    ],
    query: { enabled: !!address, refetchInterval: 15_000 },
  });
  const dai = balances.data?.[0]?.result as bigint | undefined;
  const usdc = balances.data?.[1]?.result as bigint | undefined;

  const mintDai = async () => {
    if (!address || !publicClient) return;
    setError(null);
    setMinting(true);
    try {
      if (chainId !== sepolia.id) await switchChainAsync({ chainId: sepolia.id });
      const hash = await writeContractAsync({
        address: SEPOLIA_DAI,
        abi: tokenAbi,
        functionName: "mint",
        args: [address, DAI_MINT_AMOUNT],
        chainId: sepolia.id,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      await balances.refetch();
    } catch (e: any) {
      if (e?.code !== 4001 && !/rejected|denied/i.test(e?.message ?? ""))
        setError(e?.shortMessage || "Couldn't mint test DAI.");
    } finally {
      setMinting(false);
    }
  };

  return {
    isConnected: !!address,
    dai: fmt(dai, 18),
    usdc: fmt(usdc, 6),
    mintDai,
    minting,
    error,
    refetch: balances.refetch,
  };
}

export interface ManagerSubname {
  parent: string;
  label: string;
  owner: string;
  expiry: string;
}

export interface ManagerActivation {
  label: string;
  expiration: "Expirable" | "NonExpirable";
  active: boolean;
}

export const fetchJson = async <T,>(path: string, isTestnet: boolean): Promise<T | null> => {
  const managerApiUrl = getEnsV2Deployment(isTestnet)?.managerApiUrl;
  if (!managerApiUrl) return null;
  try {
    const res = await fetch(`${managerApiUrl}${path}`);
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
};
