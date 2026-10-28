import { useRef } from "react";
import type { Address, Hash, Hex, PublicClient, WalletClient } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import type { EnsRecords } from "@/types";
import {
  buildOwnedResolverDeployCall,
  formatTokenAmount,
  getOwnedResolver,
  sendCallsWithFallback,
  sendTransactionWithReceipt,
  supportsAtomicBatch,
} from "@/utils";
import type { CommitmentSender, RegistrationSender } from "../registration";
import {
  buildEnsV2ApproveCall,
  buildEnsV2CommitCall,
  buildEnsV2RegisterCalls,
  encodeEnsV2InitialRecords,
  type EnsV2RegistrationDeployment,
  type EnsV2RegistrationToken,
  getEnsV2Allowance,
  getEnsV2RegistrationPrice,
  makeEnsV2Commitment,
  saveEnsV2Commitment,
  withOwnerEthAddress,
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

  const recordsWrittenRef = useRef(false);

  const getPrerequisites = async (label: string, durationSeconds: number) => {
    const { publicClient, walletClient, owner } = clients();
    const [atomic, resolver, price] = await Promise.all([
      supportsAtomicBatch(walletClient, chainId),
      getOwnedResolver(publicClient, deployment, owner),
      getEnsV2RegistrationPrice(publicClient, deployment, label, BigInt(durationSeconds), token),
    ]);
    if (atomic) return { needsResolver: false, needsApproval: false, price };
    const allowance = await getEnsV2Allowance(publicClient, deployment, token, owner);
    return { needsResolver: !resolver.deployed, needsApproval: allowance < price, price };
  };

  const sendResolverDeploy = async (label: string) => {
    const { publicClient, walletClient, owner } = clients();
    const resolver = await getOwnedResolver(publicClient, deployment, owner);
    const recordCalls = encodeEnsV2InitialRecords(`${label}.eth`, withOwnerEthAddress(records, owner));
    const sent = await sendTransactionWithReceipt(
      walletClient,
      publicClient,
      buildOwnedResolverDeployCall(deployment, owner, resolver.salt, recordCalls),
    );
    return {
      hash: sent.hash,
      wait: async () => {
        await sent.wait();
        recordsWrittenRef.current = true;
      },
    };
  };

  const sendApproval = async (label: string, durationSeconds: number) => {
    const { publicClient, walletClient } = clients();
    const price = await getEnsV2RegistrationPrice(
      publicClient,
      deployment,
      label,
      BigInt(durationSeconds),
      token,
    );
    return sendTransactionWithReceipt(
      walletClient,
      publicClient,
      buildEnsV2ApproveCall(deployment, token, price),
    );
  };

  const sendCommitment: CommitmentSender = async (state) => {
    const { publicClient, walletClient, owner } = clients();
    const resolver = await getOwnedResolver(publicClient, deployment, owner);
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
    const resolver = await getOwnedResolver(publicClient, deployment, owner);
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
      records: recordsWrittenRef.current
        ? { addresses: [], texts: [] }
        : withOwnerEthAddress(records, owner),
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

  return { getPrerequisites, sendApproval, sendCommitment, sendRegistration, sendResolverDeploy };
};
