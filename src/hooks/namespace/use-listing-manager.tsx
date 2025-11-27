import { createListingManagerClient, ListManagerClient } from "@/backend"
import { AppEnv } from "../../environment"; 

export const useListingManager = (): ListManagerClient => {
    return createListingManagerClient(AppEnv.listManagerApi)
}