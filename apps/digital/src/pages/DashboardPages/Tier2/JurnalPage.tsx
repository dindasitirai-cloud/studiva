// TODO: pulihkan mekanik buku 3D dari _parked/jurnal/ setelah MVP
// Saat ini: daftar entri + tulis entri baru (desain Rekah, data privat per anak)

import React, { useState } from 'react';
import { NILAI_REKAH, type NilaiId } from '@studiva/shared';
import { useJurnalRekah, type EntriJurnalRekah } from '../../../context/JurnalRekahContext';
import { useRekahProfile } from '../../../context/RekahProfileContext';
import Kelopak from '../../../components/Kelopak';
import { BookOpen, Plus, X } from 'lucide-react';

// ── Form tulis entri baru ──────────────────────────────────────────────────

function TulisEntriModal({ onClose }: { onClose: () => void }) {
  const { addEntri } = useJurnalRekah();
  const [judul, setJudul] = useState('');
  const [catatan, setCatatan] = useState('');
  const [nilaiId, setNilaiId] = useState<NilaiId | ''>('');

  function handleSimpan() {
    if (!judul.trim() || !catatan.trim()) return;
    const entri: EntriJurnalRekah = {
      id: `jurnal-manual-${Date.now()}`,
      judul: judul.trim(),
      catatan: catatan.trim(),
      tanggal: new Date().toISOString().split('T')[0],
      nilaiId: nilaiId || undefined,
      tag: 'manual',
    };
    addEntri(entri);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-pekat/40"
      role="dialog"
      aria-modal="true"
      aria-label="Tulis catatan baru"
    >
      <div className="w-full max-w-lg rounded-t-[28px] bg-white px-5 pb-10 pt-6 shadow-[0_-8px_40px_rgba(224,82,107,0.14)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bricolage text-[1.1rem] font-extrabold text-pekat">
            Tulis momen baru
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-fajar text-pekat/50 hover:text-rekah focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <input
          type="text"
          placeholder="Judul momen…"
          value={judul}
          onChange={e => setJudul(e.target.value)}
          className="mb-3 w-full rounded-[12px] border border-fajar bg-kanvas px-4 py-3 text-[14px] text-pekat/80 placeholder:text-pekat/30 focus:border-rekah/40 focus:outline-none focus:ring-2 focus:ring-rekah/20"
        />

        <textarea
          placeholder="Ceritakan sesukamu…"
          value={catatan}
          onChange={e => setCatatan(e.target.value)}
          rows={4}
          className="mb-3 w-full resize-none rounded-[12px] border border-fajar bg-kanvas px-4 py-3 font-caveat text-[16px] text-pekat/80 placeholder:text-pekat/30 focus:border-rekah/40 focus:outline-none focus:ring-2 focus:ring-rekah/20"
        />

        {/* Nilai chip opsional */}
        <div className="mb-5 flex flex-wrap gap-2">
          {NILAI_REKAH.map(n => (
            <button
              key={n.id}
              type="button"
              onClick={() => setNilaiId(nilaiId === n.id ? '' : n.id as NilaiId)}
              className={`rounded-full px-3 py-1 text-[12px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah ${
                nilaiId === n.id
                  ? 'ring-2 ring-offset-1'
                  : 'opacity-60 hover:opacity-90'
              }`}
              style={{
                background: `${n.warna}22`,
                color: n.warna,
                ...(nilaiId === n.id ? { ringColor: n.warna } : {}),
              }}
            >
              {n.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={!judul.trim() || !catatan.trim()}
          onClick={handleSimpan}
          className="flex min-h-[44px] w-full items-center justify-center rounded-[12px] bg-rekah text-[14px] font-bold text-white transition hover:bg-rekah-tua disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
        >
          Simpan momen
        </button>
      </div>
    </div>
  );
}

// ── JurnalPage ─────────────────────────────────────────────────────────────

export default function JurnalPage() {
  const { profile } = useRekahProfile();
  const { entri } = useJurnalRekah();
  const [showForm, setShowForm] = useState(false);

  const namaAnak = profile?.anak.namaPanggilan ?? 'si kecil';

  const TAG_LABEL: Record<string, string> = {
    refleksi: 'Dari Langkah Kecil',
    'penutup-musim': 'Penutup Musim',
    manual: 'Catatan',
  };

  return (
    <div className="relative min-h-[calc(100vh-60px)] overflow-hidden bg-kanvas">
      <Kelopak
        aria-hidden
        rotate={90}
        className="pointer-events-none absolute -right-12 -top-8 h-44 w-44 bg-fajar opacity-40"
      />

      <div className="relative z-10 mx-auto max-w-lg px-4 py-6 sm:px-0 sm:py-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-rekah" strokeWidth={2} />
              <h1 className="font-bricolage text-[1.35rem] font-extrabold text-pekat">
                Jurnal {namaAnak}
              </h1>
            </div>
            <p className="text-[13px] text-pekat/50">
              Momen dan catatan privat keluargamu.
            </p>
            {/* TODO: pulihkan mekanik buku 3D dari _parked/jurnal/ */}
          </div>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            aria-label="Tulis catatan baru"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-[12px] bg-rekah px-4 text-[13px] font-bold text-white transition hover:bg-rekah-tua focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Tulis
          </button>
        </div>

        {/* Entri list */}
        {entri.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="text-[2rem]" aria-hidden>📖</p>
            <p className="mt-3 text-[14px] text-pekat/45">
              Jurnalmu masih kosong. Mulai tulis momen pertama, atau selesaikan
              Langkah Kecil dan tandai "Simpan ke Jurnal".
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {entri.map(e => {
              const nilai = NILAI_REKAH.find(n => n.id === e.nilaiId);
              return (
                <article
                  key={e.id}
                  className="rounded-[18px] bg-white p-5 shadow-[0_4px_16px_rgba(224,82,107,0.07)]"
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-pekat/40">{e.tanggal}</span>
                    {e.tag && (
                      <span className="rounded-full bg-fajar px-2.5 py-0.5 text-[11px] font-semibold text-rekah/80">
                        {TAG_LABEL[e.tag] ?? e.tag}
                      </span>
                    )}
                    {nilai && (
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                        style={{ background: `${nilai.warna}22`, color: nilai.warna }}
                      >
                        {nilai.label}
                      </span>
                    )}
                  </div>
                  <h3 className="mb-1.5 font-bricolage text-[15px] font-bold text-pekat">
                    {e.judul}
                  </h3>
                  <p className="font-caveat text-[15px] leading-relaxed text-pekat/70">
                    {e.catatan}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {showForm && <TulisEntriModal onClose={() => setShowForm(false)} />}
    </div>
  );
}
