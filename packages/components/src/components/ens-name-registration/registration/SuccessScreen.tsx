import React, { useState, useEffect, useRef } from "react";
import Confetti from "react-confetti";
import { Button, Identicon, Tag, Text } from "../../atoms";
import { getEnsAppUrl } from "@/utils";
import "./SuccessScreen.css";

interface SuccessScreenProps {
  ensName: string;
  durationLabel: string;
  registrationCost: string; // ETH value as string
  transactionFees: string; // ETH value as string
  total: string; // ETH value as string
  expiryDate: string;
  currency?: string;
  isTestnet?: boolean;
  onGreat?: () => void;
  onRegisterAnother: () => void;
  onViewName?: () => void;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({
  ensName,
  durationLabel,
  registrationCost,
  transactionFees,
  total,
  expiryDate,
  currency = "ETH",
  isTestnet = false,
  onGreat,
  onRegisterAnother,
  onViewName,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardSize, setCardSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const updateSize = () => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        setCardSize({
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
    <div className="ens-registration-success-container">
      <div className="ens-registration-success-card" ref={cardRef}>
        {cardSize.width > 0 && cardSize.height > 0 && (
          <Confetti
            width={cardSize.width}
            height={cardSize.height}
            recycle={false}
            numberOfPieces={150}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 2,
              pointerEvents: "none",
            }}
          />
        )}
        <div className="ens-registration-success-body">
          <div className="ens-registration-success-title-section">
            <Identicon seed={`${ensName}.eth`} size={44} />
            <div className="ens-registration-success-name-col">
              <Tag tone="blue">REGISTERED</Tag>
              <span
                className="ens-registration-success-name"
                data-testid="registration-success-name"
              >
                {ensName}.eth
              </span>
            </div>
          </div>
          <div className="ens-registration-success-summary">
            <div className="ens-registration-success-summary-row">
              <Text size="sm" color="grey">
                {durationLabel} registration
              </Text>
              <Text size="sm" color="grey">
                {currency === "ETH"
                  ? `${parseFloat(registrationCost).toFixed(4)} ETH`
                  : `${registrationCost} ${currency}`}
              </Text>
            </div>
            <div className="ens-registration-success-summary-row">
              <Text size="sm" color="grey">
                Transaction fees
              </Text>
              <Text size="sm" color="grey">
                {parseFloat(transactionFees).toFixed(4)} ETH
              </Text>
            </div>
            {currency === "ETH" && (
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
            )}
            <div className="ens-registration-success-summary-row ens-registration-success-expiry">
              <Text size="sm" color="grey">
                Name Expires
              </Text>
              <Text size="sm" color="grey">
                {expiryDate}
              </Text>
            </div>
          </div>

          <div className="ens-registration-success-buttons">
            <div className="ens-registration-success-actions">
              <Button
                variant="outline"
                onClick={onRegisterAnother}
                className="ens-registration-success-register-another-btn"
              >
                Register another
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (onViewName) {
                    onViewName();
                  } else {
                    window.open(
                      getEnsAppUrl(`${ensName}.eth`, isTestnet),
                      "_blank",
                      "noopener,noreferrer"
                    );
                  }
                }}
                className="ens-registration-success-view-name-btn"
              >
                View Name
              </Button>
            </div>
            <Button onClick={() => onGreat?.()} size="lg" className="ns-wd-100">
              Great!
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
