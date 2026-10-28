import { encode as encodeContenthash } from "@ensdomains/content-hash";
import {
  type Address,
  type Hex,
  createPublicClient,
  decodeFunctionResult,
  encodeFunctionData,
  formatUnits,
  getAddress,
  http,
  keccak256,
  labelhash,
  parseAbi,
  toBytes,
  toHex,
  zeroAddress,
  zeroHash,
} from "viem";
import { namehash, packetToBytes } from "viem/ens";
import { sepolia } from "viem/chains";
import { env } from "./env";

// Sepolia deployments, kept independent of the component library so the tests
// verify on-chain state rather than re-running the code under test.
export const V2 = {
  ethRegistry: "0xD4eBcbBdF463C9c45784603Db0dDD499BC44A8B4",
  registrar: "0xf633e7fc17e2bbe0d0965d18ec1821dcb754a3d3",
  manager: "0x0bFCcbd5815332F7ea27ba71BD593B0799110bDE",
  issuer: "0x5200fd33Cf7952c518f1123797fBA2ce0D77bFC0",
  whitelistFeature: "0x48B7c6054836DC0B2291B3b3F2D313e84b4Cc678",
  reservationFeature: "0x5111d49E9B0E02C26F350A585073A36F38758EAf",
} as const satisfies Record<string, Address>;
/** ENSv2 universal resolver; it falls back to ENSv1 too, so it resolves names of both versions. */
export const UNIVERSAL_RESOLVER: Address = "0xeEeEEEeE14D718C2B47D9923Deab1335E144EeEe";
export const USDC: Address = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
export const USDC_DECIMALS = 6;

const v2RegistryAbi = parseAbi([
  "function getSubregistry(string label) view returns (address)",
  "function getTokenId(uint256 anyId) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function getExpiry(uint256 anyId) view returns (uint64)",
]);
const v2RegistrarAbi = parseAbi([
  "function getRegisterPrice(string label, uint64 duration, address paymentToken) view returns (uint256 base, uint256 premium)",
]);
const managerAbi = parseAbi([
  "struct MintQuote { bool canMint; uint256 price; uint8 denied; uint8 expiration; bytes32 activationId; address subregistry; }",
  "struct RenewalQuote { bool canRenew; uint256 price; uint8 denied; bytes32 activationId; address subregistry; }",
  "function quoteMint(string parentLabel, string label, address minter, uint64 duration, bytes extraData) view returns (MintQuote result)",
  "function quoteRenewal(string parentLabel, string label, address renewer, uint64 duration, bytes extraData) view returns (RenewalQuote result)",
  "function activationIdOf(bytes32 parent) view returns (bytes32)",
]);
const featureAbi = parseAbi([
  "function configs(bytes32 activationId) view returns (uint8 mode, bytes32 root)",
  "function roots(bytes32 activationId) view returns (bytes32)",
]);
const issuerAbi = parseAbi(["function quotePayment(uint256 usdAmount, address token) view returns (uint256)"]);
const universalResolverAbi = parseAbi([
  "function resolve(bytes name, bytes data) view returns (bytes result, address resolver)",
]);
const resolverAbi = parseAbi([
  "function text(bytes32 node, string key) view returns (string)",
  "function addr(bytes32 node, uint256 coinType) view returns (bytes)",
  "function contenthash(bytes32 node) view returns (bytes)",
]);
const erc20Abi = parseAbi(["function balanceOf(address owner) view returns (uint256)"]);

export const client = createPublicClient({ chain: sepolia, transport: http(env.rpcUrl) });

/** Same calendar-aware duration the forms start with. */
export const secondsFromYears = (start: Date, years: number) => {
  const end = new Date(start.getTime());
  end.setFullYear(end.getFullYear() + years);
  return Math.floor((end.getTime() - start.getTime()) / 1000);
};

/** The forms' amount display: 5 decimals for ETH, 2 for stablecoins. */
export const formatAmount = (amount: bigint, decimals: number, symbol: string) => {
  const value = Number(formatUnits(amount, decimals));
  if (value === 0) return "0";
  const digits = symbol === "ETH" ? 5 : 2;
  return value < 10 ** -digits ? `<${10 ** -digits}` : value.toFixed(digits);
};

/** Short, lowercase, unique per run, and at least 5 characters so it stays in the base price tier. */
export const uniqueLabel = (prefix: string) => `${prefix}${Date.now().toString(36)}`;

// ── Registration ────────────────────────────────────────────────────────────

export const getV2RegisterPrice = async (label: string, durationSeconds: number, token: Address = USDC) => {
  const [base, premium] = await client.readContract({
    address: V2.registrar,
    abi: v2RegistrarAbi,
    functionName: "getRegisterPrice",
    args: [label, BigInt(durationSeconds), token],
  });
  return base + premium;
};

export const getUsdcBalance = (owner: Address) =>
  client.readContract({ address: USDC, abi: erc20Abi, functionName: "balanceOf", args: [owner] });

// ── Ownership and expiry ────────────────────────────────────────────────────

/** The ENSv2 registry holding `name`'s leaf label, walking down from the .eth registry. */
const getV2Registry = async (name: string): Promise<Address> => {
  let registry: Address = V2.ethRegistry;
  for (const label of name.split(".").slice(1, -1).reverse()) {
    registry = await client.readContract({
      address: registry,
      abi: v2RegistryAbi,
      functionName: "getSubregistry",
      args: [label],
    });
    if (registry === zeroAddress) break;
  }
  return registry;
};

export const getV2Owner = async (name: string): Promise<Address> => {
  const registry = await getV2Registry(name);
  if (registry === zeroAddress) return zeroAddress;
  const tokenId = await client.readContract({
    address: registry,
    abi: v2RegistryAbi,
    functionName: "getTokenId",
    args: [BigInt(labelhash(name.split(".")[0]))],
  });
  return client.readContract({ address: registry, abi: v2RegistryAbi, functionName: "ownerOf", args: [tokenId] });
};

export const getV2Expiry = async (name: string): Promise<bigint> => {
  const registry = await getV2Registry(name);
  return client.readContract({
    address: registry,
    abi: v2RegistryAbi,
    functionName: "getExpiry",
    args: [BigInt(labelhash(name.split(".")[0]))],
  });
};

// ── Records ─────────────────────────────────────────────────────────────────

const resolve = async (name: string, data: Hex) => {
  const [result] = await client.readContract({
    address: UNIVERSAL_RESOLVER,
    abi: universalResolverAbi,
    functionName: "resolve",
    args: [toHex(packetToBytes(name)), data],
  });
  return result;
};

export const getText = async (name: string, key: string) =>
  decodeFunctionResult({
    abi: resolverAbi,
    functionName: "text",
    data: await resolve(name, encodeFunctionData({ abi: resolverAbi, functionName: "text", args: [namehash(name), key] })),
  });

/** EVM address for `coinType` (60 for ETH), checksummed, or null when unset. */
export const getAddr = async (name: string, coinType = 60) => {
  const value = decodeFunctionResult({
    abi: resolverAbi,
    functionName: "addr",
    data: await resolve(
      name,
      encodeFunctionData({ abi: resolverAbi, functionName: "addr", args: [namehash(name), BigInt(coinType)] }),
    ),
  });
  return value.length === 42 ? getAddress(value) : null;
};

/** Raw contenthash bytes, lowercased; "0x" when unset. */
export const getContenthash = async (name: string) =>
  (
    decodeFunctionResult({
      abi: resolverAbi,
      functionName: "contenthash",
      data: await resolve(name, encodeFunctionData({ abi: resolverAbi, functionName: "contenthash", args: [namehash(name)] })),
    }) as Hex
  ).toLowerCase();

/** Encodes an `ipfs://<cid>` value the way it is stored on chain, to compare with `getContenthash`. */
export const encodeIpfsContenthash = (cid: string) => `0x${encodeContenthash("ipfs", cid)}`.toLowerCase();

// ── Subname activations ─────────────────────────────────────────────────────

/** Whether the activation needs whitelist or reservation proofs, which only the manager API can provide. */
export const activationNeedsProofs = async (parentName: string) => {
  const activationId = await client.readContract({
    address: V2.manager,
    abi: managerAbi,
    functionName: "activationIdOf",
    args: [keccak256(toBytes(parentName.replace(/\.eth$/, "")))],
  });
  if (activationId === zeroHash) throw new Error(`${parentName} is not activated`);
  const [[, whitelistRoot], reservationRoot] = await Promise.all([
    client.readContract({ address: V2.whitelistFeature, abi: featureAbi, functionName: "configs", args: [activationId] }),
    client.readContract({ address: V2.reservationFeature, abi: featureAbi, functionName: "roots", args: [activationId] }),
  ]);
  return whitelistRoot !== zeroHash || reservationRoot !== zeroHash;
};

export const quoteMint = (parentName: string, label: string, minter: Address, durationSeconds: number) =>
  client.readContract({
    address: V2.manager,
    abi: managerAbi,
    functionName: "quoteMint",
    args: [parentName.replace(/\.eth$/, ""), label, minter, BigInt(durationSeconds), "0x"],
  });

export const quoteRenewal = (parentName: string, label: string, renewer: Address, durationSeconds: number) =>
  client.readContract({
    address: V2.manager,
    abi: managerAbi,
    functionName: "quoteRenewal",
    args: [parentName.replace(/\.eth$/, ""), label, renewer, BigInt(durationSeconds), "0x"],
  });

/** Converts a USD price from the manager into the amount of `token` the issuer charges. */
export const quotePayment = (priceUsdRaw: bigint, token: Address) =>
  priceUsdRaw === 0n
    ? Promise.resolve(0n)
    : client.readContract({ address: V2.issuer, abi: issuerAbi, functionName: "quotePayment", args: [priceUsdRaw, token] });
