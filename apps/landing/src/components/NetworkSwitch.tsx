import { SideSwitch } from "./SideSwitch";

export function NetworkSwitch({
  isTestnet,
  onChange,
}: {
  isTestnet: boolean;
  onChange: (testnet: boolean) => void;
}) {
  return (
    <SideSwitch
      left="Testnet"
      right="Mainnet"
      isRight={!isTestnet}
      onChange={mainnet => onChange(!mainnet)}
      className="hero-network"
      testId="network-switch"
    />
  );
}
