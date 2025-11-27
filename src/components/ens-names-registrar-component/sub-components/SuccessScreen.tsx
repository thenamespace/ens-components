import React, { useState, useEffect, useRef } from "react";
import Confetti from "react-confetti";
import finishLogo from "../../../assets/finish.png";
import { Button, Text, Icon } from "../../atoms";
import { Header } from "./Header";
import { CostSummary } from "./CostSummary";

interface SuccessScreenProps {
  ensName: string;
  duration: number;
  registrationCost: number;
  networkFee: number;
  total: number;
  expiryDate: string;
  onClose?: () => void;
  onRegisterAnother: () => void;
  onViewName: () => void;
}

export function SuccessScreen({
  ensName,
  duration,
  registrationCost,
  networkFee,
  total,
  expiryDate,
  onClose,
  onRegisterAnother,
  onViewName,
}: SuccessScreenProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardSize, setCardSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const updateSize = () => {
      if (cardRef.current) {
        setCardSize({
          width: cardRef.current.offsetWidth,
          height: cardRef.current.offsetHeight,
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div className="ens-names-register-container">
      <div
        ref={cardRef}
        className="ens-names-register-card ens-names-register-success-card"
        style={{ position: "relative", overflow: "hidden" }}
      >
        {cardSize.width > 0 && cardSize.height > 0 && (
          <Confetti
            width={cardSize.width}
            height={cardSize.height}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 0,
              pointerEvents: "none",
            }}
          />
        )}

        <div style={{ position: "relative", zIndex: 1 }}>
          <Header showBack={false} showClose={false} />

          <div className="ens-names-register-success-illustration">
            <img src={finishLogo} alt="Success Illustration" />
          </div>

          <div className="ens-names-register-success-title-section">
            <Text
              size="lg"
              weight="bold"
              className="ens-names-register-success-message"
            >
              Hooray! You've registered
            </Text>
            <Text
              size="xl"
              weight="bold"
              className="ens-names-register-success-name"
            >
              {ensName}.eth
            </Text>
          </div>

          <div className="ens-names-register-success-summary">
            <CostSummary
              duration={duration}
              registrationCost={registrationCost}
              networkFee={networkFee}
              total={total}
              showExpiry={true}
              expiryDate={expiryDate}
            />
          </div>

          <div className="ens-names-register-success-actions">
            <Button
              className="ens-names-register-register-another-btn"
              variant="outline"
              size="lg"
              onClick={onRegisterAnother}
            >
              Register another
            </Button>
            <Button
              className="ens-names-register-view-name-btn"
              variant="solid"
              size="lg"
              onClick={onViewName}
            >
              View Name
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
