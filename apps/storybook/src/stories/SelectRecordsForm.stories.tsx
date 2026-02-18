import type { Meta, StoryObj } from "@storybook/react";
import { SelectRecordsForm, EnsRecords } from "@thenamespace/ens-components";
import { useState } from "react";

let records: EnsRecords = {
  texts: [],
  addresses: [],
};

const updateRecords = (_records: EnsRecords) => {
  records = _records;
};

const meta: Meta<typeof SelectRecordsForm> = {
  title: "Components/SelectRecordsForm",
  component: SelectRecordsForm,
  args: {
    records: records,
    onRecordsUpdated: updateRecords,
  },
};
export default meta;

type Story = StoryObj<typeof SelectRecordsForm>;

export const Default: Story = {
  render: args => {
    const [records, setRecords] = useState<EnsRecords>({
      texts: [],
      addresses: [],
    });

    return (
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <SelectRecordsForm
          {...args} // keep controls working
          records={records} // but force our local state
          onRecordsUpdated={setRecords} // guaranteed function
        />
      </div>
    );
  },
};
