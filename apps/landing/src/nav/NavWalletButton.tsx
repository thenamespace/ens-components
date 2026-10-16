import { useEffect, useState } from "react";
import { useAccount, useDisconnect, usePublicClient } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { LogOut } from "lucide-react";

export function NavWalletButton() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();
  const publicClient = usePublicClient();
  const [ensName, setEnsName] = useState<string | null>(null);
  const [ensAvatar, setEnsAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (!address || !publicClient) {
      setEnsName(null);
      setEnsAvatar(null);
      return;
    }
    publicClient.getEnsName({ address }).then(name => {
      setEnsName(name);
      if (name) {
        publicClient.getEnsAvatar({ name }).then(setEnsAvatar).catch(() => setEnsAvatar(null));
      } else {
        setEnsAvatar(null);
      }
    }).catch(() => { setEnsName(null); setEnsAvatar(null); });
  }, [address, publicClient]);

  if (isConnected && address) {
    const short = `${address.slice(0, 6)}...${address.slice(-4)}`;
    return (
      <div className="nav-wallet-connected">
        <div className="nav-wallet-avatar">
          {ensAvatar ? (
            <img src={ensAvatar} alt="avatar" className="nav-wallet-avatar-img" />
          ) : (
            <div className="nav-wallet-avatar-placeholder" />
          )}
        </div>
        <span className="nav-wallet-addr" data-testid="nav-wallet-address">{ensName ?? short}</span>
        <button
          className="nav-wallet-disconnect"
          onClick={() => disconnect()}
          title="Disconnect"
        >
          <LogOut size={14} />
        </button>
      </div>
    );
  }

  return (
    <button className="nav-wallet-btn" data-testid="nav-connect-wallet" onClick={openConnectModal}>
      Connect Wallet
    </button>
  );
}
