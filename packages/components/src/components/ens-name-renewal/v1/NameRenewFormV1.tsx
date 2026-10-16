import { useEffect, useState } from "react";
import { type Hash, type PublicClient } from "viem";
import { normalize } from "viem/ens";
import { mainnet, sepolia } from "viem/chains";
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
} from "@/components/molecules";
import { useEthDollarValue } from "@/hooks";
import { formatTokenAmount, paidFees, sendCallsWithFallback } from "@/utils";
import { secondsFromYears } from "@/utils/date";
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
  buildEnsV1RenewCall,
  type EnsV1RenewalFees,
  type EnsV1RenewalTarget,
  estimateEnsV1RenewalFees,
  getEnsV1RenewalTarget,
  getEnsV1RenewPrice,
} from "./ensv1-renew";
import "../../subname-mint-form/SubnameMintForm.css";

export const NameRenewFormV1 = ({
  name,
  isTestnet = false,
  referrer,
  title,
  subtitle,
  className,
  onCancel,
  onConnectWallet,
  onRenewalSuccess,
}: NameRenewFormProps) => {
  const chainId = isTestnet ? sepolia.id : mainnet.id;
  const { address, chain } = useAccount();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const publicClient = usePublicClient({ chainId }) as PublicClient | undefined;
  const { data: walletClient } = useWalletClient({ chainId });
  const { ethUsdRate } = useEthDollarValue();

  const [label, setLabel] = useState(labelFromName(name));
  const [durationSeconds, setDurationSeconds] = useState(() =>
    secondsFromYears(new Date(), 1)
  );
  const [target, setTarget] = useState<{
    isChecking: boolean;
    data: EnsV1RenewalTarget | null;
    error: string | null;
  }>({ isChecking: false, data: null, error: null });
  const [price, setPrice] = useState<{
    isChecking: boolean;
    wei: bigint | null;
  }>({
    isChecking: false,
    wei: null,
  });
  const [fees, setFees] = useState<{
    isChecking: boolean;
    data: EnsV1RenewalFees | null;
  }>({
    isChecking: false,
    data: null,
  });
  const [sending, setSending] = useState<{
    isWaitingWallet: boolean;
    pending: boolean;
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

  const renewable = Boolean(target.data?.renewable);
  const duration = BigInt(durationSeconds);

  useEffect(() => {
    if (!publicClient || label.length < MIN_ETH_LABEL_LENGTH) {
      setTarget({ isChecking: false, data: null, error: null });
      return;
    }
    let cancelled = false;
    setTarget(prev => ({ ...prev, isChecking: true, error: null }));
    const timer = setTimeout(async () => {
      try {
        const data = await getEnsV1RenewalTarget(
          publicClient,
          isTestnet,
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
  }, [publicClient, isTestnet, label]);

  useEffect(() => {
    if (!publicClient || !renewable) {
      setPrice({ isChecking: false, wei: null });
      return;
    }
    let cancelled = false;
    setPrice(prev => ({ ...prev, isChecking: true }));
    getEnsV1RenewPrice(publicClient, isTestnet, label, duration)
      .then(wei => !cancelled && setPrice({ isChecking: false, wei }))
      .catch(() => !cancelled && setPrice({ isChecking: false, wei: null }));
    return () => {
      cancelled = true;
    };
  }, [publicClient, isTestnet, renewable, label, durationSeconds]);

  useEffect(() => {
    if (!publicClient || !address || price.wei === null) {
      setFees({ isChecking: false, data: null });
      return;
    }
    let cancelled = false;
    setFees(prev => ({ ...prev, isChecking: true }));
    const call = buildEnsV1RenewCall(isTestnet, {
      label,
      duration,
      price: price.wei,
      referrer,
    });
    estimateEnsV1RenewalFees(publicClient, address, call)
      .then(data => !cancelled && setFees({ isChecking: false, data }))
      .catch(() => !cancelled && setFees({ isChecking: false, data: null }));
    return () => {
      cancelled = true;
    };
  }, [
    publicClient,
    address,
    isTestnet,
    label,
    durationSeconds,
    price.wei,
    referrer,
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
    if (!publicClient || !walletClient || !address || !renewable) return;
    setError(null);
    setSending({
      isWaitingWallet: true,
      pending: false,
      txHash: null,
      completed: false,
    });
    try {
      const freshPrice = await getEnsV1RenewPrice(
        publicClient,
        isTestnet,
        label,
        duration
      );
      const call = {
        ...buildEnsV1RenewCall(isTestnet, {
          label,
          duration,
          price: freshPrice,
          referrer,
        }),
        title: `Renewing ${label}.eth`,
      };
      const hashes = await sendCallsWithFallback(
        walletClient,
        publicClient,
        [call],
        chainId,
        ({ hash }) =>
          setSending({
            isWaitingWallet: false,
            pending: true,
            txHash: hash,
            completed: false,
          })
      );
      const txHash = hashes[hashes.length - 1];
      const [transactionFees, after] = await Promise.all([
        paidFees(publicClient, hashes),
        getEnsV1RenewalTarget(publicClient, isTestnet, label),
      ]);
      const data: RenewalSuccessData = {
        fullName: `${label}.eth`,
        txHash,
        price: formatTokenAmount(freshPrice, 18, "ETH"),
        priceCurrency: "ETH",
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

  const wrapperClass = `ns-subname-mint-form ${className ?? ""}`;

  if (success && sending.completed) {
    return (
      <div className={wrapperClass}>
        <RenewSuccess
          data={success}
          chainId={chainId}
          isTestnet={isTestnet}
          onClose={onCancel}
          onRenewAnother={name ? undefined : reset}
        />
      </div>
    );
  }

  if (sending.pending) {
    return (
      <div className={wrapperClass}>
        <div style={{ padding: 15 }}>
          <Text className="ns-text-center mb-3" weight="bold">
            Renewing {label}.eth
          </Text>
          <TransactionPendingScreen
            hash={sending.txHash ?? undefined}
            isCompleted={sending.completed}
            chainId={chainId}
            message="Your name is being renewed!"
          />
        </div>
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
    if (!data.controllerActive)
      return {
        tone: "bad" as const,
        message:
          "ENSv1 renewals have moved to ENSv2 on this network. Renew with version 2.",
      };
    if (!data.renewable)
      return {
        tone: "bad" as const,
        message: `${label}.eth can't be renewed. It isn't registered, or its grace period has ended.`,
      };
    if (data.inGrace)
      return {
        tone: "soon" as const,
        message: `${label}.eth expired on ${formatExpiry(data.expiry)} and is in its grace period`,
      };
    return {
      tone: "ok" as const,
      message: `${label}.eth expires on ${formatExpiry(data.expiry)}`,
    };
  })();

  const priceDisplay =
    price.wei === null ? "N/A" : formatTokenAmount(price.wei, 18, "ETH");
  const feesDisplay =
    fees.data?.feeWei == null
      ? "N/A"
      : formatTokenAmount(fees.data.feeWei, 18, "ETH");
  const totalWei =
    price.wei === null ? null : price.wei + (fees.data?.feeWei ?? 0n);
  const insufficient = Boolean(fees.data && fees.data.shortfallEthWei > 0n);

  return (
    <div className={wrapperClass}>
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

        {renewable && data && !target.isChecking && (
          <>
            <PricingDisplay
              primaryFee={{
                label: "Renewal fee",
                amount: priceDisplay,
                isChecking: price.isChecking,
              }}
              networkFees={{ amount: feesDisplay, isChecking: fees.isChecking }}
              total={{
                amount:
                  totalWei === null
                    ? "N/A"
                    : formatTokenAmount(totalWei, 18, "ETH"),
                weiAmount: totalWei ?? undefined,
                isChecking: price.isChecking || fees.isChecking,
              }}
              ethUsdRate={ethUsdRate}
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
              <Text size="sm">Insufficient funds</Text>
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
            !renewable ||
            price.wei === null ||
            !walletClient ||
            insufficient ||
            target.isChecking
          }
          isWaitingWallet={sending.isWaitingWallet}
          needsChainSwitch={chain?.id !== chainId}
          chainName={isTestnet ? "Sepolia" : "Ethereum"}
          onSwitchChain={() => switchChain?.({ chainId })}
          isSwitchingChain={isSwitchingChain}
          isConnected={!!address}
          onConnectWallet={onConnectWallet}
        />
      </div>
    </div>
  );
};
