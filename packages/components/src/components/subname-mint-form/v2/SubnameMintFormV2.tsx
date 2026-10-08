import { useEffect, useMemo, useState } from "react";
import { Text, ShurikenSpinner } from "@/components/atoms";
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
import { deepCopy, getEnsRecordsDiff } from "@/utils";
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

const formatAmount = (amount: bigint, decimals: number, symbol: string) => {
  const value = Number(formatUnits(amount, decimals));
  if (value === 0) return "0";
  const digits = symbol === "ETH" ? 5 : 2;
  const min = 10 ** -digits;
  return value < min ? `>${min}` : value.toFixed(digits);
};

const usdFromRaw = (raw: bigint) => (Number(raw) / 1e12).toFixed(2);

/** Sends the calls in one atomic wallet request when supported, else one by one. */
const sendMintCalls = async (
  walletClient: WalletClient,
  publicClient: PublicClient,
  calls: EnsV2Call[],
  chainId: number,
  onSubmitted: (hash: Hash) => void,
): Promise<Hash[]> => {
  let atomic = false;
  if (calls.length > 1) {
    try {
      const capabilities = await walletClient.getCapabilities({
        account: walletClient.account,
        chainId,
      });
      const status = (capabilities as { atomic?: { status?: string } })?.atomic
        ?.status;
      atomic = status === "supported" || status === "ready";
    } catch {
      atomic = false;
    }
  }

  if (atomic) {
    const { id } = await walletClient.sendCalls({
      // biome-ignore lint/style/noNonNullAssertion: wagmi's wallet client always has an account
      account: walletClient.account!,
      calls,
      chain: walletClient.chain,
      forceAtomic: true,
    });
    const result = await walletClient.waitForCallsStatus({ id });
    const hashes = [
      ...new Set((result.receipts ?? []).map((r) => r.transactionHash)),
    ];
    const hash = hashes[hashes.length - 1];
    if (result.status !== "success" || !hash)
      throw new Error("The mint transaction failed.");
    onSubmitted(hash);
    return hashes;
  }

  const hashes: Hash[] = [];
  for (const call of calls) {
    const hash = await walletClient.sendTransaction({
      ...call,
      chain: walletClient.chain,
      // biome-ignore lint/style/noNonNullAssertion: wagmi's wallet client always has an account
      account: walletClient.account!,
    });
    onSubmitted(hash);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status !== "success")
      throw new Error("A mint transaction reverted.");
    hashes.push(hash);
  }
  if (hashes.length === 0) throw new Error("Nothing to send.");
  return hashes;
};

/** Gas actually paid across the mint's transactions, in ETH. */
const paidFees = async (publicClient: PublicClient, hashes: Hash[]) => {
  try {
    const receipts = await Promise.all(
      hashes.map((hash) => publicClient.getTransactionReceipt({ hash })),
    );
    const wei = receipts.reduce(
      (sum, r) => sum + r.gasUsed * (r.effectiveGasPrice ?? 0n),
      0n,
    );
    return formatUnits(wei, 18);
  } catch {
    return "0";
  }
};

// ENSv2 subname minting: same screens as the ENSv1 form, priced in USD and
// paid in a token the issuer accepts (ETH or USDC).
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
  // Records go through the Namespace resolver's multicall; a custom resolver
  // has its own interface, so records are left to the owner.
  const canSetRecords =
    resolver !== null &&
    resolver.toLowerCase() === deployment.resolver.toLowerCase();

  const [minting, setMinting] = useState<{
    isWaitingWallet: boolean;
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

  const duration = quote.data?.expirable === false ? ONE_YEAR : BigInt(durationSeconds);

  // Quote the label (debounced) whenever it, the wallet or the duration changes.
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
  }, [publicClient, deployment, parentName, label, connectedAddress, durationSeconds]);

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

  // Estimate gas for the exact calls a mint would send (approve, register, records).
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
  const blockingMessage =
    data && !data.canMint && !data.reserved ? data.deniedMessage : null;
  const isAvailableForMint = Boolean(
    label.length >= MIN_ENS_LEN &&
      data &&
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
      const calls = await prepareEnsV2MintCalls(publicClient, deployment, {
        parentName,
        label,
        owner: connectedAddress,
        duration,
        token,
        amount: amount ?? 0n,
        extraData: data.extraData,
        records: canSetRecords ? ensRecords : { addresses: [], texts: [] },
        resolver,
      });
      const hashes = await sendMintCalls(
        walletClient,
        publicClient,
        calls,
        chainId,
        (submitted) =>
          setMinting({ isWaitingWallet: false, txHash: submitted, completed: false }),
      );
      const hash = hashes[hashes.length - 1];
      const transactionFees = await paidFees(publicClient, hashes);
      setMinting({ isWaitingWallet: false, txHash: hash, completed: true });

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

  if (minting.txHash) {
    return (
      <div style={{ padding: 15 }}>
        <Text className="ns-text-center mb-3" weight="bold">
          Minting {label}.{parentName}
        </Text>
        <TransactionPendingScreen
          hash={minting.txHash}
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
            className="mt-2"
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

      {minting.isWaitingWallet && !minting.txHash && (
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
