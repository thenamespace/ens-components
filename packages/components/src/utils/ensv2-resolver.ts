import {
  type Address,
  encodeAbiParameters,
  encodeFunctionData,
  type Hex,
  keccak256,
  parseAbi,
  type PublicClient,
  stringToHex,
} from "viem";
import type { WalletCall } from "./send-calls";

export interface OwnedResolverContracts {
  verifiableFactory: Address;
  permissionedResolverImplementation: Address;
}

export interface OwnedResolver {
  address: Address;
  deployed: boolean;
  salt: bigint;
}

const factoryAbi = parseAbi([
  "function predictProxyAddress(address sender, uint256 salt) view returns (address)",
  "function deployProxy(address implementation, uint256 salt, bytes data) returns (address)",
]);

const resolverInitAbi = parseAbi([
  "struct Grant { address account; uint256 roleBitmap; }",
  "function initialize(Grant[] grants, bytes[] calls)",
]);

const ALL_ROLES =
  0x1111111111111111111111111111111111111111111111111111111111111111n;
const OWNED_RESOLVER_VERSION = 0n;

// Must match ENS's computeOwnedResolverSalt.
const ownedResolverSalt = (owner: Address) =>
  BigInt(
    keccak256(
      encodeAbiParameters(
        [{ type: "bytes32" }, { type: "address" }, { type: "uint256" }],
        [keccak256(stringToHex("OwnedResolver")), owner, OWNED_RESOLVER_VERSION]
      )
    )
  );

export const getOwnedResolver = async (
  client: PublicClient,
  contracts: OwnedResolverContracts,
  owner: Address
): Promise<OwnedResolver> => {
  const salt = ownedResolverSalt(owner);
  const address = await client.readContract({
    address: contracts.verifiableFactory,
    abi: factoryAbi,
    functionName: "predictProxyAddress",
    args: [owner, salt],
  });
  const code = await client.getCode({ address });
  return { address, deployed: Boolean(code && code !== "0x"), salt };
};

export const buildOwnedResolverDeployCall = (
  contracts: OwnedResolverContracts,
  owner: Address,
  salt: bigint,
  recordCalls: Hex[] = []
): WalletCall => ({
  to: contracts.verifiableFactory,
  data: encodeFunctionData({
    abi: factoryAbi,
    functionName: "deployProxy",
    args: [
      contracts.permissionedResolverImplementation,
      salt,
      encodeFunctionData({
        abi: resolverInitAbi,
        functionName: "initialize",
        args: [[{ account: owner, roleBitmap: ALL_ROLES }], recordCalls],
      }),
    ],
  }),
  value: 0n,
  title: "Setting up resolver",
});
