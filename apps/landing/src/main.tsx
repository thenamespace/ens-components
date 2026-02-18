import { createRoot } from "react-dom/client";
import "@thenamespace/ens-components/index.css";
import "@rainbow-me/rainbowkit/styles.css";
import { WalletConnectProvider } from "./wallet-connect";
import { App } from "./App";

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(
    <WalletConnectProvider>
      <App />
    </WalletConnectProvider>,
  );
}
