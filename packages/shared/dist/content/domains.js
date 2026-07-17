"use strict";
// ============================================================================
// Studiva Digital — canonical domain configuration (single source of truth).
// Adding a domain means adding one entry here; nothing else needs hardcoding.
// ============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOMAIN_CODES = exports.DOMAIN_CONFIG_MAP = exports.DOMAIN_CONFIGS = void 0;
const lucide_react_1 = require("lucide-react");
exports.DOMAIN_CONFIGS = [
    {
        code: "FM",
        label: "Fisik & Motorik",
        shortLabel: "Fisik",
        icon: lucide_react_1.Activity,
        bg: "#FAEEDA",
        fg: "#633806",
        strictFreshness: false,
    },
    {
        code: "KG",
        label: "Kognitif",
        shortLabel: "Kognitif",
        icon: lucide_react_1.Lightbulb,
        bg: "#F1EFE8",
        fg: "#444441",
        strictFreshness: false,
    },
    {
        code: "BH",
        label: "Bahasa & Komunikasi",
        shortLabel: "Bahasa",
        icon: lucide_react_1.MessageCircle,
        bg: "#E1F5EE",
        fg: "#0F6E56",
        strictFreshness: false,
    },
    {
        code: "SE",
        label: "Sosial-Emosional",
        shortLabel: "Sosial",
        icon: lucide_react_1.Heart,
        bg: "#FBEAF0",
        fg: "#72243E",
        strictFreshness: false,
    },
    {
        code: "KS",
        label: "Kesehatan & Gizi",
        shortLabel: "Kesehatan",
        icon: lucide_react_1.Stethoscope,
        bg: "#E6F1FB",
        fg: "#0C447C",
        strictFreshness: true,
        sensitiveDisclaimer: "Informasi ini bersifat edukatif dan tidak menggantikan saran dokter atau tenaga kesehatan profesional.",
    },
    {
        code: "PS",
        label: "Pengasuhan & Stimulasi",
        shortLabel: "Pengasuhan",
        icon: lucide_react_1.Puzzle,
        bg: "#EEEDFE",
        fg: "#3C3489",
        strictFreshness: false,
    },
    {
        code: "DK",
        label: "Deteksi Dini & Kebutuhan Khusus",
        shortLabel: "Deteksi Dini",
        icon: lucide_react_1.HeartHandshake,
        bg: "#F5F3FF",
        fg: "#6B21A8",
        strictFreshness: true,
        sensitiveDisclaimer: "Konten ini bersifat edukatif dan bukan alat diagnosis. Penilaian kondisi anak hanya dapat dilakukan oleh profesional.",
        attentionLabel: "Langkah bila menemukan tanda",
    },
];
exports.DOMAIN_CONFIG_MAP = Object.fromEntries(exports.DOMAIN_CONFIGS.map(d => [d.code, d]));
exports.DOMAIN_CODES = exports.DOMAIN_CONFIGS.map(d => d.code);
//# sourceMappingURL=domains.js.map