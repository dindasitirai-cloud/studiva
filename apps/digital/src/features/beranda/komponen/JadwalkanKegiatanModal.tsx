import React, { useState, useEffect } from 'react';
import { JADWAL_KEGIATAN as C } from '../../../content/beranda-copy';

export type Waktu = 'Pagi' | 'Siang' | 'Malam';

const KEGIATAN: Record<Waktu, string[]> = {
  Pagi: ['Bangun tidur', 'Sarapan', 'Mandi pagi', 'Waktu bermain pagi'],
  Siang: ['Makan siang', 'Waktu bermain siang', 'Tengah hari'],
  Malam: ['Makan malam', 'Mandi sore', 'Rutinitas sebelum tidur'],
};

interface Props {
  open: boolean;
  namaKegiatan: string;
  onClose: () => void;
  onSimpan: (info: { hari: string; waktu: Waktu; kegiatan: string }) => void;
}

const lbl: React.CSSProperties = {
  fontFamily: 'Fredoka, system-ui, sans-serif', fontWeight: 600, fontSize: 12.5,
  color: '#6E3B57', margin: '16px 0 8px', display: 'block',
};
const btn: React.CSSProperties = {
  flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', border: 'none',
  cursor: 'pointer', fontFamily: 'Fredoka, system-ui, sans-serif', fontWeight: 600,
  fontSize: 13.5, borderRadius: 999, padding: 12,
};
const chip = (on: boolean): React.CSSProperties => ({
  border: on ? '1.5px solid #F06BA8' : '1.5px solid #F0E4DC',
  background: on ? '#F06BA8' : '#fff', color: on ? '#fff' : '#6E3B57',
  borderRadius: 999, padding: '9px 15px', fontFamily: 'Fredoka, system-ui, sans-serif',
  fontWeight: 600, fontSize: 12.5, cursor: 'pointer',
});

export default function JadwalkanKegiatanModal({ open, namaKegiatan, onClose, onSimpan }: Props) {
  const [hariMode, setHariMode] = useState<0 | 1 | 2>(0);
  const [tanggal, setTanggal] = useState('');
  const [waktu, setWaktu] = useState<Waktu>('Pagi');
  const [kegiatan, setKegiatan] = useState<string>(KEGIATAN.Pagi[0]);

  useEffect(() => {
    if (open) { setHariMode(0); setTanggal(''); setWaktu('Pagi'); setKegiatan(KEGIATAN.Pagi[0]); }
  }, [open]);

  if (!open) return null;

  const hariLabel = hariMode === 0 ? C.hariIni : hariMode === 1 ? C.besok
    : (tanggal ? new Date(tanggal + 'T00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }) : '(pilih tanggal)');

  function pilihWaktu(w: Waktu) { setWaktu(w); setKegiatan(KEGIATAN[w][0]); }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(110,59,87,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: 20 }}
    >
      <div style={{ background: '#fff', borderRadius: 22, width: '100%', maxWidth: 420, padding: 24, boxShadow: '0 40px 90px -30px rgba(110,59,87,.6)' }}>
        <h3 style={{ fontFamily: 'Fredoka, system-ui, sans-serif', fontWeight: 600, fontSize: 19, margin: '0 0 2px', color: '#6E3B57' }}>{C.judul}</h3>
        <p style={{ fontSize: 13, color: '#9A7188', margin: 0 }}>
          <span style={{ color: '#E0526B', fontWeight: 700 }}>{namaKegiatan}</span>
        </p>

        <label style={lbl}>{C.kapan}</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" style={chip(hariMode === 0)} onClick={() => setHariMode(0)}>{C.hariIni}</button>
          <button type="button" style={chip(hariMode === 1)} onClick={() => setHariMode(1)}>{C.besok}</button>
          <button type="button" style={chip(hariMode === 2)} onClick={() => setHariMode(2)}>{C.pilihTanggal}</button>
        </div>
        {hariMode === 2 && (
          <input
            type="date" value={tanggal} onChange={e => setTanggal(e.target.value)}
            style={{ width: '100%', border: '1.5px solid #F0E4DC', borderRadius: 12, padding: '11px 12px', fontFamily: 'Nunito, system-ui, sans-serif', fontWeight: 600, fontSize: 13, color: '#6E3B57', marginTop: 9 }}
          />
        )}

        <label style={lbl}>{C.waktu}</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['Pagi', 'Siang', 'Malam'] as Waktu[]).map(w => (
            <button key={w} type="button" style={{ ...chip(waktu === w), flex: 1 }} onClick={() => pilihWaktu(w)}>{w}</button>
          ))}
        </div>

        <label style={lbl}>{C.diKegiatan}</label>
        <select
          value={kegiatan} onChange={e => setKegiatan(e.target.value)}
          style={{ width: '100%', border: '1.5px solid #F0E4DC', borderRadius: 12, padding: 12, fontFamily: 'Nunito, system-ui, sans-serif', fontWeight: 600, fontSize: 13, color: '#6E3B57', background: '#fff' }}
        >
          {KEGIATAN[waktu].map(k => <option key={k} value={k}>{k}</option>)}
          <option value="Kegiatan tersendiri…">Kegiatan tersendiri…</option>
        </select>

        {/* TODO(backend): jadwal per-tanggal menunggu store Rencana; "Hari ini" bisa langsung ke Kelola */}
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button type="button" onClick={onClose} style={{ ...btn, background: '#F4EEF1', color: '#6E3B57' }}>{C.batal}</button>
          <button type="button" onClick={() => onSimpan({ hari: hariLabel, waktu, kegiatan })} style={{ ...btn, background: '#F06BA8', color: '#fff' }}>{C.simpan}</button>
        </div>
      </div>
    </div>
  );
}
