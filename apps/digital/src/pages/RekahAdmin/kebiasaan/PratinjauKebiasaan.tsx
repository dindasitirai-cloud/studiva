// Pratinjau satu Kebiasaan Baik seperti yang dilihat orang tua:
//   rutin        → baris centang di kartu kegiatan papan Irama Hari
//   situasional  → catatan tempel di panel "Kebiasaan situasional" Kelola
import React from 'react';
import { Check } from 'lucide-react';
import type { IsiKebiasaan } from '../../../lib/supabase/kebiasaan';
import type { TemplateIrama } from '../../../features/irama-hari/kebiasaanSeed';
import { labelUsia } from '../../../features/irama-hari/kebiasaanSeed';
import IlustrasiKegiatan from '../../../features/irama-hari/IlustrasiKegiatan';
import { BungaNilai } from '../tema/temaAdmin';

const WARNA: Record<string, string> = { pagi: '#F06BA8', siang: '#E9A93B', malam: '#8B6FD6' };

export default function PratinjauKebiasaan({ isi, templates }: { isi: IsiKebiasaan; templates: TemplateIrama[] }) {
  const n = isi.nilai[0];
  const tpl = templates.find(t => t.key === isi.template_key);
  const judul = isi.judul || 'Judul kebiasaan';

  const Baris = (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[7px] border-2 border-[#E7CFDD] bg-white">
        <Check className="h-3 w-3 opacity-0" />
      </span>
      <span aria-hidden className="mt-0.5 block h-[21px] w-[21px] shrink-0">{n && <BungaNilai nilai={n} size={21} />}</span>
      <div className="min-w-0 flex-1">
        <p className="font-nunito text-[14px] font-bold leading-snug text-pekat">{judul}</p>
        {n && <span className="mt-1 inline-block rounded-full bg-[#FBEFF5] px-2.5 py-0.5 font-nunito text-[11.5px] font-extrabold text-pekat">Menanam: {n}</span>}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      {isi.kategori === 'rutin' ? (
        <div className="rounded-[22px] bg-white p-4 shadow-[0_18px_40px_-34px_rgba(90,50,70,.55)]">
          <div className="flex items-center gap-2.5">
            <span className="block h-[34px] w-[5px] rounded-full" style={{ background: WARNA[tpl?.waktu ?? 'pagi'] }} />
            {tpl && <IlustrasiKegiatan ikon={tpl.ikon} size={22} />}
            <div>
              <p className="font-fredoka text-[16px] font-semibold leading-tight text-pekat">{tpl?.nama ?? 'Pilih kegiatan'}</p>
              {tpl?.jam && <p className="font-nunito text-[12.5px] font-bold text-[#B79AAC]">{tpl.jam}</p>}
            </div>
          </div>
          <div className="mt-3 border-t-[1.5px] border-dashed border-[#F0DCE7] pt-2.5">
            <p className="mb-2 font-nunito text-[11px] font-extrabold uppercase tracking-[.7px] text-[#5F84E6]">Kebiasaan baik yang bisa dilakukan</p>
            {Baris}
          </div>
        </div>
      ) : (
        <div className="rounded-[22px] bg-white p-4 shadow-[0_18px_40px_-34px_rgba(90,50,70,.55)]">
          <p className="font-fredoka text-[16px] font-semibold text-pekat">Kebiasaan situasional</p>
          <div className="mt-2 flex -rotate-1 items-start gap-2.5 rounded-xl border border-pekat/8 bg-[#FDF7FB] px-3 py-2.5 shadow-[0_8px_18px_-14px_rgba(90,50,70,.55)]">
            <span className="mt-0.5 h-5 w-5 shrink-0 rounded-md border-2 border-[#E7CFDD] bg-white" />
            <span aria-hidden className="mt-0.5 block h-5 w-5 shrink-0">{n && <BungaNilai nilai={n} size={20} />}</span>
            <span className="min-w-0 flex-1">
              <span className="block font-nunito text-[13px] font-extrabold leading-snug text-pekat">{judul}</span>
              <span className="mt-0.5 block font-nunito text-[10.5px] font-bold text-[#B79AAC]">{isi.kapan || 'kapan saja'}{n ? ` · ${n}` : ''}</span>
            </span>
          </div>
        </div>
      )}
      <p className="text-[12px] leading-relaxed text-pekat/55">
        Tampil untuk anak usia <b className="text-pekat/75">{labelUsia(isi.usia_min_bulan, isi.usia_max_bulan)}</b>, bila keluarga memilih
        {isi.nilai.length ? <> <b className="text-pekat/75">{isi.nilai.join(' atau ')}</b></> : ' (pilih nilai)'} sebagai nilai fokus.
        {isi.deskripsi && <><br /><span className="text-pekat/45">Deskripsi dipakai di Jejak & materi pendamping.</span></>}
      </p>
    </div>
  );
}
