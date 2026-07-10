import {
  Address,
  concatHex,
  formatEther,
  Hash,
  isAddress,
  keccak256,
  namehash,
  padHex,
  parseAbi,
  parseEther,
  toBytes,
  toHex,
  zeroAddress,
} from "viem";
import { mainnet, sepolia } from "viem/chains";
import { useAccount, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import { getEnsContracts } from "@thenamespace/addresses";
import { createEnsReferer, equalsIgnoreCase, formatFloat } from "@/utils";
import { ABIS } from "./abis";
import { EnsRecords } from "@/types";
import { convertToResolverData } from "@/utils/resolver";

const SECONDS_IN_YEAR = 31_536_000;

// register() reverts when simulated before commit() is mined, because the
// controller checks that a commitment exists. We get an exact gas estimate by
// injecting a fake commitment into the controller's `commitments` mapping via a
// state override (same technique as the official ENS app). The mapping lives at
// storage slot 1 on the current ETHRegistrarController (verified on-chain for
// both the mainnet and sepolia deployments used by @thenamespace/addresses).
const COMMITMENTS_STORAGE_SLOT = 1n;
// How far in the past to date the injected commitment: older than
// minCommitmentAge, well within maxCommitmentAge, so register()'s age check
// passes during estimation.
const COMMITMENT_AGE_SECONDS = 120n;
// Fallbacks used only when the live estimate can't run (RPC failure, testnet
// quirk). Chosen to over- rather than under-estimate.
const COMMIT_GAS_FALLBACK = 50_000n;
const REGISTER_GAS_FALLBACK = 320_000n;
// Fixed secret for estimation only — any value works since we override the
// resulting commitment's storage slot rather than relying on a real commit.
const ESTIMATE_SECRET =
  "0x0000000000000000000000000000000000000000000000000000000000000001";
// Placeholder sender for estimating with no connected wallet. Gas is
// account-independent, so any address with an overridden balance works.
const ESTIMATE_PLACEHOLDER_OWNER: Address =
  "0x1234567890123456789012345678901234567890";

interface RentPriceResponse {
  wei: bigint;
  eth: number;
}

interface GasFeeResponse {
  wei: bigint;
  eth: number;
  gas: bigint;
}

const NAMESPACE_REFERRER_ADDRESS = "0xb7B18611b8C51B4B3F400BaF09DB49E61e0aF044";

const ENS_REGISTRY_ABI = parseAbi([
  "function owner(bytes32) view returns (address)",
]);
export interface RegistrationRequest {
  label: string;
  owner: Address;
  expiryInYears: number;
  secret: string;
  records: EnsRecords;
  referrer?: Address;
}

interface EnsRegistration {
  label: string;
  owner: Address;
  duration: bigint;
  secret: Hash;
  resolver: Address;
  data: Hash[];
  reverseRecord: number;
  referrer: Hash;
}

interface EstimateFeeParams {
  label: string;
  expiryInYears?: number;
  records?: EnsRecords;
  referrer?: Address;
}

export const useRegisterENS = ({ isTestnet }: { isTestnet?: boolean }) => {
  
  const publicClient = usePublicClient({
    chainId: isTestnet ? sepolia.id : mainnet.id,
  });
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient({
    chainId: isTestnet ? sepolia.id : mainnet.id,
  });

  const getRegistrationPrice = async (
    label: string,
    expiryInYears: number = 1
  ): Promise<RentPriceResponse> => {
  
    const ethController = getEthController();
    const price = (await publicClient!.readContract({
      abi: ABIS.ETH_REGISTRAR_CONTOLLER,
      functionName: "rentPrice",
      args: [label, BigInt(expiryInYears * SECONDS_IN_YEAR)],
      address: ethController,
      account: address!
    })) as { base: bigint; premium: bigint };

    const totalPrice = price.base + price.premium;
    return {
      wei: totalPrice,
      eth: formatFloat(formatEther(totalPrice, "wei"), 4),
    };
  };

  // Estimates the total network fee for the two-step registration (commit +
  // register) by running a real eth_estimateGas against both transactions —
  // records included, so the number reflects exactly what will be written.
  //
  // register() reverts if simulated before a commitment exists, so we inject a
  // fake, sufficiently-aged commitment into the controller's `commitments`
  // mapping with a state override (the technique the official ENS app uses).
  // Gas price is a network property, so this works with no connected wallet;
  // a placeholder sender with an overridden balance covers the payable value.
  const estimateRegistrationFee = async (
    params: EstimateFeeParams
  ): Promise<GasFeeResponse> => {
    const controller = getEthController();
    const owner = address ?? ESTIMATE_PLACEHOLDER_OWNER;
    const expiryInYears = params.expiryInYears ?? 1;
    const records = params.records ?? { addresses: [], texts: [] };

    // Fee per gas — network property, no account required. getGasPrice()
    // (current base fee + tip) reflects what a user actually pays; maxFeePerGas
    // is a ~2x ceiling, so it's only the fallback.
    let feePerGas: bigint;
    try {
      feePerGas = await publicClient!.getGasPrice();
    } catch {
      const fees = await publicClient!.estimateFeesPerGas();
      feePerGas = fees.maxFeePerGas;
    }

    const request: RegistrationRequest = {
      label: params.label,
      owner,
      expiryInYears,
      secret: ESTIMATE_SECRET,
      records,
      referrer: params.referrer,
    };
    // Same request drives both the commitment and the register struct, so the
    // controller re-derives the exact commitment we inject below.
    const registration = buildRegistration(request);
    const price = await getRegistrationPrice(params.label, expiryInYears);

    let commitment: Hash | undefined;
    try {
      commitment = await makeCommitment(request);
    } catch {
      // fall through — both estimates use their fallbacks
    }

    // commit() has no preconditions, so estimate it directly.
    let commitGas = COMMIT_GAS_FALLBACK;
    if (commitment) {
      try {
        commitGas = await publicClient!.estimateContractGas({
          address: controller,
          abi: ABIS.ETH_REGISTRAR_CONTOLLER,
          functionName: "commit",
          args: [commitment],
          account: owner,
        });
      } catch {
        // keep fallback
      }
    }

    // register() — inject commitments[commitment] = (now - COMMITMENT_AGE) so
    // the age check passes, and fund the sender so the payable value is covered.
    let registerGas = REGISTER_GAS_FALLBACK;
    if (commitment) {
      try {
        const block = await publicClient!.getBlock();
        const commitTimestamp = block.timestamp - COMMITMENT_AGE_SECONDS;
        const slotKey = keccak256(
          concatHex([
            padHex(commitment, { dir: "left", size: 32 }),
            padHex(toHex(COMMITMENTS_STORAGE_SLOT), { dir: "left", size: 32 }),
          ])
        );

        registerGas = await publicClient!.estimateContractGas({
          address: controller,
          abi: ABIS.ETH_REGISTRAR_CONTOLLER,
          functionName: "register",
          args: [registration],
          account: owner,
          value: price.wei,
          stateOverride: [
            {
              address: controller,
              stateDiff: [
                {
                  slot: slotKey,
                  value: padHex(toHex(commitTimestamp), {
                    dir: "left",
                    size: 32,
                  }),
                },
              ],
            },
            { address: owner, balance: price.wei * 2n + parseEther("1") },
          ],
        });
      } catch {
        // Testnet quirks / RPC failures shouldn't blank out the fee.
        registerGas = REGISTER_GAS_FALLBACK;
      }
    }

    const totalGas = commitGas + registerGas;
    const feeWei = totalGas * feePerGas;

    return {
      gas: totalGas,
      wei: feeWei,
      eth: formatFloat(formatEther(feeWei, "wei"), 6),
    };
  };

  const isEnsAvailable = async (label: string): Promise<boolean> => {
    const ownerAddress = await publicClient!.readContract({
      functionName: "owner",
      abi: ENS_REGISTRY_ABI,
      args: [namehash(`${label}.eth`)],
      address: getEnsRegistry(),
    });
    return equalsIgnoreCase(ownerAddress, zeroAddress);
  };

  // Builds the on-chain registration struct from a request. Shared by
  // makeCommitment and the fee estimator so the derived commitment always
  // matches the struct passed to register().
  const buildRegistration = (request: RegistrationRequest): EnsRegistration => {
    const fullName = `${request.label}.eth`;
    return {
      label: request.label,
      owner: request.owner,
      duration: BigInt(yearsToSeconds(request.expiryInYears)),
      secret: keccak256(toBytes(request.secret)),
      resolver: getPublicResolver(),
      data: convertToResolverData(fullName, request.records),
      reverseRecord: 0,
      referrer: getRegReferrer(request),
    };
  };

  const makeCommitment = async (
    request: RegistrationRequest
  ): Promise<Hash> => {
    const c = buildRegistration(request);

    return (await publicClient!.readContract({
      functionName: "makeCommitment",
      abi: ABIS.ETH_REGISTRAR_CONTOLLER,
      address: getEthController(),
      args: [c],
    })) as Hash;
  };

  const yearsToSeconds = (years: number) => {
    return Math.ceil(years * SECONDS_IN_YEAR);
  };

  const sendCommitmentTx = async (
    request: RegistrationRequest
  ): Promise<Hash> => {
    if (!walletClient || !walletClient.account) {
      throw new Error("Wallet client is not available");
    }

    const commitment = await makeCommitment(request);
    const { request: contractRequest } = await publicClient!.simulateContract({
      address: getEthController(),
      abi: ABIS.ETH_REGISTRAR_CONTOLLER,
      functionName: "commit",
      args: [commitment],
      account: walletClient.account,
    });
    return walletClient.writeContract(contractRequest);
  };

  const sendRegisterTx = async (
    request: RegistrationRequest
  ): Promise<{ txHash: Hash; price: RentPriceResponse }> => {
    if (!walletClient || !walletClient.account) {
      throw new Error("Wallet client is not available");
    }

    const fullName = `${request.label}.eth`;
    const resolverData = convertToResolverData(fullName, request.records);

    const registration: EnsRegistration = {
      label: request.label,
      owner: request.owner,
      duration: BigInt(yearsToSeconds(request.expiryInYears)),
      secret: keccak256(toBytes(request.secret)),
      resolver: getPublicResolver(),
      data: resolverData,
      reverseRecord: 0,
      referrer: getRegReferrer(request),
    };

    // Get the price for the registration
    const price = await getRegistrationPrice(
      request.label,
      request.expiryInYears
    );

    // Simulate the transaction
    const { request: contractRequest } = await publicClient!.simulateContract({
      address: getEthController(),
      abi: ABIS.ETH_REGISTRAR_CONTOLLER,
      functionName: "register",
      args: [registration],
      account: walletClient.account,
      value: price.wei,
    });

    // Send the transaction
    const tx = await walletClient.writeContract(contractRequest);
    return {
      txHash: tx,
      price,
    };
  };

  const getEthController = () => {
    return getEnsContracts(isTestnet).ethRegistrarController;
  };

  const getEnsRegistry = () => {
    return getEnsContracts(isTestnet).ensRegistry;
  };

  const getPublicResolver = () => {
    return getEnsContracts(isTestnet).publicResolver;
  };

  const getRegReferrer = (request: RegistrationRequest) => {
    const referrerAddress =
      request.referrer && isAddress(request.referrer)
        ? request.referrer
        : NAMESPACE_REFERRER_ADDRESS;
    return createEnsReferer(referrerAddress);
  };

  return {
    isEnsAvailable,
    getRegistrationPrice,
    estimateRegistrationFee,
    sendCommitmentTx,
    sendRegisterTx,
  };
};
