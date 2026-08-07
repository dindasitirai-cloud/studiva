import React from 'react';
import { Link } from 'react-router-dom';
import { useAnakAktif, useFotoAnak } from '../../context/AnakContext';
import { sapaanPendamping, SAPAAN_CADANGAN, inisialAnak } from '../../types/anak';
import { resolveBand, ringkasRentang } from '../beranda-usia/registry';
import { resolveTahapId } from './useTahapAktif';
import { STAGES, QUOTE, FOOTER_NOTE } from '../beranda-usia/bands/tahun-pertama/content';
import BandDiluarRentang from '../beranda-usia/BandDiluarRentang';
import { LAYAR_KONTEN_BELUM_SIAP } from '../irama-hari/content';
import HeroBeranda from './komponen/HeroBeranda';
import AlurEkosistem from './komponen/AlurEkosistem';
import CeritaTahap from './komponen/CeritaTahap';
import BekalMingguIni from './komponen/BekalMingguIni';
import DeteksiDiniRingkas from './komponen/DeteksiDiniRingkas';
import RailBeranda from './komponen/RailBeranda';
import { KARTU_SEGERA } from './copy';
import { TombolGantiAnak } from '../pilih-anak/PilihAnak';

function salam(): string {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat pagi,';
  if (h < 15) return 'Selamat siang,';
  if (h < 18) return 'Selamat sore,';
  return 'Selamat malam,';
}

export default function BerandaPage() {
  const { anak, usiaBulan, sapaan, diLuarRentang } = useAnakAktif();
  const foto = useFotoAnak(anak.fotoPath);
  const namaPendamping = sapaanPendamping(anak.pendamping) ?? SAPAAN_CADANGAN;
  const band = resolveBand(usiaBulan);
  const tahapId = resolveTahapId(usiaBulan);
  const activeStage = STAGES.find(s => s.id === tahapId) ?? null;
  const ringkas = ringkasRentang(usiaBulan);

  // Di luar rentang 0–6 tahun
  if (!band || diLuarRentang) {
    return <BandDiluarRentang />;
  }

  const isBandAktif = band.status === 'aktif';

  // Label tahap untuk hero chip
  const labelTahapHero = activeStage ? activeStage.ageLabel : null;

  // KartuTransisiTahap hanya muncul untuk band aktif (0–12 bulan)
  const tampilTransisi = isBandAktif;

  return (
    <div className="min-h-[calc(100vh-60px)] bg-kanvas pb-24 pt-0">
      {/* Topbar ringkas: chip anak + ganti anak */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-rekah/10 bg-kanvas/95 px-4 py-2.5 backdrop-blur-sm sm:px-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-mawar/40 bg-white px-3 py-1.5 shadow-sm">
          <div
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center overflow-hidden bg-rekah text-[10px] font-bold text-white"
            style={{ borderRadius: '70% 70% 70% 4px' }}
          >
            {foto ? (
              <img src={foto} alt="" className="h-full w-full object-cover" />
            ) : (
              <span aria-hidden="true">{inisialAnak(anak.namaAnak)}</span>
            )}
          </div>
          <span className="text-[13px] font-semibold text-pekat">{anak.namaAnak}</span>
          {ringkas && (
            <span className="text-[11px] text-pekat/40">Usia {ringkas.rentang}</span>
          )}
        </div>
        <TombolGantiAnak />
      </div>

      {/* Konten utama */}
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6">
        <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_336px] xl:gap-[26px]">

          {/* ── Kolom utama ── */}
          <main>
            <HeroBeranda
              salam={salam()}
              namaPendamping={namaPendamping}
              namaAnak={sapaan.cap}
              sapaan={sapaan}
              usiaBulan={usiaBulan}
              labelTahap={labelTahapHero}
            />

            <AlurEkosistem namaAnak={sapaan.cap} />

            {isBandAktif ? (
              <>
                <CeritaTahap tahapAktifId={tahapId} sapaan={sapaan} />
                <BekalMingguIni tahapId={tahapId} />
                <DeteksiDiniRingkas sapaan={sapaan} />
              </>
            ) : (
              /* Band segera — konten belum siap */
              <div className="py-4">
                <div className="rounded-[18px_18px_18px_4px] bg-white p-6 shadow-sm">
                  <h2 className="mb-2 font-fredoka text-[1.1rem] font-semibold text-pekat">
                    {LAYAR_KONTEN_BELUM_SIAP.judul}
                  </h2>
                  <p className="mb-4 text-[14px] leading-relaxed text-pekat/60">
                    {LAYAR_KONTEN_BELUM_SIAP.badan.replace('{anak}', sapaan.low)}
                  </p>
                  <Link
                    to="/dashboard/tier2/irama-hari"
                    style={{ minHeight: 44 }}
                    className="inline-flex items-center justify-center rounded-[12px_12px_12px_3px] bg-rekah px-5 py-2.5 text-[13px] font-semibold text-white no-underline hover:bg-rekah-tua focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
                  >
                    {/* MENUNGGU REVIEW PSIKOLOG FITRI */}
                    {KARTU_SEGERA.tombolIramaHari}
                  </Link>
                </div>
              </div>
            )}

            {/* Kutipan */}
            <p className="mx-auto max-w-[26ch] py-10 text-center font-fraunces italic text-rekah/60"
               style={{ fontSize: 'clamp(18px, 2.4vw, 24px)' }}>
              &ldquo;{QUOTE}&rdquo;
            </p>

            {/* Footer note */}
            <p className="pb-6 text-center text-[12px] text-pekat/35">
              {FOOTER_NOTE}
            </p>
            <p className="pb-8 text-center font-fraunces italic text-pekat/40">
              Mekar pada waktunya.
            </p>
          </main>

          {/* ── Rail kanan ── */}
          <RailBeranda usiaBulan={usiaBulan} tampilTransisi={tampilTransisi} />
        </div>
      </div>
    </div>
  );
}
