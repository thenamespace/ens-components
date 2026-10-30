import { type Address, type PublicClient, zeroAddress } from "viem";
import {
  createOnchainClient,
  getOnchainDeployment,
  OnchainError,
  type MintQuote,
  type OnchainDeployment,
  type PaymentToken,
  type TransactionCall,
  type TransactionFees,
} from "@thenamespace/onchain";
import type { EnsRecords } from "@/types";
import {
  encodeRecordsUpdate,
  getEnsRecordsDiff,
  type ResolverStyle,
} from "@/utils";

export { ONE_YEAR } from "@thenamespace/onchain";
export type EnsV2PaymentToken = PaymentToken;
export type EnsV2Deployment = OnchainDeployment;
export type EnsV2MintQuote = MintQuote;
export type EnsV2Call = TransactionCall;
export type EnsV2MintFees = TransactionFees;

export const getEnsV2Deployment = (isTestnet: boolean) =>
  getOnchainDeployment(isTestnet ? 11155111 : 1);

export const getOnchainClient = (
  publicClient: PublicClient,
  deployment: EnsV2Deployment
) =>
  createOnchainClient({
    publicClient,
    chainId: deployment.chainId,
    managerApiUrl: deployment.managerApiUrl,
  });

export const quoteEnsV2Mint = (
  client: PublicClient,
  deployment: EnsV2Deployment,
  params: Parameters<ReturnType<typeof createOnchainClient>["quoteMint"]>[0]
) => getOnchainClient(client, deployment).quoteMint(params);

export const quoteEnsV2Payment = (
  client: PublicClient,
  deployment: EnsV2Deployment,
  priceUsdRaw: bigint,
  token: EnsV2PaymentToken
) =>
  getOnchainClient(client, deployment).quotePayment(priceUsdRaw, token.address);

export const getEnsV2MintResolver = (
  client: PublicClient,
  deployment: EnsV2Deployment,
  parentName: string,
  requested: Address = zeroAddress
) => getOnchainClient(client, deployment).getResolver(parentName, requested);

export interface EnsV2MintResolver {
  address: Address;
  style: ResolverStyle;
  requested: Address;
}

export const prepareEnsV2MintCalls = async (
  client: PublicClient,
  deployment: EnsV2Deployment,
  params: {
    parentName: string;
    label: string;
    owner: Address;
    duration: bigint;
    token: EnsV2PaymentToken;
    maxPriceUsdRaw: bigint;
    records: EnsRecords;
    resolver: EnsV2MintResolver;
  }
): Promise<EnsV2Call[]> => {
  const prepared = await getOnchainClient(client, deployment).prepareMint({
    parentName: params.parentName,
    label: params.label,
    minter: params.owner,
    duration: params.duration,
    paymentToken: params.token.address,
    maxPriceUsdRaw: params.maxPriceUsdRaw,
    resolver: params.resolver.requested,
  });
  const diff = getEnsRecordsDiff({ addresses: [], texts: [] }, params.records);
  if (diff.isDifferent) {
    if (
      prepared.resolver.toLowerCase() !== params.resolver.address.toLowerCase()
    )
      throw new OnchainError(
        "CONFIGURATION_CHANGED",
        "The parent resolver changed. Refresh this form before setting records."
      );
    prepared.calls.push({
      ...encodeRecordsUpdate(
        params.resolver.style,
        prepared.resolver,
        `${prepared.quote.label}.${prepared.quote.parentName}`,
        diff
      ),
      value: 0n,
      title: "Setting records",
    });
  }
  return prepared.calls;
};

export const estimateEnsV2MintFees = async (
  client: PublicClient,
  account: Address,
  calls: EnsV2Call[],
  payment: { token: EnsV2PaymentToken; amount: bigint }
): Promise<EnsV2MintFees> =>
  createOnchainClient({
    publicClient: client,
    chainId: client.chain?.id ?? (await client.getChainId()),
  }).estimateFees({ account, calls, payment });

export const canWriteEnsV2RecordsAtMint = async (
  client: PublicClient,
  deployment: EnsV2Deployment,
  params: {
    parentName: string;
    label: string;
    owner: Address;
    duration: bigint;
    priceUsdRaw: bigint;
    resolver: EnsV2MintResolver;
  }
): Promise<boolean> => {
  const eth = deployment.paymentTokens.find(
    token => token.address === zeroAddress
  );
  if (!eth) return false;
  const calls = await prepareEnsV2MintCalls(client, deployment, {
    ...params,
    token: eth,
    maxPriceUsdRaw: params.priceUsdRaw,
    records: { addresses: [], texts: [{ key: "description", value: "-" }] },
  });
  const { results } = await client.simulateCalls({
    account: params.owner,
    calls,
    stateOverrides: [{ address: params.owner, balance: 10n ** 30n }],
  });
  return (
    results.length === calls.length &&
    results.every(result => result.status === "success")
  );
};
