import { useState, useCallback } from "react";

/**
 * Hook for validating owner address
 */
export const useOwnerValidation = () => {
  const [ownerAddressError, setOwnerAddressError] = useState<string | null>(null);

  const validateOwnerAddress = useCallback((address: string): boolean => {
    if (!address || address.trim() === "") {
      setOwnerAddressError(null);
      return true; // Empty is valid (optional field)
    }
    
    // Basic ethereum address validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      setOwnerAddressError("Invalid Ethereum address");
      return false;
    }
    
    setOwnerAddressError(null);
    return true;
  }, []);

  const clearError = useCallback(() => {
    setOwnerAddressError(null);
  }, []);

  return {
    ownerAddressError,
    validateOwnerAddress,
    clearError,
  };
};
