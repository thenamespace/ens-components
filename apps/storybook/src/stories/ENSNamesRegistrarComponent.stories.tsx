import React, { useState } from "react";
import {
  EnsNameRegistrationForm,
  EnsNameRegistrationFormProps,
  Text,
} from "@thenamespace/ens-components";
import type { Meta, StoryObj } from "@storybook/react";
import { WalletConnectProvider } from "../wallet-connect";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

const WalletContent = ({ 
  children 
}: { 
  children: React.ReactNode;
}) => {
  const { isConnected } = useAccount();

  return (
      <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Text weight="bold" size="lg">
            ENS Name Registration
          </Text>
          <ConnectButton />
        </div>
        
        {!isConnected ? (
          <div style={{ 
            textAlign: "center", 
            padding: "40px 20px",
            background: "var(--ns-color-bg-accent, #f4f4f4)",
            borderRadius: "12px",
            border: "1px solid var(--ns-color-border, #e5e7eb)"
          }}>
            <Text size="md" color="grey" style={{ marginBottom: "16px" }}>
              Please connect your wallet to register an ENS name
            </Text>
            <ConnectButton />
          </div>
        ) : (
          children
        )}
      </div>
  );
};

const WalletWrapper = ({ 
  children, 
  isTestnet 
}: { 
  children: React.ReactNode;
  isTestnet: boolean;
}) => {
  return (
    <WalletConnectProvider>
      <WalletContent>
        {children}
      </WalletContent>
    </WalletConnectProvider>
  );
};

const meta: Meta<typeof EnsNameRegistrationForm> = {
  title: "Components/EnsNameRegistrationForm",
  component: EnsNameRegistrationForm,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A multi-step component for registering ENS names. The component requires a connected wallet and supports both mainnet and testnet (Sepolia) networks. The component has 3 main steps: Summary (name search and configuration), Progress (commitment, timer, and registration), and Success (completion screen).",
      },
    },
  },
  argTypes: {
    isTestnet: {
      control: "boolean",
      description: "Toggle between mainnet (false) and Sepolia testnet (true)",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    name: {
      control: "text",
      description: "Initial ENS name to pre-fill (without .eth extension)",
      table: {
        type: { summary: "string" },
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof EnsNameRegistrationForm>;

const Template = (args: Partial<EnsNameRegistrationFormProps>) => {
  const [isTestnet, setIsTestnet] = useState(args.isTestnet ?? false);
  const [name, setName] = useState(args.name ?? "");

  return (
    <WalletWrapper isTestnet={isTestnet}>
      <div style={{ marginBottom: "16px", display: "flex", gap: "12px", alignItems: "center" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={isTestnet}
            onChange={(e) => setIsTestnet(e.target.checked)}
            style={{ cursor: "pointer" }}
          />
          <Text size="sm">Testnet (Sepolia)</Text>
        </label>
        {isTestnet && (
          <Text size="xs" color="grey">
            Using Sepolia testnet
          </Text>
        )}
      </div>
      <EnsNameRegistrationForm
        name={name}
        isTestnet={isTestnet}
      />
    </WalletWrapper>
  );
};

/**
 * **Default Story**
 *
 * The default ENS name registration form. Connect your wallet to start the registration process.
 * - Toggle between mainnet and testnet
 * - Connect wallet using the Connect button
 * - Form only appears when wallet is connected
 */
export const Default: Story = {
  render: Template,
  args: {
    name: "",
    isTestnet: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Default registration form. Connect your wallet and toggle between mainnet/testnet to get started.",
      },
    },
  },
};

/**
 * **With Pre-filled Name**
 *
 * Registration form with a pre-filled ENS name. Useful for testing or when you know the name in advance.
 */
export const WithPrefilledName: Story = {
  render: Template,
  args: {
    name: "example",
    isTestnet: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Registration form with a pre-filled name. The name will appear in the search field and availability will be checked automatically.",
      },
    },
  },
};

/**
 * **Testnet Mode**
 *
 * Registration form configured for Sepolia testnet. Use this for testing without spending real ETH.
 */
export const Testnet: Story = {
  render: Template,
  args: {
    name: "",
    isTestnet: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Testnet mode using Sepolia. Make sure your wallet is connected to Sepolia network. This is useful for testing without spending real ETH.",
      },
    },
  },
};
