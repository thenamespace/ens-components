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
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        // Use full viewport dimensions for confetti to cover entire modal
        setContainerSize({
          width: window.innerWidth,
          height: window.innerHeight,
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
      className="ens-names-register-container"
      style={{ position: "relative", overflow: "hidden", minHeight: "100vh" }}
    >
      {containerSize.width > 0 && containerSize.height > 0 && (
        <Confetti
          width={containerSize.width}
          height={containerSize.height}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
      )}

      <div
        className="ens-names-register-card ens-names-register-success-card"
        style={{ position: "relative", zIndex: 1 }}
      >
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
  );
}
