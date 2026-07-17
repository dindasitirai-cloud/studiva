import React, { useState } from 'react';
import { CatatanPendamping } from '../types';
import { COPY_ADMIN } from '../voiceGuide';
import { mockCatatan } from '../mockData';
import { relativeTime } from '../../../pages/DashboardPages/Tier2/relativeTime';
import { NotebookPen } from 'lucide-react';

// TODO: Fase 2 — catatan ini tampil sebagai layer di Jurnal Perkembangan
// dan ikut dalam ekspor Rekam Tumbuh Kembang PDF.

interface CatatanPendampingPanelProps {
  childId: string;
  childName: string;
}

function generateId() {
  return `cat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function CatatanPendampingPanel({ childId, childName }: CatatanPendampingPanelProps) {
  // TODO: inisialisasi dari API — query catatan by childId
  const [catatan, setCatatan] = useState<CatatanPendamping[]>(
    mockCatatan.filter((c) => c.childId === childId),
  );
  const [formValue, setFormValue] = useState('');
  const [authorName, setAuthorName] = useState('Kak Sari');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = formValue.trim();
    if (!trimmed) return;

    const newCatatan: CatatanPendamping = {
      id: generateId(),
      childId,
      authorName: authorName.trim() || 'Pendamping',
      body: trimmed,
      createdAt: new Date().toISOString(),
    };

    // TODO: kirim ke backend sebelum update state lokal
    setCatatan((prev) => [newCatatan, ...prev]);
    setFormValue('');
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <NotebookPen className="h-4 w-4 text-stv-muted" strokeWidth={2} />
        <h3 className="text-[14px] font-bold text-stv-navy">Catatan Pendamping</h3>
        <span className="rounded-full bg-stv-border px-2 py-0.5 text-[11px] text-stv-muted">
          Privat
        </span>
      </div>

      {/* Form tambah catatan */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-stv-border bg-white p-3 shadow-sm"
      >
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
          {COPY_ADMIN.catatanReminder}
        </p>
        <textarea
          rows={3}
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder={COPY_ADMIN.catatanPlaceholder}
          className="w-full resize-none text-[13px] text-stv-navy placeholder:text-stv-muted-2 focus:outline-none"
        />
        <div className="mt-2 flex items-center justify-between gap-2">
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Nama penulis"
            className="flex-1 rounded-lg border border-stv-border px-2.5 py-1.5 text-[12px] text-stv-navy focus:border-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!formValue.trim()}
            className="rounded-lg bg-stv-navy px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-stv-navy/90 disabled:opacity-40"
          >
            {COPY_ADMIN.catatanKirim}
          </button>
        </div>
      </form>

      {/* Daftar catatan — terbaru di atas */}
      {catatan.length === 0 ? (
        <p className="text-[13px] text-stv-muted">{COPY_ADMIN.catatanEmpty}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {catatan.map((c) => (
            <div key={c.id} className="rounded-xl border border-stv-border bg-slate-50 p-3">
              <p className="text-[13px] leading-relaxed text-stv-navy">{c.body}</p>
              <p className="mt-1.5 text-[11px] text-stv-muted">
                {c.authorName} &middot; {relativeTime(c.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
