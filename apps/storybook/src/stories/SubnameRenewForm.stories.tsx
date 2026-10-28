import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { SubnameRenewForm } from "@thenamespace/ens-components";
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

const meta: Meta<typeof SubnameRenewForm> = {
  title: "Components/SubnameRenewForm",
  component: SubnameRenewForm,
  decorators: [withWallet],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Renews onchain subnames minted under an ENSv2 activation, at the price the parent's owner set. Warns when the subname would outlive its parent. Anyone can renew any subname.",
      },
    },
  },
  argTypes: {
    parentName: {
      control: "text",
      description: "Parent name with an ENSv2 activation",
    },
    label: {
      control: "text",
      description: "Subname label. Leave empty to let the user type one",
    },
    isTestnet: {
      control: "boolean",
      description: "Use Sepolia testnet",
    },
  },
};

export default meta;
type Story = StoryObj<typeof SubnameRenewForm>;

export const Default: Story = {
  args: {
    parentName: "arti.eth",
    isTestnet: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Connect your wallet and enter a subname under arti.eth on Sepolia.",
      },
    },
  },
};

export const PrefilledLabel: Story = {
  args: {
    parentName: "arti.eth",
    label: "alice",
    isTestnet: true,
  },
  parameters: {
    docs: {
      description: { story: "Pre-filled with a subname label." },
    },
  },
};
