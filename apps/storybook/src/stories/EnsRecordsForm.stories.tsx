import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { EnsRecordsForm } from "@thenamespace/ens-components";
import { WalletConnectProvider } from "../wallet-connect";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const withWallet = (Story: React.ComponentType) => (
  <WalletConnectProvider>
    <div style={{ padding: "20px", maxWidth: "680px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <ConnectButton />
      </div>
      <Story />
    </div>
  </WalletConnectProvider>
);

const meta: Meta<typeof EnsRecordsForm> = {
  title: "Components/EnsRecordsForm",
  component: EnsRecordsForm,
  decorators: [withWallet],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Form for updating ENS text records and address records on-chain. Requires a connected wallet.",
      },
    },
  },
  argTypes: {
    name: {
      control: "text",
      description:
        "Full ENS name, including a DNS name imported into ENS (e.g. vitalik.eth or example.com)",
    },
    isTestnet: {
      control: "boolean",
      description: "Use Sepolia testnet",
    },
    resolverAddress: {
      control: "text",
      description: "Optional resolver contract address",
    },
  },
};

export default meta;
type Story = StoryObj<typeof EnsRecordsForm>;

export const Default: Story = {
  args: {
    name: "devname.eth",
    isTestnet: false,
    resolverAddress: "0x231b0Ee14048e9dCcD1d247744d114a4Eb5E8E63",
    existingRecords: {
      addresses: [],
      texts: [
        { key: "description", value: "My ENS profile" },
        { key: "url", value: "https://example.com" },
      ],
    },
  },
};

export const Testnet: Story = {
  args: {
    name: "devname.eth",
    isTestnet: true,
    existingRecords: {
      addresses: [],
      texts: [],
    },
  },
  parameters: {
    docs: {
      description: { story: "Connected to Sepolia testnet." },
    },
  },
};

export const WithExistingRecords: Story = {
  args: {
    name: "devname.eth",
    isTestnet: false,
    resolverAddress: "0x231b0Ee14048e9dCcD1d247744d114a4Eb5E8E63",
    existingRecords: {
      addresses: [
        { coinType: 60, value: "0x1234567890123456789012345678901234567890" },
      ],
      texts: [
        { key: "description", value: "ENS enthusiast" },
        { key: "location", value: "Ethereum" },
        { key: "twitter", value: "@example" },
        { key: "url", value: "https://example.com" },
      ],
    },
  },
  parameters: {
    docs: {
      description: { story: "Pre-populated with existing text and address records." },
    },
  },
};
