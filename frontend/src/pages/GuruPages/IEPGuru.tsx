import React, { useState } from 'react';
import {
  Plus, Pencil, Trash2, CheckCircle2, AlertTriangle, Target, Users,
  CalendarDays, X, Save, History, RefreshCw,
} from 'lucide-react';
import {
  useGuru, IEPGuru as IEPData, IEPGoalGuru, IEPGoalTerm, IEPGoalStatus,
  PANGGILAN_GURU,
} from './GuruContext';
import { useAuth } from '../../context/AuthContext';

const TERM_META: Record<IEPGoalTerm, { label: string; bg: string; text: string }> = {
  'jangka-pendek': { label: 'Jangka Pendek', bg: 'bg-stv-sky-tint', text: 'text-stv-sky-stroke' },
  'jangka-panjang': { label: 'Jangka Panjang', bg: 'bg-indigo-50', text: 'text-indigo-600' },
};
const STATUS_META: Record<IEPGoalStatus, { label: string; icon: typeof CheckCircle2; bg: string; text: string; bar: string }> = {
  tercapai: { label: 'Tercapai', icon: CheckCircle2, bg: 'bg-stv-green-tint', text: 'text-stv-green', bar: 'bg-stv-green' },
  berjalan: { label: 'Berjalan', icon: RefreshCw, bg: 'bg-blue-50', text: 'text-blue-600', bar: 'bg-blue-600' },
  'perlu-perhatian': { label: 'Perlu Perhatian', icon: AlertTriangle, bg: 'bg-red-50', text: 'text-red-600', bar: 'bg-red-500' },
};

function todayISO() { return new Date().toISOString().slice(0, 10); }
function fmtDate(iso: string) { return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }); }

// --- Goal inline edit card ---
function GoalCard({ goal, onUpdate, onDelete }: {
  goal: IEPGoalGuru;
  onUpdate: (updates: Partial<Omit<IEPGoalGuru, 'id'>>) => void;
  onDelete: () => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState({ ...goal });
  const termMeta = TERM_META[goal.term];
  const statusMeta = STATUS_META[goal.status];
  const StatusIcon = statusMeta.icon;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
      {/* Header row */}
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${termMeta.bg} ${termMeta.text}`}>{termMeta.label}</span>
        <span className="rounded-full bg-stv-sky-tint px-2.5 py-0.5 text-[11px] font-bold text-stv-sky-stroke">{goal.areaFokus}</span>
        <span className={`ml-auto flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${statusMeta.bg} ${statusMeta.text}`}>
          <StatusIcon className="h-3 w-3" />{statusMeta.label}
        </span>
        <button type="button" onClick={() => setEditOpen(o => !o)} className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-stv-muted hover:bg-slate-100 hover:text-stv-navy">
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button type="button" onClick={onDelete} className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <p className="mt-3 font-baloo text-[15px] font-bold text-stv-navy">{goal.tujuan}</p>
      <p className="mt-1 text-[13px] text-stv-body"><strong className="text-stv-navy">Target:</strong> {goal.targetTerukur}</p>
      <p className="mt-0.5 text-[13px] text-stv-body"><strong className="text-stv-navy">Strategi:</strong> {goal.strategi}</p>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-[12px] font-semibold text-stv-muted">
          <span>Progress</span><span>{goal.progress}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-stv-border">
          <div className={`h-full rounded-full ${statusMeta.bar} transition-all duration-700`} style={{ width: `${goal.progress}%` }} />
        </div>
      </div>

      {/* Inline edit form */}
      {editOpen && (
        <div className="mt-4 flex flex-col gap-3 rounded-xl bg-slate-50 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-stv-navy">Jenis Tujuan</label>
              <select value={draft.term} onChange={e => setDraft(d => ({ ...d, term: e.target.value as IEPGoalTerm }))}
                className="w-full rounded-lg border border-stv-border px-3 py-1.5 text-[13px] focus:outline-none">
                <option value="jangka-pendek">Jangka Pendek</option>
                <option value="jangka-panjang">Jangka Panjang</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-stv-navy">Area Fokus</label>
              <input value={draft.areaFokus} onChange={e => setDraft(d => ({ ...d, areaFokus: e.target.value }))}
                className="w-full rounded-lg border border-stv-border px-3 py-1.5 text-[13px] focus:border-indigo-400 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-stv-navy">Tujuan</label>
            <textarea value={draft.tujuan} onChange={e => setDraft(d => ({ ...d, tujuan: e.target.value }))} rows={2}
              className="w-full resize-none rounded-lg border border-stv-border px-3 py-1.5 text-[13px] focus:border-indigo-400 focus:outline-none" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-stv-navy">Target Terukur</label>
              <input value={draft.targetTerukur} onChange={e => setDraft(d => ({ ...d, targetTerukur: e.target.value }))}
                className="w-full rounded-lg border border-stv-border px-3 py-1.5 text-[13px] focus:border-indigo-400 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-stv-navy">Strategi Intervensi</label>
              <input value={draft.strategi} onChange={e => setDraft(d => ({ ...d, strategi: e.target.value }))}
                className="w-full rounded-lg border border-stv-border px-3 py-1.5 text-[13px] focus:border-indigo-400 focus:outline-none" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="mb-1 block text-[11px] font-semibold text-stv-navy">Progress: {draft.progress}%</label>
              <input type="range" min={0} max={100} value={draft.progress} onChange={e => setDraft(d => ({ ...d, progress: Number(e.target.value) }))}
                className="w-full accent-indigo-600" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-stv-navy">Status</label>
              <select value={draft.status} onChange={e => setDraft(d => ({ ...d, status: e.target.value as IEPGoalStatus }))}
                className="rounded-lg border border-stv-border px-3 py-1.5 text-[12px] focus:outline-none">
                <option value="berjalan">Berjalan</option>
                <option value="tercapai">Tercapai</option>
                <option value="perlu-perhatian">Perlu Perhatian</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => { setDraft({ ...goal }); setEditOpen(false); }}
              className="rounded-full border border-stv-border px-4 py-1.5 text-[12px] font-semibold text-stv-body hover:bg-slate-100">Batal</button>
            <button type="button" onClick={() => { onUpdate(draft); setEditOpen(false); }}
              className="flex items-center gap-1 rounded-full bg-indigo-600 px-4 py-1.5 text-[12px] font-bold text-white hover:bg-indigo-700">
              <Save className="h-3.5 w-3.5" />Simpan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Empty goal form ---
const EMPTY_GOAL: Omit<IEPGoalGuru, 'id'> = { term: 'jangka-pendek', areaFokus: '', tujuan: '', targetTerukur: '', strategi: '', progress: 0, status: 'berjalan' };

function AddGoalForm({ onSave, onCancel }: { onSave: (g: Omit<IEPGoalGuru, 'id'>) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState({ ...EMPTY_GOAL });
  return (
    <div className="rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/60 p-5">
      <h4 className="mb-3 font-baloo text-[14px] font-bold text-stv-navy">Tambah Tujuan Baru</h4>
      <div className="flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-stv-navy">Jenis</label>
            <select value={draft.term} onChange={e => setDraft(d => ({ ...d, term: e.target.value as IEPGoalTerm }))}
              className="w-full rounded-lg border border-stv-border bg-white px-3 py-1.5 text-[13px] focus:outline-none">
              <option value="jangka-pendek">Jangka Pendek</option>
              <option value="jangka-panjang">Jangka Panjang</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-stv-navy">Area Fokus</label>
            <input value={draft.areaFokus} onChange={e => setDraft(d => ({ ...d, areaFokus: e.target.value }))}
              placeholder="mis. Komunikasi, Sosial-Emosional..."
              className="w-full rounded-lg border border-stv-border bg-white px-3 py-1.5 text-[13px] focus:border-indigo-400 focus:outline-none" />
          </div>
        </div>
        <textarea value={draft.tujuan} onChange={e => setDraft(d => ({ ...d, tujuan: e.target.value }))} rows={2}
          placeholder="Deskripsi tujuan yang ingin dicapai..."
          className="w-full resize-none rounded-lg border border-stv-border bg-white px-3 py-1.5 text-[13px] focus:border-indigo-400 focus:outline-none" />
        <input value={draft.targetTerukur} onChange={e => setDraft(d => ({ ...d, targetTerukur: e.target.value }))}
          placeholder="Target terukur (mis. 4 dari 5 hari, mandiri dalam 10 menit...)"
          className="w-full rounded-lg border border-stv-border bg-white px-3 py-1.5 text-[13px] focus:border-indigo-400 focus:outline-none" />
        <input value={draft.strategi} onChange={e => setDraft(d => ({ ...d, strategi: e.target.value }))}
          placeholder="Strategi intervensi..."
          className="w-full rounded-lg border border-stv-border bg-white px-3 py-1.5 text-[13px] focus:border-indigo-400 focus:outline-none" />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-full border border-stv-border px-4 py-1.5 text-[12px] font-semibold text-stv-body hover:bg-slate-100">Batal</button>
          <button type="button" onClick={() => { if (draft.areaFokus && draft.tujuan) onSave(draft); }}
            className="flex items-center gap-1 rounded-full bg-indigo-600 px-4 py-1.5 text-[12px] font-bold text-white hover:bg-indigo-700">
            <Save className="h-3.5 w-3.5" />Tambah
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Review modal ---
function ReviewModal({ onSave, onClose, reviewerName }: { onSave: (notes: string) => void; onClose: () => void; reviewerName: string }) {
  const [notes, setNotes] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stv-navy/30 px-4">
      <div className="w-full max-w-[440px] rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(16,58,107,.2)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-baloo text-[18px] font-bold text-stv-navy">Tandai Tinjau Ulang IEP</h2>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-stv-muted hover:text-stv-navy"><X className="h-4 w-4" /></button>
        </div>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4}
          placeholder="Tulis catatan hasil tinjauan (perkembangan, perubahan strategi, keputusan tim)..."
          className="w-full resize-none rounded-xl border border-stv-border px-4 py-2.5 text-[14px] focus:border-indigo-400 focus:outline-none" />
        <p className="mt-1.5 text-[12px] text-stv-muted">Peninjau: {reviewerName} &middot; Tanggal: {fmtDate(todayISO())}</p>
        <div className="mt-4 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-full border border-stv-border px-5 py-2 text-[14px] font-semibold text-stv-body hover:bg-slate-50">Batal</button>
          <button type="button" onClick={() => notes.trim() && onSave(notes)} className="flex items-center gap-1.5 rounded-full bg-indigo-600 px-5 py-2 text-[14px] font-bold text-white transition hover:bg-indigo-700">
            <History className="h-4 w-4" />Simpan Tinjauan
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Create IEP form (for students who don't have one yet) ---
function CreateIEPButton({ studentId, teacherName, onCreate }: { studentId: string; teacherName: string; onCreate: () => void }) {
  function handleCreate() {
    onCreate();
  }
  return (
    <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-indigo-200 py-14 text-center">
      <Target className="h-10 w-10 text-indigo-300" strokeWidth={1.5} />
      <p className="mt-3 font-semibold text-stv-navy">Belum ada IEP untuk siswa ini</p>
      <p className="mt-1 text-[13px] text-stv-muted">Buat IEP untuk mulai menetapkan tujuan pembelajaran individual.</p>
      <button type="button" onClick={handleCreate} className="mt-5 flex items-center gap-1.5 rounded-full bg-indigo-600 px-5 py-2.5 text-[14px] font-bold text-white transition hover:bg-indigo-700">
        <Plus className="h-4 w-4" />Buat IEP Sekarang
      </button>
    </div>
  );
}

// --- Main page ---
export default function IEPGuru() {
  const { user } = useAuth();
  const { students, ieps, createIEP, updateIEP, updateIEPGoal, addIEPGoal, deleteIEPGoal, addIEPRevision } = useGuru();

  const [studentFilter, setStudentFilter] = useState(students[0]?.id ?? '');
  const [addGoalOpen, setAddGoalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [editDates, setEditDates] = useState(false);

  const teacherName = `${PANGGILAN_GURU} ${user?.name ?? 'Guru'}`;
  const iep: IEPData | undefined = ieps.find(i => i.studentId === studentFilter);
  const student = students.find(s => s.id === studentFilter);

  function handleCreateIEP() {
    createIEP({
      studentId: studentFilter,
      createdDate: todayISO(),
      lastReviewDate: todayISO(),
      nextReviewDate: (() => { const d = new Date(); d.setDate(d.getDate() + 90); return d.toISOString().slice(0, 10); })(),
      team: [{ name: teacherName, role: 'Wali Kelas' }],
      goals: [],
      revisionHistory: [],
    });
  }

  const shortTerm = iep?.goals.filter(g => g.term === 'jangka-pendek') ?? [];
  const longTerm = iep?.goals.filter(g => g.term === 'jangka-panjang') ?? [];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">IEP (Individualized Education Program)</h2>
        <p className="text-[14px] text-stv-muted">Kelola program belajar individual per siswa, tampil transparan & read-only di dashboard orang tua.</p>
      </div>

      {/* Student tabs */}
      <div className="flex flex-wrap gap-2">
        {students.map(s => {
          const hasIEP = ieps.some(i => i.studentId === s.id);
          return (
            <button key={s.id} type="button" onClick={() => setStudentFilter(s.id)}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${studentFilter === s.id ? 'bg-indigo-600 text-white' : 'border border-stv-border bg-white text-stv-body hover:bg-indigo-50'}`}>
              {s.name.split(' ')[0]}
              {!hasIEP && <span className="h-2 w-2 rounded-full bg-orange-400" title="Belum ada IEP" />}
            </button>
          );
        })}
      </div>

      {!iep ? (
        <CreateIEPButton studentId={studentFilter} teacherName={teacherName} onCreate={handleCreateIEP} />
      ) : (
        <div className="flex flex-col gap-5">
          {/* IEP header info */}
          <div className="animate-fade-in-up rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-baloo text-[16px] font-bold text-stv-navy">IEP, {student?.name}</h3>
              <div className="flex gap-2">
                <button type="button" onClick={() => setReviewModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-full bg-indigo-100 px-3.5 py-1.5 text-[12px] font-bold text-indigo-700 hover:opacity-80">
                  <History className="h-3.5 w-3.5" />Tandai Tinjau Ulang
                </button>
                <button type="button" onClick={() => setEditDates(o => !o)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-stv-muted hover:bg-slate-100">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            {editDates ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {(['createdDate', 'lastReviewDate', 'nextReviewDate'] as const).map(field => (
                  <div key={field}>
                    <label className="mb-1 block text-[11px] font-semibold text-stv-navy">
                      {field === 'createdDate' ? 'Dibuat' : field === 'lastReviewDate' ? 'Ditinjau Terakhir' : 'Tinjau Berikutnya'}
                    </label>
                    <input type="date" value={iep[field]} onChange={e => updateIEP(iep.id, { [field]: e.target.value })}
                      className="w-full rounded-lg border border-stv-border px-3 py-1.5 text-[13px] focus:border-indigo-400 focus:outline-none" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {[
                  { label: 'Dibuat', value: iep.createdDate },
                  { label: 'Ditinjau Terakhir', value: iep.lastReviewDate },
                  { label: 'Tinjau Berikutnya', value: iep.nextReviewDate },
                ].map(item => (
                  <div key={item.label} className="rounded-xl bg-indigo-50 p-3">
                    <p className="flex items-center gap-1.5 text-[11px] text-stv-muted"><CalendarDays className="h-3 w-3" />{item.label}</p>
                    <p className="mt-0.5 text-[13px] font-bold text-stv-navy">{fmtDate(item.value)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Team */}
          <div className="animate-fade-in-up rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
            <h3 className="flex items-center gap-2 font-baloo text-[15px] font-bold text-stv-navy">
              <Users className="h-4 w-4 text-indigo-600" />Tim Penyusun
            </h3>
            <div className="mt-3 flex flex-col gap-1.5">
              {iep.team.map((member, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl bg-indigo-50 px-3.5 py-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
                    {member.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <span className="text-[13px] font-bold text-stv-navy">{member.name}</span>
                    <span className="ml-2 text-[12px] text-stv-muted">{member.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Goals - short term */}
          {shortTerm.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="font-baloo text-[15px] font-bold text-stv-navy">Tujuan Jangka Pendek ({shortTerm.length})</h3>
              {shortTerm.map(goal => (
                <GoalCard key={goal.id} goal={goal}
                  onUpdate={updates => updateIEPGoal(iep.id, goal.id, updates)}
                  onDelete={() => { if (window.confirm('Hapus tujuan ini?')) deleteIEPGoal(iep.id, goal.id); }}
                />
              ))}
            </div>
          )}

          {/* Goals - long term */}
          {longTerm.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="font-baloo text-[15px] font-bold text-stv-navy">Tujuan Jangka Panjang ({longTerm.length})</h3>
              {longTerm.map(goal => (
                <GoalCard key={goal.id} goal={goal}
                  onUpdate={updates => updateIEPGoal(iep.id, goal.id, updates)}
                  onDelete={() => { if (window.confirm('Hapus tujuan ini?')) deleteIEPGoal(iep.id, goal.id); }}
                />
              ))}
            </div>
          )}

          {/* Add goal form / button */}
          {addGoalOpen ? (
            <AddGoalForm
              onSave={goal => { addIEPGoal(iep.id, goal); setAddGoalOpen(false); }}
              onCancel={() => setAddGoalOpen(false)}
            />
          ) : (
            <button type="button" onClick={() => setAddGoalOpen(true)}
              className="flex items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-indigo-200 py-4 text-[13px] font-semibold text-indigo-600 transition hover:bg-indigo-50">
              <Plus className="h-4 w-4" />Tambah Tujuan Baru
            </button>
          )}

          {/* Revision history */}
          {iep.revisionHistory.length > 0 && (
            <div className="rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
              <h3 className="flex items-center gap-2 font-baloo text-[15px] font-bold text-stv-navy">
                <History className="h-4 w-4 text-indigo-600" />Riwayat Tinjauan
              </h3>
              <div className="mt-3 flex flex-col gap-3">
                {iep.revisionHistory.map(rev => (
                  <div key={rev.id} className="rounded-xl bg-indigo-50 p-3.5">
                    <div className="flex items-center justify-between text-[12px] text-stv-muted">
                      <span>{fmtDate(rev.date)}</span>
                      <span>,  {rev.revisedBy}</span>
                    </div>
                    <p className="mt-1.5 text-[13px] leading-[1.6] text-stv-body">{rev.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {reviewModalOpen && iep && (
        <ReviewModal
          reviewerName={teacherName}
          onClose={() => setReviewModalOpen(false)}
          onSave={notes => {
            addIEPRevision(iep.id, { date: todayISO(), notes, revisedBy: teacherName });
            updateIEP(iep.id, { lastReviewDate: todayISO() });
            setReviewModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
