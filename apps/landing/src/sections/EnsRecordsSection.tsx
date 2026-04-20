import { useEffect, useState, Component, type ReactNode } from "react";

class ErrorBoundary extends Component<{ onReset: () => void; children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error)
      return (
        <div className="ens-lookup-wrap">
          <p className="ens-lookup-error">Something went wrong loading the form.</p>
          <button className="ens-lookup-btn" onClick={() => { this.setState({ error: null }); this.props.onReset(); }}>Try again</button>
        </div>
      );
    return this.props.children;
  }
}
import { useAccount } from "wagmi";
import { usePublicClient } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { namehash } from "viem/ens";
import { EnsRecordsForm } from "@thenamespace/ens-components";
import { BookOpenText } from "lucide-react";
import { SectionHeader } from "../components/SectionHeader";
import { CodePanel } from "../components/CodePanel";
import { DemoPanel } from "../components/DemoPanel";
import { PropsEditor } from "../components/PropsEditor";
import { generateCode } from "../components/generateCode";
import type { PropDef } from "../components/types";

const RESOLVIO = "https://resolvio.namespace.ninja";

async function fetchEnsProfile(name: string) {
  const res = await fetch(`${RESOLVIO}/ens/v2/profile/${encodeURIComponent(name)}`);
  if (!res.ok) throw new Error("ENS name not found or has no records");
  const data = await res.json();
  return {
    addresses: (data.addresses || []).filter((a: any) => a.exists).map((a: any) => ({ coinType: a.coin, value: a.value })),
    texts: (data.texts || []).filter((t: any) => t.exists).map((t: any) => ({ key: t.key, value: t.value })),
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
  { key: "name",            type: "string",  default: "yourname.eth",          required: true, readonly: true, tip: "Full ENS name whose records will be edited" },
  { key: "existingRecords", type: "string",  default: "Existing name records",  required: true, readonly: true, tip: "Current on-chain records pre-loaded from the ENS resolver" },
  { key: "isTestnet",       type: "boolean", default: false,                    tip: "Use Sepolia testnet instead of Ethereum mainnet" },
  { key: "noBorder",        type: "boolean", default: false,                    tip: "Remove the card border and shadow wrapper" },
  { key: "resolverAddress", type: "string",  default: "", readonly: true,       tip: "Optional. Auto-detected from the ENS registry if not provided" },
  { key: "resolverChainId", type: "number",  default: 1,  readonly: true,       tip: "Optional. Inferred from isTestnet if not provided" },
];

export function EnsRecordsSection({ isTestnet, onIsTestnetChange }: { isTestnet: boolean; onIsTestnetChange: (v: boolean) => void }) {
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
        icon={BookOpenText}
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
            <ErrorBoundary onReset={handleReset}>
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
                  onGreat={handleReset}
                />
              </div>
            </ErrorBoundary>
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
