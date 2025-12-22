import React, { useEffect, useState } from "react";
import ninjaImage from "../../assets/banner.png";
import "./RegistrationProcess.css";
import { Alert } from "../molecules/alert/Alert";
import { Button, Text, Icon } from "../atoms";
import { useAccount, useSwitchChain } from "wagmi";
import { mainnet, sepolia } from "viem/chains";
import { EnsRecords } from "@/types";
import {
  ProcessSteps,
  RegistrationState,
  CommitmentStep,
  TimerStep,
  RegistrationStep,
} from "./registration";
import { Address } from "viem";

interface RegistrationSuccessData {
  expiryInYears: number;
  registrationCost: string;
  transactionFees: string;
  total: string;
  expiryDate: string;
}

interface RegistrationProcessProps {
  label: string;
  expiryInYears: number;
  isTestnet: boolean;
  records: EnsRecords;
  onBack?: (clearState?: boolean) => void;
  onSuccess?: (data: RegistrationSuccessData) => void;
  referrer?: Address
}
export const RegistrationProcess: React.FC<RegistrationProcessProps> = ({
  label,
  expiryInYears,
  isTestnet = false,
  records,
  onBack,
  onSuccess,
  referrer
}) => {
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();

  const expectedChainId = isTestnet ? sepolia.id : mainnet.id;
  const isOnCorrectNetwork = chain?.id === expectedChainId;
  const shouldSwitchNetwork = chain && !isOnCorrectNetwork;

  const [registrationState, setRegistrationState] = useState<RegistrationState>(
    {
      step: ProcessSteps.Start,
      label: label,
      commitment: { completed: false, time: 0 },
      registration: { completed: false },
      timerStartedAt: 0,
      expiryInYears: expiryInYears,
      secret: "0x0",
      records: records,
      isTestnet: isTestnet,
      referrer: referrer
    }
  );

  useEffect(() => {

    // TODO: Remove ugly useEffect!
    setRegistrationState({...registrationState, records})

  },[records])

  const handleSwitchNetwork = () => {
    if (switchChain) {
      switchChain({ chainId: expectedChainId });
    }
  };

  const handleTimerPassed = () => {
    setRegistrationState({
      ...registrationState,
      step: ProcessSteps.TimerCompleted,
    });
  };

  const networkName = isTestnet ? "Sepolia" : "Mainnet";

  return (
    <div className="ens-registration-progress">
      <button
        className="ens-registration-close-btn"
        onClick={() => onBack?.()}
        type="button"
        aria-label="Close"
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
          ENS Registration Process
        </Text>
        <Text size="xs" color="grey">
          Registration Consists of 3 Steps
        </Text>
      </div>

      {shouldSwitchNetwork && (
        <div className="mt-2">
          <Alert variant="warning" title="Wrong Network">
            <div className="d-flex flex-column align-items-center">
              <Text size="sm" className="mb-2">
                Please switch to {networkName} to continue with the registration
                process.
              </Text>
              <Button onClick={handleSwitchNetwork} size="md">
                Switch to {networkName}
              </Button>
            </div>
          </Alert>
        </div>
      )}

      {isOnCorrectNetwork && (
        <>
          <div className="mt-2">
            <CommitmentStep
              state={registrationState}
              isTestnet={isTestnet}
              onStateUpdated={(state) => setRegistrationState(state)}
            />
          </div>

          <div className="mt-2">
            <TimerStep
              state={registrationState}
              onTimerCompleted={handleTimerPassed}
            />
          </div>

          <div className="mt-2">
            <RegistrationStep
              state={registrationState}
              isTestnet={isTestnet}
              onStateUpdated={(state) => setRegistrationState(state)}
              onSuccess={onSuccess}
            />
          </div>
        </>
      )}
    </div>
  );
};
