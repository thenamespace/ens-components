import React from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { ChainIcon } from "@/components/atoms/chain-icon/ChainIcon";
import { Button, Text } from "@/components/atoms";
import { getSupportedAddressByChainId } from "@/constants/records/addressConstants";
import { sepolia, mainnet } from "viem/chains";
import "./ConnectAndSetChain.css";

export interface ConnectAndSetChainProps {
  currentChainID?: number;
  requiredChainID: number;
  className?: string;
}

export const ConnectAndSetChain: React.FC<ConnectAndSetChainProps> = ({
  currentChainID,
  requiredChainID,
  className = "",
}) => {
  const { isConnected } = useAccount();
  const { switchChain } = useSwitchChain();

  // Get chain info from chain ID
  const getChainInfo = (chainId: number) => {
    // Handle testnets
    if (chainId === sepolia.id) {
      return {
        chainName: "eth" as const,
        label: "Sepolia",
      };
    }
    if (chainId === mainnet.id) {
      return {
        chainName: "eth" as const,
        label: "Ethereum",
      };
    }

    // Try to get from supportedAddresses
    const supportedAddress = getSupportedAddressByChainId(chainId);
    if (supportedAddress) {
      return {
        chainName: supportedAddress.chainName,
        label: supportedAddress.label,
      };
    }

    // Fallback
    return {
      chainName: "eth" as const,
      label: `Chain ${chainId}`,
    };
  };

  // If not connected, show connection message
  if (!isConnected) {
    return (
      <div className={`ns-connect-and-set-chain ${className}`}>
        <div className="ns-connect-and-set-chain-content">
          <div className="ns-connect-and-set-chain-icon">
            <span style={{ fontSize: "48px" }}>😢</span>
          </div>
          <div className="ns-connect-and-set-chain-message">
            <Text weight="medium" size="lg">
              Not Connected
            </Text>
            <Text size="xs" color="grey">
              Please connect your wallet to continue
            </Text>
          </div>
        </div>
      </div>
    );
  }

  // If connected but on wrong chain, show switch chain message
  const requiredChainInfo = getChainInfo(requiredChainID);
  const needsSwitch = currentChainID !== undefined && currentChainID !== requiredChainID;

  if (!needsSwitch) {
    return null;
  }

  const handleSwitch = () => {
    if (switchChain) {
      switchChain({ chainId: requiredChainID });
    }
  };

  return (
    <div className={`ns-connect-and-set-chain ${className}`}>
      <div className="ns-connect-and-set-chain-content">
        <div className="ns-connect-and-set-chain-icon">
          <ChainIcon chain={requiredChainInfo.chainName} size={48} />
        </div>
        <div className="ns-connect-and-set-chain-message">
          <Text weight="medium" size="lg">
            You are not on right network
          </Text>
          <Text size="xs" color="grey">
            Please switch to {requiredChainInfo.label} to continue
          </Text>
        </div>
      </div>
      <Button
        variant="solid"
        size="md"
        onClick={handleSwitch}
        className="ns-connect-and-set-chain-button"
      >
        Switch to {requiredChainInfo.label}
      </Button>
    </div>
  );
};

export default ConnectAndSetChain;

