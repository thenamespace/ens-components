import { useState } from "react";
import { Rocket, Package, Layers, Zap } from "lucide-react";
import { CodePanel } from "../components/CodePanel";
import { CopyButton } from "../components/CopyButton";

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

const INSTALL_CMD = "npm install @thenamespace/ens-components wagmi viem @tanstack/react-query";

const STEPS = [
  {
    num: "01",
    icon: <Package size={15} strokeWidth={2.2} />,
    selectable: true,
    title: "Install the package",
    desc: "Add the library alongside its peer dependencies: wagmi and viem.",
  },
  {
    num: "02",
    icon: <Layers size={15} strokeWidth={2.2} />,
    selectable: true,
    title: "Wrap with WagmiProvider",
    desc: "Configure wagmi once at your app root and add styles.",
  },
  {
    num: "03",
    icon: <Zap size={15} strokeWidth={2.2} />,
    selectable: false,
    title: "Import and go live",
    desc: "Drop in any component with a few props.",
  },
];

export function QuickStartSection() {
  const [activeStep, setActiveStep] = useState<"01" | "02">("01");

  return (
    <section className="section" id="quickstart">

      <div className="agent-qs-header">
        <div className="agent-qs-badge">
          <Rocket size={13} strokeWidth={2.5} />
          Quick Start
        </div>
        <h2 className="agent-qs-title">Up and running in minutes</h2>
        <p className="agent-qs-subtitle">
          Install the package, add providers, and drop in any component with a few props.
        </p>
      </div>

      <div className="agent-qs-body">
        <div className="steps-grid">
          {STEPS.map((s) => (
            <div
              key={s.num}
              className={[
                "step-card agent-step-card",
                s.selectable ? "step-card-selectable" : "",
                s.selectable && activeStep === s.num ? "step-card-active" : "",
              ].filter(Boolean).join(" ")}
              onClick={s.selectable ? () => setActiveStep(s.num as "01" | "02") : undefined}
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
          {activeStep === "01" ? (
            <div className="install-block" style={{ position: "relative" }}>
              <span className="install-prompt">$</span>
              <code>{INSTALL_CMD}</code>
              <div style={{ position: "absolute", top: 10, right: 10 }}>
                <CopyButton text={INSTALL_CMD} />
              </div>
            </div>
          ) : (
            <CodePanel title="providers.tsx" code={WAGMI_SETUP_CODE} showCopy />
          )}
        </div>
      </div>

    </section>
  );
}
