import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAnakAktif } from '../../../context/AnakContext';
import { useAkarStateSync } from '../../../features/akar-keluarga/state';
import type { NilaiAkar } from '../../../features/akar-keluarga/content';
import IramaHari from '../../../features/irama-hari/IramaHari';
import type { JadwalManualItem } from '../../../features/irama-hari/IramaMingguan';
import { tanggalDariTimestampWIB, toggleCentang } from '@studiva/shared';
import type { CentangKebiasaan } from '@studiva/shared';
import {
  getCentangKebiasaan,
  simpanCentangKebiasaan,
  jadwalkanKeTanggal,
} from '../../../lib/supabase/rekah';
import { dispatchRekahError } from '../../../utils/rekahApiError';

/** Berapa hari ke belakang centang dimuat — 14 hari memberi ruang untuk Pita Kebiasaan mingguan. */
const HARI_RIWAYAT_CENTANG = 14;


export default function IramaHariPage() {
  const { anak } = useAnakAktif();
  const idAnak = anak.id;
  const navigate = useNavigate();
  const location = useLocation();
  const [akarState] = useAkarStateSync(idAnak);
  const [centangKebiasaan, setCentangKebiasaan] = useState<CentangKebiasaan>({});
  const jadwalProcessedRef = useRef<string | null>(null);

  const tanggalHariIni = useMemo(() => tanggalDariTimestampWIB(new Date().toISOString()), []);
  const nilaiFokus = akarState.nilai as NilaiAkar[];

  // Item yang dijadwalkan dari Bekal → tulis ke pilihan_harian tanggal tujuan.
  useEffect(() => {
    const j = (location.state as { jadwalkan?: JadwalManualItem & { tanggal: string } } | null)?.jadwalkan;
    if (!j) return;
    const kunci = `${j.id}:${j.tanggal}`;
    if (jadwalProcessedRef.current === kunci) return;
    jadwalProcessedRef.current = kunci;

    void jadwalkanKeTanggal(idAnak, j.tanggal, { id: j.id, tipe: j.tipe })
      .catch(err => {
        console.error('[Rekah] gagal menjadwalkan item:', err);
        dispatchRekahError('Koneksi terputus — kegiatan tadi belum terjadwal. Coba lagi ya.');
        jadwalProcessedRef.current = null;
      });
  }, [location.state, idAnak]);

  // Muat centang 14 hari terakhir (juga dipakai Pita Kebiasaan mingguan di Beranda).
  useEffect(() => {
    let batal = false;
    const sejak = new Date();
    sejak.setDate(sejak.getDate() - HARI_RIWAYAT_CENTANG);
    const sejakTanggal = sejak.toISOString().slice(0, 10);

    void getCentangKebiasaan(idAnak, sejakTanggal)
      .then(hasil => { if (!batal) setCentangKebiasaan(hasil); })
      .catch(err => {
        console.error('[Rekah] gagal memuat centang kebiasaan:', err);
      });

    return () => { batal = true; };
  }, [idAnak]);

  const handleCentangToggle = useCallback(
    (nilaiId: NilaiAkar, butirId: string) => {
      setCentangKebiasaan(prev => {
        const berikutnya = toggleCentang(prev, nilaiId, butirId, tanggalHariIni);
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

  return (
    <IramaHari
      nilaiFokus={nilaiFokus}
      centangKebiasaan={centangKebiasaan}
      tanggalHariIni={tanggalHariIni}
      onCentangToggle={handleCentangToggle}
      onBekal={() => navigate('/dashboard/tier2/bekal')}
    />
  );
}
