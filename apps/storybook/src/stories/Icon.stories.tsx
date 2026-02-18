import type { Meta, StoryObj } from "@storybook/react";
import { Icon, IconName } from "@thenamespace/ens-components";

const meta: Meta<typeof Icon> = {
  title: "Atoms/Icon",
  component: Icon,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Icon component with support for various icon types and custom styling.",
      },
    },
  },
  args: {
    name: "person",
    size: 24,
    color: "currentColor",
  },
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Icon>;

// Component Documentation
export const ComponentDocs: Story = {
  render: () => (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "24px" }}>
      <h2>Component Documentation</h2>

      <h3>Key Props</h3>
      <ul>
        <li>
          <code>name</code> - Icon name (IconName)
        </li>
        <li>
          <code>size</code> - Icon size in pixels (number, default: 24)
        </li>
        <li>
          <code>color</code> - Icon color (string, default: 'currentColor')
        </li>
        <li>
          <code>className</code> - Additional CSS classes (string)
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
        {`// Basic icon
<Icon name="person" />

// With custom size and color
<Icon name="check-circle" size={32} color="#22c55e" />

// Social media icon
<Icon name="github" size={24} />`}
      </pre>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Documentation for the Icon component.",
      },
    },
  },
};

export const CommonIcons: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        flexWrap: "wrap",
      }}
    >
      <Icon name="person" size={24} />
      <Icon name="search" size={24} />
      <Icon name="globe" size={24} />
      <Icon name="mail" size={24} />
      <Icon name="check-circle" size={24} />
      <Icon name="x-circle" size={24} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Common UI icons.",
      },
    },
  },
};

export const SocialIcons: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <Icon name="twitter" size={24} />
      <Icon name="discord" size={24} />
      <Icon name="github" size={24} />
      <Icon name="telegram" size={24} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Social media icons.",
      },
    },
  },
};
