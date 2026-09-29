// Tampilan tinjauan draf Bantu di LayarDiff: perbedaan terhadap versi tayang (bila revisi)
// atau seluruh isi (bila situasi baru), catatan keselamatan, dan pratinjau orang tua.
import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import type { KontenDraf } from '../../../lib/supabase/pipeline';
import { muatKatalogBantu, normalisasiBantu, isiDariSituasi, LABEL_KATEGORI } from '../../../lib/supabase/bantu';
import type { IsiBantu, SituasiKatalog } from '../../../lib/supabase/bantu';
import { bandingkanBantu, periksaKataBantu, catatanKeselamatan } from '../../../features/bantu/admin/bantuImport';
import PratinjauBantu from './PratinjauBantu';

export default function TinjauanBantu({ draf }: { draf: KontenDraf }) {
  const isi: IsiBantu = useMemo(() => normalisasiBantu((draf.isi ?? {}) as Partial<IsiBantu>), [draf.isi]);
  const [live, setLive] = useState<SituasiKatalog | null>(null);

  useEffect(() => {
    const slug = draf.id_konten_sumber ?? isi.slug;
    muatKatalogBantu({ sertakanArsip: true }).then(k => setLive((k ?? []).find(s => s.slug === slug) ?? null));
  }, [draf.id_konten_sumber, isi.slug]);

  const beda = useMemo(() => (live ? bandingkanBantu(isiDariSituasi(live), isi) : null), [live, isi]);
  const kata = useMemo(() => periksaKataBantu(isi), [isi]);
  const aman = useMemo(() => catatanKeselamatan(isi), [isi]);

  return (
    <div className="grid gap-5 px-5 py-5 md:grid-cols-[minmax(0,1fr)_260px]">
      <div className="flex min-w-0 flex-col gap-3">
        <p className="text-[13px] text-pekat/70">
          <b className="text-pekat">{LABEL_KATEGORI[isi.kategori]}</b> · {isi.ringkas || '—'}
          {isi.sensitif_keselamatan && <span className="ml-2 inline-flex items-center gap-0.5 rounded-md bg-rekah/10 px-1.5 py-0.5 text-[11px] font-bold text-rekah-tua"><ShieldAlert className="h-3 w-3" /> sensitif keselamatan</span>}
        </p>
        {kata.length > 0 && (
          <div className="rounded-xl border border-rekah/30 bg-rekah/5 px-4 py-3 text-[13px]">
            <p className="mb-1 flex items-center gap-1.5 font-bold text-rekah-tua"><AlertTriangle className="h-4 w-4" /> Kata yang perlu ditinjau</p>
            <ul className="list-disc pl-4 text-pekat/75">{kata.map(k => <li key={k}>{k}</li>)}</ul>
          </div>
        )}
        {aman.length > 0 && (
          <div className="rounded-xl bg-langit/15 px-4 py-3 text-[13px]">
            <p className="mb-1 font-bold text-pekat">Untuk diperhatikan</p>
            <ul className="list-disc pl-4 text-pekat/75">{aman.map(k => <li key={k}>{k}</li>)}</ul>
          </div>
        )}
        <div className="rounded-xl border border-rekah/10 bg-white px-4 py-3 text-[12.5px] text-pekat/70">
          Periksa juga: tidak ada saran yang memakai rasa sakit atau ketidaknyamanan fisik, nada menguatkan tanpa menyalahkan orang tua, dan klaim ilmiah hanya bila ada sumber.
        </div>
        {beda ? (
          <>
            <p className="text-[12px] font-bold uppercase tracking-wider text-pekat/40">Perbedaan dari versi tayang v{live!.versi} · {beda.length} perubahan</p>
            {beda.length === 0 && <p className="text-[13px] text-pekat/50">Tidak ada perbedaan isi.</p>}
            {beda.map((b, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-rekah/10">
                <p className="bg-rekah/5 px-3 py-1.5 text-[12px] font-bold text-pekat">{b.bagian}</p>
                <p className="bg-rekah/10 px-3 py-2 text-[13px] text-pekat/80"><b>Sebelumnya · </b>{b.lama}</p>
                <p className="bg-daun/10 px-3 py-2 text-[13px] text-pekat"><b>Usulan · </b>{b.baru}</p>
              </div>
            ))}
          </>
        ) : (
          <p className="text-[12px] font-bold uppercase tracking-wider text-pekat/40">Situasi baru · periksa seluruh isi di pratinjau</p>
        )}
      </div>
      <div>
        <p className="mb-2 text-[12px] font-bold uppercase tracking-wider text-pekat/40">Pratinjau orang tua</p>
        <PratinjauBantu isi={isi} tayang={draf.status === 'tayang'} />
      </div>
    </div>
  );
}
