import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Baby, X, Save } from 'lucide-react';
import { useGuru, KELOMPOK_OPTIONS, DIAGNOSIS_OPTIONS, PANGGILAN_GURU } from './GuruContext';
import { useAuth } from '../../context/AuthContext';
import ThumbnailUpload from '../AdminPages/ThumbnailUpload';

type StudentFormState = {
  name: string;
  age: number;
  kelompok: string;
  diagnosis: string[];
  ringkasan: string;
  photo?: string;
};

const EMPTY_FORM: StudentFormState = {
  name: '', age: 6, kelompok: '', diagnosis: [], ringkasan: '',
};

function StudentFormModal({ initial, title, onClose, onSave, kelompokOptions }: {
  initial: StudentFormState;
  title: string;
  onClose: () => void;
  onSave: (data: StudentFormState) => void;
  kelompokOptions: string[];
}) {
  const [form, setForm] = useState<StudentFormState>(initial);
  const [error, setError] = useState('');

  function toggleDiagnosis(d: string) {
    setForm(f => ({
      ...f,
      diagnosis: f.diagnosis.includes(d) ? f.diagnosis.filter(x => x !== d) : [...f.diagnosis, d],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Nama siswa wajib diisi.'); return; }
    onSave(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stv-navy/30 px-4 py-8">
      <div className="w-full max-w-[520px] rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(16,58,107,.2)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-baloo text-[18px] font-bold text-stv-navy">{title}</h2>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 text-stv-muted hover:text-stv-navy">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <ThumbnailUpload value={form.photo} onChange={url => setForm(f => ({ ...f, photo: url }))} label="Foto Siswa (opsional)" />
          <div>
            <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Nama Siswa *</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full rounded-xl border border-stv-border px-4 py-2.5 text-[15px] focus:border-teal-400 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Usia (tahun)</label>
              <input
                type="number"
                min={3}
                max={18}
                value={form.age}
                onChange={e => setForm(f => ({ ...f, age: Number(e.target.value) }))}
                className="w-full rounded-xl border border-stv-border px-4 py-2.5 text-[15px] focus:border-teal-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Nama Kelas</label>
              <input
                type="text"
                list="kelompok-datalist"
                value={form.kelompok}
                onChange={e => setForm(f => ({ ...f, kelompok: e.target.value }))}
                placeholder="Ketik nama kelas atau pilih..."
                className="w-full rounded-xl border border-stv-border px-4 py-2.5 text-[15px] focus:border-teal-400 focus:outline-none"
              />
              <datalist id="kelompok-datalist">
                {kelompokOptions.map(k => <option key={k} value={k} />)}
              </datalist>
              <p className="mt-1 text-[11px] text-stv-muted">Bisa pilih dari saran atau ketik nama kelas baru</p>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-[13px] font-semibold text-stv-navy">Kebutuhan Khusus (pilih semua yang sesuai)</label>
            <div className="flex flex-wrap gap-2">
              {DIAGNOSIS_OPTIONS.map(d => {
                const active = form.diagnosis.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDiagnosis(d)}
                    aria-pressed={active}
                    className={`rounded-full px-3 py-1.5 text-[13px] font-semibold transition ${active ? 'bg-teal-600 text-white' : 'bg-teal-50 text-teal-700 hover:opacity-80'}`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Catatan Singkat tentang Anak</label>
            <textarea
              value={form.ringkasan}
              onChange={e => setForm(f => ({ ...f, ringkasan: e.target.value }))}
              rows={3}
              placeholder="Karakter, pendekatan yang efektif, hal yang perlu diperhatikan..."
              className="w-full resize-none rounded-xl border border-stv-border px-4 py-2.5 text-[15px] focus:border-teal-400 focus:outline-none"
            />
          </div>
          {error && <p className="text-[13px] text-red-500">{error}</p>}
          <div className="mt-2 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-full border border-stv-border px-5 py-2 text-[14px] font-semibold text-stv-body hover:bg-slate-50">
              Batal
            </button>
            <button type="submit" className="flex items-center gap-1.5 rounded-full bg-teal-600 px-5 py-2 text-[14px] font-bold text-white transition hover:bg-teal-700">
              <Save className="h-4 w-4" />
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const KELOMPOK_COLOR: Record<string, string> = {
  'Kelompok Cendana': 'bg-teal-50 text-teal-700',
  'Kelompok Anggrek': 'bg-orange-50 text-orange-700',
  'Kelompok Melati': 'bg-purple-50 text-purple-700',
  'Kelompok Mawar': 'bg-pink-50 text-pink-700',
};

export default function KelasSayaGuru() {
  const { user } = useAuth();
  const { students, addStudent } = useGuru();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [kelompokFilter, setKelompokFilter] = useState('Semua');
  const [addModalOpen, setAddModalOpen] = useState(false);

  const kelompokList = ['Semua', ...new Set(students.map(s => s.kelompok))];
  // Merged suggestions for the datalist: predefined options + any custom class names already in use
  const kelompokOptions = [...new Set([...KELOMPOK_OPTIONS, ...students.map(s => s.kelompok).filter(Boolean)])];

  const filtered = useMemo(() => students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) &&
    (kelompokFilter === 'Semua' || s.kelompok === kelompokFilter)
  ), [students, search, kelompokFilter]);

  function handleAdd(data: StudentFormState) {
    addStudent({ ...data, waliKelas: `${PANGGILAN_GURU} ${user?.name ?? 'Guru'}` });
    setAddModalOpen(false);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">Kelas Saya</h2>
          <p className="text-[14px] text-stv-muted">{students.length} siswa terdaftar &middot; Klik siswa untuk lihat & kelola profilnya</p>
        </div>
        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-1.5 rounded-full bg-teal-600 px-5 py-2.5 text-[14px] font-bold text-white transition hover:bg-teal-700"
        >
          <UserPlus className="h-4 w-4" />
          Tambah Siswa Baru
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-[280px]">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stv-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama siswa..."
            className="w-full rounded-full border border-stv-border bg-white py-2.5 pl-10 pr-4 text-[14px] focus:border-teal-400 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {kelompokList.map(k => (
            <button
              key={k}
              type="button"
              onClick={() => setKelompokFilter(k)}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${kelompokFilter === k ? 'bg-teal-600 text-white' : 'bg-white text-stv-body hover:bg-teal-50 border border-stv-border'}`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-teal-200 py-14 text-center">
          <Baby className="h-10 w-10 text-teal-300" strokeWidth={1.5} />
          <p className="mt-3 font-semibold text-stv-navy">{search ? 'Tidak ada siswa yang cocok' : 'Belum ada siswa terdaftar'}</p>
          <p className="mt-1 text-[13px] text-stv-muted">Klik "Tambah Siswa Baru" untuk mendaftarkan siswa.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(student => (
            <button
              key={student.id}
              type="button"
              onClick={() => navigate(`/guru/kelas/${student.id}`)}
              className="animate-fade-in-up flex flex-col gap-3 rounded-2xl bg-white p-5 text-left shadow-[0_4px_16px_rgba(16,58,107,.06)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(20,184,166,.18)]"
            >
              <div className="flex items-center gap-3">
                {student.photo ? (
                  <img src={student.photo} alt={student.name} className="h-12 w-12 shrink-0 rounded-full object-cover" />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-600 font-baloo text-[20px] font-bold text-white">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-baloo text-[16px] font-bold text-stv-navy">{student.name}</p>
                  <p className="text-[13px] text-stv-muted">{student.age} tahun</p>
                </div>
              </div>
              <span className={`w-fit rounded-full px-2.5 py-0.5 text-[11px] font-bold ${KELOMPOK_COLOR[student.kelompok] ?? 'bg-slate-100 text-slate-600'}`}>
                {student.kelompok}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {student.diagnosis.map(d => (
                  <span key={d} className="rounded-full bg-stv-sky-tint px-2.5 py-0.5 text-[11px] font-semibold text-stv-sky-stroke">{d}</span>
                ))}
              </div>
              {student.ringkasan && (
                <p className="line-clamp-2 text-[13px] leading-[1.5] text-stv-muted">{student.ringkasan}</p>
              )}
            </button>
          ))}
        </div>
      )}

      {addModalOpen && (
        <StudentFormModal
          initial={EMPTY_FORM}
          title="Tambah Siswa Baru"
          kelompokOptions={kelompokOptions}
          onClose={() => setAddModalOpen(false)}
          onSave={handleAdd}
        />
      )}
    </div>
  );
}
