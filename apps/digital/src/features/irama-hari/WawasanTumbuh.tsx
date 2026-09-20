// REVIEW: menunggu approval Psikolog Fitri Effendy sebelum rilis
import React, { useMemo, useState } from 'react';
import { X, BookOpen, Plus } from 'lucide-react';
import FilterSubUsia, { resolveSubUsia, SUB_USIA_TO_AGE_KEY } from '../../components/FilterSubUsia';
import type { IdSubUsia } from '../../components/FilterSubUsia';
import { CARDS } from '../../pages/DashboardPages/Tier2/knowledgeCardData';
import type { KnowledgeCard } from '../../pages/DashboardPages/Tier2/knowledgeCardData';
import { getBookColors, DOMAIN_CODE_LABEL } from '../../pages/DashboardPages/Tier2/bekalDomainTokens';
import { usePilihanHarian } from './PilihanHarianContext';
import BotanicalStem from '../../components/BotanicalStem';

const SPRIG_CFG = { type: 'sprig' as const, bloom: '#C79020', bloom2: '#FFE29A' };

// ─── Buku 3D mini ─────────────────────────────────────────────────────────────

function BukuMini({ kartu }: { kartu: KnowledgeCard }) {
  const { soft, ink, blob, coverLo, spineHi, spineDark } = getBookColors(kartu.domain);
  const domainLabel = DOMAIN_CODE_LABEL[kartu.domain] ?? kartu.domain;
  const W = 96, H = 124, SPINE = 14;

  return (
    <div style={{ perspective: 540, width: W, height: H + 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <div style={{
        position: 'relative', width: W, height: H,
        transformStyle: 'preserve-3d',
        transform: 'rotateY(26deg) translateY(-4px)',
      }}>
        {/* Ground shadow */}
        <div style={{ position: 'absolute', left: '6%', bottom: -12, width: '88%', height: 16, background: 'rgba(90,50,70,.22)', filter: 'blur(8px)', borderRadius: '50%' }} />

        {/* Pages right */}
        <div style={{ position: 'absolute', top: 4, right: -SPINE / 2, width: SPINE, height: H - 5, transform: 'rotateY(90deg)', background: 'repeating-linear-gradient(to bottom,#F7F0E1 0 2px,#DCCBB0 2px 4px)', borderRadius: 2 }} />

        {/* Spine left */}
        <div style={{ position: 'absolute', top: 0, left: -SPINE / 2, width: SPINE, height: H, transform: 'rotateY(90deg)', background: `linear-gradient(90deg,${spineHi},${ink} 32%,${spineDark})`, borderRadius: 2 }}>
          <div style={{ position: 'absolute', top: 12, left: 0, right: 0, height: 1, background: 'rgba(255,255,255,.4)' }} />
          <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, height: 1, background: 'rgba(255,255,255,.4)' }} />
        </div>

        {/* Cover face */}
        <div style={{
          position: 'absolute', inset: 0, transform: `translateZ(${SPINE / 2}px)`,
          borderRadius: '3px 10px 10px 3px', overflow: 'hidden',
          border: `1.5px solid rgba(110,59,87,.12)`,
          background: `linear-gradient(135deg,${soft},${coverLo})`,
          boxShadow: 'inset 3px 0 0 rgba(0,0,0,.05)',
        }}>
          {/* Blob */}
          <div style={{ position: 'absolute', right: -24, bottom: -24, width: 84, height: 84, borderRadius: '50%', background: blob, opacity: .45 }} />
          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1, padding: '8px 8px 8px 10px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 5 }}>
            <div style={{ fontFamily: 'Nunito, system-ui', fontWeight: 800, fontSize: 8, letterSpacing: 0.8, color: ink, textTransform: 'uppercase' }}>{domainLabel}</div>
            <div style={{ fontFamily: 'Fredoka, system-ui', fontWeight: 700, fontSize: 10, lineHeight: 1.25, color: '#6E3B57', textTransform: 'uppercase' }}>
              {kartu.title.length > 28 ? kartu.title.slice(0, 26) + '…' : kartu.title}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Age band mapping (mirip KnowledgeGallery)
const AGE_BAND_KEYS: ReadonlyArray<{ maxMonths: number; keys: string[] }> = [
  { maxMonths: 12, keys: ['0-3m', '3-6m', '6-9m', '9-12m'] },
  { maxMonths: 24, keys: ['12-18m', '18-24m'] },
  { maxMonths: 36, keys: ['2-3y'] },
  { maxMonths: 48, keys: ['3-4y'] },
  { maxMonths: 60, keys: ['4-5y'] },
  { maxMonths: Infinity, keys: ['5-6y'] },
];

function allowedAgeKeys(usiaBulan: number): Set<string> {
  for (const band of AGE_BAND_KEYS) {
    if (usiaBulan <= band.maxMonths) return new Set(band.keys);
  }
  return new Set(['5-6y']);
}

interface PropsWawasanTumbuh {
  usiaBulan: number;
  idAnak: string;
}

export default function WawasanTumbuh({ usiaBulan, idAnak }: PropsWawasanTumbuh) {
  const { wawasanIds, pilihWawasan } = usePilihanHarian();
  const [showBrowse, setShowBrowse] = useState(false);

  const kartuSesuaiUsia = useMemo(() => {
    const allowed = allowedAgeKeys(usiaBulan);
    return CARDS.filter(c => allowed.has(c.ageKey) && c.summary);
  }, [usiaBulan]);

  const kartuTerpilih = useMemo(
    () => wawasanIds.flatMap(id => { const c = CARDS.find(k => k.id === id); return c ? [c] : []; }),
    [wawasanIds],
  );

  const sudahDipilih = wawasanIds.length > 0;

  return (
    <section
      className="relative overflow-hidden rounded-[20px] bg-madu/40 p-5"
      aria-labelledby="wawasan-tumbuh-judul"
    >
      {/* Sprig botanical decoration */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-4 opacity-40"
        style={{ width: '52px', height: '82px' }}
      >
        <BotanicalStem cfg={SPRIG_CFG} />
      </div>

      {/* Header: label + judul + tombol tambah */}
      <div className="mb-3 flex items-center gap-2">
        <p className="font-nunito text-[11px] font-[800] uppercase tracking-widest text-pekat/50">
          Untuk Bunda/Ayah/Caregiver
        </p>
      </div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2
          id="wawasan-tumbuh-judul"
          className="font-bricolage text-[15px] font-bold text-pekat"
        >
          Pelajari Wawasan Tumbuh hari ini
        </h2>
        <button
          type="button"
          onClick={() => setShowBrowse(true)}
          className="flex flex-shrink-0 items-center gap-1 rounded-full bg-[#E0A21F] px-3 py-1.5 font-nunito text-[12px] font-bold text-white transition hover:bg-[#C79020]"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
          Tambah
        </button>
      </div>

      {kartuSesuaiUsia.length === 0 ? (
        <p className="font-nunito text-[14px] text-pekat/60">
          Belum ada konten tersedia untuk usia ini.
        </p>
      ) : !sudahDipilih ? (
        /* Belum ada buku dijadwalkan */
        <p className="font-nunito text-[14px] leading-relaxed text-pekat/55">
          Belum ada buku yang ingin dipelajari hari ini. Tap{' '}
          <span className="font-bold text-[#C79020]">+ Tambah</span>{' '}
          untuk menjadwalkan.
        </p>
      ) : (
        /* Buku sudah dipilih — 3 kolom horizontal */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {kartuTerpilih.map(kartu => (
            <div key={kartu.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <BukuMini kartu={kartu} />
              <button
                type="button"
                onClick={() => pilihWawasan(kartu.id)}
                className="flex items-center gap-0.5 font-nunito text-[11px] font-semibold text-pekat/40 hover:text-rekah"
              >
                <X className="h-3 w-3" />
                Hapus
              </button>
            </div>
          ))}
        </div>
      )}

      {showBrowse && (
        <BrowsePopup
          kartu={kartuSesuaiUsia}
          terpilihIds={wawasanIds}
          usiaBulan={usiaBulan}
          onPilih={id => { pilihWawasan(id); }}
          onTutup={() => setShowBrowse(false)}
        />
      )}
    </section>
  );
}

interface PropsBrowsePopup {
  kartu: KnowledgeCard[];
  terpilihIds: string[];
  usiaBulan: number;
  onPilih: (id: string) => void;
  onTutup: () => void;
}

function BrowsePopup({ kartu, terpilihIds, usiaBulan, onPilih, onTutup }: PropsBrowsePopup) {
  const isYearOne = usiaBulan < 12;
  const [subUsia, setSubUsia] = useState<IdSubUsia>(
    () => resolveSubUsia(usiaBulan),
  );

  const kartuFiltered = useMemo(() => {
    if (!isYearOne) return kartu;
    const targetKey = SUB_USIA_TO_AGE_KEY[subUsia];
    return kartu.filter(c => c.ageKey === targetKey);
  }, [kartu, isYearOne, subUsia]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ background: 'rgba(110,59,87,0.28)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onTutup(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Pilih Wawasan Tumbuh"
        className="flex w-full max-w-lg flex-col rounded-t-[28px] bg-white shadow-[0_-8px_40px_rgba(110,59,87,0.18)] sm:rounded-[24px] sm:shadow-[0_8px_40px_rgba(110,59,87,0.18)] focus:outline-none"
        style={{ maxHeight: '88dvh' }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bricolage text-[17px] font-bold text-pekat">Pilih buku</p>
              <p className="text-[12px] text-pekat/50">Wawasan Tumbuh sesuai usia anak</p>
            </div>
            <button
              type="button"
              aria-label="Tutup"
              onClick={onTutup}
              className="flex h-8 w-8 items-center justify-center rounded-full text-pekat/40 hover:bg-mawar/20 hover:text-pekat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Filter sub tahap usia */}
          {isYearOne && (
            <FilterSubUsia nilai={subUsia} onPilih={setSubUsia} />
          )}
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto px-5 pb-6">
          {kartuFiltered.length === 0 ? (
            <p className="py-10 text-center text-[14px] text-pekat/45">
              Belum ada konten tersedia untuk usia ini.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {kartuFiltered.map(c => {
                const dipilih = terpilihIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onPilih(c.id)}
                    className={[
                      'flex items-start gap-3 rounded-[16px] border p-3 text-left transition',
                      dipilih
                        ? 'border-madu bg-madu/20'
                        : 'border-bordergray bg-white hover:border-madu/50 hover:bg-madu/10',
                    ].join(' ')}
                  >
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] ${dipilih ? 'bg-madu/40' : 'bg-madu/20'}`}>
                      <BookOpen className="h-4 w-4 text-[#E0A21F]" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bricolage text-[13px] font-semibold leading-snug text-pekat">
                        {c.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-pekat/45">
                        {c.readMinutes} mnt
                        {dipilih && <span className="ml-2 font-semibold text-[#C79020]">Dipilih</span>}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
