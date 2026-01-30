import { encodeFunctionData, Hash, namehash, parseAbi, toHex } from "viem";
import { EnsRecordsDiff } from "./records";
import {
  EnsAddressRecord,
  EnsContenthashRecord,
  EnsRecords,
  EnsTextRecord,
} from "@/types";
import { SET_ADDRESS_FUNC, SET_CONTENTHASH_FUNC, SET_TEXT_FUNC } from "@/web3";
import { getCoderByCoinType } from "@ensdomains/address-encoder";
import { encode } from "@ensdomains/content-hash";

export const convertToResolverData = (name: string, records: EnsRecords) => {
  return convertToMulticallResolverData(name, {
    textsRemoved: [],
    textsAdded: records.texts,
    textsModified: [],
    addressesAdded: records.addresses,
    addressesModified: [],
    addressesRemoved: [],
    contenthashRemoved: false,
    contenthashAdded: records.contenthash,
    isDifferent: true
  });
};

export const convertToMulticallResolverData = (
  name: string,
  recordsDiff: EnsRecordsDiff
) => {
  const node = namehash(name);
  const resolverMulticallData: Hash[] = [];

  convertTextData(node, resolverMulticallData, recordsDiff);
  convertAddressData(node, resolverMulticallData, recordsDiff);
  convertContenthashData(node, resolverMulticallData, recordsDiff);
  return resolverMulticallData;
};

const convertTextData = (
  node: Hash,
  resolverData: Hash[],
  diff: EnsRecordsDiff
) => {
  const modifiedTexts: EnsTextRecord[] = [
    ...diff.textsAdded,
    ...diff.textsModified,
  ];
  modifiedTexts.forEach(text => {
    const data = encodeFunctionData({
      functionName: "setText",
      abi: parseAbi([SET_TEXT_FUNC]),
      args: [node, text.key, text.value],
    });
    resolverData.push(data);
  });

  if (diff.textsRemoved?.length > 0) {
    diff.textsRemoved.forEach(key => {
       resolverData.push(encodeFunctionData({
      functionName: "setText",
      abi: parseAbi([SET_TEXT_FUNC]),
      args: [node, key.key, ""]
    }))
    })
  }
};

const convertAddressData = (
  node: Hash,
  resolverData: Hash[],
  diff: EnsRecordsDiff
) => {
  const modifiedAddressMap: Record<string, EnsAddressRecord> = {};
  diff.addressesAdded.forEach(addr => {
    modifiedAddressMap[addr.coinType] = addr;
  });
  diff.addressesModified.forEach(addr => {
    modifiedAddressMap[addr.coinType] = addr;
  });
  const modifiedAddresses: EnsAddressRecord[] =
    Object.values(modifiedAddressMap);

  modifiedAddresses.forEach(addr => {
    const coinEncoder = getCoderByCoinType(addr.coinType);
    if (!coinEncoder) {
      throw Error(
        `Coin type is not supported: ${addr.coinType}. Cannot get an encoder`
      );
    }
    const decode = coinEncoder.decode(addr.value);
    const hexValue = toHex(decode);
    const data = encodeFunctionData({
      functionName: "setAddr",
      abi: parseAbi([SET_ADDRESS_FUNC]),
      args: [node, BigInt(addr.coinType), hexValue],
    });
    resolverData.push(data);
  });

  diff.addressesRemoved.forEach(addr => {
    const data = encodeFunctionData({
      functionName: "setAddr",
      abi: parseAbi([SET_ADDRESS_FUNC]),
      args: [node, BigInt(addr.coinType), "0x"],
    });
    resolverData.push(data);
  });
};

const convertContenthashData = (
  node: Hash,
  resolverData: Hash[],
  diff: EnsRecordsDiff
) => {
  if (diff.contenthashRemoved) {
    const data = encodeFunctionData({
      functionName: "setContenthash",
      abi: parseAbi([SET_CONTENTHASH_FUNC]),
      args: [node, "0x"],
    });
    resolverData.push(data);
    return;
  }

  let contenthash: EnsContenthashRecord | undefined = undefined;
  if (diff.contenthashModified !== undefined) {
    contenthash = diff.contenthashModified;
  } else if (diff.contenthashAdded !== undefined) {
    contenthash = diff.contenthashAdded;
  }

  if (contenthash !== undefined) {
    const { protocol, value } = contenthash;
    const encodedValue = `0x${encode(protocol, value)}`;

    const data = encodeFunctionData({
      functionName: "setContenthash",
      abi: parseAbi([SET_CONTENTHASH_FUNC]),
      args: [node, encodedValue as `0x${string}`],
    });
    resolverData.push(data);
  }
};
