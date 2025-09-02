import type { Meta, StoryObj } from "@storybook/react";
import { Dropdown } from "./Dropdown";
import { Button } from "@/components/atoms/button/Button";

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
