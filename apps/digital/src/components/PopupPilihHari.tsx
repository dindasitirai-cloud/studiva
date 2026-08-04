// REVIEW: menunggu approval Psikolog Fitri Effendy sebelum rilis
import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

// TODO: review Fitri
const COPY = {
  JUDUL_KEGIATAN: 'Jadwalkan kegiatan',
  JUDUL_BUKU: 'Jadwalkan baca buku',
  SUBJUDUL: (judul: string) => `"${judul}"`,
  PANDUAN: 'Pilih hari di minggu ini',
  HARI_INI: 'Hari ini',
};

const NAMA_HARI = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const NAMA_HARI_PENUH = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const NAMA_BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function senin(tanggal: string): string {
  const [y, m, d] = tanggal.split('-').map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  const hari = dt.getDay(); // 0=Min, 1=Sen...
  const selisih = hari === 0 ? -6 : 1 - hari;
  const sen = new Date(y, (m ?? 1) - 1, (d ?? 1) + selisih);
  return [
    sen.getFullYear(),
    String(sen.getMonth() + 1).padStart(2, '0'),
    String(sen.getDate()).padStart(2, '0'),
  ].join('-');
}

function tambah(tgl: string, hari: number): string {
  const [y, m, d] = tgl.split('-').map(Number);
  const dt = new Date(y, (m ?? 1) - 1, (d ?? 1) + hari);
  return [
    dt.getFullYear(),
    String(dt.getMonth() + 1).padStart(2, '0'),
    String(dt.getDate()).padStart(2, '0'),
  ].join('-');
}

export interface JadwalItem {
  id: string;
  judul: string;
  tipe: 'kegiatan' | 'buku';
  warnaCover?: string;
}

interface Props {
  item: JadwalItem;
  tanggalHariIni: string;
  onPilih: (tanggal: string) => void;
  onTutup: () => void;
}

export default function PopupPilihHari({ item, tanggalHariIni, onPilih, onTutup }: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const seninMinggu = senin(tanggalHariIni);

  const hari7 = Array.from({ length: 7 }, (_, i) => {
    const tgl = tambah(seninMinggu, i);
    const [, m, d] = tgl.split('-').map(Number);
    return {
      tgl,
      pendek: NAMA_HARI[i] ?? '',
      penuh: NAMA_HARI_PENUH[i] ?? '',
      tanggal: d ?? 1,
      bulan: NAMA_BULAN[(m ?? 1) - 1] ?? '',
      isHariIni: tgl === tanggalHariIni,
    };
  });

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onTutup(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onTutup]);

  useEffect(() => { elRef.current?.focus(); }, []);

  const judul = item.tipe === 'buku' ? COPY.JUDUL_BUKU : COPY.JUDUL_KEGIATAN;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        background: 'rgba(110,59,87,0.30)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onTutup(); }}
    >
      <div
        ref={elRef}
        role="dialog"
        aria-modal="true"
        aria-label={judul}
        tabIndex={-1}
        style={{
          width: '100%', maxWidth: 480,
          background: '#fff',
          borderRadius: '24px 24px 0 0',
          padding: '20px 20px 32px',
          boxShadow: '0 -8px 40px rgba(110,59,87,0.18)',
          outline: 'none',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
          <div>
            <p style={{
              fontFamily: 'Bricolage Grotesque, system-ui, sans-serif',
              fontSize: 17, fontWeight: 700, color: '#6E3B57', margin: 0,
            }}>
              {judul}
            </p>
            <p style={{
              fontFamily: 'Nunito, system-ui, sans-serif',
              fontSize: 12, color: '#A98DA0', margin: '2px 0 0',
              maxWidth: 320,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {COPY.SUBJUDUL(item.judul)}
            </p>
          </div>
          <button
            type="button"
            aria-label="Tutup"
            onClick={onTutup}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              border: 'none', background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#A98DA0', flexShrink: 0,
            }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        <p style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 11, fontWeight: 800, color: '#B98FAD',
          textTransform: 'uppercase', letterSpacing: '0.8px',
          margin: '14px 0 10px',
        }}>
          {COPY.PANDUAN}
        </p>

        {/* Hari grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
          {hari7.map(h => (
            <button
              key={h.tgl}
              type="button"
              aria-label={`${h.penuh} ${h.tanggal} ${h.bulan}${h.isHariIni ? ' (hari ini)' : ''}`}
              onClick={() => onPilih(h.tgl)}
              style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 2, padding: '10px 4px',
                borderRadius: 14,
                border: h.isHariIni ? '2px solid #F06BA8' : '1.5px solid #F0E3E9',
                background: h.isHariIni ? '#FCE3EE' : '#fff',
                cursor: 'pointer',
                transition: 'background 140ms ease, border-color 140ms ease',
                minWidth: 0,
              }}
            >
              <span style={{
                fontFamily: 'Nunito, system-ui, sans-serif',
                fontSize: 10, fontWeight: 800,
                color: h.isHariIni ? '#F06BA8' : '#A98DA0',
                textTransform: 'uppercase', letterSpacing: '0.3px',
              }}>
                {h.isHariIni ? COPY.HARI_INI : h.pendek}
              </span>
              <span style={{
                fontFamily: 'Fredoka, system-ui, sans-serif',
                fontSize: 18, fontWeight: 700,
                color: h.isHariIni ? '#6E3B57' : '#5A4250',
              }}>
                {h.tanggal}
              </span>
              <span style={{
                fontFamily: 'Nunito, system-ui, sans-serif',
                fontSize: 9.5, fontWeight: 600,
                color: h.isHariIni ? '#E0518F' : '#B98FAD',
              }}>
                {h.bulan}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
