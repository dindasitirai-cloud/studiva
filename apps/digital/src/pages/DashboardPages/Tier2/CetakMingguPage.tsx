import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { MingguIrama } from '@studiva/shared';
import { tambahHari } from '@studiva/shared';

// TODO: review Fitri — semua string di bawah ini
const TEKS = {
  JUDUL_CETAK: 'Ringkasan Minggu',
  TIDAK_ADA_DATA: 'Buka halaman ini dari Irama Hari untuk melihat ringkasan minggu.',
  TOMBOL_KEMBALI: 'Kembali',
  TOMBOL_CETAK: 'Cetak',
  LABEL_NILAI: 'Kebiasaan baik minggu ini',
  LABEL_DISIRAM: 'Disiram',
  LABEL_ISTIRAHAT: 'Belum minggu ini',
  LABEL_KEGIATAN: 'Kegiatan',
  TIDAK_ADA_KEGIATAN: 'Tidak ada kegiatan tercatat',
};

const NAMA_HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
const NAMA_BLOK: Record<string, string> = {
  pagi: 'Pagi',
  siang: 'Siang',
  sore: 'Sore',
  jelangTidur: 'Jelang Tidur',
};

interface CetakState {
  mulaiSenin: string;
  namaAnak: string;
  minggu: MingguIrama;
  riwayatSiram: Record<string, string[]>;
}

function formatRentang(mulai: string, selesai: string): string {
  const [ty, tm, td] = mulai.split('-').map(Number);
  const [, sm, sd] = selesai.split('-').map(Number);
  const bulanMulai = NAMA_BULAN[(tm ?? 1) - 1];
  const bulanSelesai = NAMA_BULAN[(sm ?? 1) - 1];
  if (sm === tm) {
    return `${td} sampai ${sd} ${bulanMulai} ${ty}`;
  }
  return `${td} ${bulanMulai} sampai ${sd} ${bulanSelesai} ${ty}`;
}

export default function CetakMingguPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as CetakState | null;

  if (!state?.minggu) {
    return (
      <div style={{ padding: '40px 24px', fontFamily: 'Nunito, system-ui, sans-serif', color: '#6E3B57' }}>
        <p style={{ fontSize: 15 }}>{TEKS.TIDAK_ADA_DATA}</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={styleKembali}
        >
          {TEKS.TOMBOL_KEMBALI}
        </button>
      </div>
    );
  }

  const { mulaiSenin, namaAnak, minggu, riwayatSiram } = state;
  const selesaiMinggu = tambahHari(mulaiSenin, 6);

  // Kumpulkan semua nilai yang pernah muncul di riwayatSiram minggu ini
  const tanggalMinggu = Array.from({ length: 7 }, (_, i) => tambahHari(mulaiSenin, i));
  const nilaiSet = new Set<string>();
  tanggalMinggu.forEach(tgl => {
    (riwayatSiram[tgl] ?? []).forEach(n => nilaiSet.add(n));
  });
  const nilaiList = Array.from(nilaiSet);

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          .cetak-aksi { display: none !important; }
          @page { size: A4 portrait; margin: 20mm 15mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px 60px', fontFamily: 'Nunito, system-ui, sans-serif', color: '#3D1F30' }}>

        {/* Aksi — tersembunyi saat cetak */}
        <div className="cetak-aksi" style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
          <button type="button" onClick={() => navigate(-1)} style={styleKembali}>
            {TEKS.TOMBOL_KEMBALI}
          </button>
          <button type="button" onClick={() => window.print()} style={styleCetak}>
            {TEKS.TOMBOL_CETAK}
          </button>
        </div>

        {/* Header */}
        <header style={{ marginBottom: 28, borderBottom: '2px solid #F8D9E8', paddingBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: '#B98FAD', marginBottom: 4 }}>
            {TEKS.JUDUL_CETAK}
          </p>
          <h1 style={{ fontFamily: 'Fredoka, system-ui, sans-serif', fontSize: 32, fontWeight: 700, color: '#6E3B57', margin: '0 0 4px' }}>
            {namaAnak || 'Anak'}
          </h1>
          <p style={{ fontSize: 14, color: '#A98DA0' }}>
            {formatRentang(mulaiSenin, selesaiMinggu)}
          </p>
        </header>

        {/* Hari per hari */}
        <section style={{ marginBottom: 32 }}>
          {minggu.hari.map((hari, i) => {
            const semuaItem = [
              ...hari.slot.pagi,
              ...hari.slot.siang,
              ...hari.slot.sore,
              ...hari.slot.jelangTidur,
            ];
            const adaItem = semuaItem.length > 0;

            return (
              <div
                key={hari.tanggal}
                style={{
                  marginBottom: 16,
                  padding: '14px 16px',
                  borderRadius: 14,
                  background: adaItem ? '#FFF5F9' : '#FAF7F9',
                  border: '1px solid #F0DDE8',
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 800, color: '#6E3B57', marginBottom: adaItem ? 10 : 0 }}>
                  {NAMA_HARI[i]} · {formatTanggalPendek(hari.tanggal)}
                </p>

                {adaItem ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {(['pagi', 'siang', 'sore', 'jelangTidur'] as const).map(blok => {
                      const items = hari.slot[blok];
                      if (items.length === 0) return null;
                      return (
                        <div key={blok} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#B98FAD', minWidth: 72, paddingTop: 2 }}>
                            {NAMA_BLOK[blok]}
                          </span>
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {items.map(item => (
                              <span key={item.id} style={{ fontSize: 13, color: '#3D1F30' }}>
                                {item.judul}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ fontSize: 12, color: '#C9B8C0' }}>{TEKS.TIDAK_ADA_KEGIATAN}</p>
                )}
              </div>
            );
          })}
        </section>

        {/* Kebiasaan baik */}
        {nilaiList.length > 0 && (
          <section>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: '#B98FAD', marginBottom: 12 }}>
              {TEKS.LABEL_NILAI}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {nilaiList.map(nilai => {
                const jumlahDisiram = tanggalMinggu.filter(
                  tgl => (riwayatSiram[tgl] ?? []).includes(nilai),
                ).length;
                return (
                  <div
                    key={nilai}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: jumlahDisiram > 0 ? '#FFF3D0' : '#FAF7F9',
                      border: '1px solid #F0DDE8',
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#6E3B57' }}>{nilai}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: jumlahDisiram > 0 ? '#B98900' : '#B98FAD' }}>
                      {jumlahDisiram > 0
                        ? `${TEKS.LABEL_DISIRAM} ${jumlahDisiram} hari`
                        : TEKS.LABEL_ISTIRAHAT}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

function formatTanggalPendek(iso: string): string {
  const [, m, d] = iso.split('-').map(Number);
  return `${d} ${NAMA_BULAN[(m ?? 1) - 1]}`;
}

const styleKembali: React.CSSProperties = {
  background: 'none',
  border: '1.5px solid #B98FAD',
  borderRadius: 999,
  padding: '8px 20px',
  fontFamily: 'Nunito, system-ui, sans-serif',
  fontSize: 13,
  fontWeight: 700,
  color: '#6E3B57',
  cursor: 'pointer',
};

const styleCetak: React.CSSProperties = {
  background: '#6E3B57',
  border: 'none',
  borderRadius: 999,
  padding: '8px 20px',
  fontFamily: 'Nunito, system-ui, sans-serif',
  fontSize: 13,
  fontWeight: 700,
  color: '#fff',
  cursor: 'pointer',
};
