import type { Meta, StoryObj } from "@storybook/react";
import { ChainIcon } from "./ChainIcon";

const meta: Meta<typeof ChainIcon> = {
  title: "Atoms/ChainIcon",
  component: ChainIcon,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'ChainIcon component for displaying blockchain network icons.',
      },
    },
  },
  args: {
    chain: "eth",
    size: 24,
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Component Documentation
export const ComponentDocs: Story = {
  render: () => (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
      <h2>Component Documentation</h2>
      
      <h3>Key Props</h3>
      <ul>
        <li><code>chain</code> - Chain name: 'eth', 'arb', 'base', 'bitcoin', 'matic', 'op', 'sol', 'zora'</li>
        <li><code>size</code> - Icon size in pixels (number, default: 24)</li>
        <li><code>className</code> - Additional CSS classes (string)</li>
      </ul>

      <h3>Usage Examples</h3>
      <pre style={{ backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '8px', overflow: 'auto' }}>
{`// Basic chain icon
<ChainIcon chain="eth" />

// With custom size
<ChainIcon chain="arb" size={32} />

// Bitcoin icon
<ChainIcon chain="bitcoin" size={24} />`}
      </pre>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Documentation for the ChainIcon component.',
      },
    },
  },
};

export const AllChains: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
      {(
        ["eth", "arb", "base", "bitcoin", "matic", "op", "sol", "zora", "celo"] as const
      ).map(chain => (
        <div key={chain} style={{ textAlign: "center" }}>
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
  parameters: {
    docs: {
      description: {
        story: 'All available blockchain icons.',
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <ChainIcon chain="eth" size={16} />
      <ChainIcon chain="eth" size={24} />
      <ChainIcon chain="eth" size={32} />
      <ChainIcon chain="eth" size={48} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different chain icon sizes.',
      },
    },
  },
};