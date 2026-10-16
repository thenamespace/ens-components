import { SideSwitch } from "../components/SideSwitch";

export function EnsVersionSwitch({
  version,
  onChange,
  v2Disabled,
}: {
  version: 1 | 2;
  onChange: (v: 1 | 2) => void;
  v2Disabled?: boolean;
}) {
  return (
    <SideSwitch
      left="ENSv1"
      right="ENSv2"
      isRight={version === 2}
      onChange={(v2) => onChange(v2 ? 2 : 1)}
      disabled={v2Disabled && version === 1}
      title={v2Disabled ? "ENSv2 is only on Sepolia. Switch the network to use it." : undefined}
      className="nav-version"
      testId="ens-version-switch"
    />
  );
}
