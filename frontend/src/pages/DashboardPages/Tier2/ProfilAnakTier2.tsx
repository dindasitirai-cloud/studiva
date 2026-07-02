import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Baby,
  BookOpen,
  GraduationCap,
  Lightbulb,
  Smile,
  Meh,
  Frown,
  Star,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  useDashboardTier2,
  ChildProfile,
  JournalEntry,
  JournalMood,
  LearningStyle,
} from '../../../context/DashboardTier2Context';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LEARNING_STYLE_INFO: Record<LearningStyle, { color: string; desc: string }> = {
  Visual: {
    color: 'bg-stv-sky-tint text-stv-sky-stroke',
    desc: 'Belajar terbaik melalui gambar, diagram, warna, dan informasi visual.',
  },
  Auditori: {
    color: 'bg-stv-coral-tint text-stv-coral',
    desc: 'Belajar terbaik melalui mendengar, diskusi lisan, dan penjelasan verbal.',
  },
  Kinestetik: {
    color: 'bg-stv-green-tint text-stv-green',
    desc: 'Belajar terbaik melalui praktik langsung, gerakan, dan pengalaman nyata.',
  },
  'Membaca/Menulis': {
    color: 'bg-amber-100 text-amber-700',
    desc: 'Belajar terbaik melalui teks, catatan tertulis, dan kegiatan membaca.',
  },
};

const ALL_STYLES: LearningStyle[] = ['Visual', 'Auditori', 'Kinestetik', 'Membaca/Menulis'];

const MOOD_OPTIONS: { value: JournalMood; label: string; icon: React.ReactNode }[] = [
  { value: 'great', label: 'Luar biasa', icon: <Star className="h-4 w-4" /> },
  { value: 'good', label: 'Bagus', icon: <Smile className="h-4 w-4" /> },
  { value: 'ok', label: 'Biasa', icon: <Meh className="h-4 w-4" /> },
  { value: 'challenging', label: 'Penuh tantangan', icon: <Frown className="h-4 w-4" /> },
];

const MOOD_STYLE: Record<JournalMood, string> = {
  great: 'bg-amber-100 text-amber-700',
  good: 'bg-stv-green-tint text-stv-green',
  ok: 'bg-stv-sky-tint text-stv-sky-stroke',
  challenging: 'bg-stv-coral-tint text-stv-coral',
};

// ---------------------------------------------------------------------------
// Animated counter
// ---------------------------------------------------------------------------
function useAnimatedCount(target: number) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    // No "run once" guard here on purpose: this must re-animate every time
    // `target` changes, and must also survive React.StrictMode's dev-mode
    // double-invoke of effects, which a one-shot ref guard would break.
    if (target === 0) { setCount(0); return; }
    const steps = 20;
    const step = Math.ceil(target / steps);
    let cur = 0;
    const id = setInterval(() => {
      cur += step;
      if (cur >= target) { setCount(target); clearInterval(id); }
      else setCount(cur);
    }, 40);
    return () => clearInterval(id);
  }, [target]);
  return count;
}

// ---------------------------------------------------------------------------
// Photo upload
// ---------------------------------------------------------------------------
function PhotoUpload({ photo, name, onChange }: { photo?: string; name: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // TODO: upload to storage and use returned URL in production
    const reader = new FileReader();
    reader.onload = ev => onChange(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="relative">
      <div
        onClick={() => inputRef.current?.click()}
        className="flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-4 border-amber-200 bg-amber-100 transition hover:opacity-80"
      >
        {photo ? (
          <img src={photo} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className="font-baloo text-[32px] font-bold text-amber-600">
            {name.charAt(0).toUpperCase() || '?'}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-white shadow"
      >
        <Camera className="h-3.5 w-3.5" />
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Child form (add or edit)
// ---------------------------------------------------------------------------
interface ChildFormProps {
  initial?: Partial<ChildProfile>;
  onSave: (data: Omit<ChildProfile, 'id'>) => void;
  onCancel: () => void;
  title: string;
}

function ChildForm({ initial, onSave, onCancel, title }: ChildFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [age, setAge] = useState<string>(initial?.age?.toString() ?? '');
  const [summary, setSummary] = useState(initial?.summary ?? '');
  const [photo, setPhoto] = useState(initial?.photo ?? '');
  const [styles, setStyles] = useState<LearningStyle[]>(initial?.learningStyles ?? []);
  const [error, setError] = useState('');

  function toggleStyle(s: LearningStyle) {
    setStyles(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  function handleSave() {
    if (!name.trim()) { setError('Nama anak wajib diisi.'); return; }
    const parsedAge = parseInt(age, 10);
    if (!age || isNaN(parsedAge) || parsedAge < 1 || parsedAge > 18) {
      setError('Masukkan usia anak yang valid (1–18).'); return;
    }
    setError('');
    onSave({ name: name.trim(), age: parsedAge, summary: summary.trim(), photo, learningStyles: styles });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stv-navy/30 px-4 py-8">
      <div className="w-full max-w-[520px] rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(16,58,107,.2)]">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-baloo text-[20px] font-bold text-stv-navy">{title}</h2>
          <button type="button" onClick={onCancel} className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-stv-muted hover:text-stv-navy">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Photo */}
        <div className="mb-5 flex justify-center">
          <PhotoUpload photo={photo} name={name || '?'} onChange={setPhoto} />
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Nama Anak *</label>
            <input
              value={name} onChange={e => setName(e.target.value)}
              className="w-full rounded-xl border border-amber-200 px-4 py-2.5 text-[15px] focus:border-amber-500 focus:outline-none"
              placeholder="mis. Aqila"
            />
          </div>
          <div>
            <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Usia (tahun) *</label>
            <input
              type="number" min={1} max={18} value={age} onChange={e => setAge(e.target.value)}
              className="w-full rounded-xl border border-amber-200 px-4 py-2.5 text-[15px] focus:border-amber-500 focus:outline-none"
              placeholder="mis. 7"
            />
          </div>
          <div>
            <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Catatan Singkat</label>
            <textarea
              value={summary} onChange={e => setSummary(e.target.value)} rows={2}
              className="w-full resize-none rounded-xl border border-amber-200 px-4 py-2.5 text-[15px] focus:border-amber-500 focus:outline-none"
              placeholder="mis. Senang menggambar, belajar terbaik dengan gambar dan warna"
            />
          </div>

          {/* Learning styles */}
          <div>
            <label className="mb-2 block text-[13px] font-semibold text-stv-navy">Tipe Belajar (bisa pilih lebih dari satu)</label>
            <div className="flex flex-wrap gap-2">
              {ALL_STYLES.map(s => {
                const active = styles.includes(s);
                return (
                  <button
                    key={s} type="button" onClick={() => toggleStyle(s)}
                    className={`rounded-full border px-3 py-1.5 text-[13px] font-semibold transition ${
                      active ? 'border-amber-500 bg-amber-100 text-amber-700' : 'border-amber-200 text-stv-muted hover:border-amber-400'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            {styles.length > 0 && (
              <div className="mt-3 flex flex-col gap-2">
                {styles.map(s => (
                  <p key={s} className="text-[12px] leading-[1.5] text-stv-muted">
                    <strong className="text-stv-navy">{s}:</strong> {LEARNING_STYLE_INFO[s].desc}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {error && <p className="mt-3 text-[13px] text-red-500">{error}</p>}

        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="rounded-full border border-amber-200 px-5 py-2 text-[14px] font-semibold text-stv-body hover:bg-amber-50">
            Batal
          </button>
          <button type="button" onClick={handleSave} className="flex items-center gap-1.5 rounded-full bg-amber-500 px-5 py-2 text-[14px] font-bold text-white transition hover:bg-amber-600">
            <Save className="h-4 w-4" />
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Perjalanan Pembelajaran
// ---------------------------------------------------------------------------
export function PerjalananPembelajaran({ childId }: { childId: string }) {
  const { getArticlesReadByChild, getCoursesEnrolledByChild, getStrategiesSavedByChild } = useDashboardTier2();

  const articleIds = getArticlesReadByChild(childId);
  const courseIds = getCoursesEnrolledByChild(childId);
  const strategyIds = getStrategiesSavedByChild(childId);

  const articlesCount = useAnimatedCount(articleIds.length);
  const coursesCount = useAnimatedCount(courseIds.length);
  const strategiesCount = useAnimatedCount(strategyIds.length);

  const total = articleIds.length + courseIds.length + strategyIds.length;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-amber-200 py-10 text-center">
        <BookOpen className="h-9 w-9 text-amber-300" strokeWidth={1.5} />
        <p className="mt-3 text-[15px] font-semibold text-stv-navy">Belum ada aktivitas tercatat</p>
        <p className="mt-1 max-w-[300px] text-[13px] text-stv-muted">
          Aktivitas belajar (artikel, course, strategi) akan muncul di sini setelah Anda menggunakannya.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Counters */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { count: articlesCount, label: 'Artikel Dibaca', icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50' },
          { count: coursesCount, label: 'Course Diikuti', icon: GraduationCap, color: 'text-stv-sky-stroke', bg: 'bg-stv-sky-tint' },
          { count: strategiesCount, label: 'Strategi Disimpan', icon: Lightbulb, color: 'text-stv-coral', bg: 'bg-stv-coral-tint' },
        ].map(({ count, label, icon: Icon, color, bg }) => (
          <div key={label} className={`flex flex-col items-center rounded-2xl p-4 text-center ${bg}`}>
            <Icon className={`h-5 w-5 ${color}`} strokeWidth={2} />
            <div className={`mt-1 font-baloo text-[26px] font-extrabold ${color}`}>{count}</div>
            <div className="text-[11px] text-stv-muted">{label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div>
        <div className="mb-1.5 flex items-center justify-between text-[12px] text-stv-muted">
          <span>Total aktivitas</span>
          <span className="font-bold text-amber-600">{total} item</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-amber-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-700"
            style={{ width: `${Math.min(100, (total / 20) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Jurnal Perkembangan
// ---------------------------------------------------------------------------
function JurnalPerkembangan({ childId, entries, onAdd, onRemove }: {
  childId: string;
  entries: JournalEntry[];
  onAdd: (e: Omit<JournalEntry, 'id'>) => void;
  onRemove: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState<JournalMood>('good');
  const [error, setError] = useState('');

  const childEntries = entries.filter(e => e.childId === childId);

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!title.trim() || !notes.trim()) { setError('Judul dan catatan wajib diisi.'); return; }
    onAdd({ childId, date, title: title.trim(), notes: notes.trim(), mood });
    setTitle(''); setNotes(''); setMood('good'); setDate(new Date().toISOString().slice(0, 10));
    setError(''); setOpen(false);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Form toggle */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 self-start rounded-full bg-amber-500 px-5 py-2 text-[14px] font-bold text-white transition hover:bg-amber-600"
      >
        <Plus className="h-4 w-4" />
        Tambah Catatan
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50/40 p-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[12px] font-semibold text-stv-navy">Tanggal</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full rounded-xl border border-amber-200 px-3 py-2 text-[14px] focus:border-amber-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-semibold text-stv-navy">Kondisi Hari Ini</label>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {MOOD_OPTIONS.map(m => (
                  <button key={m.value} type="button" onClick={() => setMood(m.value)}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                      mood === m.value ? MOOD_STYLE[m.value] + ' ring-2 ring-offset-1 ring-amber-400' : 'bg-white border border-amber-200 text-stv-muted'
                    }`}>
                    {m.icon} {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-stv-navy">Judul Catatan *</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              className="w-full rounded-xl border border-amber-200 px-3 py-2 text-[14px] focus:border-amber-500 focus:outline-none"
              placeholder="mis. Berhasil makan sendiri hari ini!" />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-stv-navy">Catatan *</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              className="w-full resize-none rounded-xl border border-amber-200 px-3 py-2 text-[14px] focus:border-amber-500 focus:outline-none"
              placeholder="Ceritakan perkembangan anak Anda hari ini..." />
          </div>
          {error && <p className="text-[12px] text-red-500">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)}
              className="rounded-full border border-amber-200 px-4 py-1.5 text-[13px] text-stv-muted hover:bg-amber-50">
              Batal
            </button>
            <button type="submit"
              className="rounded-full bg-amber-500 px-4 py-1.5 text-[13px] font-bold text-white hover:bg-amber-600">
              Simpan Catatan
            </button>
          </div>
        </form>
      )}

      {/* Entry list */}
      {childEntries.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-amber-200 py-10 text-center">
          <span className="text-3xl">📝</span>
          <p className="mt-3 text-[15px] font-semibold text-stv-navy">Belum ada catatan perkembangan</p>
          <p className="mt-1 text-[13px] text-stv-muted">Tambahkan catatan pertama untuk melacak perjalanan anak Anda.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {childEntries.map(entry => (
            <div key={entry.id} className="group rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${MOOD_STYLE[entry.mood ?? 'good']}`}>
                    {MOOD_OPTIONS.find(m => m.value === entry.mood)?.label ?? 'Bagus'}
                  </span>
                  <span className="text-[12px] text-stv-muted">{new Date(entry.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <button type="button" onClick={() => onRemove(entry.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-stv-muted opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="font-bold text-stv-navy">{entry.title}</p>
              <p className="mt-1 text-[14px] leading-[1.6] text-stv-body">{entry.notes}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Child detail view
// ---------------------------------------------------------------------------
function ChildDetail({ child }: { child: ChildProfile }) {
  const { updateChild, journalEntries, addJournalEntry, removeJournalEntry } = useDashboardTier2();
  const [editOpen, setEditOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'tipe' | 'perjalanan' | 'jurnal'>('tipe');

  function handleEdit(data: Omit<ChildProfile, 'id'>) {
    updateChild(child.id, data);
    setEditOpen(false);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header card */}
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(16,58,107,.06)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            {child.photo ? (
              <img src={child.photo} alt={child.name} className="h-16 w-16 rounded-full border-4 border-amber-200 object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-amber-200 bg-amber-500 font-baloo text-[28px] font-bold text-white">
                {child.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-baloo text-[20px] font-extrabold text-stv-navy">{child.name}</h3>
            <p className="text-[14px] text-stv-muted">{child.age} tahun</p>
            {child.summary && <p className="mt-1 max-w-[360px] text-[13px] leading-[1.4] text-stv-body">{child.summary}</p>}
            {child.learningStyles.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {child.learningStyles.map(s => (
                  <span key={s} className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${LEARNING_STYLE_INFO[s].color}`}>{s}</span>
                ))}
              </div>
            )}
          </div>
        </div>
        <button type="button" onClick={() => setEditOpen(true)}
          className="flex shrink-0 items-center gap-1.5 self-start rounded-full border border-amber-200 px-4 py-2 text-[13px] font-semibold text-stv-body transition hover:bg-amber-50 sm:self-auto">
          <Edit2 className="h-3.5 w-3.5" /> Edit Profil
        </button>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 rounded-2xl bg-amber-50 p-1">
        {([
          ['tipe', 'Tipe Belajar'],
          ['perjalanan', 'Perjalanan Pembelajaran'],
          ['jurnal', 'Jurnal Perkembangan'],
        ] as const).map(([id, label]) => (
          <button key={id} type="button" onClick={() => setActiveSection(id)}
            className={`flex-1 rounded-xl py-2.5 text-[13px] font-semibold transition ${
              activeSection === id ? 'bg-white font-bold text-amber-700 shadow-sm' : 'text-stv-muted hover:text-amber-700'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Section content */}
      <div className="rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
        {activeSection === 'tipe' && (
          <div className="flex flex-col gap-4">
            <h4 className="font-baloo text-[16px] font-bold text-stv-navy">Tipe Belajar Anak</h4>
            {child.learningStyles.length === 0 ? (
              <p className="rounded-xl bg-amber-50 px-4 py-4 text-[14px] text-stv-muted">
                Belum ada tipe belajar dipilih. Klik &quot;Edit Profil&quot; untuk menambahkan.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {child.learningStyles.map(s => (
                  <div key={s} className={`flex items-start gap-3 rounded-xl p-4 ${LEARNING_STYLE_INFO[s].color.split(' ')[0]}`}>
                    <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white font-bold text-[12px] ${LEARNING_STYLE_INFO[s].color.split(' ')[1]}`}>
                      {s.charAt(0)}
                    </span>
                    <div>
                      <p className={`font-bold ${LEARNING_STYLE_INFO[s].color.split(' ')[1]}`}>{s}</p>
                      <p className="mt-0.5 text-[13px] text-stv-body">{LEARNING_STYLE_INFO[s].desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'perjalanan' && (
          <div className="flex flex-col gap-4">
            <h4 className="font-baloo text-[16px] font-bold text-stv-navy">Perjalanan Pembelajaran</h4>
            <PerjalananPembelajaran childId={child.id} />
          </div>
        )}

        {activeSection === 'jurnal' && (
          <div className="flex flex-col gap-4">
            <h4 className="font-baloo text-[16px] font-bold text-stv-navy">Jurnal Perkembangan</h4>
            <JurnalPerkembangan
              childId={child.id}
              entries={journalEntries}
              onAdd={addJournalEntry}
              onRemove={removeJournalEntry}
            />
          </div>
        )}
      </div>

      {editOpen && (
        <ChildForm
          title={`Edit Profil, ${child.name}`}
          initial={child}
          onSave={handleEdit}
          onCancel={() => setEditOpen(false)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function ProfilAnakTier2() {
  const { children, addChild, removeChild } = useDashboardTier2();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Auto-select first child when available
  const activeId = selectedId ?? children[0]?.id ?? null;
  const activeChild = children.find(c => c.id === activeId) ?? null;

  function handleAdd(data: Omit<ChildProfile, 'id'>) {
    addChild(data);
    setAddOpen(false);
  }

  function handleDelete(id: string) {
    removeChild(id);
    setConfirmDelete(null);
    if (activeId === id) setSelectedId(null);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">Profil Anak</h2>
          <p className="text-[14px] text-stv-muted">Kelola profil dan pantau perjalanan belajar anak Anda.</p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1.5 rounded-full bg-amber-500 px-5 py-2 text-[14px] font-bold text-white transition hover:bg-amber-600"
        >
          <Plus className="h-4 w-4" />
          Tambah Anak
        </button>
      </div>

      {/* Child tabs (if > 1) */}
      {children.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {children.map(c => (
            <div key={c.id} className="flex items-center">
              <button
                type="button"
                onClick={() => setSelectedId(c.id)}
                className={`flex items-center gap-2 rounded-l-full px-4 py-2 text-[14px] font-semibold transition ${
                  c.id === activeId ? 'bg-amber-500 text-white' : 'bg-white border border-amber-200 text-stv-body hover:bg-amber-50'
                }`}
              >
                <div className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${c.id === activeId ? 'bg-white/30 text-white' : 'bg-amber-100 text-amber-700'}`}>
                  {c.name.charAt(0).toUpperCase()}
                </div>
                {c.name}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(c.id)}
                className={`flex h-[38px] items-center rounded-r-full border-l px-2.5 text-stv-muted transition hover:text-red-500 ${
                  c.id === activeId ? 'bg-amber-500 border-white/30' : 'bg-white border-amber-200 hover:bg-red-50'
                }`}
                aria-label={`Hapus ${c.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {children.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-amber-200 py-16 text-center">
          <Baby className="h-14 w-14 text-amber-300" strokeWidth={1.5} />
          <p className="mt-4 font-baloo text-[18px] font-bold text-stv-navy">Belum ada profil anak</p>
          <p className="mt-2 max-w-[340px] text-[14px] text-stv-muted">
            Tambahkan profil anak untuk mulai mencatat perjalanan belajar dan perkembangannya.
          </p>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="mt-5 flex items-center gap-1.5 rounded-full bg-amber-500 px-6 py-2.5 text-[14px] font-bold text-white transition hover:bg-amber-600"
          >
            <Plus className="h-4 w-4" />
            Tambahkan Profil Anak
          </button>
        </div>
      )}

      {/* Active child detail */}
      {activeChild && <ChildDetail child={activeChild} />}

      {/* Single child with delete option */}
      {children.length === 1 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setConfirmDelete(children[0].id)}
            className="flex items-center gap-1.5 text-[13px] text-stv-muted transition hover:text-red-500"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Hapus profil ini
          </button>
        </div>
      )}

      {/* Add form modal */}
      {addOpen && (
        <ChildForm
          title="Tambah Profil Anak"
          onSave={handleAdd}
          onCancel={() => setAddOpen(false)}
        />
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stv-navy/30 px-4">
          <div className="w-full max-w-[360px] rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="font-baloo text-[18px] font-bold text-stv-navy">Hapus profil anak?</h3>
            <p className="mt-2 text-[14px] text-stv-muted">
              Semua data jurnal dan catatan untuk profil ini akan terhapus dan tidak bisa dikembalikan.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmDelete(null)}
                className="rounded-full border border-amber-200 px-4 py-2 text-[13px] font-semibold text-stv-muted hover:bg-amber-50">
                Batal
              </button>
              <button type="button" onClick={() => handleDelete(confirmDelete)}
                className="rounded-full bg-red-500 px-4 py-2 text-[13px] font-bold text-white hover:bg-red-600">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
