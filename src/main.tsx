import { createRoot } from "react-dom/client";
import "./styles/index.css";
import "@rainbow-me/rainbowkit/styles.css";
import { EnsNameRegistrationForm, EnsRecordsForm } from "./components";
import { WalletConnectProvider } from "./web3/wallet-connect";
import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { zeroAddress } from "viem";

function TestApp() {
  // This is a test app. Its not bundled as component library!!
  const [open, setOpen] = useState(false);

  const name = "myrandomname1337.eth"

  return (
    <div>
      <WalletConnectProvider>
        <ConnectButton />
        <EnsNameRegistrationForm isTestnet={true} name={name}/>
        <EnsRecordsForm
          name={name}
          isTestnet={true}
          existingRecords={{
            addresses: [],
            texts: []
          }}
        />
      </WalletConnectProvider>
    </div>
  );
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<TestApp />);
}
