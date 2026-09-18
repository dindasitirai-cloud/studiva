import React, { useState, useEffect } from 'react';
import type { SaranItem } from '../../../components/beranda/types';
import { REKOMENDASI_ARAH as C, JADWAL_KEGIATAN as JC } from '../../../content/beranda-copy';
import { plant, Tanaman } from './plant';
import JadwalkanKegiatanModal from './JadwalkanKegiatanModal';
import type { Waktu } from './JadwalkanKegiatanModal';

interface Props { ajakList: SaranItem[]; wawasanList: SaranItem[]; onBaca: (id: string) => void; }

const ctaPill: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 10, borderRadius: 999, padding: '14px 24px', cursor: 'pointer', background: '#F0479B', border: 'none', boxShadow: '0 18px 32px -20px rgba(240,71,155,.95)' };
const ctaTxt: React.CSSProperties = { fontFamily: 'Nunito, system-ui, sans-serif', fontWeight: 800, fontSize: 15, color: '#fff' };
const link = (color: string): React.CSSProperties => ({ fontFamily: 'Nunito, system-ui, sans-serif', fontWeight: 800, fontSize: 14.5, color, cursor: 'pointer', background: 'none', border: 'none', padding: 0 });

export default function RekomendasiArah({ ajakList, wawasanList, onBaca }: Props) {
  const [idxAjak, setIdxAjak] = useState(0);
  const [idxWaw, setIdxWaw] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalNama, setModalNama] = useState('');
  const [konfirmasi, setKonfirmasi] = useState('');

  useEffect(() => {
    if (!konfirmasi) return;
    const t = setTimeout(() => setKonfirmasi(''), 2600);
    return () => clearTimeout(t);
  }, [konfirmasi]);

  const ajak = ajakList.length ? ajakList[idxAjak % ajakList.length] : null;
  const waw = wawasanList.length ? wawasanList[idxWaw % wawasanList.length] : null;
  const buka = (nama: string) => { setModalNama(nama); setModalOpen(true); };

  return (
    <div>
      {konfirmasi && (
        <div style={{ background: '#EAF5EE', color: '#3F7A57', fontFamily: 'Nunito, system-ui, sans-serif', fontWeight: 700, fontSize: 12.5, borderRadius: 12, padding: '9px 14px', marginBottom: 12 }}>{konfirmasi}</div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20 }}>

        {/* Ajak main */}
        {ajak && (
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 28, background: 'linear-gradient(135deg,#FDE3EF 0%,#FBEAF4 48%,#FFF1DC 100%)', boxShadow: '0 22px 48px -40px rgba(90,50,70,.55)', border: '2px solid #FBDDEC' }}>
            <Tanaman w="120px" h="170px" dur="13s" op={.28} cfg={plant('daisy', { b: '#F8B9D4', b2: '#FFF1F7', c: '#FFE29A' })} style={{ position: 'absolute', right: -14, bottom: -18, pointerEvents: 'none' }} />
            <div style={{ position: 'relative', display: 'flex', gap: 18, padding: '22px 24px 24px' }}>
              <Tanaman w="56px" h="84px" dur="9s" cfg={plant('fivepetal', { b: '#F06BA8', b2: '#FFF1F7', c: '#FFE29A' })} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: 'Nunito, system-ui, sans-serif', fontWeight: 800, fontSize: 11.5, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#B4477F' }}>{C.labelAjakMain}</div>
                <div style={{ fontFamily: 'Fredoka, system-ui, sans-serif', fontWeight: 600, fontSize: 26, color: '#6E3B57', lineHeight: 1.2, marginTop: 6 }}>{ajak.judul}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 18, flexWrap: 'wrap' }}>
                  <button type="button" style={ctaPill} onClick={() => buka(ajak.judul)}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFE29A', display: 'block' }} />
                    <span style={ctaTxt}>{C.jadwalkan}</span>
                  </button>
                  <button type="button" style={link('#B4477F')} onClick={() => setIdxAjak(i => i + 1)}>{C.ganti} →</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wawasan tumbuh */}
        {waw && (
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 28, background: 'linear-gradient(135deg,#EFE6FC 0%,#E8E4FB 46%,#DCEAFD 100%)', boxShadow: '0 22px 48px -40px rgba(90,50,70,.55)', border: '2px solid #E4D8FA' }}>
            <Tanaman w="120px" h="170px" dur="15s" op={.26} cfg={plant('foliage', {})} style={{ position: 'absolute', right: -14, bottom: -18, pointerEvents: 'none' }} />
            <div style={{ position: 'relative', display: 'flex', gap: 18, padding: '22px 24px 24px' }}>
              <Tanaman w="56px" h="84px" dur="11s" cfg={plant('bell', { b: '#8B6FD6', b2: '#EFE9FD' })} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: 'Nunito, system-ui, sans-serif', fontWeight: 800, fontSize: 11.5, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#7B58C9' }}>{C.labelWawasan}</div>
                <div style={{ fontFamily: 'Fredoka, system-ui, sans-serif', fontWeight: 600, fontSize: 26, color: '#6E3B57', lineHeight: 1.2, marginTop: 6 }}>{waw.judul}</div>
                {waw.nilai ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 11, borderRadius: 999, padding: '6px 13px', background: '#fff' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#5F84E6', display: 'block' }} />
                    <span style={{ fontFamily: 'Nunito, system-ui, sans-serif', fontWeight: 800, fontSize: 12.5, color: '#2F5BB7' }}>{waw.nilai}</span>
                  </span>
                ) : null}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
                  <button type="button" style={ctaPill} onClick={() => buka(waw.judul)}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFE29A', display: 'block' }} />
                    <span style={ctaTxt}>{C.jadwalkan}</span>
                  </button>
                  <button type="button" style={link('#2F5BB7')} onClick={() => onBaca(waw.id)}>{C.baca}</button>
                  <button type="button" style={link('#7B58C9')} onClick={() => setIdxWaw(i => i + 1)}>{C.ganti} →</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <JadwalkanKegiatanModal
        open={modalOpen}
        namaKegiatan={modalNama}
        onClose={() => setModalOpen(false)}
        onSimpan={(info: { hari: string; waktu: Waktu; kegiatan: string }) => { setModalOpen(false); setKonfirmasi(JC.konfirmasi(info.hari, info.waktu, info.kegiatan)); }}
      />
    </div>
  );
}
