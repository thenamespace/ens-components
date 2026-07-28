import { validateEnsName } from "@thenamespace/offchain-manager";
import { normalize } from "viem/ens";

const DNS_LABEL_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;

export const isValidEnsParentName = (name: string): boolean => {
  try {
    validateEnsName(name);

    // Native ENS names follow ENSIP-15 normalization.
    if (name.endsWith(".eth")) {
      normalize(name);
      return true;
    }

    // Imported DNS names follow DNS hostname rules. Keep punycode labels intact
    // because ENSIP-15 normalization intentionally rejects the `xn--` prefix.
    return (
      name.length <= 253 &&
      name.split(".").every(label => DNS_LABEL_PATTERN.test(label))
    );
  } catch {
    return false;
  }
};
