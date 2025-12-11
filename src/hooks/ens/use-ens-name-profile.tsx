import {
  EnsAddressRecord,
  EnsContenthashRecord,
  EnsContenthashRecordDecoded,
  EnsName,
  EnsTextRecord,
  GenericMintedName,
  IEnsNameFullProfile,
  IL2Node,
  Layer2Network,
  Web3Network,
} from "@/types";
import { useENS } from "./use-ens";
import { supportedAddresses, SupportedTexts } from "@/constants/records/addressConstants";
import { Address, Hex, hexToBytes, namehash, zeroAddress } from "viem";
import { getChain, getChainName, getL1NamespaceContracts, getL2NamespaceContracts } from "@/web3";
import { equalsIgnoreCase } from "@/utils";
import { useHybridResolver } from "../namespace/use-hybrid-resolver";
import { getCoderByCoinType } from "@ensdomains/address-encoder";
import { isL2EnsName } from "@/utils/ens";
import { useNamespaceIndexer } from "../namespace/use-namespace-indexer";
import { L2SubnameResponse } from "@namespacesdk/indexer";
import { useMainChain } from "../web3/use-main-chain";
import { decode, getCodec } from "@ensdomains/content-hash";

interface ProfileFeatures {
  subnames?: boolean;
  listing?: boolean;
}

const emptyProfile: IEnsNameFullProfile = {
  ensName: "",
  expiry: 0,
  ownership: { address: zeroAddress, isWrapped: false },
  records: { addresses: [], texts: [] },
  resolver: zeroAddress,
  subnames: [],
};

interface ICachedItem {
  cacheExpiry: number;
  item: IEnsNameFullProfile;
}

const CACHE_EXPIRY_MILLISECONDS = 15 * 60 * 1000;

const convertContenthashToDecoded = (
  contenthash: EnsContenthashRecord | string | undefined
): EnsContenthashRecordDecoded | undefined => {
  if (!contenthash) {
    return undefined;
  }

  // If it's already a string (hex encoded), decode it
  if (typeof contenthash === "string") {
    try {
      const decoded = decode(contenthash);
      const codec = getCodec(contenthash);
      return {
        decoded: decoded,
        protocolType: codec as string,
      };
    } catch (err) {
      console.error("Failed to decode contenthash: " + contenthash, err);
      return undefined;
    }
  }

  // If it's an EnsContenthashRecord object (with protocol and value)
  if (contenthash && typeof contenthash === "object" && "protocol" in contenthash) {
    return {
      decoded: contenthash.value,
      protocolType: contenthash.protocol,
    };
  }

  return undefined;
};

export const useEnsFullNameProfile = () => {
  const ens = useENS();
  const {
    getNameOwner,
    getNameRecords,
    getNameResolver,
    getNameSubnames,
    getExpiry,
    getNameAndAvatarForAddr,
  } = ens;
  const { getResolutionChainId } = useHybridResolver();
  const indexer = useNamespaceIndexer();
  const { isTestnet } = useMainChain()

  const getFullEnsNameProfileCached = async (
    ensName: string,
    networkName: Web3Network,
    features: ProfileFeatures = {}
  ) => {
    const cachedItem = getCachedProfile(ensName, networkName);
    if (cachedItem && cachedItem.ensName) {
      clearExpiredCache();
      return cachedItem;
    }

    const profile = isL2EnsName(ensName)
      ? await getFullEnsNameProfile(ensName, networkName, features)
      : await getFullEnsSubnameProfile(ensName, networkName);
    setProfileToCache(ensName, networkName, profile);

    return profile;
  };

  const getAllSubnames = async (ensName: string, networkName: Web3Network) => {
    const l1SubnamesPromise = getNameSubnames(ensName);
    const l2SubnamesPromise = indexer.getL2Subnames({
      parent: namehash(ensName),
      size: 9999,
      isTestnet: isTestnet
    });

    const [l1Subs, l2Subs] = await Promise.all([
      l1SubnamesPromise,
      l2SubnamesPromise,
    ]);

    // Generic minted name is used for both l1 and l2 subnames
    const genericSubnames: GenericMintedName[] = [];
    addL1SubnameToGenericName(l1Subs, genericSubnames);
    addL2SubnameToGenericNames(l2Subs.items, genericSubnames);
    return genericSubnames;
  };

  const getFullEnsNameProfile = async (
    ensName: string,
    networkName: Web3Network,
    features: ProfileFeatures
  ): Promise<IEnsNameFullProfile> => {
    const textKeys = SupportedTexts.map((txt) => txt.key);
    const coinTypes = supportedAddresses.map((addr) => addr.coinType);
    const node = namehash(ensName);

    const recordsPromise = getNameRecords(ensName, coinTypes, textKeys);
    const ownershipPromise = getNameOwner(ensName);
    const expiryPromise = getExpiry(ensName);
    const resolverPromise = getNameResolver(ensName);

    const result = await Promise.all([
      recordsPromise,
      ownershipPromise,
      expiryPromise,
      resolverPromise,
    ]);

    const [records, ownership, expiry, resolver] = result;

    const expiryBigInt = expiry?.expiry?.value || 0n;
    const expiryInt = parseInt(expiryBigInt.toString());
    const ccipData = await isNamespaceCCIPResolver(
      ensName,
      resolver!,
      networkName
    );

    // Convert records to decoded format
    const decodedRecords: IEnsNameFullProfile["records"] = {
      texts: records.texts,
      addresses: records.addresses,
      contenthash: records.contenthash
        ? convertContenthashToDecoded(records.contenthash)
        : undefined,
    };

    const profile: IEnsNameFullProfile = {
      ensName,
      expiry: expiryInt,
      subnames: [],
      ownership: ownership || { address: zeroAddress, isWrapped: false },
      records: decodedRecords,
      resolver: resolver!,
    };
    // if ens store the records on l2, it will have
    // namespace offchain resolver attached
    // in that case we can allow user to update records on selected l2
    // we can determine the l2 network based on the resolver address
    if (ccipData.ccip) {
      const l2Network = ccipData.network as Layer2Network;
      profile.l2Metadata = {
        network: l2Network,
        owner: "0x0",
        resolver: getL2NamespaceContracts(l2Network).resolver
      };
    }
    return profile;
  };

  const getFullEnsSubnameProfile = async (
    ensName: string,
    networkName: Web3Network
  ): Promise<IEnsNameFullProfile> => {
    // We can deferentiate between different subname types
    // 1. Regular L1 subnames that live on mainnet/seplia ( Original ENS subnames )
    // 2. CCIP Read subnames managed by Namespace, for these names, we can fetch data via indexer and
    // we can also update their records, since we know the resolver address
    // 3. CCIP Read subnames which are of unknown origin, we can only read records, but
    // we do not know the ownership nor we are able to update records
    const resolver = (await getNameResolver(ensName)) as Address;

    if (resolver === zeroAddress) {
      return {
        ...emptyProfile,
        ensName: ensName,
      };
    }

    // if the resolver attached is one of our offchain resolvers/hybrid resolver.
    // we will resolve the name from indexer
    const ccipData = await isNamespaceCCIPResolver(
      ensName,
      resolver,
      networkName
    );

    if (ccipData.ccip) {
      const l2Network = ccipData.network as Layer2Network;
      let l2Resolver = getL2NamespaceContracts(l2Network).resolver;
      const subnameChain = getChain(l2Network);
      let node = await indexer.getL2Subname({
        chainId: subnameChain.id as any,
        nameOrNamehash:ensName
      })

      let ownerName = await getNameAndAvatarForAddr(node.owner as Address);
      let texts: EnsTextRecord[] = [];
      let addresses: EnsAddressRecord[] = [];
      let contenthash: EnsContenthashRecordDecoded | undefined = undefined;

      Object.keys(node?.records.texts || {}).forEach((txt) => {

        if (node.records.texts[txt].length > 0) {
          texts.push({ key: txt, value: node.records.texts[txt] });
        }
      });

      Object.keys(node?.records.addresses || {}).forEach((addrKey) => {

        if (node.records.addresses[addrKey].length > 0) {
          const coin = parseInt(addrKey);
          addresses.push({
            coinType: coin,
            value: encodeAddress(node.records.addresses[addrKey], coin),
          });
        }
      });

      if (node?.records?.contenthash) {
        try {
          const decoded = decode(node.records.contenthash);
          const codec = getCodec(node.records.contenthash)
          contenthash = {
            decoded: decoded,
            protocolType: codec as any
          }
        } catch(err) {
          console.error("Failed to decode contenthash: " + node.records.contenthash, err)
        }
      }

      return {
        ensName,
        expiry: node.expiry || 0,
        ownership: {
          address: node.owner as Address,
          isWrapped: false,
          avatar: ownerName?.avatar || undefined,
          ensName: ownerName?.resolvedName,
        },
        records: {
          texts: texts,
          addresses: addresses,
          contenthash
        },
        resolver: resolver,
        subnames: [],
        // TODO: Edit profils attempts to edit ens name records for network
        // when name has hybrid resolver set but records are not ccip
        l2Metadata: {
          network: l2Network,
          owner: "0x0",
          resolver: l2Resolver,
        },
      };
    } else {
      // if the subname is not the ccip name from Namespace
      // We will resolve its data in a regular way
      const textKeys = SupportedTexts.map((txt) => txt.key);
      const coinTypes = supportedAddresses.map((addr) => addr.coinType);
      const recordsPromise = getNameRecords(ensName, coinTypes, textKeys);
      const ownershipPromise = getNameOwner(ensName);
      const expiryPromise = getExpiry(ensName);
      const result = await Promise.all([
        recordsPromise,
        ownershipPromise,
        expiryPromise,
      ]);

      const [records, ownership, expiry] = result;
      const expiryInt = expiry?.expiry?.value;

      // Convert records to decoded format
      const decodedRecords: IEnsNameFullProfile["records"] = {
        texts: records.texts,
        addresses: records.addresses,
        contenthash: records.contenthash
          ? convertContenthashToDecoded(records.contenthash)
          : undefined,
      };

      return {
        ensName,
        records: decodedRecords,
        ownership: ownership || { address: zeroAddress, isWrapped: false },
        expiry: expiryInt ? parseInt(expiryInt.toString()) : 0,
        resolver: resolver,
        subnames: [],
      };
    }
  };

  const isNamespaceCCIPResolver = async (
    ensName: string,
    resolver: Address,
    networkName: Web3Network
  ) => {
    const { hybridResolver, oldHybridResolver } = getL1NamespaceContracts();
    const hybridResolvers = [hybridResolver.toLocaleLowerCase(), oldHybridResolver.toLocaleLowerCase()]
    let isOldHybridResolver = false;

    if (hybridResolvers.indexOf(resolver.toLocaleLowerCase()) !== -1) {

      isOldHybridResolver = equalsIgnoreCase(oldHybridResolver, resolver)
      const split = ensName.split(".");
      const splitLen = split.length;
      const parentName =
        split.length === 2
          ? ensName
          : `${split[splitLen - 2]}.${split[splitLen - 1]}`;

      const { resolutionType, resolveOffchain } = await getResolutionChainId(
        parentName,
        isOldHybridResolver
      );

      if (resolutionType > 0n) {
        if (parentName === ensName && !resolveOffchain) {
          return { ccip: false, network: "base" };
        }

        const resolutionTypeInt = parseInt(resolutionType.toString());
        const resolutionChain = getChainName(resolutionTypeInt);
        const ccipData = {
          ccip: resolutionChain !== undefined,
          network: resolutionChain || "base",
        };
        return ccipData;
      }
    }
    return { ccip: false, network: "base" };
  };

  return {
    getFullEnsNameProfileCached,
    setProfileToCache,
    getAllSubnames,
    deleteProfileCache
  };
};

export const addL2SubnameToGenericNames = (
  items: L2SubnameResponse[],
  arr: GenericMintedName[]
) => {
  items.forEach((sub) => {
    arr.push({
      addresses: sub.records?.addresses || {},
      chainId: sub.chainId,
      isL2: true,
      label: sub.name.split(".")[0],
      name: sub.name,
      namehash: sub.namehash,
      owner: sub.owner,
      parentName: sub.name,
      texts: sub.records?.texts || {},
      expiry: sub.expiry,
      mintTransaction: sub.metadata,
    });
  });
};

export const addL1SubnameToGenericName = (
  items: EnsName[],
  arr: GenericMintedName[]
) => {
  items.forEach((sub) => {
    arr.push({
      addresses: {},
      chainId: 1,
      isL2: false,
      label: sub.label,
      name: sub.name,
      namehash: sub.namehash,
      owner: sub.owner,
      parentName: sub.parentName,
      texts: {},
      expiry: sub.expiry,
    });
  });
};


const encodeAddress = (value: string, coinType: number) => {
  const encoder = getCoderByCoinType(coinType);
  if (!encoder || !value.startsWith("0x")) {
    return value;
  }
  return encoder.encode(hexToBytes(value as Hex));
};

const createCacheKey = (ensName: string, network: Web3Network) => {
  return `profile-${ensName}-${network}`;
};

const setProfileToCache = (
  ensName: string,
  network: Web3Network,
  profile: IEnsNameFullProfile
) => {
  const cacheKey = createCacheKey(ensName, network);
  const caches = getProfileCaches();
  caches[cacheKey] = {
    item: profile,
    cacheExpiry: new Date().getTime() + CACHE_EXPIRY_MILLISECONDS,
  };
  localStorage.setItem("ens-profile-cache", JSON.stringify(caches));
};

const deleteProfileCache = (ensName: string, network: Web3Network) => {
  const cacheKey = createCacheKey(ensName, network);
  const caches = getProfileCaches();
  delete caches[cacheKey];
  localStorage.setItem("ens-profile-cache", JSON.stringify(caches));
}

const getProfileCaches = () => {
  const profileCacheStr = localStorage.getItem("ens-profile-cache") || "{}";
  const cache = JSON.parse(profileCacheStr) as Record<string, ICachedItem>;
  return cache;
};

const getCachedProfile = (ensName: string, network: Web3Network) => {
  const caches = getProfileCaches();
  const item = caches[createCacheKey(ensName, network)];

  if (item && item.cacheExpiry && !isExpired(item.cacheExpiry)) {
    return item.item;
  }
  return null;
};

const clearExpiredCache = async () => {
  const caches = getProfileCaches();
  Object.keys(caches).forEach((cacheKey) => {
    if (isExpired(caches[cacheKey].cacheExpiry)) {
      delete caches[cacheKey];
    }
  });
  localStorage.setItem("ens-profile-cache", JSON.stringify(caches));
};

const isExpired = (cacheExpiry: number): boolean => {
  const now = new Date().getTime();
  return cacheExpiry < now;
};