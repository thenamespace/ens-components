import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { EnsRecords } from "@/types";
import { WalletConnect } from "@/wallet-connect";
import { EnsRecordsForm } from "./EnsRecordsForm";
import { Button, Input, Text } from "../atoms";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Address, zeroAddress } from "viem";
import axios from "axios";
import { SelectRecordsForm } from "..";

interface ApiEnsRecords {
  texts: { key: string; value: string }[];
  addresses: { address: string; coin: number; name: string }[];
  contenthash: string;
  resolver: Address;
}

const globalResolver = "https://staging.global-resolver.namespace.ninja";

const fetchProfileForName = (name: string) => {
  return axios
    .get<ApiEnsRecords>(
      `${globalResolver}/api/v1/resolve/ens/name/${name}/profile?noCache=true`
    )
    .then(res => res.data);
};

let records: EnsRecords = {
  texts: [],
  addresses: [],
};

export default {
  title: "Components/EnsRecordsForm",
  component: EnsRecordsForm,
  decorators: [
    (Story: any) => (
      <WalletConnect>
        <Story />
      </WalletConnect>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
# EnsRecordsForm

A comprehensive form component for editing ENS (Ethereum Name Service) records. This component allows users to modify text records, address records, and other ENS data associated with a domain name.

## Features

- **Text Records**: Edit various text records like description, URL, avatar, etc.
- **Address Records**: Manage cryptocurrency addresses for different coin types
- **Contenthash Records**: Set content hash for decentralized websites
- **Real-time Validation**: Validates ENS records before submission
- **Transaction Management**: Handles blockchain transactions for record updates

## Usage

\`\`\`tsx
import { EnsRecordsForm } from '@/components/ens-records-form/EnsRecordsForm';
import { WalletConnect } from '@/wallet-connect';

<WalletConnect>
  <EnsRecordsForm
    name="example.eth"
    resolverAddress="0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41"
    initialRecords={records}
    onSuccess={(txHash) => console.log('Transaction:', txHash)}
  />
</WalletConnect>
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    name: {
      control: { type: "text" },
      description: 'The ENS name to edit records for (e.g., "example.eth")',
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
      },
    },
    initialRecords: {
      control: { type: "object" },
      description: "Initial records to populate the form with",
      table: {
        type: { summary: "EnsRecords" },
        defaultValue: { summary: "undefined" },
      },
    },
    resolverAddress: {
      control: { type: "text" },
      description: "The resolver contract address for the ENS name",
      table: {
        type: { summary: "Address" },
        defaultValue: { summary: "undefined" },
      },
    },
    chainId: {
      control: { type: "number" },
      description: "The blockchain chain ID (defaults to mainnet)",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "1" },
      },
    },
    onCancel: {
      action: "cancelled",
      description: "Callback function called when the user cancels editing",
      table: {
        type: { summary: "() => void" },
        defaultValue: { summary: "undefined" },
      },
    },
    onSuccess: {
      action: "success",
      description:
        "Callback function called when records are successfully updated",
      table: {
        type: { summary: "(txHash: Hash) => void" },
        defaultValue: { summary: "undefined" },
      },
    },
  },
} as Meta<typeof EnsRecordsForm>;

const Template = (args: any) => <EnsRecordsForm {...args} />;

export const Default: StoryObj<typeof EnsRecordsForm> = {
  render: Template,
  args: {
    name: "artii.eth",
    resolverAddress: "0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41",
    chainId: 1,
  },
  parameters: {
    docs: {
      description: {
        story:
          "The default view of the EnsRecordsForm component with basic configuration.",
      },
    },
  },
};

export const WithInitialRecords: StoryObj<typeof EnsRecordsForm> = {
  render: Template,
  args: {
    name: "example.eth",
    resolverAddress: "0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41",
    chainId: 1,
    initialRecords: {
      texts: [
        { key: "description", value: "This is an example ENS name" },
        { key: "url", value: "https://example.com" },
        { key: "avatar", value: "https://example.com/avatar.png" },
      ],
      addresses: [
        { coinType: 60, value: "0x1234567890123456789012345678901234567890" },
        { coinType: 0, value: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa" },
      ],
    },
    onCancel: () => console.log("Cancel clicked"),
    onSuccess: (txHash: any) => console.log("Success:", txHash),
  },
  parameters: {
    docs: {
      description: {
        story:
          "EnsRecordsForm with pre-populated records and callback handlers.",
      },
    },
  },
};

export const InteractiveDemo: StoryObj<typeof EnsRecordsForm> = {
  render: (args: any) => {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <StoryComponent />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Interactive demo with wallet connection and ENS name input.",
      },
    },
  },
};

export const Docs: StoryObj<typeof EnsRecordsForm> = {
  render: Template,
  args: {
    name: "example.eth",
    resolverAddress: "0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41",
    chainId: 1,
    initialRecords: {
      texts: [
        { key: "description", value: "This is an example ENS name" },
        { key: "url", value: "https://example.com" },
        { key: "avatar", value: "https://example.com/avatar.png" },
      ],
      addresses: [
        { coinType: 60, value: "0x1234567890123456789012345678901234567890" },
        { coinType: 0, value: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa" },
      ],
    },
    onCancel: () => console.log("Cancel clicked"),
    onSuccess: (txHash: any) => console.log("Success:", txHash),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Complete documentation and examples for the EnsRecordsForm component.",
      },
    },
  },
};

const StoryComponent = () => {
  const { address, isConnected } = useAccount();
  const [initalRecords, setInitialRecords] = useState<EnsRecords>();
  const [resolver, setResolver] = useState<Address>(zeroAddress);
  const [selectedName, setSelectedName] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { openConnectModal } = useConnectModal();

  const [demoRecords, setDemoRecords] = useState<EnsRecords>({
    texts: [],
    addresses: [],
  });

  const onActionButton = () => {
    if (!address) {
      openConnectModal?.();
      return;
    } else if (!showForm) {
      handleSelect();
    } else {
      setInitialRecords({ texts: [], addresses: [] });
      setSelectedName("");
      setResolver(zeroAddress);
      setShowForm(false);
    }
  };

  const handleSelect = async () => {
    const data = await fetchProfileForName(selectedName);
    setInitialRecords({
      texts: data.texts,
      addresses: data.addresses.map(addr => {
        return { coinType: addr.coin, value: addr.address };
      }),
    });
    setResolver(data.resolver);
    setShowForm(true);
  };

  return (
    <div style={{ width: "1080px" }} className="row">
      <div className="col col-lg-4">
        <div className="ns-mt-3">
          <Text size="md" weight="medium" color="primary">
            Your ENS name
          </Text>
          <Input
            value={selectedName}
            onChange={e => setSelectedName(e.target.value)}
            placeholder="example.eth"
          ></Input>
          <div className="d-flex ns-mt-1" style={{ gap: address ? "5px" : "" }}>
            {address && (
              <Button variant="outline" style={{ width: "100%" }}>
                Disconnect
              </Button>
            )}
            <Button onClick={() => onActionButton()} style={{ width: "100%" }}>
              {address ? "Update Records" : "Connect"}
            </Button>
          </div>
        </div>
      </div>
      <div className="col col-lg-8 d-flex justify-content-end">
        {showForm && (
          <EnsRecordsForm
            initialRecords={initalRecords}
            resolverAddress={resolver}
            name={selectedName}
          />
        )}
        {!showForm && (
          <SelectRecordsForm
            records={demoRecords}
            onRecordsUpdated={r => setDemoRecords(r)}
          />
        )}
      </div>
    </div>
  );
};
