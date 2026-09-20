// =============================================================
// RencanaMinggu — tab "Rencana Minggu" di Kelola (Phase 15 · Tahap 2, v4).
// Perencana mingguan memakai papan yang sama dengan Hari Ini (PapanKegiatan):
// pilih hari, lalu susun kegiatan default + tambahan + to-do + urutan di kolom
// Pagi/Siang/Malam, plus Untuk Dikelola. Satu sumber data per tanggal, jadi
// susunan untuk suatu hari langsung tampil di Hari Ini saat hari itu tiba.
// Persistensi localStorage. Copy DRAFT — review Fitri.
// =============================================================
import React, { useMemo, useState } from 'react';
import { Check, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { NilaiAkar } from '../akar-keluarga/content';
import type { CentangKebiasaan } from '@studiva/shared';
import { useAnak } from '../../context/AnakContext';
import { useRencanaMinggu, awalMinggu, localISO, hariIndex } from './rencanaData';
import type { PlanItem } from './rencanaData';
import { useCentangHari, buatMekar } from './dayPlanData';
import PapanKegiatan from './PapanKegiatan';

const HARI_PENDEK = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const HARI_PANJANG = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

// ─── Untuk Dikelola per hari (dari store rencana) ─────────────────────────────

export function UntukDikelolaHari({ items, onAdd, onToggle, onDel }: {
  items: PlanItem[]; onAdd: (teks: string) => void; onToggle: (id: string) => void; onDel: (id: string) => void;
}) {
  const [teks, setTeks] = useState('');
  const submit = () => { const t = teks.trim(); if (!t) return; onAdd(t); setTeks(''); };
  return (
    <div className="animate-fade-in-up" style={{ background: '#fff', border: '2.5px dotted #F06BA8', borderRadius: 22, padding: '16px 18px 18px', boxShadow: '0 16px 36px -34px rgba(90,50,70,.5)' }}>
      <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 18, color: '#6E3B57', margin: 0 }}>Untuk Dikelola</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
        {items.length === 0 ? (
          <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 12.5, color: '#A98BA0', margin: '2px 0', textAlign: 'center' }}>Belum ada.</p>
        ) : items.map(it => (
          <div key={it.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: it.done ? '#FBF3F8' : '#FDF7FB', borderRadius: 14, padding: '11px 13px' }}>
            <button type="button" role="checkbox" aria-checked={it.done} aria-label={it.teks} onClick={() => onToggle(it.id)}
              style={{ width: 20, height: 20, flexShrink: 0, marginTop: 1, borderRadius: '50%', background: it.done ? '#5F84E6' : '#fff', border: it.done ? '2px solid #5F84E6' : '2px solid #C9D8F5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
              <Check style={{ width: 11, height: 11, opacity: it.done ? 1 : 0 }} stroke="#fff" strokeWidth={3.6} />
            </button>
            <span style={{ flex: 1, minWidth: 0, fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 14, lineHeight: 1.35, color: it.done ? '#A98BA0' : '#6E3B57', textDecoration: it.done ? 'line-through' : 'none' }}>{it.teks}</span>
            <button type="button" aria-label={`Hapus ${it.teks}`} onClick={() => onDel(it.id)} style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', color: '#C9AEBD', marginTop: 1, padding: 0, lineHeight: 1 }}><Trash2 style={{ width: 13, height: 13 }} strokeWidth={2} /></button>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, borderRadius: 12, border: '1.5px dashed #F4B4D2', padding: '8px 10px' }}>
        <input value={teks} onChange={e => setTeks(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') submit(); }} placeholder="Tambah hal untuk dikelola…"
          style={{ flex: 1, minWidth: 0, background: 'none', border: 'none', outline: 'none', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 12.5, color: '#6E3B57' }} />
        {teks.trim() && <button type="button" onClick={submit} style={{ flexShrink: 0, borderRadius: 9, border: 'none', background: '#C6407F', color: '#fff', padding: '6px 12px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 11.5, cursor: 'pointer' }}>Tambah</button>}
      </div>
    </div>
  );
}

// ─── Perencana minggu ─────────────────────────────────────────────────────────

export default function RencanaMinggu({ nilaiFokus = [], centangKebiasaan, tanggalHariIni, onCentangToggle }: {
  nilaiFokus?: readonly NilaiAkar[];
  centangKebiasaan: CentangKebiasaan;
  tanggalHariIni: string;
  onCentangToggle: (n: NilaiAkar, id: string) => void;
}) {
  const { anakAktif } = useAnak();
  const idAnak = anakAktif?.id ?? 'anon';

  const [offset, setOffset] = useState(0);
  const senin = (() => { const s = awalMinggu(new Date()); s.setDate(s.getDate() + offset * 7); return s; })();
  const seninStr = localISO(senin);
  const rencana = useRencanaMinggu(idAnak, seninStr);

  const hariList = Array.from({ length: 7 }, (_, i) => { const d = new Date(senin); d.setDate(senin.getDate() + i); return d; });
  const hariIniIdx = offset === 0 ? hariIndex(new Date()) : -1;
  const [pilihHari, setPilihHari] = useState<number>(() => hariIndex(new Date()));
  const tglAktif = hariList[pilihHari];
  const tglAktifISO = localISO(tglAktif);

  const centang = useCentangHari(idAnak, tglAktifISO, { hariIni: tanggalHariIni, realCentang: centangKebiasaan, onReal: onCentangToggle });
  const mekarDari = useMemo(() => buatMekar(centangKebiasaan), [centangKebiasaan]);

  const minggu = hariList[6];
  const rangeLabel = `${senin.getDate()} ${BULAN[senin.getMonth()]} – ${minggu.getDate()} ${BULAN[minggu.getMonth()]}`;
  const judulMinggu = offset === 0 ? 'Minggu ini' : offset === 1 ? 'Minggu depan' : offset === -1 ? 'Minggu lalu' : rangeLabel;
  const kelolaHari = rencana.items.filter(p => p.hari === pilihHari && p.slot === 'kelola');

  return (
    <div>
      {/* Header + navigasi minggu */}
      <div className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', background: '#fff', borderRadius: 22, border: '1px solid rgba(110,59,87,.1)', padding: '16px 18px', marginBottom: 14, boxShadow: '0 16px 36px -34px rgba(90,50,70,.5)' }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 10.5, letterSpacing: '.6px', textTransform: 'uppercase', color: '#D2559A' }}>Rencana Minggu</div>
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

      {/* Pilih hari */}
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
          {HARI_PANJANG[pilihHari]}{pilihHari === hariIniIdx ? ' · hari ini' : ''}
        </h3>
        <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, color: '#B79AAC' }}>{tglAktif.getDate()} {BULAN[tglAktif.getMonth()]}</span>
      </div>

      {/* Papan hari terpilih + Untuk Dikelola */}
      <div className="grid items-start gap-4 xl:grid-cols-[1fr_320px]">
        <PapanKegiatan idAnak={idAnak} tanggal={tglAktifISO} nilaiFokus={nilaiFokus} centangHari={centang.centangHari} onToggleKeb={centang.toggle} mekarDari={mekarDari} />
        <UntukDikelolaHari items={kelolaHari}
          onAdd={teks => rencana.tambah(pilihHari, 'kelola', teks)} onToggle={rencana.toggle} onDel={rencana.hapus} />
      </div>

      <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 11.5, color: '#A98BA0', margin: '14px 2px 0', lineHeight: 1.6 }}>
        Susunan untuk suatu hari otomatis muncul di panel <b style={{ color: '#8A5A74' }}>Hari Ini</b> saat hari itu tiba. Tersimpan per tanggal di perangkat ini (localStorage) — sinkron ke akun menyusul.
      </p>
    </div>
  );
}
