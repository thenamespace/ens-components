import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "@thenamespace/ens-components";

const meta: Meta<typeof Input> = {
  title: "Atoms/Input",
  component: Input,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Input component with support for prefixes, suffixes, and various states.",
      },
    },
  },
  args: {
    placeholder: "Enter text...",
  },
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Input>;

// Component Documentation
export const ComponentDocs: Story = {
  render: () => (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "24px" }}>
      <h2>Component Documentation</h2>

      <h3>Key Props</h3>
      <ul>
        <li>
          <code>prefix</code> - Content before input (string)
        </li>
        <li>
          <code>suffix</code> - Content after input (string)
        </li>
        <li>
          <code>size</code> - Input size: 'sm', 'md', 'lg' (default: 'md')
        </li>
        <li>
          <code>error</code> - Error state (boolean)
        </li>
        <li>
          <code>disabled</code> - Disabled state (boolean)
        </li>
        <li>
          <code>placeholder</code> - Placeholder text (string)
        </li>
      </ul>

      <h3>Usage Examples</h3>
      <pre
        style={{
          backgroundColor: "#f5f5f5",
          padding: "16px",
          borderRadius: "8px",
          overflow: "auto",
        }}
      >
        {`// Basic input
<Input placeholder="Enter text..." />

// With prefix
<Input prefix="🔍" placeholder="Search..." />

// With prefix and suffix
<Input prefix="$" suffix="USD" placeholder="0.00" />`}
      </pre>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Documentation for the Input component.",
      },
    },
  },
};

export const WithPrefix: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        width: "300px",
      }}
    >
      <Input prefix="🔍" placeholder="Search..." />
      <Input prefix="$" placeholder="Enter amount" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Inputs with prefix content.",
      },
    },
  },
};

export const States: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        width: "300px",
      }}
    >
      <Input placeholder="Normal input" />
      <Input error placeholder="Error state" />
      <Input disabled placeholder="Disabled input" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Different input states: normal, error, and disabled.",
      },
    },
  },
};
