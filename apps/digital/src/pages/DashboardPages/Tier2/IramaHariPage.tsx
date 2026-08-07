import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAnakAktif } from '../../../context/AnakContext';
import { useAkarStateSync } from '../../../features/akar-keluarga/state';
import type { NilaiAkar } from '../../../features/akar-keluarga/content';
import IramaHari from '../../../features/irama-hari/IramaHari';
import IramaMingguan from '../../../features/irama-hari/IramaMingguan';
import type { JadwalManualItem } from '../../../features/irama-hari/IramaMingguan';
import type { PilihanHarian } from '../../../features/irama-hari/PilihanHarianContext';
import type { ItemBekal } from '../../../features/beranda-usia/bekal';
import { tanggalDariTimestampWIB, toggleCentang } from '@studiva/shared';
import type { CentangKebiasaan } from '@studiva/shared';
import {
  getCentangKebiasaan,
  simpanCentangKebiasaan,
  jadwalkanKeTanggal,
} from '../../../lib/supabase/rekah';
import { dispatchRekahError } from '../../../utils/rekahApiError';

type TabId = 'hari-ini' | 'mingguan';

/**
 * Berapa hari ke belakang centang dimuat. Tab "Minggu Ini" butuh tujuh hari;
 * 14 memberi ruang untuk pekan berjalan plus pekan sebelumnya tanpa menarik
 * seluruh riwayat anak setiap kali halaman dibuka.
 */
const HARI_RIWAYAT_CENTANG = 14;

// TODO: review Fitri — label tab
const LABEL_TAB: Record<TabId, string> = {
  'hari-ini': 'Hari Ini',
  'mingguan': 'Minggu Ini',
};


export default function IramaHariPage() {
  // Anak aktif dari AnakContext, sumber tunggal data anak.
  const { anak } = useAnakAktif();
  const idAnak = anak.id;
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState<TabId>('hari-ini');
  const [akarState] = useAkarStateSync(idAnak);
  const [pilihanHariIni, setPilihanHariIni] = useState<PilihanHarian | undefined>(undefined);
  const [kolamAnak, setKolamAnak] = useState<readonly ItemBekal[]>([]);
  const [centangKebiasaan, setCentangKebiasaan] = useState<CentangKebiasaan>({});
  // Dinaikkan setelah sebuah item berhasil dijadwalkan, agar IramaMingguan
  // memuat ulang minggunya dari database.
  const [versiJadwal, setVersiJadwal] = useState(0);
  const jadwalProcessedRef = useRef<string | null>(null);

  const tanggalHariIni = useMemo(() => tanggalDariTimestampWIB(new Date().toISOString()), []);
  const nilaiFokus = akarState.nilai as NilaiAkar[];

  // Item yang dijadwalkan dari Bekal → tulis ke pilihan_harian tanggal tujuan.
  //
  // Dulu hanya masuk state lokal `jadwalManual`, jadi hilang setiap refresh.
  // Judul dan warna sampul sengaja tidak ikut disimpan — IramaMingguan
  // me-resolve-nya dari kolam anak, sehingga tidak ada salinan judul yang bisa
  // basi setelah kontennya diperbarui.
  useEffect(() => {
    const j = (location.state as { jadwalkan?: JadwalManualItem & { tanggal: string } } | null)?.jadwalkan;
    if (!j) return;
    const kunci = `${j.id}:${j.tanggal}`;
    if (jadwalProcessedRef.current === kunci) return;
    jadwalProcessedRef.current = kunci;

    setTab('mingguan');
    void jadwalkanKeTanggal(idAnak, j.tanggal, { id: j.id, tipe: j.tipe })
      .then(() => setVersiJadwal(v => v + 1))
      .catch(err => {
        console.error('[Rekah] gagal menjadwalkan item:', err);
        dispatchRekahError('Koneksi terputus — kegiatan tadi belum terjadwal. Coba lagi ya.');
        // Izinkan percobaan ulang untuk kunci yang sama.
        jadwalProcessedRef.current = null;
      });
  }, [location.state, idAnak]);

  // Muat centang beberapa hari terakhir. Rentang, bukan hari ini saja, karena
  // tab "Minggu Ini" menurunkan riwayat siram dari data yang sama.
  useEffect(() => {
    let batal = false;
    const sejak = new Date();
    sejak.setDate(sejak.getDate() - HARI_RIWAYAT_CENTANG);
    const sejakTanggal = sejak.toISOString().slice(0, 10);

    void getCentangKebiasaan(idAnak, sejakTanggal)
      .then(hasil => { if (!batal) setCentangKebiasaan(hasil); })
      .catch(err => {
        // Layar tetap jalan dengan centang kosong, tapi penyebabnya jangan
        // ditelan — tanpa ini, "kolom belum ada" dan "koneksi putus" terlihat
        // sama persis dari sisi pengguna maupun pengembang.
        console.error('[Rekah] gagal memuat centang kebiasaan:', err);
      });

    return () => { batal = true; };
  }, [idAnak]);

  const handleCentangToggle = useCallback(
    (nilaiId: NilaiAkar, butirId: string) => {
      setCentangKebiasaan(prev => {
        const berikutnya = toggleCentang(prev, nilaiId, butirId, tanggalHariIni);
        // Simpan hari ini saja; hari lain tidak berubah oleh toggle ini.
        void simpanCentangKebiasaan(idAnak, tanggalHariIni, berikutnya[tanggalHariIni] ?? {})
          .catch(err => {
            console.error('[Rekah] gagal menyimpan centang kebiasaan:', err);
            dispatchRekahError('Koneksi terputus — centang tadi belum tersimpan. Coba lagi ya.');
          });
        return berikutnya;
      });
    },
    [idAnak, tanggalHariIni],
  );

  const handlePilihanChange = useCallback(
    (pilihan: PilihanHarian, kolam: readonly ItemBekal[]) => {
      setPilihanHariIni(pilihan);
      setKolamAnak(kolam);
    },
    [],
  );

  const TAB_IDS: TabId[] = ['hari-ini', 'mingguan'];

  return (
    <div>
      {/* Tab switcher */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          padding: '16px 0 4px',
        }}
      >
        {TAB_IDS.map(id => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-pressed={tab === id}
            style={{
              background: tab === id ? '#6E3B57' : '#fff',
              color: tab === id ? '#fff' : '#6E3B57',
              border: '1.5px solid #B98FAD',
              borderRadius: 999,
              padding: '7px 20px',
              fontFamily: 'Nunito, system-ui, sans-serif',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 160ms ease, color 160ms ease',
            }}
          >
            {LABEL_TAB[id]}
          </button>
        ))}
      </div>

      {/* IramaHari — selalu terpasang; display:none menjaga PilihanHarianProvider tetap hidup */}
      <div style={{ display: tab === 'hari-ini' ? 'block' : 'none' }}>
        <IramaHari
          nilaiFokus={nilaiFokus}
          onPilihanChange={handlePilihanChange}
          centangKebiasaan={centangKebiasaan}
          tanggalHariIni={tanggalHariIni}
          onCentangToggle={handleCentangToggle}
          onBekal={() => navigate('/dashboard/tier2/bekal')}
        />
      </div>

      {/* IramaMingguan — selalu terpasang */}
      <div style={{ display: tab === 'mingguan' ? 'block' : 'none', padding: '20px 0' }}>
        <IramaMingguan
          idAnak={idAnak}
          tanggalHariIni={tanggalHariIni}
          kolam={kolamAnak}
          nilaiFokus={nilaiFokus}
          pilihanHariIni={pilihanHariIni}
          versiData={versiJadwal}
          centangKebiasaan={centangKebiasaan}
          namaAnak={anak.namaAnak}
          onBekalPress={() => navigate('/dashboard/tier2/bekal')}
        />
      </div>
    </div>
  );
}
