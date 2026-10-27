import { useEffect, useState } from "react";
import { type Hash, type PublicClient } from "viem";
import { normalize } from "viem/ens";
import {
  useAccount,
  usePublicClient,
  useSwitchChain,
  useWalletClient,
} from "wagmi";
import { Text } from "@/components/atoms";
import {
  Alert,
  isUserDeniedError,
  PricingDisplay,
  TokenSelect,
} from "@/components/molecules";
import {
  createEnsReferer,
  formatTokenAmount,
  paidFees,
  sendCallsWithFallback,
} from "@/utils";
import { secondsFromYears } from "@/utils/date";
import { NAMESPACE_REFERRER_ADDRESS } from "@/hooks/useRegisterENS";
import { MintFormActions } from "../../subname-mint-form/MintFormActions";
import { TransactionPendingScreen } from "../../ens-name-registration/registration/TransactionPendingScreen";
import type { NameRenewFormProps } from "../NameRenewForm";
import {
  ExpiryRows,
  formatExpiry,
  labelFromName,
  MIN_ETH_LABEL_LENGTH,
  RENEW_DEBOUNCE_MS,
  RenewNameInput,
  RenewStatus,
  type RenewalSuccessData,
  RenewSuccess,
} from "../RenewShared";
import {
  buildEnsV2RenewCalls,
  type EnsV2RenewalDeployment,
  type EnsV2RenewalFees,
  type EnsV2RenewalTarget,
  estimateEnsV2RenewalFees,
  getEnsV2RenewalDeployment,
  getEnsV2RenewalTarget,
  getEnsV2RenewPrice,
  isZeroAddress,
} from "./ensv2-renew";

const shortAddress = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

export const NameRenewFormV2 = (props: NameRenewFormProps) => {
  const deployment = getEnsV2RenewalDeployment(Boolean(props.isTestnet));
  return (
    <div className={`ns-subname-mint-form ${props.className ?? ""}`}>
      <NameRenewFormV2Content {...props} deployment={deployment} />
    </div>
  );
};

const NameRenewFormV2Content = ({
  name,
  isTestnet = false,
  referrer,
  title,
  subtitle,
  onCancel,
  onConnectWallet,
  onRenewalSuccess,
  deployment,
}: NameRenewFormProps & { deployment: EnsV2RenewalDeployment }) => {
  const { chainId } = deployment;
  const { address, chain } = useAccount();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const publicClient = usePublicClient({ chainId }) as PublicClient | undefined;
  const { data: walletClient } = useWalletClient({ chainId });

  const [label, setLabel] = useState(labelFromName(name));
  const [durationSeconds, setDurationSeconds] = useState(() =>
    secondsFromYears(new Date(), 1)
  );
  const [tokenSymbol, setTokenSymbol] = useState(
    deployment.paymentTokens[0].symbol
  );
  const token =
    deployment.paymentTokens.find(t => t.symbol === tokenSymbol) ??
    deployment.paymentTokens[0];

  const [target, setTarget] = useState<{
    isChecking: boolean;
    data: EnsV2RenewalTarget | null;
    error: string | null;
  }>({ isChecking: false, data: null, error: null });
  const [prices, setPrices] = useState<{
    isChecking: boolean;
    bySymbol: Record<string, bigint>;
  }>({
    isChecking: false,
    bySymbol: {},
  });
  const [fees, setFees] = useState<{
    isChecking: boolean;
    data: EnsV2RenewalFees | null;
  }>({
    isChecking: false,
    data: null,
  });
  const [sending, setSending] = useState<{
    isWaitingWallet: boolean;
    pending: boolean;
    title?: string;
    txHash: Hash | null;
    completed: boolean;
  }>({
    isWaitingWallet: false,
    pending: false,
    txHash: null,
    completed: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<RenewalSuccessData | null>(null);

  const referrerHash = createEnsReferer(referrer ?? NAMESPACE_REFERRER_ADDRESS);
  const renewer = target.data?.renewer ?? null;
  const duration = BigInt(durationSeconds);
  const price = prices.bySymbol[token.symbol];

  useEffect(() => {
    if (!publicClient || label.length < MIN_ETH_LABEL_LENGTH) {
      setTarget({ isChecking: false, data: null, error: null });
      return;
    }
    let cancelled = false;
    setTarget(prev => ({ ...prev, isChecking: true, error: null }));
    const timer = setTimeout(async () => {
      try {
        const data = await getEnsV2RenewalTarget(
          publicClient,
          deployment,
          label
        );
        if (cancelled) return;
        setTarget({ isChecking: false, data, error: null });
        setDurationSeconds(
          secondsFromYears(new Date(Number(data.expiry) * 1000), 1)
        );
      } catch (e: any) {
        if (!cancelled)
          setTarget({
            isChecking: false,
            data: null,
            error: e?.shortMessage || "Couldn't check this name.",
          });
      }
    }, RENEW_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [publicClient, deployment, label]);

  useEffect(() => {
    if (!publicClient || !renewer) {
      setPrices({ isChecking: false, bySymbol: {} });
      return;
    }
    let cancelled = false;
    setPrices(prev => ({ ...prev, isChecking: true }));
    Promise.all(
      deployment.paymentTokens.map(t =>
        getEnsV2RenewPrice(publicClient, renewer, label, duration, t).catch(
          () => null
        )
      )
    ).then(amounts => {
      if (cancelled) return;
      setPrices({
        isChecking: false,
        bySymbol: Object.fromEntries(
          deployment.paymentTokens
            .map((t, i) => [t.symbol, amounts[i]] as const)
            .filter(([, amount]) => amount !== null)
        ) as Record<string, bigint>,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [publicClient, deployment, renewer, label, durationSeconds]);

  useEffect(() => {
    if (!publicClient || !address || !renewer || price === undefined) {
      setFees({ isChecking: false, data: null });
      return;
    }
    let cancelled = false;
    setFees(prev => ({ ...prev, isChecking: true }));
    buildEnsV2RenewCalls(publicClient, {
      renewer,
      label,
      duration,
      token,
      price,
      payer: address,
      referrer: referrerHash,
    })
      .then(calls =>
        estimateEnsV2RenewalFees(publicClient, {
          payer: address,
          calls,
          token,
          price,
        })
      )
      .then(data => !cancelled && setFees({ isChecking: false, data }))
      .catch(() => !cancelled && setFees({ isChecking: false, data: null }));
    return () => {
      cancelled = true;
    };
  }, [
    publicClient,
    address,
    renewer,
    label,
    durationSeconds,
    tokenSymbol,
    price,
  ]);

  const handleLabelChange = (value: string) => {
    const next = value
      .toLowerCase()
      .trim()
      .replace(/\.eth$/, "");
    if (next.includes(".")) return;
    try {
      normalize(next);
    } catch {
      return;
    }
    setLabel(next);
    setError(null);
  };

  const handleRenew = async () => {
    if (!publicClient || !walletClient || !address || !renewer) return;
    setError(null);
    setSending({
      isWaitingWallet: true,
      pending: false,
      txHash: null,
      completed: false,
    });
    try {
      const freshPrice = await getEnsV2RenewPrice(
        publicClient,
        renewer,
        label,
        duration,
        token
      );
      const calls = await buildEnsV2RenewCalls(publicClient, {
        renewer,
        label,
        duration,
        token,
        price: freshPrice,
        payer: address,
        referrer: referrerHash,
      });
      const hashes = await sendCallsWithFallback(
        walletClient,
        publicClient,
        calls,
        chainId,
        ({ hash, call }) =>
          setSending({
            isWaitingWallet: false,
            pending: true,
            title: call?.title,
            txHash: hash,
            completed: false,
          })
      );
      const txHash = hashes[hashes.length - 1];
      const [transactionFees, after] = await Promise.all([
        paidFees(publicClient, hashes),
        getEnsV2RenewalTarget(publicClient, deployment, label),
      ]);
      const data: RenewalSuccessData = {
        fullName: `${label}.eth`,
        txHash,
        price: formatTokenAmount(freshPrice, token.decimals, token.symbol),
        priceCurrency: token.symbol,
        transactionFees,
        newExpiry: formatExpiry(after.expiry),
      };
      setSending({
        isWaitingWallet: false,
        pending: true,
        txHash,
        completed: true,
      });
      setSuccess(data);
      onRenewalSuccess?.(data);
    } catch (e: any) {
      if (!isUserDeniedError(e))
        setError(e?.shortMessage || e?.message || "Something went wrong");
      setSending({
        isWaitingWallet: false,
        pending: false,
        txHash: null,
        completed: false,
      });
    }
  };

  const reset = () => {
    setLabel(labelFromName(name));
    setSuccess(null);
    setError(null);
    setSending({
      isWaitingWallet: false,
      pending: false,
      txHash: null,
      completed: false,
    });
  };

  if (success && sending.completed) {
    return (
      <RenewSuccess
        data={success}
        chainId={chainId}
        isTestnet={isTestnet}
        onClose={onCancel}
        onRenewAnother={name ? undefined : reset}
      />
    );
  }

  if (sending.pending) {
    return (
      <div style={{ padding: 15 }}>
        <TransactionPendingScreen
          hash={sending.txHash ?? undefined}
          isCompleted={sending.completed}
          chainId={chainId}
          details={[
            { label: "Name", value: `${label}.eth` },
            { label: "Action", value: sending.title ?? "Renew Name" },
          ]}
        />
      </div>
    );
  }

  const data = target.data;
  const status = (() => {
    if (label.length < MIN_ETH_LABEL_LENGTH)
      return {
        tone: "idle" as const,
        message: `Names are at least ${MIN_ETH_LABEL_LENGTH} characters`,
      };
    if (!data) return { tone: "idle" as const, message: "" };
    if (!data.renewer)
      return {
        tone: "bad" as const,
        message: `${label}.eth can't be renewed. It isn't registered, or its grace period has ended.`,
      };
    const owner =
      !isZeroAddress(data.owner) &&
      data.owner.toLowerCase() !== address?.toLowerCase()
        ? `, owned by ${shortAddress(data.owner)}`
        : "";
    if (data.inGrace)
      return {
        tone: "soon" as const,
        message: `${label}.eth expired on ${formatExpiry(data.expiry)} and is in its grace period${owner}`,
      };
    return {
      tone: "ok" as const,
      message: `${label}.eth expires on ${formatExpiry(data.expiry)}${owner}`,
    };
  })();

  const priceDisplay =
    price === undefined
      ? "N/A"
      : formatTokenAmount(price, token.decimals, token.symbol);
  const feesDisplay =
    fees.data?.feeWei == null
      ? "N/A"
      : formatTokenAmount(fees.data.feeWei, 18, "ETH");
  const insufficient = Boolean(
    fees.data &&
    (fees.data.shortfallEthWei > 0n || fees.data.shortfallToken > 0n)
  );

  return (
    <div style={{ padding: 15 }}>
      <div className="ns-text-center mb-3">
        <Text weight="bold" size="lg">
          {title || "Renew Your ENS Name"}
        </Text>
        {subtitle && (
          <Text color="grey" size="sm" className="mt-1">
            {subtitle}
          </Text>
        )}
      </div>

      <div className="mt-3">
        <RenewNameInput
          value={label}
          suffix=".eth"
          disabled={Boolean(name) || sending.isWaitingWallet}
          onChange={handleLabelChange}
        />
        <RenewStatus
          isChecking={target.isChecking}
          tone={status.tone}
          message={status.message}
        />
      </div>

      {renewer && data && !target.isChecking && (
        <>
          <PricingDisplay
            currency={token.symbol}
            paymentTokenPicker={
              <TokenSelect
                inline
                value={token.symbol}
                onChange={setTokenSymbol}
                options={deployment.paymentTokens
                  .filter(t => prices.bySymbol[t.symbol] !== undefined)
                  .map(t => ({
                    symbol: t.symbol,
                    amount: formatTokenAmount(
                      prices.bySymbol[t.symbol],
                      t.decimals,
                      t.symbol
                    ),
                  }))}
              />
            }
            primaryFee={{
              label: "Renewal fee",
              amount: priceDisplay,
              isChecking: prices.isChecking,
            }}
            networkFees={{ amount: feesDisplay, isChecking: fees.isChecking }}
            total={{ amount: priceDisplay, isChecking: prices.isChecking }}
            expiryPicker={{
              durationSeconds,
              onDurationChange: setDurationSeconds,
              startSeconds: Number(data.expiry),
            }}
          />
          <ExpiryRows current={data.expiry} next={data.expiry + duration} />
        </>
      )}

      {target.error && (
        <div className="mt-2">
          <Alert variant="error" position="vertical">
            <Text size="sm">{target.error}</Text>
          </Alert>
        </div>
      )}
      {error && (
        <div className="mt-2">
          <Alert variant="error" position="vertical">
            <Text size="sm">{error}</Text>
          </Alert>
        </div>
      )}
      {insufficient && (
        <div className="mt-2">
          <Alert variant="warning">
            <Text size="sm" data-testid="insufficient-funds">Insufficient funds</Text>
          </Alert>
        </div>
      )}

      <MintFormActions
        actionLabel="Renew"
        onCancel={() => onCancel?.()}
        onMint={handleRenew}
        isMintDisabled={
          !renewer ||
          price === undefined ||
          !walletClient ||
          insufficient ||
          target.isChecking
        }
        isWaitingWallet={sending.isWaitingWallet}
        needsChainSwitch={chain?.id !== chainId}
        chainName={chainId === 11155111 ? "Sepolia" : "Ethereum"}
        onSwitchChain={() => switchChain?.({ chainId })}
        isSwitchingChain={isSwitchingChain}
        isConnected={!!address}
        onConnectWallet={onConnectWallet}
      />
    </div>
  );
};
