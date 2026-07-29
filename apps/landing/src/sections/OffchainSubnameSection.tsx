import { useEffect, useMemo, useState } from "react";
import { Unlink } from "lucide-react";
import { createOffchainClient } from "@thenamespace/offchain-manager";
import { OffchainSubnameForm } from "@thenamespace/ens-components";
import { SectionHeader } from "../components/SectionHeader";
import { CodePanel } from "../components/CodePanel";
import { DemoPanel } from "../components/DemoPanel";
import { PropsEditor } from "../components/PropsEditor";
import type { PropDef } from "../components/types";
import { isValidEnsParentName } from "../utils/ensName";

const OFFCHAIN_DEFS: PropDef[] = [
  { key: "name",      type: "string",  default: "yourname.eth", required: true, readonly: true, tip: "Parent ENS name, including an ENS-imported DNS name such as example.com" },
  { key: "isTestnet", type: "boolean", default: false,           tip: "Use Sepolia testnet instead of Ethereum mainnet" },
  { key: "label",     type: "string",  default: "",              tip: "Pre-fill and lock the subname label", placeholder: "alice" },
  { key: "title",     type: "string",  default: "",              tip: "Override the default header title text", placeholder: "Create your subname" },
  { key: "subtitle",  type: "string",  default: "",              tip: "Optional subtitle shown below the title", placeholder: "Enter a subname to get started" },
  { key: "hideTitle", type: "boolean", default: false,           tip: "Hide the title header entirely" },
];

function generateOffchainCode(values: Record<string, any>, isTestnet: boolean): string {
  const mode = isTestnet ? "sepolia" : "mainnet";
  const lines: string[] = [];
  if (values.label)     lines.push(`  label="${values.label}"`);
  if (values.title)     lines.push(`  title="${values.title}"`);
  if (values.subtitle)  lines.push(`  subtitle="${values.subtitle}"`);
  if (values.hideTitle) lines.push("  hideTitle={true}");
  const extraProps = lines.length ? "\n" + lines.join("\n") + "\n" : "";
  return `import { OffchainSubnameForm } from "@thenamespace/ens-components";
import { createOffchainClient } from "@thenamespace/offchain-manager";

const offchainManager = createOffchainClient({
  domainApiKeys: { "yourname.eth": "your-api-key" },
  mode: "${mode}",
});

<OffchainSubnameForm
  name="yourname.eth"
  offchainManager={offchainManager}${extraProps}
  onSubnameCreated={async (data) => {
    await offchainManager.createSubname(data);
  }}
  onSubnameUpdated={async (data) => {
    await offchainManager.updateSubname(data.fullSubname, data);
  }}
/>`;
}

export function OffchainSubnameSection({ isTestnet, onIsTestnetChange }: { isTestnet: boolean; onIsTestnetChange: (v: boolean) => void }) {
  const [values, setValues] = useState<Record<string, any>>(() => ({
    ...Object.fromEntries(OFFCHAIN_DEFS.map((d) => [d.key, d.default])),
    isTestnet,
  }));
  const [ensName, setEnsName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [offchainMountKey, setOffchainMountKey] = useState(0);

  const onChange = (key: string, val: any) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    if (key === "isTestnet") onIsTestnetChange(val);
  };

  useEffect(() => {
    setValues((prev) => ({ ...prev, isTestnet }));
  }, [isTestnet]);

  const isNameValid = useMemo(
    () => isValidEnsParentName(ensName),
    [ensName]
  );
  const isApiKeyValid = /^ns-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(apiKey.trim());
  const isReady = isNameValid && isApiKeyValid;

  const offchainManager = useMemo(() => createOffchainClient({
    domainApiKeys: { [ensName || "yourname.eth"]: apiKey },
    mode: isTestnet ? "sepolia" : "mainnet",
  }), [isTestnet, ensName, apiKey]);

  const code = generateOffchainCode(values, isTestnet);

  return (
    <section className="section" id="offchain-subname">
      <SectionHeader
        icon={Unlink}
        name="Offchain Subnames"
        title="Create Offchain Subnames"
        desc="Let users claim subnames instantly via the Namespace API. Supports .eth names and DNS names imported into ENS, with no gas or on-chain transaction."
      />
      <div className="component-grid">
        <div className="code-col">
          <CodePanel title="OffchainSubnameForm.tsx" code={code} />
          <PropsEditor defs={OFFCHAIN_DEFS} values={values} onChange={onChange} />
        </div>
        <DemoPanel>
          <div className="offchain-gate">
            <div className="offchain-gate-fields">
              <div className="offchain-gate-field">
                <label className="offchain-gate-label">ENS or DNS Name</label>
                <input
                  className="ens-lookup-input"
                  type="text"
                  value={ensName}
                  placeholder="yourname.eth or example.com"
                  onChange={(e) => setEnsName(e.target.value.trim().toLowerCase())}
                />
              </div>
              <div className="offchain-gate-field">
                <label className="offchain-gate-label">API Key</label>
                <input
                  className="ens-lookup-input"
                  type="text"
                  value={apiKey}
                  placeholder="your-api-key"
                  onChange={(e) => setApiKey(e.target.value.trim())}
                />
              </div>
            </div>
            <p className="offchain-gate-hint" style={{ marginBottom: 10 }}>
              Navigate to{" "}
              <a href="https://dev.namespace.ninja" target="_blank" rel="noreferrer">
                dev.namespace.ninja
              </a>{" "}
              (Dev Portal) and generate an API key for your name.
            </p>
          </div>
          <div style={isReady ? undefined : { opacity: 0.4, pointerEvents: "none" }}>
            <OffchainSubnameForm
              key={`${String(isTestnet)}-${values.label}-${ensName}-${offchainMountKey}`}
              name={ensName || "yourname.eth"}
              offchainManager={offchainManager}
              isTestnet={isTestnet}
              label={values.label || undefined}
              title={values.title || undefined}
              subtitle={values.subtitle || undefined}
              hideTitle={values.hideTitle}
              onCancel={() => setOffchainMountKey((k) => k + 1)}
              onSubnameCreated={async (data) => {
                await offchainManager.createSubname({
                  parentName: data.parentName,
                  label: data.label,
                  addresses: data.addresses,
                  texts: data.texts,
                  owner: data.owner,
                });
                setOffchainMountKey((k) => k + 1);
              }}
              onSubnameUpdated={async (data) => {
                await offchainManager.updateSubname(data.fullSubname, {
                  addresses: data.addresses,
                  texts: data.texts,
                });
                setOffchainMountKey((k) => k + 1);
              }}
            />
          </div>
        </DemoPanel>
      </div>
    </section>
  );
}
