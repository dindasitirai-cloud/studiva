import React from 'react';
import { FORUM_SHORTCUT as C } from '../../../content/beranda-copy';

export interface ForumPeek { title: string; balasan: number; privasi?: 'publik' | 'privat'; isSupportRequest?: boolean; }
interface Props { threads: ForumPeek[]; onBuka: () => void; onTulis: () => void; onTanya: () => void; }

const ACC = [
  { accent: '#8B6FD6', bg: '#EFE9FD', ink: '#6244B8' },
  { accent: '#F06BA8', bg: '#FCE3EE', ink: '#B4477F' },
];

export default function ForumShortcut({ threads, onBuka, onTulis, onTanya }: Props) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: '#fff', borderRadius: 28, padding: '22px 22px 24px', boxShadow: '0 22px 48px -40px rgba(90,50,70,.55)', border: '2px solid #E4D8FA' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <span style={{ width: 5, height: 20, borderRadius: 999, background: '#8B6FD6', display: 'block' }} />
        <div style={{ fontFamily: 'Fredoka, system-ui, sans-serif', fontWeight: 600, fontSize: 20, color: '#6E3B57', lineHeight: 1.2 }}>{C.judul}</div>
      </div>
      <div style={{ fontFamily: 'Nunito, system-ui, sans-serif', fontWeight: 700, fontSize: 13, color: '#8A5A74', marginTop: 6 }}>{C.sub}</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
        {threads.length === 0 && <div style={{ fontFamily: 'Nunito, system-ui, sans-serif', fontSize: 13, color: '#8A5A74' }}>{C.kosong}</div>}
        {threads.slice(0, 2).map((t, i) => {
          const a = ACC[i % ACC.length];
          const count = t.isSupportRequest ? C.dijawabPsikolog : C.balasan(t.balasan);
          return (
            <button key={i} type="button" onClick={onBuka} style={{ textAlign: 'left', borderRadius: 18, padding: '14px 16px', background: '#FBFAFE', border: '1.5px solid #E4D8FA', borderLeft: `5px solid ${a.accent}`, cursor: 'pointer' }}>
              <div style={{ fontFamily: 'Nunito, system-ui, sans-serif', fontWeight: 800, fontSize: 14.5, color: '#6E3B57', lineHeight: 1.35 }}>{t.title}</div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 9, borderRadius: 999, padding: '4px 11px', background: a.bg }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: a.accent, display: 'block' }} />
                <span style={{ fontFamily: 'Nunito, system-ui, sans-serif', fontWeight: 800, fontSize: 11.5, color: a.ink }}>{count}{t.privasi === 'privat' ? ` · ${C.privat}` : ''}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 10, marginTop: 16 }}>
        <button type="button" onClick={onTulis} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 999, padding: '13px 10px', background: '#FCE3EE', border: 'none', cursor: 'pointer' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#F06BA8', display: 'block' }} />
          <span style={{ fontFamily: 'Nunito, system-ui, sans-serif', fontWeight: 800, fontSize: 14, color: '#B4477F' }}>{C.tulis}</span>
        </button>
        <button type="button" onClick={onTanya} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 999, padding: '13px 10px', background: '#E6DDFB', border: 'none', cursor: 'pointer' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#8B6FD6', display: 'block' }} />
          <span style={{ fontFamily: 'Nunito, system-ui, sans-serif', fontWeight: 800, fontSize: 14, color: '#6244B8' }}>{C.tanya}</span>
        </button>
      </div>
    </div>
  );
}
