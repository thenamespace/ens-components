import {
  type Address,
  encodeAbiParameters,
  encodeFunctionData,
  type Hex,
  keccak256,
  namehash,
  pad,
  parseAbi,
  type PublicClient,
  toHex,
  zeroAddress,
  zeroHash,
} from "viem";
import type { EnsRecords } from "@/types";
import { encodeRecordSetters, getEnsRecordsDiff } from "@/utils";

export interface EnsV2RegistrationToken {
  symbol: string;
  address: Address;
  decimals: number;
}

export interface EnsV2RegistrationDeployment {
  chainId: number;
  registrar: Address;
  verifiableFactory: Address;
  permissionedResolverImplementation: Address;
  paymentTokens: EnsV2RegistrationToken[];
}

export const ENSV2_REGISTRATION_SEPOLIA: EnsV2RegistrationDeployment = {
  chainId: 11155111,
  registrar: "0xf633e7fc17e2bbe0d0965d18ec1821dcb754a3d3",
  verifiableFactory: "0xda70306c98e97ece36f997a21368e53298572991",
  permissionedResolverImplementation: "0x115eb53f0c60696633855f90b138178fb40b2b2c",
  paymentTokens: [
    {
      symbol: "USDC",
      address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      decimals: 6,
    },
    {
      symbol: "DAI",
      address: "0xf6fac8a58a0be13b9197f27c41b73162fe32572b",
      decimals: 18,
    },
  ],
};

export const getEnsV2RegistrationDeployment = (isTestnet: boolean) =>
  isTestnet ? ENSV2_REGISTRATION_SEPOLIA : null;

export const ENSV2_MIN_REGISTRATION_SECONDS = 2_419_200;

const registrarAbi = parseAbi([
  "function isAvailable(string label) view returns (bool)",
  "function getRegisterPrice(string label, uint64 duration, address paymentToken) view returns (uint256 base, uint256 premium)",
  "function commit(bytes32 commitment)",
  "function commitmentAt(bytes32 commitment) view returns (uint64)",
  "function MIN_COMMITMENT_AGE() view returns (uint64)",
  "function register(string label, address owner, bytes32 secret, address subregistry, address resolver, uint64 duration, address paymentToken, bytes32 referrer) returns (uint256 tokenId)",
]);
const factoryAbi = parseAbi([
  "function predictProxyAddress(address sender, uint256 salt) view returns (address)",
  "function deployProxy(address implementation, uint256 salt, bytes data) returns (address)",
]);
const resolverInitAbi = parseAbi([
  "struct Grant { address account; uint256 roleBitmap; }",
  "function initialize(Grant[] grants, bytes[] calls)",
  "function multicall(bytes[] calls) returns (bytes[])",
]);
const erc20Abi = parseAbi([
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
]);

const ALL_ROLES = 0x1111111111111111111111111111111111111111111111111111111111111111n;
/** Storage slot of ETHRegistrar.commitmentAt (after Ownable._owner and rentPriceOracle). */
const COMMITMENT_AT_SLOT = 2n;
const PRICE_BUFFER_BPS = 300n;

export interface EnsV2Call {
  to: Address;
  data: Hex;
  value: bigint;
  title?: string;
}

export const randomSecret = (): Hex => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return toHex(bytes);
};

export const isEnsV2NameAvailable = (
  client: PublicClient,
  deployment: EnsV2RegistrationDeployment,
  label: string,
) =>
  client.readContract({
    address: deployment.registrar,
    abi: registrarAbi,
    functionName: "isAvailable",
    args: [label],
  });

export const getEnsV2RegistrationPrice = async (
  client: PublicClient,
  deployment: EnsV2RegistrationDeployment,
  label: string,
  duration: bigint,
  token: EnsV2RegistrationToken,
) => {
  const [base, premium] = await client.readContract({
    address: deployment.registrar,
    abi: registrarAbi,
    functionName: "getRegisterPrice",
    args: [label, duration, token.address],
  });
  return base + premium;
};

const nameResolverSalt = (name: string) => BigInt(namehash(name));

export const getNameResolver = async (
  client: PublicClient,
  deployment: EnsV2RegistrationDeployment,
  owner: Address,
  label: string,
) => {
  const salt = nameResolverSalt(`${label}.eth`);
  const address = await client.readContract({
    address: deployment.verifiableFactory,
    abi: factoryAbi,
    functionName: "predictProxyAddress",
    args: [owner, salt],
  });
  const code = await client.getCode({ address });
  return { address, deployed: Boolean(code && code !== "0x"), salt };
};

export interface EnsV2RegistrationParams {
  label: string;
  owner: Address;
  secret: Hex;
  resolver: Address;
  duration: bigint;
}

export const makeEnsV2Commitment = (params: EnsV2RegistrationParams): Hex =>
  keccak256(
    encodeAbiParameters(
      [
        { type: "string" },
        { type: "address" },
        { type: "bytes32" },
        { type: "address" },
        { type: "address" },
        { type: "uint64" },
        { type: "bytes32" },
      ],
      [
        params.label,
        params.owner,
        params.secret,
        zeroAddress,
        params.resolver,
        params.duration,
        zeroHash,
      ],
    ),
  );

export const buildEnsV2CommitCall = (
  deployment: EnsV2RegistrationDeployment,
  commitment: Hex,
): EnsV2Call => ({
  to: deployment.registrar,
  data: encodeFunctionData({
    abi: registrarAbi,
    functionName: "commit",
    args: [commitment],
  }),
  value: 0n,
});

export const getEnsV2CommitmentReadyAt = async (
  client: PublicClient,
  deployment: EnsV2RegistrationDeployment,
  commitment: Hex,
) => {
  const [committedAt, minAge] = await Promise.all([
    client.readContract({
      address: deployment.registrar,
      abi: registrarAbi,
      functionName: "commitmentAt",
      args: [commitment],
    }),
    client.readContract({
      address: deployment.registrar,
      abi: registrarAbi,
      functionName: "MIN_COMMITMENT_AGE",
    }),
  ]);
  return committedAt === 0n ? null : Number(committedAt + minAge);
};

export const buildEnsV2RegisterCalls = async (
  client: PublicClient,
  deployment: EnsV2RegistrationDeployment,
  params: EnsV2RegistrationParams & {
    token: EnsV2RegistrationToken;
    price: bigint;
    resolverDeployed: boolean;
    resolverSalt: bigint;
    records: EnsRecords;
  },
): Promise<EnsV2Call[]> => {
  const name = `${params.label}.eth`;
  const recordCalls = encodeRecordSetters(
    "permissioned",
    name,
    getEnsRecordsDiff({ addresses: [], texts: [] }, params.records),
  );
  const calls: EnsV2Call[] = [];

  const maxPrice = params.price + (params.price * PRICE_BUFFER_BPS) / 10_000n;
  const allowance = await client.readContract({
    address: params.token.address,
    abi: erc20Abi,
    functionName: "allowance",
    args: [params.owner, deployment.registrar],
  });
  if (allowance < params.price)
    calls.push({
      to: params.token.address,
      data: encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [deployment.registrar, maxPrice],
      }),
      value: 0n,
      title: `Approving ${params.token.symbol}`,
    });

  if (!params.resolverDeployed)
    calls.push({
      to: deployment.verifiableFactory,
      data: encodeFunctionData({
        abi: factoryAbi,
        functionName: "deployProxy",
        args: [
          deployment.permissionedResolverImplementation,
          params.resolverSalt,
          encodeFunctionData({
            abi: resolverInitAbi,
            functionName: "initialize",
            args: [[{ account: params.owner, roleBitmap: ALL_ROLES }], recordCalls],
          }),
        ],
      }),
      value: 0n,
      title: "Setting up resolver",
    });

  calls.push({
    to: deployment.registrar,
    data: encodeFunctionData({
      abi: registrarAbi,
      functionName: "register",
      args: [
        params.label,
        params.owner,
        params.secret,
        zeroAddress,
        params.resolver,
        params.duration,
        params.token.address,
        zeroHash,
      ],
    }),
    value: 0n,
    title: `Registering ${name}`,
  });

  if (params.resolverDeployed && recordCalls.length > 0)
    calls.push({
      to: params.resolver,
      data: encodeFunctionData({
        abi: resolverInitAbi,
        functionName: "multicall",
        args: [recordCalls],
      }),
      value: 0n,
      title: "Setting records",
    });

  return calls;
};

export interface EnsV2RegistrationFees {
  feeWei: bigint | null;
  shortfallEthWei: bigint;
  shortfallToken: bigint;
}

export const estimateEnsV2RegistrationFees = async (
  client: PublicClient,
  deployment: EnsV2RegistrationDeployment,
  params: {
    owner: Address;
    commitment: Hex;
    calls: EnsV2Call[];
    token: EnsV2RegistrationToken;
    price: bigint;
  },
): Promise<EnsV2RegistrationFees> => {
  const commitmentSlot = keccak256(
    encodeAbiParameters(
      [{ type: "bytes32" }, { type: "uint256" }],
      [params.commitment, COMMITMENT_AT_SLOT],
    ),
  );
  const maturedAt = BigInt(Math.floor(Date.now() / 1000) - 3600);

  const [simulation, commitGas, fees, ethBalance, tokenBalance] = await Promise.all([
    client
      .simulateCalls({
      account: params.owner,
      calls: params.calls,
      stateOverrides: [
        {
          address: deployment.registrar,
          stateDiff: [{ slot: commitmentSlot, value: pad(toHex(maturedAt)) }],
        },
      ],
    })
      .catch(() => null),
    client.estimateGas({
      account: params.owner,
      ...buildEnsV2CommitCall(deployment, params.commitment),
    }),
    client.estimateFeesPerGas(),
    client.getBalance({ address: params.owner }),
    client.readContract({
      address: params.token.address,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [params.owner],
    }),
  ]);

  const results = simulation?.results;
  const feeWei =
    results && results.every((r) => r.status === "success")
      ? results.reduce((sum, r) => sum + r.gasUsed, commitGas) *
        (fees.maxFeePerGas ?? fees.gasPrice ?? 0n)
      : null;
  return {
    feeWei,
    shortfallEthWei: feeWei === null || ethBalance >= feeWei ? 0n : feeWei - ethBalance,
    shortfallToken: tokenBalance >= params.price ? 0n : params.price - tokenBalance,
  };
};

const MAX_COMMITMENT_AGE_SECONDS = 86_400;

type SavedCommitment = { secret: Hex; durationSeconds: number };

const commitmentKey = (chainId: number, owner: Address, label: string) =>
  `ns-ensv2-commitment:${chainId}:${owner.toLowerCase()}:${label}`;

export const saveEnsV2Commitment = (
  chainId: number,
  owner: Address,
  label: string,
  value: SavedCommitment | null,
) => {
  try {
    const key = commitmentKey(chainId, owner, label);
    if (value) localStorage.setItem(key, JSON.stringify(value));
    else localStorage.removeItem(key);
  } catch {}
};

export const findResumableEnsV2Commitment = async (
  client: PublicClient,
  deployment: EnsV2RegistrationDeployment,
  owner: Address,
  label: string,
  durationSeconds: number,
): Promise<{ secret: Hex; ready: boolean } | null> => {
  let saved: SavedCommitment | null = null;
  try {
    const raw = localStorage.getItem(commitmentKey(deployment.chainId, owner, label));
    saved = raw ? (JSON.parse(raw) as SavedCommitment) : null;
  } catch {}
  if (!saved || saved.durationSeconds !== durationSeconds) return null;

  const resolver = await getNameResolver(client, deployment, owner, label);
  const commitment = makeEnsV2Commitment({
    label,
    owner,
    secret: saved.secret,
    resolver: resolver.address,
    duration: BigInt(durationSeconds),
  });
  const readyAt = await getEnsV2CommitmentReadyAt(client, deployment, commitment);
  const now = Math.floor(Date.now() / 1000);
  if (readyAt === null || now > readyAt + MAX_COMMITMENT_AGE_SECONDS - 60) {
    saveEnsV2Commitment(deployment.chainId, owner, label, null);
    return null;
  }
  return { secret: saved.secret, ready: now >= readyAt };
};
