import React, { useEffect, useState } from "react";
import { Hash } from "viem";
import { mainnet, sepolia } from "viem/chains";
import { useAccount } from "wagmi";
import { Icon } from "@/components/atoms";
import {
  getBlockExplorerAddressUrl,
  getBlockExplorerName,
  getBlockExplorerTransactionUrl,
} from "@/utils";
import "./TransactionProgress.css";

export type TransactionProgressStatus = "pending" | "success" | "failed";

export interface TransactionDetail {
  label: React.ReactNode;
  value: React.ReactNode;
}

export interface TransactionProgressProps {
  status: TransactionProgressStatus;
  hash?: Hash;
  chainId?: number;
  isTestnet?: boolean;
  /** Overrides the default title for the current status */
  title?: React.ReactNode;
  /** Overrides the default description for the current status */
  description?: React.ReactNode;
  /** Label / value rows shown in a card under the progress rail */
  details?: TransactionDetail[];
  /** Time (ms) the rail takes to reach 90% while pending. Defaults to 10s */
  duration?: number;
  className?: string;
}

const defaultTitles: Record<TransactionProgressStatus, string> = {
  pending: "Transaction Sent",
  success: "Transaction Successful",
  failed: "Transaction Failed",
};

const defaultDescriptions: Record<TransactionProgressStatus, string> = {
  pending:
    "Your transaction has been sent to the network. Please wait for it to be confirmed.",
  success: "Your transaction has been successful.",
  failed: "Something went wrong",
};

const DEFAULT_DURATION = 10_000;

// While pending the rail moves linearly to 90% and holds there; it only
// fills the rest once the transaction is confirmed.
const PENDING_CAP = 0.9;
const TICK_MS = 200;

// When each transaction was first shown, so a remount (or a form re-render
// that swaps the screen out and back) picks up where the rail was instead of
// starting over.
const startedAt = new Map<string, number>();

const getStartTime = (hash?: string) => {
  if (!hash) return Date.now();
  if (!startedAt.has(hash)) startedAt.set(hash, Date.now());
  return startedAt.get(hash)!;
};

export const TransactionProgress: React.FC<TransactionProgressProps> = ({
  status,
  hash,
  chainId,
  isTestnet,
  title,
  description,
  details,
  duration,
  className = "",
}) => {
  const { address } = useAccount();
  const [progress, setProgress] = useState(0);

  const effectiveChainId = chainId ?? (isTestnet ? sepolia.id : mainnet.id);
  const travelTime = duration ?? DEFAULT_DURATION;

  // A batched send (EIP-5792) has no hash until it is mined; until then the
  // wallet's own explorer page shows the pending transaction.
  const explorerUrl = hash
    ? getBlockExplorerTransactionUrl(effectiveChainId, hash)
    : address
      ? getBlockExplorerAddressUrl(effectiveChainId, address)
      : null;

  useEffect(() => {
    if (status === "success") {
      setProgress(1);
      return;
    }
    if (status !== "pending") return;

    // A timer, not requestAnimationFrame: rAF stops while the wallet popup
    // covers the page, and progress is derived from wall-clock time so it
    // catches up after any pause.
    const start = getStartTime(hash);
    const tick = () => {
      const elapsed = Date.now() - start;
      setProgress(PENDING_CAP * Math.min(elapsed / travelTime, 1));
    };
    tick();
    const id = setInterval(tick, TICK_MS);

    return () => clearInterval(id);
  }, [status, travelTime, hash]);

  return (
    <div className={`ns-tx-progress ns-tx-progress--${status} ${className}`}>
      <div className="ns-tx-progress__header">
        <div className="ns-tx-progress__title">
          {title ?? defaultTitles[status]}
        </div>
        <div className="ns-tx-progress__description">
          {description ?? defaultDescriptions[status]}
        </div>
      </div>

      <div
        className="ns-tx-progress__rail"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
      >
        <div
          className="ns-tx-progress__fill"
          style={{ width: `${progress * 100}%` }}
        >
          {status === "pending" && (
            <ShurikenMark className="ns-tx-progress__mark" />
          )}
          {status === "success" && (
            <Icon
              name="check-circle"
              size={22}
              className="ns-tx-progress__mark"
            />
          )}
          {status === "failed" && (
            <Icon name="x-circle" size={22} className="ns-tx-progress__mark" />
          )}
        </div>
      </div>

      {details && details.length > 0 && (
        <div className="ns-tx-progress__details">
          {details.map((detail, i) => (
            <div className="ns-tx-progress__detail" key={`tx-detail-${i}`}>
              <div className="ns-tx-progress__detail-label">{detail.label}</div>
              <div className="ns-tx-progress__detail-value">{detail.value}</div>
            </div>
          ))}
        </div>
      )}

      {explorerUrl && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ns-tx-progress__link"
        >
          View on {getBlockExplorerName(effectiveChainId)}
          <Icon name="external-link" size={14} />
        </a>
      )}
    </div>
  );
};

// The shuriken from assets/shuriken.svg, inlined so it takes currentColor.
const ShurikenMark: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width={24}
    height={24}
    viewBox="6 6 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M64.8039 35.4533L47.6356 29.0642C45.3685 28.221 43.5846 26.4314 42.7498 24.1615L36.4189 6.96608C36.2542 6.51516 35.6167 6.51407 35.4452 6.96441L29.0613 24.1383C28.2182 26.4054 26.4285 28.1893 24.1586 29.0242L6.96371 35.3551C6.51279 35.5199 6.5117 36.1573 6.96226 36.3234L24.1355 42.7126C26.4026 43.5557 28.1865 45.3454 29.0213 47.6153L35.3469 64.8051C35.517 65.2611 36.154 65.262 36.3206 64.8067L42.7097 47.6384C43.5529 45.3713 45.3425 43.5875 47.6125 42.7526L64.8024 36.4216C65.2533 36.2568 65.2544 35.6194 64.8039 35.4533ZM35.8747 40.7492C33.1917 40.7449 31.0201 38.5659 31.0252 35.8777C31.0295 33.1947 33.2085 31.0232 35.8913 31.028C38.5741 31.0328 40.7458 33.2113 40.741 35.8941C40.7366 38.582 38.5577 40.7536 35.8747 40.7492Z"
      fill="currentColor"
    />
  </svg>
);

export default TransactionProgress;
