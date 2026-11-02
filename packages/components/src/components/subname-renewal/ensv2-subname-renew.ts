import { type Address, type PublicClient, zeroAddress } from "viem";
import {
  createOnchainClient,
  type OnchainDeployment,
  type RenewalQuote,
} from "@thenamespace/onchain-subnames";

export type EnsV2RenewalQuote = RenewalQuote;

/** Retains the existing helper inputs; results use the Onchain Subnames SDK quote model. */
export const quoteEnsV2Renewal = (
  publicClient: PublicClient,
  deployment: OnchainDeployment,
  params: {
    parentName: string;
    label: string;
    renewer: Address;
    duration: bigint;
  }
) =>
  createOnchainClient({
    publicClient,
    chainId: deployment.chainId,
    managerApiUrl: deployment.managerApiUrl,
  }).getRenewalQuote({
    parentName: params.parentName,
    label: params.label,
    account: params.renewer === zeroAddress ? undefined : params.renewer,
    durationSeconds: params.duration,
  });
