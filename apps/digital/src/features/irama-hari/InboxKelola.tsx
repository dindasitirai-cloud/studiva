// =============================================================
// InboxKelola — tab "Inbox" di Kelola (Phase 15 · Tahap 4).
// Penampung to-do dari seluruh Rekah (Anak/Caregiver/Rumah/Bantu/manual).
// Data dibaca dari store bersama (inboxData) agar sinkron dengan kartu
// "Untuk Dikelola" di panel Hari Ini. Tanpa skor. Copy DRAFT — Fitri.
// =============================================================
import React, { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { useAnak } from '../../context/AnakContext';
import { useInboxStore, SUMBER } from './inboxData';

export default function InboxKelola() {
  const { anakAktif } = useAnak();
  const idAnak = anakAktif?.id ?? 'anon';
  const { todo, rampung, done, toggle, tambah } = useInboxStore(idAnak);
  const [teks, setTeks] = useState('');
  const [seg, setSeg] = useState<'todo' | 'done'>('todo');

  const submit = () => { const j = teks.trim(); if (!j) return; tambah(j); setTeks(''); };
  const tampil = seg === 'todo' ? todo : rampung;

  return (
    <div className="max-w-[720px]">
      <div className="mb-3.5 flex gap-2">
        <button type="button" onClick={() => setSeg('todo')} className={['rounded-full px-4 py-2 font-nunito text-[12.5px] font-extrabold', seg === 'todo' ? 'bg-rekah text-white' : 'border border-rekah/15 bg-white text-pekat/55'].join(' ')}>Untuk Dikelola <span className="ml-1 rounded-full bg-white/25 px-1.5">{todo.length}</span></button>
        <button type="button" onClick={() => setSeg('done')} className={['rounded-full px-4 py-2 font-nunito text-[12.5px] font-extrabold', seg === 'done' ? 'bg-rekah text-white' : 'border border-rekah/15 bg-white text-pekat/55'].join(' ')}>Selesai <span className="ml-1 rounded-full bg-black/5 px-1.5">{rampung.length}</span></button>
      </div>

      {seg === 'todo' && (
        <div className="mb-4 flex items-center gap-2 rounded-[14px] border border-dashed border-rekah/35 bg-white px-3 py-2">
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[9px] bg-fajar text-rekah-tua"><Plus className="h-4 w-4" strokeWidth={2.6} /></span>
          <input value={teks} onChange={e => setTeks(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') submit(); }}
            placeholder="Tambah hal untuk dikelola…" className="flex-1 bg-transparent font-nunito text-[13px] font-semibold text-pekat placeholder:text-pekat/40 focus:outline-none" />
          {teks.trim() && <button type="button" onClick={submit} className="rounded-[10px] bg-rekah px-3 py-1.5 font-nunito text-[12px] font-extrabold text-white">Tambah</button>}
        </div>
      )}

      {tampil.length === 0 ? (
        <div className="rounded-[16px] border border-pekat/8 bg-white px-5 py-8 text-center font-nunito text-[13px] font-semibold text-pekat/50">{seg === 'todo' ? 'Semua sudah dikelola.' : 'Belum ada yang selesai.'}</div>
      ) : tampil.map(i => {
        const s = SUMBER[i.src]; const d = done.has(i.id);
        return (
          <button key={i.id} type="button" onClick={() => toggle(i.id)} className="mb-2.5 flex w-full items-center gap-3 rounded-[15px] border border-pekat/8 bg-white px-4 py-3 text-left transition hover:shadow-[0_8px_20px_-12px_rgba(110,59,87,.5)]">
            <span className={['flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-[7px] border-2', d ? 'border-daun bg-daun text-white' : 'border-rose-soft bg-white text-transparent'].join(' ')}><Check className="h-3.5 w-3.5" strokeWidth={3} /></span>
            <span className="min-w-0 flex-1">
              <span className={['block font-nunito text-[14px] font-extrabold leading-tight', d ? 'text-pekat/45 line-through' : 'text-pekat'].join(' ')}>{i.judul}</span>
              {i.ket && <span className="font-nunito text-[12px] text-pekat/55">{i.ket}</span>}
            </span>
            <span className="flex flex-shrink-0 items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-pucuk px-2.5 py-1 font-nunito text-[10.5px] font-extrabold text-pekat/65"><span className="h-2 w-2 rounded-full" style={{ background: s.warna }} />{s.label}</span>
              {i.due && <span className="font-nunito text-[11px] font-extrabold text-pekat/45">{i.due}</span>}
            </span>
          </button>
        );
      })}

      <p className="mt-2 font-nunito text-[11px] text-pekat/45">Item contoh berasal dari Kehidupan Keluarga/Bantu; item yang kamu tambah tersimpan di perangkat ini (localStorage) — sinkron ke akun menyusul.</p>
    </div>
  );
}
