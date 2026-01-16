import { createRoot } from "react-dom/client";
import "./styles/index.css";
import "@rainbow-me/rainbowkit/styles.css";
import { EnsNameRegistrationForm, EnsRecordsForm, OffchainSubnameForm, SubnameMintForm } from "./components";
import { WalletConnectProvider } from "./web3/wallet-connect";
import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { zeroAddress } from "viem";

function TestApp() {
  // This is a test app. Its not bundled as component library!!
  const [open, setOpen] = useState(false);

  return (
    <div>
      <WalletConnectProvider>
        <ConnectButton />
          <EnsNameRegistrationForm />
          <OffchainSubnameForm name="devname.eth" label="test" apiKeyOrToken="ns-32bda1ab-ff72-4004-9c98-e274e7df3577"/>
      </WalletConnectProvider>
    </div>
  );
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<TestApp />);
}
