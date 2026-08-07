import React from "react";

export default function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-label="Logo Rekah lima kelopak"
    >
      <g fill="#F06BA8">
        <path d="M20 21 C14 15 15 7 20 4 C25 7 26 15 20 21Z" />
        <path d="M20 21 C27 17 34 19 35 24 C31 28 23 27 20 21Z" opacity=".85" />
        <path d="M20 21 C25 28 22 35 17 36 C13 32 15 25 20 21Z" opacity=".7" />
        <path d="M20 21 C13 25 6 22 5 17 C9 13 17 15 20 21Z" opacity=".55" />
        <path d="M20 21 C15 16 16 10 19 8 C22 11 22 17 20 21Z" fill="#F8B9D4" />
      </g>
    </svg>
  );
}
