// =============================================================
// DaftarDikelola — jendela "Lihat semua" dari kartu Untuk Dikelola (Kelola ·
// Irama Keseharian). Menggantikan tab Inbox (2026-10-27): data tetap dari
// store bersama (inboxData + rencana "kelola" hari ini), hanya pintunya pindah.
// Dua bagian: Belum ditandai di atas, Sudah ditandai di bawah. Mencentang
// sebuah item langsung memindahkannya ke bagian bawah (dan sebaliknya).
// =============================================================
import React, { useEffect, useRef, useState } from 'react';
import { Check, Plus, X } from 'lucide-react';

export interface ItemDikelola {
  id: string;
  judul: string;
  ket?: string;
  sumber?: { label: string; warna: string };
  due?: string;
  /** YYYY-MM-DD; kosong bila tidak tercatat. Hanya untuk item yang sudah ditandai. */
  selesaiPada?: string;
}

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const tglPendek = (iso?: string) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return '';
  return `${d} ${BULAN[m - 1]}`;
};

const GAYA = `
@keyframes ddMasuk{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
@keyframes ddMuncul{from{opacity:0}to{opacity:1}}
@keyframes ddNaik{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
.dd-baris{animation:ddMasuk .28s ease-out both}
.dd-latar{animation:ddMuncul .18s ease-out both}
.dd-panel{animation:ddNaik .24s cubic-bezier(.2,.7,.2,1) both}
@media (prefers-reduced-motion: reduce){.dd-baris,.dd-latar,.dd-panel{animation:none}}
`;

function Baris({ it, sudah, onToggle }: { it: ItemDikelola; sudah: boolean; onToggle: () => void }) {
  return (
    <li className="dd-baris">
      <button
        type="button"
        role="checkbox"
        aria-checked={sudah}
        onClick={onToggle}
        className={`flex w-full items-start gap-3 rounded-[16px] px-3.5 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah ${
          sudah ? 'bg-[#FBF3F8]' : 'bg-white shadow-[0_10px_22px_-20px_rgba(90,50,70,.8)] hover:bg-[#FFF9FC]'
        }`}
      >
        <span
          aria-hidden
          className={`mt-0.5 flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full border-2 ${
            sudah ? 'border-[#5F84E6] bg-[#5F84E6]' : 'border-[#C9D8F5] bg-white'
          }`}
        >
          <Check className={`h-3 w-3 text-white ${sudah ? 'opacity-100' : 'opacity-0'}`} strokeWidth={3.6} />
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block font-nunito text-[15px] font-bold leading-snug ${sudah ? 'text-[#A98BA0] line-through' : 'text-pekat'}`}>{it.judul}</span>
          {it.ket && !sudah && <span className="mt-0.5 block font-nunito text-[13px] font-semibold leading-snug text-[#8A5A74]">{it.ket}</span>}
          {(it.sumber || it.due || (sudah && it.selesaiPada)) && (
            <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {it.sumber && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F7EEF5] px-2.5 py-0.5 font-nunito text-[12px] font-extrabold text-[#8A5A74]">
                  <span className="h-2 w-2 rounded-full" style={{ background: it.sumber.warna }} />{it.sumber.label}
                </span>
              )}
              {it.due && !sudah && <span className="font-nunito text-[12px] font-extrabold text-[#8A5A74]">{it.due}</span>}
              {sudah && it.selesaiPada && <span className="font-nunito text-[12px] font-bold text-[#A98BA0]">Selesai {tglPendek(it.selesaiPada)}</span>}
            </span>
          )}
        </span>
      </button>
    </li>
  );
}

export default function DaftarDikelola({
  belum,
  sudah,
  onToggle,
  onTambah,
  onTutup,
}: {
  belum: ItemDikelola[];
  sudah: ItemDikelola[];
  onToggle: (id: string) => void;
  onTambah: (judul: string) => void;
  onTutup: () => void;
}) {
  const [teks, setTeks] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  // Fokus ke jendela, kunci gulir halaman, Esc untuk menutup, fokus kembali saat ditutup.
  useEffect(() => {
    const sebelum = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onTutup(); return; }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const fokus = panelRef.current.querySelectorAll<HTMLElement>('button, input');
      if (!fokus.length) return;
      const awal = fokus[0], akhir = fokus[fokus.length - 1];
      if (e.shiftKey && document.activeElement === awal) { e.preventDefault(); akhir.focus(); }
      else if (!e.shiftKey && document.activeElement === akhir) { e.preventDefault(); awal.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = overflow; sebelum?.focus?.(); };
  }, [onTutup]);

  const submit = () => { const j = teks.trim(); if (!j) return; onTambah(j); setTeks(''); };
  const total = belum.length + sudah.length;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6">
      <style>{GAYA}</style>
      <div className="dd-latar absolute inset-0 bg-[rgba(74,38,58,.45)]" onClick={onTutup} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dd-judul"
        tabIndex={-1}
        className="dd-panel relative outline-none flex max-h-[88vh] w-full flex-col overflow-hidden rounded-t-[28px] bg-[#FFFBF2] shadow-[0_30px_60px_-30px_rgba(74,38,58,.6)] sm:max-w-[560px] sm:rounded-[28px]"
      >
        {/* Kepala */}
        <div className="flex items-start justify-between gap-3 border-b border-[#F3E4EC] px-5 pb-4 pt-5 sm:px-6">
          <div className="min-w-0">
            <h2 id="dd-judul" className="font-fredoka text-[22px] font-semibold leading-tight text-pekat">Untuk Dikelola</h2>
            <p className="mt-1 font-nunito text-[13.5px] font-semibold text-[#8A5A74]">
              {sudah.length} dari {total} sudah ditandai
            </p>
          </div>
          <button
            type="button"
            onClick={onTutup}
            aria-label="Tutup"
            className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-white text-pekat shadow-[0_8px_18px_-14px_#6E3B57] transition hover:bg-[#FCE3EE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah"
          >
            <X className="h-[18px] w-[18px]" strokeWidth={2.4} />
          </button>
        </div>

        {/* Isi bergulir */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 pt-4 sm:px-6">
          <div className="flex items-center gap-2 rounded-[14px] border-[1.5px] border-dashed border-[#F4B4D2] bg-white px-3 py-1.5">
            <Plus className="h-4 w-4 flex-none text-[#C6407F]" strokeWidth={2.6} aria-hidden />
            <label htmlFor="dd-tambah" className="sr-only">Tambah hal untuk dikelola</label>
            <input
              id="dd-tambah"
              value={teks}
              onChange={e => setTeks(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submit(); }}
              placeholder="Tambah hal untuk dikelola…"
              className="h-10 min-w-0 flex-1 bg-transparent font-nunito text-[14px] font-bold text-pekat placeholder:text-[#B98CA3] focus:outline-none"
            />
            {teks.trim() && (
              <button type="button" onClick={submit} className="h-9 flex-none rounded-[10px] bg-[#C6407F] px-3.5 font-nunito text-[13px] font-extrabold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rekah">
                Tambah
              </button>
            )}
          </div>

          <section aria-labelledby="dd-belum" className="mt-5">
            <h3 id="dd-belum" className="mb-2.5 flex items-center gap-2 font-nunito text-[13px] font-extrabold uppercase tracking-[.08em] text-[#B4477F]">
              Belum ditandai <span className="rounded-full bg-[#FCE3EE] px-2 py-0.5 text-[12px] tracking-normal">{belum.length}</span>
            </h3>
            {belum.length === 0 ? (
              <p className="rounded-[16px] bg-white px-4 py-5 text-center font-nunito text-[14px] font-semibold text-[#8A5A74]">Semua sudah dikelola.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {belum.map(it => <Baris key={`b-${it.id}`} it={it} sudah={false} onToggle={() => onToggle(it.id)} />)}
              </ul>
            )}
          </section>

          <section aria-labelledby="dd-sudah" className="mt-6">
            <h3 id="dd-sudah" className="mb-2.5 flex items-center gap-2 font-nunito text-[13px] font-extrabold uppercase tracking-[.08em] text-[#5F84E6]">
              Sudah ditandai <span className="rounded-full bg-[#DCEAFD] px-2 py-0.5 text-[12px] tracking-normal">{sudah.length}</span>
            </h3>
            {sudah.length === 0 ? (
              <p className="rounded-[16px] bg-white/70 px-4 py-5 text-center font-nunito text-[14px] font-semibold text-[#A98BA0]">Belum ada yang ditandai.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {sudah.map(it => <Baris key={`s-${it.id}`} it={it} sudah onToggle={() => onToggle(it.id)} />)}
              </ul>
            )}
          </section>

          <p className="mt-5 font-nunito text-[12.5px] font-semibold leading-relaxed text-[#A98BA0]">
            Ketuk lagi item yang sudah ditandai untuk mengembalikannya. Yang selesai juga tercatat di Jurnal.
          </p>
        </div>
      </div>
    </div>
  );
}
