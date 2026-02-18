import {
  getSupportedAddressByCoin,
  getSupportedAddressByName,
  getSupportedChashByProtocol,
  isContenthashValid,
} from "@/constants";
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
  isDifferent: boolean;
}

// calculates the difference between old and new records
// needed for performing a resolver update
export const getEnsRecordsDiff = (
  oldRecords: EnsRecords,
  newRecords: EnsRecords
): EnsRecordsDiff => {
  const {
    textsAdded,
    textsModified,
    textsRemoved,
    isDifferent: isTxtDifferent,
  } = getEnsTextDiff(oldRecords.texts, newRecords.texts);
  const {
    addressesAdded,
    addressesModified,
    addressesRemoved,
    isDifferent: isAddrDifferent,
  } = getEnsAddressDiff(oldRecords.addresses, newRecords.addresses);
  const {
    contenthashAdded,
    contenthashModified,
    contenthashRemoved,
    isDifferent: isChashDifferent,
  } = getEnsContenthashDiff(oldRecords.contenthash, newRecords.contenthash);

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
    isDifferent: (isTxtDifferent ||
      isAddrDifferent ||
      isChashDifferent) as boolean,
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
      isDifferent: newTexts.length > 0,
    };
  }

  let hasDifferences = false;
  const oldTextMap: Record<string, EnsTextRecord> = {};
  const textsRemoved: EnsTextRecord[] = [];

  oldTexts.forEach(text => {
    oldTextMap[text.key] = text;

    // check to see if text exists in old but not in new
    const existsInNew = newTexts.find(newText => newText.key === text.key);
    if (!existsInNew) {
      hasDifferences = true;
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
      hasDifferences = true;
      textsAdded.push(newText);
    } else if (matchingOldText.value !== newText.value) {
      hasDifferences = true;
      textsModified.push(newText);
    }
  });

  return {
    textsAdded,
    textsModified,
    textsRemoved,
    isDifferent: hasDifferences,
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
      isDifferent: newAddresses.length > 0,
    };
  }

  let hasDifference = false;
  const oldAddressMap: Record<string, EnsAddressRecord> = {};
  const addressesRemoved: EnsAddressRecord[] = [];

  oldAddresses.forEach(address => {
    oldAddressMap[address.coinType] = address;

    // check to see if text exists in old but not in new
    const existsInNew = newAddresses.find(
      newAddress => newAddress.coinType === address.coinType
    );
    if (!existsInNew) {
      hasDifference = true;
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
      hasDifference = true;
      addressesAdded.push(newAddress);
    } else if (matchinOldAddress.value !== newAddress.value) {
      hasDifference = true;
      addressesModified.push(newAddress);
    }
  });

  return {
    addressesAdded,
    addressesModified,
    addressesRemoved,
    isDifferent: hasDifference,
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
      isDifferent: false,
    };
  }

  if (!oldRecord && newRecord) {
    return {
      contenthashRemoved: false,
      contenthashAdded: newRecord,
      contenthashModified: undefined,
      isDifferent: true,
    };
  }

  const isSame =
    oldRecord?.protocol === newRecord?.protocol &&
    oldRecord?.value === newRecord?.value;
  return {
    contenthashAdded: undefined,
    contenthashModified: isSame ? undefined : newRecord,
    contenthashRemoved: false,
    isDifferent: !isSame,
  };
};

export interface RecordValidationError {
  type: "address" | "text" | "contenthash";
  reason: string;
}

export const validateEnsRecords = (
  ensRecords: EnsRecords
): { validationFailed: boolean; errors: RecordValidationError[] } => {
  const { texts, addresses, contenthash } = ensRecords;

  let validationErrs: RecordValidationError[] = [];
  let validationFailed = false;
  if (addresses && addresses.length > 0) {
    addresses.forEach(addr => {
      const validator = getSupportedAddressByCoin(addr.coinType);
      if (addr.value.length === 0) {
        validationFailed = true;
        validationErrs.push({
          type: "address",
          reason: `${validator ? validator.label : addr.coinType} address cannot be blank.`,
        });
        return;
      }

      if (validator) {
        if (!validator.validateFunc?.(addr.value)) {
          validationFailed = true;
          validationErrs.push({
            type: "address",
            reason: `${validator.label} address value is not valid.`,
          });
          return;
        }
      }
    });
  }

  if (texts && texts.length > 0) {
    texts.forEach(txt => {
      if (!txt.value || txt.value.length === 0) {
        validationFailed = true;
        validationErrs.push({
          type: "text",
          reason: `Text -> '${txt.key}' cannot be blank.`,
        });
      }
    });
  }

  if (contenthash) {
    const { value, protocol } = contenthash;
    const validator = getSupportedChashByProtocol(protocol);

    if (value?.trim?.().length == 0 || !isContenthashValid(protocol, value)) {
      validationFailed = true;
      validationErrs.push({
        type: "contenthash",
        reason: `Contenthash value is invalid for ${validator ? validator.label : protocol} protocol`,
      });
    }
  }

  return {
    validationFailed: validationFailed,
    errors: validationErrs,
  };
};

export const diffToEnsRecords = (diff: EnsRecordsDiff): EnsRecords => {
  const records: EnsRecords = {
    addresses: [],
    texts: [],
  };

  records.addresses = [...diff.addressesAdded, ...diff.addressesModified];
  records.texts = [...diff.textsAdded, ...diff.textsModified];

  if (diff.contenthashAdded || diff.contenthashModified) {
    records.contenthash = diff.contenthashAdded || diff.contenthashModified;
  }

  return records;
};
