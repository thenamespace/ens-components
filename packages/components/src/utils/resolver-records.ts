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

export type ResolverStyle = "node" | "permissioned";

const NAME_SETTER_INTERFACES = ["0x8c2427cc", "0xc7279f88"] as const;

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

export const detectResolverStyle = async (
  client: PublicClient,
  resolver: Address,
): Promise<ResolverStyle> => {
  const supported = await Promise.all(
    NAME_SETTER_INTERFACES.map((id) =>
      client
        .readContract({
          address: resolver,
          abi: erc165Abi,
          functionName: "supportsInterface",
          args: [id],
        })
        .catch(() => false),
    ),
  );
  return supported.some(Boolean) ? "permissioned" : "node";
};

export const dnsEncodeName = (name: string): Hex => toHex(packetToBytes(name));

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
  return {
    to: resolver,
    data: encodeFunctionData({
      abi: style === "permissioned" ? permissionedAbi : nodeAbi,
      functionName: "multicall",
      args: [calls],
    }),
  };
};
