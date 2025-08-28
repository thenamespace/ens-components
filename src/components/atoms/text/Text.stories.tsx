import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "./Text";

const meta: Meta<typeof Text> = {
  title: "Atoms/Text",
  component: Text,
  args: {
    children: "Sample text content",
  },
};
export default meta;

type Story = StoryObj<typeof Text>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <Text size="sm">Small text</Text>
      <Text size="md">Medium text</Text>
      <Text size="lg">Large text</Text>
      <Text size="xl">Extra large text</Text>
    </div>
  ),
};

export const Weights: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <Text weight="light">Light weight text</Text>
      <Text weight="regular">Regular weight text</Text>
      <Text weight="medium">Medium weight text</Text>
      <Text weight="bold">Bold weight text</Text>
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <Text color="primary">Primary color text</Text>
      <Text color="grey">Grey color text</Text>
      <div style={{ background: "#333", padding: "0.5rem" }}>
        <Text color="white">White color text</Text>
      </div>
    </div>
  ),
};

export const Combinations: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Text size="xl" weight="bold" color="primary">
        Large bold primary text
      </Text>
      <Text size="lg" weight="medium" color="grey">
        Large medium grey text
      </Text>
      <Text size="sm" weight="light" color="primary">
        Small light primary text
      </Text>
    </div>
  ),
}; 