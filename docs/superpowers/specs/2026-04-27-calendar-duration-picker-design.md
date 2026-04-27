# Calendar Duration Picker — Design Spec

**Date:** 2026-04-27  
**Status:** Approved  
**Scope:** ENS name registration duration picker — add calendar/date mode alongside existing years mode

---

## Summary

Add a toggle-based duration picker to the ENS registration flow, matching the ENS app v3 UX. Users can register for a duration expressed either as whole years (default) or as a specific calendar end date. Both modes normalise to a `durationInSeconds` value that flows through to the registrar contract unchanged.

---

## Data Model

Replace `expiryInYears: number` with `durationInSeconds: number` as the single duration primitive across the registration stack.

| File | Old | New |
|------|-----|-----|
| `registration/types.ts` — `RegistrationState` | `expiryInYears: number` | `durationInSeconds: number` |
| `RegistrationProcess.tsx` — props | `expiryInYears: number` | `durationInSeconds: number` |
| `ENSNameRegistrationForm.tsx` — state | `years: number` (default 1) | `durationSeconds: number` (default `ONE_YEAR = 31_536_000`) |
| `useRegisterENS.tsx` — `RegistrationRequest` | `expiryInYears: number` | `durationInSeconds: number` |
| `useRegisterENS.tsx` — `getRegistrationPrice` | `(label, expiryInYears)` | `(label, durationInSeconds)` |
| `useRegisterENS.tsx` — `sendCommitmentTx` / `sendRegisterTx` | `yearsToSeconds(request.expiryInYears)` | `request.durationInSeconds` directly |
| `RegistrationStep.tsx` — `RegistrationSuccessData` | `expiryInYears: number` | removed; expiry date computed as `new Date(Date.now() + durationInSeconds * 1000)` |

**Minimum duration:** 28 days = `28 * 86_400 = 2_419_200` seconds. Enforced in `DurationPicker` (UI) and as a constant `MIN_REGISTRATION_SECONDS` exported from utils.

---

## New Utilities (`utils/date.ts`)

Four pure functions, no external dependencies:

```ts
// Seconds from nowSeconds to midnight of the user-selected date (day-aligned)
roundDurationWithDay(valueAsDate: Date, nowSeconds: number): number

// Calendar-aware seconds for N whole years from startDate (handles leap years)
secondsFromYears(startDate: Date, years: number): number

// Human-readable label: "1 year", "6 months 3 days", "28 days", etc.
formatDurationSummary(durationSeconds: number): string

// "YYYY-MM-DD" for <input type="date"> value attribute
secondsToDateInput(expirySeconds: number): string  // expirySeconds = now + duration
```

---

## New Component: `DurationPicker`

**Location:** `components/molecules/duration-picker/DurationPicker.tsx`

### Props

```ts
interface DurationPickerProps {
  durationSeconds: number
  onDurationChange: (seconds: number) => void
  minSeconds?: number  // default MIN_REGISTRATION_SECONDS (28 days)
}
```

### Internal state

```ts
durationType: 'years' | 'date'  // default 'years'
```

### Render — years mode

```
┌─────────────────────────────────────────┐
│  [−]         1 year(s)             [+]  │
└─────────────────────────────────────────┘
  1 year registration.  Pick by date  ←blue link
```

- `−` button disabled when duration would fall below `minSeconds`
- `+` increments by 1 year
- Reuses existing `Button` and `Text` atoms; no new deps

### Render — date mode

```
┌─────────────────────────────────────────┐
│  April 27, 2027                  [📅]   │
└─────────────────────────────────────────┘
  1 year registration.  Pick by years  ←blue link
```

- Styled `<label>` wraps a visually hidden `<input type="date">` (native browser picker, no deps)
- Calendar icon button (SVG inline) in a blue circle on the right, clicking triggers `inputRef.current.showPicker()`
- `min` attribute set to `secondsToDateInput(nowSeconds + minSeconds)`
- On change: `roundDurationWithDay(valueAsDate, nowSeconds)` → `onDurationChange`
- Timezone offset applied to normalise UTC date from the native picker

### Footer text

`formatDurationSummary(durationSeconds) + " registration."` followed by the blue toggle link.  
When `durationSeconds` corresponds to whole years (e.g. exactly 1 year), shows "1 year registration." Otherwise shows "6 months 3 days registration." etc.

### Mode normalisation

When switching from date → years: snap seconds to `secondsFromYears(new Date(), Math.max(1, Math.floor(yearsFromSeconds(durationSeconds))))` so the years picker shows a clean integer.

---

## Modified Component: `PricingDisplay`

`expiryPicker` prop shape changes:

```ts
// Before
expiryPicker?: {
  years: number
  onYearsChange: (years: number) => void
}

// After
expiryPicker?: {
  durationSeconds: number
  onDurationChange: (seconds: number) => void
  minSeconds?: number
}
```

`PricingDisplay` renders `<DurationPicker>` internally when `expiryPicker` is present. The inline `+/−` buttons are removed from `PricingDisplay`.

---

## Modified Component: `RegistrationSummary`

- `years` prop → `durationSeconds: number`
- `onYearsChange` prop → `onDurationChange: (s: number) => void`
- `handleYearsChange` → `handleDurationChange` — debounces `getRegistrationPrice(label, durationSeconds)`
- Passes updated `expiryPicker` shape into `PricingDisplay`

---

## Modified Component: `RegistrationProcess` + `RegistrationState`

- Prop `expiryInYears` → `durationInSeconds`
- `getBlankRegistrationState` updated accordingly
- `RegistrationState.expiryInYears` → `durationInSeconds`

---

## Modified Hook: `useRegisterENS`

- `RegistrationRequest.expiryInYears` → `durationInSeconds`
- `getRegistrationPrice(label, durationInSeconds)`: passes `BigInt(durationInSeconds)` to `rentPrice`
- `makeCommitment` / `sendRegisterTx`: `duration: BigInt(request.durationInSeconds)` (no conversion needed)
- `yearsToSeconds` utility stays (used by `DurationPicker` internally) but removed from the public `RegistrationRequest` interface

---

## Modified: `RegistrationStep` success data

```ts
// Before
expiryDate.setFullYear(expiryDate.getFullYear() + state.expiryInYears)

// After
const expiryDate = new Date(Date.now() + state.durationInSeconds * 1000)
```

`RegistrationSuccessData.expiryInYears` field is removed. Callers relying on it should use `expiryDate` string.

---

## Constants

```ts
// utils/date.ts or constants/index.ts
export const ONE_DAY = 86_400
export const ONE_YEAR = 365 * ONE_DAY          // 31_536_000
export const MIN_REGISTRATION_SECONDS = 28 * ONE_DAY  // 2_419_200
```

---

## What does NOT change

- Contract call structure — `duration` in seconds was always the contract input; now it's just explicit at every layer
- Commit/wait/register flow — unchanged
- `RegistrationProcess` step machine — unchanged
- All other components (success screen, timer, commitment step) — unchanged except the `expiryInYears` → `durationInSeconds` rename where referenced

---

## Out of Scope

- Months granularity in the years picker (years-only, as in ENS app)
- "Extend" mode (existing registrations)
- Gas estimation improvements (already marked TODO in codebase)
