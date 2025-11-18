import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { ENSNameCard } from "./EnsNameCard";
import type { ChainName } from "../../types";

const meta: Meta<typeof ENSNameCard> = {
  title: "Components/ENSNameCard",
  component: ENSNameCard,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
# ENSNameCard

A card component for displaying ENS name details, including avatar, name, expiry, and chain badge.

## Features

- **Avatar Display**: Shows ENS name avatar with chain badge overlay
- **Name Display**: Bold text display of the ENS name
- **Expiry Information**: Shows expiration date with clock icon
- **Chain Badge**: Displays the blockchain network icon (eth, arb, base, etc.)
- **Customizable**: Supports custom className for styling

## Usage

\`\`\`tsx
import { ENSNameCard } from '@/components/ens-names-card/EnsNameCard';

<ENSNameCard
  name="example.eth"
  imageUrl="https://example.com/avatar.png"
  expires="2026-12-31"
  chain="eth"
/>
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    name: {
      control: "text",
      description: "ENS name (e.g., 'example.eth')",
    },
    imageUrl: {
      control: "text",
      description: "Avatar image URL",
    },
    expires: {
      control: "text",
      description: "Expiry date (e.g., '2026-12-31')",
    },
    chain: {
      control: { type: "select" },
      options: [
        "eth",
        "arb",
        "base",
        "bitcoin",
        "matic",
        "op",
        "sol",
        "zora",
        "celo",
      ] as ChainName[],
      description: "Blockchain network chain name",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
  args: {
    name: "example.eth",
    imageUrl: "https://avatars.githubusercontent.com/u/123456?v=4",
    expires: "2026-12-31",
    chain: "eth",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "artii.eth",
    imageUrl: "https://avatars.githubusercontent.com/u/123456?v=4",
    expires: "2026-12-31",
    chain: "eth",
  },
  parameters: {
    docs: {
      description: {
        story: "Default ENSNameCard with Ethereum chain badge.",
      },
    },
  },
};

export const Arbitrum: Story = {
  args: {
    name: "jane.eth",
    imageUrl: "https://avatars.githubusercontent.com/u/789012?v=4",
    expires: "2027-05-20",
    chain: "arb",
  },
  parameters: {
    docs: {
      description: {
        story: "ENSNameCard with Arbitrum chain badge.",
      },
    },
  },
};

export const Base: Story = {
  args: {
    name: "alice.eth",
    imageUrl: "https://avatars.githubusercontent.com/u/345678?v=4",
    expires: "2028-01-15",
    chain: "base",
  },
  parameters: {
    docs: {
      description: {
        story: "ENSNameCard with Base chain badge.",
      },
    },
  },
};

export const Optimism: Story = {
  args: {
    name: "bob.eth",
    imageUrl: "https://avatars.githubusercontent.com/u/456789?v=4",
    expires: "2027-11-30",
    chain: "op",
  },
  parameters: {
    docs: {
      description: {
        story: "ENSNameCard with Optimism chain badge.",
      },
    },
  },
};

export const Polygon: Story = {
  args: {
    name: "charlie.eth",
    imageUrl: "https://avatars.githubusercontent.com/u/567890?v=4",
    expires: "2026-08-22",
    chain: "matic",
  },
  parameters: {
    docs: {
      description: {
        story: "ENSNameCard with Polygon chain badge.",
      },
    },
  },
};

export const LongName: Story = {
  args: {
    name: "verylongensnameexample.eth",
    imageUrl: "https://avatars.githubusercontent.com/u/678901?v=4",
    expires: "2027-03-10",
    chain: "eth",
  },
  parameters: {
    docs: {
      description: {
        story: "ENSNameCard with a longer ENS name to test text wrapping.",
      },
    },
  },
};

export const AllChains: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1.5rem",
        maxWidth: "800px",
      }}
    >
      {(
        [
          "eth",
          "arb",
          "base",
          "bitcoin",
          "matic",
          "op",
          "sol",
          "zora",
          "celo",
        ] as ChainName[]
      ).map((chain, index) => (
        <ENSNameCard
          key={chain}
          name={`example${index + 1}.eth`}
          imageUrl={`https://avatars.githubusercontent.com/u/${123456 + index}?v=4`}
          expires="2026-12-31"
          chain={chain}
        />
      ))}
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story: "Showcase of ENSNameCard with all available chain badges.",
      },
    },
  },
};

export const WithCustomClassName: Story = {
  args: {
    name: "custom.eth",
    imageUrl: "https://avatars.githubusercontent.com/u/789012?v=4",
    expires: "2027-09-15",
    chain: "eth",
    className: "custom-ens-card",
  },
  parameters: {
    docs: {
      description: {
        story: "ENSNameCard with custom className for additional styling.",
      },
    },
  },
};
