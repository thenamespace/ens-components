import { useState } from "react";
import { ComponentPanel } from "./ComponentPanel";
import { ConnectionPanel } from "./ConnectionPanel";
import { DiagnosticPanel } from "./DiagnosticPanel";
import { OffchainPanel } from "./OffchainPanel";
import { labConfig } from "./config";

type ActivePane = "diagnostic" | "component" | "offchain";

export const App = () => {
  const [activePane, setActivePane] = useState<ActivePane>("diagnostic");
  const [ensName, setEnsName] = useState("");

  const configurationIssues = [
    !labConfig.mainnetRpcConfigured
      ? "VITE_MAINNET_RPC_URL is missing; verification is disabled."
      : null,
    !labConfig.walletConnectConfigured
      ? "VITE_WALLETCONNECT_PROJECT_ID is missing; Safe via WalletConnect is unavailable."
      : null,
  ].filter((issue): issue is string => Boolean(issue));

  return (
    <main>
      <div className="ambient-grid" aria-hidden="true" />

      <header className="hero">
        <div className="hero-kicker">
          <span>NAMESPACE R&amp;D</span>
          <span>ETHEREUM MAINNET</span>
          <span>MANUAL LAB / 4001</span>
        </div>
        <div className="hero-copy">
          <div>
            <p className="eyebrow">Smart-account compatibility lab</p>
            <h1>
              Prove the
              <span>signature path.</span>
            </h1>
          </div>
          <p className="hero-summary">
            One instrument panel for deployed EIP-1271 wallets, counterfactual
            EIP-6492 accounts, and the EOA control. Verification is read-only.
            Upload is not.
          </p>
        </div>
        <div className="standard-strip" aria-label="Target standards">
          <div>
            <span>SAFE</span>
            <strong>EIP-1271</strong>
            <small>deployed contract</small>
          </div>
          <div>
            <span>BASE ACCOUNT</span>
            <strong>EIP-6492</strong>
            <small>counterfactual contract</small>
          </div>
          <div>
            <span>CONTROL</span>
            <strong>EIP-191</strong>
            <small>externally owned account</small>
          </div>
        </div>
      </header>

      {configurationIssues.length > 0 && (
        <section className="configuration-alert" role="alert">
          <strong>CONFIGURATION INCOMPLETE</strong>
          <ul>
            {configurationIssues.map(issue => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
          <span>Copy .env.example to .env.local and restart Vite.</span>
        </section>
      )}

      <ConnectionPanel />

      <nav className="pane-tabs" aria-label="Lab paths">
        <button
          aria-current={activePane === "diagnostic" ? "page" : undefined}
          className={activePane === "diagnostic" ? "is-active" : ""}
          onClick={() => setActivePane("diagnostic")}
          type="button"
        >
          <span>01</span>
          Diagnostic SDK
        </button>
        <button
          aria-current={activePane === "component" ? "page" : undefined}
          className={activePane === "component" ? "is-active" : ""}
          onClick={() => setActivePane("component")}
          type="button"
        >
          <span>02</span>
          Production component
        </button>
        <button
          aria-current={activePane === "offchain" ? "page" : undefined}
          className={activePane === "offchain" ? "is-active" : ""}
          onClick={() => setActivePane("offchain")}
          type="button"
        >
          <span>03</span>
          Offchain subname
        </button>
      </nav>

      {activePane === "diagnostic" && (
        <DiagnosticPanel ensName={ensName} onEnsNameChange={setEnsName} />
      )}
      {activePane === "component" && (
        <ComponentPanel ensName={ensName} onEnsNameChange={setEnsName} />
      )}
      {activePane === "offchain" && <OffchainPanel />}

      <footer>
        <span>NO SIGNATURES ARE LOGGED OR PERSISTED</span>
        <span>
          Metadata endpoint:{" "}
          {labConfig.metadataApiUrl === "https://metadata.namespace.ninja"
            ? "Namespace production"
            : "environment override"}
        </span>
      </footer>
    </main>
  );
};
