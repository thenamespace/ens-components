import type { Meta, StoryObj } from "@storybook/react";
import { Dropdown } from "./Dropdown";
import { Button } from "@/components/atoms";
import { Icon } from "@/components/atoms";

const meta: Meta<typeof Dropdown> = {
  title: "Molecules/Dropdown",
  component: Dropdown,
  args: {
    trigger: <Button>Click me</Button>,
    children: (
      <div style={{ padding: "1rem" }}>
        <div>Menu item 1</div>
        <div>Menu item 2</div>
        <div>Menu item 3</div>
      </div>
    ),
  },
};
export default meta;

type Story = StoryObj<typeof Dropdown>;

export const Default: Story = {};

export const TopPlacement: Story = {
  args: {
    placement: "top",
  },
};

export const CenterAligned: Story = {
  args: {
    align: "center",
  },
};

export const RightAligned: Story = {
  args: {
    align: "end",
  },
};

export const CustomTrigger: Story = {
  args: {
    trigger: (
      <div
        style={{
          padding: "0.5rem 1rem",
          background: "var(--ns-color-primary)",
          color: "var(--ns-color-primary-contrast)",
          borderRadius: "var(--ns-radius-md)",
          cursor: "pointer",
        }}
      >
        Custom Trigger
      </div>
    ),
  },
};

export const ImageActionMenu: Story = {
  args: {
    placement: "top",
    align: "end",
    trigger: (
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: "999px",
          border: "1px solid var(--ns-color-border)",
          background: "var(--ns-color-bg)",
          color: "var(--ns-color-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <Icon name="plus" size={16} />
      </div>
    ),
    children: (
      <div style={{ minWidth: 148, padding: 4 }}>
        <button
          type="button"
          style={{
            width: "100%",
            border: 0,
            borderRadius: 8,
            background: "transparent",
            textAlign: "left",
            padding: "8px 9px",
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Upload image
        </button>
        <button
          type="button"
          style={{
            width: "100%",
            border: 0,
            borderRadius: 8,
            background: "transparent",
            textAlign: "left",
            padding: "8px 9px",
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Enter URL
        </button>
      </div>
    ),
  },
};
