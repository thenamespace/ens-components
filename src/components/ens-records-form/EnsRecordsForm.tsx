import { EnsRecords } from "@/types";
import { useEffect, useMemo, useState } from "react";
import { SelectRecordsForm } from "../select-records-form/SelectRecordsForm";
import { Button, Text } from "../atoms";
import "./EnsRecordsForm.css";
import { convertToMulticallResolverData } from "@/utils/resolver";
import { deepCopy, getEnsRecordsDiff } from "@/utils";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { mainnet } from "viem/chains";
import { ENS_RESOLVER_ABI } from "@/web3";
import { Address, ContractFunctionExecutionError, Hash } from "viem";
import { getSupportedAddressMap } from "@/constants";
import { RecordDiff } from "./record-diff/RecordDiff";

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
  onSuccess
}: EditRecordsFormProps) => {
  const [records, setRecords] = useState<EnsRecords>(
    initialRecords ? deepCopy(initialRecords) : { texts: [], addresses: [] }
  );

  const currentChainId = chainId || mainnet.id;
  const publicClient = usePublicClient({ chainId: currentChainId });
  const { data: walletClient } = useWalletClient({ chainId: currentChainId });
  const { address } = useAccount();
  const [contractError, setContractError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(
    "Something went wrong"
  );
  const [txIndicator, setTxIndicator] = useState<{
    isWaitingForWallet: boolean
    isWaitingForTx: boolean
  }>({
    isWaitingForTx: false,
    isWaitingForWallet: false
  })

  useEffect(() => {
    if (!address) {
      setGeneralError("Wallet is not connected.");
    } else if (!walletClient || !publicClient) {
      setGeneralError("Is this component run in the WagmiProvider");
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

  const isFormValid = areValidTexts && areValidAddresses && isDiffPresent;

  const handleUpdateRecords = async () => {
    try {
      const old: EnsRecords = initialRecords
        ? initialRecords
        : { texts: [], addresses: [] };
      const diff = getEnsRecordsDiff(old, records);
      const resolverData = convertToMulticallResolverData(name, diff);

      setTxIndicator({...txIndicator, isWaitingForWallet: true})

      const { request } = await publicClient!.simulateContract({
        abi: ENS_RESOLVER_ABI,
        args: [resolverData],
        functionName: "multicall",
        address: resolverAddress,
        account: address,
      });

      const tx = await walletClient!.writeContract(request);

      setTxIndicator({isWaitingForTx: true, isWaitingForWallet: false})

      console.log(tx);
    } catch (err) {
      console.error(err);
      if (err instanceof ContractFunctionExecutionError) {
        const _err = err as ContractFunctionExecutionError;
        setContractError(_err.details);
      } else {
        setContractError("Transaction failed for unknown reason!");
      }
    } finally {
      setTxIndicator({ isWaitingForTx: false, isWaitingForWallet: false})
    }
  };

  return (
    <div className="ns-edit-records-form">
      <SelectRecordsForm
        records={records}
        actions={
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
              disabled={!isFormValid}
              onClick={() => handleUpdateRecords()}
              size="lg"
              style={{ width: "100%" }}
            >
              Update
            </Button>
          </div>
        }
        onRecordsUpdated={records => setRecords(records)}
      />
      <RecordDiff diff={getEnsRecordsDiff(getInitalRecords(), records)} />
      {generalError && <Text>{generalError}</Text>}
    </div>
  );
};
