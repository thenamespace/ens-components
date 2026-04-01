import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { SubnameMintForm } from "@thenamespace/ens-components";
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

const meta: Meta<typeof SubnameMintForm> = {
  title: "Components/SubnameMintForm",
  component: SubnameMintForm,
  decorators: [withWallet],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Form for minting onchain subnames under a parent ENS name. Handles pricing, profile records, and the mint transaction. Requires a connected wallet.",
      },
    },
  },
  argTypes: {
    parentName: {
      control: "text",
      description: "Parent ENS name whose subnames are available for minting",
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
type Story = StoryObj<typeof SubnameMintForm>;

export const Default: Story = {
  args: {
    parentName: "ninjabase.eth",
    isTestnet: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Connect your wallet and enter a subname to see pricing and mint.",
      },
    },
  },
};

export const Testnet: Story = {
  args: {
    parentName: "ninjabase.eth",
    isTestnet: true,
  },
  parameters: {
    docs: {
      description: { story: "Subname minting on Sepolia testnet." },
    },
  },
};

export const PrefilledLabel: Story = {
  args: {
    parentName: "ninjabase.eth",
    isTestnet: false,
    label: "alice",
  },
  parameters: {
    docs: {
      description: { story: "Pre-filled with a subname label." },
    },
  },
};
