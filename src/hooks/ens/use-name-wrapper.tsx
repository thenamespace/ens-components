import {
  Address,
  encodeAbiParameters,
  Hash,
  keccak256,
  parseAbi,
  stringToBytes 
} from "viem";
import { useMainChain } from "../web3/use-main-chain";
import { useWeb3Clients } from "../web3/use-web3-clients";
import {
  getEnsContracts,
  getL1NamespaceContracts,
} from "@namespacesdk/addresses";
import { useAccount } from "wagmi";
import { useENS } from "./use-ens";
import { Abis } from "@/web3";

const BASE_REGISTARY_MAINNET = "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85";
const ENS_REGISTRAR_SEPOLIA = "0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85";

export const useNameWrapper = () => {
  const { networkId, isTestnet } = useMainChain();
  const { publicClient, walletClient } = useWeb3Clients({ chainId: networkId });
  const { address } = useAccount();
  const ENS = useENS();

const sendToNameWrapper = async (name: string) => {
  const contract = isTestnet ? BASE_REGISTARY_MAINNET : ENS_REGISTRAR_SEPOLIA;
  const ensAddresses = getEnsContracts(isTestnet);
  const resolver = await ENS.getNameResolver(name); // assuming .eth for now

  const label = name.split(".")[0]

  const tokenId = BigInt(keccak256(stringToBytes(label))); // correct tokenId for .eth names

  const encodedData = encodeAbiParameters(
    [
      { name: 'label', type: 'string' },
      { name: 'owner', type: 'address' },
      { name: 'fuses', type: 'uint16' },
      { name: 'resolver', type: 'address' },
    ],
    [label, address!, 0, resolver as any]
  );

  const { request } = await publicClient!.simulateContract({
    abi: parseAbi([
      "function safeTransferFrom(address from, address to, uint256 tokenId, bytes _data)",
    ]),
    address: contract,
    functionName: "safeTransferFrom",
    account: address,
    args: [address!, ensAddresses.nameWrapper, tokenId, encodedData],
  });

  return walletClient!.writeContract(request);
};
  const wrapL2Domain = async (
    name: string,
    wrappedOwner: Address,
    fuses: number
  ): Promise<Hash> => {
    const split = name.split(".");
    const label = split[0];

    if (split.length !== 2 || split[1] !== "eth") {
      throw Error(`Invalid ENS name: ${name}`);
    }

    const ensAddresses = getEnsContracts(isTestnet);
    const resolver = await ENS.getNameResolver(name);

    const { request } = await publicClient!.simulateContract({
      abi: Abis.NAME_WRAPPER,
      address: ensAddresses.nameWrapper,
      functionName: "safeTransferFrom",
      account: address,
      args: [label, wrappedOwner, fuses, resolver],
    });
    return walletClient!.writeContract(request);
  };

  const approveL1MintContract = async (): Promise<Hash> => {
    const ensAddresses = getEnsContracts(isTestnet);
    const namespaceAddrs = getL1NamespaceContracts(isTestnet);

    const { request } = await publicClient!.simulateContract({
      abi: Abis.NAME_WRAPPER,
      address: ensAddresses.nameWrapper,
      functionName: "setApprovalForAll",
      account: address,
      args: [namespaceAddrs.nameWrapperProxy, true],
    });
    return walletClient!.writeContract(request) as any;
  };

  return {
    wrapL2Domain,
    approveL1MintContract,
    sendToNameWrapper,
  };
};
