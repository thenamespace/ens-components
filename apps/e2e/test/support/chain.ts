import {
  type Address,
  type Hex,
  createPublicClient,
  decodeFunctionResult,
  encodeFunctionData,
  formatUnits,
  getAddress,
  http,
  labelhash,
  parseAbi,
  toHex,
  zeroAddress,
} from "viem";
import { namehash, packetToBytes } from "viem/ens";
import { sepolia } from "viem/chains";

// ENSv2 Sepolia deployment, kept independent of the component library so the
// tests verify on-chain state rather than re-running the code under test.
export const ETH_REGISTRY: Address = "0xD4eBcbBdF463C9c45784603Db0dDD499BC44A8B4";
export const UNIVERSAL_RESOLVER: Address = "0xeEeEEEeE14D718C2B47D9923Deab1335E144EeEe";
export const ETH_REGISTRAR: Address = "0xf633e7fc17e2bbe0d0965d18ec1821dcb754a3d3";
export const USDC: Address = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
export const USDC_DECIMALS = 6;

const registryAbi = parseAbi([
  "function getSubregistry(string label) view returns (address)",
  "function getTokenId(uint256 anyId) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
]);
const registrarAbi = parseAbi([
  "function getRegisterPrice(string label, uint64 duration, address paymentToken) view returns (uint256 base, uint256 premium)",
]);
const universalResolverAbi = parseAbi([
  "function resolve(bytes name, bytes data) view returns (bytes result, address resolver)",
]);
const resolverAbi = parseAbi([
  "function text(bytes32 node, string key) view returns (string)",
  "function addr(bytes32 node, uint256 coinType) view returns (bytes)",
]);
const erc20Abi = parseAbi(["function balanceOf(address owner) view returns (uint256)"]);

export const client = createPublicClient({
  chain: sepolia,
  transport: http(process.env.E2E_SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com"),
});

/** Same calendar-aware duration the registration form starts with. */
export const secondsFromYears = (start: Date, years: number) => {
  const end = new Date(start.getTime());
  end.setFullYear(end.getFullYear() + years);
  return Math.floor((end.getTime() - start.getTime()) / 1000);
};

/** Matches the form's two-decimal stablecoin display. */
export const formatUsdc = (amount: bigint) =>
  Number(formatUnits(amount, USDC_DECIMALS)).toFixed(2);

export const getRegisterPrice = async (label: string, durationSeconds: number) => {
  const [base, premium] = await client.readContract({
    address: ETH_REGISTRAR,
    abi: registrarAbi,
    functionName: "getRegisterPrice",
    args: [label, BigInt(durationSeconds), USDC],
  });
  return base + premium;
};

export const getUsdcBalance = (owner: Address) =>
  client.readContract({ address: USDC, abi: erc20Abi, functionName: "balanceOf", args: [owner] });

/** Owner of a .eth name or subname, walking the registry tree down from the .eth registry. */
export const getOwner = async (name: string): Promise<Address> => {
  const labels = name.split(".");
  let registry = ETH_REGISTRY;
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
  return client.readContract({ address: registry, abi: registryAbi, functionName: "ownerOf", args: [tokenId] });
};

const resolve = async (name: string, data: Hex) => {
  const [result] = await client.readContract({
    address: UNIVERSAL_RESOLVER,
    abi: universalResolverAbi,
    functionName: "resolve",
    args: [toHex(packetToBytes(name)), data],
  });
  return result;
};

export const getText = async (name: string, key: string) => {
  const data = await resolve(
    name,
    encodeFunctionData({ abi: resolverAbi, functionName: "text", args: [namehash(name), key] }),
  );
  return decodeFunctionResult({ abi: resolverAbi, functionName: "text", data });
};

export const getEthAddress = async (name: string) => {
  const data = await resolve(
    name,
    encodeFunctionData({ abi: resolverAbi, functionName: "addr", args: [namehash(name), 60n] }),
  );
  const value = decodeFunctionResult({ abi: resolverAbi, functionName: "addr", data });
  return value.length === 42 ? getAddress(value) : null;
};

/** Short, lowercase, unique per run, and at least 5 characters so it stays in the base price tier. */
export const uniqueLabel = (prefix: string) => `${prefix}${Date.now().toString(36)}`;
