// REVIEW: menunggu approval Psikolog Fitri Effendy sebelum rilis
import React, { useMemo, useState } from 'react';
import { Check, Info, Sparkles, Star, CalendarDays, BookOpen, RefreshCw } from 'lucide-react';
import type { ItemBekal } from '../beranda-usia/bekal';
import type { BlokWaktu } from './PilihanHarianContext';
import { usePilihanHarian } from './PilihanHarianContext';
import { esItemPapan } from './papanUtil';
import { SUSUNAN_HARI } from './content';
import { CARDS } from '../../pages/DashboardPages/Tier2/knowledgeCardData';
import { getBookColors } from '../../pages/DashboardPages/Tier2/bekalDomainTokens';
import DetailKegiatan from './DetailKegiatan';
import { useRefleksiKegiatan, OPSI_REFLEKSI } from '../../hooks/useRefleksiKegiatan';
import type { HasilRefleksi } from '../../hooks/useRefleksiKegiatan';
import { ACTIVITIES } from '../../data/learningStrategies';
import type { Activity } from '../../data/learningStrategies';

const BLOK_URUTAN: BlokWaktu[] = ['pagi', 'siang', 'sore', 'jelangTidur'];

// Warna dot per blok waktu
const WARNA_BLOK: Record<BlokWaktu, string> = {
  pagi:        'bg-rekah',
  siang:       'bg-blue-400',
  sore:        'bg-violet-400',
  jelangTidur: 'bg-madu',
};

// Latar lembut per domain Ajak Main — konsisten dengan palet Langit Peony
const LATAR_AJAK_MAIN: Record<string, string> = {
  mk:  '#E4EAFB',
  mh:  '#E7F0FE',
  bhs: '#EFE9FA',
  kog: '#FCE3EE',
  sos: '#FDEAF2',
  sen: '#FFF6DE',
  fe:  '#EFE4EC',
};

// Label domain yang ramah (kode → nama) untuk subtitle kartu.
const DOMAIN_LABEL: Record<string, string> = {
  mk: 'Motorik Kasar', mh: 'Motorik Halus', bhs: 'Bahasa', kog: 'Kognitif', sos: 'Sosial', sen: 'Sensorik', fe: 'Fungsi Eksekutif',
};

export default function SusunanHari({ keBoard = false }: { keBoard?: boolean } = {}) {
  const {
    pilihanEfektif, penempatanEfektif, selesaiSet, tandaiSelesai, pindahBlok,
    wawasanIds, wawasanBloks, pindahWawasanBlok, pilihanHarianRaw,
  } = usePilihanHarian();
  const [detailItem, setDetailItem] = useState<ItemBekal | null>(null);
  const refleksi = useRefleksiKegiatan(pilihanHarianRaw.idAnak, pilihanHarianRaw.tanggal);

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
    if (keBoard && esItemPapan(item)) continue; // item papan → tampil di PapanCatatan, bukan blok
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
                        onDetail={() => setDetailItem(item)}
                        hasilRefleksi={refleksi.get(item.id)}
                        onRefleksi={h => refleksi.set(item.id, h)}
                      />
                    ))}
                    {wawasanDiBlok.map(kartu => {
                      const bookColors = getBookColors(kartu.domain);
                      return (
                        <WawasanKartuSusunan
                          key={kartu.id}
                          id={kartu.id}
                          judul={kartu.title}
                          readMinutes={kartu.readMinutes}
                          blokSaat={blok}
                          selesai={selesaiSet.has(kartu.id)}
                          onTandaiSelesai={tandaiSelesai}
                          onPindah={(id, b) => pindahWawasanBlok(id, b)}
                          domainBg={bookColors.soft}
                          domainInk={bookColors.ink}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <DetailKegiatan item={detailItem} onClose={() => setDetailItem(null)} />
    </section>
  );
}

// ADAPT — refleksi menyetir satu saran lembut (reuse variasi kegiatan). Reversible.
function saranAdaptasi(hasil: HasilRefleksi, activity: Activity | null): { judul: string; teks: string } | null {
  switch (hasil) {
    case 'terlalu_sulit':
      return {
        judul: 'Coba versi lebih mudah',
        teks: activity?.variasiMudah?.trim() || 'Perpendek durasi atau kurangi langkah — ikuti tempo si kecil, tanpa buru-buru.',
      };
    case 'menyenangkan':
      return activity?.variasiMenantang?.trim()
        ? { judul: 'Kalau ingin sedikit menantang', teks: activity.variasiMenantang }
        : null;
    case 'ingin_ulang':
      return { judul: 'Diulang', teks: 'Kegiatan ini akan muncul lagi sebagai pilihan — pengulangan justru menguatkan.' };
    case 'kurang_cocok':
      return { judul: 'Cari yang lain', teks: 'Rekah akan menawarkan kegiatan lain dengan tujuan serupa. Coba pilih dari Fokus minggu ini.' };
    default:
      return null;
  }
}

interface PropsKegiatanKartu {
  item: ItemBekal;
  blok: BlokWaktu;
  selesai: boolean;
  onSelesai: (id: string) => void;
  onPindah: (id: string, blok: BlokWaktu | null) => void;
  onDetail: () => void;
  hasilRefleksi: HasilRefleksi | null;
  onRefleksi: (hasil: HasilRefleksi | null) => void;
}

function KegiatanKartu({ item, blok, selesai, onSelesai, onPindah, onDetail, hasilRefleksi, onRefleksi }: PropsKegiatanKartu) {
  const [pickerTerbuka, setPickerTerbuka] = useState(false);
  const { kolamAnak, pilihanEfektif, tambah, hapus } = usePilihanHarian();
  const [gantiTerbuka, setGantiTerbuka] = useState(false);
  const alternatif = useMemo(
    () => kolamAnak.filter(i =>
      i.tipe === 'aktivitas' && i.domain === item.domain && i.id !== item.id &&
      !pilihanEfektif.some(p => p.id === i.id)
    ).slice(0, 3),
    [kolamAnak, pilihanEfektif, item.domain, item.id],
  );
  const activity = useMemo(
    () => (item.tipe === 'aktivitas' ? ACTIVITIES.find(a => String(a.id) === item.sumberId) ?? null : null),
    [item.tipe, item.sumberId],
  );
  const saran = hasilRefleksi ? saranAdaptasi(hasilRefleksi, activity) : null;

  const kat: 'momen' | 'kegiatan' | 'rencana' = item.kustom ? (item.kategoriKustom ?? 'kegiatan') : 'kegiatan';
  const IconKiri = kat === 'momen' ? Sparkles : kat === 'rencana' ? CalendarDays : Star;
  const gaya = kat === 'momen'
    ? { bg: '#FFF3D9', ink: '#C79020' }
    : kat === 'rencana'
      ? { bg: '#FDEAF2', ink: '#D04595' }
      : { bg: '#E4EFFD', ink: '#5F84E6' };
  const subtitle = item.kustom
    ? `${kat === 'momen' ? 'Momen sehari-hari' : kat === 'rencana' ? 'Rencana' : 'Kegiatan kamu'}${item.keteranganKapan ? ` · ${item.keteranganKapan}` : ''}`
    : `${DOMAIN_LABEL[item.domain as string] ?? item.domain}${item.perkiraanDurasiMenit !== undefined && item.perkiraanDurasiMenit > 0 ? ` · ${item.perkiraanDurasiMenit} mnt` : ''}`;

  return (
    <div className="relative flex items-start gap-2.5 rounded-[12px] px-3 py-2.5 pr-10" style={{ backgroundColor: LATAR_AJAK_MAIN[item.domain as string] ?? '#FAF5F8' }}>
      {/* Ikon jenis aktivitas (kiri) */}
      <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px]" style={{ background: gaya.bg, color: gaya.ink }} aria-hidden>
        <IconKiri className="h-4 w-4" strokeWidth={2.5} />
      </span>

      {/* Tombol bulat selesai — pojok kanan atas */}
      <button
        type="button"
        onClick={() => onSelesai(item.id)}
        aria-pressed={selesai}
        aria-label={selesai ? 'Tandai belum dilakukan' : 'Berhasil dilakukan'}
        title={selesai ? 'Sudah dilakukan' : 'Berhasil dilakukan'}
        className={[
          'absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full border-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah motion-reduce:transition-none',
          selesai ? 'border-daun bg-daun text-white' : 'border-pekat/25 bg-white/70 text-transparent hover:border-daun',
        ].join(' ')}
      >
        <Check className="h-4 w-4" strokeWidth={3} />
      </button>

      <div className="min-w-0 flex-1">
        <p className={`text-[13px] font-semibold leading-snug ${selesai ? 'line-through opacity-50' : 'text-pekat'}`}>{item.judul}</p>
        <p className="mt-0.5 text-[11px] text-ink-soft">{subtitle}</p>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {/* Detail kegiatan — hanya item non-kustom */}
        {!item.kustom && (
          <button
            type="button"
            onClick={onDetail}
            aria-label="Detail kegiatan"
            title="Detail kegiatan"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/70 text-pekat/55 transition hover:bg-rekah/10 hover:text-rekah motion-reduce:transition-none"
          >
            <Info className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
        )}

        {/* Ganti kegiatan — tukar dengan alternatif kapabilitas sama */}
        {!item.kustom && alternatif.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setGantiTerbuka(p => !p)}
              aria-label="Ganti kegiatan"
              title="Ganti kegiatan"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/70 text-pekat/55 transition hover:bg-rekah/10 hover:text-rekah motion-reduce:transition-none"
            >
              <RefreshCw className="h-3.5 w-3.5" strokeWidth={2.5} />
            </button>
            {gantiTerbuka && (
              <div role="dialog" className="absolute left-0 top-6 z-20 w-60 rounded-[12px] border border-bordergray bg-white p-1.5 shadow-md">
                <p className="px-2 py-1 font-nunito text-[10px] font-[800] uppercase tracking-wide text-pekat/40">Alternatif serupa</p>
                {alternatif.map(alt => (
                  <button
                    key={alt.id}
                    type="button"
                    onClick={() => { hapus(item.id); tambah(alt); onPindah(alt.id, blok); setGantiTerbuka(false); }}
                    className="block w-full rounded-lg px-2.5 py-1.5 text-left text-[12px] text-pekat hover:bg-kanvas"
                  >
                    {alt.judul}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setGantiTerbuka(false)}
                  className="mt-0.5 w-full border-t border-bordergray pt-1 text-left text-[11px] text-ink-soft"
                >
                  Tutup
                </button>
              </div>
            )}
          </div>
        )}

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

      {/* REFLECT — refleksi lembut satu-ketuk, muncul setelah kegiatan dilakukan */}
      {selesai && (
        <div className="mt-2 border-t border-white/60 pt-2">
          <p className="mb-1.5 font-nunito text-[11px] font-bold text-pekat/50">Bagaimana tadi?</p>
          <div className="flex flex-wrap gap-1.5">
            {OPSI_REFLEKSI.map(o => {
              const aktif = hasilRefleksi === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => onRefleksi(aktif ? null : o.id)}
                  aria-pressed={aktif}
                  className={[
                    'rounded-full px-2.5 py-1 text-[11px] font-semibold transition motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah',
                    aktif ? 'bg-rekah text-white' : 'bg-white/70 text-pekat/60 hover:bg-rekah/10 hover:text-rekah',
                  ].join(' ')}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
          {saran && (
            <div className="mt-2 rounded-[12px] border border-rekah/15 bg-rekah/[0.06] px-3 py-2">
              <p className="font-nunito text-[10.5px] font-extrabold uppercase tracking-wide text-rekah-tua">
                Rekah menyesuaikan &middot; {saran.judul}
              </p>
              <p className="mt-0.5 font-nunito text-[12.5px] leading-relaxed text-pekat/75">{saran.teks}</p>
            </div>
          )}
        </div>
      )}
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
  domainBg: string;
  domainInk: string;
}

function WawasanKartuSusunan({ id, judul, readMinutes, blokSaat, selesai, onTandaiSelesai, onPindah, domainBg, domainInk }: PropsWawasanKartuSusunan) {
  const [pickerTerbuka, setPickerTerbuka] = useState(false);

  return (
    <div className="relative flex items-start gap-2.5 rounded-[12px] px-3 py-2.5 pr-10" style={{ backgroundColor: domainBg, border: `1.5px solid ${domainInk}22` }}>
      {/* Ikon Wawasan Tumbuh (kiri) */}
      <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px]" style={{ background: `${domainInk}22`, color: domainInk }} aria-hidden>
        <BookOpen className="h-4 w-4" strokeWidth={2.5} />
      </span>

      {/* Tombol bulat — pojok kanan atas */}
      <button
        type="button"
        onClick={() => onTandaiSelesai(id)}
        aria-pressed={selesai}
        aria-label={selesai ? 'Tandai belum dibaca' : 'Sudah dibaca'}
        title={selesai ? 'Sudah dibaca' : 'Tandai sudah dibaca'}
        className={[
          'absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full border-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah motion-reduce:transition-none',
          selesai ? 'border-daun bg-daun text-white' : 'border-pekat/25 bg-white/70 text-transparent hover:border-daun',
        ].join(' ')}
      >
        <Check className="h-4 w-4" strokeWidth={3} />
      </button>

      <div className="min-w-0 flex-1">
        <span className="inline-block rounded-full px-2 py-0.5 font-nunito text-[10px] font-[800] uppercase tracking-wider" style={{ backgroundColor: `${domainInk}22`, color: domainInk }}>
          Wawasan Tumbuh
        </span>
        <p className="mt-1 text-[13px] font-semibold leading-snug text-pekat">{judul}</p>
        <p className="mt-0.5 text-[11px] text-pekat/50">{readMinutes} mnt membaca</p>

        <div className="mt-2 flex items-center gap-3">
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
    </div>
  );
}
