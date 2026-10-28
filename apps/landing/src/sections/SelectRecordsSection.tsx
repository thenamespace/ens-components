import { useState } from "react";
import { MousePointerClick } from "lucide-react";
import { SelectRecordsForm } from "@thenamespace/ens-components";
import type { EnsRecords } from "@thenamespace/ens-components";
import { SectionHeader } from "../components/SectionHeader";
import { CodePanel } from "../components/CodePanel";
import { DemoPanel } from "../components/DemoPanel";

const SELECT_RECORDS_CODE = `import { SelectRecordsForm } from "@thenamespace/ens-components";
import type { EnsRecords } from "@thenamespace/ens-components";
import { useState } from "react";

const [records, setRecords] = useState<EnsRecords>({ addresses: [], texts: [] });

<SelectRecordsForm
  records={records}
  onRecordsUpdated={setRecords}
  noBorder={true}
/>`;

export function SelectRecordsSection() {
  const [records, setRecords] = useState<EnsRecords>({
    addresses: [],
    texts: [],
  });

  return (
    <section className="section" id="select-records">
      <SectionHeader
        icon={MousePointerClick}
        name="Record Selector"
        title="Select ENS Records"
        desc="Standalone record editor. No wallet or transaction required. Let users compose text records, addresses, and contenthash before submitting them to any form."
      />
      <div className="component-grid">
        <div className="code-col">
          <CodePanel title="SelectRecordsForm.tsx" code={SELECT_RECORDS_CODE} />
        </div>
        <DemoPanel>
          <SelectRecordsForm
            records={records}
            onRecordsUpdated={setRecords}
            noBorder
          />
        </DemoPanel>
      </div>
    </section>
  );
}
