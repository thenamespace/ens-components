import { useEffect, useMemo, useState } from "react";
import { Button, Text, ShurikenSpinner } from "@/components/atoms";
import {
  PricingDisplay,
  Alert,
  isUserDeniedError,
  TokenSelect,
} from "@/components/molecules";
import { useAccount, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import {
  type Address,
  formatUnits,
  type Hash,
  type PublicClient,
  type WalletClient,
  zeroAddress,
} from "viem";
import { normalize } from "viem/ens";
import {
  deepCopy,
  detectResolverStyle,
  formatTokenAmount as formatAmount,
  getEnsRecordsDiff,
  paidFees,
  sendCallsWithFallback,
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
  type EnsV2Call,
  type EnsV2Deployment,
  type EnsV2MintQuote,
  estimateEnsV2MintFees,
  type EnsV2MintFees,
  canWriteEnsV2RecordsAtMint,
  getEnsV2ActivationResolver,
  getEnsV2Deployment,
  ONE_YEAR,
  prepareEnsV2MintCalls,
  quoteEnsV2Mint,
  quoteEnsV2Payment,
} from "./ensv2-mint";
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
}

export const SubnameMintFormV2 = (props: SubnameMintFormV2Props) => {
  const deployment = getEnsV2Deployment(Boolean(props.isTestnet));
  if (!deployment) {
    return (
      <div className="ns-subname-mint-form">
        <Alert variant="error" position="vertical">
          <Text size="sm">ENSv2 subnames are only available on Sepolia for now.</Text>
        </Alert>
      </div>
    );
  }
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
  deployment,
}: SubnameMintFormV2Props & { deployment: EnsV2Deployment }) => {
  const { chainId } = deployment;
  const { address: connectedAddress, chain: currentChain } = useAccount();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const publicClient = usePublicClient({ chainId }) as PublicClient | undefined;
  const { data: walletClient } = useWalletClient({ chainId });
  const { ethUsdRate } = useEthDollarValue();

  const needsChainSwitch = currentChain?.id !== chainId;

  const [label, setLabel] = useState(initialLabel || "");
  const [showProfile, setShowProfile] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(() =>
    secondsFromYears(new Date(), 1),
  );
  const [tokenSymbol, setTokenSymbol] = useState(deployment.paymentTokens[0].symbol);
  const token =
    deployment.paymentTokens.find((t) => t.symbol === tokenSymbol) ??
    deployment.paymentTokens[0];

  const [quote, setQuote] = useState<{
    isChecking: boolean;
    data: EnsV2MintQuote | null;
    error: string | null;
  }>({ isChecking: false, data: null, error: null });
  const [payments, setPayments] = useState<Record<string, bigint>>({});
  const [quoteAttempt, setQuoteAttempt] = useState(0);
  const [resolver, setResolver] = useState<Address | null>(null);

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
    [ensRecords, ensRecordTemplate],
  );
  const [resolverStyle, setResolverStyle] = useState<ResolverStyle | null>(null);
  const [customRecordsWritable, setCustomRecordsWritable] = useState<boolean | null>(null);
  const isNamespaceResolver =
    resolver !== null && resolver.toLowerCase() === deployment.resolver.toLowerCase();
  const canSetRecords =
    resolver !== null &&
    resolverStyle !== null &&
    (isNamespaceResolver || customRecordsWritable === true);

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
    getEnsV2ActivationResolver(deployment, parentName)
      .then(setResolver)
      .catch(() => setResolver(null));
  }, [deployment, parentName]);

  useEffect(() => {
    if (!resolver || !publicClient) {
      setResolverStyle(null);
      return;
    }
    detectResolverStyle(publicClient, resolver)
      .then(setResolverStyle)
      .catch(() => setResolverStyle(null));
  }, [resolver, publicClient]);

  const duration = quote.data?.expirable === false ? ONE_YEAR : BigInt(durationSeconds);

  useEffect(() => {
    if (!publicClient || label.length < MIN_ENS_LEN) {
      setQuote({ isChecking: false, data: null, error: null });
      return;
    }
    let cancelled = false;
    setQuote((prev) => ({ ...prev, isChecking: true, error: null }));
    const timer = setTimeout(async () => {
      try {
        const data = await quoteEnsV2Mint(publicClient, deployment, {
          parentName,
          label,
          minter: connectedAddress ?? zeroAddress,
          duration: BigInt(durationSeconds),
        });
        const amounts = await Promise.all(
          deployment.paymentTokens.map((t) =>
            quoteEnsV2Payment(publicClient, deployment, data.priceUsdRaw, t).catch(
              () => null,
            ),
          ),
        );
        if (cancelled) return;
        setPayments(
          Object.fromEntries(
            deployment.paymentTokens
              .map((t, i) => [t.symbol, amounts[i]] as const)
              .filter(([, amount]) => amount !== null),
          ) as Record<string, bigint>,
        );
        setQuote({ isChecking: false, data, error: null });
      } catch (e: any) {
        if (cancelled) return;
        setQuote({
          isChecking: false,
          data: null,
          error: e?.shortMessage || e?.message || "Couldn't price this subname.",
        });
      }
    }, QUOTE_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    publicClient,
    deployment,
    parentName,
    label,
    connectedAddress,
    durationSeconds,
    quoteAttempt,
  ]);

  useEffect(() => {
    const q = quote.data;
    if (
      isNamespaceResolver ||
      !resolver ||
      !resolverStyle ||
      !publicClient ||
      !connectedAddress ||
      !q?.available ||
      !q.canMint ||
      q.proofsUnavailable.length > 0 ||
      quote.isChecking
    ) {
      setCustomRecordsWritable(null);
      return;
    }
    let cancelled = false;
    canWriteEnsV2RecordsAtMint(publicClient, deployment, {
      parentName,
      label,
      owner: connectedAddress,
      duration: q.expirable ? BigInt(durationSeconds) : ONE_YEAR,
      priceUsdRaw: q.priceUsdRaw,
      extraData: q.extraData,
      resolver,
      resolverStyle,
    }).then((writable) => {
      if (!cancelled) setCustomRecordsWritable(writable);
    });
    return () => {
      cancelled = true;
    };
  }, [
    isNamespaceResolver,
    resolver,
    resolverStyle,
    publicClient,
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
    data: EnsV2MintFees | null;
    failed: boolean;
  }>({ isChecking: false, data: null, failed: false });

  const quoteReady = Boolean(
    quote.data?.available && quote.data.canMint && !quote.isChecking,
  );
  const paymentAmount = payments[tokenSymbol];
  const needsAmount = quote.data?.priceUsdRaw !== 0n;

  useEffect(() => {
    if (
      !publicClient ||
      !connectedAddress ||
      !quoteReady ||
      !quote.data ||
      (needsAmount && paymentAmount === undefined)
    ) {
      setFees({ isChecking: false, data: null, failed: false });
      return;
    }
    let cancelled = false;
    setFees((prev) => ({ ...prev, isChecking: true, failed: false }));
    const run = async () => {
      try {
        const amount = paymentAmount ?? 0n;
        const calls = await prepareEnsV2MintCalls(publicClient, deployment, {
          parentName,
          label,
          owner: connectedAddress,
          duration: quote.data!.expirable ? BigInt(durationSeconds) : ONE_YEAR,
          token,
          amount,
          extraData: quote.data!.extraData,
          records: canSetRecords ? ensRecords : { addresses: [], texts: [] },
          resolver,
          resolverStyle: resolverStyle ?? "simplified",
        });
        const data = await estimateEnsV2MintFees(
          publicClient,
          connectedAddress,
          calls,
          { token, amount },
        );
        if (!cancelled) setFees({ isChecking: false, data, failed: false });
      } catch {
        if (!cancelled) setFees({ isChecking: false, data: null, failed: true });
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [
    publicClient,
    connectedAddress,
    quoteReady,
    quote.data,
    label,
    paymentAmount,
    needsAmount,
    tokenSymbol,
    durationSeconds,
    ensRecords,
    resolver,
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
  const proofsMissing = (data?.proofsUnavailable.length ?? 0) > 0;
  const blockingMessage =
    data && !proofsMissing && !data.canMint && !data.reserved
      ? data.deniedMessage
      : null;
  const isAvailableForMint = Boolean(
    label.length >= MIN_ENS_LEN &&
      data &&
      !proofsMissing &&
      data.available &&
      data.canMint &&
      !quote.isChecking,
  );
  const amount = payments[token.symbol];
  const isFree = data?.priceUsdRaw === 0n;
  const priceDisplay = isFree
    ? "Free"
    : amount === undefined
      ? "N/A"
      : formatAmount(amount, token.decimals, token.symbol);

  const feeEth = fees.data ? Number(formatUnits(fees.data.feeWei, 18)) : 0;
  const feesDisplay = fees.failed
    ? "N/A"
    : formatAmount(fees.data?.feeWei ?? 0n, 18, "ETH");
  const payingEth = token.symbol === "ETH" || isFree;
  const totalDisplay = (() => {
    if (!payingEth) return priceDisplay;
    if (fees.failed) return isFree ? "N/A" : priceDisplay;
    const priceEth = isFree || amount === undefined ? 0 : Number(formatUnits(amount, 18));
    const sum = priceEth + feeEth;
    return sum === 0 ? "Free" : formatAmount(BigInt(Math.round(sum * 1e18)), 18, "ETH");
  })();
  const hasInsufficientFunds = Boolean(
    fees.data && (fees.data.shortfallEthWei > 0n || fees.data.shortfallToken > 0n),
  );

  const handleMint = async () => {
    if (!data || !publicClient || !walletClient || !connectedAddress) return;
    if (amount === undefined && !isFree) return;
    setError(null);
    setMinting({ isWaitingWallet: true, txHash: null, completed: false });

    try {
      const freshAmount = isFree
        ? 0n
        : await quoteEnsV2Payment(publicClient, deployment, data.priceUsdRaw, token);
      const calls = await prepareEnsV2MintCalls(publicClient, deployment, {
        parentName,
        label,
        owner: connectedAddress,
        duration,
        token,
        amount: freshAmount,
        extraData: data.extraData,
        records: canSetRecords ? ensRecords : { addresses: [], texts: [] },
        resolver,
        resolverStyle: resolverStyle ?? "simplified",
      });
      const hashes = await sendCallsWithFallback(
        walletClient,
        publicClient,
        calls,
        chainId,
        ({ hash, call }) =>
          setMinting({
            isWaitingWallet: false,
            pending: true,
            title: call?.title,
            txHash: hash,
            completed: false,
          }),
      );
      const hash = hashes[hashes.length - 1];
      const transactionFees = await paidFees(publicClient, hashes);
      setMinting({ isWaitingWallet: false, pending: true, txHash: hash, completed: true });

      const price = isFree ? "0" : priceDisplay;
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
      if (!isUserDeniedError(e))
        setError(e?.shortMessage || e?.message || "Something went wrong");
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
        <Text className="ns-text-center mb-3" weight="bold">
          {minting.title ?? `Minting ${label}.${parentName}`}
        </Text>
        <TransactionPendingScreen
          hash={minting.txHash ?? undefined}
          isCompleted={minting.completed}
          chainId={chainId}
          message="Your subname is being minted!"
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
          disabled={!!blockingMessage || minting.isWaitingWallet}
          isChecking={quote.isChecking}
          isAvailable={Boolean(data?.available && !data.reserved)}
          isReserved={Boolean(data?.reserved)}
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

      {isAvailableForMint && (
        <>
          <PricingDisplay
            currency={isFree ? undefined : token.symbol}
            paymentTokenPicker={
              isFree ? undefined : (
                <TokenSelect
                  value={token.symbol}
                  onChange={setTokenSymbol}
                  options={deployment.paymentTokens
                    .filter((t) => payments[t.symbol] !== undefined)
                    .map((t) => ({
                      symbol: t.symbol,
                      amount: formatAmount(payments[t.symbol], t.decimals, t.symbol),
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
              data && !isFree && !payingEth ? usdFromRaw(data.priceUsdRaw) : undefined
            }
            expiryPicker={
              data?.expirable
                ? { durationSeconds, onDurationChange: setDurationSeconds }
                : undefined
            }
          />
          {canSetRecords && <ProfileSelector onSelect={() => setShowProfile(true)} />}
        </>
      )}

      {proofsMissing && !quote.isChecking && (
        <div className="mt-2">
          <Alert variant="error" position="vertical">
            <Text size="sm">
              Couldn't verify the{" "}
              {data?.proofsUnavailable
                .map((p) => (p === "whitelist" ? "whitelist" : "reservations"))
                .join(" and ")}{" "}
              for this name. Try again.
            </Text>
            <Button
              className="mt-2"
              size="sm"
              variant="outline"
              onClick={() => setQuoteAttempt((n) => n + 1)}
            >
              Try again
            </Button>
          </Alert>
        </div>
      )}

      {quote.error && (
        <div className="mt-2">
          <Alert variant="error" position="vertical">
            <Text size="sm">{quote.error}</Text>
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

      {hasInsufficientFunds && (
        <div className="mt-2">
          <Alert variant="warning">
            <Text size="sm">Insufficient funds</Text>
          </Alert>
        </div>
      )}

      {minting.isWaitingWallet && !minting.pending && (
        <div className="d-flex justify-content-center mt-2">
          <ShurikenSpinner size={16} />
        </div>
      )}

      <MintFormActions
        onCancel={() => onCancel?.()}
        onMint={handleMint}
        isMintDisabled={
          !isAvailableForMint ||
          (amount === undefined && !isFree) ||
          !walletClient ||
          hasInsufficientFunds
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
