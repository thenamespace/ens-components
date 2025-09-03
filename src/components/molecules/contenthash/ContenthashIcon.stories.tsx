import type { Meta, StoryObj } from "@storybook/react";
import { ContenthashIcon } from "./ContenthashIcon";
import { ContenthashProtocol } from "@/types";

const meta: Meta<typeof ContenthashIcon> = {
  title: "Molecules/ContenthashIcon",
  component: ContenthashIcon,
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    protocol: "airwave",
    size: 20,
  },

  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <div style={{ textAlign: "center" }}>
        <ContenthashIcon protocol={ContenthashProtocol.Ipfs} size={16} />
        <div style={{ marginTop: "4px", fontSize: "10px" }}>16px</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <ContenthashIcon protocol={ContenthashProtocol.Arweave} size={24} />
        <div style={{ marginTop: "4px", fontSize: "10px" }}>24px</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <ContenthashIcon protocol={ContenthashProtocol.Onion} size={32} />
        <div style={{ marginTop: "4px", fontSize: "10px" }}>32px</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <ContenthashIcon protocol={ContenthashProtocol.Skynet} size={48} />
        <div style={{ marginTop: "4px", fontSize: "10px" }}>48px</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <ContenthashIcon protocol={ContenthashProtocol.Swarm} size={48} />
        <div style={{ marginTop: "4px", fontSize: "10px" }}>48px</div>
      </div>
    </div>
  ),
};
