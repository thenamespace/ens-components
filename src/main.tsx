import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles/theme.css";
import { EnsAddressRecord, EnsRecords, EnsTextRecord } from "@/types";
import { zeroAddress } from "viem";
import { EnsRecordsForm } from "./components/ens-records-form/EnsRecordsForm";
import { WalletConnect } from "./wallet-connect";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia } from "viem/chains";

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

const SEPOLIA_PUB_RES = "0x0dcD506D1Be162E50A2b434028A9a148F2686444";
const ENS_NAME = "artii.eth";
const NAME_CHAIN_ID = mainnet.id;

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
        <EnsRecordsForm
          name={ENS_NAME}
          resolverAddress={SEPOLIA_PUB_RES}
          chainId={NAME_CHAIN_ID}
          initialRecords={{
            texts: [{ key: "avatar", value: "testvalue" }],
            addresses: [
              {
                coinType: 60,
                value: "0x0dcD506D1Be162E50A2b434028A9a148F2686444",
              },
            ],
          }}
        />
        <ConnectButton />
      </WalletConnect>
    </div>
  );
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<TestApp />);
}
