import { useEffect, useMemo, useState } from "react";
import { formatUnits, type Address, type PublicClient, zeroAddress } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { Text } from "@/components/atoms";
import { Alert, PricingDisplay, TokenSelect } from "@/components/molecules";
import type { EnsRecords } from "@/types";
import { deepCopy, formatTokenAmount, getEnsRecordsDiff } from "@/utils";
import { secondsFromYears } from "@/utils/date";
import { RegistrationSummary } from "../RegistrationSummary";
import { SetNameRecords } from "../SetNameRecords";
import { SuccessScreen } from "../registration";
import type { EnsNameRegistrationFormProps } from "../ENSNameRegistrationForm";
import { RegistrationProcessV2 } from "./RegistrationProcessV2";
import {
  buildEnsV2RegisterCalls,
  ENSV2_MIN_REGISTRATION_SECONDS,
  type EnsV2RegistrationDeployment,
  type EnsV2RegistrationFees,
  estimateEnsV2RegistrationFees,
  getEnsV2RegistrationDeployment,
  getEnsV2RegistrationPrice,
  getNameResolver,
  isEnsV2NameAvailable,
  makeEnsV2Commitment,
} from "./ensv2-register";
import "../ENSNamesRegistrarComponent.css";

const PRICE_DEBOUNCE_MS = 500;
const ESTIMATE_SECRET = "0x0000000000000000000000000000000000000000000000000000000000000001";

enum Step {
  Summary,
  Progress,
  Success,
}

const getLabel = (name?: string) => (name ? name.split(".")[0] : "");

const durationLabel = (seconds: number) => {
  const years = seconds / (365 * 24 * 60 * 60);
  if (years >= 1 && Number.isInteger(Math.round(years * 100) / 100))
    return `${Math.round(years)} year${Math.round(years) === 1 ? "" : "s"}`;
  const days = Math.round(seconds / 86_400);
  return `${days} days`;
};

export const EnsNameRegistrationFormV2 = (props: EnsNameRegistrationFormProps) => {
  const deployment = getEnsV2RegistrationDeployment(Boolean(props.isTestnet));
  if (!deployment) {
    return (
      <div className="ens-registration-form-container">
        <Alert variant="error" position="vertical">
          <Text size="sm">ENSv2 registration is only available on Sepolia for now.</Text>
        </Alert>
      </div>
    );
  }
  return <EnsNameRegistrationFormV2Content {...props} deployment={deployment} />;
};

const EnsNameRegistrationFormV2Content = ({
  deployment,
  ...props
}: EnsNameRegistrationFormProps & { deployment: EnsV2RegistrationDeployment }) => {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: deployment.chainId }) as
    | PublicClient
    | undefined;

  const [label, setLabel] = useState(getLabel(props.name));
  const [step, setStep] = useState(Step.Summary);
  const [durationSeconds, setDurationSeconds] = useState(() => secondsFromYears(new Date(), 1));
  const [tokenSymbol, setTokenSymbol] = useState(deployment.paymentTokens[0].symbol);
  const token =
    deployment.paymentTokens.find((t) => t.symbol === tokenSymbol) ?? deployment.paymentTokens[0];

  const [nameValidation, setNameValidation] = useState<{
    isChecking: boolean;
    isTaken: boolean;
    reason?: string;
  }>({ isChecking: false, isTaken: false });
  const [prices, setPrices] = useState<{ isChecking: boolean; bySymbol: Record<string, bigint> }>({
    isChecking: false,
    bySymbol: {},
  });
  const [fees, setFees] = useState<{
    isChecking: boolean;
    data: EnsV2RegistrationFees | null;
  }>({ isChecking: false, data: null });

  const [showProfile, setShowProfile] = useState(false);
  const [ensRecordTemplate, setEnsRecordsTemplate] = useState<EnsRecords>({ addresses: [], texts: [] });
  const [ensRecords, setEnsRecords] = useState<EnsRecords>({ addresses: [], texts: [] });
  const hasRecordsDifference = useMemo(
    () => getEnsRecordsDiff(ensRecords, ensRecordTemplate).isDifferent,
    [ensRecords, ensRecordTemplate],
  );
  const [success, setSuccess] = useState<{
    price: string;
    transactionFees: string;
    expiryDate: string;
  } | null>(null);

  const available = label.length >= 3 && !nameValidation.isChecking && !nameValidation.isTaken;
  const price = prices.bySymbol[token.symbol];

  useEffect(() => {
    if (!publicClient || !available) return;
    let cancelled = false;
    setPrices((prev) => ({ ...prev, isChecking: true }));
    const timer = setTimeout(async () => {
      const amounts = await Promise.all(
        deployment.paymentTokens.map((t) =>
          getEnsV2RegistrationPrice(publicClient, deployment, label, BigInt(durationSeconds), t).catch(
            () => null,
          ),
        ),
      );
      if (cancelled) return;
      setPrices({
        isChecking: false,
        bySymbol: Object.fromEntries(
          deployment.paymentTokens
            .map((t, i) => [t.symbol, amounts[i]] as const)
            .filter(([, amount]) => amount !== null),
        ) as Record<string, bigint>,
      });
    }, PRICE_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [publicClient, deployment, label, durationSeconds, available]);

  useEffect(() => {
    if (!publicClient || !address || !available || price === undefined) {
      setFees({ isChecking: false, data: null });
      return;
    }
    let cancelled = false;
    setFees((prev) => ({ ...prev, isChecking: true }));
    const run = async () => {
      try {
        const owner = address as Address;
        const resolver = await getNameResolver(publicClient, deployment, owner, label);
        const params = {
          label,
          owner,
          secret: ESTIMATE_SECRET as `0x${string}`,
          resolver: resolver.address,
          duration: BigInt(durationSeconds),
        };
        const calls = await buildEnsV2RegisterCalls(publicClient, deployment, {
          ...params,
          token,
          price,
          resolverDeployed: resolver.deployed,
          resolverSalt: resolver.salt,
          records: ensRecords,
        });
        const data = await estimateEnsV2RegistrationFees(publicClient, deployment, {
          owner,
          commitment: makeEnsV2Commitment(params),
          calls,
          token,
          price,
        });
        if (!cancelled) setFees({ isChecking: false, data });
      } catch {
        if (!cancelled) setFees({ isChecking: false, data: null });
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [publicClient, address, available, price, tokenSymbol, label, durationSeconds, ensRecords]);

  const priceDisplay =
    price === undefined ? "N/A" : formatTokenAmount(price, token.decimals, token.symbol);
  const feesDisplay =
    fees.data?.feeWei == null ? "N/A" : formatTokenAmount(fees.data.feeWei, 18, "ETH");
  const insufficient = Boolean(
    fees.data && (fees.data.shortfallEthWei > 0n || fees.data.shortfallToken > 0n),
  );

  const pricing = (
    <>
      <PricingDisplay
        currency={token.symbol}
        paymentTokenPicker={
          <TokenSelect
            value={token.symbol}
            onChange={setTokenSymbol}
            options={deployment.paymentTokens
              .filter((t) => prices.bySymbol[t.symbol] !== undefined)
              .map((t) => ({
                symbol: t.symbol,
                amount: formatTokenAmount(prices.bySymbol[t.symbol], t.decimals, t.symbol),
              }))}
          />
        }
        primaryFee={{ label: "Registration Fee", amount: priceDisplay, isChecking: prices.isChecking }}
        networkFees={{ amount: feesDisplay, isChecking: fees.isChecking }}
        total={{ amount: priceDisplay, isChecking: prices.isChecking }}
        totalUsd={price === undefined ? undefined : Number(formatUnits(price, token.decimals)).toFixed(2)}
        expiryPicker={{
          durationSeconds,
          onDurationChange: setDurationSeconds,
          minSeconds: ENSV2_MIN_REGISTRATION_SECONDS,
        }}
      />
      {insufficient && (
        <div className="mt-2">
          <Alert variant="warning">
            <Text size="sm">Insufficient funds</Text>
          </Alert>
        </div>
      )}
    </>
  );

  const reset = () => {
    setLabel("");
    setDurationSeconds(secondsFromYears(new Date(), 1));
    setEnsRecords({ addresses: [], texts: [] });
    setEnsRecordsTemplate({ addresses: [], texts: [] });
    setNameValidation({ isChecking: false, isTaken: false });
    setSuccess(null);
    setStep(Step.Summary);
  };

  return (
    <div
      className={`ens-registration-form-container ${props.className || ""} ${props.noBorder ? "no-border" : ""}`}
    >
      {step === Step.Summary && showProfile && (
        <SetNameRecords
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
              ? { ensName: `${label}.eth`, isTestnet: props.isTestnet, siweDomain: props.avatarUploadDomain }
              : undefined
          }
        />
      )}
      {step === Step.Summary && !showProfile && (
        <RegistrationSummary
          label={label}
          durationSeconds={durationSeconds}
          price={{ isChecking: prices.isChecking, wei: 0n, eth: 0 }}
          nameValidation={nameValidation}
          isTestnet={props.isTestnet || false}
          title={props.title}
          subtitle={props.subtitle}
          bannerImage={props.bannerImage}
          hideBanner={props.hideBanner}
          bannerWidth={props.bannerWidth}
          onLabelChange={setLabel}
          onDurationChange={setDurationSeconds}
          onPriceChange={() => {}}
          onNameValidationChange={setNameValidation}
          onSetProfile={() => setShowProfile(true)}
          onStart={() => setStep(Step.Progress)}
          onConnectWallet={props.onConnectWallet}
          checkAvailability={(l) =>
            publicClient
              ? isEnsV2NameAvailable(publicClient, deployment, l)
              : Promise.reject(new Error("No client"))
          }
          pricing={pricing}
          startDisabled={price === undefined || insufficient}
        />
      )}
      {step === Step.Progress && (
        <RegistrationProcessV2
          deployment={deployment}
          label={label}
          durationSeconds={durationSeconds}
          token={token}
          records={ensRecords}
          onBack={() => setStep(Step.Summary)}
          onStart={props.onRegistrationStart}
          onSuccess={(result) => {
            const expiry = new Date(Date.now() + durationSeconds * 1000).toLocaleDateString();
            const data = {
              durationLabel: durationLabel(durationSeconds),
              registrationCost: formatTokenAmount(result.price, token.decimals, token.symbol),
              transactionFees: result.transactionFees,
              total: result.transactionFees,
              expiryDate: expiry,
            };
            setSuccess({ price: data.registrationCost, transactionFees: data.transactionFees, expiryDate: expiry });
            props.onRegistrationSuccess?.(data);
            setStep(Step.Success);
          }}
        />
      )}
      {step === Step.Success && success && (
        <SuccessScreen
          ensName={label}
          durationLabel={durationLabel(durationSeconds)}
          registrationCost={success.price}
          transactionFees={success.transactionFees}
          total={success.transactionFees}
          expiryDate={success.expiryDate}
          currency={token.symbol}
          isTestnet={props.isTestnet || false}
          onGreat={() => props.onClose?.(true)}
          onRegisterAnother={reset}
        />
      )}
    </div>
  );
};
