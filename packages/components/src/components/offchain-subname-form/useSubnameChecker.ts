import { useState, useCallback } from "react";
import { EnsRecords } from "@/types";
import { OffchainClient } from "@thenamespace/offchain-manager";
import { offchainRecordsToEnsRecords } from "./utils";

interface SubnameCheckResult {
  exists: boolean;
  records?: EnsRecords;
  owner?: string;
}

/**
 * Hook for checking if subname exists and fetching its data
 */
export const useSubnameChecker = (client: OffchainClient, parentName: string) => {
  const [isLoadingSubname, setIsLoadingSubname] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkSubname = useCallback(async (label: string): Promise<SubnameCheckResult> => {
    setIsLoadingSubname(true);
    setError(null);

    try {
      const fullSubname = `${label}.${parentName}`;
      const subname = await client.getSingleSubname(fullSubname);

      if (!subname) {
        setIsLoadingSubname(false);
        return { exists: false };
      }

      // Subname exists - convert data
      const records = offchainRecordsToEnsRecords(subname);
      const owner = subname.owner || "";

      setIsLoadingSubname(false);
      return {
        exists: true,
        records,
        owner,
      };
    } catch (err: any) {
      // Handle 404 as "subname doesn't exist"
      if (
        err?.response?.status === 404 ||
        err?.status === 404 ||
        err?.message?.includes('404') ||
        err?.message?.includes('not found')
      ) {
        setIsLoadingSubname(false);
        return { exists: false };
      }

      // Other errors
      console.error("Error checking subname:", err);
      setError(err?.message || "Failed to check subname");
      setIsLoadingSubname(false);
      throw err;
    }
  }, [client, parentName]);

  return {
    isLoadingSubname,
    error,
    setError,
    checkSubname,
  };
};
