import { SideSwitch } from "../components/SideSwitch";

export function EnsVersionSwitch({
  version,
  onChange,
}: {
  version: 1 | 2;
  onChange: (v: 1 | 2) => void;
}) {
  return (
    <SideSwitch
      left="ENSv1"
      right="ENSv2"
      isRight={version === 2}
      onChange={(v2) => onChange(v2 ? 2 : 1)}
      className="nav-version"
      testId="ens-version-switch"
    />
  );
}
