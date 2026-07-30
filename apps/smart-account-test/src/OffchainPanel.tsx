import {
  PrivyProvider,
  useCreateWallet,
  usePrivy,
  useWallets,
} from "@privy-io/react-auth";
import {
  OffchainSubnameForm,
  type OffchainSubnameCreatedData,
} from "@thenamespace/ens-components";
import { createOffchainClient } from "@thenamespace/offchain-manager";
import { toKernelSmartAccount } from "permissionless/accounts";
import { useEffect, useMemo, useState } from "react";
import { isErc6492Signature } from "viem";
import type { SmartAccount } from "viem/account-abstraction";
import { mainnet } from "viem/chains";
import { usePublicClient } from "wagmi";
import { labConfig } from "./config";

type Operation = {
  action: "created" | "updated";
  fullSubname: string;
  addressRecords: number;
  textRecords: number;
  owner: string;
};

type ProviderTestResult = {
  bytecodeBefore: "deployed" | "not deployed";
  signatureBytes: number;
  erc6492Wrapper: boolean;
  verified: boolean;
  bytecodeAfter: "deployed" | "not deployed";
  deploymentPersisted: boolean;
  passed: boolean;
};

const shortenAddress = (address?: string) =>
  address ? `${address.slice(0, 8)}…${address.slice(-6)}` : "not ready";

const getAccountErrorMessage = (error: unknown) => {
  if (!(error instanceof Error)) {
    return "Could not derive the Kernel smart account.";
  }

  if (
    error.message.includes("Failed to fetch") ||
    error.message.includes("HTTP request failed")
  ) {
    return "The mainnet RPC request failed. Check VITE_MAINNET_RPC_URL, browser CORS access, and restart Vite.";
  }

  return error.message.split("\n")[0].slice(0, 240);
};

const OffchainPanelContent = () => {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const { createWallet } = useCreateWallet();
  const publicClient = usePublicClient({ chainId: mainnet.id });
  const [acknowledged, setAcknowledged] = useState(false);
  const [lastOperation, setLastOperation] = useState<Operation | null>(null);
  const [smartAccount, setSmartAccount] = useState<SmartAccount | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [isTestingProvider, setIsTestingProvider] = useState(false);
  const [providerTest, setProviderTest] = useState<ProviderTestResult | null>(
    null
  );
  const [providerTestError, setProviderTestError] = useState<string | null>(
    null
  );

  const embeddedWallet = wallets.find(
    wallet =>
      wallet.walletClientType === "privy" ||
      wallet.walletClientType === "privy-v2"
  );

  useEffect(() => {
    let cancelled = false;

    if (!authenticated || !embeddedWallet) {
      setSmartAccount(null);
      return;
    }

    if (!labConfig.mainnetRpcConfigured || !publicClient) {
      setSmartAccount(null);
      setAccountError(
        "Add VITE_MAINNET_RPC_URL to .env.local and restart Vite before deriving the Kernel account."
      );
      return;
    }

    setAccountError(null);
    void (async () => {
      try {
        const ethereumProvider = await embeddedWallet.getEthereumProvider();
        const owner = {
          request: ethereumProvider.request.bind(ethereumProvider),
        };
        const account = await toKernelSmartAccount({
          client: publicClient,
          owners: [owner],
          version: "0.3.1",
        });
        if (!cancelled) {
          setSmartAccount(account);
        }
      } catch (error) {
        if (!cancelled) {
          setSmartAccount(null);
          setAccountError(getAccountErrorMessage(error));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authenticated, embeddedWallet, publicClient]);

  useEffect(() => {
    setProviderTest(null);
    setProviderTestError(null);
  }, [smartAccount?.address]);

  const offchainManager = useMemo(
    () =>
      labConfig.offchainApiKeyConfigured
        ? createOffchainClient({
            mode: "mainnet",
            domainApiKeys: {
              [labConfig.offchainParentName]: labConfig.offchainApiKey,
            },
          })
        : null,
    []
  );

  const avatarUploadWalletProvider = useMemo(
    () =>
      smartAccount
        ? {
            address: smartAccount.address,
            chainId: mainnet.id,
            signMessage: (message: string) =>
              smartAccount.signMessage({ message }),
          }
        : undefined,
    [smartAccount]
  );

  const recordOperation = (
    action: Operation["action"],
    data: OffchainSubnameCreatedData,
    owner: string
  ) => {
    setLastOperation({
      action,
      fullSubname: data.fullSubname,
      addressRecords: data.addresses.length,
      textRecords: data.texts.length,
      owner,
    });
  };

  const createSubname = async (data: OffchainSubnameCreatedData) => {
    if (!offchainManager || !smartAccount) {
      throw new Error(
        "The offchain client or Privy smart account is not ready."
      );
    }

    const owner = data.owner || smartAccount.address;
    await offchainManager.createSubname({
      parentName: data.parentName,
      label: data.label,
      addresses: data.addresses,
      texts: data.texts,
      owner,
    });
    recordOperation("created", data, owner);
  };

  const updateSubname = async (data: OffchainSubnameCreatedData) => {
    if (!offchainManager || !smartAccount) {
      throw new Error(
        "The offchain client or Privy smart account is not ready."
      );
    }

    await offchainManager.updateSubname(data.fullSubname, {
      addresses: data.addresses,
      texts: data.texts,
    });
    recordOperation("updated", data, data.owner || smartAccount.address);
  };

  const handleCreateWallet = async () => {
    setIsCreatingWallet(true);
    setAccountError(null);
    try {
      await createWallet();
    } catch (error) {
      setAccountError(
        error instanceof Error
          ? error.message
          : "Embedded wallet creation failed."
      );
    } finally {
      setIsCreatingWallet(false);
    }
  };

  const handleTestProvider = async () => {
    if (!smartAccount || !publicClient) {
      return;
    }

    setIsTestingProvider(true);
    setProviderTest(null);
    setProviderTestError(null);

    try {
      const message = [
        "Namespace ERC-6492 compatibility test",
        `Account: ${smartAccount.address}`,
        `Chain ID: ${mainnet.id}`,
        `Issued At: ${new Date().toISOString()}`,
      ].join("\n");
      const codeBefore = await publicClient.getCode({
        address: smartAccount.address,
      });
      const signature = await smartAccount.signMessage({ message });
      const wrapped = isErc6492Signature(signature);
      const verified = await publicClient.verifyMessage({
        address: smartAccount.address,
        message,
        signature,
      });
      const codeAfter = await publicClient.getCode({
        address: smartAccount.address,
      });
      const deployedBefore = Boolean(codeBefore && codeBefore !== "0x");
      const deployedAfter = Boolean(codeAfter && codeAfter !== "0x");
      const deploymentPersisted = !deployedBefore && deployedAfter;

      setProviderTest({
        bytecodeBefore: deployedBefore ? "deployed" : "not deployed",
        signatureBytes: (signature.length - 2) / 2,
        erc6492Wrapper: wrapped,
        verified,
        bytecodeAfter: deployedAfter ? "deployed" : "not deployed",
        deploymentPersisted,
        passed:
          !deployedBefore &&
          wrapped &&
          verified &&
          !deployedAfter &&
          !deploymentPersisted,
      });
    } catch (error) {
      setProviderTestError(getAccountErrorMessage(error));
    } finally {
      setIsTestingProvider(false);
    }
  };

  const unlocked =
    acknowledged && Boolean(offchainManager) && Boolean(smartAccount);

  return (
    <section className="lab-panel" aria-labelledby="offchain-heading">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">03 // Privy + offchain subname path</p>
          <h2 id="offchain-heading">Issue under pushx.eth.</h2>
        </div>
        <span className="panel-tag">CCIP-Read / gasless</span>
      </div>

      <div className="component-intro">
        <div>
          <h3>Login, derive the smart owner, then create the subname.</h3>
          <p>
            Privy creates the embedded signer. The app derives a counterfactual
            Kernel account from it and assigns that address as the owner. The
            Namespace domain key authorizes creation; no resolver or deployment
            transaction is sent.
          </p>
        </div>
        <dl className="offchain-context">
          <div>
            <dt>Parent</dt>
            <dd>{labConfig.offchainParentName}</dd>
          </div>
          <div>
            <dt>Kernel owner</dt>
            <dd title={smartAccount?.address}>
              {shortenAddress(smartAccount?.address)}
            </dd>
          </div>
          <div>
            <dt>Domain key</dt>
            <dd>
              {labConfig.offchainApiKeyConfigured ? "configured" : "missing"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="embedded-account-bar">
        <div>
          <span>PRIVY SESSION</span>
          <strong>
            {!ready
              ? "loading"
              : authenticated
                ? embeddedWallet
                  ? "embedded signer ready"
                  : "signer required"
                : "login required"}
          </strong>
          {embeddedWallet && (
            <small title={embeddedWallet.address}>
              Signer {shortenAddress(embeddedWallet.address)}
            </small>
          )}
        </div>
        <div>
          <span>COUNTERFACTUAL OWNER</span>
          <strong>{smartAccount ? "Kernel v0.3.1" : "not derived"}</strong>
          <small>
            {smartAccount
              ? `${shortenAddress(smartAccount.address)} · undeployed until used onchain`
              : "Mainnet RPC required"}
          </small>
        </div>
        <div className="embedded-account-actions">
          {!authenticated ? (
            <button disabled={!ready} onClick={login} type="button">
              Login with Privy
            </button>
          ) : !embeddedWallet && walletsReady ? (
            <button
              disabled={isCreatingWallet}
              onClick={handleCreateWallet}
              type="button"
            >
              {isCreatingWallet ? "Creating…" : "Create embedded signer"}
            </button>
          ) : (
            <button onClick={logout} type="button">
              Logout
            </button>
          )}
        </div>
      </div>

      {accountError && (
        <div className="configuration-alert" role="alert">
          <strong>SMART ACCOUNT ERROR</strong>
          <span>{accountError}</span>
        </div>
      )}

      <section
        className="provider-test"
        aria-labelledby="provider-test-heading"
      >
        <div>
          <p className="eyebrow">READ-ONLY PROVIDER CHECK</p>
          <h3 id="provider-test-heading">Prove the ERC-6492 signature path.</h3>
          <p>
            Signs a transient compatibility message, verifies it through Viem,
            and compares mainnet bytecode before and after. It does not create a
            subname, upload media, or deploy the account.
          </p>
        </div>
        <button
          className="button button-secondary"
          disabled={!smartAccount || !publicClient || isTestingProvider}
          onClick={handleTestProvider}
          type="button"
        >
          {isTestingProvider ? "Check wallet…" : "Test ERC-6492 provider"}
        </button>
        <dl className="provider-test-results">
          <div>
            <dt>Code before</dt>
            <dd>{providerTest?.bytecodeBefore ?? "—"}</dd>
          </div>
          <div>
            <dt>6492 wrapper</dt>
            <dd>
              {providerTest
                ? providerTest.erc6492Wrapper
                  ? "detected"
                  : "missing"
                : "—"}
            </dd>
          </div>
          <div>
            <dt>Signature</dt>
            <dd>
              {providerTest ? `${providerTest.signatureBytes} bytes` : "—"}
            </dd>
          </div>
          <div>
            <dt>Verification</dt>
            <dd>
              {providerTest
                ? providerTest.verified
                  ? "valid"
                  : "failed"
                : "—"}
            </dd>
          </div>
          <div>
            <dt>Code after</dt>
            <dd>{providerTest?.bytecodeAfter ?? "—"}</dd>
          </div>
          <div>
            <dt>Result</dt>
            <dd
              className={
                providerTest
                  ? providerTest.passed
                    ? "is-success"
                    : "is-failure"
                  : undefined
              }
            >
              {providerTest
                ? providerTest.passed
                  ? "ERC-6492 PASS"
                  : "NOT COUNTERFACTUAL"
                : "waiting"}
            </dd>
          </div>
        </dl>
        {providerTestError && (
          <p className="inline-error" role="alert">
            {providerTestError}
          </p>
        )}
      </section>

      <label className="acknowledgement component-acknowledgement">
        <input
          checked={acknowledged}
          disabled={!labConfig.offchainApiKeyConfigured || !smartAccount}
          onChange={event => setAcknowledged(event.target.checked)}
          type="checkbox"
        />
        <span>
          Unlock production create/update access for labels under{" "}
          {labConfig.offchainParentName}. I will verify the label and
          counterfactual owner before submitting.
        </span>
      </label>

      {!unlocked || !offchainManager || !smartAccount ? (
        <div className="component-lock">
          <span aria-hidden="true">LOCKED / PRODUCTION API</span>
          <p>
            {!labConfig.offchainApiKeyConfigured
              ? "Add VITE_OFFCHAIN_API_KEY and restart Vite."
              : !authenticated
                ? "Login with Privy to create the embedded signer."
                : !smartAccount
                  ? "Waiting for the embedded signer and Kernel owner."
                  : "Acknowledge the production write to mount the subname form."}
          </p>
        </div>
      ) : (
        <div className="component-workbench">
          <div className="component-shell">
            <OffchainSubnameForm
              avatarUploadDomain={labConfig.domain}
              avatarUploadWalletProvider={avatarUploadWalletProvider}
              defaultOwnerAddress={smartAccount.address}
              isTestnet={false}
              key={`${labConfig.offchainParentName}-${smartAccount.address}`}
              name={labConfig.offchainParentName}
              offchainManager={offchainManager}
              onSubnameCreated={createSubname}
              onSubnameUpdated={updateSubname}
              subtitle="Create the name with the prefilled Kernel owner. After creation, continue and reopen the existing label before uploading avatar/header so ownership is already registered."
              title={`Issue a ${labConfig.offchainParentName} name`}
            />
          </div>

          <aside className="record-monitor">
            <div>
              <span>OFFCHAIN WRITE MONITOR</span>
              <span>{lastOperation ? "last confirmed write" : "waiting"}</span>
            </div>
            <pre>
              {JSON.stringify(
                lastOperation ?? { status: "no write yet" },
                null,
                2
              )}
            </pre>
          </aside>
        </div>
      )}
    </section>
  );
};

export const OffchainPanel = () => {
  if (!labConfig.privyConfigured) {
    return (
      <section className="lab-panel">
        <div className="component-lock">
          <span aria-hidden="true">PRIVY CONFIGURATION REQUIRED</span>
          <p>Add VITE_PRIVY_APP_ID to .env.local and restart Vite.</p>
        </div>
      </section>
    );
  }

  return (
    <PrivyProvider
      appId={labConfig.privyAppId}
      clientId={labConfig.privyClientId || undefined}
      config={{
        appearance: { theme: "dark" },
        defaultChain: mainnet,
        embeddedWallets: {
          ethereum: {
            createOnLogin: "all-users",
          },
        },
        loginMethods: ["email", "google"],
        supportedChains: [mainnet],
      }}
    >
      <OffchainPanelContent />
    </PrivyProvider>
  );
};
