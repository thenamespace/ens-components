import { Address } from "viem";

export interface AuthMessage {
    principal: Address
    nonce: string
    issued: number
    app: string
    message: string
}