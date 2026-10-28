import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { NameRenewForm } from "@thenamespace/ens-components";
import { WalletConnectProvider } from "../wallet-connect";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const withWallet = (Story: React.ComponentType) => (
  <WalletConnectProvider>
    <div style={{ padding: "20px", maxWidth: "680px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 16,
        }}
      >
        <ConnectButton />
      </div>
      <Story />
    </div>
  </WalletConnectProvider>
);

const meta: Meta<typeof NameRenewForm> = {
  title: "Components/NameRenewForm",
  component: NameRenewForm,
  decorators: [withWallet],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "One-step renewal for .eth names. Shows the current expiry, prices the extension, and sends the transaction. Version 1 renews ENSv1 names in ETH, version 2 renews ENSv2 names in USDC or DAI. Anyone can renew any name.",
      },
    },
  },
  argTypes: {
    name: {
      control: "text",
      description:
        "Name to renew, with or without .eth. Leave empty to let the user type one",
    },
    version: {
      control: "inline-radio",
      options: [1, 2],
      description:
        "1 renews through ENSv1 in ETH, 2 through ENSv2 in USDC or DAI",
    },
    isTestnet: {
      control: "boolean",
      description: "Use Sepolia testnet",
    },
  },
};

export default meta;
type Story = StoryObj<typeof NameRenewForm>;

export const Default: Story = {
  args: {
    isTestnet: false,
    version: 1,
  },
  parameters: {
    docs: {
      description: {
        story:
          "ENSv1 renewal on mainnet, paid in ETH. The user types the name.",
      },
    },
  },
};

export const EnsV2: Story = {
  args: {
    isTestnet: false,
    version: 2,
  },
  parameters: {
    docs: {
      description: { story: "ENSv2 renewal on mainnet, paid in USDC or DAI." },
    },
  },
};

export const Testnet: Story = {
  args: {
    name: "arti.eth",
    isTestnet: true,
    version: 2,
  },
  parameters: {
    docs: {
      description: {
        story: "ENSv2 renewal on Sepolia, pre-filled with a name.",
      },
    },
  },
};
