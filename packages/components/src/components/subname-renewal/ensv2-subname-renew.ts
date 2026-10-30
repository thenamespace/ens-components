import { type Address, type PublicClient } from "viem";
import type { RenewalQuote } from "@thenamespace/onchain";
import {
  getOnchainClient,
  type EnsV2Deployment,
  type EnsV2PaymentToken,
} from "../subname-mint-form/v2/ensv2-mint";

export type EnsV2RenewalQuote = RenewalQuote;

export const quoteEnsV2Renewal = (
  client: PublicClient,
  deployment: EnsV2Deployment,
  params: {
    parentName: string;
    label: string;
    renewer: Address;
    duration: bigint;
  }
) => getOnchainClient(client, deployment).quoteRenewal(params);

export const prepareEnsV2RenewCalls = async (
  client: PublicClient,
  deployment: EnsV2Deployment,
  params: {
    parentName: string;
    label: string;
    payer: Address;
    duration: bigint;
    token: EnsV2PaymentToken;
    maxPriceUsdRaw: bigint;
  }
) => {
  const prepared = await getOnchainClient(client, deployment).prepareRenewal({
    parentName: params.parentName,
    label: params.label,
    renewer: params.payer,
    duration: params.duration,
    paymentToken: params.token.address,
    maxPriceUsdRaw: params.maxPriceUsdRaw,
  });
  return prepared.calls;
};
