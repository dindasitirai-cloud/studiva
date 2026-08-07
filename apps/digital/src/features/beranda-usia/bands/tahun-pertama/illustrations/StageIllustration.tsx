import React from "react";
import { PALETTE, SKIN, HAIR } from "../palette";
import type { Stage } from "../content";

type Variant = "perempuan" | "laki-laki" | "netral";

interface Props {
  type: Stage["illustration"];
  variant: Variant;
}

export default function StageIllustration({ type, variant }: Props) {
  const p = PALETTE[variant];

  if (type === "tummyTime") {
    return (
      <svg
        viewBox="0 0 300 210"
        width="100%"
        height="auto"
        aria-label="Ilustrasi bayi tummy time mengangkat kepala"
        style={{ display: "block" }}
      >
        <rect x="0" y="0" width="300" height="210" rx="18" fill="#FFF3E6" />
        <ellipse cx="150" cy="178" rx="120" ry="14" fill="#F8B9D4" />
        <ellipse cx="150" cy="170" rx="110" ry="20" fill={p.outfit} opacity=".35" />
        <path
          d="M95 160 Q140 138 200 152 Q210 156 206 166 Q150 176 98 170 Q88 166 95 160Z"
          fill={p.outfit}
        />
        <circle cx="215" cy="138" r="26" fill={SKIN} />
        <path
          d="M193 130 Q196 112 215 111 Q233 112 237 130 Q228 119 215 119 Q201 119 193 130Z"
          fill={HAIR}
        />
        <circle cx="210" cy="138" r="3" fill="#3D2B2E" />
        <circle cx="224" cy="138" r="3" fill="#3D2B2E" />
        <path
          d="M211 149 Q217 153 223 149"
          stroke="#3D2B2E"
          strokeWidth="2.6"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="203" cy="146" r="4" fill="#F0A3B0" opacity=".6" />
        {p.showBow && (
          <g>
            <path d="M209 110 l-7 -6 l1 9Z M215 110 l7 -6 l-1 9Z" fill="#F06BA8" />
            <circle cx="212" cy="110" r="3" fill="#E05898" />
          </g>
        )}
        <path
          d="M190 156 Q186 168 178 170"
          stroke={SKIN}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M100 162 Q88 150 92 142"
          stroke={SKIN}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="250" cy="168" r="10" fill="#E8B04B" />
        <rect x="247" y="176" width="6" height="14" rx="3" fill="#E05898" />
        <path
          d="M255 120 q8 -6 4 -14 M262 126 q12 -9 6 -21"
          stroke="#F06BA8"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
          opacity=".6"
        />
      </svg>
    );
  }

  if (type === "sitReach") {
    return (
      <svg
        viewBox="0 0 300 210"
        width="100%"
        height="auto"
        aria-label="Ilustrasi bayi duduk meraih mainan"
        style={{ display: "block" }}
      >
        <rect width="300" height="210" rx="18" fill="#FFF3E6" />
        <ellipse cx="150" cy="180" rx="120" ry="14" fill="#F8B9D4" />
        <ellipse cx="150" cy="168" rx="66" ry="18" fill={p.outfit} opacity=".3" />
        <path
          d="M118 168 Q118 120 150 116 Q182 120 182 168 Q166 178 150 178 Q134 178 118 168Z"
          fill={p.outfit}
        />
        <circle cx="150" cy="96" r="30" fill={SKIN} />
        <path
          d="M124 88 Q128 66 150 65 Q172 66 176 88 Q166 74 150 74 Q134 74 124 88Z"
          fill={HAIR}
        />
        <circle cx="142" cy="96" r="3.2" fill="#3D2B2E" />
        <circle cx="158" cy="96" r="3.2" fill="#3D2B2E" />
        <path
          d="M143 108 Q150 114 157 108"
          stroke="#3D2B2E"
          strokeWidth="2.6"
          fill="none"
          strokeLinecap="round"
        />
        {p.showBow && (
          <g>
            <path d="M144 64 l-8 -6 l2 10Z M151 64 l8 -6 l-2 10Z" fill="#F06BA8" />
            <circle cx="147" cy="64" r="3.2" fill="#E05898" />
          </g>
        )}
        <path
          d="M176 132 Q205 128 222 140"
          stroke={SKIN}
          strokeWidth="11"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M124 132 Q108 140 106 152"
          stroke={SKIN}
          strokeWidth="11"
          fill="none"
          strokeLinecap="round"
        />
        <rect x="222" y="140" width="22" height="22" rx="5" fill="#E8B04B" />
        <rect x="238" y="158" width="20" height="20" rx="5" fill="#8FB8A8" />
        <text
          x="190"
          y="66"
          fontFamily="Caveat, cursive"
          fontSize="18"
          fill="#E05898"
        >
          baba!
        </text>
      </svg>
    );
  }

  if (type === "crawl") {
    return (
      <svg
        viewBox="0 0 300 210"
        width="100%"
        height="auto"
        aria-label="Ilustrasi bayi merangkak mengejar bola"
        style={{ display: "block" }}
      >
        <rect width="300" height="210" rx="18" fill="#FFF3E6" />
        <ellipse cx="150" cy="182" rx="122" ry="13" fill="#F8B9D4" />
        <path
          d="M110 150 Q118 118 160 120 Q196 124 198 150 Q196 162 184 164 L124 164 Q110 162 110 150Z"
          fill={p.outfit}
        />
        <path
          d="M120 158 L114 176"
          stroke={SKIN}
          strokeWidth="11"
          strokeLinecap="round"
        />
        <path
          d="M182 158 L188 176"
          stroke={SKIN}
          strokeWidth="11"
          strokeLinecap="round"
        />
        <path
          d="M150 164 Q146 176 138 178"
          stroke={p.outfitDeep}
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="212" cy="122" r="28" fill={SKIN} />
        <path
          d="M188 114 Q192 94 212 93 Q232 94 236 114 Q226 101 212 101 Q198 101 188 114Z"
          fill={HAIR}
        />
        <circle cx="206" cy="122" r="3" fill="#3D2B2E" />
        <circle cx="221" cy="122" r="3" fill="#3D2B2E" />
        <path
          d="M207 133 Q213 138 219 133"
          stroke="#3D2B2E"
          strokeWidth="2.6"
          fill="none"
          strokeLinecap="round"
        />
        {p.showBow && (
          <g>
            <path d="M206 92 l-8 -6 l2 10Z M213 92 l8 -6 l-2 10Z" fill="#F06BA8" />
            <circle cx="209" cy="92" r="3" fill="#E05898" />
          </g>
        )}
        <circle cx="262" cy="168" r="16" fill="#F06BA8" />
        <path
          d="M250 162 Q262 156 274 162"
          stroke="#FFF3E6"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M96 140 h-14 M100 152 h-18"
          stroke="#F0A3B0"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // stand
  return (
    <svg
      viewBox="0 0 300 210"
      width="100%"
      height="auto"
      aria-label="Ilustrasi bayi berdiri berpegangan dan melangkah ke tangan orang tua"
      style={{ display: "block" }}
    >
      <rect width="300" height="210" rx="18" fill="#FFF3E6" />
      <ellipse cx="150" cy="184" rx="122" ry="13" fill="#F8B9D4" />
      <path d="M258 90 Q270 96 268 112 Q260 122 250 116" fill={SKIN} opacity=".9" />
      <rect x="30" y="96" width="70" height="74" rx="14" fill="#F0A3B0" opacity=".5" />
      <path
        d="M138 108 Q138 96 158 96 Q178 96 178 108 L176 152 Q158 158 140 152 Z"
        fill={p.outfit}
      />
      <circle cx="158" cy="76" r="27" fill={SKIN} />
      <path
        d="M135 68 Q139 49 158 48 Q177 49 181 68 Q171 56 158 56 Q145 56 135 68Z"
        fill={HAIR}
      />
      <circle cx="151" cy="76" r="3" fill="#3D2B2E" />
      <circle cx="166" cy="76" r="3" fill="#3D2B2E" />
      <path
        d="M151 87 Q158 92 165 87"
        stroke="#3D2B2E"
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
      />
      {p.showBow && (
        <g>
          <path d="M152 47 l-8 -6 l2 10Z M159 47 l8 -6 l-2 10Z" fill="#F06BA8" />
          <circle cx="155" cy="47" r="3" fill="#E05898" />
        </g>
      )}
      <path
        d="M140 116 Q118 112 102 112"
        stroke={SKIN}
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M176 114 Q216 100 250 108"
        stroke={SKIN}
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M148 152 L146 182"
        stroke={SKIN}
        strokeWidth="11"
        strokeLinecap="round"
      />
      <path
        d="M168 152 Q176 168 184 174"
        stroke={SKIN}
        strokeWidth="11"
        strokeLinecap="round"
      />
      <path d="M226 44 C220 36 222 26 228 24 C234 28 234 37 226 44Z" fill="#E8B04B" opacity=".8" />
      <path d="M64 48 C58 40 60 30 66 28 C72 32 72 41 64 48Z" fill="#F06BA8" opacity=".5" />
      <text
        x="188"
        y="46"
        fontFamily="Caveat, cursive"
        fontSize="17"
        fill="#E05898"
      >
        mama!
      </text>
    </svg>
  );
}
