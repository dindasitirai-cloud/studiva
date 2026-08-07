import React from "react";

const PATHS = [
  "M20 21 C14 15 15 7 20 4 C25 7 26 15 20 21Z",
  "M20 21 C27 17 34 19 35 24 C31 28 23 27 20 21Z",
  "M20 21 C25 28 22 35 17 36 C13 32 15 25 20 21Z",
  "M20 21 C13 25 6 22 5 17 C9 13 17 15 20 21Z",
];
const OPACITIES = [1, 0.85, 0.7, 0.55];
const ROSE = "#F06BA8";
const EMPTY = "#F8B9D4";

interface Props {
  filled: number;
}

export default function BloomNode({ filled }: Props) {
  return (
    <svg width="64" height="64" viewBox="0 0 40 40" aria-hidden>
      <g>
        {PATHS.map((d, i) => (
          <path
            key={i}
            d={d}
            fill={i < filled ? ROSE : EMPTY}
            opacity={i < filled ? OPACITIES[i] : 1}
          />
        ))}
      </g>
    </svg>
  );
}
