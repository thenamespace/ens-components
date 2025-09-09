import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ContenthashProtocol, EnsContenthashRecord, EnsRecords } from "@/types";
import { WalletConnect } from "@/wallet-connect";
import { EnsRecordsForm } from "./EnsRecordsForm";
import { Button, Input, Text } from "../atoms";
import { useAccount } from "wagmi";
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import { Address, isAddress, zeroAddress } from "viem";
import axios from "axios";
import { Alert } from "../molecules";
import { Connect } from "vite";
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
      handleSelect()
    } else {
      setInitialRecords({ texts: [], addresses: []})
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
        <ConnectButton/>
        <div className="ns-mt-3">
          <Text size="sm" color="grey">
            Your Ens name
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
