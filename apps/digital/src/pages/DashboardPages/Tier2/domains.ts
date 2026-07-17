// ============================================================================
// Studiva Digital — canonical domain configuration (single source of truth).
// Adding a domain means adding one entry here; nothing else needs hardcoding.
// ============================================================================

import {
  Activity, Lightbulb, MessageCircle, Heart,
  Stethoscope, Puzzle, HeartHandshake, LucideIcon,
} from 'lucide-react';

export type DomainCode = "FM" | "KG" | "BH" | "SE" | "KS" | "PS" | "DK";

export interface DomainConfig {
  code: DomainCode;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  bg: string;  // background swatch
  fg: string;  // foreground/text colour
  strictFreshness: boolean; // true → tighter review window (< 9 mo segar, 9–12 menua, ≥ 12 perlu-tinjau)
  sensitiveDisclaimer?: string; // banner text shown on summary + scientific pages
  attentionLabel?: string;      // label for the "Perlu perhatian" block (default used if absent)
}

export const DOMAIN_CONFIGS: DomainConfig[] = [
  {
    code: "FM",
    label: "Fisik & Motorik",
    shortLabel: "Fisik",
    icon: Activity,
    bg: "#FAEEDA",
    fg: "#633806",
    strictFreshness: false,
  },
  {
    code: "KG",
    label: "Kognitif",
    shortLabel: "Kognitif",
    icon: Lightbulb,
    bg: "#F1EFE8",
    fg: "#444441",
    strictFreshness: false,
  },
  {
    code: "BH",
    label: "Bahasa & Komunikasi",
    shortLabel: "Bahasa",
    icon: MessageCircle,
    bg: "#E1F5EE",
    fg: "#0F6E56",
    strictFreshness: false,
  },
  {
    code: "SE",
    label: "Sosial-Emosional",
    shortLabel: "Sosial",
    icon: Heart,
    bg: "#FBEAF0",
    fg: "#72243E",
    strictFreshness: false,
  },
  {
    code: "KS",
    label: "Kesehatan & Gizi",
    shortLabel: "Kesehatan",
    icon: Stethoscope,
    bg: "#E6F1FB",
    fg: "#0C447C",
    strictFreshness: true,
    sensitiveDisclaimer:
      "Informasi ini bersifat edukatif dan tidak menggantikan saran dokter atau tenaga kesehatan profesional.",
  },
  {
    code: "PS",
    label: "Pengasuhan & Stimulasi",
    shortLabel: "Pengasuhan",
    icon: Puzzle,
    bg: "#EEEDFE",
    fg: "#3C3489",
    strictFreshness: false,
  },
  {
    code: "DK",
    label: "Deteksi Dini & Kebutuhan Khusus",
    shortLabel: "Deteksi Dini",
    icon: HeartHandshake,
    bg: "#F5F3FF",
    fg: "#6B21A8",
    strictFreshness: true,
    sensitiveDisclaimer:
      "Konten ini bersifat edukatif dan bukan alat diagnosis. Penilaian kondisi anak hanya dapat dilakukan oleh profesional.",
    attentionLabel: "Langkah bila menemukan tanda",
  },
];

export const DOMAIN_CONFIG_MAP: Record<DomainCode, DomainConfig> =
  Object.fromEntries(DOMAIN_CONFIGS.map(d => [d.code, d])) as Record<DomainCode, DomainConfig>;

export const DOMAIN_CODES: DomainCode[] = DOMAIN_CONFIGS.map(d => d.code);
