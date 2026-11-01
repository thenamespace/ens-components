import { useEffect, useMemo, useState } from "react";
import {
  createOnchainClient,
  getOnchainDeployment,
  SECONDS_PER_YEAR,
  toOnchainError,
  type OnchainDeployment,
  type RegistrationQuote,
  type TransactionCostEstimate,
} from "@thenamespace/onchain-subnames";
import { submitOnchainOperation } from "@/utils/submit-onchain-operation";
import { getPaymentAmounts } from "@/utils/onchain-payment-quotes";
import { Button, Text } from "@/components/atoms";
import { PricingDisplay, Alert, TokenSelect } from "@/components/molecules";
import {
  useAccount,
  usePublicClient,
  useSwitchChain,
  useWalletClient,
} from "wagmi";
import { type Address, type Hash, type PublicClient, zeroAddress } from "viem";
import { normalize } from "viem/ens";
import {
  deepCopy,
  detectResolverStyle,
  formatTokenAmount as formatAmount,
  getEnsRecordsDiff,
  paidFees,
  type ResolverStyle,
  usdFromRaw,
} from "@/utils";
import { useEthDollarValue } from "@/hooks";
import { secondsFromYears } from "@/utils/date";
import type { EnsRecords } from "@/types";
import { SetSubnameRecords } from "../SetSubnameRecords";
import { NameAvailabilityInput } from "../NameAvailabilityInput";
import { ProfileSelector } from "../ProfileSelector";
import { MintFormActions } from "../MintFormActions";
import { MintSuccess } from "../MintSuccess";
import { TransactionPendingScreen } from "../../ens-name-registration/registration/TransactionPendingScreen";
import type { MintSuccessData, SubnameMintedData } from "../SubnameMintForm";
import {
  type RegistrationResolver,
  prepareRegistrationWithRecords,
  canSetRecordsDuringRegistration,
} from "./registration";
import "../SubnameMintForm.css";

const MIN_ENS_LEN = 1;
const QUOTE_DEBOUNCE_MS = 500;

export interface SubnameMintFormV2Props {
  parentName: string;
  label?: string;
  isTestnet?: boolean;
  avatarUploadDomain?: string;
  title?: string;
  subtitle?: string;
  onCancel?: () => void;
  onSuccess?: (data: MintSuccessData) => void;
  onSubnameMinted?: (data: SubnameMintedData) => void;
  txConfirmations?: number;
  onConnectWallet?: () => void;
  resolver?: Address;
}

export const SubnameMintFormV2 = (props: SubnameMintFormV2Props) => {
  const deployment = useMemo(
    () => getOnchainDeployment(props.isTestnet ? 11155111 : 1),
    [props.isTestnet]
  );
  return (
    <div className="ns-subname-mint-form">
      <SubnameMintFormV2Content {...props} deployment={deployment} />
    </div>
  );
};

const SubnameMintFormV2Content = ({
  parentName,
  label: initialLabel,
  isTestnet = false,
  avatarUploadDomain,
  title,
  subtitle,
  onCancel,
  onSuccess,
  onSubnameMinted,
  onConnectWallet,
  resolver: resolverProp,
  deployment,
}: SubnameMintFormV2Props & { deployment: OnchainDeployment }) => {
  const { chainId } = deployment;
  const { address: connectedAddress, chain: currentChain } = useAccount();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const publicClient = usePublicClient({ chainId }) as PublicClient | undefined;
  const { data: walletClient } = useWalletClient({ chainId });
  const onchainClient = useMemo(
    () =>
      publicClient ? createOnchainClient({ publicClient, chainId }) : null,
    [publicClient, chainId]
  );
  const { ethUsdRate } = useEthDollarValue();

  const needsChainSwitch = currentChain?.id !== chainId;

  const [label, setLabel] = useState(initialLabel || "");
  const [showProfile, setShowProfile] = useState(false);
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
    data: RegistrationQuote | null;
    error: string | null;
  }>({ isChecking: false, data: null, error: null });
  const [payments, setPayments] = useState<Record<string, bigint>>({});
  const [quoteAttempt, setQuoteAttempt] = useState(0);
  const [parentResolver, setParentResolver] = useState<
    Address | null | undefined
  >(undefined);

  const [ensRecordTemplate, setEnsRecordsTemplate] = useState<EnsRecords>({
    addresses: [],
    texts: [],
  });
  const [ensRecords, setEnsRecords] = useState<EnsRecords>({
    addresses: [],
    texts: [],
  });
  const hasRecordsDifference = useMemo(
    () => getEnsRecordsDiff(ensRecords, ensRecordTemplate).isDifferent,
    [ensRecords, ensRecordTemplate]
  );
  const resolverAddress =
    parentResolver === undefined
      ? null
      : (parentResolver ?? resolverProp ?? deployment.sharedResolver);
  const isDefaultResolver =
    resolverAddress?.toLowerCase() === deployment.sharedResolver.toLowerCase();
  const [resolverStyle, setResolverStyle] = useState<ResolverStyle | null>(
    null
  );
  const [customRecordsWritable, setCustomRecordsWritable] = useState<
    boolean | null
  >(null);
  const mintResolver = useMemo<RegistrationResolver | null>(
    () =>
      resolverAddress && resolverStyle
        ? {
            address: resolverAddress,
            style: resolverStyle,
          }
        : null,
    [resolverAddress, resolverStyle]
  );
  const canSetRecords =
    mintResolver !== null &&
    (isDefaultResolver || customRecordsWritable === true);

  const [minting, setMinting] = useState<{
    isWaitingWallet: boolean;
    pending?: boolean;
    title?: string;
    txHash: Hash | null;
    completed: boolean;
  }>({ isWaitingWallet: false, txHash: null, completed: false });
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<MintSuccessData | null>(null);

  useEffect(() => {
    setParentResolver(undefined);
    if (!onchainClient) return;
    let cancelled = false;
    onchainClient
      .getRegistrationResolver(parentName, resolverProp)
      .then(resolver => {
        if (!cancelled) setParentResolver(resolver);
      })
      .catch(cause => {
        if (!cancelled) setError(toOnchainError(cause).message);
      });
    return () => {
      cancelled = true;
    };
  }, [onchainClient, parentName, resolverProp, quoteAttempt]);

  useEffect(() => {
    if (!resolverAddress || !publicClient) {
      setResolverStyle(null);
      return;
    }
    detectResolverStyle(publicClient, resolverAddress)
      .then(setResolverStyle)
      .catch(() => setResolverStyle(null));
  }, [resolverAddress, publicClient]);

  const duration =
    quote.data?.expirationType === "permanent"
      ? SECONDS_PER_YEAR
      : BigInt(durationSeconds);

  useEffect(() => {
    if (!onchainClient || label.length < MIN_ENS_LEN) {
      setQuote({ isChecking: false, data: null, error: null });
      return;
    }
    let cancelled = false;
    setQuote(prev => ({ ...prev, isChecking: true, error: null }));
    const timer = setTimeout(async () => {
      try {
        const data = await onchainClient.getRegistrationQuote({
          parentName,
          label,
          account: connectedAddress,
          durationSeconds: BigInt(durationSeconds),
        });
        const amounts = await getPaymentAmounts(onchainClient, data.price);
        if (cancelled) return;
        setPayments(amounts);
        setQuote({ isChecking: false, data, error: null });
      } catch (e: any) {
        if (cancelled) return;
        setQuote({
          isChecking: false,
          data: null,
          error: toOnchainError(e).message,
        });
      }
    }, QUOTE_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    onchainClient,
    parentName,
    label,
    connectedAddress,
    durationSeconds,
    quoteAttempt,
  ]);

  useEffect(() => {
    const q = quote.data;
    if (
      !mintResolver ||
      isDefaultResolver ||
      !publicClient ||
      !connectedAddress ||
      !onchainClient ||
      q?.status !== "ready" ||
      quote.isChecking
    ) {
      setCustomRecordsWritable(null);
      return;
    }
    let cancelled = false;
    canSetRecordsDuringRegistration(publicClient, onchainClient, {
      parentName,
      label,
      account: connectedAddress,
      durationSeconds: q.durationSeconds,
      maxPriceUsd: q.price,
      recordResolver: mintResolver,
      resolver: resolverProp ?? zeroAddress,
      paymentToken: zeroAddress,
    })
      .then(writable => {
        if (!cancelled) setCustomRecordsWritable(writable);
      })
      .catch(cause => {
        if (!cancelled) {
          setCustomRecordsWritable(false);
          setError(toOnchainError(cause).message);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [
    mintResolver,
    isDefaultResolver,
    publicClient,
    onchainClient,
    resolverProp,
    connectedAddress,
    quote.data,
    quote.isChecking,
    deployment,
    parentName,
    label,
    durationSeconds,
  ]);

  const [fees, setFees] = useState<{
    isChecking: boolean;
    data: TransactionCostEstimate | null;
    failed: boolean;
    error?: string;
  }>({ isChecking: false, data: null, failed: false });

  const quoteReady = Boolean(
    quote.data?.status === "ready" &&
    quote.data.account.toLowerCase() === connectedAddress?.toLowerCase() &&
    !quote.isChecking
  );
  const paymentAmount = payments[tokenSymbol];
  const needsAmount = quote.data?.price?.amount !== 0n;

  useEffect(() => {
    if (
      !publicClient ||
      !connectedAddress ||
      !mintResolver ||
      !quoteReady ||
      quote.data?.status !== "ready" ||
      !onchainClient ||
      (needsAmount && paymentAmount === undefined)
    ) {
      setFees({ isChecking: false, data: null, failed: false });
      return;
    }
    let cancelled = false;
    setFees(prev => ({ ...prev, isChecking: true, failed: false }));
    const currentQuote = quote.data;
    const run = async () => {
      try {
        const operation = await prepareRegistrationWithRecords(onchainClient, {
          parentName,
          label,
          account: connectedAddress,
          durationSeconds: currentQuote.durationSeconds,
          paymentToken: token.address,
          maxPriceUsd: currentQuote.price,
          records: canSetRecords ? ensRecords : { addresses: [], texts: [] },
          recordResolver: mintResolver,
          resolver: resolverProp ?? zeroAddress,
        });
        const data = await onchainClient.estimateTransactionCost(operation);
        if (!cancelled) setFees({ isChecking: false, data, failed: false });
      } catch (cause) {
        if (!cancelled)
          setFees({
            isChecking: false,
            data: null,
            failed: true,
            error: toOnchainError(cause).message,
          });
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [
    publicClient,
    onchainClient,
    resolverProp,
    parentName,
    connectedAddress,
    quoteReady,
    quote.data,
    label,
    paymentAmount,
    needsAmount,
    tokenSymbol,
    durationSeconds,
    ensRecords,
    mintResolver,
    canSetRecords,
  ]);

  const handleNameChanged = (value: string) => {
    const next = value.toLowerCase().trim();
    if (next.includes(".")) return;
    try {
      normalize(next);
    } catch {
      return;
    }
    setLabel(next);
  };

  const data = quote.data;
  const blockingMessage =
    data?.status === "blocked" ? data.reason.message : null;
  const showQuote = Boolean(
    data && data.status !== "blocked" && !quote.isChecking
  );
  const isAvailableForMint = quoteReady;
  const amount = payments[token.symbol];
  const isFree = data?.price?.amount === 0n;
  const priceDisplay = isFree
    ? "Free"
    : amount === undefined
      ? "N/A"
      : formatAmount(amount, token.decimals, token.symbol);

  const feeUnknown = fees.failed || fees.data?.networkFeeWei == null;
  const feesDisplay = feeUnknown
    ? "N/A"
    : formatAmount(fees.data?.networkFeeWei ?? 0n, 18, "ETH");
  const payingEth = token.symbol === "ETH" || isFree;
  const totalDisplay = (() => {
    if (!payingEth) return priceDisplay;
    if (feeUnknown) return "N/A";
    const sum =
      (isFree || amount === undefined ? 0n : amount) +
      (fees.data?.networkFeeWei ?? 0n);
    return sum === 0n ? "Free" : formatAmount(sum, 18, "ETH");
  })();
  const hasInsufficientFunds = Boolean(
    fees.data &&
    (fees.data.nativeBalanceShortfallWei > 0n ||
      fees.data.tokenBalanceShortfall > 0n)
  );

  const handleMint = async () => {
    const resolver = mintResolver;
    if (
      data?.status !== "ready" ||
      quote.isChecking ||
      !onchainClient ||
      !publicClient ||
      !walletClient ||
      !connectedAddress ||
      !resolver
    )
      return;
    if (amount === undefined && !isFree) return;
    setError(null);

    setMinting({ isWaitingWallet: true, txHash: null, completed: false });

    try {
      const { operation, hashes } = await submitOnchainOperation({
        client: onchainClient,
        publicClient,
        walletClient,
        prepare: () =>
          prepareRegistrationWithRecords(onchainClient, {
            parentName,
            label,
            account: connectedAddress,
            durationSeconds: duration,
            paymentToken: token.address,
            maxPriceUsd: data.price,
            records: canSetRecords ? ensRecords : { addresses: [], texts: [] },
            recordResolver: resolver,
            resolver: resolverProp ?? zeroAddress,
          }),
        onProgress: ({ hash, call }) =>
          setMinting({
            isWaitingWallet: false,
            pending: true,
            title: call?.title,
            txHash: hash,
            completed: false,
          }),
      });
      const hash = hashes[hashes.length - 1];
      const transactionFees = await paidFees(publicClient, hashes);
      setMinting({
        isWaitingWallet: false,
        pending: true,
        txHash: hash,
        completed: true,
      });

      const price =
        operation.payment.amount === 0n
          ? "0"
          : formatAmount(
              operation.payment.amount,
              token.decimals,
              token.symbol
            );
      const success: MintSuccessData = {
        fullName: `${label}.${parentName}`,
        label,
        parentName,
        txHash: hash,
        price,
        priceCurrency: token.symbol,
        transactionFees,
        records: ensRecords,
      };
      setSuccessData(success);
      onSuccess?.(success);
      onSubnameMinted?.({
        label,
        parentName,
        fullSubname: `${label}.${parentName}`,
        records: ensRecords,
        price,
        transactionFees,
        ownerAddress: connectedAddress,
        txHash: hash,
        chainId,
      });
    } catch (e: any) {
      setError(
        toOnchainError(
          e,
          "The transaction failed. Check its receipt before trying again.",
          "TRANSACTION_FAILED"
        ).message
      );
      setMinting({ isWaitingWallet: false, txHash: null, completed: false });
    }
  };

  const handleMintAnother = () => {
    setLabel("");
    setEnsRecords({ addresses: [], texts: [] });
    setEnsRecordsTemplate({ addresses: [], texts: [] });
    setSuccessData(null);
    setError(null);
    setMinting({ isWaitingWallet: false, txHash: null, completed: false });
  };

  if (successData && minting.completed) {
    return (
      <MintSuccess
        data={successData}
        chainId={chainId}
        isTestnet={isTestnet}
        onClose={onCancel}
        onMintAnother={handleMintAnother}
      />
    );
  }

  if (minting.pending) {
    return (
      <div style={{ padding: 15 }}>
        <TransactionPendingScreen
          hash={minting.txHash ?? undefined}
          isCompleted={minting.completed}
          chainId={chainId}
          details={[
            { label: "Name", value: `${label}.${parentName}` },
            { label: "Action", value: minting.title ?? "Register Subname" },
          ]}
        />
      </div>
    );
  }

  if (showProfile) {
    return (
      <SetSubnameRecords
        records={ensRecordTemplate}
        onRecordsChange={setEnsRecordsTemplate}
        onCancel={() => {
          setEnsRecordsTemplate(deepCopy(ensRecords));
          setShowProfile(false);
        }}
        onSave={() => {
          setEnsRecords(deepCopy(ensRecordTemplate));
          setShowProfile(false);
        }}
        hasChanges={hasRecordsDifference}
        avatarUpload={
          label
            ? {
                ensName: `${label}.${parentName}`,
                isTestnet,
                siweDomain: avatarUploadDomain,
              }
            : undefined
        }
      />
    );
  }

  return (
    <div style={{ padding: 15 }}>
      <div className="ns-text-center mb-3">
        <Text weight="bold" size="lg">
          {title || "Get Your Web3 Username"}
        </Text>
        {subtitle && (
          <Text color="grey" size="sm" className="mt-1">
            {subtitle}
          </Text>
        )}
      </div>

      <div className="mt-3">
        <NameAvailabilityInput
          label={label}
          parentName={parentName}
          minLength={MIN_ENS_LEN}
          disabled={minting.isWaitingWallet}
          isChecking={quote.isChecking}
          isAvailable={data?.status === "ready"}
          errorMessage={quote.error ? "Couldn't check availability" : undefined}
          isReserved={data?.reason?.code === "RESERVED"}
          statusMessage={
            data?.status === "account_required"
              ? "Connect a wallet to check eligibility"
              : data?.status === "blocked" &&
                  !["NAME_TAKEN", "RESERVED"].includes(data.reason.code)
                ? "Registration unavailable"
                : undefined
          }
          onNameChange={handleNameChanged}
        />
      </div>

      {blockingMessage && (
        <div className="mt-2">
          <Alert variant="warning" position="vertical">
            <Text size="sm">{blockingMessage}</Text>
          </Alert>
        </div>
      )}

      {showQuote && (
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
                      amount: formatAmount(
                        payments[t.symbol],
                        t.decimals,
                        t.symbol
                      ),
                    }))}
                />
              )
            }
            primaryFee={{
              label: "Price",
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
              data?.price && !isFree && !payingEth
                ? usdFromRaw(data.price.amount)
                : undefined
            }
            expiryPicker={
              data?.expirationType === "expiring"
                ? { durationSeconds, onDurationChange: setDurationSeconds }
                : undefined
            }
          />
          {canSetRecords && quoteReady && (
            <ProfileSelector onSelect={() => setShowProfile(true)} />
          )}
        </>
      )}

      {quote.error && (
        <div className="mt-2" data-testid="form-error">
          <Alert variant="error" position="vertical">
            <Text size="sm">{quote.error}</Text>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setQuoteAttempt(n => n + 1)}
            >
              Try again
            </Button>
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

      {fees.failed && fees.error && (
        <Alert variant="error">
          <Text size="sm">{fees.error}</Text>
        </Alert>
      )}

      {hasInsufficientFunds && (
        <div className="mt-2">
          <Alert variant="warning">
            <Text size="sm" data-testid="insufficient-funds">
              Insufficient funds
            </Text>
          </Alert>
        </div>
      )}

      <MintFormActions
        actionLabel="Register"
        onCancel={() => onCancel?.()}
        onMint={handleMint}
        isMintDisabled={
          !isAvailableForMint ||
          (amount === undefined && !isFree) ||
          !walletClient ||
          !mintResolver ||
          hasInsufficientFunds ||
          fees.isChecking ||
          fees.failed
        }
        isWaitingWallet={minting.isWaitingWallet}
        needsChainSwitch={needsChainSwitch}
        chainName={chainId === 11155111 ? "Sepolia" : "Ethereum"}
        onSwitchChain={() => switchChain?.({ chainId })}
        isSwitchingChain={isSwitchingChain}
        isConnected={!!connectedAddress}
        onConnectWallet={onConnectWallet}
      />
    </div>
  );
};
