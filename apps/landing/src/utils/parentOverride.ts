/**
 * Lets testers and e2e tests point the onchain subname demos at another activated
 * name with `?parent=foo.eth`. Testnet only; mainnet keeps its fixed parent.
 */
export const getParentOverride = (): string | null => {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search)
    .get("parent")
    ?.trim()
    .toLowerCase();
  return value && /^[a-z0-9-]+(\.[a-z0-9-]+)*\.eth$/.test(value) ? value : null;
};
