# Calendar Duration Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a toggle-based duration picker to the ENS registration form that supports both whole-year increments (default) and a calendar date picker — matching ENS app v3 UX — with a 28-day minimum.

**Architecture:** Replace `expiryInYears: number` with `durationInSeconds: number` as the single duration primitive throughout the registration stack. Add date utility functions and a new `DurationPicker` molecule component. Update `PricingDisplay`, `RegistrationSummary`, `RegistrationProcess`, `RegistrationState`, `RegistrationRequest`, `CommitmentStep`, `RegistrationStep`, and `SuccessScreen` to use the new primitive. The contract layer is unchanged — it already received duration in seconds.

**Tech Stack:** React 18, TypeScript, CSS (no new dependencies)

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Create | `packages/components/src/utils/date.ts` | Date/duration utility functions + constants |
| Modify | `packages/components/src/utils/index.ts` | Re-export new date utilities |
| Create | `packages/components/src/components/molecules/duration-picker/DurationPicker.tsx` | Years/calendar toggle picker component |
| Create | `packages/components/src/components/molecules/duration-picker/DurationPicker.css` | Picker styles |
| Modify | `packages/components/src/components/molecules/index.tsx` | Export `DurationPicker` |
| Modify | `packages/components/src/components/molecules/pricing-display/PricingDisplay.tsx` | Update `expiryPicker` prop shape, render `DurationPicker` |
| Modify | `packages/components/src/components/ens-name-registration/registration/types.ts` | `expiryInYears` → `durationInSeconds` |
| Modify | `packages/components/src/hooks/useRegisterENS.tsx` | `RegistrationRequest.expiryInYears` → `durationInSeconds`; update price/register fns |
| Modify | `packages/components/src/components/ens-name-registration/RegistrationSummary.tsx` | `years`/`onYearsChange` → `durationSeconds`/`onDurationChange` |
| Modify | `packages/components/src/components/ens-name-registration/ENSNameRegistrationForm.tsx` | State `years` → `durationSeconds`; `RegistrationSuccessData.expiryInYears` → `durationLabel` |
| Modify | `packages/components/src/components/ens-name-registration/RegistrationProcess.tsx` | Prop `expiryInYears` → `durationInSeconds`; `RegistrationSuccessData.expiryInYears` → `durationLabel` |
| Modify | `packages/components/src/components/ens-name-registration/registration/CommitmentStep.tsx` | `RegistrationRequest.expiryInYears` → `durationInSeconds` |
| Modify | `packages/components/src/components/ens-name-registration/registration/RegistrationStep.tsx` | `RegistrationRequest`, expiry date calc, `RegistrationSuccessData.expiryInYears` → `durationLabel` |
| Modify | `packages/components/src/components/ens-name-registration/registration/SuccessScreen.tsx` | Prop `expiryInYears: number` → `durationLabel: string` |

---

## Task 1: Date utility functions

**Files:**
- Create: `packages/components/src/utils/date.ts`
- Modify: `packages/components/src/utils/index.ts`

- [ ] **Step 1: Create `packages/components/src/utils/date.ts`**

```ts
export const ONE_DAY = 86_400
export const ONE_YEAR = 365 * ONE_DAY  // 31_536_000
export const MIN_REGISTRATION_SECONDS = 28 * ONE_DAY  // 2_419_200

/** "YYYY-MM-DD" string for <input type="date"> value, from Unix expiry timestamp */
export const secondsToDateInput = (expirySeconds: number): string => {
  const date = new Date(expirySeconds * 1000)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Duration in seconds from nowSeconds to midnight of valueAsDate (day-aligned) */
export const roundDurationWithDay = (valueAsDate: Date, nowSeconds: number): number => {
  const endMidnight = new Date(valueAsDate.getTime())
  endMidnight.setHours(0, 0, 0, 0)
  const startMidnight = new Date(nowSeconds * 1000)
  startMidnight.setHours(0, 0, 0, 0)
  return Math.floor((endMidnight.getTime() - startMidnight.getTime()) / 1000)
}

/** Calendar-aware seconds for N whole years from startDate (handles leap years) */
export const secondsFromYears = (startDate: Date, years: number): number => {
  const end = new Date(startDate.getTime())
  end.setFullYear(end.getFullYear() + years)
  return Math.floor((end.getTime() - startDate.getTime()) / 1000)
}

/** Fractional years from duration seconds */
export const yearsFromSeconds = (seconds: number): number => seconds / ONE_YEAR

/**
 * Human-readable duration label for display.
 * Examples: "1 year", "2 years", "6 months, 3 days", "28 days"
 * Shows at most 2 parts; omits days when years are present.
 */
export const formatDurationSummary = (durationSeconds: number): string => {
  const now = new Date()
  const end = new Date(now.getTime() + durationSeconds * 1000)

  let years = end.getFullYear() - now.getFullYear()
  let months = end.getMonth() - now.getMonth()
  let days = end.getDate() - now.getDate()

  if (days < 0) {
    months -= 1
    days += new Date(end.getFullYear(), end.getMonth(), 0).getDate()
  }
  if (months < 0) {
    years -= 1
    months += 12
  }

  const parts: string[] = []
  if (years > 0) parts.push(`${years} year${years !== 1 ? 's' : ''}`)
  if (months > 0) parts.push(`${months} month${months !== 1 ? 's' : ''}`)
  if (days > 0 && years === 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`)

  return parts.slice(0, 2).join(', ') || '0 days'
}
```

- [ ] **Step 2: Add date export to `packages/components/src/utils/index.ts`**

Add this line at the end:
```ts
export * from "./date";
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/happy/Documents/Work/Namespace/Main/uikit
pnpm --filter @thenamespace/ens-components exec tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add packages/components/src/utils/date.ts packages/components/src/utils/index.ts
git commit -m "feat: add date/duration utility functions"
```

---

## Task 2: DurationPicker component

**Files:**
- Create: `packages/components/src/components/molecules/duration-picker/DurationPicker.tsx`
- Create: `packages/components/src/components/molecules/duration-picker/DurationPicker.css`

- [ ] **Step 1: Create `DurationPicker.css`**

```css
.ns-duration-picker {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  width: 100%;
}

/* Years mode: − N year(s) + */
.ns-duration-picker__control {
  display: flex;
  align-items: center;
  width: 100%;
  border: 1px solid var(--ns-color-border, #e5e7eb);
  border-radius: 9999px;
  padding: 4px;
  gap: 4px;
}

.ns-duration-picker__btn {
  height: 44px !important;
  width: 44px !important;
  min-width: 44px !important;
  border-radius: 50% !important;
  flex-shrink: 0;
  display: flex !important;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  padding: 0 !important;
}

.ns-duration-picker__btn--plus {
  background-color: var(--ns-color-primary, #3b82f6) !important;
  color: white !important;
}

.ns-duration-picker__label {
  flex: 1;
  text-align: center;
  font-weight: 700;
  font-size: 1.5rem;
  color: var(--ns-color-primary, #3b82f6);
  line-height: 44px;
}

/* Calendar mode */
.ns-duration-picker__calendar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border: 1px solid var(--ns-color-border, #e5e7eb);
  border-radius: 9999px;
  padding: 12px 8px 12px 24px;
  overflow: hidden;
  cursor: pointer;
}

.ns-duration-picker__date-display {
  font-weight: 700;
  font-size: 1.5rem;
  color: var(--ns-color-primary, #3b82f6);
  pointer-events: none;
}

/* Native date input positioned over the control (invisible, triggers browser picker) */
.ns-duration-picker__date-input {
  position: absolute;
  left: 0;
  top: 0;
  width: calc(100% - 60px);
  height: 100%;
  opacity: 0;
  cursor: pointer;
  border: none;
  background: transparent;
  z-index: 1;
}

.ns-duration-picker__calendar-btn {
  background-color: var(--ns-color-primary, #3b82f6);
  color: white;
  height: 44px;
  width: 44px;
  min-width: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  border: none;
  padding: 0;
  z-index: 2;
  position: relative;
}

/* Footer: "N year registration. Pick by date" */
.ns-duration-picker__footer {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-wrap: wrap;
  justify-content: center;
}

.ns-duration-picker__toggle {
  color: var(--ns-color-primary, #3b82f6);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: inherit;
}
```

- [ ] **Step 2: Create `DurationPicker.tsx`**

```tsx
import React, { useRef } from "react";
import "./DurationPicker.css";
import { Button, Text } from "@/components/atoms";
import {
  MIN_REGISTRATION_SECONDS,
  secondsFromYears,
  secondsToDateInput,
  roundDurationWithDay,
  formatDurationSummary,
  yearsFromSeconds,
} from "@/utils/date";

export interface DurationPickerProps {
  durationSeconds: number;
  onDurationChange: (seconds: number) => void;
  minSeconds?: number;
}

const CalendarSVG = () => (
  <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden="true">
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
  </svg>
);

export const DurationPicker: React.FC<DurationPickerProps> = ({
  durationSeconds,
  onDurationChange,
  minSeconds = MIN_REGISTRATION_SECONDS,
}) => {
  const [durationType, setDurationType] = React.useState<"years" | "date">("years");
  const dateInputRef = useRef<HTMLInputElement>(null);
  const nowSeconds = Math.floor(Date.now() / 1000);

  const years = Math.max(1, Math.floor(yearsFromSeconds(durationSeconds)));

  const handleMinusYear = () => {
    const newSeconds = secondsFromYears(new Date(), years - 1);
    if (newSeconds >= minSeconds) {
      onDurationChange(newSeconds);
    }
  };

  const handlePlusYear = () => {
    onDurationChange(secondsFromYears(new Date(), years + 1));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { valueAsDate } = e.currentTarget;
    if (!valueAsDate) return;
    // Native date picker returns UTC midnight; add timezone offset to get local date
    const normalised = new Date(
      valueAsDate.getTime() + valueAsDate.getTimezoneOffset() * 60 * 1000
    );
    const minDate = new Date((nowSeconds + minSeconds) * 1000);
    const clamped = normalised < minDate ? minDate : normalised;
    onDurationChange(roundDurationWithDay(clamped, nowSeconds));
  };

  const handleToggleMode = () => {
    if (durationType === "years") {
      setDurationType("date");
    } else {
      // Snap back to nearest whole year (min 1) when switching to years mode
      const snapped = secondsFromYears(
        new Date(),
        Math.max(1, Math.floor(yearsFromSeconds(durationSeconds)))
      );
      onDurationChange(snapped);
      setDurationType("years");
    }
  };

  const minusDisabled = secondsFromYears(new Date(), years - 1) < minSeconds;
  const expirySeconds = nowSeconds + durationSeconds;
  const expiryDateDisplay = new Date(expirySeconds * 1000).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="ns-duration-picker">
      {durationType === "years" ? (
        <div className="ns-duration-picker__control">
          <Button
            className="ns-duration-picker__btn"
            onClick={handleMinusYear}
            disabled={minusDisabled}
          >
            −
          </Button>
          <span className="ns-duration-picker__label">
            {years} year{years !== 1 ? "s" : ""}
          </span>
          <Button
            className="ns-duration-picker__btn ns-duration-picker__btn--plus"
            onClick={handlePlusYear}
          >
            +
          </Button>
        </div>
      ) : (
        <div className="ns-duration-picker__calendar">
          <span className="ns-duration-picker__date-display">{expiryDateDisplay}</span>
          <input
            ref={dateInputRef}
            type="date"
            className="ns-duration-picker__date-input"
            value={secondsToDateInput(expirySeconds)}
            min={secondsToDateInput(nowSeconds + minSeconds)}
            onChange={handleDateChange}
          />
          <button
            type="button"
            className="ns-duration-picker__calendar-btn"
            onClick={() => dateInputRef.current?.showPicker?.()}
            aria-label="Open calendar"
          >
            <CalendarSVG />
          </button>
        </div>
      )}
      <div className="ns-duration-picker__footer">
        <Text size="xs" color="grey">
          {formatDurationSummary(durationSeconds)} registration.&nbsp;
        </Text>
        <button
          type="button"
          className="ns-duration-picker__toggle"
          onClick={handleToggleMode}
        >
          Pick by {durationType === "years" ? "date" : "years"}
        </button>
      </div>
    </div>
  );
};
```

- [ ] **Step 3: Export from molecules index**

In `packages/components/src/components/molecules/index.tsx`, add at the end:
```ts
export * from "./duration-picker/DurationPicker";
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd /Users/happy/Documents/Work/Namespace/Main/uikit
pnpm --filter @thenamespace/ens-components exec tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add packages/components/src/components/molecules/duration-picker/ packages/components/src/components/molecules/index.tsx
git commit -m "feat: add DurationPicker component with years/calendar toggle"
```

---

## Task 3: Update PricingDisplay

**Files:**
- Modify: `packages/components/src/components/molecules/pricing-display/PricingDisplay.tsx`

Replace the `expiryPicker` prop shape and the inline `+/−` button block with `<DurationPicker>`.

- [ ] **Step 1: Update `PricingDisplay.tsx`**

Replace the entire file content with:

```tsx
import React from "react";
import { Button, Text, ShurikenSpinner } from "@/components/atoms";
import { DurationPicker } from "../duration-picker/DurationPicker";
import "./PricingDisplay.css";

export interface PricingDisplayProps {
  primaryFee: {
    label: string;
    amount: number | string;
    isChecking: boolean;
  };
  networkFees?: {
    amount: number | string;
    isChecking: boolean;
  };
  total: {
    amount: number | string;
    isChecking: boolean;
  };
  expiryPicker?: {
    durationSeconds: number;
    onDurationChange: (seconds: number) => void;
    minSeconds?: number;
  };
  ethUsdRate?: number | null;
  className?: string;
}

export const PricingDisplay: React.FC<PricingDisplayProps> = ({
  primaryFee,
  networkFees,
  total,
  expiryPicker,
  ethUsdRate,
  className = "",
}) => {
  const totalLoading = total.isChecking || primaryFee.isChecking || networkFees?.isChecking;

  const totalUsd = React.useMemo(() => {
    if (!ethUsdRate || totalLoading || total.amount === "Free" || total.amount === "N/A") {
      return null;
    }
    const eth = parseFloat(String(total.amount));
    if (isNaN(eth) || eth <= 0) return null;
    return (eth * ethUsdRate).toFixed(2);
  }, [ethUsdRate, total.amount, totalLoading]);

  return (
    <div className={`ens-registration-pricing ${className}`}>
      {expiryPicker && (
        <div className="ens-expiry-picker mb-2">
          <DurationPicker
            durationSeconds={expiryPicker.durationSeconds}
            onDurationChange={expiryPicker.onDurationChange}
            minSeconds={expiryPicker.minSeconds}
          />
        </div>
      )}
      <div className="d-flex justify-content-between align-items-center mb-1">
        <Text size="sm" color="grey">
          {primaryFee.label}
        </Text>
        {primaryFee.isChecking ? (
          <ShurikenSpinner size={16} />
        ) : (
          <Text size="sm" color="grey">
            {primaryFee.amount === "Free" ? "Free" : `${primaryFee.amount} ETH`}
          </Text>
        )}
      </div>
      {networkFees && (
        <div className="d-flex justify-content-between align-items-center mb-1">
          <Text size="sm" color="grey">
            Est. network fees
          </Text>
          {networkFees.isChecking ? (
            <ShurikenSpinner size={16} />
          ) : (
            <Text size="sm" color="grey">
              {networkFees.amount} ETH
            </Text>
          )}
        </div>
      )}
      <div className="d-flex justify-content-between align-items-center mt-2 total-fee">
        <Text size="lg" weight="bold">
          Total
        </Text>
        {totalLoading ? (
          <ShurikenSpinner size={20} />
        ) : (
          <div style={{ textAlign: "right" }}>
            <Text size="lg" weight="bold">
              {total.amount === "Free" ? "Free" : `${total.amount} ETH`}
            </Text>
            {totalUsd && (
              <Text size="xs" color="grey">
                ≈ ${totalUsd}
              </Text>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingDisplay;
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/happy/Documents/Work/Namespace/Main/uikit
pnpm --filter @thenamespace/ens-components exec tsc --noEmit
```

Expected: TypeScript will now report errors in `RegistrationSummary.tsx` because it still passes `{ years, onYearsChange }` to `expiryPicker`. That's expected — we fix it in Task 5.

- [ ] **Step 3: Commit**

```bash
git add packages/components/src/components/molecules/pricing-display/PricingDisplay.tsx
git commit -m "feat: update PricingDisplay expiryPicker to use durationSeconds"
```

---

## Task 4: Update core data model — RegistrationState + useRegisterENS

**Files:**
- Modify: `packages/components/src/components/ens-name-registration/registration/types.ts`
- Modify: `packages/components/src/hooks/useRegisterENS.tsx`

- [ ] **Step 1: Update `registration/types.ts`**

Replace the entire file:

```ts
import { EnsRecords } from "@/types";
import { Address } from "viem";

export enum ProcessSteps {
  Start = 0,
  CommitmentSent = 1,
  CommitmentCompleted = 2,
  TimerStarted = 3,
  TimerCompleted = 4,
  RegistrationSent = 5,
  RegistrationCompleted = 6,
}

export interface RegistrationState {
  step: ProcessSteps;
  commitment: { tx?: string; completed: boolean; time: number };
  timerStartedAt: number;
  registration: { tx?: string; completed: boolean };
  label: string;
  isTestnet?: boolean;
  secret: string;
  durationInSeconds: number;
  records: EnsRecords;
  referrer?: Address;
  isLoading?: boolean;
}
```

- [ ] **Step 2: Update `useRegisterENS.tsx`**

Replace the entire file:

```tsx
import {
  Address,
  formatEther,
  Hash,
  isAddress,
  keccak256,
  namehash,
  parseAbi,
  toBytes,
  zeroAddress,
} from "viem";
import { mainnet, sepolia } from "viem/chains";
import { useAccount, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import { getEnsContracts } from "@thenamespace/addresses";
import { createEnsReferer, equalsIgnoreCase, formatFloat } from "@/utils";
import { ONE_YEAR } from "@/utils/date";
import { ABIS } from "./abis";
import { EnsRecords } from "@/types";
import { convertToResolverData } from "@/utils/resolver";

interface RentPriceResponse {
  wei: bigint;
  eth: number;
}

const NAMESPACE_REFERRER_ADDRESS = "0xb7B18611b8C51B4B3F400BaF09DB49E61e0aF044";

const ENS_REGISTRY_ABI = parseAbi([
  "function owner(bytes32) view returns (address)",
]);

export interface RegistrationRequest {
  label: string;
  owner: Address;
  durationInSeconds: number;
  secret: string;
  records: EnsRecords;
  referrer?: Address;
}

interface EnsRegistration {
  label: string;
  owner: Address;
  duration: bigint;
  secret: Hash;
  resolver: Address;
  data: Hash[];
  reverseRecord: number;
  referrer: Hash;
}

export const useRegisterENS = ({ isTestnet }: { isTestnet?: boolean }) => {
  const publicClient = usePublicClient({
    chainId: isTestnet ? sepolia.id : mainnet.id,
  });
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient({
    chainId: isTestnet ? sepolia.id : mainnet.id,
  });

  const getRegistrationPrice = async (
    label: string,
    durationInSeconds: number = ONE_YEAR
  ): Promise<RentPriceResponse> => {
    const ethController = getEthController();
    const price = (await publicClient!.readContract({
      abi: ABIS.ETH_REGISTRAR_CONTOLLER,
      functionName: "rentPrice",
      args: [label, BigInt(durationInSeconds)],
      address: ethController,
      account: address!,
    })) as { base: bigint; premium: bigint };

    const totalPrice = price.base + price.premium;
    return {
      wei: totalPrice,
      eth: formatFloat(formatEther(totalPrice, "wei"), 4),
    };
  };

  const isEnsAvailable = async (label: string): Promise<boolean> => {
    const ownerAddress = await publicClient!.readContract({
      functionName: "owner",
      abi: ENS_REGISTRY_ABI,
      args: [namehash(`${label}.eth`)],
      address: getEnsRegistry(),
    });
    return equalsIgnoreCase(ownerAddress, zeroAddress);
  };

  const makeCommitment = async (request: RegistrationRequest): Promise<Hash> => {
    const fullName = `${request.label}.eth`;
    const resolverData = convertToResolverData(fullName, request.records);

    const c: EnsRegistration = {
      label: request.label,
      owner: request.owner,
      duration: BigInt(request.durationInSeconds),
      secret: keccak256(toBytes(request.secret)),
      resolver: getPublicResolver(),
      data: resolverData,
      reverseRecord: 0,
      referrer: getRegReferrer(request),
    };

    return (await publicClient!.readContract({
      functionName: "makeCommitment",
      abi: ABIS.ETH_REGISTRAR_CONTOLLER,
      address: getEthController(),
      args: [c],
    })) as Hash;
  };

  const sendCommitmentTx = async (request: RegistrationRequest): Promise<Hash> => {
    if (!walletClient || !walletClient.account) {
      throw new Error("Wallet client is not available");
    }

    const commitment = await makeCommitment(request);
    const { request: contractRequest } = await publicClient!.simulateContract({
      address: getEthController(),
      abi: ABIS.ETH_REGISTRAR_CONTOLLER,
      functionName: "commit",
      args: [commitment],
      account: walletClient.account,
    });
    return walletClient.writeContract(contractRequest);
  };

  const sendRegisterTx = async (
    request: RegistrationRequest
  ): Promise<{ txHash: Hash; price: RentPriceResponse }> => {
    if (!walletClient || !walletClient.account) {
      throw new Error("Wallet client is not available");
    }

    const fullName = `${request.label}.eth`;
    const resolverData = convertToResolverData(fullName, request.records);

    const registration: EnsRegistration = {
      label: request.label,
      owner: request.owner,
      duration: BigInt(request.durationInSeconds),
      secret: keccak256(toBytes(request.secret)),
      resolver: getPublicResolver(),
      data: resolverData,
      reverseRecord: 0,
      referrer: getRegReferrer(request),
    };

    const price = await getRegistrationPrice(request.label, request.durationInSeconds);

    const { request: contractRequest } = await publicClient!.simulateContract({
      address: getEthController(),
      abi: ABIS.ETH_REGISTRAR_CONTOLLER,
      functionName: "register",
      args: [registration],
      account: walletClient.account,
      value: price.wei,
    });

    const tx = await walletClient.writeContract(contractRequest);
    return { txHash: tx, price };
  };

  const getEthController = () => getEnsContracts(isTestnet).ethRegistrarController;
  const getEnsRegistry = () => getEnsContracts(isTestnet).ensRegistry;
  const getPublicResolver = () => getEnsContracts(isTestnet).publicResolver;

  const getRegReferrer = (request: RegistrationRequest) => {
    const referrerAddress =
      request.referrer && isAddress(request.referrer)
        ? request.referrer
        : NAMESPACE_REFERRER_ADDRESS;
    return createEnsReferer(referrerAddress);
  };

  return {
    isEnsAvailable,
    getRegistrationPrice,
    sendCommitmentTx,
    sendRegisterTx,
  };
};
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/happy/Documents/Work/Namespace/Main/uikit
pnpm --filter @thenamespace/ens-components exec tsc --noEmit
```

Expected: TypeScript errors in `CommitmentStep.tsx` and `RegistrationStep.tsx` (both still use `expiryInYears`). That's expected — fixed in Task 7.

- [ ] **Step 4: Commit**

```bash
git add packages/components/src/components/ens-name-registration/registration/types.ts packages/components/src/hooks/useRegisterENS.tsx
git commit -m "feat: replace expiryInYears with durationInSeconds in RegistrationState and RegistrationRequest"
```

---

## Task 5: Update RegistrationSummary

**Files:**
- Modify: `packages/components/src/components/ens-name-registration/RegistrationSummary.tsx`

Replace `years`/`onYearsChange` props with `durationSeconds`/`onDurationChange` and update the price check debounce.

- [ ] **Step 1: Replace `RegistrationSummary.tsx`**

```tsx
import React, { useCallback, useMemo } from "react";
import "./RegistrationSummary.css";
import { normalize } from "viem/ens";

import { debounce, formatFloat } from "@/utils";
import { MIN_REGISTRATION_SECONDS } from "@/utils/date";
import { Button, Icon, Input, Text, ShurikenSpinner } from "@/components";
import { PricingDisplay } from "@/components/molecules";
import ninjaImage from "../../assets/banner.png";
import shurikenImage from "../../assets/shuriken.svg";
import { useRegisterENS, useEthDollarValue } from "@/hooks";
import { useAccount } from "wagmi";

const MIN_ENS_LEN = 3;

export interface RegistrationSummaryProps {
  label: string;
  durationSeconds: number;
  price: {
    isChecking: boolean;
    wei: bigint;
    eth: number;
  };
  transactionFees?: {
    isChecking: boolean;
    estimatedGas: number;
    price: {
      wei: bigint;
      eth: number;
    };
  };
  nameValidation: {
    isChecking: boolean;
    isTaken: boolean;
    reason?: string;
  };
  isTestnet?: boolean;
  title?: string;
  subtitle?: string;
  bannerImage?: string;
  hideBanner?: boolean;
  bannerWidth?: number;
  onLabelChange: (label: string) => void;
  onDurationChange: (seconds: number) => void;
  onPriceChange: (price: { isChecking: boolean; wei: bigint; eth: number }) => void;
  onNameValidationChange: (validation: {
    isChecking: boolean;
    isTaken: boolean;
    reason?: string;
  }) => void;
  onSetProfile?: () => void;
  onStart?: () => void;
  onConnectWallet?: () => void;
}

export const RegistrationSummary: React.FC<RegistrationSummaryProps> = ({
  label,
  durationSeconds,
  price,
  nameValidation,
  transactionFees,
  isTestnet = false,
  title,
  subtitle,
  bannerImage,
  hideBanner = false,
  bannerWidth = 250,
  onLabelChange,
  onDurationChange,
  onPriceChange,
  onNameValidationChange,
  onSetProfile,
  onStart,
  onConnectWallet,
}) => {
  const { isConnected } = useAccount();
  const { ethUsdRate } = useEthDollarValue();
  const { isEnsAvailable, getRegistrationPrice } = useRegisterENS({ isTestnet });

  const { regPrice, regFees, regTotal } = useMemo(() => {
    let regPrice = 0;
    let regFees = 0;
    let total = 0;

    if (price) {
      regPrice += price.eth;
      total += price.eth;
    }
    if (transactionFees) {
      regFees += transactionFees.price.eth;
      total += transactionFees.price.eth;
    }

    return { regFees, regPrice, regTotal: formatFloat(total, 5) };
  }, [price, transactionFees]);

  const checkAvailability = async (labelToCheck: string) => {
    try {
      const available = await isEnsAvailable(labelToCheck);
      onNameValidationChange({ isChecking: false, isTaken: !available });
    } catch {
      onNameValidationChange({
        isChecking: false,
        isTaken: false,
        reason: "Something went wrong",
      });
    }
  };

  const checkRegistrationPrice = async (labelToCheck: string, durationSecs: number) => {
    try {
      const rentPrice = await getRegistrationPrice(labelToCheck, durationSecs);
      onPriceChange({ isChecking: false, eth: rentPrice.eth, wei: rentPrice.wei });
    } catch {
      onPriceChange({ isChecking: false, eth: -1, wei: 0n });
    }
  };

  const debouncedCheckAvailability = useCallback(
    debounce((labelToCheck: string) => checkAvailability(labelToCheck), 500),
    []
  );

  const debouncedCheckPrice = useCallback(
    debounce(
      (labelToCheck: string, durationSecs: number) =>
        checkRegistrationPrice(labelToCheck, durationSecs),
      500
    ),
    []
  );

  const handleNameChanged = async (value: string) => {
    const _value = value.toLocaleLowerCase().trim();
    if (_value.includes(".")) return;
    try {
      normalize(_value);
    } catch {
      return;
    }

    onLabelChange(_value);

    if (_value.length >= MIN_ENS_LEN) {
      onNameValidationChange({ isChecking: true, isTaken: false });
      onPriceChange({ isChecking: true, eth: 0, wei: 0n });
      debouncedCheckAvailability(_value);
      debouncedCheckPrice(_value, durationSeconds);
    } else {
      onNameValidationChange({ isChecking: false, isTaken: false });
    }
  };

  const handleDurationChange = (newSeconds: number) => {
    if (newSeconds < MIN_REGISTRATION_SECONDS) return;
    onPriceChange({ ...price, isChecking: true });
    onDurationChange(newSeconds);
    debouncedCheckPrice(label, newSeconds);
  };

  const isNameAvailable = useMemo(
    () =>
      label.length >= MIN_ENS_LEN &&
      !nameValidation.isChecking &&
      !nameValidation.isTaken,
    [label.length, nameValidation.isChecking, nameValidation.isTaken]
  );

  const nextBtnDisabled =
    label.length < MIN_ENS_LEN || nameValidation.isChecking || nameValidation.isTaken;

  const totalPriceLoading = transactionFees?.isChecking || price.isChecking;
  const transactionFeesLoading = transactionFees?.isChecking || false;

  return (
    <div className="ens-registration-summary">
      {!hideBanner && (
        <div className="d-flex justify-content-center">
          <img
            style={{ width: `${bannerWidth}px`, margin: "auto" }}
            src={bannerImage || ninjaImage}
            alt="Banner"
          />
        </div>
      )}
      <div className="text-center mb-3" style={{ textAlign: "center" }}>
        <Text weight="bold" className="text-align-center" size="lg">
          {title || "ENS Name Registration"}
        </Text>
        <Text color="grey" className="text-align-center" size="sm">
          {subtitle || "Register your ENS name and set a profile"}
        </Text>
      </div>
      <Input
        value={label}
        onChange={(e) => handleNameChanged(e.target.value)}
        size="lg"
        wrapperClassName="ens-name-input"
        prefix={<Icon color="grey" size={20} name="search" />}
        suffix={
          <Text weight="medium" size="sm" color="grey">
            .eth
          </Text>
        }
      />

      {label.length < MIN_ENS_LEN && (
        <div className="ns-text-center mt-2">
          <Text size="xs" color="grey">
            Minimum ENS name length is 3 characters
          </Text>
        </div>
      )}

      {label.length >= MIN_ENS_LEN && nameValidation.isChecking && (
        <div
          className="ns-text-center mt-2 d-flex align-items-center justify-content-center"
          style={{ gap: "8px" }}
        >
          <ShurikenSpinner size={18} />
          <Text size="sm" color="grey">
            Checking availability
          </Text>
        </div>
      )}

      {label.length >= MIN_ENS_LEN &&
        !nameValidation.isChecking &&
        nameValidation.isTaken && (
          <div className="ns-text-center mt-2">
            <Text size="xs" color="grey">
              {label}.eth is not available
            </Text>
          </div>
        )}

      {isNameAvailable && (
        <>
          <PricingDisplay
            className="mt-2"
            primaryFee={{
              label: "Registration Fee",
              amount: regPrice,
              isChecking: price.isChecking,
            }}
            networkFees={{
              amount: regFees,
              isChecking: transactionFeesLoading,
            }}
            total={{
              amount: regTotal,
              isChecking: totalPriceLoading,
            }}
            expiryPicker={{
              durationSeconds,
              onDurationChange: handleDurationChange,
              minSeconds: MIN_REGISTRATION_SECONDS,
            }}
            ethUsdRate={ethUsdRate}
          />

          <div
            className="ens-profile-selector mt-2"
            onClick={onSetProfile}
            style={{ cursor: "pointer" }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <div className="shuriken-cont d-flex align-items-center justify-content-center">
                  <img className="shuriken" width={50} src={shurikenImage} alt="shuricken" />
                </div>
                <div className="ms-3">
                  <Text size="sm" weight="medium">
                    Complete your profile
                  </Text>
                  <Text size="xs" color="grey">
                    Make your ENS more discoverable
                  </Text>
                </div>
              </div>
              <Button style={{ width: 40, height: 40 }}>{`>`}</Button>
            </div>
          </div>
        </>
      )}

      {!isConnected && onConnectWallet ? (
        <Button style={{ width: "100%" }} size="lg" className="mt-2" onClick={onConnectWallet}>
          Connect Wallet
        </Button>
      ) : (
        <Button
          style={{ width: "100%" }}
          size="lg"
          className="mt-2"
          disabled={nextBtnDisabled}
          onClick={() => onStart?.()}
        >
          Next
        </Button>
      )}
    </div>
  );
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/happy/Documents/Work/Namespace/Main/uikit
pnpm --filter @thenamespace/ens-components exec tsc --noEmit
```

Expected: error in `ENSNameRegistrationForm.tsx` (still passes `years`/`onYearsChange`). Fixed in next task.

- [ ] **Step 3: Commit**

```bash
git add packages/components/src/components/ens-name-registration/RegistrationSummary.tsx
git commit -m "feat: update RegistrationSummary to use durationSeconds"
```

---

## Task 6: Update ENSNameRegistrationForm + RegistrationProcess

**Files:**
- Modify: `packages/components/src/components/ens-name-registration/ENSNameRegistrationForm.tsx`
- Modify: `packages/components/src/components/ens-name-registration/RegistrationProcess.tsx`

- [ ] **Step 1: Replace `ENSNameRegistrationForm.tsx`**

```tsx
import { useMemo, useState } from "react";
import "./ENSNamesRegistrarComponent.css";
import { RegistrationSummary } from "./RegistrationSummary";
import { SetNameRecords } from "./SetNameRecords";
import { EnsRecords } from "@/types";
import { deepCopy, getEnsRecordsDiff } from "@/utils";
import { ONE_YEAR } from "@/utils/date";
import { useAccount } from "wagmi";
import { RegistrationProcess } from "./RegistrationProcess";
import { SuccessScreen } from "./registration";
import { Address } from "viem";

export interface EnsNameRegistrationFormProps {
  name?: string;
  isTestnet?: boolean;
  referrer?: Address;
  noBorder?: boolean;
  className?: string;
  title?: string;
  subtitle?: string;
  bannerImage?: string;
  hideBanner?: boolean;
  bannerWidth?: number;
  avatarUploadDomain?: string;
  onRegistrationSuccess?: (result: RegistrationSuccessData) => void;
  onClose?: (isSuccess: boolean) => void;
  onRegistrationStart?: (name: string) => void;
  onConnectWallet?: () => void;
}

enum RegistrationSteps {
  Summary = 0,
  Progress = 1,
  Success = 2,
}

interface RegistrationSuccessData {
  durationLabel: string;
  registrationCost: string;
  transactionFees: string;
  total: string;
  expiryDate: string;
}

const getLabel = (name?: string) => {
  if (!name) return "";
  if (name.split(".").length !== 1) return name.split(".")[0];
  return name;
};

export const EnsNameRegistrationForm = (props: EnsNameRegistrationFormProps) => {
  const [label, setLabel] = useState<string>(getLabel(props.name));
  const [step, setStep] = useState<RegistrationSteps>(RegistrationSteps.Summary);
  const [durationSeconds, setDurationSeconds] = useState(ONE_YEAR);
  const [regTxFees, setRegTxFees] = useState<{
    isChecking: boolean;
    estimatedGas: number;
    price: { wei: bigint; eth: number };
  }>({
    estimatedGas: 0,
    isChecking: false,
    price: { wei: 0n, eth: 0.0001 },
  });
  const [price, setPrice] = useState<{
    isChecking: boolean;
    wei: bigint;
    eth: number;
  }>({ isChecking: false, wei: 0n, eth: 0 });
  const [nameValidation, setNameValidation] = useState<{
    isChecking: boolean;
    isTaken: boolean;
    reason?: string;
  }>({ isChecking: false, isTaken: false });
  const [showProfile, setShowProfile] = useState(false);
  const [ensRecordTemplate, setEnsRecordsTemplate] = useState<EnsRecords>({
    addresses: [],
    texts: [],
  });
  const [ensRecords, setEnsRecords] = useState<EnsRecords>({
    addresses: [],
    texts: [],
  });

  const hasRecordsDifference = useMemo(
    () => getEnsRecordsDiff(ensRecords, ensRecordTemplate).isDifferent,
    [ensRecords, ensRecordTemplate]
  );

  const [successData, setSuccessData] = useState<RegistrationSuccessData | null>();

  const handleSaveRecords = () => {
    setEnsRecords(deepCopy(ensRecordTemplate));
    setShowProfile(false);
  };

  const handleCancelRecords = () => {
    setEnsRecordsTemplate(deepCopy(ensRecords));
    setShowProfile(false);
  };

  const clearInputState = () => {
    setLabel("");
    setDurationSeconds(ONE_YEAR);
    setEnsRecords({ addresses: [], texts: [] });
    setEnsRecordsTemplate({ addresses: [], texts: [] });
    setNameValidation({ isChecking: false, isTaken: false });
    setPrice({ isChecking: false, wei: 0n, eth: 0 });
  };

  return (
    <div
      className={`ens-registration-form-container ${props.className || ""} ${props.noBorder ? "no-border" : ""}`}
    >
      {step === RegistrationSteps.Summary && (
        <>
          {showProfile && (
            <SetNameRecords
              records={ensRecordTemplate}
              onRecordsChange={setEnsRecordsTemplate}
              onCancel={handleCancelRecords}
              onSave={handleSaveRecords}
              hasChanges={hasRecordsDifference}
              avatarUpload={
                label
                  ? {
                      ensName: `${label}.eth`,
                      isTestnet: props.isTestnet,
                      siweDomain: props.avatarUploadDomain,
                    }
                  : undefined
              }
            />
          )}
          {!showProfile && (
            <RegistrationSummary
              label={label}
              durationSeconds={durationSeconds}
              price={price}
              nameValidation={nameValidation}
              isTestnet={props.isTestnet || false}
              transactionFees={regTxFees}
              title={props.title}
              subtitle={props.subtitle}
              bannerImage={props.bannerImage}
              hideBanner={props.hideBanner}
              bannerWidth={props.bannerWidth}
              onLabelChange={setLabel}
              onDurationChange={setDurationSeconds}
              onPriceChange={setPrice}
              onNameValidationChange={setNameValidation}
              onSetProfile={() => setShowProfile(true)}
              onStart={() => setStep(RegistrationSteps.Progress)}
              onConnectWallet={props.onConnectWallet}
            />
          )}
        </>
      )}
      {step === RegistrationSteps.Progress && (
        <RegistrationProcess
          isTestnet={props.isTestnet || false}
          label={label}
          durationInSeconds={durationSeconds}
          records={ensRecords}
          onBack={(clearState?: boolean) => {
            if (clearState) clearInputState();
            setStep(RegistrationSteps.Summary);
          }}
          onStart={props.onRegistrationStart}
          onSuccess={(data: RegistrationSuccessData) => {
            setSuccessData(data);
            props.onRegistrationSuccess?.(data);
            setStep(RegistrationSteps.Success);
          }}
        />
      )}
      {step === RegistrationSteps.Success && successData && (
        <SuccessScreen
          ensName={label}
          durationLabel={successData.durationLabel}
          registrationCost={successData.registrationCost}
          transactionFees={successData.transactionFees}
          total={successData.total}
          expiryDate={successData.expiryDate}
          isTestnet={props.isTestnet || false}
          onGreat={() => props.onClose?.(true)}
          onRegisterAnother={() => {
            clearInputState();
            setSuccessData(null);
            setStep(RegistrationSteps.Summary);
          }}
        />
      )}
    </div>
  );
};
```

- [ ] **Step 2: Replace `RegistrationProcess.tsx`**

```tsx
import React, { useEffect, useState } from "react";
import ninjaImage from "../../assets/banner.png";
import "./RegistrationProcess.css";
import { Alert } from "../molecules/alert/Alert";
import { Modal } from "../molecules/modal/Modal";
import { Button, Text, Icon } from "../atoms";
import { useAccount, useSwitchChain } from "wagmi";
import { mainnet, sepolia } from "viem/chains";
import { EnsRecords } from "@/types";
import {
  ProcessSteps,
  RegistrationState,
  CommitmentStep,
  TimerStep,
  RegistrationStep,
} from "./registration";
import { generateEnsRegistrationSecret } from "./ensRegistrationUtils";
import { Address } from "viem";

interface RegistrationSuccessData {
  durationLabel: string;
  registrationCost: string;
  transactionFees: string;
  total: string;
  expiryDate: string;
}

interface RegistrationProcessProps {
  label: string;
  durationInSeconds: number;
  isTestnet: boolean;
  records: EnsRecords;
  onBack?: (clearState?: boolean) => void;
  onSuccess?: (data: RegistrationSuccessData) => void;
  onStart?: (hash: string) => void;
  referrer?: Address;
}

const getBlankRegistrationState = (
  label: string,
  durationInSeconds: number,
  records: EnsRecords,
  isTestnet: boolean,
  referrer?: Address
): RegistrationState => ({
  step: ProcessSteps.Start,
  label,
  commitment: { completed: false, time: 0 },
  registration: { completed: false },
  timerStartedAt: 0,
  durationInSeconds,
  secret: generateEnsRegistrationSecret(),
  records,
  isTestnet,
  referrer,
});

export const RegistrationProcess: React.FC<RegistrationProcessProps> = ({
  label,
  durationInSeconds,
  isTestnet = false,
  records,
  onBack,
  onSuccess,
  onStart,
  referrer,
}) => {
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();

  const expectedChainId = isTestnet ? sepolia.id : mainnet.id;
  const isOnCorrectNetwork = chain?.id === expectedChainId;
  const shouldSwitchNetwork = chain && !isOnCorrectNetwork;

  const [registrationState, setRegistrationState] = useState<RegistrationState>(
    getBlankRegistrationState(label, durationInSeconds, records, isTestnet, referrer)
  );
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  useEffect(() => {
    setRegistrationState((prev) => ({ ...prev, records }));
  }, [records]);

  const handleSwitchNetwork = () => {
    if (switchChain) switchChain({ chainId: expectedChainId });
  };

  const handleTimerPassed = () => {
    setRegistrationState((prev) => ({ ...prev, step: ProcessSteps.TimerCompleted }));
  };

  const networkName = isTestnet ? "Sepolia" : "Mainnet";

  const handleCloseClick = () => {
    if (
      registrationState.step > ProcessSteps.Start &&
      registrationState.step < ProcessSteps.RegistrationCompleted
    ) {
      setShowConfirmClose(true);
    } else {
      onBack?.();
    }
  };

  return (
    <div className="ens-registration-progress">
      <button
        className="ens-registration-close-btn"
        onClick={handleCloseClick}
        type="button"
        aria-label="Close"
      >
        <Icon name="chevron-left" size={16} />
      </button>
      <div className="d-flex justify-content-center">
        <img style={{ width: "250px", margin: "auto" }} src={ninjaImage} alt="Ninja Image" />
      </div>
      <div className="ns-text-center mt-2 mb-2">
        <Text size="lg" weight="medium">
          ENS Registration Process
        </Text>
        <Text size="xs" color="grey">
          Registration Consists of 3 Steps
        </Text>
      </div>

      {shouldSwitchNetwork && (
        <div className="mt-2">
          <Alert variant="warning" title="Wrong Network">
            <div className="d-flex flex-column align-items-center">
              <Text size="sm" className="mb-2">
                Please switch to {networkName} to continue with the registration process.
              </Text>
              <Button onClick={handleSwitchNetwork} size="md">
                Switch to {networkName}
              </Button>
            </div>
          </Alert>
        </div>
      )}

      {isOnCorrectNetwork && (
        <>
          <div className="mt-2">
            <CommitmentStep
              state={registrationState}
              isTestnet={isTestnet}
              onStateUpdated={(state) => {
                if (state.step === ProcessSteps.CommitmentSent) {
                  onStart?.(`${state.label}.eth`);
                }
                setRegistrationState(state);
              }}
            />
          </div>
          <div className="mt-2">
            <TimerStep
              state={registrationState}
              onTimerCompleted={handleTimerPassed}
            />
          </div>
          <div className="mt-2">
            <RegistrationStep
              state={registrationState}
              isTestnet={isTestnet}
              onStateUpdated={setRegistrationState}
              onSuccess={onSuccess}
            />
          </div>
        </>
      )}

      <Modal
        isOpen={showConfirmClose}
        onClose={() => setShowConfirmClose(false)}
        title="Leave Registration?"
        size="sm"
        footer={
          <div style={{ display: "flex", gap: 8, width: "100%" }}>
            <Button variant="outline" onClick={() => setShowConfirmClose(false)} style={{ flex: 1 }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => { setShowConfirmClose(false); onBack?.(true); }}
              style={{ flex: 1 }}
            >
              Leave
            </Button>
          </div>
        }
      >
        <Text size="sm">
          If you leave now, you will lose all your registration progress. Are you sure you want to
          continue?
        </Text>
      </Modal>
    </div>
  );
};
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/happy/Documents/Work/Namespace/Main/uikit
pnpm --filter @thenamespace/ens-components exec tsc --noEmit
```

Expected: errors in `CommitmentStep.tsx` and `RegistrationStep.tsx` (still use `expiryInYears`). Fixed in Task 7.

- [ ] **Step 4: Commit**

```bash
git add packages/components/src/components/ens-name-registration/ENSNameRegistrationForm.tsx packages/components/src/components/ens-name-registration/RegistrationProcess.tsx
git commit -m "feat: update ENSNameRegistrationForm and RegistrationProcess to use durationInSeconds"
```

---

## Task 7: Update CommitmentStep, RegistrationStep, and SuccessScreen

**Files:**
- Modify: `packages/components/src/components/ens-name-registration/registration/CommitmentStep.tsx`
- Modify: `packages/components/src/components/ens-name-registration/registration/RegistrationStep.tsx`
- Modify: `packages/components/src/components/ens-name-registration/registration/SuccessScreen.tsx`

- [ ] **Step 1: Update `CommitmentStep.tsx`**

In the `handleCommitment` function, change the `RegistrationRequest` object (lines 65-72):

```tsx
const request: RegistrationRequest = {
  label: state.label,
  owner: address!,
  durationInSeconds: state.durationInSeconds,
  secret: state.secret,
  records: state.records,
  referrer: state.referrer,
};
```

- [ ] **Step 2: Replace `RegistrationStep.tsx`**

```tsx
import React, { useMemo, useState } from "react";
import { Button, Text, Icon } from "../../atoms";
import { ProcessSteps, RegistrationState } from "./types";
import {
  RegistrationRequest,
  useRegisterENS,
  useWaitTransaction,
} from "@/hooks";
import { ContractFunctionExecutionError, Hash, formatEther } from "viem";
import {
  ContractErrorLabel,
  Accordion,
  isUserDeniedError,
} from "../../molecules";
import { useAccount } from "wagmi";
import { TransactionPendingScreen } from "./TransactionPendingScreen";
import { formatFloat } from "@/utils";
import { formatDurationSummary } from "@/utils/date";
import { EnsRecords } from "@/types";

export interface RegistrationSuccessData {
  durationLabel: string;
  registrationCost: string;
  transactionFees: string;
  total: string;
  expiryDate: string;
  thHash: string;
  name: string;
  records: EnsRecords;
}

interface RegistrationStepProps {
  state: RegistrationState;
  isTestnet: boolean;
  onStateUpdated: (state: RegistrationState) => void;
  onSuccess?: (data: RegistrationSuccessData) => void;
}

export const RegistrationStep: React.FC<RegistrationStepProps> = ({
  state,
  isTestnet,
  onStateUpdated,
  onSuccess,
}) => {
  const [btnState, setBtnState] = useState({ waitingWallet: false, waitingTx: false });
  const { address } = useAccount();
  const { waitTx } = useWaitTransaction({ isTestnet });
  const [error, setError] = useState<ContractFunctionExecutionError | null>(null);
  const [commitTxStatus, setCommitTxStatus] = useState({ sent: false, completed: false, hash: "" });

  const { sendRegisterTx, getRegistrationPrice } = useRegisterENS({ isTestnet });

  const handleRegistration = async () => {
    setError(null);
    let tx: Hash | null = null;
    let registrationPrice = 0;

    try {
      setBtnState({ waitingWallet: true, waitingTx: false });

      const request: RegistrationRequest = {
        label: state.label,
        owner: address!,
        durationInSeconds: state.durationInSeconds,
        secret: state.secret,
        records: state.records,
        referrer: state.referrer,
      };

      const regData = await sendRegisterTx(request);
      tx = regData.txHash;
      registrationPrice = formatFloat(regData.price.eth, 5);
      setCommitTxStatus({ sent: true, completed: false, hash: tx });

      onStateUpdated({
        ...state,
        step: ProcessSteps.RegistrationSent,
        commitment: { tx, completed: false, time: 0 },
      });

      setBtnState({ waitingTx: true, waitingWallet: false });
    } catch (err: any) {
      console.error(err);
      if (err instanceof ContractFunctionExecutionError && !isUserDeniedError(err)) {
        setError(err);
      } else if (!isUserDeniedError(err)) {
        setError(new Error(err?.shortMessage || err?.message || "Transaction failed") as ContractFunctionExecutionError);
      }
    } finally {
      setBtnState({ waitingTx: false, waitingWallet: false });
    }

    if (!tx) return;

    try {
      const receipt = await waitTx({ hash: tx });

      setCommitTxStatus({ sent: true, completed: true, hash: tx });

      const gasUsed = receipt.gasUsed;
      const gasPrice = receipt.effectiveGasPrice || BigInt(0);
      const transactionFeesEth = formatEther(gasUsed * gasPrice);
      const totalCost = (registrationPrice + parseFloat(transactionFeesEth)).toString();

      const expiryDate = new Date(Date.now() + state.durationInSeconds * 1000);
      const formattedExpiryDate = expiryDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      setTimeout(() => {
        onStateUpdated({
          ...state,
          step: ProcessSteps.RegistrationCompleted,
          commitment: { tx, completed: true, time: Date.now() },
        });
        setCommitTxStatus({ sent: false, completed: false, hash: "" });
        onSuccess?.({
          durationLabel: formatDurationSummary(state.durationInSeconds),
          registrationCost: registrationPrice.toString(),
          transactionFees: transactionFeesEth,
          total: totalCost,
          expiryDate: formattedExpiryDate,
          thHash: tx!,
          name: `${state.label}.eth`,
          records: state.records,
        });
      }, 1000);
    } catch (err) {
      console.error(err);
      setCommitTxStatus({ sent: false, completed: false, hash: "" });
    }
  };

  const { isCurrentStep, isDisabled, isPending, isCompleted } = useMemo(() => {
    const isPending = state.step < ProcessSteps.TimerCompleted;
    const isCurrentStep =
      state.step >= ProcessSteps.TimerCompleted &&
      state.step < ProcessSteps.RegistrationCompleted;
    const isCompleted = state.step >= ProcessSteps.RegistrationCompleted;
    const isDisabled = state.step < ProcessSteps.TimerCompleted;
    return { isCurrentStep, isDisabled, isPending, isCompleted };
  }, [state]);

  const getProgressStatusBadge = () => {
    if (isCurrentStep) {
      return (
        <div className="ns-process-badge me-2">
          <Text color="white" weight="bold" size="sm">3</Text>
        </div>
      );
    } else if (isCompleted) {
      return (
        <div className="ns-process-badge ns-process-badge--inactive ns-process-badge--completed me-2">
          <Icon name="check" size={16} color="black" />
        </div>
      );
    }
    return (
      <div className="ns-process-badge ns-process-badge--inactive me-2">
        <Text color="primary" weight="bold" size="sm">3</Text>
      </div>
    );
  };

  const btnDisabled = btnState.waitingTx || btnState.waitingWallet;
  const btnLabel = btnState.waitingWallet ? "Waiting Wallet..." : "Open Wallet";

  return (
    <Accordion
      togglable={isCurrentStep}
      disabled={isDisabled}
      isOpen={isCurrentStep}
      title={
        <div className="d-flex align-items-center">
          {getProgressStatusBadge()}
          <Text size="sm" weight="medium">Complete Registration</Text>
        </div>
      }
    >
      {!commitTxStatus.sent && (
        <div className="ns-text-center">
          <Text weight="medium" className="mb-2">Register Name</Text>
          <Text size="xs" color="grey">
            Your name is not registered until you've completed the second transaction. You have 23
            hours remaining to complete it.
          </Text>
          <Button disabled={btnDisabled} onClick={handleRegistration} className="mt-3 ns-wd-100">
            {btnLabel}
          </Button>
          <ContractErrorLabel error={error} />
        </div>
      )}
      {commitTxStatus.sent && (
        <TransactionPendingScreen
          isTestnet={isTestnet}
          message="Your transaction has been sent! Once the progress bar completes, your registration will be confirmed."
          hash={commitTxStatus.hash as Hash}
          isCompleted={commitTxStatus.completed}
        />
      )}
    </Accordion>
  );
};
```

- [ ] **Step 3: Replace `SuccessScreen.tsx`**

```tsx
import React, { useState, useEffect, useRef } from "react";
import Confetti from "react-confetti";
import finishLogo from "../../../assets/finish.png";
import { Button, Text } from "../../atoms";
import { getEnsAppUrl } from "@/utils";
import "./SuccessScreen.css";

interface SuccessScreenProps {
  ensName: string;
  durationLabel: string;
  registrationCost: string;
  transactionFees: string;
  total: string;
  expiryDate: string;
  isTestnet?: boolean;
  onGreat?: () => void;
  onRegisterAnother: () => void;
  onViewName?: () => void;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({
  ensName,
  durationLabel,
  registrationCost,
  transactionFees,
  total,
  expiryDate,
  isTestnet = false,
  onGreat,
  onRegisterAnother,
  onViewName,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div
      ref={containerRef}
      className="ens-registration-success-container"
      style={{ position: "relative", overflow: "hidden", padding: "10px" }}
    >
      {containerSize.width > 0 && containerSize.height > 0 && (
        <Confetti
          width={containerSize.width}
          height={containerSize.height}
          style={{ position: "absolute", top: 0, left: 0, zIndex: 0, pointerEvents: "none" }}
        />
      )}

      <div className="ens-registration-success-card" style={{ position: "relative", zIndex: 1 }}>
        <div className="ens-registration-success-illustration">
          <img src={finishLogo} alt="Success Illustration" />
        </div>

        <div className="ens-registration-success-title-section">
          <Text size="sm" color="grey" className="mb-2">
            Hooray! You've registered
          </Text>
          <Text size="lg" weight="bold">
            {ensName}.eth
          </Text>
        </div>

        <div className="ens-registration-success-summary">
          <div className="ens-registration-success-summary-row">
            <Text size="sm" color="grey">{durationLabel} registration</Text>
            <Text size="sm" color="grey">{parseFloat(registrationCost).toFixed(4)} ETH</Text>
          </div>
          <div className="ens-registration-success-summary-row">
            <Text size="sm" color="grey">Transaction fees</Text>
            <Text size="sm" color="grey">{parseFloat(transactionFees).toFixed(4)} ETH</Text>
          </div>
          <div className="ens-registration-success-summary-row ens-registration-success-total">
            <Text size="lg" weight="bold">Total</Text>
            <div className="ens-registration-success-total-amount">
              <Text size="lg" weight="bold">{parseFloat(total).toFixed(4)} ETH</Text>
            </div>
          </div>
          <div className="ens-registration-success-summary-row ens-registration-success-expiry">
            <Text size="sm" color="grey">Name Expires</Text>
            <Text size="sm" color="grey">{expiryDate}</Text>
          </div>
        </div>

        <div className="ens-registration-success-actions">
          <Button
            variant="outline"
            onClick={onRegisterAnother}
            className="ens-registration-success-register-another-btn"
          >
            Register another
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (onViewName) {
                onViewName();
              } else {
                window.open(getEnsAppUrl(`${ensName}.eth`, isTestnet), "_blank", "noopener,noreferrer");
              }
            }}
            className="ens-registration-success-view-name-btn"
          >
            View Name
          </Button>
        </div>
        <Button onClick={() => onGreat?.()} size="lg" className="ns-wd-100 mt-2">
          Great!
        </Button>
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Verify TypeScript compiles with zero errors**

```bash
cd /Users/happy/Documents/Work/Namespace/Main/uikit
pnpm --filter @thenamespace/ens-components exec tsc --noEmit
```

Expected: **no errors**.

- [ ] **Step 5: Commit**

```bash
git add packages/components/src/components/ens-name-registration/registration/CommitmentStep.tsx packages/components/src/components/ens-name-registration/registration/RegistrationStep.tsx packages/components/src/components/ens-name-registration/registration/SuccessScreen.tsx
git commit -m "feat: update CommitmentStep, RegistrationStep, SuccessScreen to use durationInSeconds"
```

---

## Task 8: Build and verify in Storybook

**Files:**
- No code changes — verification only

- [ ] **Step 1: Build the components package**

```bash
cd /Users/happy/Documents/Work/Namespace/Main/uikit
pnpm --filter @thenamespace/ens-components build
```

Expected: build succeeds with no errors.

- [ ] **Step 2: Start Storybook**

```bash
pnpm --filter storybook dev
```

- [ ] **Step 3: Open Storybook and test the registration form**

Open `http://localhost:6006` and navigate to `Components / EnsNameRegistrationForm / Default`.

Run through these manual checks:

1. **Years mode (default)**: The picker shows `− 1 year(s) +`. Clicking `+` increments, `−` decrements (disabled at 1 year since 1 year = 31,536,000s > 28-day minimum).
2. **"Pick by date" link**: Appears below the picker. Clicking it switches to calendar mode.
3. **Calendar mode**: Shows a formatted date (e.g. "April 27, 2027") and a blue calendar button. The native date picker opens when clicking anywhere on the control or the button.
4. **"Pick by years" link**: Appears below in calendar mode. Clicking it snaps back to nearest whole year.
5. **Price updates**: Changing duration (in either mode) triggers a new `getRegistrationPrice` call and updates the displayed ETH amount.
6. **Footer summary**: Shows "1 year registration." in years mode; shows e.g. "6 months, 3 days registration." in calendar mode after picking a non-year date.
7. **Min date enforced**: In calendar mode, dates before 28 days from today are not selectable.

- [ ] **Step 4: Commit any fixes found during testing**

```bash
git add -p
git commit -m "fix: <describe what was fixed>"
```

---

## Self-Review

### Spec Coverage
- ✅ Toggle between years/date mode — Task 2 `DurationPicker`
- ✅ Default to years mode — `useState<"years" | "date">("years")`
- ✅ 28-day minimum — `MIN_REGISTRATION_SECONDS`, enforced in `DurationPicker` and `handleDurationChange`
- ✅ Calendar mode uses native `<input type="date">` with calendar icon — Task 2
- ✅ Footer summary text + toggle link — `formatDurationSummary` + toggle button
- ✅ Snaps to year on switching from date → years — `handleToggleMode`
- ✅ `expiryInYears` → `durationInSeconds` throughout all layers — Tasks 4–7
- ✅ Contract duration uses seconds directly — `BigInt(request.durationInSeconds)`
- ✅ Expiry date computed from seconds on success — `new Date(Date.now() + state.durationInSeconds * 1000)`
- ✅ `RegistrationSuccessData.expiryInYears` removed, `durationLabel` added — Tasks 6–7
- ✅ `SuccessScreen` shows `durationLabel` — Task 7

### Type Consistency
- `DurationPicker.durationSeconds` matches `PricingDisplay.expiryPicker.durationSeconds` ✅
- `RegistrationSummary.durationSeconds` matches `ENSNameRegistrationForm` state `durationSeconds` ✅
- `RegistrationProcess.durationInSeconds` matches `ENSNameRegistrationForm` pass-through ✅
- `RegistrationState.durationInSeconds` matches what `CommitmentStep`/`RegistrationStep` read ✅
- `RegistrationRequest.durationInSeconds` matches what both commitment steps construct ✅
- `RegistrationSuccessData.durationLabel: string` consistent across `RegistrationStep`, `RegistrationProcess`, `ENSNameRegistrationForm`, `SuccessScreen` ✅
