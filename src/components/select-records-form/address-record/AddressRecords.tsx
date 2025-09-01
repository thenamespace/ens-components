import { EnsAddressRecord } from "@/types";
import "./AddressRecords.css";
import { getSupportedAddressByCoin } from "@/constants";
import { ChainIcon, Icon, Input, Text } from "@/components/atoms";

interface AddressRecordProps {
  addresses: EnsAddressRecord[];
  onAddressesChanged: (addresses: EnsAddressRecord[]) => void;
}

export const AddressRecords = ({addresses, onAddressesChanged }: AddressRecordProps) => {
  
  const handleAddressChanged = (coin:number, value: string) => {

  }

  const handleAddressRemoved = (coin: number) => {
    onAddressesChanged(addresses.filter(addr => addr.coinType !== coin));
  }
  
  return <div className="ns-address-records-container">
    {addresses.map(addr =>  {
      const supportedAddress = getSupportedAddressByCoin(addr.coinType);
      
      // We should show default for not supported
      if (!supportedAddress) {
        console.log("Supported ADDR not present for coin: " + addr.coinType)
        return null;
      }

      return <div className="ns-address-record row" key={addr.coinType}>
       <div className="col-4 d-flex align-items-center">
        <ChainIcon chain={supportedAddress.chainName} size={25}/>
        <Text weight="medium" size="sm" className="ns-ms-1">{supportedAddress.label}</Text>
       </div>
       <div className="col-8 d-flex align-items-center ns-mb-2">
          <Input placeholder={`Your ${supportedAddress.label} address here...`}/>
          <div onClick={() => handleAddressRemoved(supportedAddress.coinType)}>
            <Icon name="x" size={16} className="ns-ms-1 ns-close-icon"/>
          </div>
       </div>
    </div>
    })}
  </div>;
};
