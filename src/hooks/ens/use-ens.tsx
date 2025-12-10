import { useEnsClient } from "./use-ens-client";
import { EnsAddressRecord, EnsTextRecord, EnsNameOwner, EnsContenthashRecord } from "@/types";
import { useOwnedEnsNames } from "./use-owned-ens-names";
import { Address, Hex, hexToBytes } from "viem";
import { getCoderByCoinType } from "@ensdomains/address-encoder";

export const useENS = () => {
  const ensClient = useEnsClient();
  const { fetchEnsNamesAsync, fetchEnsSubnamesAsync } = useOwnedEnsNames();

  const getNameRecords = async (
    ensName: string,
    coinTypes: number[],
    textKeys: string[]
  ): Promise<{
    texts: EnsTextRecord[]
    addresses: EnsAddressRecord[]
    contenthash?: EnsContenthashRecord
  }> => {
 
    const records = await ensClient.getRecords({
      name: ensName,
      coins: coinTypes,
      texts: textKeys,
      abi: false,
      contentHash: true,
    });

    if (!records) {
      return {
        addresses: [],
        texts: []
      }
    }

    return {
      addresses: (records.coins || []).map(coin => {
        return { coinType: coin.id, value: coin.value }
      }),
      texts: records.texts || [],
      contenthash: records.contentHash as any
    }


  };

  const getTextsForName = async (ensName: string, keys: string[]) => {
    const promises: Promise<EnsTextRecord>[] = [];

    const textPromise = async (name: string, recordKey: string) => {
      const value = await ensClient.getTextRecord({ name, key: recordKey });
      return {
        key: recordKey,
        value: value || "",
      };
    };

    keys.forEach((key) => {
      promises.push(textPromise(ensName, key));
    });
    const texts = await Promise.all(promises);
    return texts.filter((txt) => txt.value && txt.value.length > 0);
  };

  const getAddressesForName = async (ensName: string, coinTypes: number[]) => {
    const addressPromise = async (name: string, coin: number) => {
      const values = await ensClient.getAddressRecord({ name, coin });
      const coinType = coin;
      const addrValue = values ? encodeAddress(values.value, coinType) : "";
      return {
        coinType: coinType,
        value: addrValue,
      };
    };
    const promises: Promise<EnsAddressRecord>[] = [];

    coinTypes.forEach((coinType) => {
      promises.push(addressPromise(ensName, coinType));
    });

    const addresses = await Promise.all(promises);

    return addresses.filter((addr) => addr.value && addr.value.length > 0);
  };

  const getNameResolver = (ensName: string) => {
    return ensClient.getResolver({ name: ensName });
  };

  const getNameAndAvatarForAddr = async (value: Address) => {
    const resolvedName = await ensClient.getName({ address: value });
    let avatar;
    let ensName;
    if (resolvedName && resolvedName.name) {
      ensName = resolvedName.name;
      avatar = await ensClient.getTextRecord({
        name: resolvedName.name,
        key: "avatar",
      });
    }
    return {
      resolvedName: ensName,
      avatar,
    };
  };

  const getNameOwner = async (
    ensName: string
  ): Promise<EnsNameOwner | null> => {
    const owner = await ensClient.getOwner({ name: ensName });
    if (owner == null) {
      return null;
    }
    const ownerName = await ensClient.getName({ address: owner.owner });
    let avatar;
    let ownerEnsName;
    if (ownerName && ownerName.name) {
      ownerEnsName = ownerName.name;
      avatar = await ensClient.getTextRecord({
        name: ownerName.name,
        key: "avatar",
      });
    }
    return {
      address: owner.owner,
      isWrapped: owner.ownershipLevel === "nameWrapper",
      avatar: avatar as string,
      ensName: ownerEnsName,
    };
  };

  const getExpiry = (ensName: string) => {
    return ensClient.getExpiry({ name: ensName });
  };

  return {
    getNameResolver,
    getNameOwner,
    getAllEnsNames: fetchEnsNamesAsync,
    getNameSubnames: fetchEnsSubnamesAsync,
    getNameAndAvatarForAddr,
    getExpiry,
    getNameRecords,
  };
};

const encodeAddress = (value: string, coinType: number) => {
  const encoder = getCoderByCoinType(coinType);
  if (!encoder || !value.startsWith("0x")) {
    return value;
  }
  return encoder.encode(hexToBytes(value as Hex));
};
