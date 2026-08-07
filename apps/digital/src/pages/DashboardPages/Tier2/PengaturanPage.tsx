// Pengaturan: edit profil anak & caregiver, ganti nilai fokus, akar keluarga, data & privasi.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NILAI_REKAH, type NilaiId, type RekahProfile } from '@studiva/shared';
import { useRekahProfile } from '../../../context/RekahProfileContext';
import { useAnak } from '../../../context/AnakContext';
import { sapaanPendamping } from '../../../types/anak';
import { useRekahPlan } from '../../../context/RekahPlanContext';
import { useAuth } from '../../../context/AuthContext';
import { useDashboardTier2 } from '../../../context/DashboardTier2Context';
import Kelopak from '../../../components/Kelopak';
import { hapusDataMusim } from '../../../lib/supabase/rekahMusim';
import { PRIVACY_COPY } from '../../../features/rekah-privacy/rekahPrivacyCopy';

export default function PengaturanPage() {
  const navigate = useNavigate();
  const { profile, setProfile } = useRekahProfile();
  const { anakAktif, perbaruiAnak } = useAnak();
  const { setPlan, setCurrentWeek } = useRekahPlan();
  const { logout } = useAuth();
  const { akarKeluarga, setAkarKeluarga } = useDashboardTier2();

  const [namaPanggilan, setNamaPanggilan] = useState(profile?.anak.namaPanggilan ?? '');
  const [selectedNilai, setSelectedNilai] = useState<NilaiId[]>(
    profile?.akar.nilaiFokus ? [...profile.akar.nilaiFokus] : [],
  );
  const [showKonfirmasi, setShowKonfirmasi] = useState(false);
  const [saved, setSaved] = useState(false);

  // ── Hapus data ─────────────────────────────────────────────────────────────
  const [showHapus, setShowHapus] = useState(false);
  const [konfirmasiTeks, setKonfirmasiTeks] = useState('');
  const [hapusLoading, setHapusLoading] = useState(false);
  const [hapusError, setHapusError] = useState<string | null>(null);

  if (!profile) {
    return (
      <div className="flex h-48 items-center justify-center text-[14px] text-pekat/50">
        Memuat profil...
      </div>
    );
  }

  const namaAnak = profile.anak.namaPanggilan;

  function toggleNilai(nilaiId: NilaiId) {
    setSelectedNilai(prev => {
      if (prev.includes(nilaiId)) return prev.filter(n => n !== nilaiId);
      if (prev.length >= 2) return [prev[1], nilaiId];
      return [...prev, nilaiId];
    });
  }

  const nilaiGanti =
    selectedNilai[0] !== profile.akar.nilaiFokus[0] ||
    selectedNilai[1] !== profile.akar.nilaiFokus[1];

  function handleSimpan() {
    if (nilaiGanti) { setShowKonfirmasi(true); return; }
    simpanProfil(profile!.akar.nilaiFokus);
  }

  async function simpanProfil(nilaiFokus: [NilaiId, NilaiId]) {
    // Nama anak disimpan ke tabel `anak` lewat AnakContext, BUKAN ke
    // /rekah/profile. Blok `anak` di RekahProfile hanya proyeksi baca; kalau
    // ditulis ke sana, perubahannya tidak akan pernah terlihat lagi.
    if (anakAktif && namaPanggilan.trim() && namaPanggilan.trim() !== anakAktif.namaAnak) {
      await perbaruiAnak(anakAktif.id, { namaAnak: namaPanggilan.trim() });
    }

    const updated: RekahProfile = {
      ...profile!,
      akar: {
        ...profile!.akar,
        nilaiFokus,
        musimMulai: nilaiGanti ? new Date().toISOString().split('T')[0] : profile!.akar.musimMulai,
      },
    };
    await setProfile(updated, nilaiGanti ? { currentWeek: 1 } : undefined);
    if (nilaiGanti) {
      setPlan(null as any);
      setCurrentWeek(1);
    }
    setShowKonfirmasi(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleHapusData() {
    if (konfirmasiTeks.trim() !== namaAnak || !anakAktif) return;
    setHapusLoading(true);
    setHapusError(null);
    try {
      // Konfirmasi meminta nama ANAK, jadi yang dihapus adalah data musim anak
      // ini saja — bukan seluruh akun. Dulu DELETE /rekah/account-data menyapu
      // semua data milik user, yang tidak cocok dengan teks konfirmasinya.
      //
      // TERBUKA: setelah hapus, alur lama logout lalu ke '/'. Untuk akun dengan
      // beberapa anak itu terasa salah — anak lain tidak tersentuh. Perilaku
      // lama dipertahankan dulu agar perubahan ini tidak menyeret keputusan UX
      // yang belum diambil. Lihat REKAH_MIGRASI_SUPABASE.md.
      await hapusDataMusim(anakAktif.id);
      logout();
      navigate('/');
    } catch {
      setHapusError(PRIVACY_COPY.pesanGagal);
      setHapusLoading(false);
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-60px)] overflow-hidden bg-kanvas">
      <Kelopak
        aria-hidden
        rotate={90}
        className="pointer-events-none absolute -right-12 -top-8 h-40 w-40 bg-fajar opacity-40"
      />

      <div className="relative z-10 mx-auto max-w-lg px-4 py-6 sm:px-0 sm:py-8">
        <h1 className="mb-6 font-bricolage text-[1.35rem] font-extrabold text-pekat">Pengaturan</h1>

        {/* ── Profil Anak ──────────────────────────────────────────── */}
        <div className="mb-5 rounded-[20px] bg-white p-5 shadow-[0_4px_16px_rgba(224,82,107,0.07)]">
          <p className="mb-3 text-[12px] font-bold uppercase tracking-widest text-pekat/50">
            Profil Anak
          </p>
          <label className="mb-1 block text-[13px] font-semibold text-pekat/70">
            Nama panggilan
          </label>
          <input
            type="text"
            value={namaPanggilan}
            onChange={e => setNamaPanggilan(e.target.value)}
            className="w-full rounded-[12px] border border-fajar bg-kanvas px-4 py-3 text-[14px] text-pekat/80 focus:border-rekah/40 focus:outline-none focus:ring-2 focus:ring-rekah/20"
          />
        </div>

        {/* ── Profil Caregiver ─────────────────────────────────────── */}
        <div className="mb-5 rounded-[20px] bg-white p-5 shadow-[0_4px_16px_rgba(224,82,107,0.07)]">
          <p className="mb-3 text-[12px] font-bold uppercase tracking-widest text-pekat/50">
            Tentang Kamu
          </p>
          {/*
            Isian nama pendamping dipindahkan ke halaman Profil Anak. Sejak
            satu anak boleh punya beberapa pendamping, daftarnya tersimpan
            per anak di tabel `anak`. Menyediakan satu isian nama di sini
            akan menciptakan sumber kedua yang bisa berbeda isi.
          */}
          <p className="text-[13px] leading-relaxed text-pekat/60">
            {sapaanPendamping(anakAktif?.pendamping ?? []) ?? 'Belum ada pendamping terisi.'}
          </p>
          <button
            type="button"
            onClick={() => navigate('/dashboard/tier2/profil-anak')}
            className="mt-2 text-[13px] font-semibold text-rekah underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
          >
            Kelola pendamping di Profil Anak
          </button>
        </div>

        {/* ── Nilai Fokus ──────────────────────────────────────────── */}
        <div className="mb-6 rounded-[20px] bg-white p-5 shadow-[0_4px_16px_rgba(224,82,107,0.07)]">
          <p className="mb-1 text-[12px] font-bold uppercase tracking-widest text-pekat/50">
            Nilai Fokus Musim
          </p>
          <p className="mb-3 text-[12px] text-pekat/40">Pilih tepat 2 nilai.</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {NILAI_REKAH.map(n => (
              <button
                key={n.id}
                type="button"
                onClick={() => toggleNilai(n.id)}
                className={`rounded-[12px] border-2 px-3 py-2.5 text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah ${
                  selectedNilai.includes(n.id)
                    ? 'border-rekah bg-fajar text-rekah-tua'
                    : 'border-fajar bg-white text-pekat/60 hover:border-rekah/30'
                }`}
              >
                {n.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Akar Keluarga (Panduan Tumbuh Kembang) ───────────────── */}
        <div className="mb-6 rounded-[20px] bg-white p-5 shadow-[0_4px_16px_rgba(224,82,107,0.07)]">
          <p className="mb-1 text-[12px] font-bold uppercase tracking-widest text-pekat/50">
            Akar Keluarga
          </p>
          <p className="mb-4 text-[12px] leading-relaxed text-pekat/40">
            Pilihan ini menambahkan panel "Apa Kata Sains + Apa Kata Islam" pada setiap kartu Panduan Tumbuh Kembang.
          </p>
          <button
            type="button"
            onClick={() => setAkarKeluarga(akarKeluarga === 'islam' ? null : 'islam')}
            className={`flex w-full items-center justify-between rounded-[12px] border-2 px-4 py-3 text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah ${
              akarKeluarga === 'islam'
                ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                : 'border-fajar bg-white text-pekat/60 hover:border-rekah/30'
            }`}
          >
            <span>Nilai Keislaman</span>
            <span className={`text-[11px] font-bold uppercase tracking-wider ${
              akarKeluarga === 'islam' ? 'text-emerald-600' : 'text-pekat/30'
            }`}>
              {akarKeluarga === 'islam' ? 'Aktif' : 'Tidak aktif'}
            </span>
          </button>
        </div>

        {/* ── Simpan ───────────────────────────────────────────────── */}
        <button
          type="button"
          disabled={selectedNilai.length !== 2 || !namaPanggilan.trim()}
          onClick={handleSimpan}
          className="mb-8 flex min-h-[44px] w-full items-center justify-center rounded-[12px] bg-rekah text-[14px] font-bold text-white transition hover:bg-rekah-tua disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
        >
          {saved ? 'Tersimpan ✓' : 'Simpan perubahan'}
        </button>

        {/* ── Data & Privasi ────────────────────────────────────────── */}
        <div className="rounded-[20px] border border-mawar/50 bg-white p-5">
          <p className="mb-3 text-[12px] font-bold uppercase tracking-widest text-pekat/50">
            {PRIVACY_COPY.judulSeksi}
          </p>
          <p className="mb-2 text-[13px] leading-relaxed text-pekat/60">
            {PRIVACY_COPY.apaYangDisimpan}
          </p>
          <p className="mb-4 text-[13px] leading-relaxed text-pekat/60">
            {PRIVACY_COPY.untukApa}
          </p>
          <p className="mb-4 text-[12px] text-pekat/40">{PRIVACY_COPY.hak}</p>
          {/* TODO: dokumen kebijakan privasi lengkap — konten dari Raisha (item 6.2 checklist go-live) */}
          <button
            type="button"
            onClick={() => setShowHapus(true)}
            className="text-[13px] font-semibold text-rekah underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
          >
            {PRIVACY_COPY.tombolHapus}
          </button>
        </div>

        {/* ── Konfirmasi ganti nilai ────────────────────────────────── */}
        {showKonfirmasi && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-pekat/40 px-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="w-full max-w-sm rounded-[24px] bg-white p-6 shadow-xl">
              <p className="mb-4 text-[14px] leading-relaxed text-pekat/75">
                Ganti sekarang juga boleh — Musim-mu ikut dimulai ulang ya 🌱
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowKonfirmasi(false)}
                  className="flex flex-1 min-h-[44px] items-center justify-center rounded-[12px] border border-fajar text-[13px] font-semibold text-pekat/60 hover:bg-fajar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => simpanProfil(selectedNilai as [NilaiId, NilaiId])}
                  className="flex flex-1 min-h-[44px] items-center justify-center rounded-[12px] bg-rekah text-[13px] font-bold text-white hover:bg-rekah-tua focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
                >
                  Ya, mulai ulang
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Konfirmasi hapus data (2 langkah) ────────────────────── */}
        {showHapus && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-pekat/50 px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="hapus-judul"
          >
            <div className="w-full max-w-sm rounded-[24px] bg-white p-6 shadow-xl">
              <h2
                id="hapus-judul"
                className="mb-2 font-bricolage text-[1rem] font-extrabold text-pekat"
              >
                {PRIVACY_COPY.konfirmasiJudul}
              </h2>
              <p className="mb-4 text-[13px] leading-relaxed text-pekat/65">
                {PRIVACY_COPY.konfirmasiBody(namaAnak)}
              </p>
              <input
                type="text"
                value={konfirmasiTeks}
                onChange={e => setKonfirmasiTeks(e.target.value)}
                placeholder={PRIVACY_COPY.konfirmasiPlaceholder(namaAnak)}
                className="mb-4 w-full rounded-[12px] border border-fajar bg-kanvas px-4 py-3 text-[14px] text-pekat/80 placeholder:text-pekat/30 focus:border-rekah/40 focus:outline-none focus:ring-2 focus:ring-rekah/20"
              />
              {hapusError && (
                <p className="mb-3 text-[12px] text-rekah">{hapusError}</p>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowHapus(false); setKonfirmasiTeks(''); setHapusError(null); }}
                  className="flex flex-1 min-h-[44px] items-center justify-center rounded-[12px] border border-fajar text-[13px] font-semibold text-pekat/60 hover:bg-fajar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
                >
                  {PRIVACY_COPY.batalTombol}
                </button>
                <button
                  type="button"
                  disabled={konfirmasiTeks.trim() !== namaAnak || hapusLoading}
                  onClick={handleHapusData}
                  className="flex flex-1 min-h-[44px] items-center justify-center rounded-[12px] bg-rekah text-[13px] font-bold text-white hover:bg-rekah-tua disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
                >
                  {hapusLoading ? '...' : PRIVACY_COPY.konfirmasiTombol}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
