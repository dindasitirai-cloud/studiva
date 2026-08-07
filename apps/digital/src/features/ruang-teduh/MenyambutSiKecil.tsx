import React, { useState, useEffect, useCallback } from 'react';
import { usePenyimpanan } from './penyimpanan/PenyimpananProvider';
import { ambilCentangPersiapan, simpanCentangPersiapan } from './penyimpanan/supabase';
import { dispatchRekahError } from '../../utils/rekahApiError';
import { renderRichText } from '../beranda-usia/renderRichText';
import {
  CHECKLIST_KESIAPAN,
  CHECKLIST_BARANG,
  TEKS_KUTIPAN_MENYAMBUT,
  TEKS_CATATAN_BARANG_BEKAS,
  TEKS_CATATAN_TIDAK_WAJIB,
  TEKS_PAGAR_PRODUK,
} from './content';
import type { ItemChecklist, TierBarang } from './types';
import PanduanMemilih from './PanduanMemilih';

interface PropsMenyambutSiKecil {
  sapaan: { low: string; cap: string };
}

// ─── Item checklist tunggal ───────────────────────────────────────────────────

function ItemCeklis({
  item,
  dicentang,
  onToggle,
  sapaan,
}: {
  item: ItemChecklist;
  dicentang: boolean;
  onToggle: () => void;
  sapaan: { low: string; cap: string };
}) {
  const [panduanTerbuka, setPanduanTerbuka] = useState(false);
  const adaPanduan = item.panduanMemilih && item.panduanMemilih.length > 0;

  function handleTombolPanduan(e: React.MouseEvent) {
    e.stopPropagation(); // jangan centang item
    setPanduanTerbuka(p => !p);
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          paddingTop: 10,
          paddingBottom: 10,
          borderBottom: '1px solid rgba(224,82,107,.06)',
        }}
      >
        {/* Checkbox */}
        <button
          type="button"
          role="checkbox"
          aria-checked={dicentang}
          aria-label={item.label.replace(/\{anak\}/g, sapaan.low).replace(/\{Anak\}/g, sapaan.cap)}
          onClick={onToggle}
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            border: `2px solid ${dicentang ? '#E0526B' : '#C9B6D6'}`,
            background: dicentang ? '#E0526B' : '#fff',
            cursor: 'pointer',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 1,
            transition: 'background 140ms ease, border-color 140ms ease',
          }}
        >
          {dicentang && (
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2 6.5l3 3 5-5"
                stroke="#fff"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        {/* Label dan catatan */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontFamily: 'Nunito, system-ui, sans-serif',
              fontSize: 14,
              fontWeight: dicentang ? 600 : 700,
              color: dicentang ? '#A98DA0' : '#3A2530',
              textDecoration: dicentang ? 'line-through' : 'none',
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            {renderRichText(item.label, sapaan)}
          </p>
          {item.catatan && (
            <p
              style={{
                fontFamily: 'Nunito, system-ui, sans-serif',
                fontSize: 12,
                color: '#A98DA0',
                margin: '2px 0 0',
              }}
            >
              {renderRichText(item.catatan, sapaan)}
            </p>
          )}
          {item.sumberHalamanKIA && item.kategori !== 'kesiapan-keluarga' && (
            <p
              style={{
                fontFamily: 'Nunito, system-ui, sans-serif',
                fontSize: 11,
                color: '#C0A6B7',
                margin: '2px 0 0',
              }}
            >
              KIA hal. {item.sumberHalamanKIA}
            </p>
          )}
        </div>

        {/* Tombol panduan memilih */}
        {adaPanduan && (
          <button
            type="button"
            onClick={handleTombolPanduan}
            aria-expanded={panduanTerbuka}
            style={{
              flexShrink: 0,
              padding: '4px 10px',
              borderRadius: 999,
              border: '1.5px solid rgba(224,82,107,.3)',
              background: panduanTerbuka ? '#FFF0F3' : '#fff',
              fontFamily: 'Nunito, system-ui, sans-serif',
              fontSize: 12,
              fontWeight: 700,
              color: '#E0526B',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Panduan memilih
          </button>
        )}
      </div>

      {/* Panel panduan — muncul tepat di bawah baris item */}
      {adaPanduan && panduanTerbuka && (
        <PanduanMemilih
          kriteria={item.panduanMemilih!}
          sapaan={sapaan}
          rujukan={item.rujukanPanduan}
          tautan={item.tautanBelanja && item.tautanBelanja !== '' ? item.tautanBelanja : undefined}
          alasanTanpaTautan={item.alasanTanpaTautan}
        />
      )}
    </div>
  );
}

// ─── Grup per tier ────────────────────────────────────────────────────────────

const LABEL_TIER: Record<TierBarang, string> = {
  perlu: 'Perlu',
  membantu: 'Membantu',
  'tidak-wajib': 'Tidak wajib',
};

const WARNA_TIER: Record<TierBarang, string> = {
  perlu: '#E0526B',
  membantu: '#F6B860',
  'tidak-wajib': '#C0A6B7',
};

// ─── Kartu pagar produk ───────────────────────────────────────────────────────

function KartuPagarProduk({ pagar }: { pagar: typeof TEKS_PAGAR_PRODUK }) {
  return (
    <div
      style={{
        borderRadius: 14,
        border: '1.5px solid #F7C9D3',
        background: '#FFF5F7',
        padding: '14px 16px',
        marginTop: 20,
      }}
    >
      <p
        style={{
          fontFamily: 'Fredoka, system-ui, sans-serif',
          fontSize: 14,
          fontWeight: 600,
          color: '#9B3A52',
          margin: '0 0 6px',
        }}
      >
        {pagar.judul}
      </p>
      <p
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: 13,
          color: '#8A7A80',
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        {pagar.isi}
      </p>
    </div>
  );
}

// ─── MenyambutSiKecil ─────────────────────────────────────────────────────────

export default function MenyambutSiKecil({ sapaan }: PropsMenyambutSiKecil) {
  // Centang disimpan per orang tua di tabel centang_persiapan (migrasi 013).
  // Bukan data kesehatan — hanya daftar persiapan kelahiran, jadi tabelnya
  // sengaja terpisah dari catatan_harian_ibu.
  const { caregiverId } = usePenyimpanan();

  const [centangKesiapan, setCentangKesiapan] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(CHECKLIST_KESIAPAN.map(i => [i.id, false])),
  );
  const [centangBarang, setCentangBarang] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(CHECKLIST_BARANG.map(i => [i.id, false])),
  );

  useEffect(() => {
    let batal = false;
    void ambilCentangPersiapan(caregiverId)
      .then(({ kesiapan, barang }) => {
        if (batal) return;
        // Hanya yang tercentang yang tersimpan; sisanya tetap false dari nilai awal.
        setCentangKesiapan(p => ({ ...p, ...kesiapan }));
        setCentangBarang(p => ({ ...p, ...barang }));
      })
      .catch(err => {
        console.error('[Rekah] gagal memuat centang persiapan:', err);
      });
    return () => { batal = true; };
  }, [caregiverId]);

  /** Simpan keduanya sekaligus — satu baris per orang tua, satu tulisan. */
  const simpan = useCallback(
    (kesiapan: Record<string, boolean>, barang: Record<string, boolean>) => {
      void simpanCentangPersiapan(caregiverId, { kesiapan, barang }).catch(err => {
        console.error('[Rekah] gagal menyimpan centang persiapan:', err);
        dispatchRekahError('Koneksi terputus — centang tadi belum tersimpan. Coba lagi ya.');
      });
    },
    [caregiverId],
  );

  function toggleKesiapan(id: string) {
    setCentangKesiapan(p => {
      const baru = { ...p, [id]: !p[id] };
      simpan(baru, centangBarang);
      return baru;
    });
  }

  function toggleBarang(id: string) {
    setCentangBarang(p => {
      const baru = { ...p, [id]: !p[id] };
      simpan(centangKesiapan, baru);
      return baru;
    });
  }

  const tierUrutan: TierBarang[] = ['perlu', 'membantu', 'tidak-wajib'];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Kolom kiri: kesiapan keluarga */}
      <div>
        {/* Kutipan */}
        <div
          style={{
            borderRadius: 16,
            background: '#FFF0F3',
            border: '1px solid #F7C9D3',
            padding: '16px 18px',
            marginBottom: 20,
          }}
        >
          <p
            style={{
              fontFamily: 'Nunito, system-ui, sans-serif',
              fontSize: 14,
              color: '#6E3B57',
              margin: 0,
              lineHeight: 1.6,
              fontStyle: 'italic',
            }}
          >
            {renderRichText(TEKS_KUTIPAN_MENYAMBUT, sapaan)}
          </p>
        </div>

        <h3
          style={{
            fontFamily: 'Fredoka, system-ui, sans-serif',
            fontSize: 17,
            fontWeight: 600,
            color: '#3A2530',
            margin: '0 0 4px',
          }}
        >
          Kesiapan keluarga
        </h3>
        <p
          style={{
            fontFamily: 'Nunito, system-ui, sans-serif',
            fontSize: 12,
            color: '#A98DA0',
            margin: '0 0 10px',
          }}
        >
          Buku KIA hal. 18
        </p>

        <div>
          {CHECKLIST_KESIAPAN.map(item => (
            <ItemCeklis
              key={item.id}
              item={item}
              dicentang={centangKesiapan[item.id] ?? false}
              onToggle={() => toggleKesiapan(item.id)}
              sapaan={sapaan}
            />
          ))}
        </div>

        {/* Catatan barang bekas */}
        <div
          style={{
            marginTop: 16,
            background: '#F7F3FB',
            borderRadius: 12,
            padding: '12px 14px',
          }}
        >
          <p
            style={{
              fontFamily: 'Nunito, system-ui, sans-serif',
              fontSize: 13,
              color: '#6E3B57',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {renderRichText(TEKS_CATATAN_BARANG_BEKAS, sapaan)}
          </p>
        </div>
      </div>

      {/* Kolom kanan: barang per tier */}
      <div>
        {tierUrutan.map(tier => {
          const items = CHECKLIST_BARANG.filter(i => i.tier === tier);
          if (items.length === 0) return null;

          return (
            <div key={tier} style={{ marginBottom: 20 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: 10,
                    height: 10,
                    borderRadius: '70% 70% 70% 4px',
                    background: WARNA_TIER[tier],
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                />
                <h3
                  style={{
                    fontFamily: 'Fredoka, system-ui, sans-serif',
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#3A2530',
                    margin: 0,
                  }}
                >
                  {LABEL_TIER[tier]}
                </h3>
              </div>

              {items.map(item => (
                <ItemCeklis
                  key={item.id}
                  item={item}
                  dicentang={centangBarang[item.id] ?? false}
                  onToggle={() => toggleBarang(item.id)}
                  sapaan={sapaan}
                />
              ))}

              {tier === 'tidak-wajib' && (
                <p
                  style={{
                    fontFamily: 'Nunito, system-ui, sans-serif',
                    fontSize: 12,
                    color: '#A98DA0',
                    fontStyle: 'italic',
                    marginTop: 10,
                    marginBottom: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {renderRichText(TEKS_CATATAN_TIDAK_WAJIB, sapaan)}
                </p>
              )}
            </div>
          );
        })}

        {/* Kartu pagar produk */}
        <KartuPagarProduk pagar={TEKS_PAGAR_PRODUK} />
      </div>
    </div>
  );
}
