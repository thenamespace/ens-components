import { useState } from "react";
import { Loader } from "lucide-react";
import { TransactionModal, TransactionProgress } from "@thenamespace/ens-components";
import type { TransactionProgressStatus } from "@thenamespace/ens-components";
import { SectionHeader } from "../components/SectionHeader";
import { CodePanel } from "../components/CodePanel";
import { DemoPanel } from "../components/DemoPanel";
import { PropsEditor } from "../components/PropsEditor";
import { Chip, KitButton, TestKit, TestStep } from "../components/TestKit";
import { generateCode } from "../components/generateCode";
import type { PropDef } from "../components/types";

const SAMPLE_HASH = "0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060";

const TX_DEFS: PropDef[] = [
  { key: "hash",              type: "string", default: SAMPLE_HASH, tip: "Transaction hash, used for the explorer link" },
  { key: "title",             type: "string", default: "",          tip: "Override the title for the current status", placeholder: "title..." },
  { key: "description",       type: "string", default: "",          tip: "Override the description for the current status", placeholder: "description..." },
  { key: "duration",          type: "number", default: 10000,       tip: "Milliseconds the rail takes to travel to 90%, where it waits for confirmation" },
];

const STATUSES: TransactionProgressStatus[] = ["pending", "success", "failed"];

const DETAILS = [
  { label: "Name", value: "unicorn.eth" },
  { label: "Action", value: "Update Resolver" },
  { label: "New Resolver", value: "Namespace Hybrid Resolver" },
];

const DETAILS_CODE = `details={[
    { label: "Name", value: "unicorn.eth" },
    { label: "Action", value: "Update Resolver" },
  ]}`;

export function TransactionModalSection({ isTestnet }: { isTestnet: boolean }) {
  const [values, setValues] = useState<Record<string, any>>(() =>
    Object.fromEntries(TX_DEFS.map((d) => [d.key, d.default])),
  );
  const [status, setStatus] = useState<TransactionProgressStatus>("pending");
  const [isOpen, setIsOpen] = useState(false);
  const [mountKey, setMountKey] = useState(0);

  const onChange = (key: string, val: any) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const pickStatus = (next: TransactionProgressStatus) => {
    setStatus(next);
    if (next === "pending") setMountKey((k) => k + 1);
  };

  const progressProps = {
    status,
    hash: values.hash || undefined,
    chainId: isTestnet ? 11155111 : 1,
    title: values.title || undefined,
    description: values.description || undefined,
    duration: values.duration || undefined,
    details: DETAILS,
  };

  const code = generateCode("TransactionModal", TX_DEFS, values, [
    `status="${status}"`,
    `chainId={${progressProps.chainId}}`,
    DETAILS_CODE,
    "isOpen={isOpen}",
    "onClose={() => setIsOpen(false)}",
  ]);

  return (
    <section className="section" id="transaction-modal">
      <SectionHeader
        icon={Loader}
        name="Transaction Modal"
        title="Transaction Progress"
        desc="The pending transaction screen used by every form, exposed on its own. Render it inline with TransactionProgress or in a dialog with TransactionModal."
      />
      <div className="component-grid">
        <div className="code-col">
          <CodePanel title="TransactionModal.tsx" code={code} />
          <TestKit network={isTestnet ? "Sepolia" : "Mainnet"}>
            <TestStep title="Status">
              {STATUSES.map((s) => (
                <Chip key={s} active={status === s} onClick={() => pickStatus(s)}>
                  {s}
                </Chip>
              ))}
            </TestStep>
            <TestStep title="Modal">
              <KitButton onClick={() => setIsOpen(true)}>Open TransactionModal</KitButton>
            </TestStep>
          </TestKit>
          <PropsEditor defs={TX_DEFS} values={values} onChange={onChange} />
        </div>
        <DemoPanel>
          <TransactionProgress key={mountKey} {...progressProps} />
        </DemoPanel>
      </div>
      <TransactionModal
        key={`modal-${mountKey}`}
        {...progressProps}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </section>
  );
}
