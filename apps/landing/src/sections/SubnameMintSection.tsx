import { useEffect, useState } from "react";
import { Anvil } from "lucide-react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { SubnameMintForm } from "@thenamespace/ens-components";
import { SectionHeader } from "../components/SectionHeader";
import { CodePanel } from "../components/CodePanel";
import { DemoPanel } from "../components/DemoPanel";
import { PropsEditor } from "../components/PropsEditor";
import { SideSwitch } from "../components/SideSwitch";
import { generateCode } from "../components/generateCode";
import type { PropDef } from "../components/types";
import { getParentOverride } from "../utils/parentOverride";

const MINT_DEFS: PropDef[] = [
  { key: "name",      type: "string",  default: "ninjabase.eth", tip: "The ENS name users will mint subnames under", required: true, readonly: true },
  { key: "title",     type: "string",  default: "",           tip: "Override the form title text", placeholder: "title..." },
  { key: "subtitle",  type: "string",  default: "",           tip: "Optional subtitle shown below the title", placeholder: "subtitle..." },
  { key: "noBorder",  type: "boolean", default: true,  tip: "Remove the card border, for embedding in your own container" },
];

export function SubnameMintSection({ isTestnet }: { isTestnet: boolean }) {
  const { openConnectModal } = useConnectModal();
  // ENSv1 stays available here only for names on an old Namespace listing.
  const [version, setVersion] = useState<1 | 2>(2);
  // ninjabase.eth has a v1 listing but no ENSv2 activation on mainnet; arthy0.eth has one.
  const parentName = isTestnet
    ? (getParentOverride() ?? "arti.eth")
    : version === 2
      ? "arthy0.eth"
      : "ninjabase.eth";
  const [values, setValues] = useState<Record<string, any>>(() => ({
    ...Object.fromEntries(MINT_DEFS.map((d) => [d.key, d.default])),
    name: parentName,
  }));
  const [mountKey, setMountKey] = useState(0);

  const onChange = (key: string, val: any) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  useEffect(() => {
    setValues((prev) => ({ ...prev, name: parentName }));
  }, [isTestnet, parentName]);

  const code = generateCode("SubnameMintForm", MINT_DEFS, values, [
    `isTestnet={${isTestnet}}`,
    `parentName="${parentName}"`,
    ...(version === 1 ? ["version={1}"] : []),
  ]);

  return (
    <section className="section" id="subname-mint">
      <SectionHeader
        icon={Anvil}
        name="Onchain Subnames"
        title="Mint Onchain Subnames"
        desc="Full minting flow for onchain subnames: price lookup, profile records, and the mint transaction. Mints under a name activated for ENSv2, paid in ETH, USDC, or DAI. Switch to ENSv1 for names on an old Namespace listing."
      />
      <div className="component-grid">
        <DemoPanel>
          <SubnameMintForm
            key={`${String(isTestnet)}-${version}-${mountKey}`}
            parentName={parentName}
            isTestnet={isTestnet}
            noBorder={values.noBorder}
            version={version}
            title={values.title || undefined}
            subtitle={values.subtitle || "Get a subname, and join Namespace Ninjas."}
            onConnectWallet={openConnectModal}
            onCancel={() => setMountKey((k) => k + 1)}
          />
        </DemoPanel>
        <div className="code-col">
          <SideSwitch
            left="ENSv1 (old listings)"
            right="ENSv2"
            isRight={version === 2}
            onChange={(v2) => setVersion(v2 ? 2 : 1)}
            className="mint-version"
            testId="mint-version-switch"
          />
          <CodePanel title="SubnameMintForm.tsx" code={code} />
          <PropsEditor defs={MINT_DEFS} values={values} onChange={onChange} />
        </div>
      </div>
    </section>
  );
}
