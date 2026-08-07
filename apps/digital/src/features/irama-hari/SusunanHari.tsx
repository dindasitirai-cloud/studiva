// REVIEW: menunggu approval Psikolog Fitri Effendy sebelum rilis
import React, { useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { ItemBekal } from '../beranda-usia/bekal';
import type { BlokWaktu } from './PilihanHarianContext';
import { usePilihanHarian } from './PilihanHarianContext';
import { SUSUNAN_HARI } from './content';
import { CARDS } from '../../pages/DashboardPages/Tier2/knowledgeCardData';

const BLOK_URUTAN: BlokWaktu[] = ['pagi', 'siang', 'sore', 'jelangTidur'];

// Warna dot per blok waktu
const WARNA_BLOK: Record<BlokWaktu, string> = {
  pagi:        'bg-rekah',
  siang:       'bg-blue-400',
  sore:        'bg-violet-400',
  jelangTidur: 'bg-madu',
};

// Warna bg kartu item per blok
const BG_ITEM: Record<BlokWaktu, string> = {
  pagi:        'bg-mawar/40',
  siang:       'bg-blue-50',
  sore:        'bg-violet-50',
  jelangTidur: 'bg-amber-50',
};

export default function SusunanHari() {
  const {
    pilihanEfektif, penempatanEfektif, selesaiSet, tandaiSelesai, pindahBlok,
    wawasanIds, wawasanBloks, pindahWawasanBlok,
  } = usePilihanHarian();

  const wawasanKartus = useMemo(
    () => wawasanIds.flatMap(id => { const c = CARDS.find(k => k.id === id); return c ? [c] : []; }),
    [wawasanIds],
  );

  const itemPerBlok: Record<BlokWaktu, ItemBekal[]> = {
    pagi:        [],
    siang:       [],
    sore:        [],
    jelangTidur: [],
  };

  for (const item of pilihanEfektif) {
    const blok = penempatanEfektif[item.id];
    if (blok) itemPerBlok[blok].push(item);
  }

  let sudahAdaBlokKosong = false;

  return (
    <section aria-labelledby="susunan-hari-judul">
      <h2
        id="susunan-hari-judul"
        className="mb-1 font-bricolage text-[18px] font-bold text-pekat"
      >
        {SUSUNAN_HARI.judul}
      </h2>
      <p className="mb-4 text-[13px] leading-relaxed text-ink-soft">
        Empat blok yang mengikuti irama {/* sapaan — TODO: inject namaAnak */}— bukan jam.
      </p>

      <div className="rounded-[20px] border border-bordergray bg-white">
        {BLOK_URUTAN.map((blok, idx) => {
          const items = itemPerBlok[blok];
          const wawasanDiBlok = wawasanKartus.filter(c => (wawasanBloks[c.id] ?? 'jelangTidur') === blok);
          const showWawasan = wawasanDiBlok.length > 0;
          const isEmpty = items.length === 0 && !showWawasan;
          let pesanKosong = '';
          if (isEmpty) {
            pesanKosong = sudahAdaBlokKosong
              ? SUSUNAN_HARI.blokKosongLainnya
              : SUSUNAN_HARI.blokKosongPertama;
            sudahAdaBlokKosong = true;
          }

          return (
            <div
              key={blok}
              className={`flex items-start gap-4 px-5 py-4 ${idx < BLOK_URUTAN.length - 1 ? 'border-b border-bordergray/60' : ''}`}
            >
              {/* Label blok */}
              <div className="flex w-[88px] flex-shrink-0 items-center gap-2 pt-0.5">
                <span
                  className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${WARNA_BLOK[blok]}`}
                  aria-hidden
                />
                <span className="text-[13px] font-semibold text-pekat">
                  {SUSUNAN_HARI.blokLabel[blok]}
                </span>
              </div>

              {/* Konten */}
              <div className="flex-1">
                {isEmpty ? (
                  <p className="pt-0.5 text-[13px] italic text-ink-soft">{pesanKosong}</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {items.map(item => (
                      <KegiatanKartu
                        key={item.id}
                        item={item}
                        blok={blok}
                        selesai={selesaiSet.has(item.id)}
                        onSelesai={tandaiSelesai}
                        onPindah={pindahBlok}
                      />
                    ))}
                    {wawasanDiBlok.map(kartu => (
                      <WawasanKartuSusunan
                        key={kartu.id}
                        id={kartu.id}
                        judul={kartu.title}
                        readMinutes={kartu.readMinutes}
                        blokSaat={blok}
                        selesai={selesaiSet.has(kartu.id)}
                        onTandaiSelesai={tandaiSelesai}
                        onPindah={(id, b) => pindahWawasanBlok(id, b)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

interface PropsKegiatanKartu {
  item: ItemBekal;
  blok: BlokWaktu;
  selesai: boolean;
  onSelesai: (id: string) => void;
  onPindah: (id: string, blok: BlokWaktu | null) => void;
}

function KegiatanKartu({ item, blok, selesai, onSelesai, onPindah }: PropsKegiatanKartu) {
  const [pickerTerbuka, setPickerTerbuka] = useState(false);

  return (
    <div className={`rounded-[12px] px-3 py-2.5 ${BG_ITEM[blok]}`}>
      <p
        className={`text-[13px] font-semibold leading-snug ${selesai ? 'line-through opacity-50' : 'text-pekat'}`}
      >
        {item.judul}
      </p>
      <div className="mt-0.5 flex items-center gap-1.5">
        <span className="text-[11px] text-ink-soft">
          {item.domain}
          {item.perkiraanDurasiMenit !== undefined && item.perkiraanDurasiMenit > 0
            ? ` · ${item.perkiraanDurasiMenit} mnt`
            : ''}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-2">
        {/* Berhasil dilakukan */}
        <button
          type="button"
          onClick={() => onSelesai(item.id)}
          aria-pressed={selesai}
          className={[
            'flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold transition',
            selesai
              ? 'bg-daun/15 text-daun'
              : 'bg-white/70 text-pekat/55 hover:bg-daun/10 hover:text-daun',
          ].join(' ')}
        >
          <CheckCircle2 className="h-3 w-3" strokeWidth={2.5} />
          {selesai ? 'Sudah dilakukan' : 'Berhasil dilakukan'}
        </button>

        {/* Picker pindah */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setPickerTerbuka(p => !p)}
            className="text-[11px] text-rekah/60 hover:text-rekah"
          >
            {SUSUNAN_HARI.pindahBlokLabel}
          </button>
          {pickerTerbuka && (
            <div
              role="dialog"
              className="absolute left-0 top-5 z-10 flex flex-col gap-0.5 rounded-[12px] border border-bordergray bg-white p-1.5 shadow-md"
            >
              {BLOK_URUTAN.map(b => (
                <button
                  key={b}
                  type="button"
                  disabled={b === blok}
                  onClick={() => { onPindah(item.id, b); setPickerTerbuka(false); }}
                  className={`rounded-lg px-3 py-1.5 text-left text-[12px] ${
                    b === blok ? 'cursor-default font-bold text-rekah' : 'text-pekat hover:bg-kanvas'
                  }`}
                >
                  {SUSUNAN_HARI.blokLabel[b]}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPickerTerbuka(false)}
                className="mt-0.5 border-t border-bordergray pt-1 text-[11px] text-ink-soft"
              >
                {SUSUNAN_HARI.tutupPickerLabel}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface PropsWawasanKartuSusunan {
  id: string;
  judul: string;
  readMinutes: number;
  blokSaat: BlokWaktu;
  selesai: boolean;
  onTandaiSelesai: (id: string) => void;
  onPindah: (id: string, blok: BlokWaktu) => void;
}

function WawasanKartuSusunan({ id, judul, readMinutes, blokSaat, selesai, onTandaiSelesai, onPindah }: PropsWawasanKartuSusunan) {
  const [pickerTerbuka, setPickerTerbuka] = useState(false);

  return (
    <div className="rounded-[12px] border border-madu/40 bg-madu/20 px-3 py-2.5">
      <div className="mb-1 flex items-center gap-1.5">
        <span className="rounded-full bg-madu/50 px-2 py-0.5 font-nunito text-[10px] font-[800] uppercase tracking-wider text-pekat/60">
          Wawasan Tumbuh
        </span>
      </div>
      <p className="text-[13px] font-semibold leading-snug text-pekat">{judul}</p>
      <p className="mt-0.5 text-[11px] text-pekat/50">{readMinutes} mnt membaca</p>

      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() => onTandaiSelesai(id)}
          className={`flex items-center gap-1 rounded-full px-3 py-1 font-nunito text-[11px] font-semibold transition ${
            selesai
              ? 'bg-daun/20 text-daun'
              : 'bg-madu/30 text-pekat/60 hover:bg-madu/50'
          }`}
        >
          <CheckCircle2 className="h-3 w-3" />
          {selesai ? 'Sudah dilakukan' : 'Berhasil dilakukan'}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setPickerTerbuka(p => !p)}
            className="text-[11px] text-rekah/60 hover:text-rekah"
          >
            {SUSUNAN_HARI.pindahBlokLabel}
          </button>
          {pickerTerbuka && (
            <div
              role="dialog"
              className="absolute left-0 top-5 z-10 flex flex-col gap-0.5 rounded-[12px] border border-bordergray bg-white p-1.5 shadow-md"
            >
              {BLOK_URUTAN.map(b => (
                <button
                  key={b}
                  type="button"
                  disabled={b === blokSaat}
                  onClick={() => { onPindah(id, b); setPickerTerbuka(false); }}
                  className={`rounded-lg px-3 py-1.5 text-left text-[12px] ${
                    b === blokSaat ? 'cursor-default font-bold text-rekah' : 'text-pekat hover:bg-kanvas'
                  }`}
                >
                  {SUSUNAN_HARI.blokLabel[b]}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPickerTerbuka(false)}
                className="mt-0.5 border-t border-bordergray pt-1 text-[11px] text-ink-soft"
              >
                {SUSUNAN_HARI.tutupPickerLabel}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
