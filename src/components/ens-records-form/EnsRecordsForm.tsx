import { EnsRecords } from "@/types";
import { useEffect, useMemo, useState } from "react";
import { SelectRecordsForm } from "../select-records-form/SelectRecordsForm";
import { Button, Text } from "../atoms";
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
import { RecordDiff } from "./record-diff/RecordDiff";
import { Alert } from "../molecules";

interface EditRecordsFormProps {
  initialRecords?: EnsRecords;
  resolverAddress: Address;
  name: string;
  chainId?: number;
  onCancel?: () => void;
  onSuccess?: (txHash: Hash) => void;
}

const addressMapByCoin = getSupportedAddressMap();

const blankRecords: EnsRecords = {
  texts: [],
  addresses: [],
};

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
  const { address, chain } = useAccount();
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

  const updateBtnLoading =
    txIndicator.isWaitingForTx || txIndicator.isWaitingForWallet;
  const isFormValid =
    areValidTexts && areValidAddresses && isDiffPresent && isChashValid;

  return (
    <div className="ns-edit-records-form">
      <SelectRecordsForm
        records={records}
        onRecordsUpdated={records => setRecords(records)}
      />
      <div style={{ padding: 15, paddingTop: -5 }}>
        <div className="d-flex align-items-center" style={{ gap: "8px" }}>
          <Button
            onClick={() => onCancel?.()}
            size="lg"
            style={{ width: "100%" }}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            loading={updateBtnLoading}
            disabled={!isFormValid || updateBtnLoading}
            onClick={() => handleUpdateRecords()}
            size="lg"
            style={{ width: "100%" }}
          >
            Update
          </Button>
        </div>
        {generalError && (
          <Alert
            onClose={() => setGeneralError(null)}
            dismissible={true}
            variant="warning"
            title={generalError.title}
          >
            {generalError.subtitle}
          </Alert>
        )}
        {!generalError && shouldSwitchNetwork && (
          <Alert variant="warning" title="Switch network">
            <div className="d-flex">
              You are not on required network.
              <Button
                onClick={() => switchChain({ chainId: currentChainId })}
                className="ns-mt-2"
                variant="outline"
                style={{ width: 180 }}
              >
                Switch Network
              </Button>
            </div>
          </Alert>
        )}
      </div>
    </div>
  );
};
