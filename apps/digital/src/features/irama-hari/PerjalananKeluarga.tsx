// =============================================================
// PerjalananKeluarga — tab "Perjalanan" di Kelola (Phase 15 · Tahap 5).
// Siklus Rekah: Arah > Bekal > Temani > Bantu > Kelola > Observasi/Refleksi > Adaptasi
// (berulang, bukan garis lurus). Panen = bagian Observasi & Refleksi. Status ringan;
// Arah "selesai" bila fokus sudah ditetapkan. Tanpa skor.
// Tanpa emoji (ilustrasi flat lucide). Copy DRAFT — review Fitri.
// =============================================================
import React from 'react';
import { RefreshCw, Compass, BookOpen, HeartHandshake, LifeBuoy, Puzzle, Eye, Wheat, Map, Flower2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { NilaiAkar } from '../akar-keluarga/content';

type St = 'done' | 'aktif' | 'kini' | 'opsi' | 'nanti';
const STY: Record<St, { bg: string; ink: string; label: string }> = {
  done: { bg: '#E4F3EB', ink: '#3F7A4F', label: 'Selesai' },
  aktif: { bg: '#EFE9FB', ink: '#7A5CA6', label: 'Program aktif' },
  kini: { bg: '#F06BA8', ink: '#ffffff', label: 'Kini' },
  opsi: { bg: '#FFF3D6', ink: '#B98900', label: 'Saat perlu' },
  nanti: { bg: '#F0E8F4', ink: 'rgba(110,59,87,.6)', label: 'Nanti' },
};

export default function PerjalananKeluarga({ nilaiFokus = [] }: { nilaiFokus?: readonly NilaiAkar[] }) {
  const adaFokus = nilaiFokus.length > 0;
  const tahap: { ikon: LucideIcon; tile: string; judul: string; ket: string; st: St; panen?: boolean }[] = [
    { ikon: Compass, tile: '#EAF2FF', judul: 'Arah', ket: adaFokus ? `Nilai & fokus keluarga sudah ditetapkan: ${nilaiFokus.join(' · ')}.` : 'Tetapkan nilai & fokus keluarga di Kompas.', st: adaFokus ? 'done' : 'kini' },
    { ikon: BookOpen, tile: '#FFF3D6', judul: 'Bekal', ket: 'Kumpulan ide & pengetahuan yang relevan untuk usia anak.', st: 'done' },
    { ikon: HeartHandshake, tile: '#F1EAFB', judul: 'Temani', ket: 'Perjalanan pendampingan langkah demi langkah, saat kamu memilihnya.', st: 'aktif' },
    { ikon: LifeBuoy, tile: '#E4F3EB', judul: 'Bantu', ket: 'Selalu siap saat menghadapi situasi sulit — tantrum, sulit tidur.', st: 'opsi' },
    { ikon: Puzzle, tile: '#FCE4EE', judul: 'Kelola', ket: 'Menjalankan langkah kecil di kehidupan sehari-hari.', st: 'kini' },
    { ikon: Eye, tile: '#E4F3EB', judul: 'Observasi & Refleksi', ket: 'Berhenti sejenak: lihat apa yang tumbuh & apa yang berhasil.', st: 'nanti', panen: true },
    { ikon: Wheat, tile: '#FFF3D6', judul: 'Adaptasi', ket: 'Sesuaikan strategi, lalu mulai musim baru dari Arah.', st: 'nanti' },
  ];

  return (
    <div className="max-w-[720px]">
      {/* Hero */}
      <div className="mb-4 flex items-center gap-4 rounded-[20px] border border-rekah/18 bg-gradient-to-br from-fajar to-white px-5 py-4">
        <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[18px] bg-[#EAF5EE] text-daun"><Map size={26} strokeWidth={2} /></span>
        <div>
          <div className="font-nunito text-[10px] font-extrabold uppercase tracking-wide text-pekat/50">Di mana kita sekarang?</div>
          <h3 className="font-fredoka text-[19px] font-semibold text-pekat">Keluarga kamu sedang di tahap Kelola</h3>
          <p className="mt-0.5 font-nunito text-[12.5px] font-semibold text-pekat/60">Menjalankan langkah kecil sehari-hari — sebelum berhenti sejenak untuk mengamati & belajar.</p>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2 font-nunito text-[12px] font-bold text-pekat/55">
        <RefreshCw className="h-4 w-4" strokeWidth={2} /> Ini siklus yang berulang — bukan garis lurus yang harus selesai.
      </div>

      {/* Stepper */}
      <div>
        {tahap.map((t, i) => {
          const s = STY[t.st]; const last = i === tahap.length - 1;
          const Ikon = t.ikon;
          return (
            <div key={t.judul} className="flex gap-3.5">
              <div className="flex flex-col items-center">
                <span className="z-[2] flex h-11 w-11 items-center justify-center rounded-[14px] text-pekat/70" style={{ background: t.tile, opacity: t.st === 'nanti' ? 0.6 : 1 }}><Ikon size={20} strokeWidth={2} /></span>
                {!last && <span className="w-0.5 flex-1" style={{ minHeight: 22, background: 'rgba(240,107,168,.2)' }} />}
              </div>
              <div className="mb-3 flex-1 rounded-[16px] border border-pekat/10 bg-white px-4 py-3" style={{ opacity: t.st === 'nanti' ? 0.75 : 1 }}>
                <div className="flex items-center gap-2">
                  <b className="font-fredoka text-[15.5px] font-semibold text-pekat">{t.judul}</b>
                  <span className="ml-auto rounded-full px-2.5 py-0.5 font-nunito text-[10.5px] font-extrabold" style={{ background: s.bg, color: s.ink }}>{s.label}</span>
                </div>
                <p className="mt-1 font-nunito text-[12.5px] leading-relaxed text-pekat/62">{t.ket}</p>
                {t.panen && <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-fajar px-2.5 py-1 font-nunito text-[10.5px] font-extrabold text-rekah-tua"><Flower2 size={13} strokeWidth={2} /> termasuk Panen — hasil & jejak mekar</span>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-1 flex items-center justify-center gap-2 font-shantell text-[13px] font-semibold text-daun">
        <RefreshCw className="h-4 w-4" strokeWidth={2} /> Adaptasi menuntun kembali ke Arah untuk musim berikutnya
      </div>
    </div>
  );
}
