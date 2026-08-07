// REVIEW: menunggu approval Psikolog Fitri Effendy sebelum rilis
import React from 'react';
import { Check } from 'lucide-react';
import type { ItemBekal, SubTahap, SubTahapId, TipeItem } from '../beranda-usia/bekal';
import type { DomainKey } from '../../data/learningStrategies';
import { DOMAIN_META } from '../../data/learningStrategies';
import { usePilihanHarian } from '../irama-hari/PilihanHarianContext';
import { KOLAM_KEGIATAN } from './content';

// MENUNGGU REVIEW PSIKOLOG FITRI
const LABEL_TIPE: Record<TipeItem, string> = {
  aktivitas:   'Aktivitas',
  alatEdukasi: 'Alat Bermain',
  unduhan:     'Unduhan',
  panduan:     'Panduan',
};

interface PropsKolamKegiatan {
  subTahapDilihat:  SubTahap;
  /** null bila display bekal bukan bekal aktif — semua item baca saja. */
  subTahapAktifId:  SubTahapId | null;
  bersifatBacaSaja: boolean;
}

export default function KolamKegiatan({
  subTahapDilihat,
  subTahapAktifId,
  bersifatBacaSaja,
}: PropsKolamKegiatan) {
  const { pilihanEfektif, tambah, hapus, maksItem } = usePilihanHarian();

  const subTahapIniAktif = !bersifatBacaSaja && subTahapDilihat.id === subTahapAktifId;
  const plafonPenuh = pilihanEfektif.length >= maksItem;

  const itemAnak = subTahapDilihat.kegiatan.filter(i => i.pemilik === 'anak');

  if (itemAnak.length === 0) {
    return (
      <section aria-label={KOLAM_KEGIATAN.judul}>
        <p className="text-[14px] text-pekat/50">{KOLAM_KEGIATAN.kosong}</p>
      </section>
    );
  }

  return (
    <section aria-label={KOLAM_KEGIATAN.judul}>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {itemAnak.map(item => {
          const sudahDipilih = pilihanEfektif.some(p => p.id === item.id);
          const dm = DOMAIN_META[item.domain as DomainKey];
          return (
            <KartuKegiatan
              key={item.id}
              item={item}
              dm={dm}
              subTahapIniAktif={subTahapIniAktif}
              sudahDipilih={sudahDipilih}
              plafonPenuh={plafonPenuh}
              onTambah={tambah}
              onHapus={hapus}
            />
          );
        })}
      </div>
    </section>
  );
}

// ─── Kartu kegiatan — desain card ────────────────────────────────────────────

type DomainMeta = (typeof DOMAIN_META)[DomainKey];

interface PropsKartuKegiatan {
  item:             ItemBekal;
  dm:               DomainMeta | undefined;
  subTahapIniAktif: boolean;
  sudahDipilih:     boolean;
  plafonPenuh:      boolean;
  onTambah:         (item: ItemBekal) => void;
  onHapus:          (id: string) => void;
}

function KartuKegiatan({
  item, dm, subTahapIniAktif, sudahDipilih, plafonPenuh, onTambah, onHapus,
}: PropsKartuKegiatan) {
  const isAdded = sudahDipilih && subTahapIniAktif;

  return (
    <div className={[
      'relative flex flex-col overflow-hidden rounded-[20px] border bg-white',
      'shadow-[0_2px_12px_rgba(110,59,87,0.06)] transition-shadow',
      isAdded ? 'border-daun/40' : 'border-mawar/20',
    ].join(' ')}>

      {/* Header band — warna domain */}
      <div
        className="flex h-[72px] items-center justify-center"
        style={{ background: dm?.bg ?? '#FFF0F7' }}
      >
        <span className="text-4xl" aria-hidden>{dm?.emoji ?? '🌱'}</span>
        {isAdded && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-daun px-2 py-0.5">
            <Check className="h-3 w-3 text-white" strokeWidth={3} aria-hidden />
            <span className="font-nunito text-[10px] font-bold text-white">
              {KOLAM_KEGIATAN.sudahDipilihLabel}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        {/* Domain + tipe */}
        <div className="flex flex-wrap items-center gap-1">
          {dm && (
            <span
              className="rounded-full px-2 py-0.5 font-nunito text-[10px] font-bold"
              style={{ background: dm.bg, color: dm.color }}
            >
              {dm.label}
            </span>
          )}
          <span className="rounded-full bg-kanvas px-2 py-0.5 font-nunito text-[10px] text-pekat/55">
            {LABEL_TIPE[item.tipe]}
          </span>
        </div>

        {/* Judul */}
        <p className="font-bricolage text-[13px] font-semibold leading-snug text-pekat">
          {item.judul}
        </p>

        {/* Durasi */}
        {!!item.perkiraanDurasiMenit && item.perkiraanDurasiMenit > 0 && (
          <p className="text-[11px] text-pekat/45">
            {item.perkiraanDurasiMenit} mnt
          </p>
        )}

        {/* Status baca saja */}
        {!subTahapIniAktif && (
          <p className="mt-auto pt-1 text-[11px] text-pekat/40">
            {KOLAM_KEGIATAN.pesanBacaSaja}
          </p>
        )}

        {/* Plafon penuh */}
        {subTahapIniAktif && !sudahDipilih && plafonPenuh && (
          <p className="mt-auto pt-1 text-[11px] text-pekat/40">
            {KOLAM_KEGIATAN.pesanPlafonPenuh}
          </p>
        )}
      </div>

      {/* Footer aksi */}
      {subTahapIniAktif && (
        <div className="border-t border-mawar/10 px-3 py-2">
          {sudahDipilih ? (
            <button
              type="button"
              onClick={() => onHapus(item.id)}
              aria-label={KOLAM_KEGIATAN.lepasAriaLabel(item.judul)}
              className="flex w-full items-center justify-center gap-1.5 rounded-full bg-daun/10 py-1.5 font-nunito text-[12px] font-semibold text-daun transition hover:bg-daun/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-daun"
            >
              <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
              {KOLAM_KEGIATAN.sudahDipilihLabel}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onTambah(item)}
              disabled={plafonPenuh}
              aria-label={KOLAM_KEGIATAN.tambahAriaLabel(item.judul)}
              className={[
                'flex w-full items-center justify-center gap-1.5 rounded-full py-1.5 font-nunito text-[12px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah',
                plafonPenuh
                  ? 'cursor-not-allowed text-pekat/25'
                  : 'text-rekah hover:bg-rekah/5',
              ].join(' ')}
            >
              + {KOLAM_KEGIATAN.tambahLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
