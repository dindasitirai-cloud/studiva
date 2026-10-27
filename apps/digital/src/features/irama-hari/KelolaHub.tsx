// =============================================================
// KelolaHub — Kelola Family Operating System (design Langit Peony v1.0).
// Hero + tabs. Tab "Hari Ini" = Pita Kebiasaan + satu kotak kalender berisi
// navigasi minggu, baris hari, papan Pagi/Siang/Malam (PapanKegiatan) dan kolom
// kanan (Untuk Dikelola + Kebiasaan situasional, ditumpuk). Papan & data per
// hari dibagi dengan tab "Rencana Minggu" (satu sumber per tanggal).
// Copy DRAFT — review Psikolog Fitri Effendy.
// =============================================================
import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import TautanSumber from '../../components/TautanSumber';
import { Check, Sparkles, ChevronLeft, ChevronRight, NotebookPen } from 'lucide-react';
import type { NilaiAkar } from '../akar-keluarga/content';
import type { CentangKebiasaan } from '@studiva/shared';
import BotanicalStem from '../../components/BotanicalStem';
import type { BotanicalConfig } from '../../components/BotanicalStem';
import BungaNilai from '../../components/BungaNilai';
import { plant, Tanaman, type TanamanCfg } from '../beranda/komponen/plant';
import { useChildProfile } from '../beranda-usia/useChildProfile';
import { useAnak } from '../../context/AnakContext';
import { useInboxStore, SUMBER } from './inboxData';
import { useRencanaMinggu, hariIndex, awalMinggu, localISO } from './rencanaData';
import { idNilai, statusMekar, buatMekar, useCentangHari } from './dayPlanData';
import { useParameterPenyesuaian, catatanPenyesuaianRingkas } from './kehidupanData';
import PapanKegiatan from './PapanKegiatan';
import { useIramaKatalog, situasionalUntuk } from './iramaKatalog';
import { UntukDikelolaHari } from './RencanaMinggu';
import KehidupanKeluarga from './KehidupanKeluarga';
import type { KonteksAwal } from './KehidupanKeluarga';
import DaftarDikelola, { type ItemDikelola } from './DaftarDikelola';
import PerjalananKeluarga from './PerjalananKeluarga';
import JurnalTemani from '../temani/JurnalTemani';
import { useTerlihat, labelTerlihat as labelIdTerlihat } from './terlihatData';

interface PropsKelolaHub {
  nilaiFokus?: readonly NilaiAkar[];
  centangKebiasaan: CentangKebiasaan;
  tanggalHariIni: string;
  onCentangToggle: (nilaiId: NilaiAkar, butirId: string) => void;
  onBekal: () => void;
}

// Phase 22: urutan tab mengikuti siklus — jalani → catat → baca & sesuaikan; lalu keadaan & tangkap.
// Tab Inbox dihapus (2026-10-27): isinya dibuka dari kartu Untuk Dikelola → Lihat semua.
const TABS = ['Irama Keseharian', 'Jurnal', 'Perjalanan', 'Kehidupan Keluarga'];
const KATA_KERJA: Record<string, string> = { 'Irama Keseharian': 'jalani', Jurnal: 'catat', Perjalanan: 'baca', 'Kehidupan Keluarga': 'keadaan' };
// ?tab= (slug) → tab awal. Dipakai pengalihan route lama /kompas-keluarga → Perjalanan (Phase 21).
const TAB_SLUG: Record<string, string> = { irama: 'Irama Keseharian', jurnal: 'Jurnal', keluarga: 'Kehidupan Keluarga', perjalanan: 'Perjalanan' };
// Tautan lama ?tab=inbox dan ?tab=dikelola → Irama Keseharian dengan daftar Untuk Dikelola terbuka.
const SLUG_DIKELOLA = new Set(['inbox', 'dikelola']);
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

// Bunga kepala kartu kolom kanan (seragam dengan Beranda · RencanaHariIni).
const RING_DOTS = [0, 1, 2, 3, 4, 5, 6];
// "Untuk Dikelola" — persis slot "Untuk dikelola" di Beranda (hangat, merah muda).
const BUNGA_DIKELOLA: TanamanCfg[] = [
  { w: '26px', h: '40px', dur: '10.5s', cfg: plant('foliage', {}) },
  { w: '34px', h: '52px', dur: '12.5s', cfg: plant('daisy', { b: '#F8B9D4', b2: '#FFF1F7', c: '#F0479B' }) },
  { w: '26px', h: '40px', dur: '9s', cfg: plant('sprig', { b: '#FFE29A', b2: '#FFF3E6' }) },
];
// "Kebiasaan situasional" — pita bunga penuh (motif BotanicalStem brand Rekah),
// tersusun acak-rapi selebar header; beda dari Untuk Dikelola, tetap satu tema.

// Pita bunga penuh — mengisi kepala kartu situasional (motif brand Rekah).
function PolaBunga() {
  const sebar: { left: string; bottom: string; w: string; h: string; dur: string; cfg: BotanicalConfig }[] = [
    { left: '1%',  bottom: '-4px', w: '20px', h: '30px', dur: '9s',    cfg: plant('fivepetal', { b: '#D56A9E', b2: '#F3A9CC', c: '#5E3B57' }) },
    { left: '9%',  bottom: '3px',  w: '16px', h: '24px', dur: '11s',   cfg: plant('sprig', { b: '#9DB8F2', b2: '#E4ECFD' }) },
    { left: '16%', bottom: '-6px', w: '22px', h: '34px', dur: '10s',   cfg: plant('daisy', { b: '#6E86DE', b2: '#DCE4FB', c: '#FFE29A' }) },
    { left: '25%', bottom: '2px',  w: '14px', h: '22px', dur: '12s',   cfg: plant('leaf', {}) },
    { left: '31%', bottom: '-4px', w: '18px', h: '28px', dur: '9.5s',  cfg: plant('tulip', { b: '#E07AAE', b2: '#FFE29A' }) },
    { left: '39%', bottom: '4px',  w: '15px', h: '24px', dur: '10.5s', cfg: plant('foliage', {}) },
    { left: '46%', bottom: '-5px', w: '20px', h: '32px', dur: '8.5s',  cfg: plant('fivepetal', { b: '#D56A9E', b2: '#F3A9CC', c: '#5E3B57' }) },
    { left: '55%', bottom: '3px',  w: '15px', h: '22px', dur: '11.5s', cfg: plant('bell', { b: '#C9B8F0', b2: '#EFE9FD' }) },
    { left: '61%', bottom: '-4px', w: '20px', h: '30px', dur: '10s',   cfg: plant('sprig', { b: '#9DB8F2', b2: '#E4ECFD' }) },
    { left: '69%', bottom: '4px',  w: '16px', h: '24px', dur: '9s',    cfg: plant('daisy', { b: '#6E86DE', b2: '#DCE4FB', c: '#FFE29A' }) },
    { left: '77%', bottom: '-6px', w: '20px', h: '34px', dur: '12s',   cfg: plant('leaf', {}) },
    { left: '85%', bottom: '1px',  w: '17px', h: '26px', dur: '9.5s',  cfg: plant('tulip', { b: '#E07AAE', b2: '#FFE29A' }) },
    { left: '92%', bottom: '-4px', w: '19px', h: '30px', dur: '10.5s', cfg: plant('foliage', {}) },
  ];
  return (
    <>
      {sebar.map((p, i) => (
        <Tanaman key={i} w={p.w} h={p.h} dur={p.dur} cfg={p.cfg} style={{ position: 'absolute', left: p.left, bottom: p.bottom }} />
      ))}
    </>
  );
}

// ─── Untuk Dikelola ───────────────────────────────────────────

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
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', background: '#FFFBF2', borderRadius: '8px 8px 22px 22px', overflow: 'hidden', boxShadow: '0 16px 36px -34px rgba(90,50,70,.5)' }}>
      {/* Kepala botani — seragam dengan Beranda */}
      <div aria-hidden="true" style={{ position: 'relative', height: 72, overflow: 'hidden', background: '#FFE4F0' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: -6, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 3 }}>
          {BUNGA_DIKELOLA.map((b, i) => <Tanaman key={i} {...b} />)}
        </div>
      </div>
      <div aria-hidden="true" style={{ display: 'flex', gap: 4, padding: '6px 16px 0', justifyContent: 'space-between' }}>
        {RING_DOTS.map(r => <span key={r} style={{ width: 6, height: 6, borderRadius: '50%', background: '#E4CDB4', display: 'block' }} />)}
      </div>
      {/* Isi */}
      <div style={{ padding: '10px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 18, color: '#6E3B57', lineHeight: 1.15 }}>Untuk Dikelola</div>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 11.5, color: '#8A3A66', marginTop: 2 }}>Belum punya waktu</div>
          </div>
          <button type="button" onClick={onLihatSemua} aria-haspopup="dialog" style={{ flexShrink: 0, fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5, color: '#B4477F', background: 'none', border: 'none', cursor: 'pointer', padding: '12px 4px', margin: '-12px -4px' }}>Lihat semua</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
          <span style={{ flex: 1, height: 7, borderRadius: 999, background: '#DCEAFD', display: 'block', overflow: 'hidden' }}>
            <span style={{ display: 'block', height: '100%', borderRadius: 999, background: '#5F84E6', width: `${pct}%`, transition: 'width .3s ease' }} />
          </span>
          <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12, color: '#3F6FD8', flexShrink: 0 }}>{doneCount}/{total}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
          {todo.every(t => t.done) && (
            <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 12.5, color: '#A98BA0', margin: '2px 0', textAlign: 'center' }}>{todo.length === 0 ? 'Belum ada yang perlu dikelola.' : 'Semua sudah dikelola.'}</p>
          )}
          {todo.map(t => <TugasSlip key={t.id} tugas={t} onToggle={() => onToggle(t.id)} />)}
        </div>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, borderRadius: 12, border: '1.5px dashed #F4B4D2', padding: '8px 10px' }}>
          <input value={teks} onChange={e => setTeks(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') submit(); }} placeholder="Tambah hal untuk dikelola…"
            style={{ flex: 1, minWidth: 0, background: 'none', border: 'none', outline: 'none', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 12.5, color: '#6E3B57' }} />
          {teks.trim() && <button type="button" onClick={submit} style={{ flexShrink: 0, borderRadius: 9, border: 'none', background: '#C6407F', color: '#fff', padding: '6px 12px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 11.5, cursor: 'pointer' }}>Tambah</button>}
        </div>
        <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 12, lineHeight: 1.5, color: '#A98BA0', margin: '12px 0 0' }}>Lihat semua untuk melihat yang sudah ditandai.</p>
      </div>
    </div>
  );
}

// ─── Pita Kebiasaan (di atas kotak, lebar penuh) ──────────────────────────────

function PitaKebiasaan({ nilaiFokus, mekarDari }: { nilaiFokus: readonly NilaiAkar[]; mekarDari: (n: NilaiAkar) => number }) {
  const SOFTS = ['#F5F0FF', '#FFF7DF', '#E4F7F0', '#FFF0E6'];
  return (
    <div className="animate-fade-in-up" style={{ background: 'linear-gradient(160deg,#FFF6FA 0%,#fff 60%)', borderRadius: 22, padding: '18px 20px 20px', boxShadow: '0 18px 40px -34px rgba(90,50,70,.55)', marginBottom: 18 }}>
      <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 18, color: '#D2559A', margin: 0 }}>Pita Kebiasaan</h3>
      <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 13.5, lineHeight: 1.5, color: '#8A5A74', margin: '8px 0 0' }}>Kebiasaan yang dicentang menumbuhkan bunganya.</p>
      {nilaiFokus.length === 0 ? (
        <div style={{ marginTop: 14, background: '#FBF3F8', borderRadius: 14, padding: '11px 13px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, color: '#8A5A74' }}>Pilih nilai fokus di tab Perjalanan.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 128px)', gap: 14, marginTop: 16, justifyContent: 'start' }}>
          {nilaiFokus.map((n, i) => {
            const lv = mekarDari(n);
            return (
              <div key={n} style={{ width: 128, height: 128, boxSizing: 'border-box', background: SOFTS[i % SOFTS.length], borderRadius: 22, padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', overflow: 'hidden' }}>
                <div style={{ width: 48, height: 48, animation: 'sway 7s ease-in-out infinite', transformOrigin: 'bottom center' }}>
                  <BungaNilai value={idNilai(n)} state={lv > 0 ? 'mekar' : 'istirahat'} size={48} />
                </div>
                <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 14, color: '#6E3B57', marginTop: 7, lineHeight: 1.2 }}>{n}</div>
                <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 12.5, color: '#B79AAC', marginTop: 2 }}>{statusMekar(lv)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Kolom kanan Hari Ini: Untuk Dikelola + Kebiasaan situasional (ditumpuk) ───

function RailKelola({
  situFokus, centangHari, mekarDari, tugasTodo, tugasDone, tugasTotal, onToggleTugas, onAddTugas, onToggleKeb, onKeInbox,
}: {
  situFokus: { id: string; t: string; n: NilaiAkar; kapan: string; sumber?: string }[];
  centangHari: Record<string, string[]>;
  mekarDari: (n: NilaiAkar) => number;
  tugasTodo: RailTugas[];
  tugasDone: number;
  tugasTotal: number;
  onToggleTugas: (id: string) => void;
  onAddTugas: (judul: string) => void;
  onToggleKeb: (n: NilaiAkar, id: string) => void;
  onKeInbox: () => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <UntukDikelola todo={tugasTodo} doneCount={tugasDone} total={tugasTotal} onToggle={onToggleTugas} onAdd={onAddTugas} onLihatSemua={onKeInbox} />

      {/* Kebiasaan situasional — dekorasi tunas sejuk, beda dari Untuk Dikelola */}
      <div className="animate-fade-in-up" style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', border: '1px solid #ECE4FA', boxShadow: '0 18px 40px -34px rgba(90,50,70,.55)' }}>
        <div aria-hidden="true" style={{ position: 'relative', height: 58, overflow: 'hidden', background: '#F7E4EE' }}>
          <PolaBunga />
        </div>
        <div style={{ padding: '14px 18px 18px' }}>
          <span style={{ display: 'inline-block', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 9.5, letterSpacing: '.6px', textTransform: 'uppercase', color: '#7A5CA6', background: '#EFE9FB', borderRadius: 999, padding: '3px 9px' }}>Saat momennya</span>
          <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 18, color: '#6E3B57', margin: '8px 0 0' }}>Kebiasaan situasional</h3>
          <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 13, lineHeight: 1.5, color: '#8A5A74', margin: '6px 0 12px' }}>Muncul saat momennya datang — centang kalau sempat.</p>
          {situFokus.length === 0 ? (
            <div style={{ background: '#F4F0FC', borderRadius: 14, padding: '11px 13px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, color: '#7A6A96' }}>Belum ada yang cocok dengan nilai fokus.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {situFokus.map((it, i) => {
                const done = (centangHari[it.n] ?? []).includes(it.id);
                return (
                  <div key={it.id} style={{ transform: `rotate(${i % 2 ? 0.8 : -0.9}deg)` }}>
                  <button type="button" role="checkbox" aria-checked={done} aria-label={it.t} onClick={() => onToggleKeb(it.n, it.id)}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 10, textAlign: 'left', width: '100%', cursor: 'pointer', border: '1px solid rgba(123,88,201,.14)', borderRadius: 12, padding: '10px 12px', background: '#F8F4FE', boxShadow: '0 8px 18px -14px rgba(90,50,70,.55)' }}>
                    <span style={{ width: 20, height: 20, flexShrink: 0, marginTop: 1, borderRadius: 6, background: done ? '#7B58C9' : '#fff', border: done ? '2px solid #7B58C9' : '2px solid #D6C8EF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check style={{ width: 12, height: 12, opacity: done ? 1 : 0 }} stroke="#fff" strokeWidth={3.4} />
                    </span>
                    <span aria-hidden="true" style={{ width: 20, height: 20, flexShrink: 0, marginTop: 1, display: 'block' }}>
                      <BungaNilai value={idNilai(it.n)} state={mekarDari(it.n) > 0 ? 'mekar' : 'istirahat'} size={20} />
                    </span>
                    <span style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ display: 'block', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 13, lineHeight: 1.3, color: '#6E3B57', textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.6 : 1 }}>{it.t}</span>
                      <span style={{ display: 'block', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 10.5, color: '#9B86BC', marginTop: 2 }}>{it.kapan} · {it.n}</span>
                    </span>
                  </button>
                  {it.sumber && (
                    <div style={{ padding: '4px 12px 0 42px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 10.5, lineHeight: 1.45, color: '#9B86BC' }}>
                      Sumber: <TautanSumber sumber={it.sumber} ringkas />
                    </div>
                  )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tab Irama Keseharian (gabungan Hari Ini + Rencana Minggu) ────────────────

function IramaKeseharian({ nilaiFokus, centangKebiasaan, tanggalHariIni, onCentangToggle, dikelolaTerbuka, setDikelolaTerbuka, onKeKeluarga, onKeJurnal }: {
  onKeJurnal?: (tanggal: string) => void;
  nilaiFokus: readonly NilaiAkar[];
  centangKebiasaan: CentangKebiasaan;
  tanggalHariIni: string;
  onCentangToggle: (n: NilaiAkar, id: string) => void;
  dikelolaTerbuka: boolean;
  setDikelolaTerbuka: (b: boolean) => void;
  onKeKeluarga: () => void;
}) {
  const { anakAktif } = useAnak();
  const idAnak = anakAktif?.id ?? 'anon';
  const inbox = useInboxStore(idAnak);
  const param = useParameterPenyesuaian(idAnak);
  const { usiaBulan: usiaAnak } = useChildProfile();
  const katalogIrama = useIramaKatalog();
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
  // Phase 22 — ringkasan "Catatan hari ini" (membaca Jurnal: yang terlihat) + pintu ke Jurnal.
  const terlihat = useTerlihat(idAnak);
  const labelTerlihat = terlihat.diHari(tglAktifISO).map(id => labelIdTerlihat(id)).filter((x): x is string => !!x);
  const bisaDicatat = tglAktifISO <= tanggalHariIni;

  const centang = useCentangHari(idAnak, tglAktifISO, { hariIni: tanggalHariIni, realCentang: centangKebiasaan, onReal: onCentangToggle });
  const mekarDari = useMemo(() => buatMekar(centangKebiasaan), [centangKebiasaan]);

  const minggu = hariList[6];
  const rangeLabel = `${senin.getDate()} ${BULAN_PENDEK[senin.getMonth()]} – ${minggu.getDate()} ${BULAN_PENDEK[minggu.getMonth()]} ${minggu.getFullYear()}`;
  const judulMinggu = offset === 0 ? 'Minggu ini' : offset === 1 ? 'Minggu depan' : offset === -1 ? 'Minggu lalu' : rangeLabel;

  // Data untuk kolom kanan
  const fokusSet = useMemo(() => new Set(nilaiFokus), [nilaiFokus]);
  const situFokus = useMemo(() => situasionalUntuk(usiaAnak ?? 0, fokusSet, katalogIrama), [usiaAnak, fokusSet, katalogIrama]);
  const centangHariIni = centangKebiasaan[tanggalHariIni] ?? {};
  const kelolaHari = rencana.items.filter(p => p.hari === pilihHari && p.slot === 'kelola');
  // Hitungan "Untuk Dikelola" = yang tampil di kartu HARI INI: semua yang belum selesai
  // + yang diselesaikan hari ini (dicoret). Yang selesai di hari-hari lalu tidak ikut dihitung.
  const inboxSelesaiHariIni = inbox.rampung.filter(i => inbox.selesaiPada[i.id] === tanggalHariIni);
  const tugasTodo: RailTugas[] = [
    ...inbox.todo.map(i => ({ id: i.id, judul: i.judul, done: false })),
    ...kelolaHari.filter(p => !p.done).map(p => ({ id: `rc:${p.id}`, judul: p.teks, done: false })),
    ...inboxSelesaiHariIni.map(i => ({ id: i.id, judul: i.judul, done: true })),
    ...kelolaHari.filter(p => p.done).map(p => ({ id: `rc:${p.id}`, judul: p.teks, done: true })),
  ];
  const tugasTotal = tugasTodo.length;
  const tugasDoneCount = tugasTodo.filter(t => t.done).length;
  const toggleTugas = (id: string) => { if (id.startsWith('rc:')) rencana.toggle(id.slice(3)); else inbox.toggle(id); };

  // Jendela "Lihat semua": semua item Untuk Dikelola, dibagi belum / sudah ditandai.
  // Yang sudah ditandai memuat seluruh riwayat Inbox (terbaru di atas), bukan hanya hari ini.
  const RENCANA = { label: 'Rencana hari ini', warna: '#FFE29A' };
  const dikelolaBelum: ItemDikelola[] = [
    ...inbox.todo.map(i => ({ id: i.id, judul: i.judul, ket: i.ket, due: i.due, sumber: i.src === 'manual' ? undefined : SUMBER[i.src] })),
    ...kelolaHari.filter(p => !p.done).map(p => ({ id: `rc:${p.id}`, judul: p.teks, sumber: RENCANA })),
  ];
  const dikelolaSudah: ItemDikelola[] = [
    ...kelolaHari.filter(p => p.done).map(p => ({ id: `rc:${p.id}`, judul: p.teks, sumber: RENCANA, ditandaiPada: p.ditandaiPada ?? '' })),
    ...[...inbox.rampung]
      .sort((a, b) => (inbox.ditandaiPada[b.id] ?? '').localeCompare(inbox.ditandaiPada[a.id] ?? ''))
      .map(i => ({ id: i.id, judul: i.judul, sumber: i.src === 'manual' ? undefined : SUMBER[i.src], ditandaiPada: inbox.ditandaiPada[i.id] })),
  ];
  const hapusDikelola = (id: string) => { if (id.startsWith('rc:')) rencana.hapus(id.slice(3)); else inbox.hapus(id); };

  const resetHariIni = () => { setOffset(0); setPilihHari(hariIndex(new Date())); };

  return (
    <>
      {/* Pita Kebiasaan — di atas kotak, lebar penuh */}
      <PitaKebiasaan nilaiFokus={nilaiFokus} mekarDari={mekarDari} />

      {/* Fokus keluarga minggu ini */}
      {nilaiFokus.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 11.5, color: '#8A5A74' }}>Fokus keluarga:</span>
          {nilaiFokus.map(n => <span key={n} style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12, color: '#C6407F', background: '#FBE7EC', borderRadius: 999, padding: '4px 12px' }}>{n}</span>)}
        </div>
      )}

      {/* Kotak kalender: navigasi minggu + baris hari + papan + kolom kanan */}
      <div className="animate-fade-in-up" style={{ background: '#fff', borderRadius: 30, overflow: 'hidden', boxShadow: '0 30px 60px -40px rgba(110,59,87,.5)' }}>
        {/* Kepala kotak: navigasi minggu */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '18px 24px', background: 'linear-gradient(120deg,#FBD9E9 0%,#F6DCF3 36%,#E6DDFB 66%,#DCEAFD 100%)' }}>
          <div style={{ minWidth: 160 }}>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 10.5, letterSpacing: '.6px', textTransform: 'uppercase', color: '#B4477F' }}>Irama Keseharian</div>
            <h2 style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 23, color: '#6E3B57', margin: '2px 0 0' }}>{judulMinggu}</h2>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 12.5, color: '#9A7188', marginTop: 1 }}>{rangeLabel}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button type="button" onClick={resetHariIni} style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 13, color: '#C6407F', background: 'rgba(255,255,255,.65)', border: 'none', borderRadius: 999, padding: '7px 15px', cursor: 'pointer' }}>Hari ini</button>
            <button type="button" aria-label="Minggu sebelumnya" onClick={() => setOffset(o => o - 1)} style={{ width: 34, height: 34, borderRadius: 12, border: 'none', background: 'rgba(255,255,255,.65)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6E3B57' }}><ChevronLeft style={{ width: 18, height: 18 }} strokeWidth={2.4} /></button>
            <button type="button" aria-label="Minggu berikutnya" onClick={() => setOffset(o => o + 1)} style={{ width: 34, height: 34, borderRadius: 12, border: 'none', background: 'rgba(255,255,255,.65)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6E3B57' }}><ChevronRight style={{ width: 18, height: 18 }} strokeWidth={2.4} /></button>
          </div>
        </div>

        {/* Baris hari */}
        <div style={{ display: 'flex', gap: 4, padding: '12px 16px', borderBottom: '1px solid #F3E7EF', overflowX: 'auto' }}>
          {hariList.map((d, i) => {
            const aktif = i === pilihHari;
            const iniHari = i === hariIniIdx;
            return (
              <button key={i} type="button" onClick={() => setPilihHari(i)}
                style={{ flex: '1 0 auto', minWidth: 60, textAlign: 'center', cursor: 'pointer', padding: '7px 6px', borderRadius: 14, border: 'none', background: aktif ? '#FBF1F6' : 'none' }}>
                <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 21, lineHeight: 1.05, color: aktif ? '#6E3B57' : '#B79AAC' }}>{String(d.getDate()).padStart(2, '0')}</div>
                <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 10, letterSpacing: '.3px', textTransform: 'uppercase', color: aktif ? '#C6407F' : '#C9B2BE', marginTop: 2 }}>{HARI_PENDEK[i]}{iniHari ? ' · hari ini' : ''}</div>
              </button>
            );
          })}
        </div>

        {/* Badan kotak */}
        <div style={{ padding: '20px 22px 22px' }}>
          {/* Judul hari terpilih — hanya saat merencanakan (bukan hari ini) */}
          {!isHariIni && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
              <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 19, color: '#6E3B57', margin: 0 }}>{HARI_PANJANG_MON[pilihHari]}</h3>
              <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, color: '#B79AAC' }}>{tglAktif.getDate()} {BULAN_PENDEK[tglAktif.getMonth()]}</span>
              <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 11.5, color: '#A98BA0', background: '#F5EEF3', borderRadius: 999, padding: '3px 10px' }}>merencanakan</span>
            </div>
          )}

          {/* Banner penyesuaian — hanya saat hari ini */}
          {isHariIni && catatanKel && (
            <div className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16, background: 'linear-gradient(150deg,#fff,#E7F2E4 150%)', border: '1px solid #D6E8D0', borderRadius: 16, padding: '12px 15px' }}>
              <span style={{ width: 32, height: 32, flexShrink: 0, borderRadius: '70% 70% 70% 6px', background: '#E7F2E4', color: '#4F7A48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sparkles style={{ width: 17, height: 17 }} strokeWidth={2} /></span>
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

          {/* Papan hari terpilih + kolom kanan (kaya utk hari ini, ringan utk hari lain) */}
          <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
            <PapanKegiatan idAnak={idAnak} tanggal={tglAktifISO} nilaiFokus={nilaiFokus} centangHari={centang.centangHari} onToggleKeb={centang.toggle} mekarDari={mekarDari} param={isHariIni ? param : undefined} />
            {isHariIni ? (
              <RailKelola situFokus={situFokus} centangHari={centangHariIni} mekarDari={mekarDari}
                tugasTodo={tugasTodo} tugasDone={tugasDoneCount} tugasTotal={tugasTotal} onToggleTugas={toggleTugas} onAddTugas={inbox.tambah}
                onToggleKeb={onCentangToggle} onKeInbox={() => setDikelolaTerbuka(true)} />
            ) : (
              <UntukDikelolaHari items={kelolaHari} onAdd={teks => rencana.tambah(pilihHari, 'kelola', teks)} onToggle={rencana.toggle} onDel={rencana.hapus} />
            )}
          </div>

          {/* Catatan hari ini → Jurnal (satu tempat mencatat; di sini hanya ringkasan + pintu) */}
          {bisaDicatat && onKeJurnal && (
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', background: 'linear-gradient(135deg,#F4FAF6,#fff)', border: '1.5px solid rgba(78,156,110,.3)', borderRadius: 20, padding: '14px 16px' }}>
              <span style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 12, background: '#fff', color: '#4E9C6E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><NotebookPen style={{ width: 18, height: 18 }} strokeWidth={2} /></span>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 16, color: '#6E3B57' }}>Catatan {isHariIni ? 'hari ini' : 'hari itu'}</div>
                <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 12.5, color: '#8A5A74', lineHeight: 1.5 }}>
                  {labelTerlihat.length > 0 ? <>Terlihat: {labelTerlihat.join(', ')}</> : 'Belum ada catatan. Apa yang kamu lihat dari si kecil?'}
                </div>
              </div>
              <button type="button" onClick={() => onKeJurnal(tglAktifISO)}
                style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 7, background: '#4E9C6E', color: '#fff', border: 'none', borderRadius: 999, padding: '10px 18px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
                <NotebookPen style={{ width: 15, height: 15 }} strokeWidth={2.2} /> Catat {isHariIni ? 'hari ini' : 'hari itu'}
              </button>
            </div>
          )}
        </div>
      </div>

      <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 11.5, color: '#A98BA0', margin: '14px 2px 0', lineHeight: 1.6 }}>
        Hari ini kamu <b style={{ color: '#8A5A74' }}>menjalani</b>; hari lain kamu <b style={{ color: '#8A5A74' }}>merencanakan</b>. Susunan tiap hari otomatis muncul saat harinya tiba. Tersimpan di akunmu, jadi tidak hilang walau ganti perangkat.
      </p>

      {dikelolaTerbuka && (
        <DaftarDikelola belum={dikelolaBelum} sudah={dikelolaSudah} onToggle={toggleTugas} onTambah={inbox.tambah} onHapus={hapusDikelola} onTutup={() => setDikelolaTerbuka(false)} />
      )}
    </>
  );
}

// ─── Main KelolaHub ───────────────────────────────────────────────────────────

export default function KelolaHub({ nilaiFokus = [], centangKebiasaan, tanggalHariIni, onCentangToggle, onBekal }: PropsKelolaHub) {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(() => TAB_SLUG[searchParams.get('tab') ?? ''] ?? 'Irama Keseharian');
  const [dikelolaTerbuka, setDikelolaTerbuka] = useState(() => SLUG_DIKELOLA.has(searchParams.get('tab') ?? ''));
  const bukaDikelola = () => { setTab('Irama Keseharian'); setDikelolaTerbuka(true); };
  // Draf konteks dari Perjalanan ("Cukup berat") → dibuka sekali di Kehidupan Keluarga.
  const [konteksAwal, setKonteksAwal] = useState<KonteksAwal | null>(null);
  const [tanggalJurnal, setTanggalJurnal] = useState<string | undefined>(undefined);
  const { anakAktif: anakJurnal } = useAnak();
  const { profile: profilJurnal } = useChildProfile();
  const keJurnal = (tgl?: string) => { setTanggalJurnal(tgl); setTab('Jurnal'); };
  void onBekal;

  return (
    <article style={{ background: '#FFF3E6', color: '#6E3B57' }} className="pt-6 pb-20">
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
                  <span style={{ marginLeft: 7, fontWeight: 800, fontSize: 10.5, opacity: 0.7 }}>{KATA_KERJA[t]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab content */}
      {tab === 'Irama Keseharian' && (
        <IramaKeseharian nilaiFokus={nilaiFokus} centangKebiasaan={centangKebiasaan} tanggalHariIni={tanggalHariIni} onCentangToggle={onCentangToggle}
          dikelolaTerbuka={dikelolaTerbuka} setDikelolaTerbuka={setDikelolaTerbuka} onKeKeluarga={() => setTab('Kehidupan Keluarga')} onKeJurnal={keJurnal} />
      )}
      {tab === 'Jurnal' && (
        <JurnalTemani tertanam key={tanggalJurnal ?? 'hari-ini'} idAnak={anakJurnal?.id ?? 'anon'} nama={profilJurnal.namaAnak || 'si kecil'}
          tanggalAwal={tanggalJurnal} keteranganMusim={nilaiFokus.length ? `musim ${nilaiFokus.join(' & ')}` : undefined} />
      )}
      {tab === 'Kehidupan Keluarga' && <KehidupanKeluarga nilaiFokus={nilaiFokus} onKeInbox={bukaDikelola} konteksAwal={konteksAwal} onKonteksAwalDipakai={() => setKonteksAwal(null)} />}
      {tab === 'Perjalanan' && (
        <PerjalananKeluarga nilaiFokus={nilaiFokus} centangKebiasaan={centangKebiasaan}
          onKeIrama={() => setTab('Irama Keseharian')} onKeKeluarga={() => setTab('Kehidupan Keluarga')} onKeJurnal={() => keJurnal()}
          onCeritakanBerat={() => { setKonteksAwal({ bidang: 'caregiver', tag: 'energi_caregiver', sejak: 'baru', judul: 'Minggu ini terasa berat' }); setTab('Kehidupan Keluarga'); }} />
      )}
    </article>
  );
}
