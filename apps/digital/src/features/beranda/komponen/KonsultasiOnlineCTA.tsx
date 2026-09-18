import React from 'react';
import { KONSULTASI_CTA as C } from '../../../content/beranda-copy';

interface Props { nomorWhatsapp: string; pesanAwal: string; }

export default function KonsultasiOnlineCTA({ nomorWhatsapp, pesanAwal }: Props) {
  const href = `https://wa.me/${nomorWhatsapp}?text=${encodeURIComponent(pesanAwal)}`;
  return (
    <div style={{ paddingTop: 26 }}>
      <div style={{ position: 'relative', borderRadius: 26, background: '#EDF4DE', padding: '40px 22px 18px', boxShadow: '0 22px 48px -40px rgba(90,50,70,.5)' }}>
        <div aria-hidden style={{ position: 'absolute', left: '50%', top: -26, marginLeft: -26, width: 52, height: 52, borderRadius: 18, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 24px -18px rgba(90,50,70,.6)' }}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#3FA76B" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6.6 2.8h2.5c.6 0 1.2.5 1.3 1.1l.6 2.9c.1.6-.1 1.1-.6 1.4l-1.5 1c.9 2 2.5 3.6 4.5 4.5l1-1.5c.3-.5.9-.7 1.5-.6l2.9.6c.6.1 1.1.7 1.1 1.3v2.5c0 1.6-1.3 2.8-2.9 2.6C10.2 18.4 5 13.2 4 6.6c-.2-1.6 1-2.9 2.6-2.9z" /></svg>
        </div>
        <div style={{ fontFamily: 'Fredoka, system-ui, sans-serif', fontWeight: 600, fontSize: 22, color: '#6E3B57', lineHeight: 1.25, textAlign: 'center' }}>{C.judul}</div>
        <p style={{ fontFamily: 'Nunito, system-ui, sans-serif', fontWeight: 600, fontSize: 13.5, lineHeight: 1.6, color: '#6E3B57', margin: '10px 0 0', textAlign: 'center' }}>{C.pengantar}</p>
        <a href={href} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 20, borderRadius: 999, padding: '15px 18px', cursor: 'pointer', background: '#3FA76B', textDecoration: 'none', boxShadow: '0 18px 32px -20px rgba(63,167,107,.9)' }}>
          <span style={{ fontFamily: 'Nunito, system-ui, sans-serif', fontWeight: 800, fontSize: 15, color: '#fff' }}>{C.tombol}</span>
        </a>
        <div style={{ fontFamily: 'Nunito, system-ui, sans-serif', fontWeight: 700, fontSize: 11, lineHeight: 1.55, color: '#7A4A64', marginTop: 14, textAlign: 'center' }}>{C.disclaimer}</div>
      </div>
    </div>
  );
}
