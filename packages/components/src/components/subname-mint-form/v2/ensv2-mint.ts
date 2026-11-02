import { type Address, type PublicClient, zeroAddress } from "viem";
import {
  createOnchainClient,
  getOnchainDeployment,
  type OnchainDeployment,
  type PaymentToken,
  type RegistrationQuote,
} from "@thenamespace/onchain-subnames";

export type EnsV2Deployment = OnchainDeployment & {
  manager: Address;
  issuer: Address;
};
export type EnsV2PaymentToken = PaymentToken;
export type EnsV2MintQuote = RegistrationQuote;

/** Existing component helper names remain available; new integrations can use the SDK directly. */
export const getEnsV2Deployment = (isTestnet: boolean): EnsV2Deployment => {
  const deployment = getOnchainDeployment(isTestnet ? 11155111 : 1);
  return {
    ...deployment,
    manager: deployment.activationManager,
    issuer: deployment.subnameIssuer,
  };
};

export const quoteEnsV2Mint = (
  publicClient: PublicClient,
  deployment: OnchainDeployment,
  params: {
    parentName: string;
    label: string;
    minter: Address;
    duration?: bigint;
  }
) =>
  createOnchainClient({
    publicClient,
    chainId: deployment.chainId,
    managerApiUrl: deployment.managerApiUrl,
  }).getRegistrationQuote({
    parentName: params.parentName,
    label: params.label,
    account: params.minter === zeroAddress ? undefined : params.minter,
    durationSeconds: params.duration,
  });

export const quoteEnsV2Payment = async (
  publicClient: PublicClient,
  deployment: OnchainDeployment,
  priceUsdRaw: bigint,
  token: PaymentToken
) =>
  (
    await createOnchainClient({
      publicClient,
      chainId: deployment.chainId,
      managerApiUrl: deployment.managerApiUrl,
    }).getPaymentQuote({
      price: { currency: "USD", amount: priceUsdRaw, decimals: 12 },
      paymentToken: token.address,
    })
  ).amount;
