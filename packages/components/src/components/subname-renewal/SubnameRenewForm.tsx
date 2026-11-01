import {
  createOnchainClient,
  getOnchainDeployment,
  toOnchainError,
  type OnchainDeployment,
  type RenewalQuote,
  type TransactionCostEstimate,
} from "@thenamespace/onchain-subnames";
import { submitOnchainOperation } from "@/utils/submit-onchain-operation";
import { getPaymentAmounts } from "@/utils/onchain-payment-quotes";
import { useEffect, useMemo, useRef, useState } from "react";
import { type Hash, type PublicClient, zeroAddress } from "viem";
import { normalize } from "viem/ens";
import {
  useAccount,
  usePublicClient,
  useSwitchChain,
  useWalletClient,
} from "wagmi";
import { Text } from "@/components/atoms";
import { Alert, PricingDisplay, TokenSelect } from "@/components/molecules";
import { useEthDollarValue } from "@/hooks";
import { formatTokenAmount, paidFees, usdFromRaw } from "@/utils";
import { MIN_REGISTRATION_SECONDS, secondsFromYears } from "@/utils/date";
import { MintFormActions } from "../subname-mint-form/MintFormActions";
import { TransactionPendingScreen } from "../ens-name-registration/registration/TransactionPendingScreen";
import {
  ExpiryRows,
  formatExpiry,
  RENEW_DEBOUNCE_MS,
  RenewNameInput,
  RenewStatus,
  type RenewalSuccessData,
  RenewSuccess,
} from "../ens-name-renewal/RenewShared";

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
  const deployment = useMemo(
    () => getOnchainDeployment(props.isTestnet ? 11155111 : 1),
    [props.isTestnet]
  );
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
}: SubnameRenewFormProps & { deployment: OnchainDeployment }) => {
  const { chainId } = deployment;
  const { address, chain } = useAccount();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const publicClient = usePublicClient({ chainId }) as PublicClient | undefined;
  const { data: walletClient } = useWalletClient({ chainId });
  const onchainClient = useMemo(
    () =>
      publicClient ? createOnchainClient({ publicClient, chainId }) : null,
    [publicClient, chainId]
  );
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
    data: RenewalQuote | null;
    error: string | null;
  }>({ isChecking: false, data: null, error: null });
  const [payments, setPayments] = useState<Record<string, bigint>>({});
  const [fees, setFees] = useState<{
    isChecking: boolean;
    data: TransactionCostEstimate | null;
    error: string | null;
  }>({
    isChecking: false,
    data: null,
    error: null,
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
  const renewable =
    data?.status === "ready" &&
    data.account.toLowerCase() === address?.toLowerCase() &&
    !quote.isChecking;
  const isFree = data?.price?.amount === 0n;
  const amount = isFree ? 0n : payments[token.symbol];

  useEffect(() => {
    if (!onchainClient || label.length === 0) {
      setQuote({ isChecking: false, data: null, error: null });
      return;
    }
    let cancelled = false;
    setQuote(prev => ({ ...prev, isChecking: true, error: null }));
    const timer = setTimeout(async () => {
      try {
        const next = await onchainClient.getRenewalQuote({
          parentName,
          label,
          account: address,
          durationSeconds: duration,
        });
        const amounts = await getPaymentAmounts(onchainClient, next.price);
        if (cancelled) return;
        setPayments(amounts);
        setQuote({ isChecking: false, data: next, error: null });
        if (
          next.status !== "blocked" &&
          next.expiresAtSeconds !== null &&
          durationLabel.current !== label
        ) {
          durationLabel.current = label;
          setDurationSeconds(
            secondsFromYears(new Date(Number(next.expiresAtSeconds) * 1000), 1)
          );
        }
      } catch (e: any) {
        if (!cancelled)
          setQuote({
            isChecking: false,
            data: null,
            error: toOnchainError(e).message,
          });
      }
    }, RENEW_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [onchainClient, parentName, label, address, durationSeconds]);

  useEffect(() => {
    if (
      !publicClient ||
      !address ||
      !renewable ||
      data?.status !== "ready" ||
      !onchainClient ||
      amount === undefined
    ) {
      setFees({ isChecking: false, data: null, error: null });
      return;
    }
    let cancelled = false;
    setFees(prev => ({ ...prev, isChecking: true, error: null }));
    onchainClient
      .prepareRenewal({
        parentName,
        label,
        account: address,
        durationSeconds: duration,
        paymentToken: token.address,
        maxPriceUsd: data.price,
      })
      .then(operation => onchainClient.estimateTransactionCost(operation))
      .then(
        next =>
          !cancelled && setFees({ isChecking: false, data: next, error: null })
      )
      .catch(
        cause =>
          !cancelled &&
          setFees({
            isChecking: false,
            data: null,
            error: toOnchainError(cause).message,
          })
      );
    return () => {
      cancelled = true;
    };
  }, [
    onchainClient,
    publicClient,
    address,
    renewable,
    data,
    amount,
    tokenSymbol,
    parentName,
    label,
    duration,
  ]);

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
    if (
      !onchainClient ||
      !publicClient ||
      !walletClient ||
      !address ||
      data?.status !== "ready" ||
      !renewable
    )
      return;
    setError(null);
    setSending({
      isWaitingWallet: true,
      pending: false,
      txHash: null,
      completed: false,
    });
    try {
      const { operation, hashes } = await submitOnchainOperation({
        client: onchainClient,
        publicClient,
        walletClient,
        prepare: () =>
          onchainClient.prepareRenewal({
            parentName,
            label,
            account: address,
            durationSeconds: duration,
            paymentToken: token.address,
            maxPriceUsd: data.price,
          }),
        onProgress: ({ hash, call }) =>
          setSending({
            isWaitingWallet: false,
            pending: true,
            title: call?.title,
            txHash: hash,
            completed: false,
          }),
      });
      const txHash = hashes[hashes.length - 1];
      const transactionFees = await paidFees(publicClient, hashes);
      const result: RenewalSuccessData = {
        fullName,
        txHash,
        price:
          operation.payment.amount === 0n
            ? "0"
            : formatTokenAmount(
                operation.payment.amount,
                token.decimals,
                token.symbol
              ),
        priceCurrency: token.symbol,
        transactionFees,
        newExpiry: formatExpiry(operation.quote.newExpiresAtSeconds!),
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
      setError(
        toOnchainError(
          e,
          "The transaction failed. Check its receipt before trying again.",
          "TRANSACTION_FAILED"
        ).message
      );
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
        <TransactionPendingScreen
          hash={sending.txHash ?? undefined}
          isCompleted={sending.completed}
          chainId={chainId}
          details={[
            { label: "Name", value: fullName },
            { label: "Action", value: sending.title ?? "Renew Subname" },
          ]}
        />
      </div>
    );
  }

  const status = (() => {
    if (label.length === 0)
      return { tone: "idle" as const, message: "Enter the subname to renew" };
    if (!data) return { tone: "idle" as const, message: "" };
    if (data.status === "blocked")
      return { tone: "bad" as const, message: data.reason?.message ?? "" };
    const owner =
      data.owner && data.owner.toLowerCase() !== address?.toLowerCase()
        ? `, owned by ${shortAddress(data.owner)}`
        : "";
    return {
      tone:
        data.status === "account_required"
          ? ("idle" as const)
          : ("ok" as const),
      message: `${fullName} expires on ${formatExpiry(data.expiresAtSeconds!)}${owner}${data.status === "account_required" ? ". Connect a wallet to check renewal eligibility." : ""}`,
    };
  })();

  const newExpiry = data?.newExpiresAtSeconds ?? null;
  const outlivesParent =
    data?.status !== "blocked" &&
    newExpiry !== null &&
    data !== null &&
    data.parentExpiresAtSeconds !== null &&
    newExpiry > data.parentExpiresAtSeconds;
  const priceDisplay = isFree
    ? "Free"
    : amount === undefined
      ? "N/A"
      : formatTokenAmount(amount, token.decimals, token.symbol);
  const feeUnknown = Boolean(fees.error) || fees.data?.networkFeeWei == null;
  const feesDisplay = feeUnknown
    ? "N/A"
    : formatTokenAmount(fees.data?.networkFeeWei ?? 0n, 18, "ETH");
  const payingEth = token.address === zeroAddress || isFree;
  const totalDisplay = (() => {
    if (!payingEth) return priceDisplay;
    if (feeUnknown) return "N/A";
    const sum =
      (isFree || amount === undefined ? 0n : amount) +
      (fees.data?.networkFeeWei ?? 0n);
    return sum === 0n ? "Free" : formatTokenAmount(sum, 18, "ETH");
  })();
  const insufficient = Boolean(
    fees.data &&
    (fees.data.nativeBalanceShortfallWei > 0n ||
      fees.data.tokenBalanceShortfall > 0n)
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

      {data &&
        data.status !== "blocked" &&
        !quote.isChecking &&
        newExpiry !== null && (
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
                !isFree && !payingEth && data.price
                  ? usdFromRaw(data.price.amount)
                  : undefined
              }
              expiryPicker={{
                durationSeconds,
                onDurationChange: setDurationSeconds,
                minSeconds: MIN_REGISTRATION_SECONDS,
                startSeconds: Number(data.expiresAtSeconds),
              }}
            />
            <ExpiryRows current={data.expiresAtSeconds!} next={newExpiry} />
          </>
        )}

      {outlivesParent && data && (
        <div className="mt-2">
          <Alert variant="warning" position="vertical">
            <Text size="sm">
              {parentName} expires on{" "}
              {formatExpiry(data.parentExpiresAtSeconds!)}. {fullName} stops
              resolving then unless {parentName} is renewed too.
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
      {fees.error && (
        <div className="mt-2" data-testid="fee-error">
          <Alert variant="error" position="vertical">
            <Text size="sm">{fees.error}</Text>
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
            <Text size="sm" data-testid="insufficient-funds">
              Insufficient funds
            </Text>
          </Alert>
        </div>
      )}

      <MintFormActions
        actionLabel="Renew"
        onCancel={() => onCancel?.()}
        onMint={handleRenew}
        isMintDisabled={
          !renewable ||
          quote.isChecking ||
          fees.isChecking ||
          Boolean(fees.error) ||
          amount === undefined ||
          !walletClient ||
          insufficient
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
