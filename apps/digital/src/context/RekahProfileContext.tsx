// ============================================================================
// RekahProfileContext — menyusun RekahProfile dari DUA sumber, tidak menyimpan
// salinannya sendiri.
//
//   profile.anak      ← AnakContext (tabel `anak`)
//   profile.caregiver ← AnakContext (kolom anak.pendamping, elemen pertama)
//   profile.akar      ← tabel `rekah_musim`, baris dengan selesai IS NULL
//
// Sebelum migrasi 011 seluruh RekahProfile disimpan sebagai satu blob JSON di
// rekah_profiles.profile_json, sehingga nama anak dan nilai fokus punya dua
// tempat tinggal yang bisa berbeda isi. Versi ini tidak punya state profil
// sama sekali — hanya musim yang dimuat, sisanya diproyeksikan.
//
// Musim adalah milik ANAK, bukan milik akun. Ganti anak aktif = ganti musim.
// ============================================================================

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import type { RekahProfile, NilaiId } from '@studiva/shared';
import { useAnak } from './AnakContext';
import {
  getMusimBerjalan,
  mulaiMusimPertama,
  perbaruiMusimBerjalan,
} from '../lib/supabase/rekahMusim';
import { dispatchRekahError } from '../utils/rekahApiError';
import type { Pendamping } from '../types/anak';

/** Bentuk minimum yang dibutuhkan RekahProfile.caregiver bila belum ada pendamping. */
const PENDAMPING_KOSONG: Pendamping = { panggilan: '', peran: 'lainnya' };

interface RekahProfileContextValue {
  profile: RekahProfile | null;
  profileLoading: boolean;
  serverCurrentWeek: number;
  serverMusimKe: number;
  /** id baris rekah_musim yang berjalan. null bila anak belum punya musim. */
  idMusimBerjalan: string | null;
  setProfile: (p: RekahProfile, opts?: { currentWeek?: number; musimKe?: number }) => Promise<void>;
  /** Dipanggil setelah tutup musim supaya musim baru terbaca. */
  muatUlangMusim: () => Promise<void>;
}

const RekahProfileContext = createContext<RekahProfileContextValue | null>(null);

export function RekahProfileProvider({ children }: { children: React.ReactNode }) {
  const { anakAktif } = useAnak();
  const idAnak = anakAktif?.id ?? null;

  const [idMusim, setIdMusim] = useState<string | null>(null);
  const [nilaiFokus, setNilaiFokus] = useState<NilaiId[]>([]);
  const [musimMulai, setMusimMulai] = useState<string>('');
  const [serverCurrentWeek, setServerCurrentWeek] = useState(1);
  const [serverMusimKe, setServerMusimKe] = useState(1);
  const [profileLoading, setProfileLoading] = useState(true);

  const muatUlangMusim = useCallback(async () => {
    if (!idAnak) {
      setIdMusim(null);
      setNilaiFokus([]);
      setMusimMulai('');
      setServerCurrentWeek(1);
      setServerMusimKe(1);
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    try {
      const musim = await getMusimBerjalan(idAnak);
      if (musim) {
        setIdMusim(musim.id);
        setNilaiFokus(musim.nilai_fokus as NilaiId[]);
        setMusimMulai(musim.mulai);
        setServerCurrentWeek(musim.minggu_ke);
        setServerMusimKe(musim.musim_ke);
      } else {
        // Belum onboarding — bukan galat.
        setIdMusim(null);
        setNilaiFokus([]);
        setMusimMulai('');
        setServerCurrentWeek(1);
        setServerMusimKe(1);
      }
    } catch {
      dispatchRekahError('Gagal memuat musim. Periksa koneksi lalu coba lagi.');
    } finally {
      setProfileLoading(false);
    }
  }, [idAnak]);

  useEffect(() => {
    void muatUlangMusim();
  }, [muatUlangMusim]);

  /**
   * Menyimpan perubahan musim. Nama dan tanggal lahir anak di `p.anak`
   * DIABAIKAN — itu milik AnakContext. Kalau layar perlu mengubahnya, panggil
   * perbaruiAnak() di sana, bukan lewat sini.
   */
  const setProfile = useCallback(
    async (p: RekahProfile, opts?: { currentWeek?: number; musimKe?: number }) => {
      if (!idAnak) return;

      const sebelum = { nilaiFokus, musimMulai, serverCurrentWeek, serverMusimKe, idMusim };
      const fokusBaru = [...p.akar.nilaiFokus] as NilaiId[];
      const pekanBaru = opts?.currentWeek ?? serverCurrentWeek;

      // Optimistis
      setNilaiFokus(fokusBaru);
      setMusimMulai(p.akar.musimMulai);
      setServerCurrentWeek(pekanBaru);
      if (opts?.musimKe !== undefined) setServerMusimKe(opts.musimKe);

      try {
        if (idMusim) {
          await perbaruiMusimBerjalan(idMusim, { mingguKe: pekanBaru, nilaiFokus: fokusBaru });
        } else {
          // Anak ini belum punya musim — ini penyelesaian onboarding.
          const musim = await mulaiMusimPertama(idAnak, fokusBaru);
          setIdMusim(musim.id);
          setMusimMulai(musim.mulai);
          setServerMusimKe(musim.musim_ke);
        }
      } catch {
        setNilaiFokus(sebelum.nilaiFokus);
        setMusimMulai(sebelum.musimMulai);
        setServerCurrentWeek(sebelum.serverCurrentWeek);
        setServerMusimKe(sebelum.serverMusimKe);
        setIdMusim(sebelum.idMusim);
        dispatchRekahError('Koneksi terputus — perubahan belum tersimpan. Coba lagi ya.');
      }
    },
    [idAnak, idMusim, nilaiFokus, musimMulai, serverCurrentWeek, serverMusimKe],
  );

  // Proyeksi. Tidak ada state profil yang disimpan — semuanya turunan.
  const profile = useMemo<RekahProfile | null>(() => {
    if (!anakAktif || nilaiFokus.length === 0) return null;
    const pendamping = anakAktif.pendamping[0] ?? PENDAMPING_KOSONG;
    return {
      anak: {
        namaPanggilan: anakAktif.namaAnak,
        tanggalLahir: anakAktif.tanggalLahir,
      },
      caregiver: {
        namaPanggilan: pendamping.panggilan,
        peran: pendamping.peran,
        // energiSaatIni sengaja tidak dipersistensi — lihat migrasi 011.
      },
      akar: {
        nilaiFokus: nilaiFokus as RekahProfile['akar']['nilaiFokus'],
        musimMulai,
      },
    };
  }, [anakAktif, nilaiFokus, musimMulai]);

  const value = useMemo<RekahProfileContextValue>(() => ({
    profile,
    profileLoading,
    serverCurrentWeek,
    serverMusimKe,
    idMusimBerjalan: idMusim,
    setProfile,
    muatUlangMusim,
  }), [profile, profileLoading, serverCurrentWeek, serverMusimKe, idMusim, setProfile, muatUlangMusim]);

  return (
    <RekahProfileContext.Provider value={value}>
      {children}
    </RekahProfileContext.Provider>
  );
}

export function useRekahProfile(): RekahProfileContextValue {
  const ctx = useContext(RekahProfileContext);
  if (!ctx) throw new Error('useRekahProfile harus digunakan di dalam RekahProfileProvider');
  return ctx;
}
