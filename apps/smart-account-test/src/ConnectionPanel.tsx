import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { mainnet } from "wagmi/chains";
import { formatAddress } from "./lab";

export const ConnectionPanel = () => {
  const { address, chainId, connector, isConnected } = useAccount();
  const { connect, connectors, error, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { isPending: isSwitching, switchChain } = useSwitchChain();

  const wrongChain = isConnected && chainId !== mainnet.id;

  return (
    <section className="connection-panel" aria-labelledby="connection-title">
      <div>
        <p className="eyebrow" id="connection-title">
          00 // transport
        </p>
        <div className="connection-state">
          <span
            className={`status-light ${isConnected ? "is-live" : ""}`}
            aria-hidden="true"
          />
          <span>{isConnected ? "Wallet linked" : "No wallet linked"}</span>
        </div>
      </div>

      {isConnected ? (
        <div className="connected-account">
          <div>
            <span className="data-label">Connector</span>
            <strong>{connector?.name ?? "Unknown"}</strong>
          </div>
          <div>
            <span className="data-label">Account</span>
            <strong title={address}>{formatAddress(address)}</strong>
          </div>
          <div>
            <span className="data-label">Network</span>
            <strong className={wrongChain ? "danger-text" : ""}>
              {chainId === mainnet.id
                ? "Ethereum · 1"
                : `Unsupported · ${chainId}`}
            </strong>
          </div>
          {wrongChain && (
            <button
              className="button button-secondary"
              disabled={isSwitching}
              onClick={() => switchChain({ chainId: mainnet.id })}
              type="button"
            >
              {isSwitching ? "Switching…" : "Switch to mainnet"}
            </button>
          )}
          <button
            className="text-button"
            onClick={() => disconnect()}
            type="button"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div className="connector-list">
          {connectors.map(candidate => (
            <button
              className="connector-button"
              disabled={isPending}
              key={candidate.uid}
              onClick={() =>
                connect({ connector: candidate, chainId: mainnet.id })
              }
              type="button"
            >
              <span>{candidate.name}</span>
              <span aria-hidden="true">↗</span>
            </button>
          ))}
          {error && <p className="inline-error">{error.message}</p>}
        </div>
      )}
    </section>
  );
};
