import { useState } from "react";
import { Bot, Download, GitBranch, Code2, FileText, BookOpen, Cpu } from "lucide-react";
import { CodePanel } from "../components/CodePanel";
import { CopyButton } from "../components/CopyButton";

const FETCH_DOCS_CMD = `# Quick summary — install, component names, key props
curl https://enscomponents.com/llms.txt

# Full API reference — prop tables, types, hooks, recipes
curl https://enscomponents.com/llms-full.txt

# OpenAPI spec — JSON schemas for all callback / record types
curl https://enscomponents.com/.well-known/openapi.yaml`;

const PICK_COMPONENT_CODE = `// Match the user's intent to the right component:
//
// Register a .eth name                → EnsNameRegistrationForm
// Edit profile records on-chain       → EnsRecordsForm
// Select/preview records (no wallet)  → SelectRecordsForm
// Gasless offchain subname creation   → OffchainSubnameForm
// Onchain subname minting             → SubnameMintForm
//
// Required props at a glance:
//
// EnsNameRegistrationForm   no required props (name? is optional pre-fill)
// EnsRecordsForm            name: string, existingRecords: EnsRecords
// SelectRecordsForm         records: EnsRecords, onRecordsUpdated: fn
// OffchainSubnameForm       offchainManager: OffchainClient, name: string
// SubnameMintForm           parentName: string
//
// All components accept:
//   isTestnet?: boolean            — switch to Sepolia
//   onConnectWallet?: () => void   — hook into your wallet modal
//   noBorder?: boolean             — remove card border`;

const INTEGRATION_CODE = `// 1. Install
// npm install @thenamespace/ens-components wagmi viem @tanstack/react-query

// 2. Providers — required once at app root
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@thenamespace/ens-components/styles";

const config = createConfig({
  chains: [mainnet],
  transports: { [mainnet.id]: http() },
});
const queryClient = new QueryClient();

// 3. Drop in the component — example: ENS name registration
import { EnsNameRegistrationForm } from "@thenamespace/ens-components";

export default function Page() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <EnsNameRegistrationForm
          onConnectWallet={() => {/* open your wallet modal */}}
          onRegistrationSuccess={(r) => console.log("Registered", r)}
        />
      </QueryClientProvider>
    </WagmiProvider>
  );
}`;

const STEPS = [
  {
    num: "01",
    icon: <Download size={15} strokeWidth={2.2} />,
    title: "Fetch the reference",
    desc: "Retrieve the full API reference before generating any code. It has all prop tables, TypeScript types, hooks, and recipes.",
  },
  {
    num: "02",
    icon: <GitBranch size={15} strokeWidth={2.2} />,
    title: "Pick a component",
    desc: "Match the user's use case to one of five components. Each handles a distinct ENS operation with its own required props.",
  },
  {
    num: "03",
    icon: <Code2 size={15} strokeWidth={2.2} />,
    title: "Generate the integration",
    desc: "Drop in the component with the correct props. All components require WagmiProvider and QueryClientProvider at the app root.",
  },
];

const CODE: Record<string, { type: "cmd" | "code"; content: string; title?: string }> = {
  "01": { type: "code", content: FETCH_DOCS_CMD, title: "fetch-docs.sh" },
  "02": { type: "code", content: PICK_COMPONENT_CODE, title: "component-map.ts" },
  "03": { type: "code", content: INTEGRATION_CODE, title: "page.tsx" },
};

const RESOURCES = [
  {
    href: "https://enscomponents.com/llms.txt",
    icon: <FileText size={16} strokeWidth={2} />,
    label: "llms.txt",
    desc: "Summary index — components, types, install",
    tag: "~4 KB",
  },
  {
    href: "https://enscomponents.com/llms-full.txt",
    icon: <BookOpen size={16} strokeWidth={2} />,
    label: "llms-full.txt",
    desc: "Full API reference — all props, hooks, recipes",
    tag: "~28 KB",
  },
  {
    href: "https://enscomponents.com/.well-known/openapi.yaml",
    icon: <Code2 size={16} strokeWidth={2} />,
    label: "openapi.yaml",
    desc: "OpenAPI 3.1 spec with JSON schemas",
    tag: "YAML",
  },
  {
    href: "https://enscomponents.com/.well-known/ai-plugin.json",
    icon: <Cpu size={16} strokeWidth={2} />,
    label: "ai-plugin.json",
    desc: "Agent discovery manifest",
    tag: "JSON",
  },
];

export function AgentQuickStartSection() {
  const [activeStep, setActiveStep] = useState("01");
  const active = CODE[activeStep];

  return (
    <section className="section" id="agent-quickstart">

      {/* Header */}
      <div className="agent-qs-header">
        <div className="agent-qs-badge">
          <Bot size={13} strokeWidth={2.5} />
          For AI Agents
        </div>
        <h2 className="agent-qs-title">Agent Quick Start</h2>
        <p className="agent-qs-subtitle">
          How to discover, read, and use this library as an LLM or AI coding agent.
        </p>
      </div>

      {/* Steps + code */}
      <div className="agent-qs-body">
        <div className="steps-grid">
          {STEPS.map((s) => (
            <div
              key={s.num}
              className={[
                "step-card step-card-selectable agent-step-card",
                activeStep === s.num ? "step-card-active" : "",
              ].filter(Boolean).join(" ")}
              onClick={() => setActiveStep(s.num)}
            >
              <div className="agent-step-top">
                <div className="step-num step-num-light">{s.num}</div>
                <span className="agent-step-icon">{s.icon}</span>
              </div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="qs-code-blocks">
          {active.type === "cmd" ? (
            <div className="install-block" style={{ position: "relative", whiteSpace: "pre" }}>
              <span className="install-prompt">$</span>
              <code>{active.content}</code>
              <div style={{ position: "absolute", top: 10, right: 10 }}>
                <CopyButton text={active.content} />
              </div>
            </div>
          ) : (
            <CodePanel title={active.title!} code={active.content} showCopy />
          )}
        </div>
      </div>

      {/* Resource cards */}
      <div className="agent-qs-resources-section">
        <p className="agent-qs-resources-label">Machine-readable endpoints</p>
        <div className="agent-qs-resources">
          {RESOURCES.map((r) => (
            <a key={r.href} href={r.href} target="_blank" rel="noreferrer" className="agent-qs-resource-card">
              <div className="agent-qs-resource-top">
                <span className="agent-qs-resource-icon">{r.icon}</span>
                <span className="agent-qs-resource-tag">{r.tag}</span>
              </div>
              <span className="agent-qs-resource-label-text">{r.label}</span>
              <span className="agent-qs-resource-desc">{r.desc}</span>
            </a>
          ))}
        </div>
      </div>

    </section>
  );
}
