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

export type UploadImageType = "avatar" | "header";

const IMAGE_UPLOAD_LOG_PREFIX = "[ImageUpload]";

type UploadResultWithAliases = UploadResult & {
  avatarUrl?: string;
  headerUrl?: string;
};

const withCanonicalUrl = (
  imageType: UploadImageType,
  result: UploadResultWithAliases
): UploadResult => {
  const url =
    result.url ||
    (imageType === "avatar" ? result.avatarUrl : result.headerUrl) ||
    result.avatarUrl ||
    result.headerUrl;

  if (!url) {
    throw new Error("Upload response did not include an image URL.");
  }

  return { ...result, url };
};

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
        return err.message || defaultFailedMessage;
    }
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }
  return defaultFailedMessage;
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

  const uploadImage = async (
    imageType: UploadImageType,
    params: UploadAvatarParams
  ): Promise<UploadResult> => {
    if (!provider || !address) {
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
        wallet: address,
      });

      const rawResult = (await (imageType === "avatar"
        ? client.uploadAvatar({
            subname: params.ensName,
            file: params.file,
            onProgress: params.onProgress,
          })
        : client.uploadHeader({
            subname: params.ensName,
            file: params.file,
            onProgress: params.onProgress,
          }))) as UploadResultWithAliases;

      const result = withCanonicalUrl(imageType, rawResult);

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
