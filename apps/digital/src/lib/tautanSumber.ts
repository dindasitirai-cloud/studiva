// Mengubah teks sumber/referensi konten Rekah menjadi tautan yang bisa diklik orang tua.
// Urutan: URL yang ditulis di teks → DOI → lembaga/pedoman yang dikenal → pencarian Google Scholar
// (untuk sitasi jurnal/buku seperti "Levine et al. (2012), Developmental Psychology").
// Admin bisa memastikan tautan persis dengan menuliskan URL di kolom sumber.

export interface BagianSumber { teks: string; url: string; jenis: 'langsung' | 'lembaga' | 'cari' }

// Kata kunci lembaga/pedoman → halaman resmi. Dicocokkan tanpa membedakan huruf besar/kecil.
const LEMBAGA: Array<[RegExp, string]> = [
  [/safe sleep|sleep-related infant/i, 'https://publications.aap.org/pediatrics/article/150/1/e2022057990/188304/'],
  [/zubler|milestone/i, 'https://www.cdc.gov/act-early/'],
  [/physical activity|sedentary|aktivitas fisik/i, 'https://www.who.int/publications/i/item/9789240015128'],
  [/national scientific council on the developing child/i, 'https://developingchild.harvard.edu'],
  [/M-CHAT/i, 'https://mchatscreen.com'],
  [/autis/i, 'https://www.cdc.gov/autism/'],
  [/\bAAPD\b|pediatric dentistry/i, 'https://www.aapd.org'],
  [/\bAAP\b|american academy of pediatrics|healthychildren/i, 'https://www.healthychildren.org'],
  [/act early|learn the signs/i, 'https://www.cdc.gov/act-early/'],
  [/\bSIDS\b|sudden infant death/i, 'https://www.cdc.gov/sids/'],
  [/\bCDC\b/i, 'https://www.cdc.gov'],
  [/complementary feeding/i, 'https://www.who.int/publications/i/item/9789240081864'],
  [/growth standards?/i, 'https://www.who.int/tools/child-growth-standards'],
  [/child injury/i, 'https://www.who.int/publications/i/item/9789241563574'],
  [/\bUNICEF\b.*breast|breastfeed|ASI eksklusif/i, 'https://www.who.int/health-topics/breastfeeding'],
  [/\bUNICEF\b/i, 'https://www.unicef.org'],
  [/\bWHO\b|world health organi[sz]ation/i, 'https://www.who.int'],
  [/\bIDAI\b|ikatan dokter anak/i, 'https://www.idai.or.id'],
  [/kemenkes|kementerian kesehatan|buku KIA|KPSP|SDIDTK/i, 'https://www.kemkes.go.id'],
  [/serve and return/i, 'https://developingchild.harvard.edu/key-concepts/serve-and-return/'],
  [/executive function/i, 'https://developingchild.harvard.edu/key-concept/executive-function/'],
  [/harvard|center on the developing child/i, 'https://developingchild.harvard.edu'],
  [/\bASHA\b|speech-language-hearing/i, 'https://www.asha.org'],
  [/zero to three/i, 'https://www.zerotothree.org'],
  [/\bNAEYC\b/i, 'https://www.naeyc.org'],
];

const POLA_URL = /(https?:\/\/[^\s)<>\]]+|www\.[^\s)<>\]]+\.[a-z]{2,}[^\s)<>\]]*)/i;
const POLA_DOI = /\b(10\.\d{4,9}\/[^\s;,)]+)/i;

function bersihkan(u: string): string {
  const t = u.replace(/[.,;:]+$/, '');
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

/** Tautan untuk satu sumber tunggal (tanpa pemisahan). */
export function urlSumber(teks: string): { url: string; jenis: BagianSumber['jenis'] } | null {
  const t = teks.trim();
  if (!t) return null;
  const url = POLA_URL.exec(t);
  if (url) return { url: bersihkan(url[1]), jenis: 'langsung' };
  const doi = POLA_DOI.exec(t);
  if (doi) return { url: `https://doi.org/${doi[1].replace(/[.]+$/, '')}`, jenis: 'langsung' };
  for (const [pola, u] of LEMBAGA) if (pola.test(t)) return { url: u, jenis: 'lembaga' };
  const kueri = t.replace(/[“”"]/g, '').slice(0, 200);
  return { url: `https://scholar.google.com/scholar?q=${encodeURIComponent(kueri)}`, jenis: 'cari' };
}

/**
 * Pecah teks sumber menjadi beberapa bagian bertaut. Pemisah: titik koma, " · ", atau baris baru.
 * URL tetap utuh (titik koma di dalam URL jarang; bila ada, bagian itu tetap memuat URL-nya).
 */
export function pecahSumber(teks: string | null | undefined): BagianSumber[] {
  if (!teks) return [];
  return teks
    .split(/\s*(?:;|\s·\s|\n)\s*/)
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => {
      const u = urlSumber(s)!;
      // Teks tampil: bila bagian hanya berisi URL, tampilkan nama domainnya saja agar rapi.
      const hanyaUrl = POLA_URL.exec(s)?.[0] === s;
      const label = hanyaUrl ? s.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '') : s;
      return { teks: label, url: u.url, jenis: u.jenis };
    });
}
