import { EnsAddressRecord } from "@/types";
import "./AddressRecords.css";
import { getSupportedAddressByCoin, supportedAddresses, SupportedEnsAddress } from "@/constants";
import { ChainIcon, Icon, Input, Text } from "@/components/atoms";
import { useMemo } from "react";

interface AddressRecordProps {
  addresses: EnsAddressRecord[];
  onAddressesChanged: (addresses: EnsAddressRecord[]) => void;
}

export const AddressRecords = ({
  addresses,
  onAddressesChanged,
}: AddressRecordProps) => {

  const supportedAddrsByCoins = useMemo(() => {

    const map: Record<number, SupportedEnsAddress> = {};
    supportedAddresses.forEach(addr => {
      map[addr.coinType] = addr;
    })
    return map;
  },[supportedAddresses])

  const invalidAddrsMap = useMemo(() => {
    
    if (!addresses || !supportedAddrsByCoins) {
      return {};
    }
    
    let map: Record<number,boolean> = {}
    addresses.forEach(addr => {
      const supportedAddr = supportedAddrsByCoins[addr.coinType];
      if (addr.value.length > 0 && supportedAddr && supportedAddr.validateFunc ) {
        const isValidAddress = supportedAddr.validateFunc(addr.value);
        map[addr.coinType] = isValidAddress;
      } else {
        map[addr.coinType] = true;
      }
    })

    return map;

  },[addresses, supportedAddrsByCoins])
  
  const handleAddressChanged = (coin: number, value: string) => {
    const _addresses = [...addresses];
    for (const addr of addresses) {
      if (addr.coinType === coin) {
        addr.value = value;
      }
    }
    onAddressesChanged(_addresses)
  };

  const handleAddressRemoved = (coin: number) => {
    onAddressesChanged(addresses.filter(addr => addr.coinType !== coin));
  };

  return (
    <div className="ns-records-wrapper ns-styled-scrollbar">
       <div className="ns-address-records-container">
      {addresses.length === 0 && (
        <div className="not-found-badge d-flex align-items-center">
          <Icon name="circle-alert" size={16} />
          <Text color="grey" weight="medium" size="sm" className="ns-ms-1">
            No addresses found
          </Text>
        </div>
      )}
      {addresses.map(addr => {
        const supportedAddress = getSupportedAddressByCoin(addr.coinType);

        // We should show default for not supported
        if (!supportedAddress) {
          console.log("Supported ADDR not present for coin: " + addr.coinType);
          return null;
        }

        return (
          <div className="ns-address-record row" key={addr.coinType}>
            <div className="col-4 d-flex align-items-center">
              <ChainIcon chain={supportedAddress.chainName} size={25} />
              <Text weight="medium" size="sm" className="ns-ms-1">
                {supportedAddress.label}
              </Text>
            </div>
            <div className="col-8 d-flex align-items-center ns-mb-1">
              <Input
                error={!invalidAddrsMap[addr.coinType]}
                onChange={(e) => handleAddressChanged(addr.coinType, e.target.value)}
                value={addr.value}
                placeholder={supportedAddress.placeholder}
              />
              <div
                onClick={() => handleAddressRemoved(supportedAddress.coinType)}
              >
                <Icon name="x" size={18} className="ns-ms-1 ns-close-icon" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
    </div>
  );
};
