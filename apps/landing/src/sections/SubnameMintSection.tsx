import { useEffect, useState } from "react";
import { Anvil } from "lucide-react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { SubnameMintForm } from "@thenamespace/ens-components";
import { SectionHeader } from "../components/SectionHeader";
import { CodePanel } from "../components/CodePanel";
import { DemoPanel } from "../components/DemoPanel";
import { PropsEditor } from "../components/PropsEditor";
import { generateCode } from "../components/generateCode";
import type { PropDef } from "../components/types";

const MINT_DEFS: PropDef[] = [
  { key: "name",      type: "string",  default: "ninjabase.eth", tip: "The ENS name users will mint subnames under", required: true, readonly: true },
  { key: "isTestnet", type: "boolean", default: false,        tip: "Use Sepolia testnet instead of Ethereum mainnet" },
  { key: "title",     type: "string",  default: "",           tip: "Override the form title text", placeholder: "title..." },
  { key: "subtitle",  type: "string",  default: "",           tip: "Optional subtitle shown below the title", placeholder: "subtitle..." },
];

export function SubnameMintSection({ isTestnet, onIsTestnetChange }: { isTestnet: boolean; onIsTestnetChange: (v: boolean) => void }) {
  const { openConnectModal } = useConnectModal();
  const parentName = isTestnet ? "unicorn.eth" : "ninjabase.eth";
  const [values, setValues] = useState<Record<string, any>>(() => ({
    ...Object.fromEntries(MINT_DEFS.map((d) => [d.key, d.default])),
    isTestnet,
    name: parentName,
  }));
  const [mountKey, setMountKey] = useState(0);

  const onChange = (key: string, val: any) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    if (key === "isTestnet") onIsTestnetChange(val);
  };

  useEffect(() => {
    setValues((prev) => ({ ...prev, isTestnet, name: parentName }));
  }, [isTestnet, parentName]);

  const code = generateCode("SubnameMintForm", MINT_DEFS, values, [
    `parentName="${parentName}"`,
  ]);

  return (
    <section className="section" id="subname-mint">
      <SectionHeader
        icon={Anvil}
        name="Onchain Subnames"
        title="Mint Onchain Subnames"
        desc="Full minting flow for onchain subnames: price lookup, profile records, and the mint transaction. Works with any ENS name using the Namespace L2 resolver."
      />
      <div className="component-grid">
        <DemoPanel>
          <SubnameMintForm
            key={`${String(isTestnet)}-${mountKey}`}
            parentName={parentName}
            isTestnet={isTestnet}
            title={values.title || undefined}
            subtitle={values.subtitle || undefined}
            onConnectWallet={openConnectModal}
            onCancel={() => setMountKey((k) => k + 1)}
            onSuccess={() => setMountKey((k) => k + 1)}
          />
        </DemoPanel>
        <div className="code-col">
          <CodePanel title="SubnameMintForm.tsx" code={code} />
          <PropsEditor defs={MINT_DEFS} values={values} onChange={onChange} />
        </div>
      </div>
    </section>
  );
}
