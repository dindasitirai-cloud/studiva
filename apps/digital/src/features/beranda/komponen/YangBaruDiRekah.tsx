import React from 'react';
import { YANG_BARU as C } from '../../../content/beranda-copy';
import { plant, Tanaman } from './plant';
import type { BotanicalConfig } from '../../../components/BotanicalStem';

interface Baru { kind: string; title: string; desc: string; meta: string; hasMeta: boolean; accent: string; border: string; ink: string; dur: string; ornamen: BotanicalConfig; to: string; }
interface Props { namaAnak: string; onOpenItem: (to: string) => void; onBuka: () => void; }

export default function YangBaruDiRekah({ namaAnak, onOpenItem, onBuka }: Props) {
  // TODO(backend): sumber "Yang baru" dari konten admin/rilis nyata
  const data: Baru[] = [
    { kind: 'Ajak main baru', title: '5 ide main baru untuk usia 2–3 tahun', desc: 'Ditambahkan admin untuk band usia anak — motorik halus & kemandirian.', meta: `2 hari lalu · ${C.sesuaiUsia(namaAnak)}`, hasMeta: true, accent: '#F06BA8', border: '#FBDDEC', ink: '#B4477F', dur: '10s', ornamen: plant('tulip', { b: '#F06BA8', b2: '#F8B9D4' }), to: '/dashboard/tier2/bekal' },
    { kind: 'Wawasan tumbuh baru', title: 'Fase "aku bisa sendiri" pada balita', desc: 'Bacaan baru tentang tumbuhnya kemandirian di usia 2 tahun.', meta: '3 hari lalu', hasMeta: true, accent: '#8B6FD6', border: '#E4D8FA', ink: '#6244B8', dur: '12s', ornamen: plant('fivepetal', { b: '#C9B8F0', b2: '#EFE9FD', c: '#FFE29A' }), to: '/dashboard/tier2/bekal' },
    { kind: 'Kebiasaan baik baru', title: 'Cuci tangan mandiri sebelum makan', desc: 'Cocok untuk usia 2–3 tahun, menumbuhkan kemandirian.', meta: `minggu ini · ${C.sesuaiUsia(namaAnak)}`, hasMeta: true, accent: '#5F84E6', border: '#D9E6FC', ink: '#2F5BB7', dur: '11s', ornamen: plant('bell', { b: '#5F84E6', b2: '#DCEAFD' }), to: '/dashboard/tier2/irama-hari' },
    { kind: 'Wawasan tumbuh baru', title: 'Bermain "sendiri-sendiri" itu wajar', desc: 'Tahap bermain paralel pada balita, dan kenapa itu sehat.', meta: 'minggu ini', hasMeta: true, accent: '#E0A63A', border: '#FFEDC7', ink: '#8A5510', dur: '9s', ornamen: plant('daisy', { b: '#FFE29A', b2: '#FFF3E6', c: '#E0A63A' }), to: '/dashboard/tier2/bekal' },
    { kind: 'Fitur baru', title: 'Buku Perjalanan di Temani', desc: 'Catat cerita & foto momen anak dalam bentuk buku.', meta: '', hasMeta: false, accent: '#6E9C4A', border: '#DFF2DD', ink: '#4A6E2E', dur: '13s', ornamen: plant('foliage', {}), to: '/dashboard/tier2/temani' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '32px 0 14px' }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#8B6FD6', display: 'block' }} />
        <h2 style={{ fontFamily: 'Fredoka, system-ui, sans-serif', fontWeight: 600, fontSize: 22, color: '#6244B8', margin: 0 }}>{C.judul}</h2>
        <div style={{ flex: 1, height: 1.5, background: 'rgba(110,59,87,.1)' }} />
        <button type="button" onClick={onBuka} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Nunito, system-ui, sans-serif', fontWeight: 800, fontSize: 13, color: '#B4477F' }}>{C.lihatSemua}</button>
      </div>
      <div style={{ display: 'flex', gap: 18, overflowX: 'auto', padding: '4px 4px 16px' }}>
        {data.map((b, i) => (
          <button key={i} type="button" onClick={() => onOpenItem(b.to)} style={{ position: 'relative', overflow: 'hidden', flex: 'none', width: 246, background: '#fff', borderRadius: 24, padding: '20px 20px 22px', boxShadow: '0 20px 42px -34px rgba(90,50,70,.5)', border: `2px solid ${b.border}`, cursor: 'pointer', textAlign: 'left' }}>
            <div aria-hidden style={{ position: 'absolute', left: 0, top: 0, right: 0, height: 5, background: b.accent }} />
            <Tanaman w="44px" h="64px" dur={b.dur} cfg={b.ornamen} />
            <div style={{ fontFamily: 'Nunito, system-ui, sans-serif', fontWeight: 800, fontSize: 11, letterSpacing: '1.1px', textTransform: 'uppercase', color: b.ink, marginTop: 14 }}>{b.kind}</div>
            <div style={{ fontFamily: 'Fredoka, system-ui, sans-serif', fontWeight: 600, fontSize: 17, color: '#6E3B57', lineHeight: 1.3, marginTop: 7 }}>{b.title}</div>
            <p style={{ fontFamily: 'Nunito, system-ui, sans-serif', fontWeight: 600, fontSize: 13, lineHeight: 1.55, color: '#7A4A64', margin: '9px 0 0' }}>{b.desc}</p>
            {b.hasMeta && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 14, paddingTop: 12, borderTop: '1.5px dashed #F6E3D2' }}>
                <span style={{ width: 6, height: 6, flex: 'none', borderRadius: '50%', background: b.accent, display: 'block' }} />
                <span style={{ fontFamily: 'Nunito, system-ui, sans-serif', fontWeight: 700, fontSize: 11.5, color: '#8A5A74' }}>{b.meta}</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
