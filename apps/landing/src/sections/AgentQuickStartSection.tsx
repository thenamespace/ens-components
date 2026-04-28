import { useState } from "react";
import { Bot, Code2, FileText, BookOpen, Cpu, Zap, MessageSquare } from "lucide-react";
import { CodePanel } from "../components/CodePanel";


const INSTALL_SKILL_CMD = `# Install the ENS components skill
npx skills add thenamespace/skills -s ens-components`;

const ASK_AGENT_CODE = `// Once the skill is installed, just describe what you need.
// Your agent already knows every prop, type, hook, and pattern.

"Add ENS name registration to my Next.js app"
"Let users mint subnames under myname.eth"
"Build a gasless subname form with avatar upload"
"Show an ENS record editor for the connected wallet"`;

const INTEGRATION_CODE = `// Your agent generates production-ready code like this:
import "@thenamespace/ens-components/styles";
import { EnsNameRegistrationForm } from "@thenamespace/ens-components";

export default function Page() {
  return (
    <EnsNameRegistrationForm
      onConnectWallet={() => {/* open your wallet modal */}}
      onRegistrationSuccess={(r) => console.log("Registered", r.durationLabel)}
    />
  );
}`;

const STEPS = [
  {
    num: "01",
    icon: <Zap size={15} strokeWidth={2.2} />,
    title: "Install the skill",
    desc: "One command gives your agent full knowledge of every component, prop, type, and integration pattern.",
  },
  {
    num: "02",
    icon: <MessageSquare size={15} strokeWidth={2.2} />,
    title: "Describe what you need",
    desc: "Ask your agent in plain language. The skill handles component selection, required props, and provider setup automatically.",
  },
  {
    num: "03",
    icon: <Code2 size={15} strokeWidth={2.2} />,
    title: "Get production code",
    desc: "Your agent generates correct, typed integration code — no trial and error on prop names or missing providers.",
  },
];

const CODE: Record<string, { type: "cmd" | "code"; content: string; title?: string }> = {
  "01": { type: "code", content: INSTALL_SKILL_CMD, title: "terminal" },
  "02": { type: "code", content: ASK_AGENT_CODE, title: "prompts.txt" },
  "03": { type: "code", content: INTEGRATION_CODE, title: "page.tsx" },
};

const RESOURCES = [
  {
    href: "https://enscomponents.com/Skill.md",
    icon: <Zap size={16} strokeWidth={2} />,
    label: "Skill.md",
    desc: "Raw skill file — fetch directly into any agent",
    tag: "MD",
  },
  {
    href: "https://enscomponents.com/llms.txt",
    icon: <FileText size={16} strokeWidth={2} />,
    label: "llms.txt",
    desc: "Summary — components, types, install",
    tag: "~4 KB",
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
          Install the skill once. Your agent handles the rest.
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
          <CodePanel title={active.title!} code={active.content} showCopy />
        </div>
      </div>

      {/* Resource cards */}
      <div className="agent-qs-resources-section">
        <p className="agent-qs-resources-label">Or access directly — no skill manager needed</p>
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
