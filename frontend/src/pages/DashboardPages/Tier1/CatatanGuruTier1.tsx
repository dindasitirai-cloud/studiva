import React, { useState } from 'react';
import { Send, MessageSquarePlus, AlertTriangle, Clock, CheckCircle2, Eye } from 'lucide-react';
import { useDashboardTier1, ParentNoteCategory, ParentNoteUrgency } from './DashboardTier1Context';

const CATEGORY_META: Record<ParentNoteCategory, { label: string; text: string; bg: string; chipActive: string }> = {
  kesehatan: { label: 'Kesehatan', text: 'text-rose-600', bg: 'bg-rose-50', chipActive: 'bg-rose-500 text-white' },
  emosi: { label: 'Emosi', text: 'text-purple-600', bg: 'bg-purple-50', chipActive: 'bg-purple-500 text-white' },
  permintaan: { label: 'Permintaan', text: 'text-amber-600', bg: 'bg-amber-50', chipActive: 'bg-amber-500 text-white' },
  'info-umum': { label: 'Info Umum', text: 'text-teal-600', bg: 'bg-teal-50', chipActive: 'bg-teal-500 text-white' },
};

const URGENCY_META: Record<ParentNoteUrgency, { label: string; text: string; bg: string } | null> = {
  normal: null,
  penting: { label: 'Penting', text: 'text-orange-600', bg: 'bg-orange-50' },
  mendesak: { label: 'Mendesak', text: 'text-red-600', bg: 'bg-red-50' },
};

function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

export default function CatatanGuruTier1() {
  const { parentNotes, addParentNote } = useDashboardTier1();

  const [date, setDate] = useState(todayISODate());
  const [category, setCategory] = useState<ParentNoteCategory | ''>('');
  const [message, setMessage] = useState('');
  const [urgency, setUrgency] = useState<ParentNoteUrgency>('normal');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category) { setError('Pilih kategori catatan terlebih dahulu.'); return; }
    if (!message.trim()) { setError('Tulis pesan untuk guru.'); return; }
    setError('');
    addParentNote({ date, category, message: message.trim(), urgency });
    setSuccess(true);
    setCategory('');
    setMessage('');
    setUrgency('normal');
    setDate(todayISODate());
  }

  return (
    <div className="mx-auto flex max-w-[680px] flex-col gap-6">
      <div>
        <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">Catatan untuk Guru</h2>
        <p className="text-[14px] text-stv-muted">Bagikan hal yang perlu jadi perhatian guru - kami percaya kemitraan orang tua dan sekolah membantu anak berkembang lebih baik.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
        <h3 className="flex items-center gap-2 font-baloo text-[16px] font-bold text-stv-navy">
          <MessageSquarePlus className="h-4 w-4 text-teal-600" />
          Tulis Catatan Baru
        </h3>

        <div>
          <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Tanggal</label>
          <input
            type="date"
            value={date}
            max={todayISODate()}
            onChange={e => setDate(e.target.value)}
            className="w-full rounded-xl border border-teal-100 px-4 py-2.5 text-[15px] focus:border-teal-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-[13px] font-semibold text-stv-navy">Kategori</label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CATEGORY_META) as ParentNoteCategory[]).map(cat => {
              const meta = CATEGORY_META[cat];
              const active = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  aria-pressed={active}
                  className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
                    active ? meta.chipActive : `${meta.bg} ${meta.text} hover:opacity-80`
                  }`}
                >
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Pesan</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={4}
            placeholder="mis. Semalam tidur larut karena ada acara keluarga, mungkin lebih mudah lelah hari ini..."
            className="w-full resize-none rounded-xl border border-teal-100 px-4 py-2.5 text-[15px] focus:border-teal-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-[13px] font-semibold text-stv-navy">Tingkat Urgensi</label>
          <div className="flex gap-2">
            {(['normal', 'penting', 'mendesak'] as ParentNoteUrgency[]).map(u => (
              <button
                key={u}
                type="button"
                onClick={() => setUrgency(u)}
                aria-pressed={urgency === u}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold capitalize transition ${
                  urgency === u ? 'bg-teal-500 text-white' : 'bg-teal-50 text-teal-600 hover:opacity-80'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-[13px] text-red-500">{error}</p>}
        {success && (
          <p className="flex items-center gap-1.5 rounded-xl bg-teal-50 px-4 py-3 text-[13px] text-teal-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Catatan terkirim ke guru. Terima kasih sudah berbagi!
          </p>
        )}

        <button
          type="submit"
          className="flex items-center justify-center gap-1.5 self-end rounded-full bg-teal-500 px-6 py-2.5 font-baloo text-[14px] font-bold text-white transition hover:bg-teal-600"
        >
          <Send className="h-4 w-4" />
          Kirim ke Guru
        </button>
      </form>

      {/* Timeline catatan terkirim */}
      <div>
        <h3 className="mb-3 font-baloo text-[16px] font-bold text-stv-navy">Catatan Terkirim</h3>

        {parentNotes.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-teal-200 py-14 text-center">
            <MessageSquarePlus className="h-10 w-10 text-teal-300" strokeWidth={1.5} />
            <p className="mt-3 font-semibold text-stv-navy">Belum ada catatan terkirim</p>
            <p className="mt-1 text-[13px] text-stv-muted">Catatan yang Anda kirim ke guru akan muncul di sini.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {parentNotes.map(note => {
              const catMeta = CATEGORY_META[note.category];
              const urgencyMeta = URGENCY_META[note.urgency];
              return (
                <div key={note.id} className="animate-fade-in-up flex flex-col gap-2 rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`w-fit rounded-full px-2.5 py-0.5 text-[11px] font-bold ${catMeta.bg} ${catMeta.text}`}>{catMeta.label}</span>
                      {urgencyMeta && (
                        <span className={`flex w-fit items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${urgencyMeta.bg} ${urgencyMeta.text}`}>
                          <AlertTriangle className="h-3 w-3" />
                          {urgencyMeta.label}
                        </span>
                      )}
                    </div>
                    <span className="text-[12px] text-stv-muted">
                      {new Date(note.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>

                  <p className="text-[14px] leading-[1.6] text-stv-body">{note.message}</p>

                  <span className={`flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    note.readByTeacher ? 'bg-stv-green-tint text-stv-green' : 'bg-stv-sky-tint text-stv-sky-stroke'
                  }`}>
                    {note.readByTeacher ? <Eye className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    {note.readByTeacher ? 'Sudah Dibaca Guru' : 'Terkirim'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
