// =============================================================
// HariIni — tab "Hari Ini" (Phase 15 · tanpa emoji, filter nilai fokus).
// 3 kolom Pagi/Siang/Malam; kegiatan default (mockup) dgn ikon flat (IlustrasiKegiatan).
// Poin Kebiasaan Baik & Kebiasaan situasional HANYA nilai yang dipilih di Arah (nilaiFokus).
// Pita Kebiasaan = nilaiFokus saja. "＋ tambah to-do list" → menu jenis. Persist localStorage.
// Konten default = SEED (DRAFT, review Psikolog Fitri Effendy).
// =============================================================
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Trash2, Check, Pencil } from 'lucide-react';
import type { NilaiAkar } from '../akar-keluarga/content';
import { useAnak } from '../../context/AnakContext';
import { BungaSVG } from './KartuKebiasaanBaik';
import { derivedRiwayatSiram, tingkatMekar } from '@studiva/shared';
import IlustrasiKegiatan from './IlustrasiKegiatan';
import type { IkonKey } from './susunanDefault';
import PanelKelola from './PanelKelola';
import { getPilihanHarian, setSelesaiKustom } from '../../lib/supabase/rekah';

type Tipe = 'kebiasaan' | 'main' | 'buku' | 'lainnya';
type Waktu = 'pagi' | 'siang' | 'malam';
const LB: Record<Tipe, string> = { kebiasaan: 'Kebiasaan baik yang bisa dilakukan', main: 'Ajak main', buku: 'Baca buku', lainnya: 'Lainnya' };
const TINT: Record<'main' | 'buku' | 'lainnya', [string, string]> = { main: ['#FCE4EE', '#C0567F'], buku: ['#EFE9FB', '#7A5CA6'], lainnya: ['#F1ECF0', '#8A7385'] };
const SUBT: Record<'main' | 'buku' | 'lainnya', string> = { main: 'dari Bekal Ajak Main', buku: 'dari Bekal Wawasan Tumbuh', lainnya: 'buatan kamu' };
const NILAI_WARNA: Record<string, string> = { 'Kasih Sayang': '#F8B9D4', 'Kemandirian': '#FFD98A', 'Empati': '#C9B8F0', 'Syukur': '#FFE29A', 'Berbagi': '#F4A6C0', 'Tanggung Jawab': '#F6B860', 'Cinta Ilmu': '#9FD8C0', 'Sabar': '#A8D8E8', 'Kejujuran': '#FFC59A', 'Keberanian': '#F49AB0', 'Kesederhanaan': '#D9C7B0', 'Hormat pada Sesama': '#B7D3F0' };
const warnaNilai = (n: string) => NILAI_WARNA[n] ?? '#F8B9D4';
const labelWarna = (tp: Tipe) => tp === 'kebiasaan' ? '#3E6E9C' : tp === 'main' ? '#C0567F' : tp === 'buku' ? '#7A5CA6' : '#8A7385';
const statusMekar = (l: number) => l >= 3 ? 'Mekar' : l >= 1 ? 'Tumbuh' : 'Kuncup';

function MarkerNon({ tipe }: { tipe: 'main' | 'buku' | 'lainnya' }) {
  const [bg, ink] = TINT[tipe];
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-[7px]" style={{ background: bg, color: ink }}>
      {tipe === 'lainnya' ? <Pencil className="h-3.5 w-3.5" strokeWidth={2} /> : <IlustrasiKegiatan ikon={tipe === 'main' ? 'main' : 'buku'} size={16} />}
    </span>
  );
}

interface Item { id: string; tipe: Tipe; t: string; n?: NilaiAkar }
interface KegDef { key: string; wk: string; ik: IkonKey; nm: string; items: Item[] }
const WAKTU: { key: Waktu; label: string; keg: KegDef[] }[] = [
  { key: 'pagi', label: 'Pagi', keg: [
    { key: 'bangun', wk: '06:30', ik: 'bangun', nm: 'Bangun tidur', items: [{ id: 'kbd-bangun-1', tipe: 'kebiasaan', t: 'Sapa hangat & kontak mata', n: 'Kasih Sayang' }] },
    { key: 'sarapan', wk: '07:30', ik: 'makan', nm: 'Sarapan', items: [{ id: 'kbd-sarap-1', tipe: 'kebiasaan', t: 'Cuci tangan sebelum makan', n: 'Kemandirian' }, { id: 'kbd-sarap-2', tipe: 'kebiasaan', t: 'Ucap terima kasih', n: 'Syukur' }] },
    { key: 'mandipagi', wk: '08:30', ik: 'mandi', nm: 'Mandi pagi', items: [{ id: 'kbd-mandi-1', tipe: 'kebiasaan', t: 'Coba pakai baju sendiri', n: 'Kemandirian' }] },
  ] },
  { key: 'siang', label: 'Siang', keg: [
    { key: 'main', wk: '10:00', ik: 'main', nm: 'Main bersama', items: [{ id: 'kbd-main-1', tipe: 'kebiasaan', t: 'Bermain bergiliran', n: 'Berbagi' }, { id: 'kbd-main-2', tipe: 'kebiasaan', t: 'Tunjukkan perasaan teman', n: 'Empati' }, { id: 'md-main-1', tipe: 'main', t: 'Tumpuk balok warna' }] },
    { key: 'makansiang', wk: '12:00', ik: 'sup', nm: 'Makan siang', items: [{ id: 'kbd-msiang-1', tipe: 'kebiasaan', t: 'Makan sendiri', n: 'Kemandirian' }] },
    { key: 'tidursiang', wk: '13:00', ik: 'tidurSiang', nm: 'Tidur siang', items: [] },
  ] },
  { key: 'malam', label: 'Malam', keg: [
    { key: 'makanmalam', wk: '18:00', ik: 'sup', nm: 'Makan malam', items: [{ id: 'kbd-mmalam-1', tipe: 'kebiasaan', t: 'Bantu siapkan meja', n: 'Tanggung Jawab' }] },
    { key: 'beres', wk: '18:45', ik: 'beres', nm: 'Beres-beres', items: [{ id: 'kbd-beres-1', tipe: 'kebiasaan', t: 'Rapikan mainan sendiri', n: 'Tanggung Jawab' }] },
    { key: 'tidur', wk: '19:30', ik: 'tidur', nm: 'Rutinitas sebelum tidur', items: [{ id: 'kbd-tidur-1', tipe: 'kebiasaan', t: 'Sikat gigi sendiri', n: 'Kemandirian' }, { id: 'kbd-tidur-2', tipe: 'kebiasaan', t: 'Cerita & doa', n: 'Kasih Sayang' }, { id: 'bk-tidur-1', tipe: 'buku', t: 'Baca buku bersama' }] },
  ] },
];
const SITUASIONAL: { id: string; t: string; n: NilaiAkar; kapan: string }[] = [
  { id: 'sit-1', t: 'Tetap tenang saat anak rewel', n: 'Sabar', kapan: 'saat rewel' },
  { id: 'sit-2', t: 'Berbagi mainan saat ada teman', n: 'Berbagi', kapan: 'saat main dgn teman' },
  { id: 'sit-3', t: 'Minta maaf saat berbuat salah', n: 'Kejujuran', kapan: 'saat ada masalah' },
  { id: 'sit-4', t: 'Berani coba hal baru', n: 'Keberanian', kapan: 'saat ragu' },
];
const ORDER: Tipe[] = ['kebiasaan', 'main', 'buku', 'lainnya'];

interface Store { extra: Record<string, Item[]>; hidden: string[]; doneExtra: string[]; addedKeg: Record<string, { id: string; nm: string }[]> }
const KOSONG: Store = { extra: {}, hidden: [], doneExtra: [], addedKeg: {} };

export interface PropsHariIni {
  nilaiFokus?: readonly NilaiAkar[];
  centangKebiasaan: Record<string, Record<string, string[]>>;
  tanggalHariIni: string;
  onCentangToggle: (nilaiId: NilaiAkar, butirId: string) => void;
  onBekal: () => void;
  onKeInbox?: () => void;
  onKeKeluarga?: () => void;
}

export default function HariIni({ nilaiFokus = [], centangKebiasaan, tanggalHariIni, onCentangToggle, onKeInbox, onKeKeluarga }: PropsHariIni) {
  const { anakAktif } = useAnak();
  const kunci = `rekah_hariini_v3_${anakAktif?.id ?? 'anon'}_${tanggalHariIni}`;
  const [store, setStore] = useState<Store>(() => { try { const r = localStorage.getItem(kunci); if (r) return { ...KOSONG, ...JSON.parse(r) }; } catch { /* abaikan */ } return KOSONG; });
  const simpan = (n: Store) => { setStore(n); try { localStorage.setItem(kunci, JSON.stringify(n)); } catch { /* abaikan */ } };
  const [menuFor, setMenuFor] = useState<string | null>(null);

  // Kegiatan perjalanan Temani yang dijadwalkan untuk tanggal ini (dari pilihan_harian di Supabase).
  const [temaniItems, setTemaniItems] = useState<{ id: string; judul: string; script?: string }[]>([]);
  const [temaniSelesai, setTemaniSelesai] = useState<Set<string>>(() => new Set());
  const muatTemani = useCallback(async () => {
    if (!anakAktif?.id) { setTemaniItems([]); setTemaniSelesai(new Set()); return; }
    try {
      const baris = await getPilihanHarian(anakAktif.id, tanggalHariIni);
      const diff = (baris?.diff ?? {}) as { kustom?: unknown; selesai?: unknown };
      const kustom = Array.isArray(diff.kustom) ? (diff.kustom as Record<string, unknown>[]) : [];
      const items = kustom
        .filter(k => typeof k?.id === 'string' && (k.id as string).startsWith('temani-'))
        .map(k => ({ id: k.id as string, judul: String(k.judul ?? 'Langkah Temani'), script: typeof k.deskripsiKustom === 'string' ? k.deskripsiKustom : undefined }));
      const sel = Array.isArray(diff.selesai) ? (diff.selesai as unknown[]).filter((x): x is string => typeof x === 'string') : [];
      setTemaniItems(items);
      setTemaniSelesai(new Set(sel));
    } catch (e) { console.error('[HariIni] gagal memuat kegiatan Temani:', e); }
  }, [anakAktif?.id, tanggalHariIni]);
  useEffect(() => { void muatTemani(); }, [muatTemani]);
  const toggleTemani = async (id: string) => {
    if (!anakAktif?.id) return;
    const done = temaniSelesai.has(id);
    setTemaniSelesai(prev => { const set = new Set(prev); if (done) set.delete(id); else set.add(id); return set; });
    try { await setSelesaiKustom(anakAktif.id, tanggalHariIni, id, !done); } catch (e) { console.error('[HariIni] gagal menandai Temani:', e); void muatTemani(); }
  };

  const fokusSet = useMemo(() => new Set(nilaiFokus), [nilaiFokus]);
  const hidden = new Set(store.hidden);
  const doneExtra = new Set(store.doneExtra);
  const centangHari = centangKebiasaan[tanggalHariIni] ?? {};
  const mekarDari = useMemo(() => {
    const derived = derivedRiwayatSiram(centangKebiasaan); const dates = Object.keys(centangKebiasaan).sort();
    return (n: NilaiAkar) => { const riw = dates.map(t => (derived[t] ?? []).includes(n)); const lv = tingkatMekar(riw); return lv[lv.length - 1] ?? 0; };
  }, [centangKebiasaan]);

  const doneKeb = (n: NilaiAkar, id: string) => (centangHari[n] ?? []).includes(id);
  const toggleKeb = (n: NilaiAkar, id: string) => onCentangToggle(n, id);
  const toggleExtra = (id: string) => { const s = new Set(doneExtra); s.has(id) ? s.delete(id) : s.add(id); simpan({ ...store, doneExtra: [...s] }); };
  const hideItem = (id: string) => simpan({ ...store, hidden: [...new Set([...store.hidden, id])] });
  const delExtra = (key: string, id: string) => simpan({ ...store, extra: { ...store.extra, [key]: (store.extra[key] ?? []).filter(e => e.id !== id) }, doneExtra: store.doneExtra.filter(x => x !== id) });
  function addExtra(key: string, tipe: Tipe) {
    setMenuFor(null); let t: string | null; let n: string | null = null;
    if (tipe === 'main') t = window.prompt('Ide Ajak Main dari Bekal:', 'Tebak suara benda');
    else if (tipe === 'buku') t = window.prompt('Judul buku dari Wawasan Tumbuh:', 'Buku bergambar hewan');
    else if (tipe === 'kebiasaan') { t = window.prompt('Kebiasaan baik:', 'Merapikan sepatu sendiri'); n = window.prompt('Nilai yang ditanam:', 'Kemandirian'); }
    else t = window.prompt('To-do:', '');
    if (!t) return;
    const item: Item = { id: `e-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`, tipe, t, n: (n || undefined) as NilaiAkar | undefined };
    simpan({ ...store, extra: { ...store.extra, [key]: [...(store.extra[key] ?? []), item] } });
  }
  const addKeg = (dp: Waktu) => { const nm = window.prompt('Kegiatan baru (setara kegiatan default):'); if (!nm) return; simpan({ ...store, addedKeg: { ...store.addedKeg, [dp]: [...(store.addedKeg[dp] ?? []), { id: `k-${Date.now().toString(36)}`, nm }] } }); };
  const delKeg = (dp: Waktu, id: string) => { const ex = { ...store.extra }; delete ex[id]; simpan({ ...store, addedKeg: { ...store.addedKeg, [dp]: (store.addedKeg[dp] ?? []).filter(k => k.id !== id) }, extra: ex }); };

  const Row = ({ kegKey, it, def }: { kegKey: string; it: Item; def: boolean }) => {
    if (it.tipe === 'kebiasaan') {
      const c = (it.n ?? 'Kemandirian') as NilaiAkar; const done = doneKeb(c, it.id);
      return (
        <div className="flex cursor-pointer items-start gap-2 rounded-lg px-1 py-1 hover:bg-fajar" onClick={() => toggleKeb(c, it.id)}>
          <span className={['mt-0.5 flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[5px] border-2', done ? 'border-daun bg-daun text-white' : 'border-rose-soft bg-white text-transparent'].join(' ')}><Check className="h-3 w-3" strokeWidth={3} /></span>
          <span className="mt-0.5 flex-shrink-0"><BungaSVG nilai={c} mekar={mekarDari(c)} ukuran={22} /></span>
          <span className="min-w-0 flex-1"><span className={['block font-nunito text-[12px] font-bold leading-tight text-pekat', done ? 'text-pekat/50 line-through' : ''].join(' ')}>{it.t}</span><span className="mt-0.5 flex items-center gap-1.5 font-nunito text-[10px] font-bold text-pekat/55"><span className="h-2 w-2 rounded-full" style={{ background: warnaNilai(c) }} />Menanam: {c}</span></span>
          <button type="button" onClick={e => { e.stopPropagation(); def ? hideItem(it.id) : delExtra(kegKey, it.id); }} className="text-pekat/20 hover:text-rekah-tua"><Trash2 className="h-3.5 w-3.5" strokeWidth={2} /></button>
        </div>
      );
    }
    const done = doneExtra.has(it.id);
    return (
      <div className="flex cursor-pointer items-start gap-2 rounded-lg px-1 py-1 hover:bg-fajar" onClick={() => toggleExtra(it.id)}>
        <span className={['mt-0.5 flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[5px] border-2', done ? 'border-daun bg-daun text-white' : 'border-rose-soft bg-white text-transparent'].join(' ')}><Check className="h-3 w-3" strokeWidth={3} /></span>
        <span className="mt-0.5"><MarkerNon tipe={it.tipe} /></span>
        <span className="min-w-0 flex-1"><span className={['block font-nunito text-[12px] font-bold leading-tight text-pekat', done ? 'text-pekat/50 line-through' : ''].join(' ')}>{it.t}</span><span className="mt-0.5 block font-nunito text-[10px] font-bold text-pekat/50">{SUBT[it.tipe]}</span></span>
        <button type="button" onClick={e => { e.stopPropagation(); def ? hideItem(it.id) : delExtra(kegKey, it.id); }} className="text-pekat/20 hover:text-rekah-tua"><Trash2 className="h-3.5 w-3.5" strokeWidth={2} /></button>
      </div>
    );
  };

  const Kegiatan = ({ kegKey, icon, nm, wk, items, onDelKeg }: { kegKey: string; icon: React.ReactNode; nm: string; wk?: string; items: Item[]; onDelKeg?: () => void }) => {
    // filter #2: kebiasaan default hanya bila nilainya termasuk fokus
    const vis = items.filter(i => !hidden.has(i.id) && (i.tipe !== 'kebiasaan' || (i.n != null && fokusSet.has(i.n))));
    const extra = store.extra[kegKey] ?? [];
    const all = [...vis, ...extra];
    const open = menuFor === kegKey;
    return (
      <div className="mb-2.5 rounded-[14px] border border-pekat/8 bg-white px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px] bg-kanvas text-pekat">{icon}</span>
          <span className="min-w-0 flex-1"><span className="block font-nunito text-[13px] font-extrabold leading-tight text-pekat">{nm}</span>{wk && <span className="font-nunito text-[10.5px] font-bold text-pekat/45">{wk}</span>}</span>
          {onDelKeg && <button type="button" onClick={onDelKeg} className="text-pekat/25 hover:text-rekah-tua"><Trash2 className="h-3.5 w-3.5" strokeWidth={2} /></button>}
        </div>
        {ORDER.map(tp => { const list = all.filter(i => i.tipe === tp); if (!list.length) return null; return (
          <div key={tp} className="mt-2 border-t border-dashed border-pekat/10 pt-2">
            <span className="mb-1 block font-nunito text-[9px] font-extrabold uppercase tracking-wide" style={{ color: labelWarna(tp) }}>{LB[tp]}</span>
            {list.map(it => <Row key={it.id} kegKey={kegKey} it={it} def={vis.includes(it)} />)}
          </div>
        ); })}
        <div className="mt-2">
          <button type="button" onClick={() => setMenuFor(open ? null : kegKey)} className="w-full rounded-[9px] border border-dashed border-pekat/20 py-1.5 font-nunito text-[11px] font-extrabold text-pekat/55 hover:bg-fajar hover:text-rekah-tua">＋ tambah to-do list</button>
          {open && (
            <div className="mt-1.5 flex flex-col gap-1 rounded-[10px] border border-rekah/20 bg-white p-1.5">
              {([['kebiasaan', 'Kebiasaan baik'], ['main', 'Ajak main (Bekal)'], ['buku', 'Baca buku (Wawasan Tumbuh)'], ['lainnya', 'Tulis sendiri']] as [Tipe, string][]).map(([tp, l]) => (
                <button key={tp} type="button" onClick={() => addExtra(kegKey, tp)} className="rounded-[7px] px-2 py-1.5 text-left font-nunito text-[11.5px] font-extrabold text-pekat hover:bg-fajar">{l}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (nilaiFokus.length === 0) {
    return <div className="rounded-[16px] border border-rekah/12 bg-white px-5 py-6 text-center"><p className="font-fredoka text-[15px] font-semibold text-pekat">Belum ada nilai fokus</p><p className="mt-1 font-nunito text-[13px] text-pekat/60">Pilih nilai keluarga di Arah (Kompas Keluarga) agar Rekah menampilkan kebiasaan yang sesuai.</p></div>;
  }
  const situFokus = SITUASIONAL.filter(s => fokusSet.has(s.n));

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_290px]">
      <div>
        {temaniItems.length > 0 && (
          <div className="mb-3 rounded-[16px] border-2 border-[#F3C9DE] px-4 py-3.5" style={{ background: 'linear-gradient(160deg,#FFF6FB 0%,#FDEFF6 55%,#F7E9FA 100%)' }}>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#F0479B' }} />
              <h4 className="font-fredoka text-[15px] font-semibold" style={{ color: '#B4477F' }}>Dari Temani</h4>
            </div>
            <p className="mb-2.5 mt-0.5 font-nunito text-[11.5px] text-pekat/60">Langkah perjalanan yang ditemani untuk hari ini.</p>
            <div className="flex flex-col gap-2">
              {temaniItems.map(it => { const done = temaniSelesai.has(it.id); return (
                <button key={it.id} type="button" onClick={() => { void toggleTemani(it.id); }} className="flex items-start gap-2.5 rounded-[11px] border px-3 py-2 text-left" style={{ borderColor: done ? '#CDE9B8' : '#F3C9DE', background: done ? '#F3FAEE' : '#fff' }}>
                  <span className={['mt-0.5 flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[5px] border-2', done ? 'border-daun bg-daun text-white' : 'border-rose-soft bg-white text-transparent'].join(' ')}><Check className="h-3 w-3" strokeWidth={3} /></span>
                  <span className="min-w-0 flex-1">
                    <span className={['block font-nunito text-[12.5px] font-bold leading-tight text-pekat', done ? 'text-pekat/50 line-through' : ''].join(' ')}>{it.judul}</span>
                    {it.script && <span className="mt-1 block font-shantell text-[11.5px] leading-snug" style={{ color: '#B4477F' }}>&ldquo;{it.script}&rdquo;</span>}
                  </span>
                </button>
              ); })}
            </div>
          </div>
        )}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="font-nunito text-[10px] font-extrabold uppercase tracking-wide text-pekat/50">Fokus</span>
          {nilaiFokus.map(n => <span key={n} className="rounded-full border border-rekah/25 bg-white px-2.5 py-0.5 font-nunito text-[11px] font-extrabold text-rekah-tua">{n}</span>)}
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {WAKTU.map(w => (
            <div key={w.key} className="rounded-[16px] bg-kanvas/50 p-2.5">
              <div className="mb-2 px-1 font-shantell text-[15px] font-bold text-pekat">{w.label}</div>
              {w.keg.map(k => <Kegiatan key={k.key} kegKey={k.key} icon={<IlustrasiKegiatan ikon={k.ik} size={18} />} nm={k.nm} wk={k.wk} items={k.items} />)}
              {(store.addedKeg[w.key] ?? []).map(k => <Kegiatan key={k.id} kegKey={k.id} icon={<Pencil className="h-4 w-4" strokeWidth={2} />} nm={k.nm} wk="buatan kamu" items={[]} onDelKeg={() => delKeg(w.key, k.id)} />)}
              <button type="button" onClick={() => addKeg(w.key)} className="mt-1 w-full rounded-[12px] border border-dashed border-rekah/40 bg-white py-2 font-nunito text-[11.5px] font-extrabold text-rekah-tua hover:bg-fajar">＋ tambah kegiatan</button>
            </div>
          ))}
        </div>
      </div>

      <aside className="flex flex-col gap-4">
        <div className="rounded-[18px] border border-kuning/60 bg-white px-4 py-3.5">
          <h4 className="font-fredoka text-[15px] font-semibold text-pekat">Kebiasaan situasional</h4>
          <p className="mb-2.5 mt-0.5 font-nunito text-[11px] text-pekat/55">Muncul saat momennya datang — centang kalau sempat.</p>
          {situFokus.length === 0 ? <p className="font-nunito text-[11.5px] text-pekat/45">Belum ada yang cocok dengan nilai fokus.</p> : situFokus.map((it, i) => { const done = doneKeb(it.n, it.id); return (
            <button key={it.id} type="button" onClick={() => toggleKeb(it.n, it.id)} className="mb-2.5 flex w-full items-start gap-2 rounded-[9px] border border-pekat/8 px-2.5 py-2 text-left shadow-[0_4px_10px_-6px_rgba(110,59,87,.45)]" style={{ background: `${warnaNilai(it.n)}2e`, transform: `rotate(${i % 2 ? 1 : -1.2}deg)` }}>
              <span className={['mt-0.5 flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[5px] border-2', done ? 'border-daun bg-daun text-white' : 'border-pekat/25 bg-white/70 text-transparent'].join(' ')}><Check className="h-3 w-3" strokeWidth={3} /></span>
              <span className="mt-0.5 flex-shrink-0"><BungaSVG nilai={it.n} mekar={mekarDari(it.n)} ukuran={22} /></span>
              <span className="min-w-0"><span className={['block font-nunito text-[12px] font-extrabold leading-tight text-pekat', done ? 'line-through opacity-55' : ''].join(' ')}>{it.t}</span><span className="mt-0.5 block font-nunito text-[9.5px] font-bold text-pekat/50">{it.kapan} · {it.n}</span></span>
            </button>
          ); })}
        </div>

        <div className="rounded-[18px] border border-rekah/25 bg-white px-4 py-3.5">
          <h4 className="font-fredoka text-[15px] font-semibold text-rekah-tua">Pita Kebiasaan</h4>
          <p className="mb-2.5 mt-0.5 font-nunito text-[11px] text-pekat/55">Kebiasaan yang dicentang menumbuhkan bunganya.</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2.5">
            {nilaiFokus.map(n => (<div key={n} className="text-center" style={{ width: 60 }}><BungaSVG nilai={n} mekar={mekarDari(n)} ukuran={38} /><div className="mt-0.5 font-nunito text-[10px] font-bold leading-tight text-pekat">{n}</div><div className="font-nunito text-[9px] font-bold text-pekat/50">({statusMekar(mekarDari(n))})</div></div>))}
          </div>
        </div>

        <PanelKelola nilaiFokus={nilaiFokus} onKeInbox={onKeInbox} onKeKeluarga={onKeKeluarga} />
      </aside>
    </div>
  );
}
