// Tampilan tinjauan draf Temani di LayarDiff: perbedaan terhadap versi tayang (bila revisi)
// atau seluruh isi (bila perjalanan baru), temuan kata, dan pratinjau orang tua.
import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { KontenDraf } from '../../../lib/supabase/pipeline';
import { muatKatalogTemani, normalisasiIsi, isiKosong, isiDariKatalog } from '../../../lib/supabase/temani';
import type { IsiTemani, JourneyKatalog } from '../../../lib/supabase/temani';
import { bandingkan, periksaKata } from '../../../features/temani/admin/temaniImport';
import { kebiasaanById } from '../../../features/temani/temaniSeed';
import PratinjauTemani from './PratinjauTemani';

export default function TinjauanTemani({ draf }: { draf: KontenDraf }) {
  const isi: IsiTemani = useMemo(() => {
    const o = (draf.isi ?? {}) as Partial<IsiTemani>;
    return normalisasiIsi({ ...isiKosong(), ...o, hari: Array.isArray(o.hari) ? o.hari : [] } as IsiTemani);
  }, [draf.isi]);
  const [live, setLive] = useState<JourneyKatalog | null>(null);
  const [indeks, setIndeks] = useState(0);

  useEffect(() => {
    const slug = draf.id_konten_sumber ?? isi.slug;
    muatKatalogTemani({ sertakanArsip: true }).then(k => setLive((k ?? []).find(j => j.slug === slug) ?? null));
  }, [draf.id_konten_sumber, isi.slug]);

  const beda = useMemo(() => (live ? bandingkan(isiDariKatalog(live), isi) : null), [live, isi]);
  const kata = useMemo(() => periksaKata(isi), [isi]);

  return (
    <div className="grid gap-5 px-5 py-5 md:grid-cols-[minmax(0,1fr)_260px]">
      <div className="flex min-w-0 flex-col gap-3">
        <div className="text-[13px] text-pekat/70">
          <p><b className="text-pekat">Nilai:</b> {isi.nilai_terkait.join(', ') || '—'} · <b className="text-pekat">Usia:</b> {isi.usia_min_bulan}–{isi.usia_max_bulan} bulan · <b className="text-pekat">{isi.hari.length} hari</b></p>
          {isi.deskripsi && <p className="mt-1">{isi.deskripsi}</p>}
        </div>

        {kata.length > 0 && (
          <div className="rounded-xl border border-rekah/30 bg-rekah/5 px-4 py-3 text-[13px]">
            <p className="mb-1 flex items-center gap-1.5 font-bold text-rekah-tua"><AlertTriangle className="h-4 w-4" /> Kata yang perlu ditinjau</p>
            <ul className="list-disc pl-4 text-pekat/75">{kata.map(k => <li key={k}>{k}</li>)}</ul>
          </div>
        )}

        {beda ? (
          <>
            <p className="text-[12px] font-bold uppercase tracking-wider text-pekat/40">
              Perbedaan dari versi tayang v{live!.versi} · {beda.length} perubahan
            </p>
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
          <>
            <p className="text-[12px] font-bold uppercase tracking-wider text-pekat/40">Perjalanan baru · seluruh isi</p>
            {isi.hari.map((h, i) => (
              <button key={i} type="button" onClick={() => setIndeks(i)}
                className={`rounded-xl border px-4 py-3 text-left text-[13px] transition ${indeks === i ? 'border-rekah/40 bg-fajar' : 'border-rekah/10 bg-white hover:border-rekah/30'}`}>
                <p className="font-bold text-pekat">
                  Hari {h.hari} · {h.jenis === 'target' ? `Target ${h.kebiasaan_id} (${kebiasaanById(h.kebiasaan_id)?.judul ?? 'belum dikenali'})` : 'Perancah'}
                </p>
                <p className="mt-1 text-pekat">{h.fokus_hari}</p>
                {h.script && <p className="mt-1 italic text-pekat/70">“{h.script}”</p>}
                <p className="mt-1 text-pekat/70">{h.kenapa_sederhana}</p>
                {h.kenapa_evidence && <p className="mt-1 text-pekat/50">{h.kenapa_evidence}</p>}
                <p className="mt-1 text-[12px] text-pekat/50">Sumber: {h.kenapa_sumber || 'belum ada — lapisan sumber tidak ditampilkan'}</p>
                {h.yang_diamati && <p className="mt-1 text-[12px] text-pekat/60">Yang diamati: {h.yang_diamati}</p>}
              </button>
            ))}
          </>
        )}
      </div>
      <div>
        <p className="mb-2 text-[12px] font-bold uppercase tracking-wider text-pekat/40">Pratinjau orang tua</p>
        <PratinjauTemani isi={isi} indeks={indeks} onPilih={setIndeks} tayang={draf.status === 'tayang'} />
      </div>
    </div>
  );
}
