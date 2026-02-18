import { createRoot } from "react-dom/client";
import "@thenamespace/ens-components/index.css";
import "@rainbow-me/rainbowkit/styles.css";
import { EnsRecordsForm, OffchainSubnameForm } from "@thenamespace/ens-components";
import { WalletConnectProvider } from "./wallet-connect";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const PUSHX_PARENT_NAME = "pushx.eth";
const PUSHX_API_KEY = "";

function TestApp() {
  return (
    <WalletConnectProvider>
      <div style={{ maxWidth: 720, margin: "20px auto", padding: "0 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <strong>ENS Records Form (Avatar Upload)</strong>
          <ConnectButton />
        </div>

        <EnsRecordsForm
          name="devname.eth"
          isTestnet={false}
          resolverAddress={"0x231b0Ee14048e9dCcD1d247744d114a4Eb5E8E63"}
          avatarUploadDomain="localhost"
          existingRecords={{
            addresses: [],
            texts: [
              { key: "description", value: "I am an alien from outer space" },
              { key: "location", value: "e.g. Jupiter" },
            ],
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", margin: "24px 0 12px" }}>
          <strong>Offchain Subname Form</strong>
        </div>

        <OffchainSubnameForm
          name={PUSHX_PARENT_NAME}
          apiKeyOrToken={PUSHX_API_KEY}
          isTestnet={false}
          avatarUploadDomain="localhost"
        />
      </div>
    </WalletConnectProvider>
  );
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<TestApp />);
}
