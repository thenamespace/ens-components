import React, { useState, useEffect, useRef } from "react";
import Confetti from "react-confetti";
import finishLogo from "../../../assets/finish.png";
import ninjaLogo from "../../../assets/ninja.png";
import { ChevronRight } from "lucide-react";
import { Button, Text } from "../../atoms";

interface OffchainSuccessScreenProps {
  name: string;
  onClose?: () => void;
  onSetProfile?: () => void;
  onFinish?: () => void;
}

export function OffchainSuccessScreen({
  name,
  onClose,
  onSetProfile,
  onFinish,
}: OffchainSuccessScreenProps) {
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
    <div className="ns-offchain-register-container">
      <div
        ref={cardRef}
        className="ns-offchain-register-card ns-offchain-register-success"
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

        <div className="ns-offchain-register-finish-banner">
          <img src={finishLogo} alt="Success" />
        </div>

        <div className="ns-offchain-register-success-title-section">
          <Text
            size="xl"
            weight="light"
            className="ns-offchain-register-success-message"
          >
            hurrahhhhh you have minted this
          </Text>
          <Text
            size="lg"
            weight="bold"
            className="ns-offchain-register-success-name"
          >
            {name}
          </Text>
        </div>

        {onSetProfile && (
          <div
            className="ns-offchain-register-profile-card"
            onClick={onSetProfile}
          >
            <div className="ns-offchain-register-profile-icon">
              <img src={ninjaLogo} alt="Profile Icon" />
            </div>
            <div className="ns-offchain-register-profile-text">
              <Text size="md" weight="bold">
                Complete your profile
              </Text>
              <Text size="sm" color="grey">
                Make your ENS more discoverable
              </Text>
            </div>
            <button className="ns-offchain-register-profile-arrow">
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        <div className="ns-offchain-register-actions">
          <Button className="primary finish-btn" onClick={onFinish || onClose}>
            Finish
          </Button>
        </div>
      </div>
    </div>
  );
}
