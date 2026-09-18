import React, { useState } from 'react';
import { RENCANA_HARI_INI as C } from '../../../content/beranda-copy';

export interface RencanaItem { judul: string; meta: string; jenis: 'keb' | 'main' | 'waw'; jam?: string; }
interface Props { pagi: RencanaItem[]; siang: RencanaItem[]; malam: RencanaItem[]; onBuka: () => void; }

const TINT = { keb: '#E7F0FE', main: '#FDE7F1', waw: '#F1EBFB' } as const;
const INK = { keb: '#3F6FC4', main: '#B23A73', waw: '#6A4FB0' } as const;
const BADGE = ['linear-gradient(120deg,#FFC98A,#FFB07A)', 'linear-gradient(120deg,#8FB8F7,#7AA8F0)', 'linear-gradient(120deg,#9A83D8,#7E68C4)'];

function ItemIcon({ jenis }: { jenis: 'keb' | 'main' | 'waw' }) {
  const p = jenis === 'keb'
    ? (<><path d="M4 8h16l-1.4 11.2A2 2 0 0 1 16.6 21H7.4a2 2 0 0 1-2-1.8z" /><path d="M8.5 8 10 3.5h4L15.5 8z" opacity=".55" /></>)
    : jenis === 'main'
      ? (<><rect x="3" y="12" width="8" height="8" rx="1.5" /><circle cx="16.5" cy="7" r="3.6" /></>)
      : (<><path d="M4 5c0-.7.5-1.2 1.2-1.2H12v15.4H5.2A1.2 1.2 0 0 0 4 20.4z" /><path d="M20 5c0-.7-.5-1.2-1.2-1.2H12v15.4h6.8A1.2 1.2 0 0 1 20 20.4z" opacity=".55" /></>);
  return <svg viewBox="0 0 24 24" width="20" height="20" style={{ fill: 'currentColor' }}>{p}</svg>;
}

export default function RencanaHariIniPeluncur({ pagi, siang, malam, onBuka }: Props) {
  const [page, setPage] = useState(0);
  const pages = [pagi, siang, malam];
  const nama = [C.pagi, C.siang, C.malam];
  const items = pages[page];

  return (
    <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #F4EAE3', overflow: 'hidden', boxShadow: '0 18px 40px -28px rgba(110,59,87,.55)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px 12px' }}>
        <span style={{ fontFamily: 'Fredoka, system-ui, sans-serif', fontWeight: 600, fontSize: 14, color: '#fff', padding: '6px 14px', borderRadius: 999, background: BADGE[page] }}>{nama[page]}</span>
        <button type="button" onClick={onBuka} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#F06BA8', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
          {C.buka} ›
        </button>
      </div>

      <div style={{ padding: '0 18px', minHeight: 210 }}>
        <p style={{ fontFamily: 'Fraunces, Georgia, serif', fontStyle: 'italic', fontSize: 12.5, color: '#9A7188', margin: '0 0 8px' }}>
          {page === 0 ? 'Saat bangun sampai selesai mandi' : page === 1 ? 'Saat makan, bermain, sampai tengah hari' : 'Menjelang rutinitas tidur'}
        </p>
        {items.length === 0 && <p style={{ fontSize: 13, color: '#9A7188' }}>{C.kosong}</p>}
        {items.map((it, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '11px 0', borderTop: i === 0 ? 'none' : '1px dashed #F0E4DC' }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: TINT[it.jenis], color: INK[it.jenis] }}>
              <ItemIcon jenis={it.jenis} />
            </div>
            <div style={{ minWidth: 0 }}>
              <b style={{ fontFamily: 'Fredoka, system-ui, sans-serif', fontWeight: 600, fontSize: 14.5, color: '#6E3B57', display: 'block', lineHeight: 1.3 }}>{it.judul}</b>
              <span style={{ fontSize: 11.5, color: '#9A7188', fontWeight: 600 }}>{it.meta}</span>
            </div>
            {it.jam && <span style={{ marginLeft: 'auto', fontFamily: 'Fredoka, system-ui, sans-serif', fontWeight: 600, fontSize: 12, color: '#9A7188', flexShrink: 0 }}>{it.jam}</span>}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderTop: '1px solid #F0E4DC', background: '#FFFBF9' }}>
        <button type="button" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))} style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid #F0E4DC', background: '#fff', cursor: page === 0 ? 'default' : 'pointer', opacity: page === 0 ? .35 : 1, color: '#6E3B57', fontSize: 16 }}>‹</button>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {[0, 1, 2].map(i => (
            <button key={i} type="button" aria-label={nama[i]} onClick={() => setPage(i)} style={{ height: 9, width: i === page ? 24 : 9, borderRadius: 999, border: 'none', background: i === page ? '#F06BA8' : '#E7D6CE', cursor: 'pointer', padding: 0, transition: 'all .18s' }} />
          ))}
        </div>
        <button type="button" disabled={page === 2} onClick={() => setPage(p => Math.min(2, p + 1))} style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid #F0E4DC', background: '#fff', cursor: page === 2 ? 'default' : 'pointer', opacity: page === 2 ? .35 : 1, color: '#6E3B57', fontSize: 16 }}>›</button>
      </div>
    </div>
  );
}
