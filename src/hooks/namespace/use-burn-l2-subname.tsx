import { useConnectedPrincipal } from "@/context"
import { useWeb3Clients } from "../web3/use-web3-clients"
import { Address, Hash, namehash, parseAbi, zeroAddress } from "viem";


export const useBurnL2Subname = (chainId: number) => {

    const { publicClient, walletClient } = useWeb3Clients({chainId})
    const { connectedAddress } = useConnectedPrincipal();

    const burnSubnameAsync = async (registryAddress: string, fullSubname: string):Promise<Hash> => {

        if (!publicClient || !walletClient) {
            return zeroAddress;
        }

        const {request} = await publicClient.simulateContract({
            abi: parseAbi(['function burn(bytes32 node) external']),
            address: registryAddress as Address,
            functionName: "burn",
            args: [namehash(fullSubname)],
            account: connectedAddress
        })
        return await walletClient.writeContract(request);
    }

    return {
        burnSubnameAsync
    }
}