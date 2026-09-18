import React from 'react';
import { plant, Tanaman, type TanamanCfg } from './plant';

type SlotKey = 'pagi' | 'siang' | 'malam' | 'dikelola';
interface Props { items: Record<SlotKey, string[]>; status: Record<SlotKey, string>; onBuka: () => void; }

interface Slot { key: SlotKey; label: string; sub: string; subInk: string; dot: string; bg: string; bunga: TanamanCfg[]; }

const SLOTS: Slot[] = [
  { key: 'pagi', label: 'Pagi', sub: 'Bangun sampai mandi', subInk: '#6E3B57', dot: '#C6407F', bg: '#F8C9DF', bunga: [
    { w: '30px', h: '46px', dur: '10s', cfg: plant('tulip', { b: '#F0479B', b2: '#F890BE' }) },
    { w: '40px', h: '60px', dur: '12s', cfg: plant('daisy', { b: '#FFE29A', b2: '#FFF3E6', c: '#F0479B' }) },
    { w: '26px', h: '40px', dur: '9s', cfg: plant('foliage', {}) } ] },
  { key: 'siang', label: 'Siang', sub: 'Main dan makan', subInk: '#8A5510', dot: '#E0A63A', bg: '#FFE29A', bunga: [
    { w: '26px', h: '40px', dur: '11s', cfg: plant('foliage', {}) },
    { w: '38px', h: '58px', dur: '13s', cfg: plant('fivepetal', { b: '#FF5FA2', b2: '#FFF1F7', c: '#FFE29A' }) },
    { w: '30px', h: '46px', dur: '10s', cfg: plant('bell', { b: '#7FA6FF', b2: '#DCEAFD' }) } ] },
  { key: 'malam', label: 'Malam', sub: 'Menjelang tidur', subInk: '#4A2F94', dot: '#6244B8', bg: '#E4D8FA', bunga: [
    { w: '32px', h: '48px', dur: '12s', cfg: plant('sprig', { b: '#9C7BF0', b2: '#EFE9FD' }) },
    { w: '38px', h: '58px', dur: '14s', cfg: plant('tulip', { b: '#7FA6FF', b2: '#DCEAFD' }) },
    { w: '26px', h: '40px', dur: '9.5s', cfg: plant('leaf', {}) } ] },
  { key: 'dikelola', label: 'Untuk dikelola', sub: 'Belum punya waktu', subInk: '#8A3A66', dot: '#B4477F', bg: '#FFE4F0', bunga: [
    { w: '28px', h: '42px', dur: '10.5s', cfg: plant('foliage', {}) },
    { w: '36px', h: '54px', dur: '12.5s', cfg: plant('daisy', { b: '#F8B9D4', b2: '#FFF1F7', c: '#F0479B' }) },
    { w: '28px', h: '42px', dur: '9s', cfg: plant('sprig', { b: '#FFE29A', b2: '#FFF3E6' }) } ] },
];
const RING = [0, 1, 2, 3, 4, 5, 6];

export default function RencanaHariIni({ items, status, onBuka }: Props) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#E0A63A', display: 'block' }} />
        <h2 style={{ fontFamily: 'Fredoka, system-ui, sans-serif', fontWeight: 600, fontSize: 22, color: '#8A5510', margin: 0 }}>Rencana hari ini</h2>
        <div style={{ flex: 1, height: 1.5, background: 'rgba(110,59,87,.1)' }} />
        <span style={{ fontFamily: 'Nunito, system-ui, sans-serif', fontWeight: 700, fontSize: 12.5, color: '#8A5A74' }}>dari Kelola</span>
      </div>
      <div style={{ position: 'relative', paddingTop: 14 }}>
        <div aria-hidden style={{ position: 'absolute', left: 0, right: 0, top: 20, height: 2, background: '#E4CDB4' }} />
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 14 }}>
          {SLOTS.map(s => (
            <div key={s.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', alignSelf: 'stretch' }}>
              <div aria-hidden style={{ width: 14, height: 14, borderRadius: '50%', border: '2.5px solid #8A5A74', background: '#FCEBD7', zIndex: 1 }} />
              <div aria-hidden style={{ width: 2.5, height: 12, background: '#8A5A74' }} />
              <button type="button" onClick={onBuka} style={{ position: 'relative', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', borderRadius: '8px 8px 16px 16px', overflow: 'hidden', background: '#FFFBF2', boxShadow: '0 18px 34px -26px rgba(90,50,70,.5)', cursor: 'pointer', border: 'none', padding: 0, textAlign: 'left' }}>
                <div aria-hidden style={{ position: 'relative', height: 88, overflow: 'hidden', background: s.bg }}>
                  <div style={{ position: 'absolute', left: 0, right: 0, bottom: -6, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 2 }}>
                    {s.bunga.map((b, i) => <Tanaman key={i} {...b} />)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4, padding: '6px 10px 0', justifyContent: 'space-between' }}>
                  {RING.map(r => <span key={r} aria-hidden style={{ width: 7, height: 7, borderRadius: '50%', background: '#E4CDB4', display: 'block' }} />)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '10px 14px 14px' }}>
                  <div style={{ fontFamily: 'Fredoka, system-ui, sans-serif', fontWeight: 600, fontSize: 18, color: '#6E3B57', lineHeight: 1.2 }}>{s.label}</div>
                  <div style={{ fontFamily: 'Nunito, system-ui, sans-serif', fontWeight: 700, fontSize: 11.5, color: s.subInk, marginTop: 3 }}>{s.sub}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 10 }}>
                    {(items[s.key] ?? []).map((nama, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                        <span aria-hidden style={{ width: 5, height: 5, flex: 'none', borderRadius: '50%', background: s.dot, display: 'block', marginTop: 5 }} />
                        <span style={{ fontFamily: 'Nunito, system-ui, sans-serif', fontWeight: 700, fontSize: 12, lineHeight: 1.35, color: '#6E3B57' }}>{nama}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 'auto', paddingTop: 12, borderTop: '1.5px dashed #F0DEC7' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 999, padding: '4px 10px', background: s.bg }}>
                      <span style={{ fontFamily: 'Nunito, system-ui, sans-serif', fontWeight: 800, fontSize: 10.5, color: '#6E3B57' }}>{status[s.key]}</span>
                    </span>
                    <span aria-hidden style={{ fontFamily: 'Nunito, system-ui, sans-serif', fontWeight: 800, fontSize: 15, color: '#6E3B57', lineHeight: 1 }}>↗</span>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
        <button type="button" onClick={onBuka} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Nunito, system-ui, sans-serif', fontWeight: 800, fontSize: 13.5, color: '#B4477F' }}>Buka Kelola ›</button>
      </div>
    </div>
  );
}
