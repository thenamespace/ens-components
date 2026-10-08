import {
  type Address,
  encodeFunctionData,
  type Hex,
  namehash,
  parseAbi,
  type PublicClient,
  toHex,
} from "viem";
import { packetToBytes } from "viem/ens";
import { getCoderByCoinType } from "@ensdomains/address-encoder";
import { encode } from "@ensdomains/content-hash";
import type { EnsAddressRecord, EnsContenthashRecord, EnsTextRecord } from "@/types";
import type { EnsRecordsDiff } from "./records";

export type ResolverStyle = "node" | "permissioned" | "simplified";

const PERMISSIONED_RESOLVER_INTERFACE = "0x8c2427cc";

/** Namespace SimplifiedResolver deployments; it has no ERC-165 id of its own. */
export const SIMPLIFIED_RESOLVERS: Address[] = [
  "0x99908150E5d1023B8a69A0870B6983acF6f8Cf7C",
];

const erc165Abi = parseAbi([
  "function supportsInterface(bytes4 interfaceId) view returns (bool)",
]);

const nodeAbi = parseAbi([
  "function setText(bytes32 node, string key, string value)",
  "function setAddr(bytes32 node, uint256 coinType, bytes value)",
  "function setContenthash(bytes32 node, bytes hash)",
  "function multicall(bytes[] data) returns (bytes[])",
]);

const permissionedAbi = parseAbi([
  "function setText(bytes name, string key, string value)",
  "function setAddress(bytes name, uint256 coinType, bytes addressBytes)",
  "function setContenthash(bytes name, bytes hash)",
  "function multicall(bytes[] calls) returns (bytes[])",
]);

const simplifiedAbi = parseAbi([
  "function setText(string parentLabel, string label, string key, string value)",
  "function setAddr(string parentLabel, string label, uint256 coinType, bytes value)",
  "function setContenthash(string parentLabel, string label, bytes hash)",
  "function multicallForSubname(string parentLabel, string label, bytes[] calls) returns (bytes[] results)",
]);

export const detectResolverStyle = async (
  client: PublicClient,
  resolver: Address,
): Promise<ResolverStyle> => {
  if (SIMPLIFIED_RESOLVERS.some((r) => r.toLowerCase() === resolver.toLowerCase()))
    return "simplified";
  try {
    const permissioned = await client.readContract({
      address: resolver,
      abi: erc165Abi,
      functionName: "supportsInterface",
      args: [PERMISSIONED_RESOLVER_INTERFACE],
    });
    if (permissioned) return "permissioned";
  } catch {
  }
  return "node";
};

export const dnsEncodeName = (name: string): Hex => toHex(packetToBytes(name));

const splitSubname = (name: string) => {
  const parts = name.split(".");
  if (parts.length !== 3 || parts[2] !== "eth")
    throw new Error(`${name} isn't a label.parent.eth subname`);
  return { label: parts[0], parentLabel: parts[1] };
};

const addressBytes = (record: EnsAddressRecord): Hex => {
  const coder = getCoderByCoinType(record.coinType);
  if (!coder) throw new Error(`Coin type ${record.coinType} isn't supported`);
  return toHex(coder.decode(record.value));
};

const contenthashBytes = (record: EnsContenthashRecord): Hex =>
  `0x${encode(record.protocol, record.value)}`;

type Setters = {
  text: (record: EnsTextRecord) => Hex;
  address: (coinType: number, value: Hex) => Hex;
  contenthash: (value: Hex) => Hex;
};

const settersFor = (style: ResolverStyle, name: string): Setters => {
  if (style === "permissioned") {
    const dnsName = dnsEncodeName(name);
    return {
      text: (t) =>
        encodeFunctionData({
          abi: permissionedAbi,
          functionName: "setText",
          args: [dnsName, t.key, t.value],
        }),
      address: (coinType, value) =>
        encodeFunctionData({
          abi: permissionedAbi,
          functionName: "setAddress",
          args: [dnsName, BigInt(coinType), value],
        }),
      contenthash: (value) =>
        encodeFunctionData({
          abi: permissionedAbi,
          functionName: "setContenthash",
          args: [dnsName, value],
        }),
    };
  }
  if (style === "simplified") {
    const { parentLabel, label } = splitSubname(name);
    return {
      text: (t) =>
        encodeFunctionData({
          abi: simplifiedAbi,
          functionName: "setText",
          args: [parentLabel, label, t.key, t.value],
        }),
      address: (coinType, value) =>
        encodeFunctionData({
          abi: simplifiedAbi,
          functionName: "setAddr",
          args: [parentLabel, label, BigInt(coinType), value],
        }),
      contenthash: (value) =>
        encodeFunctionData({
          abi: simplifiedAbi,
          functionName: "setContenthash",
          args: [parentLabel, label, value],
        }),
    };
  }
  const node = namehash(name);
  return {
    text: (t) =>
      encodeFunctionData({
        abi: nodeAbi,
        functionName: "setText",
        args: [node, t.key, t.value],
      }),
    address: (coinType, value) =>
      encodeFunctionData({
        abi: nodeAbi,
        functionName: "setAddr",
        args: [node, BigInt(coinType), value],
      }),
    contenthash: (value) =>
      encodeFunctionData({
        abi: nodeAbi,
        functionName: "setContenthash",
        args: [node, value],
      }),
  };
};

export const encodeRecordSetters = (
  style: ResolverStyle,
  name: string,
  diff: EnsRecordsDiff,
): Hex[] => {
  const set = settersFor(style, name);
  const calls: Hex[] = [];

  for (const text of [...diff.textsAdded, ...diff.textsModified])
    calls.push(set.text(text));
  for (const text of diff.textsRemoved) calls.push(set.text({ key: text.key, value: "" }));

  const addresses = new Map<number, EnsAddressRecord>();
  for (const a of [...diff.addressesAdded, ...diff.addressesModified])
    addresses.set(a.coinType, a);
  for (const a of addresses.values()) calls.push(set.address(a.coinType, addressBytes(a)));
  for (const a of diff.addressesRemoved) calls.push(set.address(a.coinType, "0x"));

  if (diff.contenthashRemoved) calls.push(set.contenthash("0x"));
  else {
    const contenthash = diff.contenthashModified ?? diff.contenthashAdded;
    if (contenthash) calls.push(set.contenthash(contenthashBytes(contenthash)));
  }
  return calls;
};

export const encodeRecordsUpdate = (
  style: ResolverStyle,
  resolver: Address,
  name: string,
  diff: EnsRecordsDiff,
): { to: Address; data: Hex } => {
  const calls = encodeRecordSetters(style, name, diff);
  if (style === "simplified") {
    const { parentLabel, label } = splitSubname(name);
    return {
      to: resolver,
      data: encodeFunctionData({
        abi: simplifiedAbi,
        functionName: "multicallForSubname",
        args: [parentLabel, label, calls],
      }),
    };
  }
  return {
    to: resolver,
    data: encodeFunctionData({
      abi: style === "permissioned" ? permissionedAbi : nodeAbi,
      functionName: "multicall",
      args: [calls],
    }),
  };
};
