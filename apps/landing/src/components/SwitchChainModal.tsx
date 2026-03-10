import { useAccount, useSwitchChain } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { useState } from "react";
import { Link } from "lucide-react";

export function SwitchChainModal({ isTestnet }: { isTestnet: boolean }) {
  const { isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const [switching, setSwitching] = useState(false);

  const targetChain = isTestnet ? sepolia : mainnet;
  const isWrongChain = isConnected && chainId !== targetChain.id;

  if (!isWrongChain) return null;

  const handleSwitch = async () => {
    setSwitching(true);
    try {
      await switchChain({ chainId: targetChain.id });
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="switch-chain-overlay">
      <div className="switch-chain-modal">
        <div className="switch-chain-icon"><Link size={32} strokeWidth={2} /></div>
        <h3 className="switch-chain-title">Wrong Network</h3>
        <p className="switch-chain-desc">
          This demo is running on <strong>{targetChain.name}</strong>.
          Please switch your wallet to continue.
        </p>
        <button
          className="switch-chain-btn"
          onClick={handleSwitch}
          disabled={switching}
        >
          {switching ? "Switching…" : `Switch to ${targetChain.name}`}
        </button>
      </div>
    </div>
  );
}
