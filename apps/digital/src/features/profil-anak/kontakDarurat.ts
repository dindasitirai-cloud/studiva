// =============================================================
// kontakDarurat — satu-satunya data BARU di Profil Anak v2 (Phase 33).
// Kontak darurat berlaku per akun keluarga (dipakai bersama semua anak).
// Catatan khusus untuk pengasuh disimpan per anak (opsional, privat).
// v1: localStorage, pola sama dengan store Peta (kehidupanData.ts).
// TODO(supabase): promosikan ke tabel saat skema disetujui Raisha.
// =============================================================
import { useCallback, useEffect, useState } from 'react';

export interface KontakDarurat { id: string; nama: string; hubungan: string; nomor: string }
export const MAKS_KONTAK = 3;

interface Isi { kontak: KontakDarurat[]; faskes: string; catatanKhusus: Record<string, string> }
const KOSONG: Isi = { kontak: [], faskes: '', catatanKhusus: {} };

const kunci = (idAkun: string) => `rekah_kontak_darurat_${idAkun}`;

function baca(idAkun: string): Isi {
  try {
    const raw = localStorage.getItem(kunci(idAkun));
    if (raw) {
      const p = JSON.parse(raw) as Partial<Isi>;
      return {
        kontak: Array.isArray(p.kontak) ? p.kontak.slice(0, MAKS_KONTAK) : [],
        faskes: typeof p.faskes === 'string' ? p.faskes : '',
        catatanKhusus: p.catatanKhusus && typeof p.catatanKhusus === 'object' ? p.catatanKhusus : {},
      };
    }
  } catch { /* abaikan */ }
  return KOSONG;
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
  useEffect(() => { setIsi(baca(idAkun)); }, [idAkun]);

  const simpan = useCallback((next: Isi) => {
    setIsi(next);
    try { localStorage.setItem(kunci(idAkun), JSON.stringify(next)); } catch { /* abaikan */ }
  }, [idAkun]);

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
