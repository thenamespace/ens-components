import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ContenthashProtocol, EnsContenthashRecord, EnsRecords } from "@/types";
import { WalletConnect } from "@/wallet-connect";
import { EnsRecordsForm } from "./EnsRecordsForm";
import { Button, Input, Text } from "../atoms";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Address, zeroAddress } from "viem";
import axios from "axios";
import { Alert } from "../molecules";

interface ApiEnsRecords {
  texts: { key: string; value: string }[];
  addresses: { address: string; coin: number; name: string }[];
  contenthash: string;
  resolver: Address;
}

const globalResolver = "https://staging.global-resolver.namespace.ninja/";

const fetchProfileForName = (name: string) => {
  return axios
    .get<ApiEnsRecords>(
      `${globalResolver}/api/v1/resolve/ens/profile/name/${name}?noCache=true`
    )
    .then(res => res.data);
};

let records: EnsRecords = {
  texts: [],
  addresses: [],
};

const updateRecords = (_records: EnsRecords) => {
  records = _records;
};

const meta: Meta<typeof EnsRecordsForm> = {
  title: "Components/EnsRecordsForm",
  component: EnsRecordsForm,
  args: {
    name: "artii.eth",
  },
};
export default meta;

type Story = StoryObj<typeof EnsRecordsForm>;

export const Default: Story = {
  render: args => {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <WalletConnect>
          <StoryComponent />
        </WalletConnect>
      </div>
    );
  },
};

const StoryComponent = () => {
  const { address, isConnected } = useAccount();
  const [initalRecords, setInitialRecords] = useState<EnsRecords>();
  const [resolver, setResolver] = useState<string>(zeroAddress);
  const [selectedName, setSelectedName] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [apiError, setApiError] = useState(false);

  if (!address) {
    return (
      <div>
        <Text>Connect to continue</Text>
        <ConnectButton></ConnectButton>
      </div>
    );
  }

  const onNameSelected = async () => {
    try {
      const data = await fetchProfileForName(selectedName);
      let contenthash: EnsContenthashRecord | undefined = undefined;

      if (data.contenthash && data.contenthash.length > 0) {
        const split = data.contenthash.split("://");
        if (split.length === 2) {
          const protocol = split[0] as ContenthashProtocol;
          const value = split[1];
          contenthash = {
            protocol,
            value,
          };
        }
      }

      const existingRecords: EnsRecords = {
        texts: data.texts,
        addresses: data.addresses.map(addr => {
          return { coinType: addr.coin, value: addr.address };
        }),
        contenthash,
      };
      setResolver(data.resolver);
      setInitialRecords(existingRecords);
      setShowForm(true);
    } catch (err) {
      setApiError(true);
    }
  };

  if (!showForm) {
    return (
      <div>
        <Input
          value={selectedName}
          onChange={e => setSelectedName(e.target.value)}
          placeholder="Your ENS name here..."
        ></Input>
        <Button
          disabled={selectedName.length < 3}
          onClick={() => onNameSelected()}
        >
          Update Records
        </Button>
        {apiError && (
          <Alert title="Error" variant="error">
            {`Failed to fetch records for name: ${selectedName}`}
          </Alert>
        )}
      </div>
    );
  }

  return (
    <div className="row">
      <EnsRecordsForm
        name={selectedName}
        resolverAddress={resolver as Address}
        initialRecords={initalRecords}
        onCancel={() => {
          setSelectedName("");
          setShowForm(false);
        }}
      ></EnsRecordsForm>
    </div>
  );
};
