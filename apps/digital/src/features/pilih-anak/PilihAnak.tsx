// ============================================================================
// PilihAnak — gerbang pemilihan anak sebelum masuk dashboard.
//
// Isi dashboard Rekah berbeda per anak: musim tumbuh, kegiatan, panduan, dan
// Irama Hari semuanya bergantung pada usia. Jadi orang tua memilih dulu anak
// yang mana, seperti memilih profil di Netflix, baru masuk.
//
// Datanya dari AnakContext, satu-satunya sumber data anak.
// ============================================================================

import React from 'react';
import { Plus } from 'lucide-react';
import { useAnak, useFotoAnak } from '../../context/AnakContext';
import { ringkasRentang } from '../beranda-usia/registry';
import {
  formatUsia,
  inisialAnak,
  sapaanPendamping,
  usiaDalamBulan,
  type ProfilAnak,
} from '../../types/anak';

const RADIUS_KELOPAK = { borderRadius: '100px 100px 100px 8px' } as const;

function KartuAnak({ anak, onPilih }: { anak: ProfilAnak; onPilih: () => void }) {
  const foto = useFotoAnak(anak.fotoPath);
  const usiaBulan = usiaDalamBulan(anak.tanggalLahir);
  const ringkas = ringkasRentang(usiaBulan);
  const rentang = ringkas ? `Usia ${ringkas.rentang}` : 'Di luar rentang Rekah';

  return (
    <button
      type="button"
      onClick={onPilih}
      className="group flex w-[150px] flex-col items-center gap-3 rounded-3xl p-3 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-2 sm:w-[168px]"
    >
      <span
        className="flex h-[110px] w-[110px] items-center justify-center overflow-hidden border-4 border-mawar bg-mawar transition group-hover:border-rekah group-focus-visible:border-rekah sm:h-[128px] sm:w-[128px]"
        style={{ borderRadius: '70% 70% 70% 8px' }}
      >
        {foto ? (
          <img src={foto} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="font-bricolage text-[42px] font-extrabold text-rekah">
            {inisialAnak(anak.namaAnak)}
          </span>
        )}
      </span>

      <span className="flex flex-col gap-0.5">
        <span className="font-bricolage text-[15px] font-bold text-pekat transition group-hover:text-rekah">
          {anak.namaAnak}
        </span>
        <span className="text-[12px] text-pekat/55">{formatUsia(usiaBulan)}</span>
        <span className="text-[11px] text-pekat/40">{rentang}</span>
      </span>
    </button>
  );
}

function KartuTambah({ onKlik }: { onKlik: () => void }) {
  return (
    <button
      type="button"
      onClick={onKlik}
      className="group flex w-[150px] flex-col items-center gap-3 rounded-3xl p-3 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah focus-visible:ring-offset-2 sm:w-[168px]"
    >
      <span
        className="flex h-[110px] w-[110px] items-center justify-center border-4 border-dashed border-mawar bg-white transition group-hover:border-rekah sm:h-[128px] sm:w-[128px]"
        style={{ borderRadius: '70% 70% 70% 8px' }}
      >
        <Plus className="h-9 w-9 text-rekah/60 transition group-hover:text-rekah" aria-hidden />
      </span>
      <span className="font-bricolage text-[15px] font-bold text-pekat/60 transition group-hover:text-rekah">
        Tambah anak
      </span>
    </button>
  );
}

export interface PilihAnakProps {
  onTambahAnak: () => void;
}

export default function PilihAnak({ onTambahAnak }: PilihAnakProps) {
  const { daftarAnak, pilihAnak } = useAnak();

  // Sapaan diambil dari anak pertama yang punya pendamping terisi. Pendamping
  // tersimpan per anak, dan di layar ini belum ada anak yang dipilih.
  const anakBerpendamping = daftarAnak.find(a => a.pendamping.length > 0);
  const panggilan = anakBerpendamping ? sapaanPendamping(anakBerpendamping.pendamping) : null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-kanvas px-5 py-12">
      <div className="mb-10 text-center">
        <p className="font-caveat text-[1.4rem] text-pekat/60">
          {panggilan ? `Halo, ${panggilan}` : 'Halo'}
        </p>
        <h1 className="mt-1 font-bricolage text-[1.7rem] font-extrabold text-pekat sm:text-[2rem]">
          Hari ini menemani siapa?
        </h1>
        <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-pekat/55">
          Setiap anak punya musim tumbuhnya sendiri, jadi isi berandanya berbeda.
        </p>
      </div>

      <div className="flex flex-wrap items-start justify-center gap-2 sm:gap-4">
        {daftarAnak.map(anak => (
          <KartuAnak key={anak.id} anak={anak} onPilih={() => pilihAnak(anak.id)} />
        ))}
        <KartuTambah onKlik={onTambahAnak} />
      </div>

      {daftarAnak.length > 0 && (
        <p className="mt-10 max-w-sm text-center text-[12px] leading-relaxed text-pekat/40">
          Bisa berpindah anak kapan saja lewat menu di dashboard.
        </p>
      )}
    </div>
  );
}

/**
 * Chip anak aktif — mengembalikan ke layar Pilih Anak.
 *
 * Dulu disembunyikan sampai ada dua anak. Itu menutup satu-satunya jalan menuju
 * layar Pilih Anak, dan kartu "Tambah anak" hanya ada di sana — sehingga orang
 * tua dengan satu anak tidak pernah bisa menambah anak kedua. Kini muncul sejak
 * satu anak; karena tombolnya memang menampilkan nama dan foto anak aktif, ia
 * terbaca wajar sebagai chip profil, bukan sebagai pengalih yang tak berguna.
 */
export function TombolGantiAnak({ className = '' }: { className?: string }) {
  const { anakAktif, lepasAnakAktif } = useAnak();
  const foto = useFotoAnak(anakAktif?.fotoPath ?? null);

  if (!anakAktif) return null;

  return (
    <button
      type="button"
      onClick={lepasAnakAktif}
      style={RADIUS_KELOPAK}
      className={`flex min-h-[36px] items-center gap-2 border border-mawar bg-white px-3 text-[12px] font-semibold text-pekat/70 transition hover:border-rekah hover:text-rekah focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah ${className}`}
    >
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden bg-rekah text-[10px] font-bold text-white"
        style={{ borderRadius: '70% 70% 70% 4px' }}
      >
        {foto ? (
          <img src={foto} alt="" className="h-full w-full object-cover" />
        ) : (
          inisialAnak(anakAktif.namaAnak)
        )}
      </span>
      {anakAktif.namaAnak}
      <span className="text-pekat/40">Ganti</span>
    </button>
  );
}
