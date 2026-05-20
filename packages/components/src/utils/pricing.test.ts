import { describe, expect, it } from "vitest";
import { computeUsd, formatEth, isSentinel, usdFromWei } from "./pricing";

describe("isSentinel", () => {
  it("recognises 'Free' and 'N/A'", () => {
    expect(isSentinel("Free")).toBe(true);
    expect(isSentinel("N/A")).toBe(true);
  });

  it("rejects everything else", () => {
    expect(isSentinel("0.0000")).toBe(false);
    expect(isSentinel("0.0001 ETH")).toBe(false);
    expect(isSentinel(0)).toBe(false);
    expect(isSentinel(0.5)).toBe(false);
  });
});

describe("formatEth", () => {
  it("returns 0.0000 for zero, negative, NaN, and infinity", () => {
    expect(formatEth(0)).toBe("0.0000");
    expect(formatEth(-1)).toBe("0.0000");
    expect(formatEth(NaN)).toBe("0.0000");
    expect(formatEth(Infinity)).toBe("0.0000");
  });

  it("formats normal values to 4 decimals", () => {
    expect(formatEth(0.0001)).toBe("0.0001");
    expect(formatEth(0.005)).toBe("0.0050");
    expect(formatEth(1.23456789)).toBe("1.2346");
  });

  // The reason this util exists: a non-zero fee smaller than 0.0001 ETH
  // must not display as "0.0000" (looks free) and must not display as
  // "0.0001" (implies an exact figure that disagrees with the wei-derived
  // USD subtitle). It should render as "<0.0001".
  it("renders sub-threshold positive values as '<0.0001'", () => {
    expect(formatEth(0.000033)).toBe("<0.0001");
    expect(formatEth(0.00009999)).toBe("<0.0001");
    expect(formatEth(1e-9)).toBe("<0.0001");
  });
});

describe("usdFromWei", () => {
  it("converts wei to USD at the given ETH/USD rate", () => {
    // 1 ETH at $3000
    expect(usdFromWei(10n ** 18n, 3000)).toBeCloseTo(3000, 6);
    // 0.5 ETH at $2000
    expect(usdFromWei(5n * 10n ** 17n, 2000)).toBeCloseTo(1000, 6);
  });

  it("handles tiny wei values exactly", () => {
    // 33_000_000_000_000 wei = 0.000033 ETH at $3000 ≈ $0.099
    expect(usdFromWei(33_000_000_000_000n, 3000)).toBeCloseTo(0.099, 6);
  });
});

describe("computeUsd", () => {
  const rate = 3000;

  it("returns null when rate is missing", () => {
    expect(computeUsd("1.0000", undefined, null, false)).toBeNull();
    expect(computeUsd("1.0000", undefined, undefined, false)).toBeNull();
    expect(computeUsd("1.0000", undefined, 0, false)).toBeNull();
  });

  it("returns null while loading", () => {
    expect(computeUsd("1.0000", 10n ** 18n, rate, true)).toBeNull();
  });

  it("returns null for 'Free' and 'N/A' sentinels", () => {
    expect(computeUsd("Free", undefined, rate, false)).toBeNull();
    expect(computeUsd("N/A", undefined, rate, false)).toBeNull();
  });

  it("prefers the wei path when weiAmount is positive", () => {
    // 0.000033 ETH worth of wei → ~$0.10 even though the display string
    // is the rounded "0.0001" — this is the whole point of carrying wei.
    const wei = 33_000_000_000_000n;
    expect(computeUsd("0.0001", wei, rate, false)).toBe("0.10");
  });

  it("falls back to parsing the display string when wei is absent", () => {
    expect(computeUsd("0.5000", undefined, rate, false)).toBe("1500.00");
  });

  it("strips a leading '~' heuristic marker in the fallback path", () => {
    expect(computeUsd("~0.5000", undefined, rate, false)).toBe("1500.00");
  });

  // Once formatEth renders sub-threshold values as "<0.0001", the fallback
  // parser must not return a misleading USD figure derived from the digits
  // alone. Without a wei value it cannot recover the true amount, so the
  // correct behaviour is to return null and show no subtitle.
  it("returns null for the '<0.0001' display string when no wei is given", () => {
    expect(computeUsd("<0.0001", undefined, rate, false)).toBeNull();
  });

  it("returns null when wei is zero (treats as no value)", () => {
    // 0n wei → falls through to fallback; "0.0000" parses to 0 → null.
    expect(computeUsd("0.0000", 0n, rate, false)).toBeNull();
  });

  it("returns null for unparseable strings", () => {
    expect(computeUsd("", undefined, rate, false)).toBeNull();
    expect(computeUsd("abc", undefined, rate, false)).toBeNull();
  });
});
