import { EnsNameOwner, EnsTextRecord, EnsAddressRecord } from "@/types";
interface Cache<T> {
  item: T;
  expiry: number;
}

const cacheKey = "profile-cache";
const cacheExpiryMilliseconds = 5 * 60 * 1000;
const addrCacheKey = `${cacheKey}-addresses`;
const textsCacheKey = `${cacheKey}-texts`;
const ownerCacheKey = `${cacheKey}-ownership`

class EnsLocalCache {
  constructor() {
    const ownershipCacheString = this.getFromStorage(ownerCacheKey);
    if (ownershipCacheString && ownershipCacheString.length > 0) {
      this.ownershipCache = JSON.parse(ownershipCacheString) as Record<
        string,
        Cache<EnsNameOwner>
      >;
    }
    const textsCacheString = this.getFromStorage(textsCacheKey);
    if (textsCacheString && textsCacheString.length > 0) {
      this.textsCache = JSON.parse(textsCacheString) as Record<
        string,
        Cache<EnsTextRecord[]>
      >;
    }
    const addressesCacheString = this.getFromStorage(addrCacheKey);
    if (addressesCacheString && addressesCacheString.length > 0) {
      this.addressesCache = JSON.parse(addressesCacheString) as Record<
        string,
        Cache<EnsAddressRecord[]>
      >;
    }
  }

  private ownershipCache: Record<string, Cache<EnsNameOwner>> = {};
  private textsCache: Record<string, Cache<EnsTextRecord[]>> = {};
  private addressesCache: Record<string, Cache<EnsAddressRecord[]>> = {};

  public getCachedOwnership(ensName: string): EnsNameOwner | null {
    const expiry = this.ownershipCache[ensName]?.expiry || 0;
    if (this.isExpired(expiry)) {
      return null;
    }
    return this.ownershipCache[ensName]?.item || null;
  }

  public getCachedTexts(ensName: string): EnsTextRecord[] | null {
    const expiry = this.textsCache[ensName]?.expiry || 0
    if (this.isExpired(expiry)) {
        return null;
      }
      return this.textsCache[ensName]?.item || null;
  }

  public getCachedAddrs(ensName: string): EnsAddressRecord[] | null {
    const expiry = this.addressesCache[ensName]?.expiry || 0
    if (this.isExpired(expiry)) {
        return null;
      }
      return this.addressesCache[ensName]?.item || null;
  }

  public cacheOwnership(ensName: string, ownership: EnsNameOwner) {
    const cache: Cache<EnsNameOwner> = {
      item: ownership,
      expiry: new Date().getTime() + cacheExpiryMilliseconds,
    };
    this.ownershipCache[ensName] = cache;

    this.setToStorage(
      ownerCacheKey,
      JSON.stringify(this.ownershipCache)
    );
  }

  public cacheAddrs(ensName: string, addrs: EnsAddressRecord[]) {
    const cache: Cache<EnsAddressRecord[]> = {
        item: addrs,
        expiry: new Date().getTime() + cacheExpiryMilliseconds,
      };
      this.addressesCache[ensName] = cache;
      this.setToStorage(
        addrCacheKey,
        JSON.stringify(this.addressesCache)
      );
  }

  public cacheTexts(ensName: string, texts: EnsTextRecord[]) {
    const cache: Cache<EnsTextRecord[]> = {
        item: texts,
        expiry: new Date().getTime() + cacheExpiryMilliseconds,
      };
      this.textsCache[ensName] = cache;
      this.setToStorage(
        textsCacheKey,
        JSON.stringify(this.textsCache)
      );
  }

  private isExpired(expiry: number): boolean {
    const now = new Date().getTime();
    return expiry === 0 || now >= expiry;
  }

  private setToStorage = (key: string, value: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(key, value);
    }
  }

  private getFromStorage = (key: string) => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(key)
    }
  }
}

export const EnsCache = new EnsLocalCache();
