import { EnsAddressRecord } from "@/types";
import { supportedAddresses, SupportedEnsAddress } from "@/constants";
import { ChainIcon, Icon, Input, Text } from "@/components/atoms";
import { useEffect, useMemo, useRef, useState } from "react";

interface AddressRecordProps {
  initialAddresses: EnsAddressRecord[];
  addresses: EnsAddressRecord[];
  onAddressesChanged: (addresses: EnsAddressRecord[]) => void;
  searchFilter?: string;
}

export const AddressRecords = ({
  addresses,
  onAddressesChanged,
  initialAddresses,
  searchFilter,
}: AddressRecordProps) => {
  const existingAddressMap = useMemo(() => {
    const map: Record<number, EnsAddressRecord> = {};
    addresses.forEach(addr => {
      map[addr.coinType] = addr;
    });
    return map;
  }, [addresses]);

  const [lastAddedKey, setLastAddedKey] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (lastAddedKey && inputRefs.current[lastAddedKey]) {
      inputRefs.current[lastAddedKey]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      inputRefs.current[lastAddedKey]?.focus();
      setLastAddedKey(null);
    }
  }, [addresses, lastAddedKey]);

  const handleAddressChanged = (coin: number, value: string) => {
    const _addresses = [...addresses];
    for (const addr of _addresses) {
      if (addr.coinType === coin) {
        addr.value = value;
      }
    }
    onAddressesChanged(_addresses);
  };

  const handleAddressAdded = (coin: number) => {
    const initialAddress = initialAddresses.find(i => i.coinType === coin);
    onAddressesChanged([
      ...addresses,
      { coinType: coin, value: initialAddress?.value || "" },
    ]);
    setLastAddedKey(`${coin}`);
  };

  const handleRemoveAddress = (coin: number) => {
    onAddressesChanged(addresses.filter(addr => addr.coinType !== coin));
  };

  const filterAddress = (address: SupportedEnsAddress): boolean => {
    if (searchFilter && searchFilter.length > 0) {
      const lowercase = searchFilter.toLocaleLowerCase();
      return (
        address.chainName.includes(lowercase) ||
        address.label.toLocaleLowerCase().includes(lowercase)
      );
    }
    return true;
  };

  const filteredAddresses = useMemo(() => {

    return supportedAddresses.filter(record => filterAddress(record));
  },[searchFilter])

  if (filteredAddresses.length === 0) {
    return <></>
  }


  return (
    <div className="ns-text-records">
      <Text className="ns-mb-2" weight="bold">
        Addresses
      </Text>
      {filteredAddresses
        .filter(record => existingAddressMap[record.coinType] !== undefined)
        .map(record => {
          const current = existingAddressMap[record.coinType];
          const isInvalidAddress =
            current.value.length > 0 && !record.validateFunc?.(current.value);

          return (
            <div key={record.chainName} style={{ marginBottom: 10 }}>
              <Text
                style={{ marginBottom: "4px" }}
                color="grey"
                size="xs"
                weight="medium"
              >
                {record.label}
              </Text>
              <div
                style={{ width: "100%" }}
                className="d-flex align-items-center"
              >
                <Input
                  ref={(el: HTMLInputElement | null) => {
                    inputRefs.current[record.coinType] = el;
                  }}
                  error={isInvalidAddress}
                  style={{ width: "100%" }}
                  onChange={e =>
                    handleAddressChanged(record.coinType, e.target.value)
                  }
                  prefix={<ChainIcon chain={record.chainName} size={18} />}
                  value={current.value}
                  placeholder={record.placeholder}
                />
                <div
                  onClick={() => handleRemoveAddress(record.coinType)}
                  className="ns-close-icon ns-ms-1"
                >
                  <Icon name="x" size={18} />
                </div>
              </div>
              {isInvalidAddress && (
                <Text
                  size="xs"
                  color="danger"
                  className="ns-mt-1"
                >{`${record.label} address is not valid`}</Text>
              )}
            </div>
          );
        })}
      <div className="row g-2">
        {filteredAddresses
          .filter(record => existingAddressMap[record.coinType] === undefined)
          .map(record => (
            <div key={record.coinType} className="col col-lg-3 col-sm-6">
              <div
                className="ns-text-suggestion"
                onClick={() => handleAddressAdded(record.coinType)}
              >
                <ChainIcon size={20} chain={record.chainName} />
                <Text className="ns-mt-1" size="xs" weight="medium">
                  {record.label}
                </Text>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
