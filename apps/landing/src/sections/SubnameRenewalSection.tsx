import { useCallback, useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { keccak256, toBytes } from "viem";
import { SubnameRenewForm } from "@thenamespace/ens-components";
import { SectionHeader } from "../components/SectionHeader";
import { CodePanel } from "../components/CodePanel";
import { DemoPanel } from "../components/DemoPanel";
import { PropsEditor } from "../components/PropsEditor";
import { Chip, KitButton, TestKit, TestStep } from "../components/TestKit";
import { generateCode } from "../components/generateCode";
import type { PropDef } from "../components/types";
import { getParentOverride } from "../utils/parentOverride";
import { fetchJson, type ManagerActivation, type ManagerSubname, SEPOLIA_ETH_FAUCET } from "../utils/testTokens";

const PARENT = getParentOverride() ?? "arti.eth";
const PERMANENT = 18446744073709551615n;

const SUB_RENEW_DEFS: PropDef[] = [
  { key: "parentName", type: "string",  default: PARENT, tip: "Activated parent name the subname lives under", required: true, readonly: true },
  { key: "label",      type: "string",  default: "",     tip: "Subname label. Leave empty to let the user type one", placeholder: "alice" },
  { key: "title",      type: "string",  default: "",     tip: "Override the form title text", placeholder: "title..." },
  { key: "subtitle",   type: "string",  default: "",     tip: "Optional subtitle shown below the title", placeholder: "subtitle..." },
  { key: "noBorder",  type: "boolean", default: true,  tip: "Remove the card border, for embedding in your own container" },
];

const expiryMeta = (expiry: string) => {
  const value = BigInt(expiry);
  if (value >= PERMANENT) return "permanent";
  const date = new Date(Number(value) * 1000);
  return `${date < new Date() ? "expired " : ""}${date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
};

export function SubnameRenewalSection({
  isTestnet,
  onIsTestnetChange,
  onRenewParent,
  version,
  onVersionChange,
}: {
  isTestnet: boolean;
  onIsTestnetChange: (v: boolean) => void;
  onRenewParent: (name: string) => void;
  version: 1 | 2;
  onVersionChange: (v: 1 | 2) => void;
}) {
  const { address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [values, setValues] = useState<Record<string, any>>(() => ({
    ...Object.fromEntries(SUB_RENEW_DEFS.map((d) => [d.key, d.default])),
  }));
  const [mountKey, setMountKey] = useState(0);
  const [activation, setActivation] = useState<ManagerActivation | null | undefined>(undefined);
  const [mine, setMine] = useState<ManagerSubname[] | null>(null);

  const parentLabel = PARENT.replace(/\.eth$/, "");

  const onChange = (key: string, val: any) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };


  useEffect(() => {
    fetchJson<ManagerActivation[]>(`/activations/label/${parentLabel}`, isTestnet).then((rows) =>
      setActivation(rows?.[0] ?? null),
    );
  }, [parentLabel, isTestnet]);

  const loadMine = useCallback(() => {
    if (!address) {
      setMine(null);
      return;
    }
    const parent = keccak256(toBytes(parentLabel)).toLowerCase();
    fetchJson<ManagerSubname[]>(`/subnames/owner/${address.toLowerCase()}`, isTestnet).then((rows) =>
      setMine((rows ?? []).filter((s) => s.parent.toLowerCase() === parent)),
    );
  }, [address, parentLabel, isTestnet]);

  useEffect(loadMine, [loadMine]);

  const pickLabel = (label: string) => {
    setValues((prev) => ({ ...prev, label }));
    setMountKey((k) => k + 1);
  };

  const code = generateCode("SubnameRenewForm", SUB_RENEW_DEFS, values, [`isTestnet={${isTestnet}}`, `parentName="${PARENT}"`]);
  const expirable = activation?.expiration === "Expirable";

  return (
    <section className="section" id="subname-renewal">
      <SectionHeader
        icon={RefreshCcw}
        name="Subname Renewal"
        title="Renew Onchain Subnames"
        desc="Extends subnames minted under an activated name, at the price the owner configured. Checks the subname, the parent, and the issuer before offering a transaction, and warns when the subname would outlive its parent."
      />
      <div className="component-grid">
        <div className="code-col">
          <CodePanel title="SubnameRenewForm.tsx" code={code} />
          <TestKit
            network={isTestnet ? "Sepolia" : "Mainnet"}
            note={
              <>
                <strong>Anyone can renew any subname.</strong> Gift renewals extend the subname for its owner. Whitelist
                claims are attached automatically, so a whitelisted renewer may renew for free.
              </>
            }
          >
            {version === 1 ? (
              <TestStep title="Switch to ENSv2">
                <p>Onchain subname renewals are an ENSv2 feature and run on Sepolia for now.</p>
                <KitButton onClick={() => onVersionChange(2)}>Use ENSv2</KitButton>
              </TestStep>
            ) : !isTestnet ? (
              <TestStep title="Switch to Sepolia">
                <p>Subname renewals run on Sepolia for now.</p>
                <KitButton onClick={() => onIsTestnetChange(true)}>Use Sepolia</KitButton>
              </TestStep>
            ) : (
              <TestStep title={`Check ${PARENT}`}>
                {activation === undefined ? (
                  <span className="test-kit-status">
                    <span className="test-kit-status-dot" />
                    Loading activation…
                  </span>
                ) : expirable ? (
                  <span className="test-kit-status ok">
                    <span className="test-kit-status-dot" />
                    Expirable: subnames expire and can be renewed
                  </span>
                ) : (
                  <>
                    <span className="test-kit-status warn">
                      <span className="test-kit-status-dot" />
                      {activation ? "Permanent: subnames never expire" : "Not activated"}
                    </span>
                    <p>The form will explain there is nothing to renew until the owner makes subnames expirable.</p>
                  </>
                )}
              </TestStep>
            )}
            <TestStep title="Get a subname">
              <p>Mint one in the section above, pay with Sepolia ETH, then pick it here.</p>
              <KitButton href="#subname-mint">Mint a subname</KitButton>
              <KitButton href={SEPOLIA_ETH_FAUCET}>ETH faucet ↗</KitButton>
            </TestStep>
            <TestStep title="Choose the subname">
              {!address ? (
                <KitButton onClick={openConnectModal}>Connect to see your subnames</KitButton>
              ) : mine === null ? (
                <span className="test-kit-empty">Loading your subnames…</span>
              ) : mine.length === 0 ? (
                <span className="test-kit-empty">No subnames under {PARENT} in this wallet yet.</span>
              ) : (
                mine.map((s) => (
                  <Chip
                    key={s.label}
                    active={values.label === s.label}
                    meta={expiryMeta(s.expiry)}
                    onClick={() => pickLabel(s.label)}
                  >
                    {s.label}
                  </Chip>
                ))
              )}
              <Chip active={!values.label} onClick={() => pickLabel("")}>
                Type any subname
              </Chip>
            </TestStep>
          </TestKit>
          <PropsEditor defs={SUB_RENEW_DEFS} values={values} onChange={onChange} />
        </div>
        <DemoPanel>
          <SubnameRenewForm
            key={`${String(isTestnet)}-${values.label}-${mountKey}`}
            parentName={PARENT}
            label={values.label || undefined}
            isTestnet={isTestnet}
            noBorder={values.noBorder}
            title={values.title || undefined}
            subtitle={values.subtitle || undefined}
            onConnectWallet={openConnectModal}
            onCancel={() => setMountKey((k) => k + 1)}
            onRenewalSuccess={loadMine}
            onRenewParent={() => onRenewParent(PARENT)}
          />
        </DemoPanel>
      </div>
    </section>
  );
}
