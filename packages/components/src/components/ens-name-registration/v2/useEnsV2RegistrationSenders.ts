import type { Address, Hash, Hex, PublicClient, WalletClient } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import type { EnsRecords } from "@/types";
import { formatTokenAmount, sendCallsWithFallback } from "@/utils";
import type { CommitmentSender, RegistrationSender } from "../registration";
import {
  buildEnsV2CommitCall,
  buildEnsV2RegisterCalls,
  type EnsV2RegistrationDeployment,
  type EnsV2RegistrationToken,
  getEnsV2RegistrationPrice,
  getNameResolver,
  makeEnsV2Commitment,
  saveEnsV2Commitment,
} from "./ensv2-register";

export const useEnsV2RegistrationSenders = (
  deployment: EnsV2RegistrationDeployment,
  token: EnsV2RegistrationToken,
  records: EnsRecords,
) => {
  const { chainId } = deployment;
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId }) as PublicClient | undefined;
  const { data: walletClient } = useWalletClient({ chainId });

  const clients = () => {
    if (!publicClient || !walletClient || !address)
      throw new Error("Connect your wallet to continue.");
    return { publicClient, walletClient: walletClient as WalletClient, owner: address as Address };
  };

  const sendCommitment: CommitmentSender = async (state) => {
    const { publicClient, walletClient, owner } = clients();
    const resolver = await getNameResolver(publicClient, deployment, owner, state.label);
    const commitment = makeEnsV2Commitment({
      label: state.label,
      owner,
      secret: state.secret as Hex,
      resolver: resolver.address,
      duration: BigInt(state.durationInSeconds),
    });
    const call = buildEnsV2CommitCall(deployment, commitment);
    const hash = await walletClient.sendTransaction({
      to: call.to,
      data: call.data,
      value: call.value,
      account: walletClient.account!,
      chain: walletClient.chain,
    });
    saveEnsV2Commitment(chainId, owner, state.label, {
      secret: state.secret as Hex,
      durationSeconds: state.durationInSeconds,
    });
    return hash;
  };

  const sendRegistration: RegistrationSender = async (state, onSent) => {
    const { publicClient, walletClient, owner } = clients();
    const duration = BigInt(state.durationInSeconds);
    const price = await getEnsV2RegistrationPrice(
      publicClient,
      deployment,
      state.label,
      duration,
      token,
    );
    const resolver = await getNameResolver(publicClient, deployment, owner, state.label);
    const calls = await buildEnsV2RegisterCalls(publicClient, deployment, {
      label: state.label,
      owner,
      secret: state.secret as Hex,
      resolver: resolver.address,
      duration,
      token,
      price,
      resolverDeployed: resolver.deployed,
      resolverSalt: resolver.salt,
      records,
    });
    const hashes = await sendCallsWithFallback(
      walletClient,
      publicClient,
      calls,
      chainId,
      ({ hash }) => {
        if (hash) onSent(hash);
      },
    );
    const txHash = hashes[hashes.length - 1] as Hash;
    const earlier = hashes.slice(0, -1).filter((h) => h !== txHash);
    const receipts = await Promise.all(
      earlier.map((hash) => publicClient.getTransactionReceipt({ hash })),
    );
    saveEnsV2Commitment(chainId, owner, state.label, null);
    return {
      txHash,
      price: formatTokenAmount(price, token.decimals, token.symbol),
      extraFeeWei: receipts.reduce(
        (sum, r) => sum + r.gasUsed * (r.effectiveGasPrice ?? 0n),
        0n,
      ),
    };
  };

  return { sendCommitment, sendRegistration };
};
