import React, { useState } from 'react';
import {
  Plus, ArrowLeft, Pencil, Trash2, CheckCircle2, X, Save, ClipboardList,
} from 'lucide-react';
import {
  useGuru, AssessmentGuru, AssessmentAreaGuru, AssessorRole,
  DEFAULT_ASSESSMENT_AREAS, PANGGILAN_GURU,
} from './GuruContext';
import { useAuth } from '../../context/AuthContext';

function scoreLevel(score: number): { label: string; text: string; bar: string; bg: string } {
  if (score >= 75) return { label: 'Baik', text: 'text-stv-green', bar: 'bg-stv-green', bg: 'bg-stv-green-tint' };
  if (score >= 50) return { label: 'Berkembang', text: 'text-orange-600', bar: 'bg-orange-500', bg: 'bg-orange-50' };
  return { label: 'Perlu Perhatian', text: 'text-red-600', bar: 'bg-red-500', bg: 'bg-red-50' };
}

function avgScore(areas: AssessmentAreaGuru[]) {
  if (!areas.length) return 0;
  return Math.round(areas.reduce((s, a) => s + a.score, 0) / areas.length);
}

function todayISO() { return new Date().toISOString().slice(0, 10); }

const ASSESSOR_ROLES: AssessorRole[] = ['Guru', 'Psikolog', 'Terapis Okupasi'];

// --- Assessment Form ---
type FormState = {
  studentId: string;
  title: string;
  date: string;
  assessor: string;
  assessorRole: AssessorRole;
  summary: string;
  areas: AssessmentAreaGuru[];
  recommendations: string;
};

function AssessmentForm({ students, initial, formTitle, onSave, onCancel }: {
  students: ReturnType<typeof useGuru>['students'];
  initial: FormState;
  formTitle: string;
  onSave: (form: FormState) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError('Judul asesmen wajib diisi.'); return; }
    if (!form.summary.trim()) { setError('Ringkasan hasil wajib diisi.'); return; }
    onSave(form);
  }

  function setAreaField(idx: number, field: keyof AssessmentAreaGuru, value: string | number) {
    setForm(f => ({ ...f, areas: f.areas.map((a, i) => i === idx ? { ...a, [field]: value } : a) }));
  }
  function addArea() { setForm(f => ({ ...f, areas: [...f.areas, { name: '', score: 50, note: '' }] })); }
  function removeArea(idx: number) { setForm(f => ({ ...f, areas: f.areas.filter((_, i) => i !== idx) })); }

  return (
    <div className="animate-fade-in-up rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-baloo text-[17px] font-bold text-stv-navy">{formTitle}</h3>
        <button type="button" onClick={onCancel} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-stv-muted hover:text-stv-navy">
          <X className="h-4 w-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Student */}
        <div>
          <label className="mb-2 block text-[13px] font-semibold text-stv-navy">Siswa yang Dinilai</label>
          <div className="flex flex-wrap gap-2">
            {students.map(s => (
              <button key={s.id} type="button" onClick={() => setForm(f => ({ ...f, studentId: s.id }))}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold transition ${form.studentId === s.id ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:opacity-80'}`}>
                <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${form.studentId === s.id ? 'bg-white/30' : 'bg-blue-200 text-blue-800'}`}>{s.name.charAt(0)}</span>
                {s.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Judul Asesmen *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="mis. Asesmen Berkala Triwulan 2"
              className="w-full rounded-xl border border-stv-border px-4 py-2.5 text-[14px] focus:border-blue-400 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Tanggal</label>
            <input type="date" value={form.date} max={todayISO()} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full rounded-xl border border-stv-border px-4 py-2.5 text-[14px] focus:border-blue-400 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Nama Penilai</label>
            <input value={form.assessor} onChange={e => setForm(f => ({ ...f, assessor: e.target.value }))}
              className="w-full rounded-xl border border-stv-border px-4 py-2.5 text-[14px] focus:border-blue-400 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Peran Penilai</label>
            <select value={form.assessorRole} onChange={e => setForm(f => ({ ...f, assessorRole: e.target.value as AssessorRole }))}
              className="w-full rounded-xl border border-stv-border px-4 py-2.5 text-[14px] focus:border-blue-400 focus:outline-none">
              {ASSESSOR_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* Area entries */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-[13px] font-semibold text-stv-navy">Area yang Dinilai</label>
            <button type="button" onClick={addArea}
              className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-[12px] font-semibold text-blue-700 hover:opacity-80">
              <Plus className="h-3.5 w-3.5" />Tambah Area
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {form.areas.map((area, idx) => {
              const level = scoreLevel(area.score);
              return (
                <div key={idx} className="rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center gap-2">
                    <input value={area.name} onChange={e => setAreaField(idx, 'name', e.target.value)}
                      placeholder="Nama area (mis. Komunikasi)"
                      className="flex-1 rounded-lg border border-stv-border px-3 py-1.5 text-[13px] focus:border-blue-400 focus:outline-none" />
                    <span className={`w-20 text-right text-[13px] font-bold ${level.text}`}>{area.score}/100</span>
                    <button type="button" onClick={() => removeArea(idx)} className="text-red-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <input type="range" min={0} max={100} value={area.score}
                      onChange={e => setAreaField(idx, 'score', Number(e.target.value))}
                      className="flex-1 accent-blue-600" />
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${level.bg} ${level.text}`}>{level.label}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-stv-border">
                    <div className={`h-full rounded-full ${level.bar} transition-all duration-500`} style={{ width: `${area.score}%` }} />
                  </div>
                  <input value={area.note} onChange={e => setAreaField(idx, 'note', e.target.value)}
                    placeholder="Catatan observasi singkat (opsional)"
                    className="mt-2 w-full rounded-lg border border-stv-border px-3 py-1.5 text-[12px] focus:border-blue-400 focus:outline-none" />
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Ringkasan Hasil *</label>
          <textarea value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
            rows={3} placeholder="Rangkuman temuan utama dari asesmen ini..."
            className="w-full resize-none rounded-xl border border-stv-border px-4 py-2.5 text-[14px] focus:border-blue-400 focus:outline-none" />
        </div>

        <div>
          <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Rekomendasi (satu per baris)</label>
          <textarea value={form.recommendations} onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))}
            rows={3} placeholder="Tulis satu rekomendasi per baris..."
            className="w-full resize-none rounded-xl border border-stv-border px-4 py-2.5 text-[14px] focus:border-blue-400 focus:outline-none" />
        </div>

        {error && <p className="text-[13px] text-red-500">{error}</p>}

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="rounded-full border border-stv-border px-5 py-2 text-[14px] font-semibold text-stv-body hover:bg-slate-50">Batal</button>
          <button type="submit" className="flex items-center gap-1.5 rounded-full bg-blue-600 px-5 py-2 text-[14px] font-bold text-white transition hover:bg-blue-700">
            <Save className="h-4 w-4" />Simpan Asesmen
          </button>
        </div>
      </form>
    </div>
  );
}

// --- Assessment Detail View ---
function AssessmentDetail({ assessment, studentName, onBack, onEdit, onDelete }: {
  assessment: AssessmentGuru;
  studentName: string;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const avg = avgScore(assessment.areas);
  const overallLevel = scoreLevel(avg);
  return (
    <div className="mx-auto flex max-w-[680px] flex-col gap-5">
      <div className="flex items-center justify-between">
        <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-[14px] font-semibold text-stv-muted hover:text-blue-600">
          <ArrowLeft className="h-4 w-4" />Kembali ke Daftar
        </button>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onEdit} className="flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-[12px] font-semibold text-blue-700 hover:opacity-80">
            <Pencil className="h-3.5 w-3.5" />Edit
          </button>
          <button type="button" onClick={onDelete} className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="animate-fade-in-up rounded-2xl bg-white p-6 shadow-[0_4px_16px_rgba(16,58,107,.06)] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-baloo text-[22px] font-extrabold text-stv-navy sm:text-[26px]">{assessment.title}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-[13px] text-stv-muted">
              <span>{new Date(assessment.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span>{assessment.assessor} ({assessment.assessorRole})</span>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[12px] font-semibold text-blue-700">{studentName}</span>
            </div>
          </div>
          <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${overallLevel.bg} ${overallLevel.text}`}>
            Rata-rata: {overallLevel.label} ({avg}/100)
          </span>
        </div>
        <p className="mt-4 text-[15px] leading-[1.75] text-stv-body">{assessment.summary}</p>
      </div>

      <div className="animate-fade-in-up rounded-2xl bg-white p-6 shadow-[0_4px_16px_rgba(16,58,107,.06)] sm:p-8">
        <h3 className="font-baloo text-[16px] font-bold text-stv-navy">Area yang Dinilai</h3>
        <div className="mt-4 flex flex-col gap-5">
          {assessment.areas.map(area => {
            const level = scoreLevel(area.score);
            return (
              <div key={area.name}>
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-[14px] font-semibold text-stv-navy">{area.name}</p>
                  <span className={`text-[12px] font-bold ${level.text}`}>{level.label} ({area.score}/100)</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-stv-border">
                  <div className={`h-full rounded-full ${level.bar} transition-all duration-700`} style={{ width: `${area.score}%` }} />
                </div>
                {area.note && <p className="mt-1.5 text-[13px] text-stv-muted">{area.note}</p>}
              </div>
            );
          })}
        </div>
      </div>

      {assessment.recommendations.length > 0 && (
        <div className="animate-fade-in-up rounded-2xl bg-blue-50 p-6 sm:p-8">
          <h3 className="font-baloo text-[16px] font-bold text-stv-navy">Rekomendasi</h3>
          <ul className="mt-3 flex flex-col gap-2.5">
            {assessment.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[14px] leading-[1.6] text-stv-body">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// --- Main page ---
export default function AsesmenGuru() {
  const { user } = useAuth();
  const { students, assessments, addAssessment, updateAssessment, deleteAssessment } = useGuru();

  const [studentFilter, setStudentFilter] = useState(students[0]?.id ?? '');
  const [mode, setMode] = useState<'list' | 'create' | 'detail' | 'edit'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const teacherName = `${PANGGILAN_GURU} ${user?.name ?? 'Guru'}`;

  const EMPTY_FORM = (): FormState => ({
    studentId: studentFilter, title: '', date: todayISO(),
    assessor: teacherName, assessorRole: 'Guru',
    summary: '', areas: DEFAULT_ASSESSMENT_AREAS.map(a => ({ ...a })),
    recommendations: '',
  });

  const studentAssessments = assessments
    .filter(a => a.studentId === studentFilter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const selectedAssessment = assessments.find(a => a.id === selectedId);

  function toFormState(a: AssessmentGuru): FormState {
    return {
      studentId: a.studentId, title: a.title, date: a.date,
      assessor: a.assessor, assessorRole: a.assessorRole,
      summary: a.summary, areas: a.areas.map(x => ({ ...x })),
      recommendations: a.recommendations.join('\n'),
    };
  }

  function handleSaveCreate(form: FormState) {
    addAssessment({ ...form, recommendations: form.recommendations.split('\n').map(s => s.trim()).filter(Boolean) });
    setMode('list');
  }

  function handleSaveEdit(form: FormState) {
    if (!selectedId) return;
    updateAssessment(selectedId, { ...form, recommendations: form.recommendations.split('\n').map(s => s.trim()).filter(Boolean) });
    setMode('detail');
  }

  function handleDelete(id: string) {
    const a = assessments.find(x => x.id === id);
    if (window.confirm(`Hapus asesmen "${a?.title}"?`)) {
      deleteAssessment(id);
      setMode('list');
    }
  }

  if (mode === 'detail' && selectedAssessment) {
    return (
      <AssessmentDetail
        assessment={selectedAssessment}
        studentName={students.find(s => s.id === selectedAssessment.studentId)?.name ?? '-'}
        onBack={() => setMode('list')}
        onEdit={() => setMode('edit')}
        onDelete={() => handleDelete(selectedAssessment.id)}
      />
    );
  }

  if (mode === 'edit' && selectedAssessment) {
    return (
      <AssessmentForm
        students={students}
        initial={toFormState(selectedAssessment)}
        formTitle="Edit Asesmen"
        onSave={handleSaveEdit}
        onCancel={() => setMode('detail')}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">Asesmen</h2>
          <p className="text-[14px] text-stv-muted">Buat dan kelola hasil asesmen per siswa, tampil read-only di dashboard orang tua.</p>
        </div>
        {mode === 'list' && (
          <button type="button" onClick={() => setMode('create')}
            className="flex items-center gap-1.5 rounded-full bg-blue-600 px-5 py-2.5 text-[14px] font-bold text-white transition hover:bg-blue-700">
            <Plus className="h-4 w-4" />Buat Asesmen Baru
          </button>
        )}
      </div>

      {mode === 'create' && (
        <AssessmentForm
          students={students}
          initial={EMPTY_FORM()}
          formTitle="Buat Asesmen Baru"
          onSave={handleSaveCreate}
          onCancel={() => setMode('list')}
        />
      )}

      {mode === 'list' && (
        <>
          {/* Student selector */}
          <div className="flex flex-wrap gap-2">
            {students.map(s => (
              <button key={s.id} type="button" onClick={() => setStudentFilter(s.id)}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${studentFilter === s.id ? 'bg-blue-600 text-white' : 'border border-stv-border bg-white text-stv-body hover:bg-blue-50'}`}>
                {s.name.split(' ')[0]}
              </button>
            ))}
          </div>

          {studentAssessments.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-blue-200 py-14 text-center">
              <ClipboardList className="h-10 w-10 text-blue-300" strokeWidth={1.5} />
              <p className="mt-3 font-semibold text-stv-navy">Belum ada asesmen untuk siswa ini</p>
              <p className="mt-1 text-[13px] text-stv-muted">Klik "Buat Asesmen Baru" untuk mulai.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {studentAssessments.map(a => {
                const avg = avgScore(a.areas);
                const level = scoreLevel(avg);
                return (
                  <button key={a.id} type="button"
                    onClick={() => { setSelectedId(a.id); setMode('detail'); }}
                    className="animate-fade-in-up flex flex-col gap-2 rounded-2xl bg-white p-5 text-left shadow-[0_4px_16px_rgba(16,58,107,.06)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(16,58,107,.12)]">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-baloo text-[16px] font-bold text-stv-navy">{a.title}</h3>
                      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${level.bg} ${level.text}`}>{level.label}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[13px] text-stv-muted">
                      <span>{new Date(a.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      <span>{a.assessor} ({a.assessorRole})</span>
                    </div>
                    {/* Mini progress bars */}
                    <div className="grid grid-cols-5 gap-1.5 pt-1">
                      {a.areas.map(area => {
                        const l = scoreLevel(area.score);
                        return (
                          <div key={area.name} title={`${area.name}: ${area.score}/100`}>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-stv-border">
                              <div className={`h-full rounded-full ${l.bar}`} style={{ width: `${area.score}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
