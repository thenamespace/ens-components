import { EnsRecords } from "@/types";
import { useEffect, useMemo, useState } from "react";
import { SelectRecordsForm } from "../select-records-form/SelectRecordsForm";
import { Button, Icon, Tooltip } from "../atoms";
import "./EnsRecordsForm.css";
import { convertToMulticallResolverData } from "@/utils/resolver";
import { deepCopy, getEnsRecordsDiff } from "@/utils";
import {
  useAccount,
  usePublicClient,
  useSwitchChain,
  useWalletClient,
} from "wagmi";
import { mainnet } from "viem/chains";
import { ENS_RESOLVER_ABI } from "@/web3";
import { Address, ContractFunctionExecutionError, Hash } from "viem";
import { getSupportedAddressMap, isContenthashValid } from "@/constants";

interface EditRecordsFormProps {
  initialRecords?: EnsRecords;
  resolverAddress: Address;
  name: string;
  chainId?: number;
  onCancel?: () => void;
  onSuccess?: (txHash: Hash) => void;
}

const addressMapByCoin = getSupportedAddressMap();

export const EnsRecordsForm = ({
  name,
  initialRecords,
  chainId,
  resolverAddress,
  onCancel,
  onSuccess,
}: EditRecordsFormProps) => {
  const [records, setRecords] = useState<EnsRecords>(
    initialRecords ? deepCopy(initialRecords) : { texts: [], addresses: [] }
  );

  const currentChainId = chainId || mainnet.id;
  const publicClient = usePublicClient({ chainId: currentChainId });
  const { data: walletClient } = useWalletClient({ chainId: currentChainId });
  const { address, chain, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const [contractError, setContractError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<{
    title: string;
    subtitle: string;
  } | null>(null);
  const [txIndicator, setTxIndicator] = useState<{
    isWaitingForWallet: boolean;
    isWaitingForTx: boolean;
  }>({
    isWaitingForTx: false,
    isWaitingForWallet: false,
  });

  const shouldSwitchNetwork = chain && chain.id !== currentChainId;
  useEffect(() => {
    if (!address) {
      setGeneralError({
        title: "Not connected",
        subtitle: "Connect wallet to continue",
      });
    } else {
      setGeneralError(null);
    }
  }, [address, publicClient, walletClient]);

  const areValidAddresses = useMemo(() => {
    for (const addr of records.addresses) {
      const validateFuc = addressMapByCoin[addr.coinType].validateFunc;

      if (!validateFuc) {
        throw Error("Validate function not present for coin:" + addr.coinType);
      }

      if (addr.value?.length === 0 || !validateFuc(addr.value)) {
        return false;
      }
    }
    return true;
  }, [records.addresses]);

  const areValidTexts = useMemo(() => {
    for (const text of records.texts) {
      if (text.value.length === 0) {
        return false;
      }
    }

    return true;
  }, [records.texts]);

  const isChashValid = useMemo(() => {
    if (!records.contenthash) {
      return true;
    }

    return isContenthashValid(
      records.contenthash.protocol,
      records.contenthash.value
    );
  }, [records.contenthash]);

  const getInitalRecords = (): EnsRecords => {
    return initialRecords ? initialRecords : { texts: [], addresses: [] };
  };

  const isDiffPresent = useMemo(() => {
    const diff = getEnsRecordsDiff(getInitalRecords(), records);

    const {
      addressesAdded,
      addressesModified,
      addressesRemoved,
      textsAdded,
      textsModified,
      textsRemoved,
      contenthashRemoved,
      contenthashAdded,
      contenthashModified,
    } = diff;

    return (
      addressesAdded.length > 0 ||
      addressesModified.length > 0 ||
      addressesRemoved.length ||
      textsAdded.length > 0 ||
      textsRemoved.length > 0 ||
      textsModified.length > 0 ||
      contenthashRemoved === true ||
      contenthashModified !== undefined ||
      contenthashAdded !== undefined
    );
  }, [records, initialRecords]);

  const handleUpdateRecords = async () => {
    try {
      const old: EnsRecords = initialRecords
        ? initialRecords
        : { texts: [], addresses: [] };
      const diff = getEnsRecordsDiff(old, records);
      const resolverData = convertToMulticallResolverData(name, diff);

      setTxIndicator({ ...txIndicator, isWaitingForWallet: true });

      const { request } = await publicClient!.simulateContract({
        abi: ENS_RESOLVER_ABI,
        args: [resolverData],
        functionName: "multicall",
        address: resolverAddress,
        account: address,
      });

      const tx = await walletClient!.writeContract(request);

      setTxIndicator({ isWaitingForTx: true, isWaitingForWallet: false });
      await publicClient!.waitForTransactionReceipt({ hash: tx });
      onSuccess?.(tx);
    } catch (err) {
      console.error(err);
      if (err instanceof ContractFunctionExecutionError) {
        const _err = err as ContractFunctionExecutionError;
        setContractError(_err.details);
      } else {
        setContractError("Transaction failed for unknown reason!");
      }
    } finally {
      setTxIndicator({ isWaitingForTx: false, isWaitingForWallet: false });
    }
  };

  const getActionButton = () => {
    const areInputsValue =
      areValidAddresses && areValidTexts && isContenthashValid;
    const style = { width: "100%" };
    if (!isConnected) {
      return (
        <Button
          style={style}
          size="lg"
          disabled={true}
          prefix={<Icon name="alert-triangle" />}
        >
          Connect Wallet
        </Button>
      );
    } else if (shouldSwitchNetwork) {
      return (
        <Button
          style={style}
          size="lg"
          onClick={() => switchChain({ chainId: currentChainId })}
        >
          Switch Network
        </Button>
      );
    } else if (!areInputsValue) {
      return (
        <Tooltip content="Invalid inputs" position="top">
          <Button style={style} size="lg" disabled={true}>
            Update
          </Button>
        </Tooltip>
      );
    } else if (!isDiffPresent) {
      return (
        <Tooltip content="No Records updated" position="top">
          <Button style={style} size="lg" disabled={true}>
            Update
          </Button>
        </Tooltip>
      );
    } else {
      const updateBtnLoading =
        txIndicator.isWaitingForTx || txIndicator.isWaitingForWallet;
      return (
        <Button
          style={style}
          size="lg"
          disabled={updateBtnLoading}
          loading={updateBtnLoading}
          onClick={() => handleUpdateRecords()}
        >
          Update
        </Button>
      );
    }
  };

  return (
    <div className="ns-edit-records-form">
      <SelectRecordsForm
        records={records}
        onRecordsUpdated={records => setRecords(records)}
        name={name}
        walletClient={walletClient}
        network={currentChainId === mainnet.id ? "mainnet" : "sepolia"}
        domain={
          typeof window !== "undefined" ? window.location.hostname : "myapp.com"
        }
      />
      <div style={{ padding: 15, paddingTop: 0 }}>
        <div className="d-flex align-items-center" style={{ gap: "8px" }}>
          <Button
            onClick={() => onCancel?.()}
            size="lg"
            style={{ width: "100%" }}
            variant="outline"
          >
            Cancel
          </Button>
          {/* <Button
            loading={updateBtnLoading}
            disabled={!isFormValid || updateBtnLoading}
            onClick={() => handleUpdateRecords()}
            size="lg"
            style={{ width: "100%" }}
          >
              <Icon name="alert-triangle" size={20} />
            Update
          </Button> */}
          {getActionButton()}
        </div>
      </div>
    </div>
  );
};
