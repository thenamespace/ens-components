import { createRoot } from "react-dom/client";
import "./styles/index.css";
import "@rainbow-me/rainbowkit/styles.css";
import { SelectRecordsForm, ENSNameRegistrationForm, EnsNameRegistrationForm, Modal, Button } from "./components";
import { WalletConnectProvider } from "./web3/wallet-connect";
import { useState } from "react";

function TestApp() {
  // This is a test app. Its not bundled as component library!!
  const [open, setOpen] = useState(false)

  return (
    <div>
      <WalletConnectProvider>
      <EnsNameRegistrationForm/>
      </WalletConnectProvider>

    </div>
  );
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<TestApp />);
}
