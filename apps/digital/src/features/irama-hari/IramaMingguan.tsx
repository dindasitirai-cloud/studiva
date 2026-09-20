import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { NilaiAkar } from '../akar-keluarga/content';
import type { ItemBekal } from '../beranda-usia/bekal';
import type { ItemIrama, BlokWaktu, HariIrama, CentangKebiasaan } from '@studiva/shared';
import { getMingguIrama, getSeninMinggu, tambahHari, derivedRiwayatSiram, BLOK_URUTAN } from '@studiva/shared';
import GridMingguan from './GridMingguan';
import BungaKebiasaan from './BungaKebiasaan';
import LegendaIrama from './LegendaIrama';
import { pilihanKeHari, buatKolamMap } from './mingguanAdapter';
import { getPilihanHarianRentang } from '../../lib/supabase/rekah';
import type { PilihanHarian } from './PilihanHarianContext';
import { JUDUL_LAYAR, ARIA_MINGGU_SEBELUMNYA, ARIA_MINGGU_BERIKUTNYA, LABEL_DOMAIN, RINGKASAN_DOMINAN, RINGKASAN_BERAGAM, RINGKASAN_BACAAN, RINGKASAN_KOSONG_JUDUL, TILE_AJAK_MAIN_LABEL, TILE_WAWASAN_LABEL, LABEL_BLOK, NAMA_DOMAIN_RAMAH } from './contentMingguan';
import { LATAR_DOMAIN } from './domainWarnaIrama';
import type { DomainKeyIrama } from './mingguanAdapter';

/**
 * Baris `pilihan_harian.diff` → PilihanHarian yang utuh.
 */
function normalkanPilihan(diff: unknown, tanggal: string, idAnak: string): PilihanHarian {
  const d = (diff ?? {}) as Partial<PilihanHarian>;
  return {
    ...d,
    tanggal: d.tanggal ?? tanggal,
    idAnak: d.idAnak ?? idAnak,
    dihapus: Array.isArray(d.dihapus) ? d.dihapus : [],
    ditambah: Array.isArray(d.ditambah) ? d.ditambah : [],
    penempatan: d.penempatan ?? {},
    selesai: Array.isArray(d.selesai) ? d.selesai : [],
    catatan: d.catatan ?? '',
  } as PilihanHarian;
}

function hitungRingkasan(minggu: import('@studiva/shared').MingguIrama) {
  let jumlahAjakMain = 0;
  let jumlahWawasan = 0;
  const jumlahPerBlok: Record<string, number> = { pagi: 0, siang: 0, sore: 0, jelangTidur: 0 };
  const hitungPerDomain: Record<string, number> = {};

  for (const hari of minggu.hari) {
    for (const blok of BLOK_URUTAN) {
      for (const item of hari.slot[blok]) {
        if (item.jenis === 'ajakMain') {
          jumlahAjakMain++;
          jumlahPerBlok[blok]++;
          if (item.domainKey) {
            hitungPerDomain[item.domainKey] = (hitungPerDomain[item.domainKey] ?? 0) + 1;
          }
        } else {
          jumlahWawasan++;
          jumlahPerBlok[blok]++;
        }
      }
    }
  }

  const total = jumlahAjakMain + jumlahWawasan;
  const blokTeratas = BLOK_URUTAN.reduce<string | null>((best, blok) =>
    best === null ? blok : jumlahPerBlok[blok] > jumlahPerBlok[best] ? blok : best, null);
  const waktuHidup = total > 0 && blokTeratas && jumlahPerBlok[blokTeratas] > 0
    ? LABEL_BLOK[blokTeratas as keyof typeof LABEL_BLOK]
    : null;

  let judulKartu: string;
  if (total === 0) {
    judulKartu = RINGKASAN_KOSONG_JUDUL;
  } else if (jumlahAjakMain === 0 && jumlahWawasan > 0) {
    judulKartu = RINGKASAN_BACAAN;
  } else {
    const entri = Object.entries(hitungPerDomain).sort((a, b) => b[1] - a[1]);
    const [topDomain, topJumlah] = entri[0] ?? [null, 0];
    const [, keduaJumlah] = entri[1] ?? [null, 0];
    const dominan = topDomain && topJumlah > keduaJumlah;
    judulKartu = dominan
      ? RINGKASAN_DOMINAN(NAMA_DOMAIN_RAMAH[topDomain as DomainKeyIrama])
      : RINGKASAN_BERAGAM;
  }

  return { jumlahAjakMain, jumlahWawasan, waktuHidup, judulKartu, kosong: total === 0 };
}

export interface JadwalManualItem {
  id: string;
  judul: string;
  tipe: 'kegiatan' | 'buku';
  warnaCover?: string;
}

interface PropsIramaMingguan {
  idAnak: string;
  tanggalHariIni: string;
  tanggalDaftarAnak?: string;
  kolam: readonly ItemBekal[];
  nilaiFokus: readonly NilaiAkar[];
  pilihanHariIni?: PilihanHarian;
  versiData?: number;
  centangKebiasaan?: CentangKebiasaan;
  namaAnak?: string;
  onBekalPress?: () => void;
}

// Wawasan Tumbuh cover color
const WAWASAN_DOT = '#F06BA8';

export default function IramaMingguan({
  idAnak,
  tanggalHariIni,
  tanggalDaftarAnak,
  kolam,
  nilaiFokus,
  pilihanHariIni,
  versiData,
  centangKebiasaan,
  namaAnak,
  onBekalPress,
}: PropsIramaMingguan) {
  const navigate = useNavigate();
  const senin = getSeninMinggu(tanggalHariIni);
  const [mulaiSenin, setMulaiSenin] = useState(senin);

  const containerRef = useRef<HTMLDivElement>(null);
  const [kotakUkuran, setKotakUkuran] = useState(46);
  useEffect(() => {
    const hitung = () => {
      const lebar = containerRef.current?.clientWidth ?? window.innerWidth;
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

  const seninMingguDepan = tambahHari(getSeninMinggu(tanggalHariIni), 7);
  const seninMingguAnak = tanggalDaftarAnak
    ? getSeninMinggu(tanggalDaftarAnak)
    : '1900-01-01';
  const bisaMundur = mulaiSenin > seninMingguAnak;
  const bisMaju = mulaiSenin < seninMingguDepan;

  const [dataPerHari, setDataPerHari] = useState<Partial<Record<string, PilihanHarian>>>({});

  useEffect(() => {
    let batal = false;
    const tanggalMinggu = Array.from({ length: 7 }, (_, i) => tambahHari(mulaiSenin, i));

    void getPilihanHarianRentang(idAnak, tanggalMinggu)
      .then(baris => {
        if (batal) return;
        const peta: Partial<Record<string, PilihanHarian>> = {};
        for (const [tgl, row] of Object.entries(baris)) {
          peta[tgl] = normalkanPilihan(row.diff, tgl, idAnak);
        }
        setDataPerHari(peta);
      })
      .catch(err => {
        console.error('[Rekah] gagal memuat pilihan harian mingguan:', err);
      });

    return () => { batal = true; };
  }, [mulaiSenin, idAnak, versiData]);

  const kolamMap = useMemo(() => buatKolamMap(kolam), [kolam]);

  const hariIramaPerTanggal = useMemo<Partial<Record<string, HariIrama>>>(() => {
    const hasil: Partial<Record<string, HariIrama>> = {};
    const blokSeq: BlokWaktu[] = ['pagi', 'siang', 'sore', 'jelangTidur'];

    if (pilihanHariIni && pilihanHariIni.tanggal) {
      const pe: Record<string, BlokWaktu | null> = {};
      pilihanHariIni.ditambah.forEach((id, i) => {
        const override = pilihanHariIni.penempatan[id];
        pe[id] = override !== undefined ? override : blokSeq[i % 4];
      });
      hasil[pilihanHariIni.tanggal] = pilihanKeHari(pilihanHariIni, pe, kolamMap);
    }

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

  const minggu = useMemo(
    () => getMingguIrama(hariIramaPerTanggal, mulaiSenin),
    [hariIramaPerTanggal, mulaiSenin],
  );

  const riwayatSiram = useMemo<Record<string, NilaiAkar[]>>(
    () => (centangKebiasaan ? derivedRiwayatSiram(centangKebiasaan) as Record<string, NilaiAkar[]> : {}),
    [centangKebiasaan],
  );

  const r = useMemo(() => hitungRingkasan(minggu), [minggu]);

  // ─── Overlay state ────────────────────────────────────────────────────────
  // Detail sheet: satu item diklik
  const [detailSheet, setDetailSheet] = useState<{ item: ItemIrama } | null>(null);
  // Overflow sheet: sel dengan > 2 item diklik
  const [overflowSheet, setOverflowSheet] = useState<{
    items: ItemIrama[];
    blok: BlokWaktu;
    tanggal: string;
  } | null>(null);

  const handleToggleSiram = useCallback((_nilai: NilaiAkar, _tanggal: string) => {
    // TODO: kirim ke backend: simpanSiram(idAnak, nilai, tanggal)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKetukItem = useCallback((item: ItemIrama, _tanggal: string, _blok: BlokWaktu) => {
    setDetailSheet({ item });
  }, []);

  const handleKetukHari = useCallback((_tanggal: string) => {
    // TODO: navigasi ke Irama Hari harian untuk tanggal tersebut
  }, []);

  const handleKetukLebih = useCallback((hari: HariIrama, blok: BlokWaktu) => {
    // Item yang disembunyikan (sisa setelah 2 pertama)
    const semua = hari.slot[blok];
    const sisa = semua.slice(2);
    setOverflowSheet({ items: sisa, blok, tanggal: hari.tanggal });
  }, []);

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
      {/* Kartu kalender utama */}
      <div
        style={{
          background: '#fff',
          borderRadius: 28,
          padding: '16px 16px 16px',
          boxShadow: '0 14px 34px -26px rgba(90,50,70,.55)',
          transition: prefersReducedMotion ? 'none' : 'opacity 160ms ease',
        }}
      >
        {/* Navigasi minggu — di atas 7 nama hari */}
        <div style={{ marginBottom: 10 }}>
          <p
            style={{
              fontFamily: 'Nunito, system-ui, sans-serif',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.4px',
              color: '#F06BA8',
              textAlign: 'center',
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
              gap: 12,
            }}
          >
            <button
              type="button"
              onClick={mundurSatuMinggu}
              disabled={!bisaMundur}
              aria-label={ARIA_MINGGU_SEBELUMNYA}
              style={{
                width: 32, height: 32,
                borderRadius: '50%',
                background: bisaMundur ? '#FFF3F8' : 'transparent',
                border: 'none',
                cursor: bisaMundur ? 'pointer' : 'default',
                color: bisaMundur ? '#B98FAD' : '#DFCDBE',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ChevronLeft style={{ width: 16, height: 16 }} />
            </button>

            <h2
              style={{
                fontFamily: 'Fredoka, system-ui, sans-serif',
                fontSize: 26,
                fontWeight: 700,
                color: '#6E3B57',
                letterSpacing: '-0.5px',
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
                width: 32, height: 32,
                borderRadius: '50%',
                background: bisMaju ? '#FFF3F8' : 'transparent',
                border: 'none',
                cursor: bisMaju ? 'pointer' : 'default',
                color: bisMaju ? '#B98FAD' : '#DFCDBE',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ChevronRight style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>

        {/* Stats minggu ini — di atas grid kalender */}
        <div
          style={{
            background: 'linear-gradient(135deg,#F1ECFB 0%,#FCE3EE 100%)',
            borderRadius: 14,
            padding: '10px 14px',
            marginBottom: 12,
          }}
        >
          <p
            style={{
              fontFamily: "'Shantell Sans', cursive, system-ui",
              fontSize: 13,
              fontWeight: 600,
              color: '#F06BA8',
              margin: '0 0 6px',
            }}
          >
            {r.judulKartu}
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 4 }}>
              <span
                style={{
                  fontFamily: 'Fredoka, system-ui, sans-serif',
                  fontSize: 22,
                  fontWeight: 700,
                  color: '#6E3B57',
                  lineHeight: 1,
                }}
              >
                {r.jumlahAjakMain}
              </span>
              <span
                style={{
                  fontFamily: 'Nunito, system-ui, sans-serif',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#A98DA0',
                }}
              >
                {TILE_AJAK_MAIN_LABEL.toLowerCase()}
              </span>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 4 }}>
              <span
                style={{
                  fontFamily: 'Fredoka, system-ui, sans-serif',
                  fontSize: 22,
                  fontWeight: 700,
                  color: '#6E3B57',
                  lineHeight: 1,
                }}
              >
                {r.jumlahWawasan}
              </span>
              <span
                style={{
                  fontFamily: 'Nunito, system-ui, sans-serif',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#A98DA0',
                }}
              >
                {TILE_WAWASAN_LABEL.toLowerCase()}
              </span>
            </span>
            {r.waktuHidup && (
              <span
                style={{
                  fontFamily: 'Nunito, system-ui, sans-serif',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#9F86C7',
                  background: 'rgba(255,255,255,.65)',
                  borderRadius: 999,
                  padding: '2px 8px',
                }}
              >
                ✦ {r.waktuHidup}
              </span>
            )}
          </div>
        </div>

        <GridMingguan
          minggu={minggu}
          tanggalHariIni={tanggalHariIni}
          tanggalDaftarAnak={tanggalDaftarAnak}
          kotakUkuran={kotakUkuran}
          onKetukItem={handleKetukItem}
          onKetukHari={handleKetukHari}
          onKetukLebih={handleKetukLebih}
        />
        {/* Legenda dengan statistik minggu ini */}
        <LegendaIrama minggu={minggu} />
      </div>

      {/* Pita Kebiasaan horizontal di bawah kalender */}
      <BungaKebiasaan
        nilaiFokus={nilaiFokus as NilaiAkar[]}
        centangKebiasaan={centangKebiasaan ?? {}}
        mulaiSenin={mulaiSenin}
        tanggalHariIni={tanggalHariIni}
        onToggleSiram={handleToggleSiram}
        onTanamNilai={() => navigate('/dashboard/tier2/bekal?tab=kebiasaan-baik')}
        kompak
      />

      <div style={{ textAlign: 'center' }}>
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
            padding: '6px 16px',
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: 12,
            fontWeight: 700,
            color: '#6E3B57',
            cursor: 'pointer',
          }}
        >
          Simpan minggu ini
        </button>
      </div>

      {/* ── Overflow sheet (request 7) ─────────────────────────────────────── */}
      {overflowSheet !== null && (
        <Overlay onTutup={() => setOverflowSheet(null)}>
          <div style={{ maxWidth: 360, width: '100%' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <p
                style={{
                  fontFamily: 'Fredoka, system-ui, sans-serif',
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#6E3B57',
                  margin: 0,
                }}
              >
                Kegiatan lainnya
              </p>
              <button
                type="button"
                onClick={() => setOverflowSheet(null)}
                aria-label="Tutup"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A98DA0', padding: 4 }}
              >
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {overflowSheet.items.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setOverflowSheet(null);
                    setDetailSheet({ item });
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    background: '#FAF5F8',
                    borderRadius: 14,
                    padding: '12px 14px',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <ItemIkonKecil item={item} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontFamily: 'Nunito, system-ui, sans-serif',
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#6E3B57',
                        margin: '0 0 2px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.judul}
                    </p>
                    <p
                      style={{
                        fontFamily: 'Nunito, system-ui, sans-serif',
                        fontSize: 11,
                        color: '#A98DA0',
                        margin: 0,
                      }}
                    >
                      {item.jenis === 'ajakMain'
                        ? (item.domainKey ? LABEL_DOMAIN[item.domainKey as DomainKeyIrama] ?? '' : 'Ajak Main')
                        : 'Wawasan Tumbuh'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Overlay>
      )}

      {/* ── Detail sheet (request 8) ───────────────────────────────────────── */}
      {detailSheet !== null && (
        <Overlay onTutup={() => setDetailSheet(null)}>
          <DetailItem
            item={detailSheet.item}
            onTutup={() => setDetailSheet(null)}
            onLihatDetail={() => {
              const tab = detailSheet.item.jenis === 'ajakMain' ? 'ajak-main' : 'wawasan-tumbuh';
              setDetailSheet(null);
              navigate(`/dashboard/tier2/bekal?tab=${tab}`);
            }}
          />
        </Overlay>
      )}
    </div>
  );
}

// ─── Ikon kecil untuk item di overflow list ───────────────────────────────────

function ItemIkonKecil({ item }: { item: ItemIrama }) {
  if (item.jenis === 'ajakMain' && item.domainKey) {
    const warna = LATAR_DOMAIN[item.domainKey as DomainKeyIrama] ?? '#EADFDA';
    return (
      <div
        style={{
          width: 36, height: 36,
          borderRadius: 10,
          backgroundColor: warna,
          flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 21v-7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="12" cy="8.4" r="5.3" fill="#fff" />
          <circle cx="7.4" cy="11.2" r="3.7" fill="#fff" />
          <circle cx="16.6" cy="11.2" r="3.7" fill="#fff" />
        </svg>
      </div>
    );
  }
  return (
    <div
      style={{
        width: 36, height: 36,
        borderRadius: 10,
        backgroundColor: '#FFF3F6',
        border: '1px solid #F3E3E8',
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 4.5h10a2 2 0 0 1 2 2V19a1 1 0 0 1-1 1H7a1.5 1.5 0 0 1-1.5-1.5z" fill="#F06BA8" />
        <path d="M9 8.5h6M9 11.5h6" stroke="rgba(255,255,255,.75)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// ─── Detail drawer ────────────────────────────────────────────────────────────

function DetailItem({
  item,
  onTutup,
  onLihatDetail,
}: {
  item: ItemIrama;
  onTutup: () => void;
  onLihatDetail: () => void;
}) {
  const isAjakMain = item.jenis === 'ajakMain';
  const domainLabel = isAjakMain && item.domainKey
    ? LABEL_DOMAIN[item.domainKey as DomainKeyIrama] ?? ''
    : '';
  const dotWarna = isAjakMain && item.domainKey
    ? LATAR_DOMAIN[item.domainKey as DomainKeyIrama] ?? '#EADFDA'
    : WAWASAN_DOT;

  return (
    <div style={{ maxWidth: 360, width: '100%' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Kategori chip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span
              style={{
                width: 8, height: 8,
                borderRadius: '50%',
                backgroundColor: dotWarna,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: 'Nunito, system-ui, sans-serif',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#A98DA0',
              }}
            >
              {isAjakMain ? (domainLabel || 'Ajak Main') : 'Wawasan Tumbuh'}
            </span>
          </div>

          <p
            style={{
              fontFamily: 'Fredoka, system-ui, sans-serif',
              fontSize: 20,
              fontWeight: 700,
              color: '#6E3B57',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {item.judul}
          </p>
        </div>

        <button
          type="button"
          onClick={onTutup}
          aria-label="Tutup"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A98DA0', padding: 4, flexShrink: 0 }}
        >
          <X style={{ width: 20, height: 20 }} />
        </button>
      </div>

      {/* Status selesai */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          backgroundColor: item.selesai ? '#ECFDF5' : '#FAF5F8',
          borderRadius: 999,
          padding: '6px 14px',
          marginBottom: 20,
        }}
      >
        <span
          style={{
            width: 7, height: 7,
            borderRadius: '50%',
            backgroundColor: item.selesai ? '#059669' : '#DFCDBE',
          }}
        />
        <span
          style={{
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: 12,
            fontWeight: 700,
            color: item.selesai ? '#059669' : '#A98DA0',
          }}
        >
          {item.selesai ? 'Sudah dilakukan' : 'Belum dilakukan'}
        </span>
      </div>

      {/* Tombol lihat detail */}
      <button
        type="button"
        onClick={onLihatDetail}
        style={{
          display: 'block',
          width: '100%',
          backgroundColor: '#F06BA8',
          color: '#fff',
          border: 'none',
          borderRadius: 14,
          padding: '13px 20px',
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 14,
          fontWeight: 700,
          cursor: 'pointer',
          textAlign: 'center',
        }}
      >
        Lihat detailnya di Bekal
      </button>
    </div>
  );
}

// ─── Overlay backdrop ─────────────────────────────────────────────────────────

function Overlay({ children, onTutup }: { children: React.ReactNode; onTutup: () => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(40,10,25,0.45)',
        }}
        onClick={onTutup}
        aria-hidden="true"
      />

      {/* Card — centered */}
      <div
        style={{
          position: 'relative',
          backgroundColor: '#fff',
          borderRadius: 24,
          padding: '28px 24px',
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 24px 60px rgba(90,50,70,.3)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
