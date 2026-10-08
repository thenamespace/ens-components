import { useEffect, useState } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { EnsNameRegistrationForm } from "@thenamespace/ens-components";
import ensSvg from "../assets/ens.svg";
import { SectionHeader } from "../components/SectionHeader";
import { CodePanel } from "../components/CodePanel";
import { DemoPanel } from "../components/DemoPanel";
import { PropsEditor } from "../components/PropsEditor";
import { generateCode } from "../components/generateCode";
import type { PropDef } from "../components/types";

const ENS_REG_DEFS: PropDef[] = [
  { key: "isTestnet",   type: "boolean", default: false, tip: "Use Sepolia testnet instead of Ethereum mainnet" },
  { key: "referrer",    type: "string",  default: "",    tip: "Registration referrer wallet address", placeholder: "0x… referral wallet" },
  { key: "noBorder",    type: "boolean", default: false, tip: "Remove the card border and shadow wrapper" },
  { key: "title",       type: "string",  default: "",    tip: "Override the form title text", placeholder: "title..." },
  { key: "subtitle",    type: "string",  default: "",    tip: "Override the subtitle below the title", placeholder: "subtitle..." },
  { key: "bannerImage", type: "string",  default: "",    tip: "URL of a custom banner image to replace the default", placeholder: "https://…/image.png" },
  { key: "hideBanner",  type: "boolean", default: false, tip: "Hide the banner image entirely" },
  { key: "bannerWidth", type: "number",  default: 250,   tip: "Width of the banner image in pixels" },
];

export function EnsRegistrationSection({ isTestnet, onIsTestnetChange }: { isTestnet: boolean; onIsTestnetChange: (v: boolean) => void }) {
  const { openConnectModal } = useConnectModal();
  const [values, setValues] = useState<Record<string, any>>(() => ({
    ...Object.fromEntries(ENS_REG_DEFS.map((d) => [d.key, d.default])),
    isTestnet,
  }));
  const [mountKey, setMountKey] = useState(0);

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
            key={`${String(isTestnet)}-${mountKey}`}
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
            onClose={() => setMountKey((k) => k + 1)}
          />
        </DemoPanel>
      </div>
    </section>
  );
}
