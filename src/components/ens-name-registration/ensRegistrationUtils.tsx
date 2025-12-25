import { Address, toHex } from "viem";
import {
  ProcessSteps,
  RegistrationState,
} from "./registration";

const cacheKey = "ns-ens-pending-regs";

const cacheExpiry = 60 * 60 * 1000; // one hour

interface CachedItem {
  cacheTime: number;
  data: RegistrationState;
}

export const cacheRegistrationData = (
  state: RegistrationState,
  owner: Address
) => {
  const data = getRegistrationCache();
  const singleKey = toHex(`${state.label}${owner}`);

  if (state.step === ProcessSteps.Start) {
    // lets not cache if registration is not started
    return;
  }

  const expiry = new Date().getTime() + cacheExpiry;
  data[singleKey] = {
    cacheTime: expiry,
    data: state
  }

  storeCache(data);
};


export const getCachedRegistrationData = (
  label: string,
  owner: Address
): RegistrationState | null => {
  const singleKey = toHex(`${label}${owner}`);

  const cache = getRegistrationCache();
  const cachedItem = cache[singleKey];
  const expired = isExpired(cachedItem);

  if (cachedItem && !expired) {
    return cachedItem.data;
  } 

  if (expired) {
    clearExpiredItem(cache, singleKey)
  }

  return null;
};

const isExpired = (item: CachedItem) => {
  const now = new Date().getTime();
  return now > item.cacheTime;
};

const clearExpiredItem = (cache: Record<string, CachedItem>, key: string) => {
  delete cache[key];
  storeCache(cache);
};

const storeCache = (cache: Record<string, CachedItem>) => {
  try {
    localStorage.setItem(cacheKey, JSON.stringify(cache));
  } catch (err) {
    console.error("Failed to store ens registration cache", err);
  }
};

const getRegistrationCache = (): Record<string, CachedItem> => {
  const raw = localStorage.getItem(cacheKey);

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as Record<string, CachedItem>;
  } catch (err) {
    console.error("Failed to parse ens cached data", err);
    return {};
  }
};

export const generateEnsRegistrationSecret = (): string => {
  return toHex(Math.floor(Math.random() * 1_000_000_000));
};
