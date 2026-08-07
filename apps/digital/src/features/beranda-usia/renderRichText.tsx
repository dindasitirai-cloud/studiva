import React from "react";

/**
 * Renders rich text with {anak}/{Anak} interpolation and **bold** support.
 * strongClass is optional — omitting it preserves existing default behavior
 * (no className on <strong>), so TahunPertama.tsx remains unaffected.
 */
export function renderRichText(
  text: string,
  sapaan: { low: string; cap: string },
  strongClass?: string,
): React.ReactNode[] {
  const replaced = text
    .replace(/\{anak\}/g, sapaan.low)
    .replace(/\{Anak\}/g, sapaan.cap);

  const parts = replaced.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className={strongClass}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}
