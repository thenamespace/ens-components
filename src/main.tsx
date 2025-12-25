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

  return (
    <div>
      <WalletConnectProvider>
        <ConnectButton />
        <EnsRecordsForm
          name="artii.eth"
          isTestnet={false}
          existingRecords={{
            addresses: [
              {
                coinType: 60,
                value: zeroAddress
              },
              {
                coinType: 0,
                value: "0123123123123"
              }
            ],
            texts: [{
              key: "name",
              value: "Hellothere"
            }, {
              key:"description",
              value: "avatar1"
            },
          {
              key: "com.twitter",
              value: "twitterusername"
            }],
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
