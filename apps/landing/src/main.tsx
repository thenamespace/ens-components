import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "@thenamespace/ens-components/index.css";
import "@rainbow-me/rainbowkit/styles.css";
import { WalletConnectProvider } from "./wallet-connect";
import { App } from "./App";

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(
    <HelmetProvider>
      <WalletConnectProvider>
        <App />
      </WalletConnectProvider>
    </HelmetProvider>,
  );
}
