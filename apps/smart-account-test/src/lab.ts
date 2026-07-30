import { AvatarSDKError } from "@thenamespace/avatar";
import type { Hex } from "viem";

export type MediaType = "avatar" | "header";

export type AccountClassification =
  | "EOA or unwrapped signer"
  | "Deployed smart account · EIP-1271"
  | "Counterfactual smart account · EIP-6492"
  | "Deployed smart account · EIP-6492 wrapped";

export interface DiagnosticSummary {
  accountType: AccountClassification;
  bytecodeBefore: "deployed" | "not deployed";
  bytecodeAfter: "deployed" | "not deployed";
  deploymentUnchanged: boolean;
  expiresAt: number;
  isErc6492: boolean;
  signatureBytes: number;
  structureValid: boolean;
  verified: boolean;
}

export interface LabError {
  code?: string;
  details?: unknown;
  message: string;
  serviceCode?: string;
  status?: number;
}

export interface SignedPayload {
  address: `0x${string}`;
  expiresAt: number;
  file: File;
  mediaType: MediaType;
  message: string;
  signature: Hex;
  subname: string;
}

const sensitiveKeyPattern =
  /(authorization|cookie|message|secret|signature|siwe|token)/i;

const sanitizeDetails = (value: unknown, depth = 0): unknown => {
  if (depth > 4) return "[truncated]";
  if (Array.isArray(value)) {
    return value.slice(0, 20).map(item => sanitizeDetails(item, depth + 1));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        sensitiveKeyPattern.test(key)
          ? "[redacted]"
          : sanitizeDetails(item, depth + 1),
      ])
    );
  }
  if (typeof value === "string" && value.length > 500) {
    return `${value.slice(0, 500)}…`;
  }
  return value;
};

export const toLabError = (error: unknown): LabError => {
  if (error instanceof AvatarSDKError) {
    return {
      code: error.code,
      details: sanitizeDetails(error.details),
      message: error.message,
      serviceCode: error.serviceCode,
      status: error.status,
    };
  }
  if (error instanceof Error) {
    return { message: error.message };
  }
  return { message: "An unknown error occurred." };
};

export const hasDeployedCode = (code?: Hex) => Boolean(code && code !== "0x");

export const classifyAccount = ({
  code,
  isErc6492,
}: {
  code?: Hex;
  isErc6492: boolean;
}): AccountClassification => {
  const deployed = hasDeployedCode(code);
  if (deployed && isErc6492) {
    return "Deployed smart account · EIP-6492 wrapped";
  }
  if (deployed) {
    return "Deployed smart account · EIP-1271";
  }
  if (isErc6492) {
    return "Counterfactual smart account · EIP-6492";
  }
  return "EOA or unwrapped signer";
};

export const formatAddress = (address?: string) =>
  address ? `${address.slice(0, 8)}…${address.slice(-6)}` : "—";

export const formatExpiry = (expiresAt?: number) =>
  expiresAt ? new Date(expiresAt).toLocaleString() : "—";
