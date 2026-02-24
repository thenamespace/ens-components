import { Button, Tooltip, Text, ShurikenSpinner } from "@/components/atoms";

export interface MintFormActionsProps {
  onCancel: () => void;
  onMint: () => void;
  isMintDisabled: boolean;
  isWaitingWallet?: boolean;
  needsChainSwitch?: boolean;
  chainName?: string;
  onSwitchChain?: () => void;
  isSwitchingChain?: boolean;
  isConnected?: boolean;
  onConnectWallet?: () => void;
}

export const MintFormActions = ({
  onCancel,
  onMint,
  isMintDisabled,
  isWaitingWallet = false,
  needsChainSwitch = false,
  chainName = "",
  onSwitchChain,
  isSwitchingChain = false,
  isConnected = true,
  onConnectWallet,
}: MintFormActionsProps) => {
  const handlePrimaryClick = () => {
    if (!isConnected) {
      onConnectWallet?.();
      return;
    }
    if (needsChainSwitch && onSwitchChain) {
      onSwitchChain();
    } else {
      onMint();
    }
  };

  const getButtonLabel = () => {
    if (!isConnected) return "Connect Wallet";
    if (isWaitingWallet) return "Waiting for wallet...";
    if (needsChainSwitch) return `Switch to ${chainName}`;
    return "Mint";
  };

  const isDisabled = () => {
    if (!isConnected) return false;
    if (isWaitingWallet) return true;
    if (needsChainSwitch) return isSwitchingChain;
    return isMintDisabled;
  };

  const primaryButton = (
    <Button
      size="lg"
      disabled={isDisabled()}
      onClick={handlePrimaryClick}
      loading={isWaitingWallet}
    >
      {getButtonLabel()}
    </Button>
  );

  return (
    <div className="ens-update-records-form-actions mt-2">
      <Button
        variant="outline"
        size="lg"
        onClick={onCancel}
        disabled={isWaitingWallet}
      >
        Cancel
      </Button>
      {needsChainSwitch ? (
        <Tooltip
          content={
            <Text size="xs">
              This listing is on {chainName}. Switch chain to continue.
            </Text>
          }
          position="top"
          maxWidth={250}
          className="ns-mint-action-tooltip"
        >
          {primaryButton}
        </Tooltip>
      ) : (
        primaryButton
      )}
    </div>
  );
};
