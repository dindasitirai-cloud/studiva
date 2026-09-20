// KONTEN: wajib review Psikolog Fitri sebelum rilis.
// PRIORITAS TINGGI: seksi "sinyal caregiver lelah".

import React, { useMemo, useState } from 'react';
import { NILAI_REKAH, type NilaiId } from '@studiva/shared';
import { useRekahProfile } from '../../../context/RekahProfileContext';
import { useRekahRefleksi } from '../../../context/RekahRefleksiContext';
import { useRekahPlan } from '../../../context/RekahPlanContext';
import Kelopak from '../../../components/Kelopak';
import { JEJAK_COPY } from '../../../features/rekah-jejak/rekahJejakCopy';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAnakAktif } from '../../../context/AnakContext';
import { useRingkasanMinggu } from '../../../hooks/useRingkasanMinggu';
import { OPSI_REFLEKSI } from '../../../hooks/useRefleksiKegiatan';
import { useAkarStateSync } from '../../../features/akar-keluarga/state';
import { BUNGA_DARI_NAMA } from '../../../features/akar-keluarga/registryBunga';
import type { NilaiAkar } from '../../../features/akar-keluarga/content';
import { usePanenNilai } from '../../../hooks/usePanenNilai';

// ── BungaMusim ─────────────────────────────────────────────────────────────

function BungaMusim({ nilaiId, selesaiCount }: { nilaiId: NilaiId; selesaiCount: number }) {
  const nilai = NILAI_REKAH.find(n => n.id === nilaiId);
  const MAX_KELOPAK = 5;
  const filled = Math.min(selesaiCount, MAX_KELOPAK);

  const ROTATIONS = [-36, 0, 36, 72, 108];
  const R = 28; // jarak kelopak dari pusat (px)

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        aria-label={nilai ? JEJAK_COPY.bungaLabel(nilai.label) : ''}
        className="relative flex h-24 w-24 items-center justify-center"
      >
        {/* Kelopak SVG dalam fan radial */}
        {ROTATIONS.map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const cx = 48 + R * Math.sin(rad);
          const cy = 48 - R * Math.cos(rad);
          return (
            <div
              key={i}
              aria-hidden
              style={{
                position: 'absolute',
                left: cx - 8,
                top: cy - 13,
                width: 16,
                height: 26,
                borderRadius: '70% 70% 70% 4px',
                transform: `rotate(${deg}deg)`,
                background: i < filled ? nilai?.warna ?? '#E0526B' : 'transparent',
                border: `2px solid ${i < filled ? nilai?.warna ?? '#E0526B' : '#E0526B33'}`,
                transition: 'background 0.3s ease, border-color 0.3s ease',
              }}
            />
          );
        })}
        {/* Pusat */}
        <div
          aria-hidden
          className="relative z-10 h-8 w-8 rounded-full"
          style={{ background: nilai?.warna ?? '#E0526B', opacity: 0.85 }}
        />
      </div>
      {nilai && (
        <span
          className="rounded-full px-2.5 py-0.5 text-[12px] font-bold"
          style={{ background: `${nilai.warna}22`, color: nilai.warna }}
        >
          {nilai.label}
        </span>
      )}
    </div>
  );
}

// ── JejakMekarPage ─────────────────────────────────────────────────────────

function BungaNilaiAkar({ nama, count }: { nama: NilaiAkar; count: number }) {
  const warna = BUNGA_DARI_NAMA.get(nama)?.warnaPetal ?? '#E0526B';
  const MAX_KELOPAK = 5;
  const filled = Math.min(count, MAX_KELOPAK);
  const ROTATIONS = [-36, 0, 36, 72, 108];
  const R = 28;
  return (
    <div className="flex flex-col items-center gap-2">
      <div aria-label={`Bunga nilai ${nama}`} className="relative flex h-24 w-24 items-center justify-center">
        {ROTATIONS.map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const cx = 48 + R * Math.sin(rad);
          const cy = 48 - R * Math.cos(rad);
          return (
            <div
              key={i}
              aria-hidden
              style={{
                position: 'absolute',
                left: cx - 8,
                top: cy - 13,
                width: 16,
                height: 26,
                borderRadius: '70% 70% 70% 4px',
                transform: `rotate(${deg}deg)`,
                background: i < filled ? warna : 'transparent',
                border: `2px solid ${i < filled ? warna : warna + '33'}`,
                transition: 'background 0.3s ease, border-color 0.3s ease',
              }}
            />
          );
        })}
        <div aria-hidden className="relative z-10 h-8 w-8 rounded-full" style={{ background: warna, opacity: 0.85 }} />
      </div>
      <p className="text-[12px] font-bold text-pekat">{nama}</p>
      <p className="text-[11px] text-pekat/45">{count > 0 ? `${count}× pekan ini` : 'belum pekan ini'}</p>
    </div>
  );
}

function interpretasiMinggu(h: Record<string, number>): string {
  const total = h.menyenangkan + h.terlalu_sulit + h.kurang_cocok + h.ingin_ulang;
  if (total === 0) return '';
  const maxLain = (x: number, ...rest: number[]) => x >= Math.max(...rest);
  if (maxLain(h.menyenangkan, h.terlalu_sulit, h.kurang_cocok, h.ingin_ulang))
    return 'Banyak yang terasa menyenangkan — lanjutkan iramanya.';
  if (maxLain(h.terlalu_sulit, h.menyenangkan, h.kurang_cocok, h.ingin_ulang))
    return 'Beberapa terasa menantang — Rekah menyederhanakan untuk pekan depan.';
  if (maxLain(h.kurang_cocok, h.menyenangkan, h.terlalu_sulit, h.ingin_ulang))
    return 'Ada yang kurang cocok — Rekah menawarkan arah yang berbeda.';
  return 'Terus mengamati bersama, sepekan demi sepekan.';
}

export default function JejakMekarPage() {
  const { profile, profileLoading } = useRekahProfile();
  const { entries } = useRekahRefleksi();
  const { currentWeek } = useRekahPlan();
  const [arsipOpen, setArsipOpen] = useState(false);
  const { anak } = useAnakAktif();
  const ringkasan = useRingkasanMinggu(anak.id);
  const [akarState] = useAkarStateSync(anak.id);
  const panen = usePanenNilai(anak.id);

  // ── SEMUA HOOK DI ATAS GERBANG `if (!profile)` ─────────────────────────────
  //
  // Ketiga useMemo di bawah dulu berada SESUDAH early return. Akibatnya render
  // pertama (profil masih dimuat) mendaftarkan 4 hook dan render berikutnya 7,
  // lalu React melempar "Rendered more hooks than during the previous render"
  // dan halaman menjadi kosong. Karena profil dimuat asinkron, itu bukan kasus
  // tepi. Jangan menambahkan hook di bawah gerbang itu.

  // ── Pola lembut ─────────────────────────────────────────────────────
  const cukupData = entries.length >= 5;

  // Momen tersimpan (hanya yang punya catatan)
  const momenList = useMemo(
    () => entries.filter(e => e.catatan).sort((a, b) => b.tanggal.localeCompare(a.tanggal)),
    [entries],
  );

  const dominanSeru = useMemo(() => {
    if (!cukupData) return null;
    const byNilai: Record<string, number> = {};
    entries
      .filter(e => e.responsAnak === 'seru')
      .forEach(e => {
        if (e.nilaiUtama) byNilai[e.nilaiUtama] = (byNilai[e.nilaiUtama] ?? 0) + 1;
      });
    const sorted = Object.entries(byNilai).sort((a, b) => b[1] - a[1]);
    if (!sorted[0]) return null;
    const domNilai = NILAI_REKAH.find(n => n.id === sorted[0][0]);
    return domNilai?.label ?? null;
  }, [entries, cukupData]);

  const sinyalLelah = useMemo(() => {
    if (!cukupData) return false;
    const lelahCount = entries.filter(e => e.moodCaregiver === 'lelah').length;
    return lelahCount / entries.length > 0.5;
  }, [entries, cukupData]);

  // Kartu Tinjauan Minggu tidak bergantung pada sistem "musim" (RekahProfile),
  // jadi didefinisikan di sini agar bisa tampil di kedua jalur render.
  const kartuTinjauan = (
    <div className="mb-6 rounded-[20px] border border-rekah/15 bg-white p-5 shadow-[0_4px_20px_rgba(224,82,107,0.07)]">
          <p className="font-shantell text-[15px] text-rekah">tinjauan minggu ini</p>
          {ringkasan.total > 0 ? (
            <>
              <p className="mt-1 text-[14px] font-bold text-pekat">
                {ringkasan.total} kegiatan direfleksikan bersama {anak.namaAnak || 'si kecil'} pekan ini.
              </p>
              <p className="mt-1 text-[13px] text-pekat/65">{interpretasiMinggu(ringkasan.hitung)}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {OPSI_REFLEKSI.map(op =>
                  ringkasan.hitung[op.id] > 0 ? (
                    <span key={op.id} className="rounded-full bg-fajar px-3 py-1 text-[12px] font-semibold text-pekat/70">
                      {op.label} &middot; {ringkasan.hitung[op.id]}
                    </span>
                  ) : null,
                )}
              </div>
            </>
          ) : (
            <p className="mt-1 text-[13px] leading-relaxed text-pekat/60">
              Belum ada refleksi pekan ini. Setelah menandai kegiatan &ldquo;Berhasil dilakukan&rdquo; di Irama Hari,
              ringkasannya muncul di sini.
            </p>
          )}
          <Link
            to="/dashboard/tier2/kompas-keluarga"
            className="mt-4 inline-flex items-center gap-1.5 rounded-[22px] bg-rekah px-5 py-2.5 text-[13px] font-extrabold text-white no-underline"
          >
            Perbarui pengamatan di Kompas untuk pekan depan &rarr;
          </Link>
        </div>
  );

  const nilaiAkar = akarState.nilai as NilaiAkar[];
  const kartuBunga = nilaiAkar.length > 0 ? (
    <div className="mb-6 rounded-[20px] bg-white p-6 shadow-[0_4px_20px_rgba(224,82,107,0.07)]">
      <p className="mb-4 text-[12px] font-bold uppercase tracking-widest text-pekat/50">Nilai yang tumbuh pekan ini</p>
      <div className="flex flex-wrap justify-around gap-4">
        {nilaiAkar.slice(0, 4).map(n => (
          <BungaNilaiAkar key={n} nama={n} count={panen[n] ?? 0} />
        ))}
      </div>
      <p className="mt-4 text-center text-[12px] italic text-pekat/45">
        Tiap kegiatan yang direfleksikan menumbuhkan nilai yang diangkatnya.
      </p>
    </div>
  ) : null;

  if (!profile) {
    // Belum ada "musim" berjalan (atau masih memuat). Tetap tampilkan tinjauan
    // minggu — penutup loop yang mandiri dari sistem musim.
    return (
      <div className="relative min-h-[calc(100vh-60px)] overflow-hidden bg-kanvas">
        <div className="relative z-10 mx-auto max-w-lg px-4 py-6 sm:px-0 sm:py-8">
          <h1 className="mb-1 font-bricolage text-[1.35rem] font-extrabold text-pekat">
            {JEJAK_COPY.judulHalaman}
          </h1>
          <p className="mb-6 text-[13px] text-pekat/50">{JEJAK_COPY.sub}</p>
          {profileLoading ? (
            <p className="py-6 text-center text-[14px] text-pekat/50">Memuat…</p>
          ) : (
            <>{kartuTinjauan}{kartuBunga}</>
          )}
        </div>
      </div>
    );
  }

  // Di bawah sini `profile` dijamin ada. Nilai turunan biasa, bukan hook.
  const [nilai1Id, nilai2Id] = profile.akar.nilaiFokus;
  const nilai1 = NILAI_REKAH.find(n => n.id === nilai1Id);
  const nilai2 = NILAI_REKAH.find(n => n.id === nilai2Id);

  // Hitung kelopak terisi per nilai dari completions refleksi
  const selesai1 = entries.filter(e => e.nilaiUtama === nilai1Id).length;
  const selesai2 = entries.filter(e => e.nilaiUtama === nilai2Id).length;

  function handleRingankan() {
    // TIDAK ADA EFEK YANG TERSIMPAN — dan itu memang keadaannya sejak dulu.
    //
    // Versi sebelumnya menulis caregiver.energiSaatIni = 'menipis' lewat
    // setProfile. Tapi tidak ada satu pun tempat di aplikasi yang MEMBACA
    // energiSaatIni, jadi tombol ini sudah lama tidak melakukan apa pun; yang
    // ada hanya kesan tersimpan. Migrasi 011 juga sengaja tidak
    // mempersistensi energi pendamping karena itu keadaan "sekarang".
    //
    // Dibiarkan kosong secara sadar, bukan dihapus, supaya tombolnya tidak
    // hilang sebelum ada keputusan tentang apa arti "ringankan pekan ini":
    // memotong jumlah langkah, menandai pekan sebagai pekan pemulihan, atau
    // sekadar mengubah nada sapaan. Lihat REKAH_MIGRASI_SUPABASE.md.
  }

  return (
    <div className="relative min-h-[calc(100vh-60px)] overflow-hidden bg-kanvas">
      <Kelopak
        aria-hidden
        rotate={270}
        className="pointer-events-none absolute -left-14 -top-8 h-48 w-48 bg-mawar opacity-25"
      />

      <div className="relative z-10 mx-auto max-w-lg px-4 py-6 sm:px-0 sm:py-8">
        <h1 className="mb-1 font-bricolage text-[1.35rem] font-extrabold text-pekat">
          {JEJAK_COPY.judulHalaman}
        </h1>
        <p className="mb-6 text-[13px] text-pekat/50">{JEJAK_COPY.sub}</p>

        {/* ── Tinjauan minggu ini — menutup loop kembali ke Kompas ── */}
        {kartuTinjauan}

        {/* ── Nilai yang tumbuh (dari Nilai Akar Keluarga) ── */}
        {kartuBunga}

        {/* ── Status Musim ─────────────────────────────────────────── */}
        <div className="mb-4 rounded-[14px] border border-fajar bg-white px-5 py-3">
          <p className="text-[13px] text-pekat/60">
            {nilai1 && nilai2
              ? JEJAK_COPY.statusMusim(nilai1.label, nilai2.label, currentWeek)
              : ''}
          </p>
        </div>

        {/* ── Pola lembut ──────────────────────────────────────────── */}
        {!cukupData ? (
          <p className="mb-4 text-[13px] text-pekat/40 italic">
            {JEJAK_COPY.polaBelumCukup}
          </p>
        ) : (
          <div className="mb-4 space-y-3">
            {dominanSeru && (
              <div className="rounded-[14px] bg-fajar p-4">
                <p className="text-[13px] leading-relaxed text-pekat/70">
                  {JEJAK_COPY.polaResponDominan(profile.anak.namaPanggilan, dominanSeru)}
                </p>
              </div>
            )}

            {/* Sinyal caregiver lelah — PRIORITAS REVIEW Psikolog Fitri */}
            {sinyalLelah && (
              <div className="rounded-[16px] border-2 border-mawar bg-white p-5">
                <p className="mb-1 font-bricolage text-[15px] font-bold text-pekat">
                  {JEJAK_COPY.sinyalLelahJudul}
                </p>
                <p className="mb-4 text-[13px] leading-relaxed text-pekat/65">
                  {JEJAK_COPY.sinyalLelahBody}
                </p>
                <button
                  type="button"
                  onClick={handleRingankan}
                  className="flex min-h-[44px] w-full items-center justify-center rounded-[12px] bg-rekah px-4 text-[14px] font-bold text-white transition hover:bg-rekah-tua focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
                >
                  {JEJAK_COPY.sinyalLelahCTA}
                </button>
                <p className="mt-2 text-center text-[11px] text-pekat/40">
                  {JEJAK_COPY.sinyalLelahToggleNote}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Momen tersimpan ──────────────────────────────────────── */}
        <div className="mb-6 rounded-[20px] bg-white p-5 shadow-[0_4px_20px_rgba(224,82,107,0.07)]">
          <p className="mb-3 text-[12px] font-bold uppercase tracking-widest text-pekat/50">
            {JEJAK_COPY.momenJudul}
          </p>
          {momenList.length === 0 ? (
            <p className="py-4 text-center text-[13px] text-pekat/40">
              {JEJAK_COPY.momenEmpty}
            </p>
          ) : (
            <div className="space-y-3">
              {momenList.map(entry => {
                const nilai = NILAI_REKAH.find(n => n.id === entry.nilaiUtama);
                return (
                  <div key={entry.id} className="rounded-[14px] bg-kanvas p-4">
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="text-[11px] text-pekat/40">{entry.tanggal}</span>
                      {nilai && (
                        <span
                          className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                          style={{ background: `${nilai.warna}22`, color: nilai.warna }}
                        >
                          {nilai.label}
                        </span>
                      )}
                    </div>
                    <p className="font-caveat text-[15px] leading-relaxed text-pekat/75">
                      "{entry.catatan}"
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Arsip Musim Sebelumnya (collapsed) ───────────────────── */}
        <button
          type="button"
          onClick={() => setArsipOpen(o => !o)}
          aria-expanded={arsipOpen}
          className="flex w-full items-center justify-between rounded-[14px] border border-fajar bg-white px-5 py-4 text-left text-[14px] font-semibold text-pekat/60 hover:bg-fajar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
        >
          {JEJAK_COPY.musimSebelumnyaLabel}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${arsipOpen ? 'rotate-180' : ''}`}
            strokeWidth={2}
          />
        </button>
        {arsipOpen && (
          <div className="mt-2 rounded-[14px] bg-white px-5 py-4">
            <p className="text-[13px] text-pekat/45">{JEJAK_COPY.musimSebelumnyaEmpty}</p>
            {/* TODO: arsip musim sebelumnya dari backend */}
          </div>
        )}
      </div>
    </div>
  );
}
