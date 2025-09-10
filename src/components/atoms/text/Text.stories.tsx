import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "./Text";

const meta: Meta<typeof Text> = {
  title: "Atoms/Text",
  component: Text,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Text component with customizable size, weight, and color options.',
      },
    },
  },
  args: {
    children: "Sample text content",
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Text>;

// Component Documentation
export const ComponentDocs: Story = {
  render: () => (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
      <h2>Component Documentation</h2>
      
      <h3>Key Props</h3>
      <ul>
        <li><code>size</code> - Text size: 'sm', 'md', 'lg', 'xl' (default: 'md')</li>
        <li><code>weight</code> - Font weight: 'light', 'regular', 'medium', 'bold' (default: 'regular')</li>
        <li><code>color</code> - Text color: 'primary', 'grey', 'white' (default: 'primary')</li>
        <li><code>children</code> - Text content (ReactNode)</li>
      </ul>

      <h3>Usage Examples</h3>
      <pre style={{ backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '8px', overflow: 'auto' }}>
{`// Basic text
<Text>Hello world</Text>

// With custom styling
<Text size="lg" weight="bold" color="primary">
  Large bold text
</Text>

// Small grey text
<Text size="sm" color="grey">
  Small grey text
</Text>`}
      </pre>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Documentation for the Text component.',
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <Text size="sm">Small text</Text>
      <Text size="md">Medium text</Text>
      <Text size="lg">Large text</Text>
      <Text size="xl">Extra large text</Text>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different text sizes.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story: 'Different font weights.',
      },
    },
  },
};