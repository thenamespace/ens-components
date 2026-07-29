import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { OffchainSubnameForm } from "@thenamespace/ens-components";
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

const meta: Meta<typeof OffchainSubnameForm> = {
  title: "Components/OffchainSubnameForm",
  component: OffchainSubnameForm,
  decorators: [withWallet],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Form for creating offchain subnames under a parent ENS name via the Namespace API. Requires an API key and a parent name managed by Namespace.",
      },
    },
  },
  argTypes: {
    name: {
      control: "text",
      description:
        "Parent ENS name, including an ENS-imported DNS name (e.g. yourname.eth or example.com)",
    },
    apiKeyOrToken: {
      control: "text",
      description: "Namespace API key or JWT token",
    },
    isTestnet: {
      control: "boolean",
      description: "Use Sepolia testnet",
    },
    label: {
      control: "text",
      description: "Pre-fill the subname label",
    },
  },
};

export default meta;
type Story = StoryObj<typeof OffchainSubnameForm>;

export const Default: Story = {
  args: {
    name: "offchainsub.eth",
    apiKeyOrToken: "",
    isTestnet: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Provide a parent name and API key to create offchain subnames.",
      },
    },
  },
};

export const Testnet: Story = {
  args: {
    name: "offchainsub.eth",
    apiKeyOrToken: "",
    isTestnet: true,
  },
  parameters: {
    docs: {
      description: { story: "Offchain subname creation on Sepolia testnet." },
    },
  },
};

export const PrefilledLabel: Story = {
  args: {
    name: "offchainsub.eth",
    apiKeyOrToken: "",
    isTestnet: false,
    label: "alice",
  },
  parameters: {
    docs: {
      description: { story: "Pre-filled with a subname label." },
    },
  },
};
