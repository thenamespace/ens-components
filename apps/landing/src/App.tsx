import React from "react";
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
  Globe,
  Package,
  Code2,
  Rocket,
} from "lucide-react";
import "./landing.css";

// ─── Code snippets ────────────────────────────────────────────────────────────

const ENS_REG_CODE = `import { EnsNameRegistrationForm } from "@thenamespace/ens-components";

<EnsNameRegistrationForm
  isTestnet={false}
/>`;

const ENS_RECORDS_CODE = `import { EnsRecordsForm } from "@thenamespace/ens-components";

<EnsRecordsForm
  name="yourname.eth"
  isTestnet={false}
  resolverAddress="0x231b0Ee14048e9dCcD1d247744d114a4Eb5E8E63"
  existingRecords={{ addresses: [], texts: [] }}
/>`;

const OFFCHAIN_CODE = `import { OffchainSubnameForm } from "@thenamespace/ens-components";

<OffchainSubnameForm
  name="yourname.eth"
  apiKeyOrToken="YOUR_API_KEY"
  isTestnet={false}
/>`;

const MINT_CODE = `import { SubnameMintForm } from "@thenamespace/ens-components";

<SubnameMintForm
  parentName="yourname.eth"
  isTestnet={false}
/>`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function highlight(code: string) {
  const escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Split on string literals first to avoid regex cross-contamination
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
        {steps.map(s => (
          <div key={s.num} className="step-card">
            <div className={`step-num ${s.dark ? "step-num-dark" : "step-num-light"}`}>{s.num}</div>
            <h3 className="step-title">{s.title}</h3>
            <p className="step-desc">{s.desc}</p>
          </div>
        ))}
      </div>
      <div className="install-block">
        <span className="install-prompt">$</span>
        <code>npm install @thenamespace/ens-components wagmi viem @rainbow-me/rainbowkit @tanstack/react-query</code>
      </div>
    </section>
  );
}

// ─── Component sections ───────────────────────────────────────────────────────

function EnsRegistrationSection() {
  return (
    <section className="section" id="ens-registration">
      <SectionHeader
        icon={AtSign}
        name="ENS Registration"
        title="Register ENS Names"
        desc="Drop-in form that guides users through searching, selecting, and registering .eth names — including the full commit/register flow."
      />
      <div className="component-grid">
        <CodePanel title="EnsNameRegistrationForm.tsx" code={ENS_REG_CODE} />
        <DemoPanel>
          <EnsNameRegistrationForm isTestnet={false} />
        </DemoPanel>
      </div>
    </section>
  );
}

function EnsRecordsSection() {
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
            name="yourname.eth"
            isTestnet={false}
            resolverAddress="0x231b0Ee14048e9dCcD1d247744d114a4Eb5E8E63"
            existingRecords={{ addresses: [], texts: [] }}
          />
        </DemoPanel>
        <CodePanel title="EnsRecordsForm.tsx" code={ENS_RECORDS_CODE} />
      </div>
    </section>
  );
}

function OffchainSubnameSection() {
  return (
    <section className="section" id="offchain-subname">
      <SectionHeader
        icon={Zap}
        name="Offchain Subnames"
        title="Create Offchain Subnames"
        desc="Let users claim subnames instantly via the Namespace API — no gas, no on-chain transaction. Just a parent ENS name and an API key."
      />
      <div className="component-grid">
        <CodePanel title="OffchainSubnameForm.tsx" code={OFFCHAIN_CODE} />
        <DemoPanel>
          <OffchainSubnameForm name="yourname.eth" apiKeyOrToken="" isTestnet={false} />
        </DemoPanel>
      </div>
    </section>
  );
}

function SubnameMintSection() {
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
          <SubnameMintForm parentName="yourname.eth" isTestnet={false} />
        </DemoPanel>
        <CodePanel title="SubnameMintForm.tsx" code={MINT_CODE} />
      </div>
    </section>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

const HERO_CHIPS = [
  { Icon: AtSign,  label: "ENS Registration" },
  { Icon: Pencil,  label: "Profile Records" },
  { Icon: Zap,     label: "Offchain Subnames" },
  { Icon: Layers,  label: "Onchain Mint" },
  { Icon: Globe,   label: "Mainnet + Sepolia" },
  { Icon: Package, label: "MIT Licensed" },
];

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

      {/* HERO */}
      <div className="hero">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          Open source · MIT licensed
        </div>
        <h1 className="hero-title">
          ENS UI Components<br />
          for <em>any</em> React app
        </h1>
        <p className="hero-subtitle">
          Production-ready components for ENS name registration, record editing,
          and subname issuance. Drop them in, connect a wallet, ship.
        </p>
        <div className="hero-chips">
          {HERO_CHIPS.map(({ Icon, label }) => (
            <div key={label} className="hero-chip">
              <Icon size={14} />
              {label}
            </div>
          ))}
        </div>
        <div className="hero-stats">
          <div>
            <div className="hero-stat-num">4</div>
            <div className="hero-stat-label">Components</div>
          </div>
          <div>
            <div className="hero-stat-num">0</div>
            <div className="hero-stat-label">Config needed</div>
          </div>
          <div>
            <div className="hero-stat-num">MIT</div>
            <div className="hero-stat-label">License</div>
          </div>
        </div>
      </div>

      {/* SECTIONS */}
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
