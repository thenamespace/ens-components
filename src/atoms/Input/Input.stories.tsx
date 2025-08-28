import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input";

const meta: Meta<typeof Input> = {
  title: "Atoms/Input",
  component: Input,
  args: {
    placeholder: "Enter text...",
  },
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const WithPrefix: Story = {
  args: {
    prefix: "🔍",
    placeholder: "Search...",
  },
};

export const WithSuffix: Story = {
  args: {
    suffix: ".com",
    placeholder: "Enter domain",
  },
};

export const WithPrefixAndSuffix: Story = {
  args: {
    prefix: "$",
    suffix: "USD",
    placeholder: "0.00",
  },
};

export const NumberInput: Story = {
  args: {
    type: "number",
    placeholder: "Enter number",
    min: 0,
    max: 100,
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "300px" }}>
      <Input size="sm" placeholder="Small input" />
      <Input size="md" placeholder="Medium input" />
      <Input size="lg" placeholder="Large input" />
    </div>
  ),
};

export const Error: Story = {
  args: {
    error: true,
    placeholder: "Error state",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "Disabled input",
  },
}; 