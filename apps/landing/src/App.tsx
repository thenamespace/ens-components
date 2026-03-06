import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAccount, useDisconnect, usePublicClient } from "wagmi";
import { createOffchainClient } from "@thenamespace/offchain-manager";
import { namehash } from "viem/ens";
import ninjaBanner from "./assets/ninja-banner.png";
import logoFull from "./assets/logo-full.png";
import logoIcon from "./assets/logo-icon.png";
import ensSvg from "./assets/ens.svg";
import shurikenSvg from "./assets/shuriken.svg";
import ninjaSvg from "./assets/ninja.svg";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import {
  EnsNameRegistrationForm,
  EnsRecordsForm,
  OffchainSubnameForm,
  SelectRecordsForm,
  SubnameMintForm,
} from "@thenamespace/ens-components";
import type { EnsRecords } from "@thenamespace/ens-components";
import {
  ChevronDown,
  LogOut,
  GitBranch,
  Send,
  Rocket,
} from "lucide-react";
import "./landing.css";

// ─── Prop editor types ────────────────────────────────────────────────────────

type BoolProp = { key: string; type: "boolean"; default: boolean; tip?: string; required?: boolean; readonly?: boolean };
type StrProp  = { key: string; type: "string";  default: string;  tip?: string; placeholder?: string; required?: boolean; readonly?: boolean };
type NumProp  = { key: string; type: "number";  default: number;  tip?: string; required?: boolean; readonly?: boolean };
type PropDef  = BoolProp | StrProp | NumProp;

// ─── Dynamic code generation ──────────────────────────────────────────────────

function generateCode(
  componentName: string,
  defs: PropDef[],
  values: Record<string, any>,
  extraLines: string[] = [],
): string {
  const propLines: string[] = [];
  for (const def of defs) {
    if (def.readonly) continue;
    const val = values[def.key];
    if (def.type === "boolean") {
      propLines.push(`  ${def.key}={${val}}`);
    } else if (def.type === "number") {
      if (val !== undefined && val !== "" && val !== null) {
        propLines.push(`  ${def.key}={${val}}`);
      }
    } else {
      if (val) propLines.push(`  ${def.key}="${val}"`);
    }
  }
  for (const line of extraLines) propLines.push(`  ${line}`);
  const body = propLines.length ? "\n" + propLines.join("\n") + "\n" : "";
  return `import { ${componentName} } from "@thenamespace/ens-components";\n\n<${componentName}${body}/>`;
}

// ─── PropsEditor ──────────────────────────────────────────────────────────────

function PropTip({ text }: { text: string }) {
  return (
    <span className="prop-tip">
      ?<span className="prop-tip-text">{text}</span>
    </span>
  );
}

function PropsEditor({
  defs,
  values,
  onChange,
}: {
  defs: PropDef[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="props-editor">
      <button className="props-editor-toggle" onClick={() => setOpen((o) => !o)}>
        <span className="props-editor-label">Props</span>
        <ChevronDown
          size={14}
          className={`props-chevron ${open ? "props-chevron-open" : ""}`}
        />
      </button>
      {open && (
        <table className="props-table">
          <thead>
            <tr>
              <th>Prop</th>
              <th>Type</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {defs.map((def) => (
              <tr key={def.key}>
                <td className="prop-name-cell">
                  <code>{def.key}</code>
                  {def.required && <span className="prop-required">*</span>}
                  {def.tip && <PropTip text={def.tip} />}
                </td>
                <td className="prop-type-cell">
                  <span className={`prop-type-badge type-${def.type}`}>{def.type}</span>
                </td>
                <td className="prop-value-cell">
                  {def.readonly ? (
                    <span className="prop-readonly-val">
                      {String(values[def.key] ?? "-")}
                    </span>
                  ) : def.type === "boolean" ? (
                    <button
                      className={`prop-toggle ${values[def.key] ? "on" : "off"}`}
                      onClick={() => onChange(def.key, !values[def.key])}
                    >
                      <span className="toggle-track">
                        <span className="toggle-thumb" />
                      </span>
                      <span className="toggle-val">{String(values[def.key])}</span>
                    </button>
                  ) : (
                    <input
                      className="prop-input"
                      type={def.type === "number" ? "number" : "text"}
                      value={values[def.key] ?? ""}
                      placeholder={(def as StrProp).placeholder ?? `${def.key}…`}
                      onChange={(e) =>
                        onChange(
                          def.key,
                          def.type === "number" ? Number(e.target.value) : e.target.value,
                        )
                      }
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function highlight(code: string) {
  const escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const parts = escaped.split(/(\"[^\"]*\")/g);
  return parts
    .map((part, i) => {
      if (i % 2 === 1) return `<span class="tok-str">${part}</span>`;
      return part
        .replace(/\b(import|from|const|export|default|return)\b/g, '<span class="tok-kw">$1</span>')
        .replace(/(\{|\})/g, '<span class="tok-tag">$1</span>')
        .replace(/([A-Z][A-Za-z]+)/g, '<span class="tok-fn">$1</span>');
    })
    .join("");
}

function CodePanel({ title, code }: { title: string; code: string }) {
  return (
    <div className="code-panel">
      <div className="code-panel-header">
        <span className="code-panel-title">{title}</span>
        <div className="code-panel-dots">
          <span className="code-panel-dot" style={{ background: "#FF5F57" }} />
          <span className="code-panel-dot" style={{ background: "#FEBC2E" }} />
          <span className="code-panel-dot" style={{ background: "#28C840" }} />
        </div>
      </div>
      <div className="code-panel-body">
        <pre dangerouslySetInnerHTML={{ __html: highlight(code) }} />
      </div>
    </div>
  );
}

function DemoPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="demo-panel">
      <div className="demo-panel-header">
        <span className="demo-panel-title">PLAYGROUND</span>
      </div>
      <div className="demo-panel-body">{children}</div>
    </div>
  );
}

type LucideIcon = typeof ChevronDown;
type SectionIcon = LucideIcon | string;

function SectionHeader({
  icon,
  name,
  title,
  desc,
}: {
  icon: SectionIcon;
  name: string;
  title: string;
  desc: string;
}) {
  const isImg = typeof icon === "string";
  const isShuriken = icon === shurikenSvg;
  const Icon = isImg ? null : icon as LucideIcon;
  const badgeRef = useRef<HTMLDivElement>(null);
  const [spin, setSpin] = useState(false);

  useEffect(() => {
    if (!isShuriken) return;
    const el = badgeRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setSpin(entry.isIntersecting);
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isShuriken]);

  return (
    <>
      <div className="section-icon-row">
        <div
          ref={badgeRef}
          className={`section-icon-badge${isImg ? " section-icon-badge-img" : ""}`}
        >
          {isImg
            ? <img src={icon as string} alt="" className={`section-icon-img${spin ? " section-icon-spin" : ""}`} />
            : Icon && <Icon size={20} strokeWidth={2.2} />
          }
        </div>
        <span className="section-icon-name">{name}</span>
      </div>
      <div className="section-desc-block">
        <h2>{title}</h2>
        <p>{desc}</p>
      </div>
    </>
  );
}

// ─── Quick Start ──────────────────────────────────────────────────────────────

const WAGMI_SETUP_CODE = `import "@thenamespace/ens-components/styles";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

export function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {/* ENS components go here */}
      </QueryClientProvider>
    </WagmiProvider>
  );
}`;

function QuickStartSection() {
  const [activeStep, setActiveStep] = useState<"01" | "02">("01");

  const steps = [
    {
      num: "01",
      dark: true,
      selectable: true,
      title: "Install the package",
      desc: "Add the library alongside its peer dependencies: wagmi and viem.",
    },
    {
      num: "02",
      dark: false,
      selectable: true,
      title: "Wrap with WagmiProvider",
      desc: "Configure wagmi once at your app root and add styles.",
    },
    {
      num: "03",
      dark: false,
      selectable: false,
      title: "Import and go live",
      desc: "Drop in any component with a few props.",
    },
  ];

  return (
    <section className="section" id="quickstart">
      <div className="section-icon-row">
        <div className="section-icon-badge">
          <Rocket size={20} strokeWidth={2.2} />
        </div>
        <span className="section-icon-name">Quick Start</span>
      </div>
      <div className="steps-grid">
        {steps.map((s) => (
          <div
            key={s.num}
            className={[
              "step-card",
              s.selectable ? "step-card-selectable" : "",
              s.selectable && activeStep === s.num ? "step-card-active" : "",
            ].filter(Boolean).join(" ")}
            onClick={s.selectable ? () => setActiveStep(s.num as "01" | "02") : undefined}
          >
            <div className={`step-num ${s.dark ? "step-num-dark" : "step-num-light"}`}>
              {s.num}
            </div>
            <h3 className="step-title">{s.title}</h3>
            <p className="step-desc">{s.desc}</p>
          </div>
        ))}
      </div>
      <div className="qs-code-blocks">
        {activeStep === "01" ? (
          <div className="install-block">
            <span className="install-prompt">$</span>
            <code>npm install @thenamespace/ens-components wagmi viem @tanstack/react-query</code>
          </div>
        ) : (
          <CodePanel title="providers.tsx" code={WAGMI_SETUP_CODE} />
        )}
      </div>
    </section>
  );
}

// ─── ENS Registration ─────────────────────────────────────────────────────────

const ENS_REG_DEFS: PropDef[] = [
  { key: "isTestnet",          type: "boolean", default: false, tip: "Use Sepolia testnet instead of Ethereum mainnet" },
  { key: "referrer",           type: "string",  default: "",    tip: "Registration referrer wallet address", placeholder: "0x… referral wallet" },
  { key: "noBorder",           type: "boolean", default: false, tip: "Remove the card border and shadow wrapper" },
  { key: "title",              type: "string",  default: "",    tip: "Override the form title text", placeholder: "title..." },
  { key: "subtitle",           type: "string",  default: "",    tip: "Override the subtitle below the title", placeholder: "subtitle..." },
  { key: "bannerImage",        type: "string",  default: "",    tip: "URL of a custom banner image to replace the default", placeholder: "https://…/image.png" },
  { key: "hideBanner",         type: "boolean", default: false, tip: "Hide the banner image entirely" },
  { key: "bannerWidth",        type: "number",  default: 250,   tip: "Width of the banner image in pixels" },
];

function EnsRegistrationSection({ isTestnet, onIsTestnetChange }: { isTestnet: boolean; onIsTestnetChange: (v: boolean) => void }) {
  const { openConnectModal } = useConnectModal();
  const [values, setValues] = useState<Record<string, any>>(() => ({
    ...Object.fromEntries(ENS_REG_DEFS.map((d) => [d.key, d.default])),
    isTestnet,
  }));

  const onChange = (key: string, val: any) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    if (key === "isTestnet") onIsTestnetChange(val);
  };

  useEffect(() => {
    setValues((prev) => ({ ...prev, isTestnet }));
  }, [isTestnet]);

  const code = generateCode("EnsNameRegistrationForm", ENS_REG_DEFS, values);

  return (
    <section className="section" id="ens-registration">
      <SectionHeader
        icon={ensSvg}
        name="ENS Registration"
        title="Register ENS Names"
        desc="Drop-in form that guides users through searching, selecting, and registering .eth names. Includes the full commit/register flow."
      />
      <div className="component-grid">
        <div className="code-col">
          <CodePanel title="EnsNameRegistrationForm.tsx" code={code} />
          <PropsEditor defs={ENS_REG_DEFS} values={values} onChange={onChange} />
        </div>
        <DemoPanel>
          <EnsNameRegistrationForm
            key={String(isTestnet)}
            isTestnet={isTestnet}
            referrer={values.referrer || undefined}
            noBorder={values.noBorder}
            title={values.title || undefined}
            subtitle={values.subtitle || undefined}
            bannerImage={values.bannerImage || undefined}
            hideBanner={values.hideBanner}
            bannerWidth={values.bannerWidth || undefined}
            avatarUploadDomain={values.avatarUploadDomain || undefined}
            onConnectWallet={openConnectModal}
          />
        </DemoPanel>
      </div>
    </section>
  );
}

// ─── ENS Records ──────────────────────────────────────────────────────────────

const RESOLVIO = "https://resolvio.namespace.ninja";

async function fetchEnsProfile(name: string) {
  const res = await fetch(`${RESOLVIO}/ens/v1/profile/${encodeURIComponent(name)}`);
  if (!res.ok) throw new Error("ENS name not found or has no records");
  const data = await res.json();
  return {
    addresses: (data.addresses || []).map((a: any) => ({
      coinType: a.coin,
      value: a.address,
    })),
    texts: (data.texts || []).map((t: any) => ({
      key: t.key,
      value: t.value,
    })),
  };
}

const ENS_REGISTRY = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e" as const;
const NAME_WRAPPER  = "0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401" as const;

const REGISTRY_ABI = [{
  name: "owner", type: "function", stateMutability: "view",
  inputs: [{ name: "node", type: "bytes32" }],
  outputs: [{ name: "", type: "address" }],
}] as const;

const WRAPPER_ABI = [{
  name: "ownerOf", type: "function", stateMutability: "view",
  inputs: [{ name: "id", type: "uint256" }],
  outputs: [{ name: "", type: "address" }],
}] as const;

const ENS_RECORDS_DEFS: PropDef[] = [
  { key: "name",              type: "string",  default: "yourname.eth",         required: true, readonly: true, tip: "Full ENS name whose records will be edited" },
  { key: "existingRecords",   type: "string",  default: "Existing name records", required: true, readonly: true, tip: "Current on-chain records pre-loaded from the ENS resolver" },
  { key: "isTestnet",         type: "boolean", default: false,                   tip: "Use Sepolia testnet instead of Ethereum mainnet" },
  { key: "noBorder",          type: "boolean", default: false,                   tip: "Remove the card border and shadow wrapper" },
  { key: "txConfirmations",   type: "number",  default: 1,                       tip: "Number of block confirmations to wait after a transaction" },
  { key: "resolverAddress",   type: "string",  default: "",  readonly: true,     tip: "Optional. Auto-detected from the ENS registry if not provided" },
  { key: "resolverChainId",   type: "number",  default: 1,   readonly: true,     tip: "Optional. Inferred from isTestnet if not provided" },
];

function EnsRecordsSection({ isTestnet, onIsTestnetChange }: { isTestnet: boolean; onIsTestnetChange: (v: boolean) => void }) {
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const pc = usePublicClient({ chainId: 1 });
  const [values, setValues] = useState<Record<string, any>>(() => ({
    ...Object.fromEntries(ENS_RECORDS_DEFS.map((d) => [d.key, d.default])),
    isTestnet,
  }));
  const [ensName, setEnsName] = useState("");
  const [submittedName, setSubmittedName] = useState("");
  const [existingRecords, setExistingRecords] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");

  const onChange = (key: string, val: any) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    if (key === "isTestnet") onIsTestnetChange(val);
  };

  useEffect(() => {
    setValues((prev) => ({ ...prev, isTestnet }));
  }, [isTestnet]);

  const displayValues = {
    ...values,
    name: submittedName || "yourname.eth",
    existingRecords: submittedName ? "{ addresses: [...], texts: [...] }" : "(fetched via Resolvio)",
    resolverAddress: "",
    resolverChainId: 0,
  };

  const lookupOwner = async (name: string): Promise<string> => {
    const node = namehash(name);
    const registryOwner = await pc!.readContract({
      address: ENS_REGISTRY,
      abi: REGISTRY_ABI,
      functionName: "owner",
      args: [node],
    });
    if (registryOwner.toLowerCase() === NAME_WRAPPER.toLowerCase()) {
      const tokenId = BigInt(node);
      const wrapperOwner = await pc!.readContract({
        address: NAME_WRAPPER,
        abi: WRAPPER_ABI,
        functionName: "ownerOf",
        args: [tokenId],
      });
      return (wrapperOwner as string).toLowerCase();
    }
    return (registryOwner as string).toLowerCase();
  };

  const handleLookup = async () => {
    const name = ensName.trim();
    if (!name) return;
    setLoading(true);
    setLookupError("");
    try {
      const owner = await lookupOwner(name);
      if (owner !== address?.toLowerCase()) {
        setLookupError("You are not permitted to edit records, try adding a name you own");
        return;
      }
      const records = await fetchEnsProfile(name);
      setExistingRecords(records);
      setSubmittedName(name);
    } catch (err: any) {
      if (!lookupError) {
        setLookupError(err.message || "Failed to fetch records");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmittedName("");
    setExistingRecords(null);
    setEnsName("");
    setLookupError("");
  };

  const code = generateCode("EnsRecordsForm", ENS_RECORDS_DEFS, displayValues, [
    `name="${submittedName || "yourname.eth"}"`,
    "existingRecords={existingRecords}",
  ]);

  return (
    <section className="section" id="ens-records">
      <SectionHeader
        icon={shurikenSvg}
        name="ENS Records"
        title="Edit Profile Records"
        desc="Full-featured editor for text records, addresses, contenthash, and avatar uploads. Reads existing records and writes them back via a resolver transaction."
      />
      <div className="component-grid">
        <DemoPanel>
          {!submittedName ? (
            <div className="ens-lookup-wrap">
              <p className="ens-lookup-title">Enter your ENS name</p>
              <p className="ens-lookup-sub">Load your current records to edit them</p>
              <input
                className="ens-lookup-input"
                type="text"
                value={ensName}
                placeholder="yourname.eth"
                onChange={(e) => setEnsName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && isConnected && !loading && handleLookup()}
              />
              {lookupError && <p className="ens-lookup-error">{lookupError}</p>}
              {!isConnected ? (
                <button className="ens-lookup-btn" onClick={openConnectModal}>
                  Connect Wallet
                </button>
              ) : (
                <button
                  className="ens-lookup-btn"
                  onClick={handleLookup}
                  disabled={!ensName.trim() || loading}
                >
                  {loading ? "Loading…" : "Update Records"}
                </button>
              )}
            </div>
          ) : (
            <div style={{ position: "relative" }}>
              <EnsRecordsForm
                key={`${submittedName}-${String(isTestnet)}-${values.resolverAddress}`}
                name={submittedName}
                isTestnet={isTestnet}
                resolverAddress={values.resolverAddress || undefined}
                resolverChainId={values.resolverChainId || undefined}
                noBorder={values.noBorder}
                txConfirmations={values.txConfirmations || undefined}
                avatarUploadDomain={values.avatarUploadDomain || undefined}
                existingRecords={existingRecords}
                onCancel={handleReset}
              />
            </div>
          )}
        </DemoPanel>
        <div className="code-col">
          <CodePanel title="EnsRecordsForm.tsx" code={code} />
          <PropsEditor defs={ENS_RECORDS_DEFS} values={values} onChange={onChange} />
        </div>
      </div>
    </section>
  );
}

// ─── Select Records ───────────────────────────────────────────────────────────

const SELECT_RECORDS_CODE = `import { SelectRecordsForm } from "@thenamespace/ens-components";
import { useState } from "react";

const [records, setRecords] = useState({ addresses: [], texts: [] });

<SelectRecordsForm
  records={records}
  onRecordsUpdated={setRecords}
/>`;

function SelectRecordsSection() {
  const [records, setRecords] = useState<EnsRecords>({ addresses: [], texts: [] });

  return (
    <section className="section" id="select-records">
      <SectionHeader
        icon={shurikenSvg}
        name="Record Selector"
        title="Select ENS Records"
        desc="Standalone record editor. No wallet or transaction required. Let users compose text records, addresses, and contenthash before submitting them to any form."
      />
      <div className="component-grid">
        <div className="code-col">
          <CodePanel title="SelectRecordsForm.tsx" code={SELECT_RECORDS_CODE} />
        </div>
        <DemoPanel>
          <SelectRecordsForm records={records} onRecordsUpdated={setRecords} />
        </DemoPanel>
      </div>
    </section>
  );
}

// ─── Offchain Subnames ────────────────────────────────────────────────────────

const OFFCHAIN_DEFS: PropDef[] = [
  { key: "name",               type: "string",  default: "yourname.eth", required: true, readonly: true, tip: "Parent ENS name users will mint subnames under" },
  { key: "isTestnet",          type: "boolean", default: false,           tip: "Use Sepolia testnet instead of Ethereum mainnet" },
  { key: "label",              type: "string",  default: "",              tip: "Pre-fill and lock the subname label", placeholder: "alice" },
  { key: "title",              type: "string",  default: "",              tip: "Override the default header title text", placeholder: "Create your subname" },
  { key: "subtitle",           type: "string",  default: "",              tip: "Optional subtitle shown below the title", placeholder: "Enter a subname to get started" },
  { key: "hideTitle",          type: "boolean", default: false,           tip: "Hide the title header entirely" },
];

function generateOffchainCode(values: Record<string, any>, isTestnet: boolean): string {
  const mode = isTestnet ? "sepolia" : "mainnet";
  const lines: string[] = [];
  if (values.label)              lines.push(`  label="${values.label}"`);
  if (values.title)              lines.push(`  title="${values.title}"`);
  if (values.subtitle)           lines.push(`  subtitle="${values.subtitle}"`);
  if (values.hideTitle)          lines.push("  hideTitle={true}");
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

function OffchainSubnameSection({ isTestnet, onIsTestnetChange }: { isTestnet: boolean; onIsTestnetChange: (v: boolean) => void }) {
  const [values, setValues] = useState<Record<string, any>>(() => ({
    ...Object.fromEntries(OFFCHAIN_DEFS.map((d) => [d.key, d.default])),
    isTestnet,
  }));
  const [ensName, setEnsName] = useState("");
  const [apiKey, setApiKey] = useState("");

  const onChange = (key: string, val: any) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    if (key === "isTestnet") onIsTestnetChange(val);
  };

  useEffect(() => {
    setValues((prev) => ({ ...prev, isTestnet }));
  }, [isTestnet]);

  const isNameValid = ensName.endsWith(".eth") && ensName.slice(0, -4).length >= 3;
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
        icon={shurikenSvg}
        name="Offchain Subnames"
        title="Create Offchain Subnames"
        desc="Let users claim subnames instantly via the Namespace API. No gas, no on-chain transaction. Just a parent ENS name and an API key."
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
                <label className="offchain-gate-label">ENS Name</label>
                <input
                  className="ens-lookup-input"
                  type="text"
                  value={ensName}
                  placeholder="yourname.eth"
                  onChange={(e) => setEnsName(e.target.value.trim())}
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
            <p className="offchain-gate-hint" style={{marginBottom: 10}}>
              Navigate to{" "}
              <a href="https://dev.namespace.ninja" target="_blank" rel="noreferrer">
                dev.namespace.ninja
              </a>{" "}
              (Dev Portal) and generate an API key for your name.
            </p>
          </div>
          <div style={isReady ? undefined : { opacity: 0.4, pointerEvents: "none" }}>
            <OffchainSubnameForm
              key={`${String(isTestnet)}-${values.label}-${ensName}`}
              name={ensName || "yourname.eth"}
              offchainManager={offchainManager}
              isTestnet={isTestnet}
              label={values.label || undefined}
              title={values.title || undefined}
              subtitle={values.subtitle || undefined}
              hideTitle={values.hideTitle}
              onSubnameCreated={async (data) => {
                await offchainManager.createSubname({
                  parentName: data.parentName,
                  label: data.label,
                  addresses: data.addresses,
                  texts: data.texts,
                  owner: data.owner,
                });
              }}
              onSubnameUpdated={async (data) => {
                await offchainManager.updateSubname(data.fullSubname, {
                  addresses: data.addresses,
                  texts: data.texts,
                });
              }}
            />
          </div>
        </DemoPanel>
      </div>
    </section>
  );
}

// ─── Onchain Subnames ─────────────────────────────────────────────────────────

const MINT_DEFS: PropDef[] = [
  { key: "name",              type: "string",  default: "artii.eth", tip: "The ENS name users will mint subnames under", required: true, readonly: true },
  { key: "isTestnet",         type: "boolean", default: false,       tip: "Use Sepolia testnet instead of Ethereum mainnet" },
  { key: "title",             type: "string",  default: "",          tip: "Override the form title text", placeholder: "title..." },
  { key: "subtitle",          type: "string",  default: "",          tip: "Optional subtitle shown below the title", placeholder: "subtitle..." },
];

function SubnameMintSection({ isTestnet, onIsTestnetChange }: { isTestnet: boolean; onIsTestnetChange: (v: boolean) => void }) {
  const { openConnectModal } = useConnectModal();
  const parentName = isTestnet ? "unicorn.eth" : "artii.eth";
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
        icon={shurikenSvg}
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

// ─── Report a Bug ─────────────────────────────────────────────────────────────

function ReportBugSection() {
  return (
    <section className="section" id="report-bug">
      <SectionHeader
        icon={ninjaSvg}
        name="Community"
        title="Get Help & Report Issues"
        desc="Found a bug or need support? Reach out in the Namespace Builders Telegram group or open an issue on GitHub."
      />
      <div className="community-grid">
        <a
          className="community-card"
          href="https://t.me/+u2X1_QbR-CVmMGIy"
          target="_blank"
          rel="noreferrer"
        >
          <div className="community-card-icon community-card-icon-tg">
            <Send size={22} strokeWidth={2} />
          </div>
          <div className="community-card-body">
            <h3 className="community-card-title">Namespace Builders</h3>
            <p className="community-card-desc">Join our Telegram group for questions, feedback, and release announcements.</p>
          </div>
        </a>
        <a
          className="community-card"
          href="https://github.com/thenamespace/uikit"
          target="_blank"
          rel="noreferrer"
        >
          <div className="community-card-icon community-card-icon-gh">
            <GitBranch size={22} strokeWidth={2} />
          </div>
          <div className="community-card-body">
            <h3 className="community-card-title">GitHub Repository</h3>
            <p className="community-card-desc">Browse source code, open issues, and contribute to the project.</p>
          </div>
        </a>
      </div>
    </section>
  );
}

// ─── Nav components ───────────────────────────────────────────────────────────

const COMPONENT_LINKS = [
  { label: "ENS Registration",  href: "#ens-registration" },
  { label: "ENS Records",       href: "#ens-records" },
  { label: "Select Records",    href: "#select-records" },
  { label: "Offchain Subnames", href: "#offchain-subname" },
  { label: "Onchain Subnames",  href: "#subname-mint" },
];

function ComponentsDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="nav-dropdown">
      <button
        className={`nav-link nav-dropdown-trigger${open ? " active" : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        Components
        <ChevronDown size={12} className={`nav-dropdown-chevron${open ? " open" : ""}`} />
      </button>
      {open && (
        <div className="nav-dropdown-menu">
          {COMPONENT_LINKS.map((item) => (
            <a
              key={item.href}
              className="nav-dropdown-item"
              href={item.href}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function NavWalletButton() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    const short = `${address.slice(0, 6)}...${address.slice(-4)}`;
    return (
      <div className="nav-wallet-connected">
        <span className="nav-wallet-addr">{short}</span>
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
    <button className="nav-wallet-btn" onClick={openConnectModal}>
      Connect Wallet
    </button>
  );
}


// ─── App ──────────────────────────────────────────────────────────────────────

export function App() {
  const [isTestnet, setIsTestnet] = useState(false);

  return (
    <>
      {/* NAV */}
      <nav className="nav">
        <a className="nav-logo" href="#">
          <span className="nav-logo-stack">
            <img src={logoFull} alt="Namespace" className="nav-logo-full" />
            <span className="nav-logo-sub">ENS Components</span>
          </span>
          <img src={logoIcon} alt="Namespace" className="nav-logo-icon" />
        </a>
        <div className="nav-links">
          <a className="nav-link" href="#quickstart">Quick Start</a>
          <ComponentsDropdown />
          <a className="nav-link" href="#report-bug">Report a bug</a>
          <div className="nav-sep" />
          <NavWalletButton />
        </div>
      </nav>

      {/* HERO + SECTIONS */}
      <div className="grid-wrapper">
        <div className="hero">
          <div className="hero-text">
            <h1 className="hero-title">
              ENS UI Components<br />
              for <em>any</em> React app
            </h1>
            <p className="hero-subtitle">
              Components for ENS name registration, record editing,
              and subname issuance. Drop them in, connect a wallet, ship.
            </p>
          </div>
          <div className="hero-image">
            <img src={ninjaBanner} alt="Namespace ninja" />
          </div>
        </div>
        <div className="section-divider" />
        <QuickStartSection />
        <div className="section-divider" />
        <EnsRegistrationSection isTestnet={isTestnet} onIsTestnetChange={setIsTestnet} />
        <div className="section-divider" />
        <EnsRecordsSection isTestnet={isTestnet} onIsTestnetChange={setIsTestnet} />
        <div className="section-divider" />
        <SelectRecordsSection />
        <div className="section-divider" />
        <OffchainSubnameSection isTestnet={isTestnet} onIsTestnetChange={setIsTestnet} />
        <div className="section-divider" />
        <SubnameMintSection isTestnet={isTestnet} onIsTestnetChange={setIsTestnet} />
        <div className="section-divider" />
        <ReportBugSection />
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <a href="https://namespace.ninja" target="_blank" rel="noreferrer" className="footer-logo-link">
          <span className="footer-logo-stack">
            <img src={logoFull} alt="Namespace" className="footer-logo" />
            <span className="footer-logo-sub">ENS Components</span>
          </span>
        </a>
        <div className="footer-links">
          Built by{" "}
          <a href="https://namespace.ninja" target="_blank" rel="noreferrer">Namespace</a>
          {" · "}
          <a href="https://github.com/thenamespace/ui-components" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </footer>
    </>
  );
}
