import {
  type Address,
  type Hex,
  type PublicClient,
  decodeFunctionResult,
  encodeFunctionData,
  getAddress,
  labelhash,
  parseAbi,
  toHex,
  zeroAddress,
} from "viem";
import { namehash, packetToBytes } from "viem/ens";
import { supportedAddresses, supportedTexts } from "@thenamespace/ens-components";

// ENSv2 on Sepolia: the .eth registry and the universal resolver.
const ENSV2_ETH_REGISTRY: Address = "0xD4eBcbBdF463C9c45784603Db0dDD499BC44A8B4";
const ENSV2_UNIVERSAL_RESOLVER: Address = "0xeEeEEEeE14D718C2B47D9923Deab1335E144EeEe";

const registryAbi = parseAbi([
  "function getTokenId(uint256 anyId) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function getSubregistry(string label) view returns (address)",
]);
const universalResolverAbi = parseAbi([
  "function resolve(bytes name, bytes data) view returns (bytes result, address resolver)",
]);
const resolverAbi = parseAbi([
  "function text(bytes32 node, string key) view returns (string)",
  "function addr(bytes32 node, uint256 coinType) view returns (bytes)",
]);

const isEvmCoinType = (coinType: number) => coinType === 60 || coinType >= 0x80000000;

/**
 * Owner of a .eth name or subname in ENSv2, lowercased; zero address when unregistered.
 * Walks the registry tree from the .eth registry down to the name's parent registry.
 */
export const getEnsV2Owner = async (client: PublicClient, name: string): Promise<string> => {
  const labels = name.split(".");
  if (labels.length < 2 || labels[labels.length - 1] !== "eth") return zeroAddress;

  let registry = ENSV2_ETH_REGISTRY;
  for (const label of labels.slice(1, -1).reverse()) {
    registry = await client.readContract({
      address: registry,
      abi: registryAbi,
      functionName: "getSubregistry",
      args: [label],
    });
    if (registry === zeroAddress) return zeroAddress;
  }

  const tokenId = await client.readContract({
    address: registry,
    abi: registryAbi,
    functionName: "getTokenId",
    args: [BigInt(labelhash(labels[0]))],
  });
  const owner = await client.readContract({
    address: registry,
    abi: registryAbi,
    functionName: "ownerOf",
    args: [tokenId],
  });
  return owner.toLowerCase();
};

/**
 * Reads the supported text and address records through the universal resolver,
 * which handles both node-keyed and name-aware ENSv2 resolvers and falls back to
 * ENSv1 for names that live there. Resolvio only indexes mainnet, so testnet
 * names are read on-chain. Non-EVM addresses (BTC, SOL)
 * are skipped because they need chain-specific decoding.
 */
export const fetchEnsV2Records = async (client: PublicClient, name: string) => {
  const dnsName = toHex(packetToBytes(name));
  const node = namehash(name);
  const evmCoins = supportedAddresses.filter((a) => isEvmCoinType(a.coinType));
  const calls: Hex[] = [
    ...supportedTexts.map((t) =>
      encodeFunctionData({ abi: resolverAbi, functionName: "text", args: [node, t.key] }),
    ),
    ...evmCoins.map((a) =>
      encodeFunctionData({ abi: resolverAbi, functionName: "addr", args: [node, BigInt(a.coinType)] }),
    ),
  ];
  const results = await client.multicall({
    contracts: calls.map((data) => ({
      address: ENSV2_UNIVERSAL_RESOLVER,
      abi: universalResolverAbi,
      functionName: "resolve" as const,
      args: [dnsName, data] as const,
    })),
  });
  // A failed lookup (no resolver, unsupported record) just means the record is unset.
  const output = (i: number): Hex | undefined =>
    results[i].status === "success" ? (results[i].result as readonly [Hex, Address])[0] : undefined;

  const texts = supportedTexts
    .map((t, i) => {
      const data = output(i);
      const value = data ? decodeFunctionResult({ abi: resolverAbi, functionName: "text", data }) : "";
      return { key: t.key, value };
    })
    .filter((t) => t.value);
  const addresses = evmCoins
    .map((a, i) => {
      const data = output(supportedTexts.length + i);
      const value = data ? decodeFunctionResult({ abi: resolverAbi, functionName: "addr", data }) : "0x";
      return { coinType: a.coinType, value };
    })
    .filter((a) => a.value.length === 42)
    .map((a) => ({ coinType: a.coinType, value: getAddress(a.value) }));

  return { addresses, texts };
};
