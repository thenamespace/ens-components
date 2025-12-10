import { normaliseFragment } from "@ensdomains/ensjs/utils";

export const isL2EnsName = (ensName: string) => {
  if (!ensName) {
    return false;
  }

  const split = ensName.split(".");
  return split.length === 2;
};

export const isSecondLevelDomain = (ensName: string) => {
  return ensName !== undefined && ensName.split.length === 2;
}

export const isValidEnsLabel = (label: string) => {
  if (label.length > 0) {
    try {
      if (label.includes(".")) {
        return false;
      }

      normaliseFragment(label);
      return true;
    } catch (err) {
      // do nothing invalid label
    }
  }
  return false;
};
