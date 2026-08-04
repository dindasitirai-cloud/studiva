import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { NilaiAkar } from '../akar-keluarga/content';
import type { ItemBekal } from '../beranda-usia/bekal';
import type { ItemIrama, BlokWaktu, HariIrama } from '@studiva/shared';
import { getMingguIrama, getSeninMinggu, tambahHari } from '@studiva/shared';
export interface JadwalManualItem {
  id: string;
  judul: string;
  tipe: 'kegiatan' | 'buku';
  warnaCover?: string;
}
import GridMingguan from './GridMingguan';
import BungaKebiasaan from './BungaKebiasaan';
import RingkasanMinggu from './RingkasanMinggu';
import LegendaIrama from './LegendaIrama';
import { pilihanKeHari, buatKolamMap } from './mingguanAdapter';
import type { PilihanHarian } from './PilihanHarianContext';
import { JUDUL_LAYAR, ARIA_MINGGU_SEBELUMNYA, ARIA_MINGGU_BERIKUTNYA } from './contentMingguan';

interface PropsIramaMingguan {
  idAnak: string;
  /** Tanggal hari ini — dikirim dari luar agar komponen ini murni / testable. */
  tanggalHariIni: string;
  /** Tanggal anak terdaftar di Rekah (ISO). Kolom sebelum tanggal ini dinonaktifkan. */
  tanggalDaftarAnak?: string;
  /** Kolam item Bekal milik anak (sudah difilter pemilik==='anak'). */
  kolam: readonly ItemBekal[];
  /** Nilai yang sudah ditanam keluarga (dari AkarState). */
  nilaiFokus: readonly NilaiAkar[];
  /** Pilihan hari ini dari IramaHari — jembatan data tanpa fetch backend. */
  pilihanHariIni?: PilihanHarian;
  /** Item yang dijadwalkan manual dari Bekal (tanpa backend). */
  jadwalManual?: Record<string, JadwalManualItem[]>;
  /** Nama anak — untuk header cetak. */
  namaAnak?: string;
  /** Callback untuk navigasi ke Bekal. */
  onBekalPress?: () => void;
}

/**
 * Layar Irama Hari Mingguan — grid 7 hari + Pita Kebiasaan + Ringkasan + Legenda.
 *
 * Integrasi backend: semua fetch data per-hari ditandai TODO di bawah.
 * Saat ini komponen menampilkan data hari ini saja; hari lain tampil kosong.
 */
export default function IramaMingguan({
  idAnak,
  tanggalHariIni,
  tanggalDaftarAnak,
  kolam,
  nilaiFokus,
  pilihanHariIni,
  jadwalManual,
  namaAnak,
  onBekalPress,
}: PropsIramaMingguan) {
  const navigate = useNavigate();
  // Minggu yang sedang ditampilkan (Senin ISO).
  const senin = getSeninMinggu(tanggalHariIni);
  const [mulaiSenin, setMulaiSenin] = useState(senin);

  // Ukuran kotak responsif: clamp 40–44px agar 7 kolom muat di viewport 360px tanpa scroll.
  const containerRef = useRef<HTMLDivElement>(null);
  const [kotakUkuran, setKotakUkuran] = useState(46);
  useEffect(() => {
    const hitung = () => {
      const lebar = containerRef.current?.clientWidth ?? window.innerWidth;
      // Label 74px + 7 sel + padding 6px per sel (3kiri+3kanan)
      const tersedia = (lebar - 74 - 42) / 7;
      setKotakUkuran(Math.max(36, Math.min(46, Math.floor(tersedia))));
    };
    hitung();
    const obs = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(hitung)
      : null;
    if (obs && containerRef.current) obs.observe(containerRef.current);
    return () => obs?.disconnect();
  }, []);

  // Batasan navigasi.
  const seninMingguDepan = tambahHari(getSeninMinggu(tanggalHariIni), 7);
  const seninMingguAnak = tanggalDaftarAnak
    ? getSeninMinggu(tanggalDaftarAnak)
    : '1900-01-01';
  const bisaMundur = mulaiSenin > seninMingguAnak;
  const bisMaju = mulaiSenin < seninMingguDepan;

  // TODO: fetch PilihanHarian dari Supabase untuk ke-7 hari minggu ini.
  // Setiap hari butuh: getPilihanHarian(idAnak, tanggal).
  // Untuk sementara, hanya hari ini yang terisi data aktual.
  const [dataPerHari, setDataPerHari] = useState<Partial<Record<string, PilihanHarian>>>({});

  // TODO: ganti dengan actual fetch saat backend siap.
  useEffect(() => {
    setDataPerHari({});
    // TODO: fetch 7 hari dari Supabase:
    // const tanggalMinggu = Array.from({length: 7}, (_, i) => tambahHari(mulaiSenin, i));
    // Promise.all(tanggalMinggu.map(t => getPilihanHarian(idAnak, t))).then(results => {
    //   const map: Record<string, PilihanHarian> = {};
    //   results.forEach((r, i) => { if (r) map[tanggalMinggu[i]] = r.diff as PilihanHarian; });
    //   setDataPerHari(map);
    // });
  }, [mulaiSenin, idAnak]);

  const kolamMap = useMemo(() => buatKolamMap(kolam), [kolam]);

  // Konversi PilihanHarian ke HariIrama.
  const hariIramaPerTanggal = useMemo<Partial<Record<string, HariIrama>>>(() => {
    const hasil: Partial<Record<string, HariIrama>> = {};
    const blokSeq: BlokWaktu[] = ['pagi', 'siang', 'sore', 'jelangTidur'];

    // Data hari ini dari IramaHari (jembatan langsung tanpa backend).
    if (pilihanHariIni && pilihanHariIni.tanggal) {
      const pe: Record<string, BlokWaktu | null> = {};
      pilihanHariIni.ditambah.forEach((id, i) => {
        const override = pilihanHariIni.penempatan[id];
        pe[id] = override !== undefined ? override : blokSeq[i % 4];
      });
      hasil[pilihanHariIni.tanggal] = pilihanKeHari(pilihanHariIni, pe, kolamMap);
    }

    // Data hari lain dari backend (TODO).
    for (const [tgl, pilihan] of Object.entries(dataPerHari)) {
      if (!pilihan || tgl === pilihanHariIni?.tanggal) continue;
      const pe: Record<string, BlokWaktu | null> = {};
      pilihan.ditambah.forEach((id, i) => {
        const override = pilihan.penempatan[id];
        pe[id] = override !== undefined ? override : blokSeq[i % 4];
      });
      hasil[tgl] = pilihanKeHari(pilihan, pe, kolamMap);
    }
    return hasil;
  }, [pilihanHariIni, dataPerHari, kolamMap]);

  // Gabungkan jadwal manual dari Bekal ke dalam data hari yang ada
  const hariIramaFinal = useMemo<Partial<Record<string, HariIrama>>>(() => {
    if (!jadwalManual || Object.keys(jadwalManual).length === 0) return hariIramaPerTanggal;
    const hasil = { ...hariIramaPerTanggal };
    for (const [tgl, items] of Object.entries(jadwalManual)) {
      const existing: HariIrama = hasil[tgl] ?? {
        tanggal: tgl,
        slot: { pagi: [], siang: [], sore: [], jelangTidur: [] },
      };
      const mergedSlot = {
        pagi: [...existing.slot.pagi],
        siang: [...existing.slot.siang],
        sore: [...existing.slot.sore],
        jelangTidur: [...existing.slot.jelangTidur],
      };
      for (const item of items) {
        const sudahAda = (['pagi', 'siang', 'sore', 'jelangTidur'] as const).some(
          blok => mergedSlot[blok].some(i => i.id === item.id),
        );
        if (sudahAda) continue;
        const iramaItem: ItemIrama =
          item.tipe === 'buku'
            ? { id: item.id, jenis: 'wawasanTumbuh', judul: item.judul, urutan: 9999, selesai: false, warnaCover: item.warnaCover ?? '#EDE9F8', kartuId: item.id }
            : { id: item.id, jenis: 'ajakMain', judul: item.judul, urutan: 9999, selesai: false };
        mergedSlot.pagi = [...mergedSlot.pagi, iramaItem];
      }
      hasil[tgl] = { ...existing, slot: mergedSlot };
    }
    return hasil;
  }, [hariIramaPerTanggal, jadwalManual]);

  const minggu = useMemo(
    () => getMingguIrama(hariIramaFinal, mulaiSenin),
    [hariIramaFinal, mulaiSenin],
  );

  // TODO: fetch riwayat siram dari backend.
  const riwayatSiram: Record<string, NilaiAkar[]> = {};

  const handleToggleSiram = useCallback((_nilai: NilaiAkar, _tanggal: string) => {
    // TODO: kirim ke backend: simpanSiram(idAnak, nilai, tanggal)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKetukItem = useCallback((_item: ItemIrama, _tanggal: string, _blok: BlokWaktu) => {
    // TODO: buka bottom sheet detail item
  }, []);

  const handleKetukHari = useCallback((_tanggal: string) => {
    // TODO: navigasi ke Irama Hari harian untuk tanggal tersebut
  }, []);

  // Format rentang tanggal untuk header.
  const formatHeaderMinggu = () => {
    const BULAN = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    const [ty, tm, td] = mulaiSenin.split('-').map(Number);
    const selesai = tambahHari(mulaiSenin, 6);
    const [sy, sm, sd] = selesai.split('-').map(Number);
    const bulanMulai = BULAN[(tm ?? 1) - 1];
    const bulanSelesai = BULAN[(sm ?? 1) - 1];
    const mulaiStr = `${td} ${bulanMulai}`;
    const selesaiStr = sm !== tm
      ? `${sd} ${bulanSelesai} ${sy}`
      : `${sd} ${bulanSelesai} ${ty}`;
    return `${mulaiStr} sampai ${selesaiStr}`;
  };

  // Animasi geser — hormati prefers-reduced-motion.
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const mundurSatuMinggu = () => {
    if (!bisaMundur) return;
    setMulaiSenin(prev => tambahHari(prev, -7));
  };

  const majuSatuMinggu = () => {
    if (!bisMaju) return;
    setMulaiSenin(prev => tambahHari(prev, 7));
  };

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        paddingBottom: 32,
        overflowX: 'hidden',
      }}
    >
      {/* Header navigasi minggu */}
      <div style={{ textAlign: 'center' }}>
        <p
          style={{
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: '0.5px',
            color: '#F06BA8',
            marginBottom: 4,
          }}
        >
          {formatHeaderMinggu()}
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
          }}
        >
          <button
            type="button"
            onClick={mundurSatuMinggu}
            disabled={!bisaMundur}
            aria-label={ARIA_MINGGU_SEBELUMNYA}
            style={{
              width: 40, height: 40,
              borderRadius: '50%',
              background: '#fff',
              border: 'none',
              cursor: bisaMundur ? 'pointer' : 'default',
              color: bisaMundur ? '#B98FAD' : '#DFCDBE',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: bisaMundur ? '0 8px 20px -14px rgba(90,50,70,.6)' : 'none',
              flexShrink: 0,
            }}
          >
            <ChevronLeft style={{ width: 20, height: 20 }} />
          </button>

          <h2
            style={{
              fontFamily: 'Fredoka, system-ui, sans-serif',
              fontSize: 44,
              fontWeight: 700,
              color: '#6E3B57',
              letterSpacing: '-1px',
              margin: 0,
            }}
          >
            {JUDUL_LAYAR}
          </h2>

          <button
            type="button"
            onClick={majuSatuMinggu}
            disabled={!bisMaju}
            aria-label={ARIA_MINGGU_BERIKUTNYA}
            style={{
              width: 40, height: 40,
              borderRadius: '50%',
              background: '#fff',
              border: 'none',
              cursor: bisMaju ? 'pointer' : 'default',
              color: bisMaju ? '#B98FAD' : '#DFCDBE',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: bisMaju ? '0 8px 20px -14px rgba(90,50,70,.6)' : 'none',
              flexShrink: 0,
            }}
          >
            <ChevronRight style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Tombol simpan minggu */}
        <div style={{ marginTop: 8, textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => {
              // TODO: arsip mingguan otomatis butuh backend
              navigate(`/dashboard/tier2/irama-hari/minggu/${mulaiSenin}/cetak`, {
                state: { mulaiSenin, namaAnak: namaAnak ?? '', minggu, riwayatSiram },
              });
            }}
            style={{
              background: 'none',
              border: '1.5px solid #B98FAD',
              borderRadius: 999,
              padding: '7px 20px',
              fontFamily: 'Nunito, system-ui, sans-serif',
              fontSize: 13,
              fontWeight: 700,
              color: '#6E3B57',
              cursor: 'pointer',
            }}
          >
            Simpan minggu ini
          </button>
        </div>
      </div>

      {/* Dua kolom: grid kiri, kebiasaan kanan — wrap ke satu kolom di layar sempit */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28, alignItems: 'flex-start' }}>
        {/* Kolom kiri: grid mingguan + ringkasan */}
        <div style={{ flex: '1.55 1 280px', display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 28,
              padding: '24px 20px 20px',
              boxShadow: '0 14px 34px -26px rgba(90,50,70,.55)',
              transition: prefersReducedMotion ? 'none' : 'opacity 160ms ease',
            }}
          >
            <GridMingguan
              minggu={minggu}
              tanggalHariIni={tanggalHariIni}
              tanggalDaftarAnak={tanggalDaftarAnak}
              kotakUkuran={kotakUkuran}
              onKetukItem={handleKetukItem}
              onKetukHari={handleKetukHari}
              onKetukLebih={(_hari, _blok) => {
                // TODO: buka bottom sheet daftar item slot
              }}
            />
            <LegendaIrama />
          </div>

          <RingkasanMinggu
            minggu={minggu}
            onBekalPress={onBekalPress}
          />
        </div>

        {/* Kolom kanan: pita kebiasaan */}
        <div style={{ flex: '1 1 240px', minWidth: 0 }}>
          <BungaKebiasaan
            nilaiFokus={nilaiFokus as NilaiAkar[]}
            riwayatSiram={riwayatSiram}
            mulaiSenin={mulaiSenin}
            tanggalHariIni={tanggalHariIni}
            onToggleSiram={handleToggleSiram}
            onTanamNilai={() => navigate('/dashboard/tier2/bekal?tab=kebiasaan-baik')}
          />
        </div>
      </div>
    </div>
  );
}
