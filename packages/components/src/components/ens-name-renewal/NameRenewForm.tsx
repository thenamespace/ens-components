import type { Address } from "viem";
import type { RenewalSuccessData } from "./RenewShared";
import { NameRenewFormV1 } from "./v1/NameRenewFormV1";
import { NameRenewFormV2 } from "./v2/NameRenewFormV2";

export interface NameRenewFormProps {
  /** "alice" or "alice.eth". Leave empty to let the user type a name. */
  name?: string;
  isTestnet?: boolean;
  /** 2 (default) renews through the ENSv2 registrar in stablecoins, 1 through the ENSv1 controller in ETH. */
  version?: 1 | 2;
  referrer?: Address;
  title?: string;
  subtitle?: string;
  className?: string;
  noBorder?: boolean;
  onCancel?: () => void;
  onConnectWallet?: () => void;
  onRenewalSuccess?: (data: RenewalSuccessData) => void;
}

export const NameRenewForm = ({
  version = 2,
  noBorder,
  ...props
}: NameRenewFormProps) => (
  <div
    className={noBorder ? "ns-no-border-scope" : undefined}
    style={{ display: "contents" }}
  >
    {version === 2 ? (
      <NameRenewFormV2 {...props} />
    ) : (
      <NameRenewFormV1 {...props} />
    )}
  </div>
);
