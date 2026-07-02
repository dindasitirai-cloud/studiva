import React, { useMemo, useState } from 'react';
import {
  AlertTriangle, AlertCircle, Info, MessageSquare, CheckCircle2, Save, Heart,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import { useGuru, ParentNoteCategory, ParentNoteUrgency } from './GuruContext';

const URGENCY_META: Record<ParentNoteUrgency, { label: string; icon: typeof AlertTriangle; bg: string; border: string; text: string; badge: string }> = {
  mendesak: { label: 'Mendesak', icon: AlertTriangle, bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', badge: 'bg-red-500 text-white' },
  penting:  { label: 'Penting',  icon: AlertCircle,   bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', badge: 'bg-amber-400 text-white' },
  normal:   { label: 'Normal',   icon: Info,          bg: 'bg-white',    border: 'border-stv-border',  text: 'text-stv-body',  badge: 'bg-teal-100 text-teal-700' },
};

const CATEGORY_META: Record<ParentNoteCategory, { label: string; bg: string; text: string }> = {
  kesehatan:  { label: 'Kesehatan',  bg: 'bg-rose-50',   text: 'text-rose-600'   },
  emosi:      { label: 'Emosi',      bg: 'bg-purple-50', text: 'text-purple-600' },
  permintaan: { label: 'Permintaan', bg: 'bg-amber-50',  text: 'text-amber-700'  },
  'info-umum':{ label: 'Info Umum',  bg: 'bg-teal-50',   text: 'text-teal-700'   },
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' });
}

function NoteCard({ note, studentName, expandedId, setExpandedId, responseText, setResponseText, onMarkRead, onSaveResponse }: {
  note: ReturnType<typeof useGuru>['parentNotes'][0];
  studentName: string;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  responseText: Record<string, string>;
  setResponseText: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onMarkRead: (id: string) => void;
  onSaveResponse: (id: string) => void;
}) {
  const urgMeta = URGENCY_META[note.urgency];
  const catMeta = CATEGORY_META[note.category];
  const UrgIcon = urgMeta.icon;
  const isExpanded = expandedId === note.id;
  const draft = responseText[note.id] ?? '';

  return (
    <div className={`rounded-2xl border-2 shadow-[0_4px_16px_rgba(16,58,107,.06)] transition ${
      !note.readByTeacher ? `${urgMeta.border} ${urgMeta.bg}` : 'border-stv-border bg-white'
    }`}>
      {/* Card summary row */}
      <div className="flex flex-wrap items-start gap-2 p-4">
        {/* Badges */}
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-bold text-teal-700">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-600 text-[9px] font-bold text-white">
              {studentName.charAt(0)}
            </span>
            {studentName}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${catMeta.bg} ${catMeta.text}`}>{catMeta.label}</span>
          <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${urgMeta.badge}`}>
            <UrgIcon className="h-3 w-3" />{urgMeta.label}
          </span>
          <span className="text-[12px] text-stv-muted">{relativeTime(note.date)}</span>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Explicit mark-as-read button (only for unread) */}
          {!note.readByTeacher && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onMarkRead(note.id); }}
              className="flex items-center gap-1 rounded-full border border-stv-green bg-stv-green-tint px-3 py-1 text-[11px] font-bold text-stv-green transition hover:bg-stv-green hover:text-white"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Tandai Sudah Dibaca
            </button>
          )}
          {note.readByTeacher && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-stv-green">
              <CheckCircle2 className="h-3.5 w-3.5" />Sudah dibaca
            </span>
          )}
          {/* Expand toggle */}
          <button
            type="button"
            onClick={() => setExpandedId(isExpanded ? null : note.id)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-stv-muted transition hover:bg-slate-100"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Message preview (always visible, clickable to expand) */}
      <button
        type="button"
        onClick={() => setExpandedId(isExpanded ? null : note.id)}
        className={`w-full px-4 pb-4 text-left text-[14px] leading-[1.6] ${!note.readByTeacher ? urgMeta.text : 'text-stv-body'} ${!isExpanded ? 'line-clamp-2' : ''}`}
      >
        {note.message}
      </button>

      {/* Teacher response preview when collapsed */}
      {!isExpanded && note.teacherResponse && (
        <p className="flex items-start gap-1.5 px-4 pb-4 text-[12px] text-stv-muted">
          <Heart className="mt-0.5 h-3 w-3 shrink-0 text-teal-500" />
          <span className="line-clamp-1">Catatan internal: {note.teacherResponse}</span>
        </p>
      )}

      {/* Expanded section */}
      {isExpanded && (
        <div className="border-t border-stv-border/50 px-4 pb-5 pt-4">
          {note.teacherResponse && (
            <div className="mb-4 rounded-xl bg-teal-50 p-3.5">
              <p className="flex items-center gap-1.5 text-[12px] font-semibold text-teal-700">
                <Heart className="h-3.5 w-3.5" />Catatan Tindak Lanjut (Internal)
              </p>
              <p className="mt-1 text-[13px] text-stv-body">{note.teacherResponse}</p>
            </div>
          )}
          <label className="mb-1.5 block text-[12px] font-semibold text-stv-navy">
            {note.teacherResponse ? 'Perbarui' : 'Tambah'} Catatan Tindak Lanjut
            <span className="ml-1 font-normal text-stv-muted">(hanya terlihat oleh guru)</span>
          </label>
          <textarea
            value={draft || note.teacherResponse || ''}
            onChange={e => setResponseText(prev => ({ ...prev, [note.id]: e.target.value }))}
            rows={3}
            placeholder="Tulis tindak lanjut atau catatan internal..."
            className="w-full resize-none rounded-xl border border-stv-border px-4 py-2.5 text-[14px] focus:border-teal-400 focus:outline-none"
          />
          <div className="mt-2 flex items-center justify-between">
            {/* Mark as read from expanded view */}
            {!note.readByTeacher && (
              <button type="button" onClick={() => onMarkRead(note.id)}
                className="flex items-center gap-1 rounded-full border border-stv-green bg-stv-green-tint px-3 py-1.5 text-[12px] font-bold text-stv-green hover:bg-stv-green hover:text-white">
                <CheckCircle2 className="h-3.5 w-3.5" />Tandai Sudah Dibaca
              </button>
            )}
            <div className="ml-auto flex gap-2">
              <button type="button" onClick={() => setExpandedId(null)}
                className="rounded-full border border-stv-border px-4 py-1.5 text-[12px] font-semibold text-stv-body hover:bg-slate-50">
                Tutup
              </button>
              {draft.trim() && (
                <button type="button" onClick={() => onSaveResponse(note.id)}
                  className="flex items-center gap-1.5 rounded-full bg-teal-600 px-4 py-1.5 text-[12px] font-bold text-white hover:bg-teal-700">
                  <Save className="h-3.5 w-3.5" />Simpan
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CatatanOrangTuaGuru() {
  const { students, parentNotes, markParentNoteRead, addTeacherResponse } = useGuru();

  const [studentFilter, setStudentFilter] = useState('semua');
  const [categoryFilter, setCategoryFilter] = useState<ParentNoteCategory | 'semua'>('semua');
  const [urgencyFilter, setUrgencyFilter] = useState<ParentNoteUrgency | 'semua'>('semua');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState<Record<string, string>>({});
  const [readSectionOpen, setReadSectionOpen] = useState(false);

  const filtered = useMemo(() => {
    const order: Record<ParentNoteUrgency, number> = { mendesak: 0, penting: 1, normal: 2 };
    return [...parentNotes]
      .filter(n =>
        (studentFilter === 'semua' || n.studentId === studentFilter) &&
        (categoryFilter === 'semua' || n.category === categoryFilter) &&
        (urgencyFilter === 'semua' || n.urgency === urgencyFilter)
      )
      .sort((a, b) => order[a.urgency] - order[b.urgency] || new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [parentNotes, studentFilter, categoryFilter, urgencyFilter]);

  const unread = filtered.filter(n => !n.readByTeacher);
  const read = filtered.filter(n => n.readByTeacher);

  function handleMarkAllRead() {
    if (window.confirm(`Tandai semua ${unread.length} catatan belum dibaca sebagai sudah dibaca?`)) {
      unread.forEach(n => markParentNoteRead(n.id));
    }
  }

  function handleSaveResponse(noteId: string) {
    const text = responseText[noteId]?.trim();
    if (text) {
      addTeacherResponse(noteId, text);
      setResponseText(prev => ({ ...prev, [noteId]: '' }));
      setExpandedId(null);
    }
  }

  const noteCardProps = { expandedId, setExpandedId, responseText, setResponseText, onMarkRead: markParentNoteRead, onSaveResponse: handleSaveResponse };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">Catatan dari Orang Tua</h2>
        <p className="text-[14px] text-stv-muted">
          Pesan dari orang tua tentang kondisi anak, kemitraan guru dan orang tua untuk mendukung perkembangan terbaik.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <select value={studentFilter} onChange={e => setStudentFilter(e.target.value)}
          className="rounded-full border border-stv-border bg-white px-4 py-2 text-[13px] focus:border-teal-400 focus:outline-none">
          <option value="semua">Semua Siswa</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name.split(' ')[0]}</option>)}
        </select>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value as ParentNoteCategory | 'semua')}
          className="rounded-full border border-stv-border bg-white px-4 py-2 text-[13px] focus:border-teal-400 focus:outline-none">
          <option value="semua">Semua Kategori</option>
          {(Object.keys(CATEGORY_META) as ParentNoteCategory[]).map(k => (
            <option key={k} value={k}>{CATEGORY_META[k].label}</option>
          ))}
        </select>
        <select value={urgencyFilter} onChange={e => setUrgencyFilter(e.target.value as ParentNoteUrgency | 'semua')}
          className="rounded-full border border-stv-border bg-white px-4 py-2 text-[13px] focus:border-teal-400 focus:outline-none">
          <option value="semua">Semua Urgensi</option>
          <option value="mendesak">🔴 Mendesak</option>
          <option value="penting">🟡 Penting</option>
          <option value="normal">⚪ Normal</option>
        </select>
      </div>

      {/* ── BELUM DIBACA ─────────────────────────────────────────── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-baloo text-[16px] font-bold text-stv-navy">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[12px] font-bold text-white">
              {unread.length}
            </span>
            Belum Dibaca
          </h3>
          {unread.length > 1 && (
            <button type="button" onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 rounded-full bg-stv-green-tint px-3.5 py-1.5 text-[12px] font-bold text-stv-green hover:bg-stv-green hover:text-white transition">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Tandai Semua Sudah Dibaca
            </button>
          )}
        </div>

        {unread.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-stv-green-tint py-10 text-center">
            <CheckCircle2 className="h-9 w-9 text-stv-green" strokeWidth={1.5} />
            <p className="mt-2.5 font-semibold text-stv-navy">Semua catatan sudah dibaca</p>
            <p className="mt-0.5 text-[13px] text-stv-muted">Tidak ada catatan baru dari orang tua.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {unread.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                studentName={students.find(s => s.id === note.studentId)?.name.split(' ')[0] ?? '-'}
                {...noteCardProps}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── SUDAH DIBACA ─────────────────────────────────────────── */}
      {read.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setReadSectionOpen(o => !o)}
            className="mb-3 flex w-full items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100"
          >
            <h3 className="flex items-center gap-2 font-baloo text-[15px] font-bold text-stv-muted">
              <CheckCircle2 className="h-4 w-4 text-stv-green" />
              Sudah Dibaca
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-600">{read.length}</span>
            </h3>
            {readSectionOpen ? <ChevronUp className="h-4 w-4 text-stv-muted" /> : <ChevronDown className="h-4 w-4 text-stv-muted" />}
          </button>

          {readSectionOpen && (
            <div className="flex flex-col gap-3">
              {read.map(note => (
                <NoteCard
                  key={note.id}
                  note={note}
                  studentName={students.find(s => s.id === note.studentId)?.name.split(' ')[0] ?? '-'}
                  {...noteCardProps}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-teal-200 py-14 text-center">
          <MessageSquare className="h-10 w-10 text-teal-300" strokeWidth={1.5} />
          <p className="mt-3 font-semibold text-stv-navy">Tidak ada catatan yang cocok dengan filter ini</p>
        </div>
      )}

      <p className="flex items-center justify-center gap-2 text-[13px] text-stv-muted">
        <Heart className="h-4 w-4 text-teal-500" />
        Kemitraan guru dan orang tua adalah fondasi terbaik bagi tumbuh kembang anak.
      </p>
    </div>
  );
}
