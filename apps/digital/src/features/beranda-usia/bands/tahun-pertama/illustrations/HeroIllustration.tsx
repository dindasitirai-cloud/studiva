import React from "react";
import { PALETTE, SKIN, HAIR } from "../palette";

type Variant = "perempuan" | "laki-laki" | "netral";

export default function HeroIllustration({ variant }: { variant: Variant }) {
  const p = PALETTE[variant];
  return (
    <svg
      viewBox="0 0 320 300"
      width="100%"
      height="auto"
      aria-label="Ilustrasi orang tua menggendong bayi"
      style={{ display: "block" }}
    >
      <ellipse cx="160" cy="270" rx="120" ry="16" fill="#F8B9D4" />
      <path d="M100 270 Q95 170 160 160 Q225 170 220 270 Z" fill="#F06BA8" />
      <circle cx="160" cy="120" r="42" fill={SKIN} />
      <path
        d="M118 112 Q125 68 160 70 Q195 68 202 112 Q200 88 160 86 Q120 88 118 112Z"
        fill={HAIR}
      />
      <circle cx="146" cy="122" r="3.5" fill="#3D2B2E" />
      <circle cx="174" cy="122" r="3.5" fill="#3D2B2E" />
      <path
        d="M150 138 Q160 146 170 138"
        stroke="#3D2B2E"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M104 200 Q130 240 200 232"
        stroke="#F06BA8"
        strokeWidth="26"
        fill="none"
        strokeLinecap="round"
      />
      {/* Baby */}
      <g>
        <ellipse cx="158" cy="216" rx="46" ry="26" fill={p.outfit} />
        <circle cx="118" cy="208" r="22" fill={SKIN} />
        <path
          d="M100 202 Q102 188 118 187 Q133 188 136 202 Q128 193 118 193 Q107 193 100 202Z"
          fill={HAIR}
        />
        <circle cx="112" cy="209" r="2.6" fill="#3D2B2E" />
        <circle cx="124" cy="209" r="2.6" fill="#3D2B2E" />
        <path
          d="M113 218 Q118 222 123 218"
          stroke="#3D2B2E"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
        />
        {p.showBow && (
          <g>
            <path d="M112 186 l-7 -6 l1 9 Z M118 186 l7 -6 l-1 9 Z" fill="#F06BA8" />
            <circle cx="115" cy="186" r="3" fill="#E05898" />
          </g>
        )}
      </g>
      {/* Decorative petals */}
      <path d="M60 70 C54 62 56 52 62 50 C68 54 68 63 60 70Z" fill="#F0A3B0" />
      <path d="M262 96 C256 88 258 78 264 76 C270 80 270 89 262 96Z" fill="#E8B04B" opacity=".7" />
      <path d="M244 40 C238 32 240 22 246 20 C252 24 252 33 244 40Z" fill="#F06BA8" opacity=".5" />
    </svg>
  );
}
