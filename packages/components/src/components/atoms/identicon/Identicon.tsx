import React, { useMemo } from "react";

/**
 * Identicon — a deterministic 8x8 mirrored-grid mark for a name.
 *
 * The design ships this as `img.identicon` carrying an inline data-URI SVG:
 * an 8x8 grid mirrored horizontally, painted from a two-tone blue palette on a
 * pale blue ground, driven by a seeded LCG hash of the seed string.
 *
 * The three palette constants below are the only raw hexes in the library
 * outside the token file: they are baked into the generated SVG, which cannot
 * read CSS custom properties.
 */
const IDENTICON_LIGHT = "#9CCBE8";
const IDENTICON_DARK = "#1E7FBF";
const IDENTICON_GROUND = "#E6F1FA";

const GRID = 8;
const HALF = GRID / 2;

/** FNV-1a over the seed, used to prime the LCG. */
const hashSeed = (seed: string): number => {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

/** Classic 32-bit LCG (Numerical Recipes constants). */
const makeRandom = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

const buildSvg = (seed: string): string => {
  const random = makeRandom(hashSeed(seed));
  const cells: string[] = [];

  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < HALF; x++) {
      const filled = random() > 0.45;
      const fill = random() > 0.5 ? IDENTICON_DARK : IDENTICON_LIGHT;
      if (!filled) {
        continue;
      }
      cells.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${fill}"/>`);
      cells.push(
        `<rect x="${GRID - 1 - x}" y="${y}" width="1" height="1" fill="${fill}"/>`
      );
    }
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${GRID} ${GRID}" shape-rendering="crispEdges">`,
    `<rect width="${GRID}" height="${GRID}" fill="${IDENTICON_GROUND}"/>`,
    cells.join(""),
    "</svg>",
  ].join("");
};

export interface IdenticonProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> {
  /** The string the mark is derived from — typically the full name. */
  seed: string;
  /** Rendered edge length in px. Square by definition. */
  size?: number;
  alt?: string;
  dataTestId?: string;
}

export const Identicon: React.FC<IdenticonProps> = ({
  seed,
  size = 34,
  alt = "",
  className = "",
  style,
  dataTestId,
  ...rest
}) => {
  const src = useMemo(
    () =>
      `data:image/svg+xml;charset=utf-8,${encodeURIComponent(buildSvg(seed))}`,
    [seed]
  );

  const classes = ["ns-identicon", "identicon", className]
    .filter(Boolean)
    .join(" ");

  return (
    <img
      className={classes}
      src={src}
      alt={alt}
      width={size}
      height={size}
      data-test-id={dataTestId}
      style={{
        display: "block",
        flex: "none",
        width: size,
        height: size,
        borderRadius: 0,
        background: "var(--ns-blue-100)",
        ...style,
      }}
      {...rest}
    />
  );
};

export default Identicon;
