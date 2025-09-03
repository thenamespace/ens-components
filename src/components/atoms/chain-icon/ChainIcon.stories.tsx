import type { Meta, StoryObj } from "@storybook/react";
import { ChainIcon } from "./ChainIcon";

const meta: Meta<typeof ChainIcon> = {
  title: "Molecules/ChainIcon",
  component: ChainIcon,
  args: {
    chain: "eth",
    size: 24,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      {(
        ["eth", "arb", "base", "bitcoin", "matic", "op", "sol", "zora"] as const
      ).map(chain => (
        <div key={chain}>
          <ChainIcon chain={chain} size={32} />
          <div
            style={{
              marginTop: "8px",
              fontSize: "12px",
              textTransform: "capitalize",
            }}
          >
            {chain}
          </div>
        </div>
      ))}
    </div>
  ),
};
