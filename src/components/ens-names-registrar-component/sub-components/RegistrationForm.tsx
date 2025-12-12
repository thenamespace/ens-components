import  { useState, useMemo, useEffect } from "react";
import ninjaLogo from "../../../assets/ninja.png";
import { ChevronRight } from "lucide-react";
import { Button, Text, Icon } from "../../atoms";
import { Header } from "./Header";
import { CostSummary } from "./CostSummary";
import { Modal } from "../../molecules/modal/Modal";
import { SelectRecordsForm } from "../../select-records-form/SelectRecordsForm";
import { EnsRecords, EnsAddressRecord } from "@/types";
import { deepCopy } from "@/utils";
import { getSupportedAddressByCoin, getSupportedAddressByName } from "@/constants";
import { useConnectedPrincipal } from "@/context";
interface RegistrationFormProps {
  ensName: string;
  duration: number;
  registrationCost: number;
  networkFee: number;
  total: number;
  onNameChange: (value: string) => void;
  onDurationChange: (delta: number) => void;
  onBack?: () => void;
  onClose?: () => void;
  onNext: () => void;
  onCompleteProfile?: () => void;
  onRecordsChange?: (records: EnsRecords) => void;
  isLoadingPrice?: boolean;
  priceError?: string | null;
  nameAvailability?: {
    isAvailable: boolean;
    isChecking: boolean;
  };
  canProceed?: boolean;
}

export function RegistrationForm({
  ensName,
  duration,
  registrationCost,
  networkFee,
  total,
  onNameChange,
  onDurationChange,
  onBack,
  onClose,
  onNext,
  onCompleteProfile,
  onRecordsChange,
  isLoadingPrice = false,
  priceError = null,
  nameAvailability = { isAvailable: false, isChecking: false },
  canProceed = false,
}: RegistrationFormProps) {
  const [isDurationExpanded, setIsDurationExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [records, setRecords] = useState<EnsRecords>({
    addresses: [],
    texts: [],
  });
  const [initialRecords, setInitialRecords] = useState<EnsRecords>({
    addresses: [],
    texts: [],
  });

  const { connectedAddress } = useConnectedPrincipal();
  const eth_address = getSupportedAddressByName("eth");
  const celo_address = getSupportedAddressByName("celo");
  useEffect(() => {
    if (connectedAddress && records.addresses.length === 0) {
      const newAddresses: EnsAddressRecord[] = [];
      if (eth_address) {
        newAddresses.push({ coinType: eth_address.coinType, value: connectedAddress });
      }
      if (celo_address) {
        newAddresses.push({ coinType: celo_address.coinType, value: connectedAddress });
      }
      if (newAddresses.length > 0) {
        setRecords((prevRecords) => ({
          ...prevRecords,
          addresses: newAddresses,
        }));
      }
    }
  }, [connectedAddress]);

  // Calculate number of records to add
  const recordsToAdd = useMemo(() => {
    let count = 0;
    records.texts.forEach((text) => {
      if (text.value.length > 0) {
        count++;
      }
    });
    records.addresses.forEach((addr) => {
      const supportedAddr = getSupportedAddressByCoin(addr.coinType);
      if (supportedAddr) {
        if (addr.value.length > 0 && supportedAddr.validateFunc?.(addr.value)) {
          count++;
        }
      }
    });
    if (records.contenthash && records.contenthash.value.length > 0) {
      count++;
    }
    return count;
  }, [records]);

  const handleAddProfile = () => {
    setIsModalOpen(true);
  };

  const handleRecordsAdded = () => {
    const _initialRecords = deepCopy(records);
    setInitialRecords(_initialRecords);
    onRecordsChange?.(records);
    setIsModalOpen(false);
    onCompleteProfile?.();
  };

  const handleRecordsCancel = () => {
    setRecords(deepCopy(initialRecords));
    setIsModalOpen(false);
  };
  const getSearchInputInfo = () => {

    if (ensName.length < 3 && ensName.length !== 0) {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <Text size="sm" style={{ color: "#000000" }}>
            Too short
          </Text>
          <Icon size={15} name="x" color="#000000" />
        </div>
      );
    }

    // Show unavailable if name is taken
    const isTaken = ensName.length >= 3 && !nameAvailability.isChecking && !nameAvailability.isAvailable;
    if (isTaken) {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <Text size="sm" style={{ color: "#000000" }}>
            Unavailable
          </Text>
          <Icon size={15} name="x" color="#000000" />
        </div>
      );
    }

    // Show available if name is available
    if (nameAvailability.isAvailable && ensName.length >= 3) {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <Text size="sm" style={{ color: "#22c55e" }}>
            Yes, this name is Available
          </Text>
          <Icon size={15} name="check-circle" color="#22c55e" />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="ens-names-register-container">
      <div className="ens-names-register-card">
        <Header showBack={true} onBack={onBack} onClose={onClose} />

        <div className="ens-names-register-title-section">
          <Text size="xl" weight="light" className="ens-names-register-title">
            ENS Registration
          </Text>
          <Text size="md" color="grey" className="ens-names-register-subtitle">
            Your about to mint this ENS name
          </Text>
        </div>



        {ensName && (
          <div className="ens-names-register-name-display">
            <Text size="xl" weight="bold">
              {ensName}.eth
            </Text>
          </div>
        )}

        <div className="ens-names-register-duration-section">
          <div className="ens-names-register-duration-controls">
            <button
              className="ens-names-register-duration-btn"
              onClick={() => onDurationChange(-1)}
              disabled={duration <= 1}
            >
              <span style={{ fontSize: "20px", lineHeight: "1" }}>−</span>
            </button>
            <div
              className="ens-names-register-duration-text"
              onClick={() => setIsDurationExpanded(!isDurationExpanded)}
            >
              <Text size="md" weight="medium">
                {duration} year{duration !== 1 ? "s" : ""}
              </Text>
            </div>
            <button
              className="ens-names-register-duration-btn"
              onClick={() => onDurationChange(1)}
            >
              <span style={{ fontSize: "20px", lineHeight: "1" }}>+</span>
            </button>
          </div>

          {isDurationExpanded && (
            <div className="ens-names-register-cost-breakdown">
              <CostSummary
                duration={duration}
                registrationCost={registrationCost}
                networkFee={networkFee}
                total={total}
                isLoading={isLoadingPrice}
                priceError={priceError}
              />
            </div>
          )}
        </div>

        <div
          className="ens-names-register-profile-card"
          onClick={handleAddProfile}
        >
          <div className="ens-names-register-profile-icon">
            <img src={ninjaLogo} alt="Profile Icon" />
          </div>
          <div className="ens-names-register-profile-text">
            <Text size="md" weight="bold">
              Complete your profile
            </Text>
            <Text size="sm" color="grey">
              Make your ENS more discoverable
            </Text>
          </div>
          <button className="ens-names-register-profile-arrow">
            <ChevronRight size={20} />
          </button>
        </div>

        <Button
          className="ens-names-register-next-btn"
          variant="solid"
          size="lg"
          onClick={onNext}
          disabled={!canProceed}
        >
          Next
        </Button>
      </div>

      {/* Select Records Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="md"
        footer={null}
        isDismissDisabled={true}
        style={{ maxWidth: "500px" }}
      >
        <div style={{ margin: "-20px" }}>
          <SelectRecordsForm
            records={records}
            onRecordsUpdated={(updatedRecords: EnsRecords) => {
              setRecords(updatedRecords);
            }}
          />
          <div
            style={{
              background: "#f4f4f4",
              gap: "7px",
              display: "flex",
              padding: "8px",
              paddingTop: "0",
            }}
          >
            <Button
              onClick={handleRecordsCancel}
              variant="outline"
              style={{ width: "50%" }}
              size="lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRecordsAdded}
              size="lg"
              style={{ width: "50%" }}
            >
              Add ({recordsToAdd})
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
