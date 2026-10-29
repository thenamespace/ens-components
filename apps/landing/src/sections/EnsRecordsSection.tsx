import { useState, Component, type ReactNode } from "react";

class ErrorBoundary extends Component<
  { onReset: () => void; children: ReactNode },
  { error: Error | null }
> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error)
      return (
        <div className="ens-lookup-wrap">
          <p className="ens-lookup-error">
            Something went wrong loading the form.
          </p>
          <button
            className="ens-lookup-btn"
            onClick={() => {
              this.setState({ error: null });
              this.props.onReset();
            }}
          >
            Try again
          </button>
        </div>
      );
    return this.props.children;
  }
}
import { useAccount } from "wagmi";
import { usePublicClient } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { EnsRecordsForm } from "@thenamespace/ens-components";
import { BookOpenText } from "lucide-react";
import { SectionHeader } from "../components/SectionHeader";
import { CodePanel } from "../components/CodePanel";
import { DemoPanel } from "../components/DemoPanel";
import { PropsEditor } from "../components/PropsEditor";
import { generateCode } from "../components/generateCode";
import type { PropDef } from "../components/types";
import { fetchEnsV2Records, getEnsV2Owner } from "../utils/ensv2";

const ENS_RECORDS_DEFS: PropDef[] = [
  {
    key: "name",
    type: "string",
    default: "yourname.eth",
    required: true,
    readonly: true,
    tip: "Full .eth name",
  },
  {
    key: "existingRecords",
    type: "string",
    default: "Existing name records",
    required: true,
    readonly: true,
    tip: "Current on-chain records pre-loaded from the ENS resolver",
  },
  {
    key: "noBorder",
    type: "boolean",
    default: true,
    tip: "Remove the card border and shadow wrapper",
  },
  {
    key: "resolverAddress",
    type: "string",
    default: "",
    readonly: true,
    tip: "Optional. Auto-detected from the ENS registry if not provided",
  },
  {
    key: "resolverChainId",
    type: "number",
    default: 1,
    readonly: true,
    tip: "Optional. Inferred from isTestnet if not provided",
  },
];

export function EnsRecordsSection({ isTestnet }: { isTestnet: boolean }) {
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const pc = usePublicClient({ chainId: 1 });
  const sepoliaPc = usePublicClient({ chainId: 11155111 });
  const [values, setValues] = useState<Record<string, any>>(() => ({
    ...Object.fromEntries(ENS_RECORDS_DEFS.map(d => [d.key, d.default])),
  }));
  const [ensName, setEnsName] = useState("");
  const [submittedName, setSubmittedName] = useState("");
  const [existingRecords, setExistingRecords] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");

  const onChange = (key: string, val: any) => {
    setValues(prev => ({ ...prev, [key]: val }));
  };

  const displayValues = {
    ...values,
    name: submittedName || "yourname.eth",
    existingRecords: submittedName
      ? "{ addresses: [...], texts: [...] }"
      : "(fetched onchain)",
    resolverAddress: "",
    resolverChainId: 0,
  };

  const handleLookup = async () => {
    const name = ensName.trim();
    if (!name) return;
    setLoading(true);
    setLookupError("");
    try {
      const client = isTestnet ? sepoliaPc! : pc!;
      const owner = await getEnsV2Owner(client, name, isTestnet);
      if (owner !== address?.toLowerCase()) {
        setLookupError(
          "You are not permitted to edit records, try adding a name you own"
        );
        return;
      }
      const records = await fetchEnsV2Records(client, name, isTestnet);
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
    `isTestnet={${isTestnet}}`,
    `name="${submittedName || "yourname.eth"}"`,
    "existingRecords={existingRecords}",
  ]);

  return (
    <section className="section" id="ens-records">
      <SectionHeader
        icon={BookOpenText}
        name="ENS Records"
        title="Edit Profile Records"
        desc="Full-featured editor for .eth names. Reads existing records and writes changes back via a resolver transaction."
      />
      <div className="component-grid">
        <DemoPanel>
          {!submittedName ? (
            <div className="ens-lookup-wrap">
              <p className="ens-lookup-title">Enter your ENS name</p>
              <p className="ens-lookup-sub">
                Load your current records to edit them
              </p>
              <input
                className="ens-lookup-input"
                data-testid="records-lookup-input"
                type="text"
                value={ensName}
                placeholder="yourname.eth"
                onChange={e => setEnsName(e.target.value.toLowerCase())}
                onKeyDown={e =>
                  e.key === "Enter" && isConnected && !loading && handleLookup()
                }
              />
              {lookupError && (
                <p
                  className="ens-lookup-error"
                  data-testid="records-lookup-error"
                >
                  {lookupError}
                </p>
              )}
              {!isConnected ? (
                <button className="ens-lookup-btn" onClick={openConnectModal}>
                  Connect Wallet
                </button>
              ) : (
                <button
                  className="ens-lookup-btn"
                  data-testid="records-lookup-button"
                  onClick={handleLookup}
                  disabled={!ensName.trim() || loading}
                >
                  {loading ? "Loading…" : "Update Records"}
                </button>
              )}
            </div>
          ) : (
            <ErrorBoundary onReset={handleReset}>
              <div style={{ position: "relative" }}>
                <EnsRecordsForm
                  key={`${submittedName}-${String(isTestnet)}-${values.resolverAddress}`}
                  name={submittedName}
                  isTestnet={isTestnet}
                  resolverAddress={values.resolverAddress || undefined}
                  // resolverChainId is left to the form, which infers it from isTestnet.
                  noBorder={values.noBorder}
                  txConfirmations={values.txConfirmations || undefined}
                  avatarUploadDomain={values.avatarUploadDomain || undefined}
                  existingRecords={existingRecords}
                  onCancel={handleReset}
                  onGreat={handleReset}
                />
              </div>
            </ErrorBoundary>
          )}
        </DemoPanel>
        <div className="code-col">
          <CodePanel title="EnsRecordsForm.tsx" code={code} />
          <PropsEditor
            defs={ENS_RECORDS_DEFS}
            values={values}
            onChange={onChange}
          />
        </div>
      </div>
    </section>
  );
}
