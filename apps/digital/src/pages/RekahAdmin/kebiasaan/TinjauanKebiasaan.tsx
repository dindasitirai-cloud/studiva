// Tampilan tinjauan draf Kebiasaan Baik di LayarDiff: perbedaan terhadap versi tayang
// (bila revisi) atau seluruh isi (bila baru), pemeriksaan kata, dan pratinjau orang tua.
import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { KontenDraf } from '../../../lib/supabase/pipeline';
import { muatKatalogKebiasaan, muatTemplateIrama, normalisasiKebiasaan, isiDariKebiasaan } from '../../../lib/supabase/kebiasaan';
import type { IsiKebiasaan, KebiasaanTayang } from '../../../lib/supabase/kebiasaan';
import { TEMPLATE_SEED, labelUsia } from '../../../features/irama-hari/kebiasaanSeed';
import type { TemplateIrama } from '../../../features/irama-hari/kebiasaanSeed';
import { bandingkanKeb, periksaKataKeb } from '../../../features/irama-hari/admin/kebiasaanImport';
import PratinjauKebiasaan from './PratinjauKebiasaan';

export default function TinjauanKebiasaan({ draf }: { draf: KontenDraf }) {
  const isi: IsiKebiasaan = useMemo(() => normalisasiKebiasaan((draf.isi ?? {}) as Partial<IsiKebiasaan>), [draf.isi]);
  const [live, setLive] = useState<KebiasaanTayang | null>(null);
  const [templates, setTemplates] = useState<TemplateIrama[]>(TEMPLATE_SEED);

  useEffect(() => {
    const kid = draf.id_konten_sumber ?? isi.id;
    muatKatalogKebiasaan({ sertakanArsip: true }).then(k => setLive((k ?? []).find(s => s.id === kid) ?? null));
    muatTemplateIrama().then(t => { if (t && t.length) setTemplates(t); });
  }, [draf.id_konten_sumber, isi.id]);

  const nama = (k: string | null) => templates.find(t => t.key === k)?.nama ?? (k ?? '—');
  const beda = useMemo(() => (live ? bandingkanKeb(isiDariKebiasaan(live), isi, nama) : null), [live, isi, templates]); // eslint-disable-line react-hooks/exhaustive-deps
  const kata = useMemo(() => periksaKataKeb(isi), [isi]);

  return (
    <div className="grid gap-5 px-5 py-5 md:grid-cols-[minmax(0,1fr)_280px]">
      <div className="flex min-w-0 flex-col gap-3">
        <p className="text-[13px] text-pekat/70">
          <b className="text-pekat">{isi.kategori === 'rutin' ? `Rutin · ${nama(isi.template_key)}` : `Situasional · ${isi.kapan || '—'}`}</b>
          {' · '}{labelUsia(isi.usia_min_bulan, isi.usia_max_bulan)} · {isi.nilai.join(', ') || '—'}
          <span className="ml-2 font-mono text-[11px] text-pekat/40">{isi.id}</span>
        </p>
        {isi.deskripsi && <p className="rounded-xl bg-kanvas px-4 py-2.5 text-[13px] text-pekat/75">{isi.deskripsi}</p>}
        {kata.length > 0 && (
          <div className="rounded-xl border border-rekah/30 bg-rekah/5 px-4 py-3 text-[13px]">
            <p className="mb-1 flex items-center gap-1.5 font-bold text-rekah-tua"><AlertTriangle className="h-4 w-4" /> Kata yang perlu ditinjau</p>
            <ul className="list-disc pl-4 text-pekat/75">{kata.map(k => <li key={k}>{k}</li>)}</ul>
          </div>
        )}
        <div className="rounded-xl border border-rekah/10 bg-white px-4 py-3 text-[12.5px] text-pekat/70">
          Periksa juga: kebiasaan sesuai tahap usia, bisa dilakukan dalam kegiatan harian tanpa alat khusus, dan nadanya mengajak — bukan menilai anak atau orang tua.
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
          <p className="text-[12px] font-bold uppercase tracking-wider text-pekat/40">Kebiasaan baru · periksa seluruh isi di pratinjau</p>
        )}
      </div>
      <div>
        <p className="mb-2 text-[12px] font-bold uppercase tracking-wider text-pekat/40">Pratinjau orang tua</p>
        <PratinjauKebiasaan isi={isi} templates={templates} />
      </div>
    </div>
  );
}
