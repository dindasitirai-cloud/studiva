import React from 'react';
import { plant, Tanaman, type TanamanCfg } from './plant';

interface Props { baris1: string; baris2: string; namaAnak: string; usiaTeks: string; inisial: string; onChip?: () => void; }

const KEBUN: TanamanCfg[] = [
  { w: '69px', h: '105px', dur: '10s', op: .85, cfg: plant('foliage', {}) },
  { w: '102px', h: '156px', dur: '12s', op: 1, cfg: plant('sprig', { b: '#FFE29A', b2: '#FFF3E6' }) },
  { w: '129px', h: '195px', dur: '11s', op: 1, cfg: plant('tulip', { b: '#F0479B', b2: '#F890BE' }) },
  { w: '60px', h: '93px', dur: '9s', op: .75, cfg: plant('leaf', {}) },
  { w: '156px', h: '237px', dur: '13s', op: 1, cfg: plant('daisy', { b: '#FFE29A', b2: '#FFF3E6', c: '#F0479B' }) },
  { w: '112px', h: '170px', dur: '10.5s', op: 1, cfg: plant('bell', { b: '#7FA6FF', b2: '#DCEAFD' }) },
  { w: '117px', h: '177px', dur: '14s', op: 1, cfg: plant('fivepetal', { b: '#FF5FA2', b2: '#FFF1F7', c: '#FFE29A' }) },
  { w: '63px', h: '96px', dur: '9.5s', op: .8, cfg: plant('foliage', {}) },
  { w: '96px', h: '147px', dur: '12.5s', op: 1, cfg: plant('tulip', { b: '#9C7BF0', b2: '#C9B8F0' }) },
];

export default function HeroGarden({ baris1, baris2, namaAnak, usiaTeks, inisial, onChip }: Props) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 30, background: '#fff', boxShadow: '0 22px 48px -40px rgba(90,50,70,.5)', marginBottom: 28 }}>
      <div style={{ position: 'relative', height: 340, overflow: 'hidden', background: '#6E3B57' }}>
        <div aria-hidden style={{ position: 'absolute', left: -70, top: -6, width: 250, height: 220, borderRadius: '50% 50% 46% 54%/56% 44% 50% 50%', background: '#8A5A74', opacity: .6 }} />
        <div aria-hidden style={{ position: 'absolute', right: -44, top: 6, width: 192, height: 184, borderRadius: '52% 48% 44% 56%/48% 52% 50% 50%', background: '#B4477F', opacity: .45 }} />
        <div aria-hidden style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 44, background: '#F8D8E6', backgroundImage: 'radial-gradient(circle at 50% -1px,#6E3B57 16px,transparent 16.4px)', backgroundSize: 'calc(100% / 32) 32px', backgroundRepeat: 'repeat-x' }} />
        <div aria-hidden style={{ position: 'absolute', left: 0, right: 0, bottom: 43, height: 3, background: '#6E3B57' }} />
        <div aria-hidden style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 16, background: '#F8B9D4' }} />
        <div aria-hidden style={{ position: 'absolute', left: 26, right: 26, bottom: 14, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 6, pointerEvents: 'none' }}>
          {KEBUN.map((k, i) => <Tanaman key={i} {...k} />)}
        </div>
      </div>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, padding: '22px 30px 24px' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: 'Fredoka, system-ui, sans-serif', fontWeight: 600, fontSize: 24, color: '#6E3B57', lineHeight: 1.2 }}>{baris1}</div>
          <div style={{ fontFamily: 'Nunito, system-ui, sans-serif', fontWeight: 700, fontSize: 14.5, color: '#8A5A74', marginTop: 6 }}>{baris2}</div>
        </div>
        <button type="button" onClick={onChip} style={{ display: 'flex', alignItems: 'center', gap: 11, flex: 'none', borderRadius: 18, padding: '8px 16px 8px 8px', background: '#FFF6FB', border: '2px solid #FBDDEC', cursor: 'pointer' }}>
          <div style={{ width: 36, height: 36, flex: 'none', borderRadius: 12, background: 'linear-gradient(150deg,#F890BE,#C9B8F0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, system-ui, sans-serif', fontWeight: 800, fontSize: 13, color: '#fff' }}>{inisial}</div>
          <div style={{ minWidth: 0, textAlign: 'left' }}>
            <div style={{ fontFamily: 'Fredoka, system-ui, sans-serif', fontWeight: 600, fontSize: 15, color: '#6E3B57', lineHeight: 1.2 }}>{namaAnak}</div>
            <div style={{ fontFamily: 'Nunito, system-ui, sans-serif', fontWeight: 700, fontSize: 11.5, color: '#8A5A74' }}>{usiaTeks}</div>
          </div>
        </button>
      </div>
    </div>
  );
}
