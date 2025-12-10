import { AppEnv } from "@/environment";
import { SupportedNetwork } from "@/types";
import {
  CreateListingRequest,
  GetRegistryParametersRequest,
  GetRegistryParametersResponse,
  ListingNetwork,
  ListingStatusDTO,
  ListingSuggestion,
  ListingSuggestionRequest,
  NamespaceListing,
} from "@/types/list-manager";
import axios, { AxiosInstance } from "axios";
import { Address } from "viem";

export interface GetListedNamesQuery {
  owner?: Address;
  isVerified?: boolean;
  page: number;
  size: number;
  nameNetwork: ListingNetwork;
}

interface PageResponse<T> {
  totalItems: number;
  page: number;
  size: number;
  items: T[];
}

// WidgetConfiguration interface for widgets API
export interface WidgetConfiguration {
  widgetType: string;
  widgetId: string;
  widgetOwner: string;
  logo?: string;
  selectedNames: string[];
  showRegisterEns: boolean;
  name: string;
}

export interface CreateWidgetRequest {
  widgetType: string;
  name: string;
  selectedNames?: string[];
  logo?: string;
  showRegisterEns: boolean;
  widgetId?: string; // Optional for updates
}

export class ListManagerClient {
  private httpClient: AxiosInstance;

  constructor(private readonly backendURI: string) {
    this.httpClient = axios.create({
      baseURL: this.backendURI,
    });
  }

  public async getListedName(ensName: string) {
    const listingNetwork = AppEnv.isTestnet
      ? ListingNetwork.Sepolia
      : ListingNetwork.Mainnet;

    return this.httpClient
      .get<NamespaceListing>(
        `/api/v1/listing/network/${listingNetwork}/name/${ensName}`
      )
      .then((res) => res.data);
  }

  public async deleteListing(
    ensName: string,
    network: SupportedNetwork,
    siweToken: string
  ) {
    return this.httpClient.delete(
      `/api/v1/listing/network/${this.toListingNetwork(
        network
      )}/name/${ensName}`,
      {
        headers: this.getSiweHeaders(siweToken),
      }
    );
  }

  public async getListedNames(query: GetListedNamesQuery) {
    return this.httpClient
      .get<PageResponse<NamespaceListing>>("/api/v1/listing", {
        params: query,
      })
      .then((res) => res.data);
  }

  public async verifyListing(
    name: string,
    nameNetwork: SupportedNetwork
  ): Promise<boolean> {
    return this.httpClient
      .post<boolean>(
        `/api/v1/listing-status/verify/network/${this.toListingNetwork(
          nameNetwork
        )}/name/${name}`
      )
      .then((res) => res.data);
  }

  public async getListingStatus(
    name: string,
    network: SupportedNetwork,
    refreshCache: boolean = false
  ) {
    return this.httpClient
      .get<ListingStatusDTO>(
        `/api/v1/listing-status/network/${this.toListingNetwork(
          network
        )}/name/${name}`,
        {
          params: {
            refreshCache: refreshCache,
          },
        }
      )
      .then((res) => res.data);
  }

  public async getListingSuggestions(
    request: ListingSuggestionRequest
  ): Promise<PageResponse<ListingSuggestion>> {
    return this.httpClient
      .get<PageResponse<ListingSuggestion>>(`/api/v1/listing/suggestions`, {
        params: request,
      })
      .then((res) => res.data);
  }

  public async waitForVerificationStatus(
    name: string,
    retries: number = 5,
    waitSeconds: number = 15
  ): Promise<boolean> {

    for (let i = 0; i < retries; i++) {
      const resp = await this.getListedName(name);
      if (!resp.isVerified) {
        return true;
      }
      await this.waitForSeconds(waitSeconds);
    }
    return false;
  }

  private async waitForSeconds(seconds: number): Promise<null> {
    return new Promise((resolve) =>
      setTimeout(() => resolve(null), seconds * 1000)
    );
  }

  public async getRegistryDeploymentParameters(
    request: GetRegistryParametersRequest,
    siweToken: string
  ): Promise<GetRegistryParametersResponse> {
    return this.httpClient
      .get<GetRegistryParametersResponse>(
        `/api/v1/l2-registry/deploy-parameters`,
        {
          params: request,
          headers: this.getSiweHeaders(siweToken),
        }
      )
      .then((res) => res.data);
  }

  public toListingNetwork(network: SupportedNetwork): ListingNetwork {
    switch (network) {
      case SupportedNetwork.Base:
        return ListingNetwork.Base;
      case SupportedNetwork.BaseSepolia:
        return ListingNetwork.BaseSepolia;
      case SupportedNetwork.Mainnet:
        return ListingNetwork.Mainnet;
      case SupportedNetwork.Optimism:
        return ListingNetwork.Optimism;
      case SupportedNetwork.Sepolia:
        return ListingNetwork.Sepolia;
    }
  }

  public async createListing(request: CreateListingRequest, siweToken: string) {
    return this.httpClient.post(`/api/v1/listing`, request, {
      headers: this.getSiweHeaders(siweToken),
    });
  }

  public async updateListing(request: CreateListingRequest, siweToken: string) {
    return this.httpClient.put(`/api/v1/listing`, request, {
      headers: this.getSiweHeaders(siweToken),
    });
  }

  private getSiweHeaders(siweToken: string) {
    return {
      "x-siwe-token": siweToken,
    };
  }

  public async getOwnedWidgets(owner: Address): Promise<WidgetConfiguration[]> {
    return this.httpClient
      .get<WidgetConfiguration[]>(`/api/v1/widgets/owned`, {
        params: { owner },
      })
      .then((res) => res.data);
  }

  public async createWidget(request: CreateWidgetRequest, siweToken: string): Promise<string> {
    return this.httpClient.post<{widgetId: string}>(`/api/v1/widgets`, request, {
      headers: {
        'x-siwe-token': siweToken,
        'Content-Type': 'application/json',
      },
    }).then((res) => res.data.widgetId);
  }

  public async updateWidget(widgetId: string, request: CreateWidgetRequest, siweToken: string): Promise<any> {
    return this.httpClient.put(`/api/v1/widgets/${widgetId}`, request, {
      headers: {
        'x-siwe-token': siweToken,
        'Content-Type': 'application/json',
      },
    });
  }

  public async deleteWidget(widgetId: string, siweToken: string): Promise<any> {
    return this.httpClient.delete(`/api/v1/widgets/${widgetId}`, {
      headers: {
        'x-siwe-token': siweToken,
        'Content-Type': 'application/json',
      },
    });
  }
}

export const createListingManagerClient = (backendUri: string) => {
  return new ListManagerClient(backendUri);
};
