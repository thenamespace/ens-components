import { useMemo } from "react";
import {
  AvatarSDKError,
  ErrorCodes,
  createAvatarClient,
} from "@thenamespace/avatar";
import type { UploadResult } from "@thenamespace/avatar";
import { useAccount, useWalletClient } from "wagmi";
import { mainnet, sepolia } from "viem/chains";

interface UseAvatarClientParams {
  isTestnet?: boolean;
  domain?: string;
}

export interface UploadAvatarParams {
  ensName: string;
  file: File;
  onProgress?: (progress: number) => void;
}

const getDefaultDomain = () => {
  if (typeof window === "undefined") {
    return "localhost";
  }
  return window.location.hostname;
};

export const getAvatarUploadErrorMessage = (err: unknown): string => {
  if (err instanceof AvatarSDKError) {
    switch (err.code) {
      case ErrorCodes.MISSING_PROVIDER:
        return "Please connect your wallet to upload avatar.";
      case ErrorCodes.NOT_SUBNAME_OWNER:
        return "You do not own this ENS name.";
      case ErrorCodes.FILE_TOO_LARGE:
        return "Image is too large.";
      case ErrorCodes.INVALID_FILE_TYPE:
        return "Unsupported image type.";
      case ErrorCodes.EXPIRED_NONCE:
        return "Signature expired. Please try again.";
      case ErrorCodes.INVALID_SIGNATURE:
        return "Wallet signature verification failed.";
      default:
        return err.message || "Failed to upload avatar.";
    }
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }
  return "Failed to upload avatar.";
};

export const useAvatarClient = ({ isTestnet, domain }: UseAvatarClientParams) => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const resolvedDomain = domain || getDefaultDomain();
  const fallbackChainId = isTestnet ? sepolia.id : mainnet.id;

  const provider = useMemo(() => {
    if (!walletClient || !address) {
      return undefined;
    }

    return {
      getAddress: async () => address,
      signMessage: async (message: string) => {
        return walletClient.signMessage({
          account: address,
          message,
        });
      },
      getChainId: async () => walletClient.chain?.id || fallbackChainId,
    };
  }, [walletClient, address, fallbackChainId]);

  const client = useMemo(() => {
    return createAvatarClient({
      network: isTestnet ? "sepolia" : "mainnet",
      domain: resolvedDomain,
      provider,
    });
  }, [isTestnet, resolvedDomain, provider]);

  const uploadAvatar = async (params: UploadAvatarParams): Promise<UploadResult> => {
    if (!provider || !address) {
      throw new Error("Please connect your wallet to upload avatar.");
    }

    try {
      return await client.uploadAvatar({
        subname: params.ensName,
        file: params.file,
        onProgress: params.onProgress,
      });
    } catch (err) {
      throw new Error(getAvatarUploadErrorMessage(err));
    }
  };

  return {
    uploadAvatar,
    getErrorMessage: getAvatarUploadErrorMessage,
  };
};
