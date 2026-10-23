// ============================================================================
// PilihAnak — gerbang pemilihan anak sebelum masuk dashboard.
//
// Isi dashboard Rekah berbeda per anak: musim tumbuh, kegiatan, panduan, dan
// Irama Hari semuanya bergantung pada usia. Jadi orang tua memilih dulu anak
// yang mana, seperti memilih profil di Netflix, baru masuk.
//
// Datanya dari AnakContext, satu-satunya sumber data anak.
// Tampilan: design_handoff_pilih_anak (varian A, 2026-10-22) — kartu putih,
// kebun botani dua baris di bawah, ornamen melayang. Dekorasi aria-hidden &
// pointer-events:none; animasi mati di prefers-reduced-motion.
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import { Plus, Repeat } from 'lucide-react';
import { useAnak, useFotoAnak } from '../../context/AnakContext';
import { ringkasRentang } from '../beranda-usia/registry';
import BotanicalStem, { type BotanicalConfig } from '../../components/BotanicalStem';
import {
  formatUsia,
  inisialAnak,
  sapaanPendamping,
  usiaDalamBulan,
  type ProfilAnak,
} from '../../types/anak';

const RADIUS_KELOPAK = { borderRadius: '100px 100px 100px 8px' } as const;
const PLUM = '#6E3B57';

// Warna kartu anak bergilir (handoff: anak 5+ kembali ke awal).
const WARNA_ANAK = [
  { bg: '#F8B9D4', soft: '#FCE3EE', ink: '#F06BA8' },
  { bg: '#C9B8F0', soft: '#F1ECFB', ink: PLUM },
  { bg: '#DDE8FB', soft: '#E4EFFD', ink: PLUM },
  { bg: '#FFE29A', soft: '#FFF3D9', ink: PLUM },
];

// ── Kebun (varian A) ─────────────────────────────────────────────────────────
type JenisBunga = NonNullable<BotanicalConfig['type']>;
const JENIS: JenisBunga[] = ['tulip', 'daisy', 'bell', 'fivepetal', 'sprig'];
const PELANGI: Pick<BotanicalConfig, 'bloom' | 'bloom2' | 'center'>[] = [
  { bloom: '#F06BA8', bloom2: '#F8B9D4', center: '#FFE29A' },
  { bloom: '#8FB8F7', bloom2: '#FFF3E6', center: '#FFE29A' },
  { bloom: '#FFE29A', bloom2: '#FFF3E6', center: '#F06BA8' },
  { bloom: '#C9B8F0', bloom2: '#FFF3E6', center: '#6E3B57' },
  { bloom: '#F8B9D4', bloom2: '#FFF3E6', center: '#F06BA8' },
  { bloom: '#5F84E6', bloom2: '#8FB8F7', center: '#FFE29A' },
];
const ALAM = { stem: '#6F9E3F', stemDark: '#4E6B2E', leaf: '#A7C63E', leaf2: '#8FB84A' };

interface Tanaman { cfg: BotanicalConfig; left: number; w: number; bottom: number; dur: number; delay: number }

/** Dua baris rapi berselang-seling. n = jumlah bunga baris belakang. */
function susunKebun(n: number): Tanaman[] {
  const out: Tanaman[] = [];
  const put = (left: number, w: number, bottom: number, type: JenisBunga) =>
    out.push({ cfg: { type, ...ALAM }, left, w, bottom, dur: 5 + (out.length % 3), delay: -(out.length % 4) });
  for (let i = 0; i < n; i += 1) put(((i + 0.5) / n) * 100, 104, 58, JENIS[i % JENIS.length]);
  for (let i = 0; i <= n; i += 1) put((i / n) * 100, 84, -4, i % 2 ? JENIS[(i + 2) % JENIS.length] : (i % 4 ? 'leaf' : 'foliage'));
  let ci = 0;
  for (const t of out) {
    if (t.cfg.type === 'leaf' || t.cfg.type === 'foliage') continue;
    t.cfg = { ...t.cfg, ...PELANGI[ci % PELANGI.length] };
    ci += 1;
  }
  return out;
}

const SPOT: [number, number][] = [[4, 8], [13, 24], [7, 44], [22, 6], [78, 7], [90, 20], [85, 40], [70, 14], [31, 15], [64, 26], [95, 55], [2, 60]];
const ORNAMEN_CFG: BotanicalConfig[] = [
  { type: 'star', bloom: '#FFE29A' }, { type: 'dot', bloom: '#C9B8F0' }, { type: 'squiggle', bloom: '#8FB8F7' }, { type: 'arch', bloom: '#F8B9D4' },
  { type: 'star', bloom: '#F8B9D4' }, { type: 'dot', bloom: '#FFE29A' }, { type: 'squiggle', bloom: '#F06BA8' }, { type: 'arch', bloom: '#A7C63E' },
];
// Ukuran & tempo ornamen ditetapkan (bukan acak) agar tidak berubah tiap render.
const ORNAMEN = SPOT.map(([x, y], i) => {
  const w = 22 + ((i * 7) % 19);
  return { cfg: ORNAMEN_CFG[i % ORNAMEN_CFG.length], x, y, w, dur: 5 + ((i * 3) % 4), delay: -((i * 5) % 4) };
});

const GAYA = `
@keyframes paSway{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
@keyframes paFloaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
.pa-kartu{transition:transform .2s,box-shadow .2s,border-color .2s}
.pa-kartu:hover{transform:translateY(-6px)}
@media (prefers-reduced-motion: reduce){.pa-gerak{animation:none!important}.pa-kartu,.pa-kartu:hover{transition:none;transform:none}}
`;

function useLayarSempit(batas = 480): boolean {
  const q = `(max-width: ${batas - 0.02}px)`;
  const [sempit, setSempit] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const h = () => setSempit(m.matches);
    h();
    m.addEventListener?.('change', h);
    return () => m.removeEventListener?.('change', h);
  }, [q]);
  return sempit;
}

function Kebun({ sempit }: { sempit: boolean }) {
  const tanaman = susunKebun(sempit ? 6 : 10);
  // Ornamen dijauhkan dari judul & kartu: yang jatuh di pita tengah (26–68%) tidak ditampilkan;
  // di layar sempit hanya ornamen di tepi kiri/kanan yang tampil.
  const ornamen = ORNAMEN.filter(o => (sempit ? o.x <= 7 || o.x >= 90 : o.x < 26 || o.x > 68));
  return (
    <>
      {ornamen.map((o, i) => (
        <div key={`o${i}`} aria-hidden="true" className="pa-gerak pointer-events-none absolute"
          style={{ left: `${o.x}%`, top: `${o.y}%`, width: o.w, height: o.w * 1.5, opacity: 0.9, animation: `paFloaty ${o.dur}s ease-in-out ${o.delay}s infinite` }}>
          <BotanicalStem cfg={o.cfg} />
        </div>
      ))}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1]">
        <div className="absolute rounded-[50%]" style={{ left: '-10%', right: '-10%', bottom: -150, height: 260, background: '#DCEBC4' }} />
        <div className="absolute rounded-[50%]" style={{ left: '-20%', width: '70%', bottom: -170, height: 240, background: '#EEFFD4' }} />
        <div className="absolute rounded-[50%]" style={{ right: '-20%', width: '70%', bottom: -180, height: 250, background: '#EEFFD4' }} />
        {tanaman.map((t, i) => (
          <div key={`t${i}`} className="pa-gerak absolute"
            style={{ left: `${t.left}%`, bottom: t.bottom, width: t.w, height: t.w * 1.5, marginLeft: -t.w / 2, transformOrigin: '50% 100%', animation: `paSway ${t.dur}s ease-in-out ${t.delay}s infinite` }}>
            <BotanicalStem cfg={t.cfg} />
          </div>
        ))}
      </div>
    </>
  );
}

// ── Kartu ────────────────────────────────────────────────────────────────────

const kartuDasar = 'pa-kartu flex flex-col items-center gap-2.5 rounded-[32px] border-2 px-4 pb-[18px] pt-[22px] text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-2';

function KartuAnak({ anak, warna, sempit, terpilih, onPilih }: {
  anak: ProfilAnak; warna: typeof WARNA_ANAK[number]; sempit: boolean; terpilih: boolean; onPilih: () => void;
}) {
  const foto = useFotoAnak(anak.fotoPath);
  const usiaBulan = usiaDalamBulan(anak.tanggalLahir);
  const ringkas = ringkasRentang(usiaBulan);
  const rentang = ringkas ? `Usia ${ringkas.rentang}` : 'Di luar rentang Rekah';
  const av = sempit ? 88 : 112;
  return (
    <button type="button" onClick={onPilih} aria-pressed={terpilih}
      className={`${kartuDasar} bg-white ${terpilih ? 'border-rekah' : 'border-[#FCE3EE] hover:border-rekah'}`}
      style={{ width: sempit ? 'calc(50% - 9px)' : 180, boxShadow: '0 18px 30px -24px #6E3B57' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 26px 36px -24px #F06BA8'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 18px 30px -24px #6E3B57'; }}>
      <span className="flex items-center justify-center overflow-hidden font-fredoka font-bold"
        style={{ width: av, height: av, borderRadius: `${av / 2}px ${av / 2}px ${av / 2}px 16px`, background: warna.bg, color: warna.ink, fontSize: sempit ? 42 : 52 }}>
        {foto ? <img src={foto} alt="" className="h-full w-full object-cover" /> : inisialAnak(anak.namaAnak)}
      </span>
      <span className="mt-1 font-fredoka text-[21px] font-bold leading-tight text-pekat">{anak.namaAnak}</span>
      <span className="-mt-1.5 font-nunito text-[15px] font-bold text-pekat">{formatUsia(usiaBulan)}</span>
      <span className="rounded-full px-[11px] py-[5px] font-nunito text-[12px] font-extrabold" style={{ background: warna.soft, color: warna.ink }}>{rentang}</span>
    </button>
  );
}

function KartuTambah({ sempit, onKlik }: { sempit: boolean; onKlik: () => void }) {
  const av = sempit ? 88 : 112;
  return (
    <button type="button" onClick={onKlik}
      className={`${kartuDasar} border-dashed border-mawar bg-[#FFF6EC] hover:border-rekah`}
      style={{ width: sempit ? 'calc(50% - 9px)' : 180 }}>
      <span className="flex items-center justify-center border-2 border-dashed border-mawar"
        style={{ width: av, height: av, borderRadius: `${av / 2}px ${av / 2}px ${av / 2}px 16px` }}>
        <Plus className="text-rekah" style={{ width: 34, height: 34 }} strokeWidth={2.4} aria-hidden />
      </span>
      <span className="mt-1 font-fredoka text-[21px] font-bold leading-tight text-pekat">Tambah anak</span>
      <span className="-mt-1.5 font-nunito text-[13px] font-bold text-pekat">Tanam bibit baru</span>
    </button>
  );
}

export interface PilihAnakProps {
  onTambahAnak: () => void;
}

export default function PilihAnak({ onTambahAnak }: PilihAnakProps) {
  const { daftarAnak, pilihAnak } = useAnak();
  const sempit = useLayarSempit();
  const [terpilih, setTerpilih] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  // Sapaan diambil dari anak pertama yang punya pendamping terisi. Pendamping
  // tersimpan per anak, dan di layar ini belum ada anak yang dipilih.
  const anakBerpendamping = daftarAnak.find(a => a.pendamping.length > 0);
  const panggilan = anakBerpendamping ? sapaanPendamping(anakBerpendamping.pendamping) : null;

  // Bingkai pink sesaat sebagai tanda terpilih, lalu masuk (langsung bila reduced-motion).
  function pilih(id: string) {
    if (terpilih) return;
    setTerpilih(id);
    const kurangiGerak = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    timer.current = setTimeout(() => pilihAnak(id), kurangiGerak ? 0 : 180);
  }

  return (
    <div className="relative flex flex-col items-center overflow-hidden"
      style={{ minHeight: 'max(100vh, 860px)', background: 'linear-gradient(180deg, #FFF3E6 0%, #FFF3E6 55%, #FCE3EE 100%)' }}>
      <style>{GAYA}</style>
      <Kebun sempit={sempit} />

      <main className="relative z-[2] flex w-full max-w-[1080px] flex-col items-center px-6 pb-[340px] pt-[84px] text-center">
        <p className="font-shantell text-[24px] font-medium text-pekat">{panggilan ? `Halo, ${panggilan}` : 'Halo'}</p>
        <h1 className="mt-2.5 font-fredoka font-bold leading-[1.1] text-pekat"
          style={{ fontSize: 'clamp(34px, 5vw, 52px)', textWrap: 'balance' } as React.CSSProperties}>
          Hari ini menemani siapa?
        </h1>
        <p className="mt-3.5 max-w-[480px] font-nunito text-[17px] font-semibold leading-[1.5] text-pekat" style={{ textWrap: 'pretty' } as React.CSSProperties}>
          Setiap anak punya musim tumbuhnya sendiri, jadi isi berandanya berbeda.
        </p>

        <div className="mt-12 flex w-full flex-wrap justify-center gap-[18px]">
          {daftarAnak.map((anak, i) => (
            <KartuAnak key={anak.id} anak={anak} warna={WARNA_ANAK[i % WARNA_ANAK.length]} sempit={sempit}
              terpilih={terpilih === anak.id} onPilih={() => pilih(anak.id)} />
          ))}
          <KartuTambah sempit={sempit} onKlik={onTambahAnak} />
        </div>

        {daftarAnak.length > 0 && (
          <p className="mt-9 flex items-center gap-2 rounded-full px-4 py-2 font-nunito text-[14px] font-bold text-pekat" style={{ background: '#ffffffcc' }}>
            <Repeat className="h-[15px] w-[15px] flex-none" strokeWidth={2.4} aria-hidden />
            Bisa berpindah anak kapan saja lewat menu di dashboard.
          </p>
        )}
      </main>
    </div>
  );
}

/**
 * Chip anak aktif — mengembalikan ke layar Pilih Anak.
 *
 * Dulu disembunyikan sampai ada dua anak. Itu menutup satu-satunya jalan menuju
 * layar Pilih Anak, dan kartu "Tambah anak" hanya ada di sana — sehingga orang
 * tua dengan satu anak tidak pernah bisa menambah anak kedua. Kini muncul sejak
 * satu anak; karena tombolnya memang menampilkan nama dan foto anak aktif, ia
 * terbaca wajar sebagai chip profil, bukan sebagai pengalih yang tak berguna.
 */
export function TombolGantiAnak({ className = '' }: { className?: string }) {
  const { anakAktif, lepasAnakAktif } = useAnak();
  const foto = useFotoAnak(anakAktif?.fotoPath ?? null);

  if (!anakAktif) return null;

  return (
    <button
      type="button"
      onClick={lepasAnakAktif}
      style={RADIUS_KELOPAK}
      className={`flex min-h-[36px] items-center gap-2 border border-mawar bg-white px-3 text-[12px] font-semibold text-pekat/70 transition hover:border-rekah hover:text-rekah focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah ${className}`}
    >
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden bg-rekah text-[10px] font-bold text-white"
        style={{ borderRadius: '70% 70% 70% 4px' }}
      >
        {foto ? (
          <img src={foto} alt="" className="h-full w-full object-cover" />
        ) : (
          inisialAnak(anakAktif.namaAnak)
        )}
      </span>
      {anakAktif.namaAnak}
      <span className="text-pekat/40">Ganti</span>
    </button>
  );
}
