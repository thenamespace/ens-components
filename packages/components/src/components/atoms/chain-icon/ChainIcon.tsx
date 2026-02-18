import React from "react";
import "./ChainIcon.css";
import type { ChainName } from "@/types";
import { EthSvg } from "./icons/EthSvg";
import { ArbSvg } from "./icons/ArbSvg";
import { BaseSvg } from "./icons/BaseSvg";
import { BitcoinSvg } from "./icons/BitcoinSvg";
import { MaticSvg } from "./icons/MaticSvg";
import { OpSvg } from "./icons/OpSvg";
import { SolSvg } from "./icons/SolSvg";
import { ZoraSvg } from "./icons/ZoraSvg";
import { CeloSvg } from "./icons/CeloSvg";

interface ChainIconProps extends React.SVGProps<SVGSVGElement> {
  chain: ChainName;
  size?: number;
}

export const ChainIcon: React.FC<ChainIconProps> = ({
  chain,
  size = 20,
  className,
  ...props
}) => {
  const renderIcon = () => {
    switch (chain) {
      case "eth":
        return <EthSvg size={size} {...props} />;
      case "arb":
        return <ArbSvg size={size} {...props} />;
      case "base":
        return <BaseSvg size={size} {...props} />;
      case "bitcoin":
        return <BitcoinSvg size={size} {...props} />;
      case "matic":
        return <MaticSvg size={size} {...props} />;
      case "op":
        return <OpSvg size={size} {...props} />;
      case "sol":
        return <SolSvg size={size} {...props} />;
      case "zora":
        return <ZoraSvg size={size} {...props} />;
      case "celo":
        return <CeloSvg size={size} {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className={`ns-chain-icon ${className || ""}`}>{renderIcon()}</div>
  );
};
