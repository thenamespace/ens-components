import React, { useState, useEffect, useRef } from "react";
import Confetti from "react-confetti";
import finishLogo from "../../../assets/finish.png";
import { Button, Text } from "../../atoms";
import "./SuccessScreen.css";

interface SuccessScreenProps {
  ensName: string;
  expiryInYears: number;
  registrationCost: string; // ETH value as string
  transactionFees: string; // ETH value as string
  total: string; // ETH value as string
  expiryDate: string;
  isTestnet?: boolean;
  onClose?: () => void;
  onRegisterAnother: () => void;
  onViewName?: () => void;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({
  ensName,
  expiryInYears,
  registrationCost,
  transactionFees,
  total,
  expiryDate,
  isTestnet = false,
  onClose,
  onRegisterAnother,
  onViewName,
}) => {
  const getEnsAppUrl = () => {
    const baseUrl = isTestnet 
      ? "https://sepolia.app.ens.domains" 
      : "https://app.ens.domains";
    return `${baseUrl}/${ensName}.eth`;
  };
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div
      ref={containerRef}
      className="ens-registration-success-container"
      style={{ position: "relative", overflow: "hidden" }}
    >
      {containerSize.width > 0 && containerSize.height > 0 && (
        <Confetti
          width={containerSize.width}
          height={containerSize.height}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
      )}

      <div className="ens-registration-success-card" style={{ position: "relative", zIndex: 1 }}>
        <div className="ens-registration-success-illustration">
          <img src={finishLogo} alt="Success Illustration" />
        </div>

        <div className="ens-registration-success-title-section">
          <Text size="lg" weight="bold" className="ens-registration-success-message">
            Hooray! You've registered
          </Text>
          <Text size="lg" weight="bold" className="ens-registration-success-name">
            {ensName}.eth
          </Text>
        </div>

        <div className="ens-registration-success-summary">
          <div className="ens-registration-success-summary-row">
            <Text size="sm" color="grey">{expiryInYears} year registration</Text>
            <Text size="sm" color="grey">
              {parseFloat(registrationCost).toFixed(4)} ETH
            </Text>
          </div>
          <div className="ens-registration-success-summary-row">
            <Text size="sm" color="grey">Transaction fees</Text>
            <Text size="sm" color="grey">
              {parseFloat(transactionFees).toFixed(4)} ETH
            </Text>
          </div>
          <div className="ens-registration-success-summary-row ens-registration-success-total">
            <Text size="lg" weight="bold">
              Total
            </Text>
            <div className="ens-registration-success-total-amount">
              <Text size="lg" weight="bold">
                {parseFloat(total).toFixed(4)} ETH
              </Text>
            </div>
          </div>
          <div className="ens-registration-success-summary-row ens-registration-success-expiry">
            <Text size="sm" color="grey">Name Expires</Text>
            <Text size="sm" color="grey">
              {expiryDate}
            </Text>
          </div>
        </div>

        <div className="ens-registration-success-actions">
          <Button
            variant="outline"
            size="lg"
            onClick={onRegisterAnother}
            className="ens-registration-success-register-another-btn"
          >
            Register another
          </Button>
          <Button
            variant="solid"
            size="lg"
            onClick={() => {
              if (onViewName) {
                onViewName();
              } else {
                window.open(getEnsAppUrl(), "_blank", "noopener,noreferrer");
              }
            }}
            className="ens-registration-success-view-name-btn"
          >
            View Name
          </Button>
        </div>
      </div>
    </div>
  );
};

