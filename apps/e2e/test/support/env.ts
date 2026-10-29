import "dotenv/config";
import type { Hex } from "viem";

const list = (value?: string) =>
  (value ?? "")
    .split(",")
    .map(v => v.trim().toLowerCase())
    .filter(Boolean);

export const env = {
  /** Private key of the funded Sepolia test wallet. Unset makes every wallet test skip. */
  privateKey: process.env.E2E_PRIVATE_KEY as Hex | undefined,
  rpcUrl:
    process.env.E2E_SEPOLIA_RPC_URL ||
    "https://ethereum-sepolia-rpc.publicnode.com",
  /** Activated ENSv2 parents to mint under, e.g. "a.eth,b.eth". */
  mintParents: list(process.env.E2E_MINT_PARENTS || "arti.eth"),
  /** Activated parents with expirable subnames, for renewal. Defaults to the mint parents. */
  renewParents: list(
    process.env.E2E_RENEW_PARENTS || process.env.E2E_MINT_PARENTS
  ),
};
