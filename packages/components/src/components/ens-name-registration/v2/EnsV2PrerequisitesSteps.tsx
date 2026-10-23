import React, { useState } from "react";
import type { ContractFunctionExecutionError, Hash } from "viem";
import ninjaImage from "../../../assets/banner.png";
import { Button, Icon, Text } from "../../atoms";
import { Accordion } from "../../molecules/accordion";
import {
  ContractErrorLabel,
  isUserDeniedError,
} from "../../molecules/contract-error-label/ContractErrorLabel";
import { formatTokenAmount } from "@/utils";
import { TransactionPendingScreen } from "../registration/TransactionPendingScreen";
import type { EnsV2RegistrationToken } from "./ensv2-register";
import "../RegistrationProcess.css";

type SentTransaction = { hash: Hash; wait: () => Promise<void> };

export interface EnsV2PrerequisiteStep {
  key: string;
  title: string;
  heading: string;
  description: string;
  send: () => Promise<SentTransaction>;
}

export const resolverDeployStep = (
  send: () => Promise<SentTransaction>,
): EnsV2PrerequisiteStep => ({
  key: "resolver",
  title: "Deploy Resolver",
  heading: "Your Own Resolver",
  description:
    "ENSv2 gives your wallet its own resolver, which stores the records of every name you register. You deploy it once and reuse it for all your names.",
  send,
});

export const buildEnsV2PrerequisiteSteps = ({
  needsResolver,
  needsApproval,
  price,
  token,
  sendResolverDeploy,
  sendApproval,
}: {
  needsResolver: boolean;
  needsApproval: boolean;
  price: bigint;
  token: EnsV2RegistrationToken;
  sendResolverDeploy: () => Promise<SentTransaction>;
  sendApproval: () => Promise<SentTransaction>;
}): EnsV2PrerequisiteStep[] => {
  const steps: EnsV2PrerequisiteStep[] = [];
  if (needsResolver) steps.push(resolverDeployStep(sendResolverDeploy));
  if (needsApproval)
    steps.push({
      key: "approval",
      title: "Approve Payment",
      heading: `Approve ${token.symbol}`,
      description: `Allow the ENS registrar to collect the ${formatTokenAmount(price, token.decimals, token.symbol)} ${token.symbol} registration fee. It's only charged when your name is registered.`,
      send: sendApproval,
    });
  return steps;
};

interface EnsV2PrerequisitesStepsProps {
  steps: EnsV2PrerequisiteStep[];
  subtitle: string;
  isTestnet?: boolean;
  onBack: () => void;
  onCompleted: () => void;
}

export const EnsV2PrerequisitesSteps: React.FC<
  EnsV2PrerequisitesStepsProps
> = ({ steps, subtitle, isTestnet, onBack, onCompleted }) => {
  const [current, setCurrent] = useState(0);
  const [waitingWallet, setWaitingWallet] = useState(false);
  const [tx, setTx] = useState<{ hash: Hash; completed: boolean } | null>(null);
  const [error, setError] = useState<ContractFunctionExecutionError | null>(
    null
  );

  const toError = (err: any) =>
    new Error(
      err?.shortMessage || err?.message || "Transaction failed"
    ) as ContractFunctionExecutionError;

  const handleSend = async (step: EnsV2PrerequisiteStep) => {
    setError(null);
    setWaitingWallet(true);
    let sent: SentTransaction;
    try {
      sent = await step.send();
    } catch (err) {
      console.error(err);
      if (!isUserDeniedError(err)) setError(toError(err));
      setWaitingWallet(false);
      return;
    }
    setWaitingWallet(false);
    setTx({ hash: sent.hash, completed: false });
    try {
      await sent.wait();
    } catch (err) {
      console.error(err);
      setError(toError(err));
      setTx(null);
      return;
    }
    setTx({ hash: sent.hash, completed: true });
    setTimeout(() => {
      setTx(null);
      if (current + 1 >= steps.length) onCompleted();
      else setCurrent(current + 1);
    }, 1000);
  };

  const badge = (index: number) => {
    if (index === current) {
      return (
        <div className="ns-process-badge me-2">
          <Text color="white" weight="bold" size="sm">
            {index + 1}
          </Text>
        </div>
      );
    }
    if (index < current) {
      return (
        <div className="ns-process-badge ns-process-badge--inactive ns-process-badge--completed me-2">
          <Icon name="check" size={16} color="black" />
        </div>
      );
    }
    return (
      <div className="ns-process-badge ns-process-badge--inactive me-2">
        <Text color="primary" weight="bold" size="sm">
          {index + 1}
        </Text>
      </div>
    );
  };

  return (
    <div className="ens-registration-progress">
      <button
        className="ens-registration-close-btn"
        onClick={onBack}
        type="button"
        aria-label="Back"
      >
        <Icon name="chevron-left" size={16} />
      </button>
      <div className="d-flex justify-content-center">
        <img
          style={{ width: "250px", margin: "auto" }}
          src={ninjaImage}
          alt="Ninja Image"
        />
      </div>
      <div className="ns-text-center mt-2 mb-2">
        <Text size="lg" weight="medium">
          Additional Steps Required
        </Text>
        <Text size="xs" color="grey">
          {subtitle}
        </Text>
      </div>
      {steps.map((step, index) => (
        <div className="mt-2" key={step.key}>
          <Accordion
            isOpen={index === current}
            togglable={false}
            disabled={index !== current}
            title={
              <div className="d-flex align-items-center">
                {badge(index)}
                <Text size="sm" weight="medium">
                  {step.title}
                </Text>
              </div>
            }
          >
            {index === current && !tx && (
              <div className="ns-text-center">
                <Text weight="medium" className="mb-2">
                  {step.heading}
                </Text>
                <Text size="xs" color="grey">
                  {step.description}
                </Text>
                <Button
                  data-testid="prerequisite-send"
                  disabled={waitingWallet}
                  onClick={() => handleSend(step)}
                  className="mt-3 ns-wd-100"
                >
                  {waitingWallet ? "Waiting Wallet..." : "Open Wallet"}
                </Button>
                <ContractErrorLabel error={error} />
              </div>
            )}
            {index === current && tx && (
              <TransactionPendingScreen
                isTestnet={isTestnet}
                details={[{ label: "Action", value: step.title }]}
                hash={tx.hash}
                isCompleted={tx.completed}
              />
            )}
          </Accordion>
        </div>
      ))}
    </div>
  );
};
