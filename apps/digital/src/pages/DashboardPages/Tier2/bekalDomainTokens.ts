import type { DomainCode } from './knowledgeCardData';

export interface BekalDomainTokens {
  soft: string; ink: string; blob: string; border: string;
  iconPaths: string[];
}

export const BEKAL_DOMAIN_TOKENS: Record<DomainCode, BekalDomainTokens> = {
  FM: { soft:'#FFF2D0', ink:'#BF8A18', blob:'#FADD8C', border:'#F3D488', iconPaths:['M3 12h4l2-6 4 13 3-9 2 2h3'] },
  KG: { soft:'#F1EBFB', ink:'#8A6DC7', blob:'#D8C9F2', border:'#DCCEF3', iconPaths:['M9 18h6','M10 21h4','M12 3a6 6 0 0 0-3.5 10.9c.6.5.9 1.1 1 1.9v.2h5v-.2c.1-.8.4-1.4 1-1.9A6 6 0 0 0 12 3z'] },
  BH: { soft:'#E3EEFD', ink:'#4A72D6', blob:'#BCD6FA', border:'#C6DBFB', iconPaths:['M4 4h16v11H9l-5 4V4z'] },
  SE: { soft:'#FCE1ED', ink:'#DC4E8B', blob:'#F6C2DB', border:'#F7C8DF', iconPaths:['M12 20s-7-4.6-7-9.6C5 7.9 7 6 9.2 6c1.3 0 2.3.6 2.8 1.4C12.5 6.6 13.5 6 14.8 6 17 6 19 7.9 19 10.4c0 5-7 9.6-7 9.6z'] },
  KS: { soft:'#ECF4DE', ink:'#6C9A3B', blob:'#CFE4A6', border:'#D6E7B0', iconPaths:['M12 21c4.5-2 7-5.5 7-9.5 0-2.8-1.8-4.5-4-4.5-1.2 0-2.2.6-3 1.6C11.2 7.6 10.2 7 9 7 6.8 7 5 8.7 5 11.5c0 4 2.5 7.5 7 9.5z','M12 7c0-2 1-3.5 3-3.5'] },
  PS: { soft:'#F4E6EF', ink:'#A85683', blob:'#E5C2D6', border:'#E9CADB', iconPaths:['M12 3l1.8 4.9L19 9.5l-5.2 1.6L12 16l-1.8-4.9L5 9.5l5.2-1.6z'] },
  DK: { soft:'#E7E8FA', ink:'#5E5FC0', blob:'#C8CAF2', border:'#CFD0F3', iconPaths:['M12 3l7 3v5c0 4.2-3 7.4-7 9-4-1.6-7-4.8-7-9V6z','M9 12l2 2 4-4'] },
};

export const SEMUA_ICON_PATHS = ['M5 5h6v6H5z','M13 5h6v6h-6z','M5 13h6v6H5z','M13 13h6v6h-6z'];

export const DOMAIN_CODE_LABEL: Record<DomainCode, string> = {
  FM: 'Fisik & Motorik', KG: 'Kognitif', BH: 'Bahasa & Komunikasi',
  SE: 'Sosial-Emosional', KS: 'Kesehatan & Gizi',
  PS: 'Pengasuhan & Stimulasi', DK: 'Deteksi Dini & Kebutuhan Khusus',
};

export function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
  r = Math.round(r + (t - r) * p); g = Math.round(g + (t - g) * p); b = Math.round(b + (t - b) * p);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export function getBookColors(code: DomainCode) {
  const d = BEKAL_DOMAIN_TOKENS[code];
  return { ...d, coverLo: shade(d.soft, -0.07), spineHi: shade(d.ink, +0.26), spineDark: shade(d.ink, -0.26) };
}
