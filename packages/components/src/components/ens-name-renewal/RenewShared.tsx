import type React from "react";
import {
  Button,
  Icon,
  Identicon,
  Input,
  ShurikenSpinner,
  Text,
} from "@/components/atoms";
import {
  getBlockExplorerName,
  getBlockExplorerTransactionUrl,
  getEnsAppUrl,
} from "@/utils";
import "../ens-name-registration/registration/SuccessScreen.css";
import "../subname-mint-form/SubnameMintForm.css";

export const labelFromName = (name?: string) =>
  name ? name.replace(/\.eth$/, "").split(".")[0] : "";

export const MIN_ETH_LABEL_LENGTH = 3;
export const RENEW_DEBOUNCE_MS = 500;

export const formatExpiry = (seconds: bigint) =>
  new Date(Number(seconds) * 1000).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

export interface RenewalSuccessData {
  fullName: string;
  txHash: string;
  price: string;
  priceCurrency: string;
  transactionFees: string;
  newExpiry: string;
}

export const RenewNameInput = ({
  value,
  suffix,
  disabled,
  onChange,
}: {
  value: string;
  suffix: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) => (
  <Input
    data-testid="renew-name-input"
    value={value}
    onChange={e => onChange(e.target.value)}
    disabled={disabled}
    size="lg"
    wrapperClassName="ns-subname-mint-input"
    prefix={<Icon color="grey" size={20} name="search" />}
    suffix={
      <Text weight="medium" size="sm" color="grey">
        {suffix}
      </Text>
    }
  />
);

export type RenewStatusTone = "ok" | "bad" | "soon" | "idle";

export const RenewStatus = ({
  isChecking,
  tone,
  message,
}: {
  isChecking: boolean;
  tone: RenewStatusTone;
  message: string;
}) => (
  <div className="ns-name-status">
    {isChecking ? (
      <>
        <ShurikenSpinner size={14} />
        <span className="ns-name-status__text">Checking name</span>
      </>
    ) : (
      <>
        <span
          className={tone === "idle" ? "ns-dot" : `ns-dot ns-dot--${tone}`}
        />
        <span className="ns-name-status__text">{message}</span>
      </>
    )}
  </div>
);

const EXPIRY_BOX: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  marginTop: 12,
};
const EXPIRY_ROW: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  gap: 12,
};

export const ExpiryRows = ({
  current,
  next,
}: {
  current: bigint;
  next: bigint;
}) => (
  <div style={EXPIRY_BOX}>
    <div style={EXPIRY_ROW}>
      <Text size="sm" color="grey">
        Current expiry
      </Text>
      <Text size="sm" color="grey">
        {formatExpiry(current)}
      </Text>
    </div>
    <div style={EXPIRY_ROW}>
      <Text size="sm" color="grey">
        New expiry
      </Text>
      <Text size="sm" weight="medium">
        {formatExpiry(next)}
      </Text>
    </div>
  </div>
);

export const RenewSuccess = ({
  data,
  chainId,
  isTestnet,
  onClose,
  onRenewAnother,
}: {
  data: RenewalSuccessData;
  chainId: number;
  isTestnet: boolean;
  onClose?: () => void;
  onRenewAnother?: () => void;
}) => (
  <div className="ens-registration-success-container">
    <div className="ens-registration-success-card">
      <div className="ens-registration-success-band">RENEWED</div>
      <div className="ens-registration-success-body">
        <div className="ens-registration-success-title-section">
          <Identicon seed={data.fullName} size={44} />
          <span
            className="ens-registration-success-name"
            data-testid="renew-success-name"
          >
            {data.fullName}
          </span>
        </div>
        <div className="ens-registration-success-summary">
          <div className="ens-registration-success-summary-row">
            <Text size="sm" color="grey">
              Renewal price
            </Text>
            <Text size="sm" color="grey">
              {data.price === "0"
                ? "Free"
                : `${data.price} ${data.priceCurrency}`}
            </Text>
          </div>
          <div className="ens-registration-success-summary-row">
            <Text size="sm" color="grey">
              Transaction fees
            </Text>
            <Text size="sm" color="grey">
              {data.transactionFees} ETH
            </Text>
          </div>
          <div className="ens-registration-success-summary-row">
            <Text size="sm" color="grey">
              Expires
            </Text>
            <Text size="sm" weight="medium">
              {data.newExpiry}
            </Text>
          </div>
          <div className="ens-registration-success-summary-row">
            <a
              href={getBlockExplorerTransactionUrl(chainId, data.txHash)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
            >
              <Text size="xs" color="grey">
                View on {getBlockExplorerName(chainId)} ↗
              </Text>
            </a>
          </div>
        </div>
        <div className="ens-registration-success-actions">
          <Button
            variant="outline"
            onClick={() =>
              window.open(
                getEnsAppUrl(data.fullName, isTestnet),
                "_blank",
                "noopener,noreferrer"
              )
            }
            className="ens-registration-success-view-name-btn"
          >
            View Name
          </Button>
          {onRenewAnother && (
            <Button
              variant="outline"
              onClick={onRenewAnother}
              className="ens-registration-success-register-another-btn"
            >
              Renew Another
            </Button>
          )}
        </div>
        <Button
          onClick={() => onClose?.()}
          size="lg"
          className="ns-wd-100 mt-2"
        >
          Great!
        </Button>
      </div>
    </div>
  </div>
);
