// =============================================================
// simpananKelola — rencana mingguan & papan harian Kelola ikut tersimpan di akun.
//
// Irama Keseharian (rencana minggu, papan per tanggal, kegiatan bawaan, centang
// hari lain, tinjauan minggu) ditulis ke localStorage oleh banyak berkas. Daripada
// mengubah setiap penulis, modul ini:
//   1. memasang pengamat pada localStorage.setItem/removeItem untuk kunci-kunci
//      Kelola (AWALAN di bawah) → setiap perubahan dicatat waktunya dan diunggah
//      ke tabel `simpanan_kelola` (migration 035) dengan jeda singkat;
//   2. `pulihkanSimpananKelola(idAnak)` dipanggil dashboard sebelum halaman anak
//      tampil: data akun yang lebih baru ditulis ke perangkat, data perangkat yang
//      belum terunggah (termasuk data lama sebelum fitur ini) dikirim ke akun.
// Yang terakhir diubah menang (per kunci). Tanpa tabel 035 semuanya tetap
// bekerja dari perangkat dan terunggah otomatis setelah tabel tersedia.
// =============================================================
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './supabase/client';

const sb = supabase as unknown as SupabaseClient;

const AWALAN = [
  'rekah_rencana_v3_',
  'rekah_hariini_v3_',
  'rekah_irama_default_',
  'rekah_centanglokal_',
  'rekah_tinjau_nanti_',
  'rekah_tinjau_',
];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
const JEDA_MS = 800;

/** id anak dari kunci Kelola, atau null bila bukan kunci yang disinkronkan. */
function anakDariKunci(kunci: string): string | null {
  const awal = AWALAN.find(a => kunci.startsWith(a));
  if (!awal) return null;
  const m = kunci.slice(awal.length).match(UUID);
  return m ? m[0] : null;
}

// localStorage asli (sebelum dipasang pengamat) — dipakai untuk tulisan dari akun
// supaya tidak memantul jadi unggahan lagi.
let setAsli: ((k: string, v: string) => void) | null = null;

const kunciMeta = (idAnak: string) => `rekah_sinkron_kelola_${idAnak}`;
function bacaMeta(idAnak: string): Record<string, string> {
  try { const r = localStorage.getItem(kunciMeta(idAnak)); if (r) return JSON.parse(r) as Record<string, string>; } catch { /* abaikan */ }
  return {};
}
function tulisMeta(idAnak: string, m: Record<string, string>): void {
  try { (setAsli ?? localStorage.setItem.bind(localStorage))(kunciMeta(idAnak), JSON.stringify(m)); } catch { /* abaikan */ }
}

let peringatanSekali = false;
function peringatan(err: unknown): void {
  if (peringatanSekali) return;
  peringatanSekali = true;
  console.warn('[Kelola] tabel simpanan_kelola belum tersedia — rencana tersimpan di perangkat ini dulu. Jalankan migration 035.', err);
}

// ── Antrean unggah ───────────────────────────────────────────────────────────
const antrean = new Map<string, ReturnType<typeof setTimeout>>();

async function kirim(idAnak: string, kunci: string): Promise<void> {
  const waktu = bacaMeta(idAnak)[kunci] ?? new Date().toISOString();
  let isi: string | null = null;
  try { isi = localStorage.getItem(kunci); } catch { /* abaikan */ }
  if (isi === null) {
    const { error } = await sb.from('simpanan_kelola').delete().eq('id_anak', idAnak).eq('kunci', kunci);
    if (error) throw error;
    return;
  }
  const { error } = await sb.from('simpanan_kelola').upsert({ id_anak: idAnak, kunci, isi, diperbarui_pada: waktu }, { onConflict: 'id_anak,kunci' });
  if (error) throw error;
}

function jadwalkan(idAnak: string, kunci: string): void {
  const lama = antrean.get(kunci);
  if (lama) clearTimeout(lama);
  antrean.set(kunci, setTimeout(() => { antrean.delete(kunci); kirim(idAnak, kunci).catch(peringatan); }, JEDA_MS));
}

/** Kirim segera semua yang masih menunggu (dipanggil saat halaman disembunyikan). */
function kirimSemua(): void {
  for (const [kunci, t] of antrean) {
    clearTimeout(t);
    antrean.delete(kunci);
    const id = anakDariKunci(kunci);
    if (id) kirim(id, kunci).catch(peringatan);
  }
}

// ── Pengamat localStorage ────────────────────────────────────────────────────
let terpasang = false;
export function pasangSinkronKelola(): void {
  if (terpasang || typeof window === 'undefined') return;
  terpasang = true;
  try {
    const proto = Object.getPrototypeOf(window.localStorage) as Storage;
    const set = proto.setItem;
    const remove = proto.removeItem;
    setAsli = (k, v) => set.call(window.localStorage, k, v);
    proto.setItem = function setItemTersinkron(this: Storage, k: string, v: string) {
      set.call(this, k, v);
      if (this !== window.localStorage) return;
      const id = anakDariKunci(k);
      if (!id) return;
      const meta = bacaMeta(id); meta[k] = new Date().toISOString(); tulisMeta(id, meta);
      jadwalkan(id, k);
    };
    proto.removeItem = function removeItemTersinkron(this: Storage, k: string) {
      remove.call(this, k);
      if (this !== window.localStorage) return;
      const id = anakDariKunci(k);
      if (!id) return;
      const meta = bacaMeta(id); delete meta[k]; tulisMeta(id, meta);
      jadwalkan(id, k);
    };
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') kirimSemua(); });
    window.addEventListener('pagehide', kirimSemua);
  } catch { /* lingkungan tanpa localStorage */ }
}

// ── Pemulihan dari akun ──────────────────────────────────────────────────────
const sudahPulih = new Set<string>();

/** Satukan data akun & perangkat untuk satu anak. Aman dipanggil berkali-kali. */
export async function pulihkanSimpananKelola(idAnak: string): Promise<void> {
  if (!idAnak || idAnak === 'anon' || sudahPulih.has(idAnak)) return;
  pasangSinkronKelola();
  try {
    const { data, error } = await sb.from('simpanan_kelola').select('kunci, isi, diperbarui_pada').eq('id_anak', idAnak);
    if (error) throw error;
    const meta = bacaMeta(idAnak);
    const diAkun = new Map((data as { kunci: string; isi: string; diperbarui_pada: string }[]).map(b => [b.kunci, b]));

    // Akun → perangkat: yang lebih baru (atau belum ada di perangkat) ditulis ke perangkat.
    for (const b of diAkun.values()) {
      const lokal = meta[b.kunci];
      const adaLokal = localStorage.getItem(b.kunci) !== null;
      if (!adaLokal || !lokal || new Date(b.diperbarui_pada) > new Date(lokal)) {
        setAsli?.(b.kunci, b.isi);
        meta[b.kunci] = new Date(b.diperbarui_pada).toISOString();
      }
    }

    // Perangkat → akun: kunci yang belum ada di akun, atau diubah setelah versi akun.
    const kirimIni: string[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const k = localStorage.key(i);
      if (!k || anakDariKunci(k) !== idAnak) continue;
      const b = diAkun.get(k);
      if (!b) { if (!meta[k]) meta[k] = new Date().toISOString(); kirimIni.push(k); continue; }
      if (meta[k] && new Date(meta[k]) > new Date(b.diperbarui_pada)) kirimIni.push(k);
    }
    tulisMeta(idAnak, meta);
    sudahPulih.add(idAnak);

    if (kirimIni.length) {
      const baris = kirimIni.flatMap(k => {
        const isi = localStorage.getItem(k);
        return isi === null ? [] : [{ id_anak: idAnak, kunci: k, isi, diperbarui_pada: meta[k] }];
      });
      for (let i = 0; i < baris.length; i += 200) {
        const { error: e2 } = await sb.from('simpanan_kelola').upsert(baris.slice(i, i + 200), { onConflict: 'id_anak,kunci' });
        if (e2) throw e2;
      }
    }
  } catch (err) {
    peringatan(err);
  }
}
