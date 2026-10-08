import React, { useEffect, useState } from "react";
import ninjaImage from "../../assets/banner.png";
import "./RegistrationProcess.css";
import { Alert } from "../molecules/alert/Alert";
import { Modal } from "../molecules/modal/Modal";
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
  type CommitmentSender,
  type RegistrationSender,
} from "./registration";
import { generateEnsRegistrationSecret } from "./ensRegistrationUtils";
import { Address } from "viem";

interface RegistrationSuccessData {
  durationLabel: string;
  registrationCost: string;
  transactionFees: string;
  total: string;
  expiryDate: string;
}

interface RegistrationProcessProps {
  label: string;
  durationInSeconds: number;
  isTestnet: boolean;
  records: EnsRecords;
  onBack?: (clearState?: boolean) => void;
  onSuccess?: (data: RegistrationSuccessData) => void;
  onStart?: (hash: string) => void;
  referrer?: Address;
  sendCommitment?: CommitmentSender;
  sendRegistration?: RegistrationSender;
  initialState?: Partial<RegistrationState>;
}

const getBlankRegistrationState = (
  label: string,
  durationInSeconds: number,
  records: EnsRecords,
  isTestnet: boolean,
  referrer?: Address
): RegistrationState => ({
  step: ProcessSteps.Start,
  label,
  commitment: { completed: false, time: 0 },
  registration: { completed: false },
  timerStartedAt: 0,
  durationInSeconds,
  secret: generateEnsRegistrationSecret(),
  records,
  isTestnet,
  referrer,
});

export const RegistrationProcess: React.FC<RegistrationProcessProps> = ({
  label,
  durationInSeconds,
  isTestnet = false,
  records,
  onBack,
  onSuccess,
  onStart,
  referrer,
  sendCommitment,
  sendRegistration,
  initialState,
}) => {
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();

  const expectedChainId = isTestnet ? sepolia.id : mainnet.id;
  const isOnCorrectNetwork = chain?.id === expectedChainId;
  const shouldSwitchNetwork = chain && !isOnCorrectNetwork;

  const [registrationState, setRegistrationState] = useState<RegistrationState>(
    () => ({
      ...getBlankRegistrationState(label, durationInSeconds, records, isTestnet, referrer),
      ...initialState,
    })
  );
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  useEffect(() => {
    setRegistrationState((prev) => ({ ...prev, records }));
  }, [records]);

  const handleSwitchNetwork = () => {
    if (switchChain) switchChain({ chainId: expectedChainId });
  };

  const handleTimerPassed = () => {
    setRegistrationState((prev) => ({ ...prev, step: ProcessSteps.TimerCompleted }));
  };

  const networkName = isTestnet ? "Sepolia" : "Mainnet";

  const handleCloseClick = () => {
    if (
      registrationState.step > ProcessSteps.Start &&
      registrationState.step < ProcessSteps.RegistrationCompleted
    ) {
      setShowConfirmClose(true);
    } else {
      onBack?.();
    }
  };

  return (
    <div className="ens-registration-progress">
      <button
        className="ens-registration-close-btn"
        onClick={handleCloseClick}
        type="button"
        aria-label="Close"
      >
        <Icon name="chevron-left" size={16} />
      </button>
      <div className="d-flex justify-content-center">
        <img style={{ width: "250px", margin: "auto" }} src={ninjaImage} alt="Ninja Image" />
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
                Please switch to {networkName} to continue with the registration process.
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
              sendCommitment={sendCommitment}
              onStateUpdated={(state) => {
                if (state.step === ProcessSteps.CommitmentSent) {
                  onStart?.(`${state.label}.eth`);
                }
                setRegistrationState(state);
              }}
            />
          </div>
          <div className="mt-2">
            <TimerStep state={registrationState} onTimerCompleted={handleTimerPassed} />
          </div>
          <div className="mt-2">
            <RegistrationStep
              state={registrationState}
              isTestnet={isTestnet}
              onStateUpdated={setRegistrationState}
              onSuccess={onSuccess}
              sendRegistration={sendRegistration}
            />
          </div>
        </>
      )}

      <Modal
        isOpen={showConfirmClose}
        onClose={() => setShowConfirmClose(false)}
        title="Leave Registration?"
        size="sm"
        footer={
          <div style={{ display: "flex", gap: 8, width: "100%" }}>
            <Button
              variant="outline"
              onClick={() => setShowConfirmClose(false)}
              style={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowConfirmClose(false);
                onBack?.(true);
              }}
              style={{ flex: 1 }}
            >
              Leave
            </Button>
          </div>
        }
      >
        <Text size="sm">
          If you leave now, you will lose all your registration progress. Are you sure you want to
          continue?
        </Text>
      </Modal>
    </div>
  );
};
