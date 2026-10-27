// =============================================================
// kontakDarurat — kontak darurat keluarga untuk Kartu untuk pengasuh (Profil Anak).
// Kontak darurat berlaku per akun keluarga (dipakai bersama semua anak).
// Catatan khusus untuk pengasuh disimpan per anak (opsional, privat).
//
// Penyimpanan (2026-10-27): tabel Supabase `kontak_darurat_keluarga`
// (migration 036, satu baris per akun) + cache lokal `rekah_kontak_darurat_<idAkun>`.
// Perubahan ditulis ke perangkat seketika lalu dikirim ke akun dengan jeda singkat.
// Saat dibuka, versi yang terakhir diubah yang dipakai. Tanpa tabel 036 tetap
// bekerja dari perangkat dan terunggah otomatis setelah tabel tersedia.
// =============================================================
import { useCallback, useEffect, useRef, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase/client';

export interface KontakDarurat { id: string; nama: string; hubungan: string; nomor: string }
export const MAKS_KONTAK = 3;

interface Isi { kontak: KontakDarurat[]; faskes: string; catatanKhusus: Record<string, string>; diperbarui?: string }
const KOSONG: Isi = { kontak: [], faskes: '', catatanKhusus: {} };

const kunci = (idAkun: string) => `rekah_kontak_darurat_${idAkun}`;
const sb = supabase as unknown as SupabaseClient;
const JEDA_MS = 700;

function rapikan(p: Partial<Isi> | null | undefined): Isi {
  if (!p) return KOSONG;
  return {
    kontak: Array.isArray(p.kontak) ? p.kontak.slice(0, MAKS_KONTAK) : [],
    faskes: typeof p.faskes === 'string' ? p.faskes : '',
    catatanKhusus: p.catatanKhusus && typeof p.catatanKhusus === 'object' ? p.catatanKhusus : {},
    diperbarui: typeof p.diperbarui === 'string' ? p.diperbarui : undefined,
  };
}

function baca(idAkun: string): Isi {
  try {
    const raw = localStorage.getItem(kunci(idAkun));
    if (raw) return rapikan(JSON.parse(raw) as Partial<Isi>);
  } catch { /* abaikan */ }
  return KOSONG;
}
function tulisLokal(idAkun: string, isi: Isi): void {
  try { localStorage.setItem(kunci(idAkun), JSON.stringify(isi)); } catch { /* abaikan */ }
}
const adaIsi = (i: Isi) => i.kontak.length > 0 || i.faskes.trim() !== '' || Object.values(i.catatanKhusus).some(v => v.trim() !== '');

let peringatanSekali = false;
function peringatan(err: unknown): void {
  if (peringatanSekali) return;
  peringatanSekali = true;
  console.warn('[Profil Anak] tabel kontak_darurat_keluarga belum tersedia — kontak darurat tersimpan di perangkat ini dulu. Jalankan migration 036.', err);
}

async function unggah(idAkun: string, isi: Isi): Promise<void> {
  const { diperbarui, ...data } = isi;
  const { error } = await sb.from('kontak_darurat_keluarga')
    .upsert({ id_orang_tua: idAkun, isi: data, diperbarui_pada: diperbarui ?? new Date().toISOString() }, { onConflict: 'id_orang_tua' });
  if (error) throw error;
}

/** Nomor dianggap layak bila berisi minimal 8 angka (spasi, +, - diizinkan). */
export function nomorValid(nomor: string): boolean {
  if (!/^[\d\s+\-()]*$/.test(nomor)) return false;
  return nomor.replace(/\D/g, '').length >= 8;
}

export interface KontakDaruratStore {
  kontak: KontakDarurat[];
  faskes: string;
  catatanKhusus: (idAnak: string) => string;
  tambah: () => void;
  ubah: (id: string, patch: Partial<Omit<KontakDarurat, 'id'>>) => void;
  hapus: (id: string) => void;
  setFaskes: (v: string) => void;
  setCatatanKhusus: (idAnak: string, v: string) => void;
}

export function useKontakDaruratStore(idAkun: string): KontakDaruratStore {
  const [isi, setIsi] = useState<Isi>(() => baca(idAkun));
  const pewaktu = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tertunda = useRef<Isi | null>(null);
  const bisaAkun = idAkun !== 'lokal';

  // Ambil dari akun; yang terakhir diubah menang. Data lama di perangkat diunggah.
  useEffect(() => {
    const lokal = baca(idAkun);
    setIsi(lokal);
    if (!bisaAkun) return;
    let batal = false;
    (async () => {
      const { data, error } = await sb.from('kontak_darurat_keluarga').select('isi, diperbarui_pada').eq('id_orang_tua', idAkun).maybeSingle();
      if (error) throw error;
      if (batal) return;
      const baris = data as { isi: Partial<Isi>; diperbarui_pada: string } | null;
      if (baris && (!lokal.diperbarui || new Date(baris.diperbarui_pada) > new Date(lokal.diperbarui))) {
        const dariAkun = { ...rapikan(baris.isi), diperbarui: new Date(baris.diperbarui_pada).toISOString() };
        tulisLokal(idAkun, dariAkun);
        setIsi(dariAkun);
      } else if (adaIsi(lokal) && (!baris || (lokal.diperbarui && new Date(lokal.diperbarui) > new Date(baris.diperbarui_pada)))) {
        await unggah(idAkun, lokal.diperbarui ? lokal : { ...lokal, diperbarui: new Date().toISOString() });
      }
    })().catch(peringatan);
    return () => { batal = true; };
  }, [idAkun, bisaAkun]);

  // Kirim yang tertunda saat halaman ditutup / berpindah.
  useEffect(() => {
    const kirimSekarang = () => {
      if (pewaktu.current) { clearTimeout(pewaktu.current); pewaktu.current = null; }
      if (tertunda.current && bisaAkun) { unggah(idAkun, tertunda.current).catch(peringatan); tertunda.current = null; }
    };
    const onHide = () => { if (document.visibilityState === 'hidden') kirimSekarang(); };
    document.addEventListener('visibilitychange', onHide);
    return () => { document.removeEventListener('visibilitychange', onHide); kirimSekarang(); };
  }, [idAkun, bisaAkun]);

  const simpan = useCallback((next: Isi) => {
    const berstempel = { ...next, diperbarui: new Date().toISOString() };
    setIsi(berstempel);
    tulisLokal(idAkun, berstempel);
    if (!bisaAkun) return;
    tertunda.current = berstempel;
    if (pewaktu.current) clearTimeout(pewaktu.current);
    pewaktu.current = setTimeout(() => {
      pewaktu.current = null;
      const kirim = tertunda.current; tertunda.current = null;
      if (kirim) unggah(idAkun, kirim).catch(peringatan);
    }, JEDA_MS);
  }, [idAkun, bisaAkun]);

  return {
    kontak: isi.kontak,
    faskes: isi.faskes,
    catatanKhusus: (idAnak) => isi.catatanKhusus[idAnak] ?? '',
    tambah: () => {
      if (isi.kontak.length >= MAKS_KONTAK) return;
      simpan({ ...isi, kontak: [...isi.kontak, { id: `kd-${Date.now().toString(36)}`, nama: '', hubungan: '', nomor: '' }] });
    },
    ubah: (id, patch) => simpan({ ...isi, kontak: isi.kontak.map(k => (k.id === id ? { ...k, ...patch } : k)) }),
    hapus: (id) => simpan({ ...isi, kontak: isi.kontak.filter(k => k.id !== id) }),
    setFaskes: (v) => simpan({ ...isi, faskes: v }),
    setCatatanKhusus: (idAnak, v) => simpan({ ...isi, catatanKhusus: { ...isi.catatanKhusus, [idAnak]: v } }),
  };
}
