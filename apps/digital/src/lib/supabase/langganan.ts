import { supabase } from './client';
import type { Database } from './database.types';

export type LanggananRow = Database['public']['Tables']['langganan']['Row'];

// Alias yang lebih pendek untuk dipakai di logika gerbang
export type Langganan = LanggananRow;

export type StatusGerbang = 'aktif' | 'kedaluwarsa' | 'belum_berlangganan';

// ── Data access ───────────────────────────────────────────────────────────────

/**
 * Ambil catatan langganan pengguna yang sedang login.
 * Mengembalikan null bila tidak ada sesi atau belum ada baris langganan.
 */
export async function getLangganan(): Promise<Langganan | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('langganan')
    .select('*')
    .eq('id_orang_tua', user.id)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

// ── Pure function — mudah diuji ───────────────────────────────────────────────

/**
 * Menentukan status gerbang dari catatan langganan + waktu kini.
 * Murni: tidak ada side effect, waktuKini sebagai parameter.
 *
 * aktif            : status='aktif' DAN akhirPeriode > waktuKini (+ grace bila diset)
 * kedaluwarsa      : pernah berlangganan tapi sudah lewat / dibatalkan / tertunggak
 * belum_berlangganan: tidak ada catatan sama sekali, atau status='belum_pernah'
 *
 * KEPUTUSAN MANUSIA: masa tenggang (grasiHari) default 0.
 * Bila ingin memberi beberapa hari tenggang setelah kedaluwarsa, set grasiHari > 0.
 * Ini adalah keputusan bisnis yang perlu disetujui tim sebelum production.
 */
export function statusGerbang(
  langganan: Langganan | null,
  waktuKini: string,
  opsi?: { grasiHari?: number },
): StatusGerbang {
  if (!langganan || langganan.status === 'belum_pernah') {
    return 'belum_berlangganan';
  }

  const grasiMs = (opsi?.grasiHari ?? 0) * 24 * 60 * 60 * 1000;
  const now = new Date(waktuKini).getTime();
  const akhir = langganan.akhir_periode
    ? new Date(langganan.akhir_periode).getTime() + grasiMs
    : 0;

  if (langganan.status === 'aktif' && akhir > now) return 'aktif';
  return 'kedaluwarsa';
}

// ── Teks UX gerbang ──────────────────────────────────────────────────────────
// MENUNGGU REVIEW PSIKOLOG FITRI — nada mengundang kembali, bukan menghukum

export const TEKS_GERBANG = {
  kedaluwarsa: 'Data si kecil aman menunggu. Perpanjang untuk melanjutkan perjalanan bersama.',
  belum_berlangganan: 'Pilih paket Rekah untuk mulai mendampingi tumbuh kembang si kecil.',
} as const satisfies Record<Exclude<StatusGerbang, 'aktif'>, string>;

// ── TODO: integrasi Stripe ────────────────────────────────────────────────────
// Titik checkout: PricingPage → pilih paket → POST /api/payments/create-checkout-session
// Titik webhook:  Stripe → POST /api/payments/webhook
//   → backend verifikasi signature → UPDATE langganan SET status, akhir_periode, stripe_*
// Saat ini checkout belum terhubung ke tabel langganan Supabase (hanya SQLite lama).
// Stripe webhook perlu diupdate untuk juga menulis ke tabel langganan via service_role.
