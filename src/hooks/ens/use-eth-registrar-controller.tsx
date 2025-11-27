import { EnsRecords } from "@/types";
import { Address, encodeFunctionData, formatEther, Hash } from "viem";
import { useMainChain } from "../web3/use-main-chain";
import { getEnsContracts, getL1NamespaceContracts } from "@/web3";
import { useWeb3Clients } from "../web3/use-web3-clients";
import EthControllerABI from "./abi/eth-controller-abi.json";
import BulkNameRegistarABI from "./abi/bulk-name-registrar-abi.json";
import { convertRecordsToResolverData } from "../web3/use-name-resolver";
import { useEnsContractAddresses } from "./use-ens-contract-address";

const SECONDS_IN_YEAR = 31_536_000;

interface RegistarContext {
    name: string
    owner: Address
    duration: number
    secret: string
    resolver: Address
    data: Hash[]
    reverseRecord: boolean
    ownerControlledFuses: number
    registrationPrice: bigint
}

export interface EnsRegistrationContext {
  label: string;
  owner: Address;
  secret: Hash;
  durationInYears: number;
  resolver: Address;
  reverseRecord: boolean;
  records: EnsRecords
  registrationPrice: bigint
}

export const useEthRegistrarController = () => {
  const { networkId } = useMainChain();
  const { ethRegistrarController } = useEnsContractAddresses();
  const { publicClient, walletClient } = useWeb3Clients({ chainId: networkId });

  const getRegistrationPrice = async (
    label: string,
    durationInYears: number
  ): Promise<{ethPrice: number, weiPrice: bigint}> => {

    if (publicClient) {
      const rentPrice = await publicClient.readContract({
        abi: EthControllerABI,
        functionName: "rentPrice",
        args: [label, durationInYears * SECONDS_IN_YEAR],
        address: ethRegistrarController,
      });
      const { base, premium } = rentPrice as any;
      const totalPrice = base + premium;
      return { ethPrice: parseFloat(formatEther(totalPrice, "wei")), weiPrice: totalPrice }
    }
    return { ethPrice: 0, weiPrice: BigInt(0) }
  };

  const bulkCommitment = async (ctxs: EnsRegistrationContext[]): Promise<Hash> => {

    if (!publicClient || !walletClient) {
        return "0x0";
    }
    const { bulkEnsRegistrar } = getL1NamespaceContracts()

    const commitmentPromises: Promise<Hash>[] = [];
    for (const ctx of ctxs) {
        commitmentPromises.push(makeCommitment(ctx));
    }

    const commitments = await Promise.all(commitmentPromises)
 
    const {request} = await publicClient.simulateContract({
        abi: BulkNameRegistarABI,
        functionName: "bulkCommitment",
        address: bulkEnsRegistrar,
        args: [commitments]
    })
    return await walletClient.writeContract(request);
  };

  const bulkRegister = async (ctxs: EnsRegistrationContext[]) => {
    if (!publicClient || !walletClient) {
        return "0x0";
    }
    const { bulkEnsRegistrar } = getL1NamespaceContracts()
    const regContexts: RegistarContext[] = [];
    let registrationPrice: bigint = BigInt(0);
    for (const ctx of ctxs) {
        regContexts.push(mapToRegistrationContext(ctx));
        registrationPrice += ctx.registrationPrice;
    }

    const fees = (registrationPrice / BigInt(1000)) * BigInt(10)

    const {request} = await publicClient.simulateContract({
        abi: BulkNameRegistarABI,
        functionName: "bulkRegister",
        address: bulkEnsRegistrar,
        args: [regContexts],
        value: registrationPrice + fees
    })
    return await walletClient.writeContract(request);
  }

  const makeCommitment = async (ctx: EnsRegistrationContext): Promise<Hash> => {
    if (!publicClient) {
      return "0x0";
    }

    const ensName = ctx.label + ".eth";
    return publicClient.readContract({
      abi: EthControllerABI,
      functionName: "makeCommitment",
      address: ethRegistrarController,
      args: [
        ctx.label,
        ctx.owner,
        yearsToSeconds(ctx.durationInYears),
        ctx.secret,
        ctx.resolver,
        getResolverData(ensName, ctx.records),
        ctx.reverseRecord,
        0,
      ],
    })as unknown as Hash;
  };



  const getResolverData = (ensName: string, records: EnsRecords) => {
    return convertRecordsToResolverData(ensName, records.texts, records.addresses);
  };

  const yearsToSeconds = (years: number) => {
    return years * SECONDS_IN_YEAR;
  };

  const isNameAvailable = async (label: string): Promise<boolean> => {
    console.log("isNameAvailable called with label:", label);
    console.log("publicClient:", publicClient ? "exists" : "null/undefined");
    console.log("ethRegistrarController address:", ethRegistrarController);
    console.log("networkId:", networkId);
    
    if (!publicClient) {
      console.error("publicClient is not available - cannot check name availability");
      console.log("This usually means:");
      console.log("1. Wallet is not connected");
      console.log("2. RPC endpoint is not configured");
      console.log("3. Network/chain mismatch");
      return false;
    }

    try {
      const result = await publicClient.readContract({
        abi: EthControllerABI,
        address: ethRegistrarController,
        args: [label],
        functionName: "available",
      });
      console.log("Contract call result:", result);
      return result as boolean;
    } catch (error) {
      console.error("Error in isNameAvailable contract call:", error);
      console.log("Error details:", {
        message: error instanceof Error ? error.message : String(error),
        label,
        address: ethRegistrarController,
        networkId
      });
      throw error;
    }
  };

  const mapToRegistrationContext = (ctx: EnsRegistrationContext) : RegistarContext => {
    const fullName = ctx.label + ".eth";
    return {
      data: getResolverData(fullName, ctx.records),
      duration: yearsToSeconds(ctx.durationInYears),
      name: ctx.label,
      owner: ctx.owner,
      ownerControlledFuses: 0,
      resolver: ctx.resolver,
      reverseRecord: false,
      secret: ctx.secret,
      registrationPrice: ctx.registrationPrice
    }
  }

  return {
    isNameAvailable,
    getRegistrationPrice,
    bulkCommitment,
    bulkRegister,
  };
};
