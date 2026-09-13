// Jurnal perjalanan (Phase 14Q) — buku harian di dalam Temani.
// Log otomatis (read-only) diturunkan dari data yang ada + cerita & foto pengguna.
// Tampilan buku: sampul, halaman dot-grid, tab bulan (page mark), flip halaman.
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import {
  getPilihanHarianRentang, getRefleksiRentang, getJurnalHariRentang,
  simpanJurnalHari, unggahFotoJurnal, urlFotoJurnal, hapusFotoJurnal,
} from '../../lib/supabase/rekah';
import type { JurnalHari } from '../../lib/supabase/rekah';
import { bangunEntriHari } from './jurnalAgregator';
import type { SumberJurnal } from './jurnalAgregator';
import { dispatchRekahError } from '../../utils/rekahApiError';
import { tanggalDariTimestampWIB } from '@studiva/shared';

const CSS = `
.jt-frame{display:flex;align-items:stretch}
.jt-cover{position:relative;flex:1;border-radius:26px;padding:12px;background:linear-gradient(150deg,#7A4560,#6E3B57);box-shadow:0 34px 60px -30px rgba(110,59,87,.6)}
.jt-stage{position:relative;border-radius:16px;overflow:hidden}
.jt-spread{display:grid;grid-template-columns:1fr 1fr;background:#FFFCF6;background-image:radial-gradient(rgba(110,59,87,.13) 1.1px,transparent 1.1px);background-size:17px 17px;background-position:12px 12px;box-shadow:inset 0 0 0 1px #F0E2D6;min-height:520px;animation:jt-in .4s ease}
@keyframes jt-in{from{opacity:0;transform:translateX(-6px) rotateY(-6deg)}to{opacity:1;transform:none}}
.jt-stage::after{content:"";position:absolute;top:6px;bottom:6px;left:50%;width:26px;transform:translateX(-50%);background:linear-gradient(90deg,rgba(110,59,87,.14),transparent 45%,transparent 55%,rgba(110,59,87,.14));pointer-events:none;z-index:5}
.jt-page{padding:22px 20px;overflow:auto}
.jt-tabs{display:flex;flex-direction:column;gap:6px;padding-top:26px;margin-left:-10px;z-index:20}
.jt-mtab{width:46px;height:34px;border-radius:0 11px 11px 0;font-weight:800;font-size:11px;letter-spacing:.05em;display:flex;align-items:center;justify-content:center;box-shadow:2px 2px 8px -4px rgba(110,59,87,.5);cursor:pointer;border:0}
.jt-mtab.on{background:#F06BA8;color:#fff;width:56px}
.jt-mtab.off{background:#F8D7E4;color:#B65C88}
@media(max-width:760px){.jt-spread{grid-template-columns:1fr}.jt-stage::after{display:none}.jt-tabs{flex-direction:row;overflow-x:auto;margin:0 0 10px 0;padding:0}.jt-mtab{border-radius:11px 11px 0 0}.jt-frame{flex-direction:column-reverse}}
@media(prefers-reduced-motion:reduce){.jt-spread{animation:none}}
`;

const DOW = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];

function isoMundur(n: number): string[] {
  const today = tanggalDariTimestampWIB(new Date().toISOString());
  const base = new Date(`${today}T00:00:00Z`);
  const out: string[] = [];
  for (let i = 0; i < n; i += 1) {
    const d = new Date(base);
    d.setUTCDate(base.getUTCDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}
function fmt(iso: string, opt: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('id-ID', { ...opt, timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));
}
function dowOf(iso: string): number { return new Date(`${iso}T00:00:00Z`).getUTCDay(); }

interface PageData { iso: string; entri: { sumber: SumberJurnal; teks: string; tag: string }[] }

function Penanda({ sumber }: { sumber: SumberJurnal }) {
  if (sumber === 'kebiasaan') return <span className="mt-0.5 flex-none text-[16px]" aria-hidden>🌿</span>;
  const base = 'mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full text-white text-[11px]';
  if (sumber === 'kelola') return <span className={`${base} bg-daun`} aria-hidden>✓</span>;
  if (sumber === 'kegiatan') return <span className={base} style={{ background: '#F6B860' }} aria-hidden>🎲</span>;
  if (sumber === 'wawasan') return <span className={base} style={{ background: '#C9B8F0' }} aria-hidden>💡</span>;
  if (sumber === 'temani') return <span className={base} style={{ background: '#F06BA8' }} aria-hidden>♥</span>;
  if (sumber === 'bantu') return <span className={base} style={{ background: '#8E5FA6' }} aria-hidden>🆘</span>;
  return <span className={base} style={{ background: '#8FB8F7' }} aria-hidden>💬</span>;
}

interface Props { idAnak: string; nama: string; onKembali: () => void }

export default function JurnalTemani({ idAnak, nama, onKembali }: Props) {
  const dates = useMemo(() => isoMundur(60), []);
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState<PageData[]>([]);
  const [cur, setCur] = useState(0);
  const [jurnalMap, setJurnalMap] = useState<Record<string, JurnalHari>>({});
  const [draft, setDraft] = useState('');
  const [urlMap, setUrlMap] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let batal = false;
    (async () => {
      try {
        setLoading(true);
        // Inti (log otomatis) = pilihan_harian. Refleksi & jurnal_hari dibuat
        // TIDAK fatal: bila belum ada (mis. migration 020 belum jalan), buku
        // tetap terbuka dengan log otomatis, hanya cerita/foto yang belum aktif.
        const rows = await getPilihanHarianRentang(idAnak, dates);
        let refleksi: { tanggal: string; hasil: string }[] = [];
        try { refleksi = await getRefleksiRentang(idAnak, dates[dates.length - 1], dates[0]); }
        catch (er) { console.warn('[Jurnal] refleksi gagal (diabaikan):', er); }
        let jmap: Record<string, JurnalHari> = {};
        try { jmap = await getJurnalHariRentang(idAnak, dates); }
        catch (ej) { console.warn('[Jurnal] jurnal_hari gagal — pastikan migration 020 dijalankan & bucket "jurnal-foto" dibuat:', ej); }
        const refByDate = new Map<string, { hasil: string }[]>();
        for (const r of refleksi) {
          const a = refByDate.get(r.tanggal) ?? [];
          a.push({ hasil: r.hasil });
          refByDate.set(r.tanggal, a);
        }
        const built: PageData[] = [];
        for (const iso of dates) {
          const row = rows[iso];
          const centang = (row?.centang ?? undefined) as Record<string, string[]> | undefined;
          const entri = bangunEntriHari(row?.diff, centang, refByDate.get(iso) ?? []);
          const j = jmap[iso];
          const adaIsi = entri.length > 0 || (j && (j.cerita.trim() !== '' || j.foto.length > 0));
          if (adaIsi || iso === dates[0]) built.push({ iso, entri });
        }
        if (batal) return;
        setPages(built.length ? built : [{ iso: dates[0], entri: [] }]);
        setJurnalMap(jmap);
        setCur(0);
      } catch (e) {
        console.error('[Jurnal] gagal memuat:', e);
        dispatchRekahError('Koneksi terputus — jurnal belum bisa dimuat. Coba lagi ya.');
      } finally {
        if (!batal) setLoading(false);
      }
    })();
    return () => { batal = true; };
  }, [idAnak, dates]);

  const isoCur = pages[cur]?.iso;
  const jurnalCur: JurnalHari = (isoCur && jurnalMap[isoCur]) || { cerita: '', foto: [] };

  useEffect(() => { setDraft(jurnalCur.cerita); /* eslint-disable-next-line */ }, [isoCur]);

  useEffect(() => {
    let batal = false;
    (async () => {
      for (const p of jurnalCur.foto) {
        if (urlMap[p]) continue;
        const u = await urlFotoJurnal(p);
        if (!batal && u) setUrlMap(m => ({ ...m, [p]: u }));
      }
    })();
    return () => { batal = true; };
    /* eslint-disable-next-line */
  }, [isoCur, jurnalCur.foto.length]);

  const simpan = useCallback(async (isi: JurnalHari) => {
    if (!isoCur) return;
    setJurnalMap(m => ({ ...m, [isoCur]: isi }));
    try { await simpanJurnalHari(idAnak, isoCur, isi); }
    catch (e) { console.error('[Jurnal] simpan gagal:', e); dispatchRekahError('Catatan belum tersimpan. Coba lagi ya.'); }
  }, [idAnak, isoCur]);

  const onBlurCerita = () => { if (isoCur && draft !== jurnalCur.cerita) void simpan({ cerita: draft, foto: jurnalCur.foto }); };

  const onPilihFoto = async (f: File | undefined) => {
    if (!f || !isoCur) return;
    try {
      const path = await unggahFotoJurnal(idAnak, isoCur, f);
      await simpan({ cerita: draft, foto: [...jurnalCur.foto, path] });
    } catch (e) { console.error('[Jurnal] unggah gagal:', e); const m = (e as { message?: string })?.message; dispatchRekahError(`Foto belum bisa diunggah${m ? `: ${m}` : ''}. Pastikan bucket "jurnal-foto" ada & policy storage (migration 020) terpasang.`); }
  };
  const onHapusFoto = async (path: string) => {
    await simpan({ cerita: draft, foto: jurnalCur.foto.filter(p => p !== path) });
    try { await hapusFotoJurnal(path); } catch (e) { console.error('[Jurnal] hapus foto:', e); }
  };

  const bulanList = useMemo(() => {
    const idxOf: Record<string, number> = {};
    const urut: string[] = [];
    pages.forEach((p, i) => { const key = p.iso.slice(0, 7); if (!(key in idxOf)) { idxOf[key] = i; urut.push(key); } });
    return urut.map(key => ({ key, label: fmt(`${key}-01`, { month: 'short' }).toUpperCase(), idx: idxOf[key] }));
  }, [pages]);
  const bulanAktif = isoCur ? isoCur.slice(0, 7) : '';

  const page = pages[cur];

  return (
    <>
      <style>{CSS}</style>
      <button onClick={onKembali} className="mb-3 inline-flex items-center gap-1 font-nunito text-[13px] text-pekat/70"><ArrowLeft className="h-4 w-4" /> Kembali</button>

      <p className="font-shantell text-lg text-rekah">temani · jurnal</p>
      <h1 className="mt-1 font-fredoka text-[26px] font-semibold leading-tight text-pekat">Buku perjalanan {nama} 📖</h1>
      <p className="mt-2 font-nunito text-[15px] text-pekat/70">Tercatat otomatis tiap hari — kamu tinggal menambah cerita atau foto kalau mau.</p>

      {loading ? (
        <div className="mt-6 rounded-3xl border border-[#F0DCE6] bg-white/70 p-8 text-center font-nunito text-[13px] text-pekat/60">Memuat buku…</div>
      ) : !page ? (
        <div className="mt-6 rounded-3xl border border-[#F0DCE6] bg-white/70 p-8 text-center font-nunito text-[13px] text-pekat/60">Belum ada halaman.</div>
      ) : (
        <>
          <div className="mt-4 flex items-center justify-between">
            <span className="font-fredoka text-[15px] font-semibold text-pekat">{fmt(page.iso, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span className="rounded-full bg-white/70 px-3 py-1 font-nunito text-[12px] font-bold text-pekat/70">Halaman {cur + 1} / {pages.length}</span>
          </div>

          <div className="jt-frame mt-3">
            <div className="jt-cover">
              <div className="jt-stage">
                <div className="jt-spread" key={page.iso}>
                  {/* Halaman kiri — tercatat otomatis */}
                  <div className="jt-page relative">
                    <div className="flex items-center gap-1 font-nunito text-[10px] font-extrabold text-pekat/40">
                      {DOW.map((d, k) => (
                        <span key={d} className={k === dowOf(page.iso) ? 'rounded-md bg-rekah px-1.5 py-0.5 text-white' : ''}>{d}</span>
                      ))}
                    </div>
                    <h2 className="mt-3 font-fredoka text-[19px] font-semibold text-pekat">{fmt(page.iso, { weekday: 'long', day: 'numeric', month: 'short' })} {page.iso.slice(0, 4)}</h2>
                    <p className="mt-4 font-nunito text-[11px] font-extrabold uppercase tracking-wide text-pekat/45">Tercatat otomatis</p>
                    {page.entri.length === 0 ? (
                      <p className="mt-2 font-nunito text-[13px] leading-snug text-pekat/50">Belum ada yang tercatat hari ini. Saat kamu menyelesaikan kegiatan di Kelola atau menjalani langkah Temani, catatannya muncul di sini.</p>
                    ) : (
                      <ul className="mt-2 space-y-2.5 font-nunito text-[13.5px] text-pekat">
                        {page.entri.map((e, k) => (
                          <li key={k} className="flex items-start gap-2.5">
                            <Penanda sumber={e.sumber} />
                            <span>{e.teks} <span className="ml-1 rounded-full bg-fajar px-2 py-0.5 text-[10px] font-bold text-rekah">{e.tag}</span></span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <span className="absolute bottom-3 left-5 font-nunito text-[11px] font-bold text-pekat/40">{fmt(page.iso, { day: 'numeric', month: 'short' })}</span>
                  </div>

                  {/* Halaman kanan — cerita & foto */}
                  <div className="jt-page relative">
                    <p className="font-nunito text-[11px] font-extrabold uppercase tracking-wide text-pekat/45">Ceritamu hari ini</p>
                    <textarea
                      value={draft}
                      onChange={ev => setDraft(ev.target.value)}
                      onBlur={onBlurCerita}
                      placeholder="Tulis cerita atau catatan tentang hari ini…"
                      className="mt-2 h-28 w-full resize-none rounded-2xl border px-4 py-3 font-shantell text-[16px] leading-relaxed text-pekat/90 placeholder:font-nunito placeholder:text-[13px] placeholder:text-pekat/40 focus:outline-none focus:ring-2 focus:ring-rekah/40"
                      style={{ borderColor: '#EFE2D6', background: '#FFFEFB' }}
                    />
                    <p className="mt-4 font-nunito text-[11px] font-extrabold uppercase tracking-wide text-pekat/45">Foto</p>
                    <div className="mt-2 flex flex-wrap gap-2.5">
                      {jurnalCur.foto.map(path => (
                        <div key={path} className="relative h-20 w-20 overflow-hidden rounded-2xl bg-fajar">
                          {urlMap[path]
                            ? <img src={urlMap[path]} alt="Foto jurnal" className="h-full w-full object-cover" />
                            : <div className="grid h-full w-full place-items-center text-[11px] text-pekat/40">memuat…</div>}
                          <button onClick={() => { void onHapusFoto(path); }} aria-label="Hapus foto" className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/45 text-[13px] text-white hover:bg-black/65">×</button>
                        </div>
                      ))}
                      <button onClick={() => fileRef.current?.click()} aria-label="Tambah foto" className="grid h-20 w-20 place-items-center rounded-2xl border-2 border-dashed text-pekat/40 hover:border-rekah hover:text-rekah" style={{ borderColor: '#E7C7D8' }}>
                        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                      </button>
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={ev => { void onPilihFoto(ev.target.files?.[0]); ev.target.value = ''; }} />
                    </div>
                    <span className="absolute bottom-3 right-5 font-nunito text-[11px] font-bold text-pekat/40">{nama}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Page mark — tab bulan */}
            <div className="jt-tabs" role="tablist" aria-label="Pilih bulan">
              {bulanList.map(b => (
                <button key={b.key} className={`jt-mtab ${b.key === bulanAktif ? 'on' : 'off'}`} aria-selected={b.key === bulanAktif} onClick={() => setCur(b.idx)}>{b.label}</button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-3">
            <button onClick={() => setCur(c => Math.max(0, c - 1))} disabled={cur === 0} className="inline-flex items-center gap-1.5 rounded-2xl border bg-white px-4 py-2 font-nunito text-[13px] font-extrabold text-pekat disabled:opacity-40" style={{ borderColor: '#F0DCE6' }}>‹ Lebih baru</button>
            <button onClick={() => setCur(c => Math.min(pages.length - 1, c + 1))} disabled={cur === pages.length - 1} className="inline-flex items-center gap-1.5 rounded-2xl bg-rekah px-4 py-2 font-nunito text-[13px] font-extrabold text-white shadow-[0_12px_22px_-14px_rgba(240,107,168,0.95)] disabled:opacity-40">Lebih lama ›</button>
          </div>
        </>
      )}
    </>
  );
}
