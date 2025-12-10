import React, { useState, useEffect } from "react";
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
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const updateSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <>
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 9999,
          pointerEvents: "none",
        }}
      />
      <div
        className="ns-onchain-register-card ns-onchain-register-success"
        style={{ position: "relative", overflow: "hidden" }}
      >
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
    </>
  );
}
