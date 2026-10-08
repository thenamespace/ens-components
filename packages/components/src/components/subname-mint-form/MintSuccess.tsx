import React, { useState, useEffect, useRef } from "react";
import Confetti from "react-confetti";
import { Button, Identicon, Text } from "../atoms";
import { MintSuccessData } from "./SubnameMintForm";
import {
  getEnsAppUrl,
  getBlockExplorerTransactionUrl,
  getBlockExplorerName,
} from "@/utils";
import "../ens-name-registration/registration/SuccessScreen.css";

export interface MintSuccessProps {
  data: MintSuccessData;
  chainId: number;
  isTestnet: boolean;
  onClose?: () => void;
  onMintAnother?: () => void;
  onViewName?: () => void;
}

// Format ETH value, showing "Free" for zero
const formatEthValue = (value: string, isFree?: boolean): string => {
  const num = parseFloat(value);
  if (isFree || num === 0) return "Free";
  if (num < 0.00001) return ">0.00001";
  return num.toFixed(5);
};

// Format transaction fees
const formatTxFees = (value: string): string => {
  const num = parseFloat(value);
  if (num === 0) return "0";
  if (num < 0.00001) return ">0.00001";
  return num.toFixed(5);
};

export const MintSuccess: React.FC<MintSuccessProps> = ({
  data,
  chainId,
  isTestnet,
  onClose,
  onMintAnother,
  onViewName,
}) => {
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

  const currency = data.priceCurrency ?? "ETH";
  const priceNum = parseFloat(data.price);
  const feesNum = parseFloat(data.transactionFees);
  const isFree = priceNum === 0;
  const totalNum = priceNum + feesNum;

  const formatTotal = (): string => {
    if (isFree && feesNum === 0) return "Free";
    if (isFree) return formatTxFees(data.transactionFees);
    return formatEthValue(totalNum.toString());
  };

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

      <div
        className="ens-registration-success-card"
        style={{ position: "relative", zIndex: 1 }}
      >
        <div className="ens-registration-success-band">MINTED</div>

        <div className="ens-registration-success-body">
          <div className="ens-registration-success-title-section">
            <Identicon seed={data.fullName} size={44} />
            <span className="ens-registration-success-name">{data.fullName}</span>
          </div>

          <div className="ens-registration-success-summary">
            <div className="ens-registration-success-summary-row">
              <Text size="sm" color="grey">
                Mint price
              </Text>
              <Text size="sm" color="grey">
                {isFree
                  ? "Free"
                  : currency === "ETH"
                    ? `${formatEthValue(data.price)} ETH`
                    : `${data.price} ${currency}`}
              </Text>
            </div>
            {feesNum > 0 && (
              <div className="ens-registration-success-summary-row">
                <Text size="sm" color="grey">
                  Transaction fees
                </Text>
                <Text size="sm" color="grey">
                  {formatTxFees(data.transactionFees)} ETH
                </Text>
              </div>
            )}
            {currency === "ETH" && (
              <div className="ens-registration-success-summary-row ens-registration-success-total">
                <Text size="lg" weight="bold">
                  Total
                </Text>
                <div className="ens-registration-success-total-amount">
                  <Text size="lg" weight="bold">
                    {isFree && feesNum === 0 ? "Free" : `${formatTotal()} ETH`}
                  </Text>
                </div>
              </div>
            )}
            <div className="ens-registration-success-summary-row">
              <a
                href={getBlockExplorerTransactionUrl(chainId, data.txHash)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <Text size="xs" color="grey">
                  View on {getBlockExplorerName(chainId)} ↗
                </Text>
              </a>
            </div>
          </div>

          <div className="ens-registration-success-actions">
            <Button
              variant="outline"
              onClick={() => {
                if (onViewName) {
                  onViewName();
                } else {
                  window.open(
                    getEnsAppUrl(data.fullName, isTestnet),
                    "_blank",
                    "noopener,noreferrer"
                  );
                }
              }}
              className="ens-registration-success-view-name-btn"
            >
              View Name
            </Button>
            {onMintAnother && (
              <Button
                variant="outline"
                onClick={onMintAnother}
                className="ens-registration-success-register-another-btn"
              >
                Mint Another
              </Button>
            )}
          </div>
          <Button onClick={() => onClose?.()} size="lg" className="ns-wd-100 mt-2">
            Great!
          </Button>
        </div>
      </div>
    </div>
  );
};
