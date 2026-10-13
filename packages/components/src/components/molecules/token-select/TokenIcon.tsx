import React from "react";
import { EthSvg } from "@/components/atoms/chain-icon/icons/EthSvg";
import { DaiIcon } from "./icons/DaiIcon";
import { UsdcIcon } from "./icons/UsdcIcon";

interface TokenIconProps {
  symbol: string;
  size?: number;
}

export const TokenIcon: React.FC<TokenIconProps> = ({ symbol, size = 16 }) => {
  switch (symbol.toUpperCase()) {
    case "ETH":
      return <EthSvg size={size} />;
    case "USDC":
      return <UsdcIcon height={size} width={size} />;
    case "DAI":
      return <DaiIcon height={size} width={size} />;
    default:
      return null;
  }
};

export default TokenIcon;
