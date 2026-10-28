/**
 * Runs in the page before the app loads (via `page.addInitScript`), so it must be
 * self-contained. Installs an EIP-1193 provider that forwards every request to the
 * TestWallet in the Playwright process through the `__e2eWalletRequest` binding,
 * and announces it over EIP-6963 so RainbowKit lists it like an installed wallet.
 */
export const injectTestWallet = (info: {
  uuid: string;
  name: string;
  rdns: string;
  icon: string;
}) => {
  type Listener = (...args: unknown[]) => void;
  const listeners = new Map<string, Set<Listener>>();
  const w = window as any;

  const provider = {
    isE2EWallet: true,
    async request(args: { method: string; params?: unknown[] }) {
      const response = await w.__e2eWalletRequest({
        method: args.method,
        params: args.params ?? [],
      });
      if (response.error) {
        const error = new Error(response.error.message) as Error & {
          code: number;
          data?: unknown;
        };
        error.code = response.error.code;
        error.data = response.error.data;
        throw error;
      }
      return response.result;
    },
    on(event: string, listener: Listener) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(listener);
      return provider;
    },
    removeListener(event: string, listener: Listener) {
      listeners.get(event)?.delete(listener);
      return provider;
    },
  };

  // The test process pushes `accountsChanged` / `chainChanged` through this hook.
  w.__e2eWalletEmit = (event: string, data: unknown) => {
    listeners.get(event)?.forEach(listener => listener(data));
  };

  const announce = () =>
    window.dispatchEvent(
      new CustomEvent("eip6963:announceProvider", {
        detail: Object.freeze({ info, provider }),
      })
    );
  window.addEventListener("eip6963:requestProvider", announce);
  announce();
  if (!w.ethereum) w.ethereum = provider;
};
