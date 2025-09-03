import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Button, ContenthashIcon, SelectRecordsForm } from "@/components";
import "./styles/theme.css";
import { ContenthashProtocol, EnsAddressRecord, EnsRecords, EnsTextRecord } from "@/types";
import { zeroAddress } from "viem";

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
    value: zeroAddress
  },
  {
    coinType: 0,
    value: zeroAddress
  }
]

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
      Hello there
      <SelectRecordsForm
        records={records}
        onRecordsUpdated={handleRecordsUpdated}
      />
      <Button
        onClick={() => {
          console.log(records);
        }}
      >
        Print
      </Button>
      <ContenthashIcon protocol={ContenthashProtocol.Ipfs} size={20}/>
      <ContenthashIcon protocol={ContenthashProtocol.Arweave} size={20}/>
      <ContenthashIcon protocol={ContenthashProtocol.Onion} size={20}/>
    </div>
  );
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<TestApp />);
}
