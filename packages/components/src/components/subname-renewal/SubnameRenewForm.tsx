import { useEffect, useRef, useState } from "react";
import { type Hash, type PublicClient, zeroAddress } from "viem";
import { normalize } from "viem/ens";
import {
  useAccount,
  usePublicClient,
  useSwitchChain,
  useWalletClient,
} from "wagmi";
import { ShurikenSpinner, Text } from "@/components/atoms";
import {
  Alert,
  isUserDeniedError,
  PricingDisplay,
  TokenSelect,
} from "@/components/molecules";
import { useEthDollarValue } from "@/hooks";
import {
  formatTokenAmount,
  paidFees,
  sendCallsWithFallback,
  usdFromRaw,
} from "@/utils";
import { MIN_REGISTRATION_SECONDS, secondsFromYears } from "@/utils/date";
import { MintFormActions } from "../subname-mint-form/MintFormActions";
import { TransactionPendingScreen } from "../ens-name-registration/registration/TransactionPendingScreen";
import {
  type EnsV2Deployment,
  type EnsV2MintFees,
  estimateEnsV2MintFees,
  getEnsV2Deployment,
  quoteEnsV2Payment,
} from "../subname-mint-form/v2/ensv2-mint";
import {
  ExpiryRows,
  formatExpiry,
  RENEW_DEBOUNCE_MS,
  RenewNameInput,
  RenewStatus,
  type RenewalSuccessData,
  RenewSuccess,
} from "../ens-name-renewal/RenewShared";
import {
  type EnsV2RenewalQuote,
  prepareEnsV2RenewCalls,
  quoteEnsV2Renewal,
} from "./ensv2-subname-renew";

export interface SubnameRenewFormProps {
  /** Activated parent, e.g. "alice.eth". */
  parentName: string;
  /** Leave empty to let the user type the subname label. */
  label?: string;
  isTestnet?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
  noBorder?: boolean;
  onCancel?: () => void;
  onConnectWallet?: () => void;
  onRenewalSuccess?: (data: RenewalSuccessData) => void;
  /** Renders a link to renew the parent when the subname would outlive it. */
  onRenewParent?: () => void;
}

const shortAddress = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

export const SubnameRenewForm = (props: SubnameRenewFormProps) => {
  const deployment = getEnsV2Deployment(Boolean(props.isTestnet));
  if (!deployment) {
    return (
      <div className="ns-subname-mint-form">
        <Alert variant="error" position="vertical">
          <Text size="sm">
            Subname renewals are only available on Sepolia for now.
          </Text>
        </Alert>
      </div>
    );
  }
  return (
    <div
      className={`ns-subname-mint-form ${props.className ?? ""} ${props.noBorder ? "ns-no-border" : ""}`}
    >
      <SubnameRenewFormContent {...props} deployment={deployment} />
    </div>
  );
};

const SubnameRenewFormContent = ({
  parentName,
  label: initialLabel,
  isTestnet = false,
  title,
  subtitle,
  onCancel,
  onConnectWallet,
  onRenewalSuccess,
  onRenewParent,
  deployment,
}: SubnameRenewFormProps & { deployment: EnsV2Deployment }) => {
  const { chainId } = deployment;
  const { address, chain } = useAccount();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const publicClient = usePublicClient({ chainId }) as PublicClient | undefined;
  const { data: walletClient } = useWalletClient({ chainId });
  const { ethUsdRate } = useEthDollarValue();

  const [label, setLabel] = useState(initialLabel ?? "");
  const [durationSeconds, setDurationSeconds] = useState(() =>
    secondsFromYears(new Date(), 1)
  );
  const [tokenSymbol, setTokenSymbol] = useState(
    deployment.paymentTokens[0].symbol
  );
  const token =
    deployment.paymentTokens.find(t => t.symbol === tokenSymbol) ??
    deployment.paymentTokens[0];

  const [quote, setQuote] = useState<{
    isChecking: boolean;
    data: EnsV2RenewalQuote | null;
    error: string | null;
  }>({ isChecking: false, data: null, error: null });
  const [payments, setPayments] = useState<Record<string, bigint>>({});
  const [fees, setFees] = useState<{
    isChecking: boolean;
    data: EnsV2MintFees | null;
    failed: boolean;
  }>({
    isChecking: false,
    data: null,
    failed: false,
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

  const durationLabel = useRef<string | null>(null);
  const fullName = `${label}.${parentName}`;
  const duration = BigInt(durationSeconds);
  const data = quote.data;
  const renewable = Boolean(data?.renewable) && !quote.isChecking;
  const isFree = renewable && data?.priceUsdRaw === 0n;
  const amount = isFree ? 0n : payments[token.symbol];

  useEffect(() => {
    if (!publicClient || label.length === 0) {
      setQuote({ isChecking: false, data: null, error: null });
      return;
    }
    let cancelled = false;
    setQuote(prev => ({ ...prev, isChecking: true, error: null }));
    const timer = setTimeout(async () => {
      try {
        const next = await quoteEnsV2Renewal(publicClient, deployment, {
          parentName,
          label,
          renewer: address ?? zeroAddress,
          duration,
        });
        const amounts = await Promise.all(
          deployment.paymentTokens.map(t =>
            quoteEnsV2Payment(
              publicClient,
              deployment,
              next.priceUsdRaw,
              t
            ).catch(() => null)
          )
        );
        if (cancelled) return;
        setPayments(
          Object.fromEntries(
            deployment.paymentTokens
              .map((t, i) => [t.symbol, amounts[i]] as const)
              .filter(([, value]) => value !== null)
          ) as Record<string, bigint>
        );
        setQuote({ isChecking: false, data: next, error: null });
        if (next.expiry !== null && durationLabel.current !== label) {
          durationLabel.current = label;
          setDurationSeconds(
            secondsFromYears(new Date(Number(next.expiry) * 1000), 1)
          );
        }
      } catch (e: any) {
        if (!cancelled)
          setQuote({
            isChecking: false,
            data: null,
            error: e?.shortMessage || "Couldn't price this renewal.",
          });
      }
    }, RENEW_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [publicClient, deployment, parentName, label, address, durationSeconds]);

  useEffect(() => {
    if (
      !publicClient ||
      !address ||
      !renewable ||
      !data ||
      amount === undefined
    ) {
      setFees({ isChecking: false, data: null, failed: false });
      return;
    }
    let cancelled = false;
    setFees(prev => ({ ...prev, isChecking: true, failed: false }));
    prepareEnsV2RenewCalls(publicClient, deployment, {
      parentName,
      label,
      payer: address,
      duration,
      token,
      amount,
      extraData: data.extraData,
    })
      .then(calls =>
        estimateEnsV2MintFees(publicClient, address, calls, { token, amount })
      )
      .then(
        next =>
          !cancelled &&
          setFees({ isChecking: false, data: next, failed: false })
      )
      .catch(
        () =>
          !cancelled && setFees({ isChecking: false, data: null, failed: true })
      );
    return () => {
      cancelled = true;
    };
  }, [publicClient, address, renewable, data, amount, tokenSymbol]);

  const handleLabelChange = (value: string) => {
    const next = value.toLowerCase().trim();
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
    if (!publicClient || !walletClient || !address || !data || !renewable)
      return;
    setError(null);
    setSending({
      isWaitingWallet: true,
      pending: false,
      txHash: null,
      completed: false,
    });
    try {
      const fresh = await quoteEnsV2Renewal(publicClient, deployment, {
        parentName,
        label,
        renewer: address,
        duration,
      });
      if (!fresh.renewable)
        throw new Error(
          fresh.blockedMessage ?? "This subname can't be renewed."
        );
      const freshAmount = await quoteEnsV2Payment(
        publicClient,
        deployment,
        fresh.priceUsdRaw,
        token
      );
      const calls = await prepareEnsV2RenewCalls(publicClient, deployment, {
        parentName,
        label,
        payer: address,
        duration,
        token,
        amount: freshAmount,
        extraData: fresh.extraData,
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
      const transactionFees = await paidFees(publicClient, hashes);
      const result: RenewalSuccessData = {
        fullName,
        txHash,
        price:
          freshAmount === 0n
            ? "0"
            : formatTokenAmount(freshAmount, token.decimals, token.symbol),
        priceCurrency: token.symbol,
        transactionFees,
        newExpiry: formatExpiry((fresh.expiry ?? 0n) + duration),
      };
      setSending({
        isWaitingWallet: false,
        pending: true,
        txHash,
        completed: true,
      });
      setSuccess(result);
      onRenewalSuccess?.(result);
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
    setLabel(initialLabel ?? "");
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
        onRenewAnother={initialLabel ? undefined : reset}
      />
    );
  }

  if (sending.pending) {
    return (
      <div style={{ padding: 15 }}>
        <Text className="ns-text-center mb-3" weight="bold">
          {sending.title ?? `Renewing ${fullName}`}
        </Text>
        <TransactionPendingScreen
          hash={sending.txHash ?? undefined}
          isCompleted={sending.completed}
          chainId={chainId}
          message="Your subname is being renewed!"
        />
      </div>
    );
  }

  const status = (() => {
    if (label.length === 0)
      return { tone: "idle" as const, message: "Enter the subname to renew" };
    if (!data) return { tone: "idle" as const, message: "" };
    if (!data.renewable)
      return { tone: "bad" as const, message: data.blockedMessage ?? "" };
    const owner =
      data.owner.toLowerCase() !== address?.toLowerCase()
        ? `, owned by ${shortAddress(data.owner)}`
        : "";
    return {
      tone: "ok" as const,
      message: `${fullName} expires on ${formatExpiry(data.expiry!)}${owner}`,
    };
  })();

  const newExpiry = data?.expiry != null ? data.expiry + duration : null;
  const outlivesParent =
    renewable &&
    newExpiry !== null &&
    data !== null &&
    newExpiry > data.parentExpiry;
  const priceDisplay = isFree
    ? "Free"
    : amount === undefined
      ? "N/A"
      : formatTokenAmount(amount, token.decimals, token.symbol);
  const feeUnknown = fees.failed || fees.data?.feeWei === null;
  const feesDisplay = feeUnknown
    ? "N/A"
    : formatTokenAmount(fees.data?.feeWei ?? 0n, 18, "ETH");
  const payingEth = token.address === zeroAddress || isFree;
  const totalDisplay = (() => {
    if (!payingEth || feeUnknown) return priceDisplay;
    const sum =
      (isFree || amount === undefined ? 0n : amount) +
      (fees.data?.feeWei ?? 0n);
    return sum === 0n ? "Free" : formatTokenAmount(sum, 18, "ETH");
  })();
  const insufficient = Boolean(
    fees.data &&
    (fees.data.shortfallEthWei > 0n || fees.data.shortfallToken > 0n)
  );

  return (
    <div style={{ padding: 15 }}>
      <div className="ns-text-center mb-3">
        <Text weight="bold" size="lg">
          {title || "Renew Your Subname"}
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
          suffix={`.${parentName}`}
          disabled={Boolean(initialLabel) || sending.isWaitingWallet}
          onChange={handleLabelChange}
        />
        <RenewStatus
          isChecking={quote.isChecking}
          tone={status.tone}
          message={status.message}
        />
      </div>

      {renewable && data && newExpiry !== null && (
        <>
          <PricingDisplay
            currency={isFree ? undefined : token.symbol}
            paymentTokenPicker={
              isFree ? undefined : (
                <TokenSelect
                  inline
                  value={token.symbol}
                  onChange={setTokenSymbol}
                  options={deployment.paymentTokens
                    .filter(t => payments[t.symbol] !== undefined)
                    .map(t => ({
                      symbol: t.symbol,
                      amount: formatTokenAmount(
                        payments[t.symbol],
                        t.decimals,
                        t.symbol
                      ),
                    }))}
                />
              )
            }
            primaryFee={{
              label: "Renewal fee",
              amount: priceDisplay,
              isChecking: quote.isChecking,
            }}
            networkFees={{ amount: feesDisplay, isChecking: fees.isChecking }}
            total={{
              amount: totalDisplay,
              isChecking: quote.isChecking || (payingEth && fees.isChecking),
            }}
            ethUsdRate={ethUsdRate}
            totalUsd={
              !isFree && !payingEth ? usdFromRaw(data.priceUsdRaw) : undefined
            }
            expiryPicker={{
              durationSeconds,
              onDurationChange: setDurationSeconds,
              minSeconds: MIN_REGISTRATION_SECONDS,
              startSeconds: Number(data.expiry),
            }}
          />
          <ExpiryRows current={data.expiry!} next={newExpiry} />
        </>
      )}

      {outlivesParent && data && (
        <div className="mt-2">
          <Alert variant="warning" position="vertical">
            <Text size="sm">
              {parentName} expires on {formatExpiry(data.parentExpiry)}.{" "}
              {fullName} stops resolving then unless {parentName} is renewed
              too.
            </Text>
            {onRenewParent && (
              <Text size="sm" className="mt-1">
                <a
                  href="#"
                  onClick={e => (e.preventDefault(), onRenewParent())}
                >
                  Renew {parentName}
                </a>
              </Text>
            )}
          </Alert>
        </div>
      )}

      {quote.error && (
        <div className="mt-2" data-testid="form-error">
          <Alert variant="error" position="vertical">
            <Text size="sm">{quote.error}</Text>
          </Alert>
        </div>
      )}
      {error && (
        <div className="mt-2" data-testid="form-error">
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
      {sending.isWaitingWallet && (
        <div className="d-flex justify-content-center mt-2">
          <ShurikenSpinner size={16} />
        </div>
      )}

      <MintFormActions
        actionLabel="Renew"
        onCancel={() => onCancel?.()}
        onMint={handleRenew}
        isMintDisabled={
          !renewable || amount === undefined || !walletClient || insufficient
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
