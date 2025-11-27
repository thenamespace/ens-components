import React, { useState, useEffect, useRef } from "react";
import Confetti from "react-confetti";
import finishLogo from "../../../assets/finish.png";
import { Button, Text } from "../../atoms";

export interface OnchainSuccessScreenProps {
  name: string;
  onClose?: () => void;
  onFinish?: () => void;
}

export function OnchainSuccessScreen({
  name,
  onClose,
  onFinish,
}: OnchainSuccessScreenProps) {
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
    <div
      ref={cardRef}
      className="ns-onchain-register-card ns-onchain-register-success"
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

        <div className="ns-onchain-register-finish-banner">
          <img src={finishLogo} alt="Success" />
        </div>

        <div className="ns-onchain-register-success-title-section">
          <Text
            size="xl"
            weight="light"
            className="ns-onchain-register-success-message"
          >
            hurrahhhhh you have minted this
          </Text>
          <Text
            size="lg"
            weight="bold"
            className="ns-onchain-register-success-name"
          >
            {name}
          </Text>
        </div>

        <div className="ns-onchain-register-actions">
          <Button className="primary finish-btn" onClick={onFinish || onClose}>
            Finish
          </Button>
        </div>
    </div>
  );
}
