import React, { useState } from "react";
import ninjaBanner from "./assets/ninja-banner.png";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  EnsNameRegistrationForm,
  EnsRecordsForm,
  OffchainSubnameForm,
  SubnameMintForm,
} from "@thenamespace/ens-components";
import {
  AtSign,
  Pencil,
  Zap,
  Layers,
  Code2,
  Rocket,
  ChevronDown,
} from "lucide-react";
import "./landing.css";

// ─── Prop editor types ────────────────────────────────────────────────────────

type BoolProp = { key: string; type: "boolean"; default: boolean; tip?: string; required?: boolean };
type StrProp  = { key: string; type: "string";  default: string;  tip?: string; placeholder?: string; required?: boolean };
type NumProp  = { key: string; type: "number";  default: number;  tip?: string; required?: boolean };
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
                  {def.type === "boolean" ? (
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

type LucideIcon = typeof AtSign;

function SectionHeader({
  icon: Icon,
  name,
  title,
  desc,
}: {
  icon: LucideIcon;
  name: string;
  title: string;
  desc: string;
}) {
  return (
    <>
      <div className="section-icon-row">
        <div className="section-icon-badge">
          <Icon size={20} strokeWidth={2.2} />
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

function QuickStartSection() {
  const steps = [
    {
      num: "01",
      dark: true,
      title: "Install the package",
      desc: "Add to your project with npm, pnpm, or yarn alongside wagmi and rainbowkit.",
    },
    {
      num: "02",
      dark: false,
      title: "Import & render",
      desc: "Drop a component into your app — no extra config, no boilerplate.",
    },
    {
      num: "03",
      dark: false,
      title: "Connect & ship",
      desc: "Users connect their wallet and interact onchain immediately.",
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
          <div key={s.num} className="step-card">
            <div className={`step-num ${s.dark ? "step-num-dark" : "step-num-light"}`}>
              {s.num}
            </div>
            <h3 className="step-title">{s.title}</h3>
            <p className="step-desc">{s.desc}</p>
          </div>
        ))}
      </div>
      <div className="install-block">
        <span className="install-prompt">$</span>
        <code>npm install @thenamespace/ens-components wagmi viem @tanstack/react-query</code>
      </div>
    </section>
  );
}

// ─── ENS Registration ─────────────────────────────────────────────────────────

const ENS_REG_DEFS: PropDef[] = [
  { key: "isTestnet",   type: "boolean", default: false, tip: "Use Sepolia testnet instead of Ethereum mainnet" },
  { key: "referrer",    type: "string",  default: "",    tip: "Wallet address that receives a referral fee on registration", placeholder: "0x… referral wallet" },
  { key: "noBorder",   type: "boolean", default: false, tip: "Remove the card border and shadow wrapper" },
  { key: "title",      type: "string",  default: "",    tip: "Override the form title text", placeholder: "title..." },
  { key: "subtitle",   type: "string",  default: "",    tip: "Override the subtitle below the title", placeholder: "subtitle..." },
  { key: "bannerImage", type: "string",  default: "",    tip: "URL of a custom banner image to replace the default", placeholder: "https://…/image.png" },
  { key: "hideBanner",  type: "boolean", default: false, tip: "Hide the banner image entirely" },
  { key: "bannerWidth", type: "number",  default: 250,   tip: "Width of the banner image in pixels" },
];

function EnsRegistrationSection() {
  const [values, setValues] = useState<Record<string, any>>(() =>
    Object.fromEntries(ENS_REG_DEFS.map((d) => [d.key, d.default])),
  );
  const onChange = (key: string, val: any) =>
    setValues((prev) => ({ ...prev, [key]: val }));
  const code = generateCode("EnsNameRegistrationForm", ENS_REG_DEFS, values);

  return (
    <section className="section" id="ens-registration">
      <SectionHeader
        icon={AtSign}
        name="ENS Registration"
        title="Register ENS Names"
        desc="Drop-in form that guides users through searching, selecting, and registering .eth names — including the full commit/register flow."
      />
      <div className="component-grid">
        <div className="code-col">
          <CodePanel title="EnsNameRegistrationForm.tsx" code={code} />
          <PropsEditor defs={ENS_REG_DEFS} values={values} onChange={onChange} />
        </div>
        <DemoPanel>
          <EnsNameRegistrationForm
            key={`${values.isTestnet}`}
            isTestnet={values.isTestnet}
            referrer={values.referrer || undefined}
            noBorder={values.noBorder}
            title={values.title || undefined}
            subtitle={values.subtitle || undefined}
            bannerImage={values.bannerImage || undefined}
            hideBanner={values.hideBanner}
            bannerWidth={values.bannerWidth || undefined}
          />
        </DemoPanel>
      </div>
    </section>
  );
}

// ─── ENS Records ──────────────────────────────────────────────────────────────

const ENS_RECORDS_DEFS: PropDef[] = [
  { key: "isTestnet",       type: "boolean", default: false,                                      tip: "Use Sepolia testnet instead of Ethereum mainnet" },
  { key: "resolverAddress", type: "string",  default: "0x231b0Ee14048e9dCcD1d247744d114a4Eb5E8E63", tip: "ENS Public Resolver contract address on-chain", placeholder: "0x…" },
  { key: "resolverChainId", type: "number",  default: 1,                                          tip: "Chain ID where the resolver contract is deployed" },
  { key: "noBorder",        type: "boolean", default: false,                                      tip: "Remove the card border and shadow wrapper" },
  { key: "txConfirmations", type: "number",  default: 1,                                          tip: "Number of block confirmations to wait after a transaction" },
];

function EnsRecordsSection() {
  const [values, setValues] = useState<Record<string, any>>(() =>
    Object.fromEntries(ENS_RECORDS_DEFS.map((d) => [d.key, d.default])),
  );
  const onChange = (key: string, val: any) =>
    setValues((prev) => ({ ...prev, [key]: val }));
  const code = generateCode("EnsRecordsForm", ENS_RECORDS_DEFS, values, [
    'name="yourname.eth"',
    'existingRecords={{ addresses: [], texts: [] }}',
  ]);

  return (
    <section className="section" id="ens-records">
      <SectionHeader
        icon={Pencil}
        name="ENS Records"
        title="Edit Profile Records"
        desc="Full-featured editor for text records, addresses, contenthash, and avatar uploads. Reads existing records and writes them back via a resolver transaction."
      />
      <div className="component-grid">
        <DemoPanel>
          <EnsRecordsForm
            key={`${values.isTestnet}-${values.resolverAddress}`}
            name="yourname.eth"
            isTestnet={values.isTestnet}
            resolverAddress={values.resolverAddress || undefined}
            resolverChainId={values.resolverChainId || undefined}
            noBorder={values.noBorder}
            txConfirmations={values.txConfirmations || undefined}
            existingRecords={{ addresses: [], texts: [] }}
          />
        </DemoPanel>
        <div className="code-col">
          <CodePanel title="EnsRecordsForm.tsx" code={code} />
          <PropsEditor defs={ENS_RECORDS_DEFS} values={values} onChange={onChange} />
        </div>
      </div>
    </section>
  );
}

// ─── Offchain Subnames ────────────────────────────────────────────────────────

const OFFCHAIN_DEFS: PropDef[] = [
  { key: "apiKeyOrToken",     type: "string",  default: "", tip: "Your Namespace API key for creating and managing subnames", placeholder: "your API key", required: true },
  { key: "isTestnet",         type: "boolean", default: false, tip: "Use Sepolia testnet instead of Ethereum mainnet" },
  { key: "hideTitle",         type: "boolean", default: false, tip: "Hide the title header inside the component" },
  { key: "avatarUploadDomain",type: "string",  default: "", tip: "Domain used for SIWE message signing during avatar upload", placeholder: "yourdomain.com" },
];

function OffchainSubnameSection() {
  const [values, setValues] = useState<Record<string, any>>(() =>
    Object.fromEntries(OFFCHAIN_DEFS.map((d) => [d.key, d.default])),
  );
  const onChange = (key: string, val: any) =>
    setValues((prev) => ({ ...prev, [key]: val }));
  const code = generateCode("OffchainSubnameForm", OFFCHAIN_DEFS, values, [
    'name="yourname.eth"',
  ]);

  return (
    <section className="section" id="offchain-subname">
      <SectionHeader
        icon={Zap}
        name="Offchain Subnames"
        title="Create Offchain Subnames"
        desc="Let users claim subnames instantly via the Namespace API — no gas, no on-chain transaction. Just a parent ENS name and an API key."
      />
      <div className="component-grid">
        <div className="code-col">
          <CodePanel title="OffchainSubnameForm.tsx" code={code} />
          <PropsEditor defs={OFFCHAIN_DEFS} values={values} onChange={onChange} />
        </div>
        <DemoPanel>
          <OffchainSubnameForm
            key={`${values.isTestnet}`}
            name="yourname.eth"
            apiKeyOrToken={values.apiKeyOrToken}
            isTestnet={values.isTestnet}
            hideTitle={values.hideTitle}
            avatarUploadDomain={values.avatarUploadDomain || undefined}
          />
        </DemoPanel>
      </div>
    </section>
  );
}

// ─── Onchain Subnames ─────────────────────────────────────────────────────────

const MINT_DEFS: PropDef[] = [
  { key: "parentName",      type: "string",  default: "nerdynation.eth", tip: "The ENS name users will mint subnames under", placeholder: "yourname.eth", required: true },
  { key: "isTestnet",       type: "boolean", default: false,             tip: "Use Sepolia testnet instead of Ethereum mainnet" },
  { key: "txConfirmations", type: "number",  default: 1,                 tip: "Number of block confirmations to wait after the mint transaction" },
];

function SubnameMintSection() {
  const [values, setValues] = useState<Record<string, any>>(() =>
    Object.fromEntries(MINT_DEFS.map((d) => [d.key, d.default])),
  );
  const onChange = (key: string, val: any) =>
    setValues((prev) => ({ ...prev, [key]: val }));
  const code = generateCode("SubnameMintForm", MINT_DEFS, values);

  return (
    <section className="section" id="subname-mint">
      <SectionHeader
        icon={Layers}
        name="Onchain Subnames"
        title="Mint Onchain Subnames"
        desc="Full minting flow for onchain subnames — price lookup, profile records, and the mint transaction. Works with any ENS name using the Namespace L2 resolver."
      />
      <div className="component-grid">
        <DemoPanel>
          <SubnameMintForm
            key={`${values.parentName}-${values.isTestnet}`}
            parentName={values.parentName}
            isTestnet={values.isTestnet}
            txConfirmations={values.txConfirmations || undefined}
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

// ─── App ──────────────────────────────────────────────────────────────────────

export function App() {
  return (
    <>
      {/* NAV */}
      <nav className="nav">
        <a className="nav-logo" href="#">
          <div className="nav-logo-dot">
            <Code2 size={15} color="white" strokeWidth={2.5} />
          </div>
          ENS Components
        </a>
        <div className="nav-links">
          <a className="nav-link" href="#ens-registration">Registration</a>
          <a className="nav-link" href="#ens-records">Records</a>
          <a className="nav-link" href="#offchain-subname">Offchain</a>
          <a className="nav-link" href="#subname-mint">Mint</a>
          <div className="nav-sep" />
          <ConnectButton />
        </div>
      </nav>

      {/* HERO + SECTIONS — single grid-wrapper for connected border */}
      <div className="grid-wrapper">
        <div className="hero">
          <div className="hero-text">
            <h1 className="hero-title">
              ENS UI Components<br />
              for <em>any</em> React app
            </h1>
            <p className="hero-subtitle">
              Production-ready components for ENS name registration, record editing,
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
        <EnsRegistrationSection />
        <div className="section-divider" />
        <EnsRecordsSection />
        <div className="section-divider" />
        <OffchainSubnameSection />
        <div className="section-divider" />
        <SubnameMintSection />
        <div className="section-divider" />
      </div>

      {/* FOOTER */}
      <footer className="footer">
        Built by{" "}
        <a href="https://namespace.ninja" target="_blank" rel="noreferrer">Namespace</a>
        {" · "}
        <a href="https://github.com/thenamespace/ui-components" target="_blank" rel="noreferrer">GitHub</a>
      </footer>
    </>
  );
}
