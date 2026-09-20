// Papan Catatan — kolom kanan tab Overall Kelola (Phase 14).
// Sticky notes untuk item TIDAK terikat waktu: kegiatan Temani, strategi Bantu,
// rencana kamu, catatan manual caregiver, + pengingat imunisasi (Buku KIA), + kartu
// Kebiasaan Baik (versi compact — dengan lambang bunga). Additive. Copy DRAFT.
import React, { useMemo, useState } from 'react';
import { Check, X, Plus } from 'lucide-react';
import type { ItemBekal } from '../beranda-usia/bekal';
import { usePilihanHarian } from './PilihanHarianContext';
import { esItemPapan, sumberPapan, JADWAL_KIA_2024 } from './papanUtil';
import type { SumberPapan } from './papanUtil';
import KartuKebiasaanBaik from './KartuKebiasaanBaik';

const WARNA: Record<SumberPapan | 'pengingat', string> = {
  temani: '#FCE0EC', bantu: '#EBE3FA', rencana: '#DCEBFB', catatan: '#FBEFD8', pengingat: '#FFF0C7',
};
const TAG: Record<SumberPapan | 'pengingat', string> = {
  temani: '🤍 Temani', bantu: '🆘 Bantu', rencana: '📅 Rencana', catatan: '📝 Catatan', pengingat: '🔔 Pengingat Rekah',
};
const ROT = ['-1.4deg', '1deg', '-0.5deg', '1.3deg'];

function Note({ warna, rot, children }: { warna: string; rot: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-[128px] flex-col rounded-[12px] p-3 shadow-[0_8px_18px_-10px_rgba(90,50,70,0.45)]" style={{ background: warna, transform: `rotate(${rot})` }}>
      {children}
    </div>
  );
}
function Tag({ label }: { label: string }) {
  return <span className="self-start rounded-[6px] bg-white/60 px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wide text-[#3A2230]/80">{label}</span>;
}

export interface PropsPapan {
  usiaBulan: number;
  nama: string;
  habitProps: React.ComponentProps<typeof KartuKebiasaanBaik>;
}

export default function PapanCatatan({ usiaBulan, habitProps }: PropsPapan) {
  const { pilihanEfektif, selesaiSet, tandaiSelesai, hapus, tambahKustom } = usePilihanHarian();
  const [tulis, setTulis] = useState(false);
  const [judul, setJudul] = useState('');

  const items = useMemo(() => pilihanEfektif.filter(esItemPapan), [pilihanEfektif]);
  const vaksin = JADWAL_KIA_2024[usiaBulan] ?? null;

  const simpanCatatan = () => {
    const t = judul.trim();
    if (!t) return;
    const id = `catatan-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const item: ItemBekal = {
      id, judul: t, tipe: 'aktivitas', domain: 'sos', nilai: [], pemilik: 'anak', sumberId: id,
      kustom: true, kategoriKustom: 'rencana', keteranganKapan: 'Catatan',
    };
    tambahKustom(item);
    setJudul(''); setTulis(false);
  };

  let idx = 0;
  const rot = () => ROT[idx++ % ROT.length];

  return (
    <div className="rounded-[20px] border border-dashed border-[#E6C9AE] bg-[#FBF4EA] p-4">
      <div className="mb-3 flex items-center justify-between px-1">
        <div>
          <p className="font-fredoka text-[15px] font-semibold text-pekat">Papan catatan</p>
          <p className="font-nunito text-[11px] text-pekat/55">Kapan saja — tidak terikat waktu</p>
        </div>
        {!tulis && (
          <button type="button" onClick={() => setTulis(true)} className="rounded-[12px] border border-dashed border-[#d9a7c2] bg-white px-3 py-1.5 font-nunito text-[12px] font-extrabold text-rekah-tua">+ Tambah catatan</button>
        )}
      </div>

      {tulis && (
        <div className="mb-3 rounded-[12px] border border-rekah/20 bg-white p-3">
          <input autoFocus value={judul} onChange={e => setJudul(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') simpanCatatan(); }}
            placeholder="Tulis pengingat / catatan…" className="w-full rounded-[10px] border border-bordergray px-3 py-2 font-nunito text-[13px] text-pekat focus:outline-none focus:ring-2 focus:ring-langit" />
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={simpanCatatan} className="rounded-[10px] bg-rekah px-3.5 py-1.5 font-nunito text-[12px] font-extrabold text-white">Simpan</button>
            <button type="button" onClick={() => { setTulis(false); setJudul(''); }} className="rounded-[10px] border border-bordergray px-3.5 py-1.5 font-nunito text-[12px] font-extrabold text-pekat/55">Batal</button>
          </div>
        </div>
      )}

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
        {vaksin && (
          <Note warna={WARNA.pengingat} rot={rot()}>
            <Tag label={TAG.pengingat} />
            <h4 className="mt-2 font-fredoka text-[14px] font-semibold text-[#3A2230]">Imunisasi {usiaBulan} bulan</h4>
            <p className="mt-1.5 flex-1 font-shantell text-[12.5px] leading-snug text-[#4a3340]">{vaksin.join(' · ')}</p>
            <div className="my-1.5 border-t border-dashed border-[#3A2230]/25" />
            <p className="text-[9.5px] font-bold text-[#3A2230]/55">Buku KIA 2024 · tinggal jadwalkan</p>
          </Note>
        )}

        {items.map(it => {
          const s = sumberPapan(it);
          const done = selesaiSet.has(it.id);
          return (
            <Note key={it.id} warna={WARNA[s]} rot={rot()}>
              <div className="flex items-start justify-between gap-2">
                <Tag label={TAG[s]} />
                <button type="button" aria-label="Hapus" onClick={() => hapus(it.id)} className="text-[#3A2230]/35 hover:text-[#3A2230]/70"><X className="h-3.5 w-3.5" /></button>
              </div>
              <div className="mt-2 flex items-start gap-2">
                <button type="button" aria-pressed={done} onClick={() => tandaiSelesai(it.id)}
                  className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full border-2 ${done ? 'border-daun bg-daun text-white' : 'border-[#3A2230]/25 bg-white/60'}`}>
                  {done && <Check className="h-3 w-3" />}
                </button>
                <h4 className={`font-fredoka text-[13.5px] font-semibold leading-tight text-[#3A2230] ${done ? 'line-through opacity-55' : ''}`}>{it.judul}</h4>
              </div>
              {it.deskripsiKustom && <p className="mt-1.5 flex-1 font-shantell text-[12.5px] leading-snug text-[#4a3340]">{it.deskripsiKustom}</p>}
              <div className="my-1.5 border-t border-dashed border-[#3A2230]/25" />
              <p className="text-[9.5px] font-bold text-[#3A2230]/55">{s === 'catatan' ? 'Catatan kamu' : it.keteranganKapan || 'Rencana kamu'}</p>
            </Note>
          );
        })}

        {!tulis && (
          <button type="button" onClick={() => setTulis(true)} className="flex min-h-[128px] flex-col items-center justify-center gap-1.5 rounded-[12px] border-2 border-dashed border-[#d9c4a6] font-nunito text-[12.5px] font-extrabold text-[#a98a63]">
            <Plus className="h-6 w-6" strokeWidth={1.6} /> Tambah catatan
          </button>
        )}
      </div>

      {/* Kebiasaan Baik — kartu (versi compact) */}
      <div className="mt-4">
        <KartuKebiasaanBaik {...habitProps} compact />
      </div>
    </div>
  );
}
