import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Button, ContenthashIcon, SelectRecordsForm } from "@/components";
import "./styles/theme.css";
import {
  ContenthashProtocol,
  EnsAddressRecord,
  EnsRecords,
  EnsTextRecord,
} from "@/types";
import { zeroAddress } from "viem";
import { EditRecordsForm } from "./components/edit-records-form/EditRecordsForm";
import { WalletConnect } from "./wallet-connect";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const _texts: EnsTextRecord[] = [
  {
    key: "name",
    value: "test",
  },
  {
    key: "description",
    value: "hello",
  },
];

const _addrs: EnsAddressRecord[] = [
  {
    coinType: 60,
    value: zeroAddress,
  },
  {
    coinType: 0,
    value: zeroAddress,
  },
];

function TestApp() {
  const [records, setRecords] = useState<EnsRecords>({
    texts: [..._texts],
    addresses: [..._addrs],
  });

  const handleRecordsUpdated = (newRecords: EnsRecords) => {
    setRecords(newRecords);
  };

  return (
    <div>
           <WalletConnect>
            <EditRecordsForm name="artii.eth" resolverAddress={"0x0dcD506D1Be162E50A2b434028A9a148F2686444"} initialRecords={{
              texts: [{ key: "avatar", value: "testvalue"}],
              addresses: [{ coinType: 60, value: "0x0dcD506D1Be162E50A2b434028A9a148F2686444"}]
            }}/>
            <ConnectButton/>
           </WalletConnect>
    </div>
  );
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<TestApp />);
}
