import { useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { NameRenewForm } from "@thenamespace/ens-components";
import { SectionHeader } from "../components/SectionHeader";
import { CodePanel } from "../components/CodePanel";
import { DemoPanel } from "../components/DemoPanel";
import { PropsEditor } from "../components/PropsEditor";
import { Chip, KitButton, TestKit, TestStep } from "../components/TestKit";
import { generateCode } from "../components/generateCode";
import type { PropDef } from "../components/types";
import { SEPOLIA_ETH_FAUCET, SEPOLIA_USDC_FAUCET, useTestFunds } from "../utils/testTokens";

const RENEW_DEFS: PropDef[] = [
  { key: "name",      type: "string",  default: "",    tip: "Name to renew. Leave empty to let the user type one", placeholder: "alice.eth" },
  { key: "referrer",  type: "string",  default: "",    tip: "Referrer wallet recorded with the renewal", placeholder: "0x… referral wallet" },
  { key: "title",     type: "string",  default: "",    tip: "Override the form title text", placeholder: "title..." },
  { key: "subtitle",  type: "string",  default: "",    tip: "Optional subtitle shown below the title", placeholder: "subtitle..." },
  { key: "noBorder",  type: "boolean", default: true,  tip: "Remove the card border, for embedding in your own container" },
];

const SAMPLE_NAMES = ["arti.eth", "smarty.eth", "myownname.eth"];

export function EnsRenewalSection({
  isTestnet,
  onIsTestnetChange,
  requestedName,
  version,
}: {
  isTestnet: boolean;
  onIsTestnetChange: (v: boolean) => void;
  requestedName?: { name: string; at: number };
  version: 1 | 2;
}) {
  const { openConnectModal } = useConnectModal();
  const funds = useTestFunds();
  const [values, setValues] = useState<Record<string, any>>(() => ({
    ...Object.fromEntries(RENEW_DEFS.map((d) => [d.key, d.default])),
  }));
  const [mountKey, setMountKey] = useState(0);

  const onChange = (key: string, val: any) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };


  useEffect(() => {
    if (requestedName) setValues((prev) => ({ ...prev, name: requestedName.name }));
  }, [requestedName]);

  const pickName = (name: string) => {
    setValues((prev) => ({ ...prev, name }));
    setMountKey((k) => k + 1);
  };

  const code = generateCode("NameRenewForm", RENEW_DEFS, values, [`isTestnet={${isTestnet}}`, `version={${version}}`]);
  const v1OnTestnet = isTestnet && version === 1;

  return (
    <section className="section" id="ens-renewal">
      <SectionHeader
        icon={CalendarClock}
        name="ENS Renewal"
        title="Renew ENS Names"
        desc="One-step renewal for .eth names: shows the current expiry, prices the extension, and sends a single transaction. Version 2 renews ENSv2 names in USDC or DAI, version 1 renews ENSv1 names in ETH."
      />
      <div className="component-grid">
        <DemoPanel>
          <NameRenewForm
            key={`${String(isTestnet)}-${version}-${values.name}-${mountKey}`}
            name={values.name || undefined}
            isTestnet={isTestnet}
            noBorder={values.noBorder}
            version={version}
            referrer={values.referrer || undefined}
            title={values.title || undefined}
            subtitle={values.subtitle || undefined}
            onConnectWallet={openConnectModal}
            onCancel={() => setMountKey((k) => k + 1)}
          />
        </DemoPanel>
        <div className="code-col">
          <CodePanel title="NameRenewForm.tsx" code={code} />
          <TestKit
            network={isTestnet ? "Sepolia" : "Mainnet"}
            note={
              <>
                <strong>Renewals are permissionless.</strong> Anyone can extend any name, and the owner keeps it.
                That makes any registered name a valid test subject.
              </>
            }
          >
            {v1OnTestnet && (
              <TestStep title="ENSv1 renews on mainnet">
                <p>
                  ENS moved ENSv1 renewals to ENSv2 on Sepolia. Switch the nav to ENSv2 to renew those names here.
                </p>
              </TestStep>
            )}
            {isTestnet ? (
              <TestStep title="Fund your wallet">
                <p>Gas is paid in Sepolia ETH. The renewal itself is paid in DAI or USDC.</p>
                <KitButton onClick={funds.isConnected ? funds.mintDai : openConnectModal} disabled={funds.minting}>
                  {!funds.isConnected ? "Connect wallet" : funds.minting ? "Minting…" : "Mint 1,000 test DAI"}
                </KitButton>
                <KitButton href={SEPOLIA_USDC_FAUCET}>USDC faucet ↗</KitButton>
                <KitButton href={SEPOLIA_ETH_FAUCET}>ETH faucet ↗</KitButton>
                {funds.isConnected && (
                  <span className="test-kit-balance">
                    {funds.dai} DAI · {funds.usdc} USDC
                  </span>
                )}
                {funds.error && <p className="ens-lookup-error">{funds.error}</p>}
              </TestStep>
            ) : (
              <TestStep title="Mainnet costs real ETH">
                <p>Switch the playground to Sepolia to test for free.</p>
                <KitButton onClick={() => onIsTestnetChange(true)}>Use Sepolia</KitButton>
              </TestStep>
            )}
            <TestStep title="Choose a name">
              {isTestnet &&
                SAMPLE_NAMES.map((n) => (
                  <Chip key={n} active={values.name === n} onClick={() => pickName(n)}>
                    {n}
                  </Chip>
                ))}
              <Chip active={!values.name} onClick={() => pickName("")}>
                Type your own
              </Chip>
            </TestStep>
          </TestKit>
          <PropsEditor defs={RENEW_DEFS} values={values} onChange={onChange} />
        </div>
      </div>
    </section>
  );
}
