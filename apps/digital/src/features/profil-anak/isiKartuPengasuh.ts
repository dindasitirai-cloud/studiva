// =============================================================
// isiKartuPengasuh — logika murni Kartu Pengasuh v1 (Phase 33).
// Tidak memakai React: bisa diuji langsung. Isi kartu diturunkan dari
// jawaban Peta (bidang Anak), Cara mengasuh, dan kontak darurat.
// v1 = teks/gambar yang dikirim orang tua. Tanpa tautan publik/akun pengasuh.
// =============================================================
import { COPY_PROFIL } from './profil-anak-copy';
import type { KontakDarurat } from './kontakDarurat';

export type KunciBagian = 'alergi' | 'rewel' | 'makan' | 'cara' | 'khusus' | 'darurat';
export const URUTAN_BAGIAN: KunciBagian[] = ['alergi', 'rewel', 'makan', 'cara', 'khusus', 'darurat'];
/** Kebutuhan khusus mati secara bawaan (privat). */
export const PILIHAN_AWAL: Record<KunciBagian, boolean> = { alergi: true, rewel: true, makan: true, cara: true, khusus: false, darurat: true };

export interface BagianKartu { kunci: KunciBagian; label: string; baris: string[]; tegas?: boolean }

export interface InputKartu {
  jawaban: Record<string, string[]>;
  caraKita: string[];          // kesepakatan yang ditandai bisa dibagikan
  catatanKhusus: string;
  kontak: KontakDarurat[];
  faskes: string;
}

const gabung = (xs: string[]) => xs.join(', ');
const pilihan = (j: Record<string, string[]>, id: string) => (j[id] ?? []).filter(v => v.trim().length > 0);

/** Isi tiap bagian; bagian tanpa data mengembalikan baris kosong (tidak dirender). */
export function bangunSemuaBagian(input: InputKartu): BagianKartu[] {
  const B = COPY_PROFIL.kartu.bagian;
  const j = input.jawaban;
  const out: BagianKartu[] = [];

  const alergi = pilihan(j, 'a_alergi');
  const alergiNyata = alergi.filter(v => v !== 'Tidak ada');
  out.push({
    kunci: 'alergi', label: B.alergi, tegas: alergiNyata.length > 0,
    baris: alergi.length === 0 ? [] : alergiNyata.length === 0 ? [COPY_PROFIL.kartu.tidakAdaAlergi] : [gabung(alergiNyata), COPY_PROFIL.kartu.tandaAlergi],
  });

  const tenang = pilihan(j, 'a_tenang');
  out.push({ kunci: 'rewel', label: B.rewel, baris: tenang.length ? [gabung(tenang)] : [] });

  const makanBaris: string[] = [];
  const makan = [...pilihan(j, 'a_menyusu'), ...pilihan(j, 'a_makan_bt'), ...pilihan(j, 'a_makan_pra')];
  if (makan.length) makanBaris.push(`Makan: ${gabung(makan)}`);
  const toilet = pilihan(j, 'a_toilet');
  if (toilet.length) makanBaris.push(`Ke toilet: ${gabung(toilet)}`);
  const sekolah = pilihan(j, 'a_sekolah');
  if (sekolah.length) makanBaris.push(`Sekolah/dititipkan: ${gabung(sekolah)}`);
  out.push({ kunci: 'makan', label: B.makan, baris: makanBaris });

  out.push({ kunci: 'cara', label: B.cara, baris: input.caraKita.slice(0, 2) });

  const khusus = input.catatanKhusus.trim();
  out.push({ kunci: 'khusus', label: B.khusus, baris: khusus ? [khusus] : [] });

  const daruratBaris = input.kontak
    .filter(k => k.nama.trim() && k.nomor.trim())
    .map(k => `${k.nama.trim()}${k.hubungan.trim() ? ` (${k.hubungan.trim()})` : ''}: ${k.nomor.trim()}`);
  if (input.faskes.trim()) daruratBaris.push(`${COPY_PROFIL.kartu.faskes}: ${input.faskes.trim()}`);
  out.push({ kunci: 'darurat', label: B.darurat, baris: daruratBaris });

  return out;
}

/** Bagian yang benar-benar tampil: dicentang DAN punya isi. Urutan tetap (alergi selalu pertama). */
export function bangunIsiKartu(input: InputKartu, dipilih: Record<KunciBagian, boolean>): BagianKartu[] {
  return bangunSemuaBagian(input).filter(b => dipilih[b.kunci] && b.baris.length > 0);
}

/** Teks polos untuk WhatsApp: tanpa emoji, tanpa markdown. */
export function bangunTeksKartuPengasuh(isi: BagianKartu[], nama: string, usiaTeks: string, tanggal: string): string {
  const baris: string[] = [COPY_PROFIL.kartu.judulTeks(nama, usiaTeks), ''];
  for (const b of isi) {
    baris.push(`${b.label}:`);
    for (const x of b.baris) baris.push(`- ${x}`);
    baris.push('');
  }
  baris.push(COPY_PROFIL.kartu.kaki(tanggal));
  return baris.join('\n');
}

export function tanggalPendekID(d = new Date()): string {
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Gambar (PNG) tanpa library: digambar langsung ke canvas ──────────────────
const W = 720;
const PAD = 40;
const WARNA = { latar: '#FFFFFF', kepala: '#F8B9D4', plum: '#6E3B57', redup: '#8A7080', pink: '#F06BA8', tegasBg: '#FFF0F7', garis: '#F1DDE4' };

function bungkus(ctx: CanvasRenderingContext2D, teks: string, lebar: number): string[] {
  const kata = teks.split(/\s+/);
  const out: string[] = [];
  let cur = '';
  for (const k of kata) {
    const coba = cur ? `${cur} ${k}` : k;
    if (ctx.measureText(coba).width > lebar && cur) { out.push(cur); cur = k; } else cur = coba;
  }
  if (cur) out.push(cur);
  return out;
}

/** Menggambar kartu ke canvas. Mengembalikan null bila canvas tidak tersedia. */
export async function gambarKartu(isi: BagianKartu[], judul: string, sub: string, kaki: string): Promise<HTMLCanvasElement | null> {
  try { await (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready; } catch { /* abaikan */ }
  const ukur = document.createElement('canvas').getContext('2d');
  if (!ukur) return null;
  const lebarTeks = W - PAD * 2;
  const fBody = "600 22px Nunito, system-ui, sans-serif";
  const fLabel = "800 16px Nunito, system-ui, sans-serif";

  // Hitung tinggi dulu
  ukur.font = fBody;
  let tinggi = 150 + PAD;
  const tata = isi.map(b => {
    const pad = b.tegas ? 32 : 0;
    const baris = b.baris.flatMap(x => bungkus(ukur, x, lebarTeks - pad));
    const h = 26 + baris.length * 32 + (b.tegas ? 28 : 0) + 22;
    tinggi += h;
    return { b, baris, h };
  });
  tinggi += 60;

  const skala = 2;
  const cv = document.createElement('canvas');
  cv.width = W * skala; cv.height = tinggi * skala;
  const ctx = cv.getContext('2d');
  if (!ctx) return null;
  ctx.scale(skala, skala);
  ctx.fillStyle = WARNA.latar; ctx.fillRect(0, 0, W, tinggi);
  ctx.fillStyle = WARNA.kepala; ctx.fillRect(0, 0, W, 130);
  ctx.fillStyle = WARNA.plum;
  ctx.font = "700 18px Nunito, system-ui, sans-serif"; ctx.fillText(sub, PAD, 52);
  ctx.font = "700 32px Fredoka, system-ui, sans-serif"; ctx.fillText(judul, PAD, 96);

  let y = 130 + PAD;
  for (const { b, baris, h } of tata) {
    const kotakX = PAD - (b.tegas ? 0 : 0);
    if (b.tegas) {
      ctx.fillStyle = WARNA.tegasBg; ctx.strokeStyle = WARNA.pink; ctx.lineWidth = 3;
      const kh = h - 22;
      ctx.beginPath();
      const r = 16; const kw = lebarTeks;
      ctx.moveTo(kotakX + r, y - 8); ctx.arcTo(kotakX + kw, y - 8, kotakX + kw, y - 8 + kh, r);
      ctx.arcTo(kotakX + kw, y - 8 + kh, kotakX, y - 8 + kh, r); ctx.arcTo(kotakX, y - 8 + kh, kotakX, y - 8, r);
      ctx.arcTo(kotakX, y - 8, kotakX + kw, y - 8, r); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    const tx = b.tegas ? PAD + 16 : PAD;
    const ty = b.tegas ? y + 14 : y;
    ctx.fillStyle = b.tegas ? WARNA.pink : WARNA.redup; ctx.font = fLabel;
    ctx.fillText(b.label.toUpperCase(), tx, ty + 10);
    ctx.fillStyle = WARNA.plum; ctx.font = fBody;
    baris.forEach((l, i) => ctx.fillText(l, tx, ty + 44 + i * 32));
    y += h;
  }
  ctx.strokeStyle = WARNA.garis; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(W - PAD, y); ctx.stroke();
  ctx.fillStyle = WARNA.redup; ctx.font = "600 16px Nunito, system-ui, sans-serif"; ctx.fillText(kaki, PAD, y + 34);
  return cv;
}
