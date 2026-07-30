import { useMemo } from "react";
import {
  AvatarSDKError,
  ErrorCodes,
  createAvatarClient,
} from "@thenamespace/avatar";
import type { UploadResult } from "@thenamespace/avatar";
import { useAccount, useSwitchChain, useWalletClient } from "wagmi";
import { mainnet, sepolia } from "viem/chains";

interface UseAvatarClientParams {
  isTestnet?: boolean;
  domain?: string;
  walletProvider?: AvatarUploadWalletProvider;
}

export interface AvatarUploadWalletProvider {
  address: `0x${string}`;
  chainId: number;
  signMessage: (message: string) => Promise<`0x${string}`>;
}

export interface UploadAvatarParams {
  ensName: string;
  file: File;
  onProgress?: (progress: number) => void;
}

export type UploadImageType = "avatar" | "header";

const IMAGE_UPLOAD_LOG_PREFIX = "[ImageUpload]";

const getDefaultDomain = () => {
  if (typeof window === "undefined") {
    return "localhost";
  }
  return window.location.hostname;
};

export const getAvatarUploadErrorMessage = (err: unknown): string => {
  return getImageUploadErrorMessage(err, "avatar");
};

export const getImageUploadErrorMessage = (
  err: unknown,
  imageType: UploadImageType = "avatar"
): string => {
  const defaultFailedMessage =
    imageType === "avatar"
      ? "Failed to upload avatar."
      : "Failed to upload header image.";

  if (err instanceof AvatarSDKError) {
    switch (err.code) {
      case ErrorCodes.MISSING_PROVIDER:
        return imageType === "avatar"
          ? "Please connect your wallet to upload avatar."
          : "Please connect your wallet to upload header image.";
      case ErrorCodes.PROVIDER_CHAIN_MISMATCH:
        return "Please switch your wallet to the correct network.";
      case ErrorCodes.NOT_SUBNAME_OWNER:
        return "You do not own this ENS name.";
      case ErrorCodes.FILE_TOO_LARGE:
        return "Image is too large.";
      case ErrorCodes.INVALID_FILE_FORMAT:
      case ErrorCodes.INVALID_FILE_TYPE:
        return "Unsupported image type.";
      case ErrorCodes.EXPIRED_NONCE:
        return "Signature expired. Please try again.";
      case ErrorCodes.INVALID_SIGNATURE:
        return "Wallet signature verification failed.";
      default:
        return err.message || defaultFailedMessage;
    }
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }
  return defaultFailedMessage;
};

export const useAvatarClient = ({
  isTestnet,
  domain,
  walletProvider,
}: UseAvatarClientParams) => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { switchChainAsync } = useSwitchChain();

  const resolvedDomain = domain || getDefaultDomain();
  const expectedChainId = isTestnet ? sepolia.id : mainnet.id;

  const wagmiProvider = useMemo(() => {
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
      getChainId: async () => {
        if (typeof walletClient.getChainId === "function") {
          return walletClient.getChainId();
        }
        if (walletClient.chain?.id) {
          return walletClient.chain.id;
        }
        return expectedChainId;
      },
      // v2 network enforcement: SDK switches chain before SIWE when available
      switchChain: async (chainId: number) => {
        if (switchChainAsync) {
          await switchChainAsync({ chainId });
          return;
        }
        if (typeof walletClient.switchChain === "function") {
          await walletClient.switchChain({ id: chainId });
          return;
        }
        throw new Error(`Unable to switch wallet to chain ${chainId}`);
      },
    };
  }, [walletClient, address, expectedChainId, switchChainAsync]);

  const provider = useMemo(() => {
    if (walletProvider) {
      return {
        getAddress: async () => walletProvider.address,
        signMessage: walletProvider.signMessage,
        getChainId: async () => walletProvider.chainId,
      };
    }
    return wagmiProvider;
  }, [walletProvider, wagmiProvider]);

  const providerAddress = walletProvider?.address ?? address;

  const client = useMemo(() => {
    return createAvatarClient({
      network: isTestnet ? "sepolia" : "mainnet",
      domain: resolvedDomain,
      provider,
    });
  }, [isTestnet, resolvedDomain, provider]);

  const uploadImage = async (
    imageType: UploadImageType,
    params: UploadAvatarParams
  ): Promise<UploadResult> => {
    if (!provider || !providerAddress) {
      throw new Error(
        imageType === "avatar"
          ? "Please connect your wallet to upload avatar."
          : "Please connect your wallet to upload header image."
      );
    }

    try {
      console.info(`${IMAGE_UPLOAD_LOG_PREFIX} starting`, {
        imageType,
        ensName: params.ensName,
        fileName: params.file.name,
        fileType: params.file.type,
        fileSize: params.file.size,
        network: isTestnet ? "sepolia" : "mainnet",
        domain: resolvedDomain,
        wallet: providerAddress,
      });

      // v2 normalizes a stable `url` from avatarUrl / headerUrl
      const result =
        imageType === "avatar"
          ? await client.uploadAvatar({
              subname: params.ensName,
              file: params.file,
              onProgress: params.onProgress,
            })
          : await client.uploadHeader({
              subname: params.ensName,
              file: params.file,
              onProgress: params.onProgress,
            });

      if (!result.url) {
        throw new Error("Upload response did not include an image URL.");
      }

      console.info(`${IMAGE_UPLOAD_LOG_PREFIX} upload result`, {
        imageType,
        result,
      });
      return result;
    } catch (err) {
      console.error(`${IMAGE_UPLOAD_LOG_PREFIX} failed`, { imageType, error: err });
      throw new Error(getImageUploadErrorMessage(err, imageType));
    }
  };

  const uploadAvatar = async (params: UploadAvatarParams): Promise<UploadResult> => {
    return uploadImage("avatar", params);
  };

  const uploadHeader = async (params: UploadAvatarParams): Promise<UploadResult> => {
    return uploadImage("header", params);
  };

  return {
    uploadAvatar,
    uploadHeader,
    getErrorMessage: getImageUploadErrorMessage,
  };
};
