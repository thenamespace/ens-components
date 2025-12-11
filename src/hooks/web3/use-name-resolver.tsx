"use client";

import {
  Address,
  Hash,
  encodeFunctionData,
  keccak256,
  namehash,
  toHex,
} from "viem";
import { useWeb3Clients } from "./use-web3-clients";
import {EnsContenthashRecordDecoded} from "@/types/ens"
import { EnsAddressRecord, EnsTextRecord } from "@/types";
import RESOLVER_ABI from "./temp-abi.json";
import { useAccount } from "wagmi";
import { getCoderByCoinType } from "@ensdomains/address-encoder";
import { decode, encode } from "@ensdomains/content-hash";

interface ResolverInterface {
  name: string;
  interfaceId: Hash;
}

interface UpdateRecordsArgs {
  ensName: string;
  resolverAddr: Address;
  texts: EnsTextRecord[];
  addresses: EnsAddressRecord[];
  contenthash?: {
    remove?: boolean;
    data?: {
      protocolType: string;
      decoded: string;
    };
  };
}

const resolverInterfaces: ResolverInterface[] = [
  {
    interfaceId: keccak256(toHex("text(bytes32,string)")).slice(0, 10) as Hash,
    name: "setText",
  },
  {
    interfaceId: keccak256(toHex("addr(bytes32,uint256)")).slice(0, 10) as Hash,
    name: "setAddress",
  },
  {
    interfaceId: keccak256(toHex("contenthash(bytes32)")).slice(0, 10) as Hash,
    name: "setContenthash",
  },
];

// when we first check for resolver compatibility
// we can cache the result so we don't check each time

const cache_key = "resolver-compatibility";

const getResolverCaches = (): Record<Address, boolean> => {
  const cacheString = localStorage.getItem(cache_key) || "{}";
  try {
    const cache = JSON.parse(cacheString) as Record<Address, boolean>;
    return cache;
  } catch (err) {
    return {};
  }
};

const cacheResolverCompatible = (resolverAddr: Address) => {
  const cache = getResolverCaches();
  cache[resolverAddr] = true;
  localStorage.setItem(cache_key, JSON.stringify(cache));
};

export const useNameResolver = ({ chainId }: { chainId: number }) => {
  const { publicClient, walletClient } = useWeb3Clients({ chainId });
  const { address } = useAccount();

  const supportsRequiredInterfaces = async (resolverAddr: Address) => {
    if (getResolverCaches()[resolverAddr]) {
      return [];
    }

    let unsupported: string[] = [];

    for (const iface of resolverInterfaces) {
      try {
        const supports = await publicClient?.readContract({
          abi: RESOLVER_ABI,
          address: resolverAddr,
          functionName: "supportsInterface",
          args: [iface.interfaceId],
        });
        if (!supports) {
          unsupported.push(iface.name);
        } else {
          cacheResolverCompatible(resolverAddr);
        }
      } catch (err) {
        console.error(
          "Error while checking iface id for resolver " +
            resolverAddr +
            " chain: " +
            chainId
        );
        unsupported.push(iface.name);
      }
    }
    return unsupported;
  };

  const updateRecords = async (args: UpdateRecordsArgs): Promise<Hash> => {
    if (!publicClient || !walletClient) {
      return "0x0";
    }

    const { addresses, ensName, resolverAddr, texts, contenthash } = args;

    const resolverData = convertRecordsToResolverData(
      ensName,
      texts,
      addresses,
      contenthash?.data ? contenthash.data : undefined
    );
    const { request } = await publicClient?.simulateContract({
      abi: RESOLVER_ABI,
      functionName: "multicall",
      address: resolverAddr,
      args: [resolverData],
      account: address,
    });
    return await walletClient?.writeContract(request);
  };

  return {
    supportsRequiredInterfaces,
    updateRecords,
  };
};

export const convertRecordsToResolverData = (
  ensName: string,
  texts: EnsTextRecord[],
  addresses: EnsAddressRecord[],
  contenthash?: EnsContenthashRecordDecoded
): Hash[] => {
  const resolverData: Hash[] = [];
  const node = namehash(ensName);

  if (contenthash) {
    const hashValue = encode(
      contenthash.protocolType as any,
      contenthash.decoded
    );

    resolverData.push(
      encodeFunctionData({
        abi: RESOLVER_ABI,
        functionName: "setContenthash",
        args: [node, "0x" + hashValue],
      })
    );
  }

  texts.forEach((txt) => {
    resolverData.push(
      encodeFunctionData({
        abi: RESOLVER_ABI,
        functionName: "setText",
        args: [node, txt.key, txt.value],
      })
    );
  });

  addresses.forEach((addr) => {
    if (addr.value === "0x") {
      resolverData.push(
        encodeFunctionData({
          abi: RESOLVER_ABI,
          functionName: "setAddr",
          args: [node, BigInt(addr.coinType), "0x"],
        })
      );
    } else if (addr.coinType === 60) {
      resolverData.push(
        encodeFunctionData({
          abi: RESOLVER_ABI,
          functionName: "setAddr",
          args: [node, addr.value as Address],
        })
      );
    } else {
      const addrEncoder = getCoderByCoinType(addr.coinType);
      const decodedAddr = addrEncoder.decode(addr.value);
      const hexAddr = toHex(decodedAddr);
      resolverData.push(
        encodeFunctionData({
          abi: RESOLVER_ABI,
          functionName: "setAddr",
          args: [node, BigInt(addr.coinType), hexAddr],
        })
      );
    }
  });
  return resolverData;
};
