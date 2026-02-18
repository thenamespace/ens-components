import { Address, Hash, toBytes, toHex, pad } from "viem";

  // Function for creating a referer parameter during registration
  // of ens name
  export const createEnsReferer = (address: Address): Hash => {
    // Convert address to bytes (20 bytes)
    const addressBytes = toBytes(address);
    // Pad to 32 bytes with zeros on the left (12 zero bytes + 20 address bytes)
    const paddedBytes = pad(addressBytes, { size: 32, dir: 'left' });
    // Convert back to hex string (Hash type)
    return toHex(paddedBytes) as Hash;
  }