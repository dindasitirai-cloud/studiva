// ============================================================================
// AnakContext — SATU-SATUNYA sumber data anak di aplikasi Rekah.
//
// Sebelumnya data anak tersebar di empat tempat yang tidak saling bicara:
//   1. DashboardTier2Context.children   (useState kosong, tidak pernah terisi)
//   2. tabel `anak` di Supabase          (ditulis wizard)
//   3. RekahProfileContext.profile.anak  (endpoint /rekah/profile)
//   4. useChildProfile()                 (stub berisi TODO)
// Akibatnya isian wizard tidak pernah muncul di halaman Profil Anak.
//
// Sekarang: tabel `anak` → lib/supabase/rekah.ts → context ini → seluruh UI.
// Kalau sebuah layar butuh data anak, panggil useAnak() atau useAnakAktif().
// Jangan menyalin profil anak ke state lain.
//
// Pemilihan anak aktif sengaja disimpan di memori saja (bukan localStorage),
// sesuai aturan proyek. Setelah muat ulang halaman, orang tua memilih anak
// lagi lewat layar Pilih Anak — perilaku yang memang diinginkan.
// ============================================================================

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAuth } from './AuthContext';
import {
  getAnakList,
  buatAnak,
  perbaruiAnak as perbaruiAnakDb,
  hapusAnak as hapusAnakDb,
  unggahFotoAnak,
  hapusFotoAnak,
  urlFotoAnak,
} from '../lib/supabase/rekah';
import { hitungBand } from '../lib/band';
import { dispatchRekahError } from '../utils/rekahApiError';
import {
  type ProfilAnak,
  type DraftAnak,
  type PatchAnak,
  type Pendamping,
  type SapaanSet,
  MAKS_PENDAMPING,
  sapaanDari,
  usiaDalamBulan,
} from '../types/anak';

// Baris Supabase → bentuk kanonik aplikasi. Satu-satunya tempat pemetaan ini.
type BarisAnak = Awaited<ReturnType<typeof getAnakList>>[number];

function keProfil(baris: BarisAnak): ProfilAnak {
  return {
    id: baris.id,
    namaAnak: baris.nama_anak,
    tanggalLahir: baris.tanggal_lahir,
    jenisKelamin: baris.jenis_kelamin,
    fotoPath: baris.foto_url,
    // Kolom JSONB. Baris lama sebelum migrasi 010 bisa mengembalikan null,
    // jadi jangan berasumsi selalu larik.
    pendamping: Array.isArray(baris.pendamping) ? baris.pendamping : [],
    dibuatPada: baris.dibuat_pada,
  };
}

/** Buang baris pendamping yang panggilannya kosong sebelum disimpan. */
function rapikanPendamping(daftar: Pendamping[]): Pendamping[] {
  return daftar
    .map(p => ({ panggilan: p.panggilan.trim(), peran: p.peran }))
    .filter(p => p.panggilan.length > 0)
    .slice(0, MAKS_PENDAMPING);
}

export interface AnakContextValue {
  /** Semua anak milik akun ini, urut waktu dibuat. */
  daftarAnak: ProfilAnak[];
  /** Anak yang sedang dibuka. null berarti orang tua belum memilih. */
  anakAktif: ProfilAnak | null;
  memuat: boolean;

  pilihAnak: (id: string) => void;
  /** Kembali ke layar Pilih Anak. */
  lepasAnakAktif: () => void;

  /**
   * Permintaan membuka WizardAnak mode "tambah". Dibaca DashboardShellTier2.
   *
   * Ada di sini, bukan sebagai state lokal shell, karena sebelumnya hanya layar
   * PilihAnak yang bisa menyalakannya — dan layar itu dilewati ketika anaknya
   * tepat satu. Akibatnya orang tua dengan satu anak tidak punya jalan sama
   * sekali untuk menambah anak kedua.
   */
  sedangTambahAnak: boolean;
  mintaTambahAnak: () => void;
  batalTambahAnak: () => void;

  tambahAnak: (draft: DraftAnak) => Promise<ProfilAnak>;
  perbaruiAnak: (id: string, patch: PatchAnak) => Promise<void>;
  gantiFoto: (id: string, file: File) => Promise<void>;
  hapusFoto: (id: string) => Promise<void>;
  hapusAnak: (id: string) => Promise<void>;
  muatUlang: () => Promise<void>;
}

const AnakContext = createContext<AnakContextValue | null>(null);

export function AnakProvider({ children }: { children: React.ReactNode }) {
  const { supabaseUser } = useAuth();
  const [daftarAnak, setDaftarAnak] = useState<ProfilAnak[]>([]);
  const [idAktif, setIdAktif] = useState<string | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [sedangTambahAnak, setSedangTambahAnak] = useState(false);

  const muatUlang = useCallback(async () => {
    if (!supabaseUser) {
      setDaftarAnak([]);
      setIdAktif(null);
      setMemuat(false);
      return;
    }
    setMemuat(true);
    try {
      const baris = await getAnakList();
      setDaftarAnak(baris.map(keProfil));
    } catch {
      dispatchRekahError('Gagal memuat profil anak. Periksa koneksi lalu coba lagi.');
      setDaftarAnak([]);
    } finally {
      setMemuat(false);
    }
  }, [supabaseUser]);

  useEffect(() => {
    void muatUlang();
  }, [muatUlang]);

  // Kalau hanya ada satu anak, tidak perlu menyuruh orang tua memilih.
  useEffect(() => {
    if (!memuat && idAktif === null && daftarAnak.length === 1) {
      setIdAktif(daftarAnak[0].id);
    }
  }, [memuat, idAktif, daftarAnak]);

  const pilihAnak = useCallback((id: string) => setIdAktif(id), []);
  const lepasAnakAktif = useCallback(() => setIdAktif(null), []);
  const mintaTambahAnak = useCallback(() => setSedangTambahAnak(true), []);
  const batalTambahAnak = useCallback(() => setSedangTambahAnak(false), []);

  const tambahAnak = useCallback(async (draft: DraftAnak): Promise<ProfilAnak> => {
    const baris = await buatAnak({
      namaAnak: draft.namaAnak.trim(),
      tanggalLahir: draft.tanggalLahir,
      jenisKelamin: draft.jenisKelamin,
      pendamping: rapikanPendamping(draft.pendamping),
    });

    let profil = keProfil(baris);

    // Foto diunggah setelah baris ada, karena path memakai id anak.
    // Kegagalan unggah tidak membatalkan pembuatan profil.
    if (draft.fileFoto) {
      try {
        const path = await unggahFotoAnak(profil.id, draft.fileFoto);
        const diperbarui = await perbaruiAnakDb(profil.id, { fotoUrl: path });
        profil = keProfil(diperbarui);
      } catch {
        dispatchRekahError('Profil tersimpan, tapi fotonya gagal diunggah. Bisa ditambahkan lagi dari halaman Profil Anak.');
      }
    }

    setDaftarAnak(prev => [...prev, profil]);
    setIdAktif(profil.id);
    setSedangTambahAnak(false);
    return profil;
  }, []);

  const perbaruiAnak = useCallback(async (id: string, patch: PatchAnak) => {
    const sebelum = daftarAnak;
    const pendampingRapi =
      patch.pendamping !== undefined ? rapikanPendamping(patch.pendamping) : undefined;

    // Perbarui optimistis supaya form terasa responsif.
    setDaftarAnak(prev =>
      prev.map(a =>
        a.id === id
          ? { ...a, ...patch, ...(pendampingRapi ? { pendamping: pendampingRapi } : {}) } as ProfilAnak
          : a,
      ),
    );
    try {
      const baris = await perbaruiAnakDb(id, {
        namaAnak: patch.namaAnak,
        jenisKelamin: patch.jenisKelamin,
        pendamping: pendampingRapi,
      });
      const profil = keProfil(baris);
      setDaftarAnak(prev => prev.map(a => (a.id === id ? profil : a)));
    } catch {
      setDaftarAnak(sebelum);
      dispatchRekahError('Perubahan profil belum tersimpan. Coba lagi ya.');
      throw new Error('Gagal menyimpan profil anak');
    }
  }, [daftarAnak]);

  const gantiFoto = useCallback(async (id: string, file: File) => {
    const path = await unggahFotoAnak(id, file);
    const baris = await perbaruiAnakDb(id, { fotoUrl: path });
    const profil = keProfil(baris);
    setDaftarAnak(prev => prev.map(a => (a.id === id ? profil : a)));
  }, []);

  const hapusFoto = useCallback(async (id: string) => {
    const anak = daftarAnak.find(a => a.id === id);
    await hapusFotoAnak(anak?.fotoPath ?? null);
    const baris = await perbaruiAnakDb(id, { fotoUrl: null });
    const profil = keProfil(baris);
    setDaftarAnak(prev => prev.map(a => (a.id === id ? profil : a)));
  }, [daftarAnak]);

  const hapusAnak = useCallback(async (id: string) => {
    const anak = daftarAnak.find(a => a.id === id);
    await hapusAnakDb(id);
    await hapusFotoAnak(anak?.fotoPath ?? null);
    setDaftarAnak(prev => prev.filter(a => a.id !== id));
    setIdAktif(prev => (prev === id ? null : prev));
  }, [daftarAnak]);

  const anakAktif = useMemo(
    () => daftarAnak.find(a => a.id === idAktif) ?? null,
    [daftarAnak, idAktif],
  );

  const value = useMemo<AnakContextValue>(() => ({
    daftarAnak,
    anakAktif,
    memuat,
    pilihAnak,
    lepasAnakAktif,
    sedangTambahAnak,
    mintaTambahAnak,
    batalTambahAnak,
    tambahAnak,
    perbaruiAnak,
    gantiFoto,
    hapusFoto,
    hapusAnak,
    muatUlang,
  }), [
    daftarAnak, anakAktif, memuat, pilihAnak, lepasAnakAktif,
    sedangTambahAnak, mintaTambahAnak, batalTambahAnak,
    tambahAnak, perbaruiAnak, gantiFoto, hapusFoto, hapusAnak, muatUlang,
  ]);

  return <AnakContext.Provider value={value}>{children}</AnakContext.Provider>;
}

export function useAnak(): AnakContextValue {
  const ctx = useContext(AnakContext);
  if (!ctx) throw new Error('useAnak harus dipakai di dalam AnakProvider');
  return ctx;
}

// ── Turunan siap pakai untuk anak aktif ──────────────────────────────────────

export interface AnakAktif {
  anak: ProfilAnak;
  usiaBulan: number;
  band: number;
  diLuarRentang: boolean;
  sapaan: SapaanSet;
}

/**
 * Dipakai layar di dalam dashboard, yang sudah dijamin punya anak aktif oleh
 * gerbang di DashboardShellTier2. Melempar bila dipanggil di luar gerbang itu —
 * itu memang bug pemanggilan, bukan kondisi yang perlu ditangani UI.
 */
export function useAnakAktif(): AnakAktif {
  const { anakAktif } = useAnak();
  return useMemo(() => {
    if (!anakAktif) {
      throw new Error(
        'useAnakAktif dipanggil tanpa anak aktif. Layar ini harus berada di dalam gerbang DashboardShellTier2.',
      );
    }
    const usiaBulan = usiaDalamBulan(anakAktif.tanggalLahir) ?? 0;
    const { band, diLuarRentang } = hitungBand(new Date(anakAktif.tanggalLahir));
    return {
      anak: anakAktif,
      usiaBulan,
      band,
      diLuarRentang,
      sapaan: sapaanDari(anakAktif),
    };
  }, [anakAktif]);
}

/**
 * URL bertanda tangan untuk foto anak. Bucket privat, jadi URL berumur pendek
 * dan harus diminta ulang. Mengembalikan null bila anak belum berfoto.
 */
export function useFotoAnak(fotoPath: string | null): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let batal = false;
    if (!fotoPath) {
      setUrl(null);
      return;
    }
    void urlFotoAnak(fotoPath).then(hasil => {
      if (!batal) setUrl(hasil);
    });
    return () => { batal = true; };
  }, [fotoPath]);

  return url;
}
