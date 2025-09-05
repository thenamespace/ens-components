import { parseAbi } from "viem";

export const SET_TEXT_FUNC = "function setText(bytes32 node, string key, string value)";
export const SET_ADDRESS_FUNC = "function setAddr(bytes32 node, uint256 coin, bytes value)"
export const SET_CONTENTHASH_FUNC = "function setContenthash(bytes32 node, bytes value)";
export const MULTICALL = "function multicall(bytes[] data)"

export const ENS_RESOLVER_ABI = parseAbi([
 SET_TEXT_FUNC,
 SET_ADDRESS_FUNC,
 SET_CONTENTHASH_FUNC,
 MULTICALL
]);
