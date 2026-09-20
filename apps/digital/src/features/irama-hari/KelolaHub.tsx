// =============================================================
// KelolaHub — Kelola Family Operating System (design Langit Peony v1.0).
// Hero + tabs. Tab "Hari Ini" = papan bersama (PapanKegiatan) untuk tanggal
// berjalan + panel kanan (situasional, Pita, Konteks, Untuk Dikelola). Papan &
// data per hari dibagi dengan tab "Rencana Minggu" (satu sumber per tanggal).
// Copy DRAFT — review Psikolog Fitri Effendy.
// =============================================================
import React, { useMemo, useState } from 'react';
import { Check, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import type { NilaiAkar } from '../akar-keluarga/content';
import type { CentangKebiasaan } from '@studiva/shared';
import BotanicalStem from '../../components/BotanicalStem';
import type { BotanicalConfig } from '../../components/BotanicalStem';
import BungaNilai from '../../components/BungaNilai';
import { useChildProfile } from '../beranda-usia/useChildProfile';
import { useAnak } from '../../context/AnakContext';
import { useInboxStore } from './inboxData';
import { useRencanaMinggu, hariIndex, awalMinggu, localISO } from './rencanaData';
import { SITUASIONAL, idNilai, statusMekar, buatMekar, useCentangHari } from './dayPlanData';
import { useParameterPenyesuaian, catatanPenyesuaianRingkas } from './kehidupanData';
import PapanKegiatan from './PapanKegiatan';
import { UntukDikelolaHari } from './RencanaMinggu';
import KehidupanKeluarga from './KehidupanKeluarga';
import InboxKelola from './InboxKelola';
import PerjalananKeluarga from './PerjalananKeluarga';

interface PropsKelolaHub {
  nilaiFokus?: readonly NilaiAkar[];
  centangKebiasaan: CentangKebiasaan;
  tanggalHariIni: string;
  onCentangToggle: (nilaiId: NilaiAkar, butirId: string) => void;
  onBekal: () => void;
}

const TABS = ['Irama Keseharian', 'Kehidupan Keluarga', 'Inbox', 'Perjalanan'];
const HARI_PENDEK = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const HARI_PANJANG_MON = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const BULAN_PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const KEBUN_HERO: { w: number; h: number; dur: string; cfg: BotanicalConfig }[] = [
  { w: 34, h: 50,  dur: '8s',   cfg: { type: 'sprig',   bloom: '#C9B8F0', bloom2: '#EFE9FD', stem: '#8FB84A', stemDark: '#6F9E3F', leaf: '#A7C63E', leaf2: '#8FB84A' } },
  { w: 42, h: 64,  dur: '11s',  cfg: { type: 'tulip',   bloom: '#F06BA8', bloom2: '#F8B9D4', stem: '#8FB84A', stemDark: '#6F9E3F', leaf: '#A7C63E', leaf2: '#8FB84A' } },
  { w: 30, h: 44,  dur: '9s',   cfg: { type: 'leaf',                                          stem: '#8FB84A', stemDark: '#6F9E3F', leaf: '#A7C63E', leaf2: '#8FB84A' } },
  { w: 46, h: 70,  dur: '12s',  cfg: { type: 'daisy',   bloom: '#FFE29A', bloom2: '#FFF3E6', center: '#F06BA8', stem: '#8FB84A', stemDark: '#6F9E3F', leaf: '#A7C63E', leaf2: '#8FB84A' } },
  { w: 32, h: 52,  dur: '10s',  cfg: { type: 'foliage',                                       stem: '#8FB84A', stemDark: '#6F9E3F', leaf: '#A7C63E', leaf2: '#8FB84A' } },
  { w: 38, h: 58,  dur: '9.5s', cfg: { type: 'bell',    bloom: '#8FB8F7', bloom2: '#DCEAFD', stem: '#8FB84A', stemDark: '#6F9E3F', leaf: '#A7C63E', leaf2: '#8FB84A' } },
];

// ─── Untuk Dikelola (sinkron Inbox) ───────────────────────────────────────────

interface RailTugas { id: string; judul: string; done: boolean }

function TugasSlip({ tugas: t, onToggle }: { tugas: RailTugas; onToggle: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button type="button" role="checkbox" aria-checked={t.done} aria-label={t.judul} onClick={onToggle}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', alignItems: 'flex-start', gap: 11, padding: '11px 13px', cursor: 'pointer', borderRadius: 14, background: t.done ? '#FBF3F8' : '#FDF7FB', boxShadow: t.done ? 'none' : '0 10px 22px -20px rgba(90,50,70,.8)', opacity: t.done ? 0.72 : 1, transform: hov ? 'translateX(2px)' : 'translateX(0)', transition: 'transform .16s, opacity .16s', border: 'none', width: '100%', textAlign: 'left' }}>
      <span style={{ width: 20, height: 20, flexShrink: 0, marginTop: 1, borderRadius: '50%', background: t.done ? '#5F84E6' : '#fff', border: t.done ? '2px solid #5F84E6' : '2px solid #C9D8F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Check style={{ width: 11, height: 11, opacity: t.done ? 1 : 0 }} stroke="#fff" strokeWidth={3.6} />
      </span>
      <span style={{ flex: 1, fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 14, lineHeight: 1.35, color: t.done ? '#A98BA0' : '#6E3B57', textDecoration: t.done ? 'line-through' : 'none' }}>{t.judul}</span>
    </button>
  );
}

function UntukDikelola({ todo, doneCount, total, onToggle, onAdd, onLihatSemua }: {
  todo: RailTugas[]; doneCount: number; total: number;
  onToggle: (id: string) => void; onAdd: (judul: string) => void; onLihatSemua?: () => void;
}) {
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const [teks, setTeks] = useState('');
  const submit = () => { const t = teks.trim(); if (!t) return; onAdd(t); setTeks(''); };
  return (
    <div className="animate-fade-in-up" style={{ background: '#fff', border: '2.5px dotted #F06BA8', borderRadius: 22, padding: '16px 18px 18px', boxShadow: '0 16px 36px -34px rgba(90,50,70,.5)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
        <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 18, color: '#6E3B57', margin: 0 }}>Untuk Dikelola</h3>
        <button type="button" onClick={onLihatSemua} style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 13, color: '#F06BA8', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Lihat semua</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
        <span style={{ flex: 1, height: 7, borderRadius: 999, background: '#DCEAFD', display: 'block', overflow: 'hidden' }}>
          <span style={{ display: 'block', height: '100%', borderRadius: 999, background: '#5F84E6', width: `${pct}%`, transition: 'width .3s ease' }} />
        </span>
        <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12, color: '#3F6FD8', flexShrink: 0 }}>{doneCount}/{total}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
        {todo.length === 0 ? (
          <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 12.5, color: '#A98BA0', margin: '2px 0', textAlign: 'center' }}>Semua sudah dikelola.</p>
        ) : todo.map(t => <TugasSlip key={t.id} tugas={t} onToggle={() => onToggle(t.id)} />)}
      </div>
      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, borderRadius: 12, border: '1.5px dashed #F4B4D2', padding: '8px 10px' }}>
        <input value={teks} onChange={e => setTeks(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') submit(); }} placeholder="Tambah hal untuk dikelola…"
          style={{ flex: 1, minWidth: 0, background: 'none', border: 'none', outline: 'none', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 12.5, color: '#6E3B57' }} />
        {teks.trim() && <button type="button" onClick={submit} style={{ flexShrink: 0, borderRadius: 9, border: 'none', background: '#C6407F', color: '#fff', padding: '6px 12px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 11.5, cursor: 'pointer' }}>Tambah</button>}
      </div>
      <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 12, lineHeight: 1.5, color: '#A98BA0', margin: '12px 0 0' }}>Sinkron dengan Inbox — item juga muncul di tab Inbox.</p>
    </div>
  );
}

// ─── Panel kanan Hari Ini ─────────────────────────────────────────────────────

function RailKelola({
  nilaiFokus, situFokus, centangHari, mekarDari, tugasTodo, tugasDone, tugasTotal, onToggleTugas, onAddTugas, onToggleKeb, onKeInbox, onKeKeluarga,
}: {
  nilaiFokus: readonly NilaiAkar[];
  situFokus: { id: string; t: string; n: NilaiAkar; kapan: string }[];
  centangHari: Record<string, string[]>;
  mekarDari: (n: NilaiAkar) => number;
  tugasTodo: RailTugas[];
  tugasDone: number;
  tugasTotal: number;
  onToggleTugas: (id: string) => void;
  onAddTugas: (judul: string) => void;
  onToggleKeb: (n: NilaiAkar, id: string) => void;
  onKeInbox: () => void;
  onKeKeluarga: () => void;
}) {
  const { profile, usiaBulan } = useChildProfile();
  const nama = profile.namaAnak || 'Anak';
  const SOFTS = ['#F5F0FF', '#FFF7DF', '#E4F7F0', '#FFF0E6'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Kebiasaan situasional */}
      <div className="animate-fade-in-up" style={{ background: '#fff', borderRadius: 22, padding: '18px 20px', boxShadow: '0 18px 40px -34px rgba(90,50,70,.55)' }}>
        <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 18, color: '#6E3B57', margin: 0 }}>Kebiasaan situasional</h3>
        <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 13.5, lineHeight: 1.5, color: '#8A5A74', margin: '8px 0 12px' }}>Muncul saat momennya datang — centang kalau sempat.</p>
        {situFokus.length === 0 ? (
          <div style={{ background: '#FBF3F8', borderRadius: 14, padding: '11px 13px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, color: '#8A5A74' }}>Belum ada yang cocok dengan nilai fokus.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {situFokus.map((it, i) => {
              const done = (centangHari[it.n] ?? []).includes(it.id);
              return (
                <button key={it.id} type="button" role="checkbox" aria-checked={done} aria-label={it.t} onClick={() => onToggleKeb(it.n, it.id)}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 10, textAlign: 'left', width: '100%', cursor: 'pointer', border: '1px solid rgba(110,59,87,.08)', borderRadius: 12, padding: '10px 12px', background: '#FDF7FB', boxShadow: '0 8px 18px -14px rgba(90,50,70,.55)', transform: `rotate(${i % 2 ? 0.8 : -0.9}deg)` }}>
                  <span style={{ width: 20, height: 20, flexShrink: 0, marginTop: 1, borderRadius: 6, background: done ? '#F06BA8' : '#fff', border: done ? '2px solid #F06BA8' : '2px solid #E7CFDD', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check style={{ width: 12, height: 12, opacity: done ? 1 : 0 }} stroke="#fff" strokeWidth={3.4} />
                  </span>
                  <span aria-hidden="true" style={{ width: 20, height: 20, flexShrink: 0, marginTop: 1, display: 'block' }}>
                    <BungaNilai value={idNilai(it.n)} state={mekarDari(it.n) > 0 ? 'mekar' : 'istirahat'} size={20} />
                  </span>
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ display: 'block', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 13, lineHeight: 1.3, color: '#6E3B57', textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.6 : 1 }}>{it.t}</span>
                    <span style={{ display: 'block', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 10.5, color: '#B79AAC', marginTop: 2 }}>{it.kapan} · {it.n}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Pita Kebiasaan */}
      <div className="animate-fade-in-up" style={{ background: 'linear-gradient(160deg,#FFF6FA 0%,#fff 60%)', borderRadius: 22, padding: '18px 20px 20px', boxShadow: '0 18px 40px -34px rgba(90,50,70,.55)' }}>
        <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 18, color: '#D2559A', margin: 0 }}>Pita Kebiasaan</h3>
        <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 13.5, lineHeight: 1.5, color: '#8A5A74', margin: '8px 0 0' }}>Kebiasaan yang dicentang menumbuhkan bunganya.</p>
        {nilaiFokus.length === 0 ? (
          <div style={{ marginTop: 14, background: '#FBF3F8', borderRadius: 14, padding: '11px 13px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, color: '#8A5A74' }}>Pilih nilai fokus di Arah.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
            {nilaiFokus.map((n, i) => {
              const lv = mekarDari(n);
              return (
                <div key={n} style={{ background: SOFTS[i % SOFTS.length], borderRadius: 18, padding: '14px 10px', textAlign: 'center' }}>
                  <div style={{ width: 52, height: 52, margin: '0 auto', animation: 'sway 7s ease-in-out infinite', transformOrigin: 'bottom center' }}>
                    <BungaNilai value={idNilai(n)} state={lv > 0 ? 'mekar' : 'istirahat'} size={52} />
                  </div>
                  <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 13, color: '#6E3B57', marginTop: 8, lineHeight: 1.25 }}>{n}</div>
                  <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 11.5, color: '#B79AAC', marginTop: 2 }}>{statusMekar(lv)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Konteks Keluarga */}
      <div className="animate-fade-in-up" style={{ background: '#fff', borderRadius: 22, padding: '18px 20px', boxShadow: '0 18px 40px -34px rgba(90,50,70,.55)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 18, color: '#6E3B57', margin: 0 }}>Konteks Keluarga</h3>
          <button type="button" onClick={onKeKeluarga} style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 13, color: '#F06BA8', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Kelola</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <span aria-hidden="true" style={{ width: 10, height: 10, flexShrink: 0, marginTop: 6, borderRadius: '50%', background: '#D2559A', display: 'block' }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 14.5, color: '#6E3B57' }}>{nama}{usiaBulan != null ? ` · ${usiaBulan} bln` : ''}</div>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 12.5, color: '#B79AAC', marginTop: 2, lineHeight: 1.4 }}>Tumbuh &amp; kembang</div>
            </div>
          </div>
          {nilaiFokus.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <span aria-hidden="true" style={{ width: 10, height: 10, flexShrink: 0, marginTop: 6, borderRadius: '50%', background: '#6E9C4A', display: 'block' }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 14.5, color: '#6E3B57' }}>Fokus</div>
                <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 12.5, color: '#B79AAC', marginTop: 2, lineHeight: 1.4 }}>{nilaiFokus.join(' · ')}</div>
              </div>
            </div>
          )}
          <button type="button" onClick={onKeKeluarga} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <span aria-hidden="true" style={{ width: 10, height: 10, flexShrink: 0, marginTop: 6, borderRadius: '50%', background: '#5F84E6', display: 'block' }} />
            <span style={{ minWidth: 0 }}>
              <span style={{ display: 'block', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 14.5, color: '#6E3B57' }}>Caregiver &amp; Rumah</span>
              <span style={{ display: 'block', fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 12.5, color: '#B79AAC', marginTop: 2, lineHeight: 1.4 }}>Lengkapi di Kehidupan Keluarga</span>
            </span>
          </button>
        </div>
      </div>

      <UntukDikelola todo={tugasTodo} doneCount={tugasDone} total={tugasTotal} onToggle={onToggleTugas} onAdd={onAddTugas} onLihatSemua={onKeInbox} />
    </div>
  );
}

// ─── Tab Irama Keseharian (gabungan Hari Ini + Rencana Minggu) ────────────────

function IramaKeseharian({ nilaiFokus, centangKebiasaan, tanggalHariIni, onCentangToggle, onKeInbox, onKeKeluarga }: {
  nilaiFokus: readonly NilaiAkar[];
  centangKebiasaan: CentangKebiasaan;
  tanggalHariIni: string;
  onCentangToggle: (n: NilaiAkar, id: string) => void;
  onKeInbox: () => void;
  onKeKeluarga: () => void;
}) {
  const { anakAktif } = useAnak();
  const idAnak = anakAktif?.id ?? 'anon';
  const inbox = useInboxStore(idAnak);
  const param = useParameterPenyesuaian(idAnak);
  const catatanKel = catatanPenyesuaianRingkas(param);

  // Minggu + hari terpilih (default hari ini)
  const [offset, setOffset] = useState(0);
  const senin = (() => { const s = awalMinggu(new Date()); s.setDate(s.getDate() + offset * 7); return s; })();
  const rencana = useRencanaMinggu(idAnak, localISO(senin));
  const hariList = Array.from({ length: 7 }, (_, i) => { const d = new Date(senin); d.setDate(senin.getDate() + i); return d; });
  const hariIniIdx = offset === 0 ? hariIndex(new Date()) : -1;
  const [pilihHari, setPilihHari] = useState<number>(() => hariIndex(new Date()));
  const tglAktif = hariList[pilihHari];
  const tglAktifISO = localISO(tglAktif);
  const isHariIni = tglAktifISO === tanggalHariIni;

  const centang = useCentangHari(idAnak, tglAktifISO, { hariIni: tanggalHariIni, realCentang: centangKebiasaan, onReal: onCentangToggle });
  const mekarDari = useMemo(() => buatMekar(centangKebiasaan), [centangKebiasaan]);

  const minggu = hariList[6];
  const rangeLabel = `${senin.getDate()} ${BULAN_PENDEK[senin.getMonth()]} – ${minggu.getDate()} ${BULAN_PENDEK[minggu.getMonth()]}`;
  const judulMinggu = offset === 0 ? 'Minggu ini' : offset === 1 ? 'Minggu depan' : offset === -1 ? 'Minggu lalu' : rangeLabel;

  // Data untuk panel kanan
  const fokusSet = useMemo(() => new Set(nilaiFokus), [nilaiFokus]);
  const situFokus = SITUASIONAL.filter(s => fokusSet.has(s.n));
  const centangHariIni = centangKebiasaan[tanggalHariIni] ?? {};
  const kelolaHari = rencana.items.filter(p => p.hari === pilihHari && p.slot === 'kelola');
  const tugasTodo: RailTugas[] = [
    ...inbox.todo.map(i => ({ id: i.id, judul: i.judul, done: false })),
    ...kelolaHari.filter(p => !p.done).map(p => ({ id: `rc:${p.id}`, judul: p.teks, done: false })),
  ];
  const tugasTotal = inbox.semua.length + kelolaHari.length;
  const tugasDoneCount = inbox.rampung.length + kelolaHari.filter(p => p.done).length;
  const toggleTugas = (id: string) => { if (id.startsWith('rc:')) rencana.toggle(id.slice(3)); else inbox.toggle(id); };

  return (
    <>
      {/* Header minggu + navigasi */}
      <div className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', background: '#fff', borderRadius: 22, border: '1px solid rgba(110,59,87,.1)', padding: '16px 18px', marginBottom: 14, boxShadow: '0 16px 36px -34px rgba(90,50,70,.5)' }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 10.5, letterSpacing: '.6px', textTransform: 'uppercase', color: '#D2559A' }}>Irama Keseharian</div>
          <h2 style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 22, color: '#6E3B57', margin: '2px 0 0' }}>{judulMinggu}</h2>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 12.5, color: '#B79AAC', marginTop: 1 }}>{rangeLabel}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {offset !== 0 && (
            <button type="button" onClick={() => { setOffset(0); setPilihHari(hariIndex(new Date())); }} style={{ borderRadius: 999, border: '1.5px solid #EBD6E2', padding: '7px 14px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12, color: '#8A5A74', background: 'none', cursor: 'pointer' }}>Minggu ini</button>
          )}
          <button type="button" aria-label="Minggu sebelumnya" onClick={() => setOffset(o => o - 1)} style={{ width: 36, height: 36, borderRadius: 12, border: '1.5px solid #EBD6E2', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8A5A74' }}><ChevronLeft style={{ width: 18, height: 18 }} strokeWidth={2.4} /></button>
          <button type="button" aria-label="Minggu berikutnya" onClick={() => setOffset(o => o + 1)} style={{ width: 36, height: 36, borderRadius: 12, border: '1.5px solid #EBD6E2', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8A5A74' }}><ChevronRight style={{ width: 18, height: 18 }} strokeWidth={2.4} /></button>
        </div>
      </div>

      {/* Fokus keluarga minggu ini */}
      {nilaiFokus.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 11.5, color: '#8A5A74' }}>Fokus keluarga:</span>
          {nilaiFokus.map(n => <span key={n} style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12, color: '#C6407F', background: '#FBE7EC', borderRadius: 999, padding: '4px 12px' }}>{n}</span>)}
        </div>
      )}

      {/* Strip hari */}
      <div style={{ display: 'flex', gap: 7, marginBottom: 16, overflowX: 'auto', paddingBottom: 2 }}>
        {hariList.map((d, i) => {
          const aktif = i === pilihHari;
          return (
            <button key={i} type="button" onClick={() => setPilihHari(i)}
              style={{ flex: '1 0 auto', minWidth: 64, borderRadius: 16, padding: '9px 6px', cursor: 'pointer', textAlign: 'center', border: aktif ? '2px solid #C6407F' : i === hariIniIdx ? '1.5px solid #F4B4D2' : '1px solid rgba(110,59,87,.12)', background: aktif ? '#C6407F' : '#fff' }}>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 10.5, letterSpacing: '.3px', color: aktif ? 'rgba(255,255,255,.85)' : '#B79AAC' }}>{HARI_PENDEK[i]}</div>
              <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 17, color: aktif ? '#fff' : '#6E3B57', lineHeight: 1.1 }}>{d.getDate()}</div>
            </button>
          );
        })}
      </div>

      {/* Judul hari terpilih */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 19, color: '#6E3B57', margin: 0 }}>
          {HARI_PANJANG_MON[pilihHari]}{isHariIni ? ' · hari ini' : ''}
        </h3>
        <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, color: '#B79AAC' }}>{tglAktif.getDate()} {BULAN_PENDEK[tglAktif.getMonth()]}</span>
        {!isHariIni && <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 11.5, color: '#A98BA0', background: '#F5EEF3', borderRadius: 999, padding: '3px 10px' }}>merencanakan</span>}
      </div>

      {/* Banner penyesuaian — hanya saat hari ini */}
      {isHariIni && catatanKel && (
        <div className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16, background: 'linear-gradient(150deg,#fff,#E7F2E4 150%)', border: '1px solid #D6E8D0', borderRadius: 18, padding: '13px 16px' }}>
          <span style={{ width: 34, height: 34, flexShrink: 0, borderRadius: '70% 70% 70% 6px', background: '#E7F2E4', color: '#4F7A48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sparkles style={{ width: 18, height: 18 }} strokeWidth={2} /></span>
          <span style={{ flex: 1, minWidth: 180, fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13.5, color: '#4A3550', lineHeight: 1.45 }}>
            Langkah hari ini <b style={{ fontWeight: 800 }}>ditata mengikuti keadaan keluarga</b> — {catatanKel}.
            <span style={{ fontWeight: 800, color: '#7A5CA6', background: '#EFE9FB', borderRadius: 6, padding: '1px 6px', marginLeft: 6, fontSize: 9.5 }}>DISUSUN AI</span>
          </span>
          <button type="button" onClick={onKeKeluarga}
            style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #CDE1C7', color: '#4F7A48', borderRadius: 11, padding: '8px 14px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5, cursor: 'pointer' }}>
            Lihat Kehidupan Keluarga
          </button>
        </div>
      )}

      {/* Papan hari terpilih + panel kanan (kaya utk hari ini, ringan utk hari lain) */}
      <div className="grid items-start gap-4 xl:grid-cols-[1fr_320px]">
        <PapanKegiatan idAnak={idAnak} tanggal={tglAktifISO} nilaiFokus={nilaiFokus} centangHari={centang.centangHari} onToggleKeb={centang.toggle} mekarDari={mekarDari} param={isHariIni ? param : undefined} />
        {isHariIni ? (
          <RailKelola nilaiFokus={nilaiFokus} situFokus={situFokus} centangHari={centangHariIni} mekarDari={mekarDari}
            tugasTodo={tugasTodo} tugasDone={tugasDoneCount} tugasTotal={tugasTotal} onToggleTugas={toggleTugas} onAddTugas={inbox.tambah}
            onToggleKeb={onCentangToggle} onKeInbox={onKeInbox} onKeKeluarga={onKeKeluarga} />
        ) : (
          <UntukDikelolaHari items={kelolaHari} onAdd={teks => rencana.tambah(pilihHari, 'kelola', teks)} onToggle={rencana.toggle} onDel={rencana.hapus} />
        )}
      </div>

      <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 11.5, color: '#A98BA0', margin: '14px 2px 0', lineHeight: 1.6 }}>
        Hari ini kamu <b style={{ color: '#8A5A74' }}>menjalani</b>; hari lain kamu <b style={{ color: '#8A5A74' }}>merencanakan</b>. Susunan tiap hari otomatis muncul saat harinya tiba. Tersimpan per tanggal di perangkat ini (localStorage).
      </p>
    </>
  );
}

// ─── Main KelolaHub ───────────────────────────────────────────────────────────

export default function KelolaHub({ nilaiFokus = [], centangKebiasaan, tanggalHariIni, onCentangToggle, onBekal }: PropsKelolaHub) {
  const [tab, setTab] = useState('Irama Keseharian');
  void onBekal;

  return (
    <article style={{ background: '#FCEBD7', color: '#6E3B57' }} className="pt-6 pb-20">
      {/* Hero */}
      <div className="animate-fade-in-up" style={{ position: 'relative', overflow: 'hidden', borderRadius: 32, background: 'linear-gradient(120deg,#FBD9E9 0%,#F6DCF3 34%,#E6DDFB 62%,#DCEAFD 100%)', boxShadow: '0 26px 54px -40px rgba(90,50,70,.55)', marginBottom: 24 }}>
        <div aria-hidden="true" style={{ display: 'flex', height: 7 }}>
          <span style={{ flex: 2, background: '#F06BA8', display: 'block' }} />
          <span style={{ flex: 1, background: '#F8B9D4', display: 'block' }} />
          <span style={{ flex: 1.4, background: '#FFE29A', display: 'block' }} />
          <span style={{ flex: 1, background: '#C9B8F0', display: 'block' }} />
          <span style={{ flex: 1.6, background: '#8FB8F7', display: 'block' }} />
        </div>
        <div aria-hidden="true" style={{ position: 'absolute', right: 22, bottom: 0, display: 'flex', alignItems: 'flex-end', gap: 6, pointerEvents: 'none', opacity: 0.75 }}>
          {KEBUN_HERO.map((k, i) => (
            <div key={i} style={{ width: k.w, height: k.h, animation: `sway ${k.dur} ease-in-out infinite`, transformOrigin: 'bottom center' }}>
              <BotanicalStem cfg={k.cfg} />
            </div>
          ))}
        </div>
        <div style={{ position: 'relative', padding: '26px 34px 0' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.75)', borderRadius: 999, padding: '6px 14px' }}>
            <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', background: '#F06BA8', display: 'block', flexShrink: 0 }} />
            <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 11.5, letterSpacing: 1, textTransform: 'uppercase', color: '#B4477F' }}>Pusat Kendali Keluarga</span>
          </div>
          <h1 style={{ fontFamily: 'Shantell Sans, cursive', fontWeight: 700, fontSize: 52, color: '#6E3B57', margin: '12px 0 0', letterSpacing: -1, lineHeight: 0.98 }}>Kelola</h1>
          <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 17, color: '#7A4A64', marginTop: 8 }}>Wujudkan langkah kecil, untuk perubahan besar.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 22, paddingBottom: 22 }}>
            {TABS.map(t => {
              const active = tab === t;
              return (
                <button key={t} type="button" onClick={() => setTab(t)}
                  style={{ padding: '11px 20px', borderRadius: 999, cursor: 'pointer', border: 'none', background: active ? '#C6407F' : '#fff', color: active ? '#fff' : '#8A5A74', fontFamily: 'Nunito, sans-serif', fontWeight: active ? 800 : 700, fontSize: 15, boxShadow: active ? '0 14px 28px -18px rgba(198,64,127,.9)' : '0 12px 26px -24px rgba(90,50,70,.7)', transition: 'background .22s, color .22s, box-shadow .22s' }}>
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab content */}
      {tab === 'Irama Keseharian' && (
        <IramaKeseharian nilaiFokus={nilaiFokus} centangKebiasaan={centangKebiasaan} tanggalHariIni={tanggalHariIni} onCentangToggle={onCentangToggle}
          onKeInbox={() => setTab('Inbox')} onKeKeluarga={() => setTab('Kehidupan Keluarga')} />
      )}
      {tab === 'Kehidupan Keluarga' && <KehidupanKeluarga nilaiFokus={nilaiFokus} onKeInbox={() => setTab('Inbox')} />}
      {tab === 'Inbox' && <InboxKelola />}
      {tab === 'Perjalanan' && <PerjalananKeluarga nilaiFokus={nilaiFokus} />}
    </article>
  );
}
