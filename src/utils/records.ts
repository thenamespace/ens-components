import {
  EnsAddressRecord,
  EnsContenthashRecord,
  EnsRecords,
  EnsTextRecord,
} from "@/types";

export interface EnsRecordsDiff {
  textsAdded: EnsTextRecord[];
  textsModified: EnsTextRecord[];
  textsRemoved: EnsTextRecord[];
  addressesAdded: EnsAddressRecord[];
  addressesRemoved: EnsAddressRecord[];
  addressesModified: EnsAddressRecord[];
  contenthashAdded?: EnsContenthashRecord;
  contenthashRemoved: boolean;
  contenthashModified?: EnsContenthashRecord;
}

// calculates the difference between old and new records
// needed for performing a resolver update
export const getEnsRecordsDiff = (
  oldRecords: EnsRecords,
  newRecords: EnsRecords
): EnsRecordsDiff => {
  const { textsAdded, textsModified, textsRemoved } = getEnsTextDiff(
    oldRecords.texts,
    newRecords.texts
  );
  const { addressesAdded, addressesModified, addressesRemoved } =
    getEnsAddressDiff(oldRecords.addresses, newRecords.addresses);
  const { contenthashAdded, contenthashModified, contenthashRemoved } =
    getEnsContenthashDiff(oldRecords.contenthash, newRecords.contenthash);

  return {
    addressesAdded: addressesAdded as EnsAddressRecord[],
    addressesModified: addressesModified as EnsAddressRecord[],
    addressesRemoved: addressesRemoved as EnsAddressRecord[],
    textsAdded: textsAdded as EnsTextRecord[],
    textsModified: textsModified as EnsTextRecord[],
    textsRemoved: textsRemoved as EnsTextRecord[],
    contenthashAdded,
    contenthashModified,
    contenthashRemoved: contenthashRemoved as boolean,
  };
};

const getEnsTextDiff = (
  oldTexts: EnsTextRecord[],
  newTexts: EnsTextRecord[]
): Partial<EnsRecordsDiff> => {
  if (oldTexts.length === 0) {
    return {
      textsAdded: newTexts,
      textsModified: [],
      textsRemoved: [],
    };
  }

  const oldTextMap: Record<string, EnsTextRecord> = {};
  const textsRemoved: EnsTextRecord[] = [];

  oldTexts.forEach(text => {
    oldTextMap[text.key] = text;

    // check to see if text exists in old but not in new
    const existsInNew = newTexts.find(newText => newText.key === text.key);
    if (!existsInNew) {
      textsRemoved.push(text);
    }
  });

  const textsAdded: EnsTextRecord[] = [];
  const textsModified: EnsTextRecord[] = [];

  // Check to see if there are new texts
  // that dont exist in old ones
  // or exist and are modified
  newTexts.forEach(newText => {
    const matchingOldText = oldTextMap[newText.key];
    if (!matchingOldText) {
      textsAdded.push(newText);
    } else if (matchingOldText.value !== newText.value) {
      textsModified.push(newText);
    }
  });

  return {
    textsAdded,
    textsModified,
    textsRemoved,
  };
};

const getEnsAddressDiff = (
  oldAddresses: EnsAddressRecord[],
  newAddresses: EnsAddressRecord[]
): Partial<EnsRecordsDiff> => {
  if (oldAddresses.length === 0) {
    return {
      addressesAdded: newAddresses,
      addressesModified: [],
      addressesRemoved: [],
    };
  }

  const oldAddressMap: Record<string, EnsAddressRecord> = {};
  const addressesRemoved: EnsAddressRecord[] = [];

  oldAddresses.forEach(address => {
    oldAddressMap[address.coinType] = address;

    // check to see if text exists in old but not in new
    const existsInNew = newAddresses.find(
      newAddress => newAddress.coinType === address.coinType
    );
    if (!existsInNew) {
      addressesRemoved.push(address);
    }
  });

  const addressesAdded: EnsAddressRecord[] = [];
  const addressesModified: EnsAddressRecord[] = [];

  // Check to see if there are new texts
  // that dont exist in old ones
  // or exist and are modified
  newAddresses.forEach(newAddress => {
    const matchinOldAddress = oldAddressMap[newAddress.coinType];
    if (!matchinOldAddress) {
      addressesAdded.push(newAddress);
    } else if (matchinOldAddress.value !== newAddress.value) {
      addressesModified.push(newAddress);
    }
  });

  return {
    addressesAdded,
    addressesModified,
    addressesRemoved,
  };
};

const getEnsContenthashDiff = (
  oldRecord: EnsContenthashRecord | undefined,
  newRecord: EnsContenthashRecord | undefined
): Partial<EnsRecordsDiff> => {
  if (!oldRecord && !newRecord) {
    return {
      contenthashRemoved: false,
      contenthashAdded: undefined,
      contenthashModified: undefined,
    };
  }

  if (!oldRecord && newRecord) {
    return {
      contenthashRemoved: false,
      contenthashAdded: newRecord,
      contenthashModified: undefined,
    };
  }

  const isSame =
    oldRecord?.protocol === newRecord?.protocol &&
    oldRecord?.value === newRecord?.value;
  return {
    contenthashAdded: undefined,
    contenthashModified: isSame ? undefined : newRecord,
    contenthashRemoved: false,
  };
};
