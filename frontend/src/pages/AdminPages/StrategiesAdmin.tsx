import React, { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Search, X, Save, ChevronDown, ChevronUp, EyeOff, Send } from 'lucide-react';
import { useLearningStrategies } from '../../context/LearningStrategiesContext';
import {
  AGE_RANGES, DOMAIN_META,
  Activity, WeeklyPlan, EduTool, Downloadable, DomainKey, DownloadKategori, ContentStatus,
} from '../../data/learningStrategies';

// ── helpers ──────────────────────────────────────────────────────────────────

const DOMAIN_KEYS = Object.keys(DOMAIN_META) as DomainKey[];
const KATEGORI_OPTIONS: DownloadKategori[] = ['Buku Cerita', 'Flashcard', 'Worksheet', 'Checklist', 'Panduan'];

function ageStr(min: number, max: number) {
  const f = (m: number) => m >= 12 ? `${Math.floor(m / 12)} thn` : `${m} bln`;
  return `${f(min)} - ${f(max)}`;
}

// ── shared form field components ─────────────────────────────────────────────

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[12px] font-semibold text-stv-navy">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inp = "w-full rounded-xl border border-stv-border px-3 py-2 text-[13px] focus:border-amber-400 focus:outline-none";
const ta  = `${inp} resize-none`;

// ── Activity Form ─────────────────────────────────────────────────────────────

type AForm = Omit<Activity, 'id' | 'bahan' | 'langkah' | 'domain'> & {
  bahanText: string; langkahText: string; domain: DomainKey[];
};

const EMPTY_AFORM: AForm = {
  icon: '🎯', judul: '', ageId: 'b03', domain: ['mk'],
  durasiMenit: 15, isDIY: true,
  deskripsi: '', sci: '', sumber: '', tujuan: '',
  bahanText: '', langkahText: '',
  variasiMudah: '', variasiMenantang: '', adaptasiABK: '',
};

function toAForm(a: Activity): AForm {
  return {
    ...a,
    bahanText: a.bahan.map(b => b.nama).join('\n'),
    langkahText: a.langkah.join('\n'),
  };
}

function fromAForm(f: AForm, id?: number): Activity {
  return {
    id: id ?? 0,
    icon: f.icon, judul: f.judul, ageId: f.ageId, domain: f.domain,
    durasiMenit: f.durasiMenit, isDIY: f.isDIY,
    deskripsi: f.deskripsi, sci: f.sci, sumber: f.sumber, tujuan: f.tujuan,
    bahan: f.bahanText.split('\n').filter(Boolean).map(n => ({ nama: n.trim(), affiliateUrl: '#todo' })),
    langkah: f.langkahText.split('\n').filter(Boolean).map(s => s.trim()),
    variasiMudah: f.variasiMudah, variasiMenantang: f.variasiMenantang, adaptasiABK: f.adaptasiABK,
  };
}

function ActivityModal({ initial, id, onClose }: { initial: AForm; id?: number; onClose: () => void }) {
  const { adminAddActivity, adminUpdateActivity } = useLearningStrategies();
  const [form, setForm] = useState<AForm>(initial);
  const [err, setErr] = useState('');

  function save(status: ContentStatus) {
    if (!form.judul.trim() || !form.deskripsi.trim()) { setErr('Judul dan deskripsi wajib diisi.'); return; }
    const a = { ...fromAForm(form, id), status };
    if (id !== undefined) adminUpdateActivity(id, a);
    else adminAddActivity(a);
    onClose();
  }

  function submit(e: React.FormEvent) { e.preventDefault(); save('published'); }

  function toggleDomain(d: DomainKey) {
    setForm(f => ({
      ...f,
      domain: f.domain.includes(d) ? f.domain.filter(x => x !== d) : [...f.domain, d],
    }));
  }

  return (
    <Modal title={id !== undefined ? 'Edit Aktivitas' : 'Tambah Aktivitas'} onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ikon (emoji)" required>
            <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} className={inp} />
          </Field>
          <Field label="Kelompok Usia" required>
            <select value={form.ageId} onChange={e => setForm(f => ({ ...f, ageId: e.target.value }))} className={inp}>
              {AGE_RANGES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Judul" required>
          <input value={form.judul} onChange={e => setForm(f => ({ ...f, judul: e.target.value }))} className={inp} />
        </Field>

        <Field label="Domain (pilih satu atau lebih)">
          <div className="flex flex-wrap gap-1.5 pt-1">
            {DOMAIN_KEYS.map(d => {
              const m = DOMAIN_META[d];
              const active = form.domain.includes(d);
              return (
                <button key={d} type="button" onClick={() => toggleDomain(d)}
                  className="rounded-full px-2.5 py-1 text-[11px] font-bold transition"
                  style={active ? { background: m.bg, color: m.color, outline: `2px solid ${m.color}` } : { background: '#F1F5F9', color: '#64748B' }}>
                  {m.emoji} {m.label}
                </button>
              );
            })}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Durasi (menit)">
            <input type="number" min={1} value={form.durasiMenit}
              onChange={e => setForm(f => ({ ...f, durasiMenit: Number(e.target.value) }))} className={inp} />
          </Field>
          <Field label="Tipe">
            <div className="flex gap-2 pt-1">
              {[true, false].map(v => (
                <button key={String(v)} type="button" onClick={() => setForm(f => ({ ...f, isDIY: v }))}
                  className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition ${form.isDIY === v ? 'bg-amber-500 text-white' : 'bg-slate-100 text-stv-body'}`}>
                  {v ? 'DIY (tanpa alat)' : 'Perlu Alat'}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <Field label="Deskripsi Singkat" required>
          <textarea value={form.deskripsi} onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))} rows={2} className={ta} />
        </Field>

        <Field label="Tujuan">
          <textarea value={form.tujuan} onChange={e => setForm(f => ({ ...f, tujuan: e.target.value }))} rows={2} className={ta} />
        </Field>

        <Field label="Bukti Ilmiah (sci)">
          <textarea value={form.sci} onChange={e => setForm(f => ({ ...f, sci: e.target.value }))} rows={2} className={ta} />
        </Field>

        <Field label="Sumber / Referensi">
          <input value={form.sumber} onChange={e => setForm(f => ({ ...f, sumber: e.target.value }))} className={inp} />
        </Field>

        <Field label="Bahan (satu per baris, kosongkan jika DIY)">
          <textarea value={form.bahanText} onChange={e => setForm(f => ({ ...f, bahanText: e.target.value }))} rows={3} className={ta} placeholder="Alas bermain&#10;Cermin bayi" />
        </Field>

        <Field label="Langkah-Langkah (satu per baris)">
          <textarea value={form.langkahText} onChange={e => setForm(f => ({ ...f, langkahText: e.target.value }))} rows={4} className={ta} placeholder="Langkah 1...&#10;Langkah 2..." />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Variasi Lebih Mudah">
            <textarea value={form.variasiMudah} onChange={e => setForm(f => ({ ...f, variasiMudah: e.target.value }))} rows={2} className={ta} />
          </Field>
          <Field label="Variasi Lebih Menantang">
            <textarea value={form.variasiMenantang} onChange={e => setForm(f => ({ ...f, variasiMenantang: e.target.value }))} rows={2} className={ta} />
          </Field>
        </div>

        <Field label="Adaptasi untuk Anak dengan Kebutuhan Khusus">
          <textarea value={form.adaptasiABK} onChange={e => setForm(f => ({ ...f, adaptasiABK: e.target.value }))} rows={2} className={ta} />
        </Field>

        {err && <p className="text-[12px] text-red-500">{err}</p>}
        <ModalFooter onClose={onClose} onSaveDraft={() => save('draft')} />
      </form>
    </Modal>
  );
}

// ── Plan Form ─────────────────────────────────────────────────────────────────

type PForm = Omit<WeeklyPlan, 'id'>;

const EMPTY_PFORM: PForm = {
  icon: '📅', judul: '', ageLabel: '', minBulan: 0, maxBulan: 12,
  deskripsi: '', sci: '', sumber: '', caraPakai: '',
  hari: Array.from({ length: 7 }, (_, i) => ({ judul: `Hari ${i + 1}`, deskripsi: '', activityIds: [] })),
};

function PlanModal({ initial, id, onClose }: { initial: PForm; id?: number; onClose: () => void }) {
  const { adminAddPlan, adminUpdatePlan } = useLearningStrategies();
  const [form, setForm] = useState<PForm>(initial);
  const [err, setErr] = useState('');
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  function updateHari(i: number, patch: Partial<PForm['hari'][0]>) {
    setForm(f => {
      const hari = [...f.hari];
      hari[i] = { ...hari[i], ...patch };
      return { ...f, hari };
    });
  }

  function save(status: ContentStatus) {
    if (!form.judul.trim()) { setErr('Judul wajib diisi.'); return; }
    const payload = { ...form, status };
    if (id !== undefined) adminUpdatePlan(id, payload);
    else adminAddPlan(payload);
    onClose();
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    save('published');
  }

  return (
    <Modal title={id !== undefined ? 'Edit Program Mingguan' : 'Tambah Program'} onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ikon"><input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} className={inp} /></Field>
          <Field label="Label Usia"><input value={form.ageLabel} onChange={e => setForm(f => ({ ...f, ageLabel: e.target.value }))} className={inp} placeholder="0-3 bulan" /></Field>
        </div>
        <Field label="Judul" required><input value={form.judul} onChange={e => setForm(f => ({ ...f, judul: e.target.value }))} className={inp} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Usia Min (bulan)"><input type="number" min={0} value={form.minBulan} onChange={e => setForm(f => ({ ...f, minBulan: Number(e.target.value) }))} className={inp} /></Field>
          <Field label="Usia Max (bulan)"><input type="number" min={0} value={form.maxBulan} onChange={e => setForm(f => ({ ...f, maxBulan: Number(e.target.value) }))} className={inp} /></Field>
        </div>
        <Field label="Deskripsi"><textarea value={form.deskripsi} onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))} rows={2} className={ta} /></Field>
        <Field label="Bukti Ilmiah"><textarea value={form.sci} onChange={e => setForm(f => ({ ...f, sci: e.target.value }))} rows={2} className={ta} /></Field>
        <Field label="Sumber"><input value={form.sumber} onChange={e => setForm(f => ({ ...f, sumber: e.target.value }))} className={inp} /></Field>
        <Field label="Cara Menggunakan"><textarea value={form.caraPakai} onChange={e => setForm(f => ({ ...f, caraPakai: e.target.value }))} rows={2} className={ta} /></Field>

        <div>
          <p className="mb-2 text-[12px] font-semibold text-stv-navy">7 Hari Program</p>
          <div className="flex flex-col gap-1.5">
            {form.hari.map((h, i) => (
              <div key={i} className="rounded-xl border border-slate-100 overflow-hidden">
                <button type="button" onClick={() => setExpandedDay(expandedDay === i ? null : i)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-[13px] font-semibold text-stv-navy hover:bg-slate-50">
                  {h.judul || `Hari ${i + 1}`}
                  {expandedDay === i ? <ChevronUp className="h-4 w-4 text-stv-muted" /> : <ChevronDown className="h-4 w-4 text-stv-muted" />}
                </button>
                {expandedDay === i && (
                  <div className="flex flex-col gap-2 border-t border-slate-100 p-3">
                    <input value={h.judul} onChange={e => updateHari(i, { judul: e.target.value })}
                      placeholder={`Judul Hari ${i + 1}`} className={inp} />
                    <textarea value={h.deskripsi} onChange={e => updateHari(i, { deskripsi: e.target.value })}
                      rows={2} placeholder="Deskripsi singkat hari ini..." className={ta} />
                    <input value={h.activityIds.join(', ')} onChange={e => updateHari(i, { activityIds: e.target.value.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n) && n > 0) })}
                      placeholder="ID aktivitas (pisah koma): 1, 5, 12" className={inp} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {err && <p className="text-[12px] text-red-500">{err}</p>}
        <ModalFooter onClose={onClose} onSaveDraft={() => save('draft')} />
      </form>
    </Modal>
  );
}

// ── Tool Form ─────────────────────────────────────────────────────────────────

type TForm = Omit<EduTool, 'id' | 'keunggulan'> & { keunggulanText: string };

const EMPTY_TFORM: TForm = {
  icon: '🧸', nama: '', hargaEstimasi: '', pilihanPsikolog: false,
  minBulan: 0, maxBulan: 12, ageLabel: '',
  deskripsi: '', sci: '', sumber: '', keunggulanText: '', affiliateUrl: '#todo',
};

function ToolModal({ initial, id, onClose }: { initial: TForm; id?: number; onClose: () => void }) {
  const { adminAddTool, adminUpdateTool } = useLearningStrategies();
  const [form, setForm] = useState<TForm>(initial);
  const [err, setErr] = useState('');

  function save(status: ContentStatus) {
    if (!form.nama.trim()) { setErr('Nama wajib diisi.'); return; }
    const t: Omit<EduTool, 'id'> = { ...form, status, keunggulan: form.keunggulanText.split('\n').filter(Boolean).map(s => s.trim()) };
    if (id !== undefined) adminUpdateTool(id, t);
    else adminAddTool(t);
    onClose();
  }

  function submit(e: React.FormEvent) { e.preventDefault(); save('published'); }

  return (
    <Modal title={id !== undefined ? 'Edit Alat Edukasi' : 'Tambah Alat Edukasi'} onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ikon"><input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} className={inp} /></Field>
          <Field label="Label Usia"><input value={form.ageLabel} onChange={e => setForm(f => ({ ...f, ageLabel: e.target.value }))} className={inp} /></Field>
        </div>
        <Field label="Nama Alat" required><input value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} className={inp} /></Field>
        <Field label="Estimasi Harga"><input value={form.hargaEstimasi} onChange={e => setForm(f => ({ ...f, hargaEstimasi: e.target.value }))} className={inp} placeholder="Rp 50.000 - 120.000" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Usia Min (bulan)"><input type="number" min={0} value={form.minBulan} onChange={e => setForm(f => ({ ...f, minBulan: Number(e.target.value) }))} className={inp} /></Field>
          <Field label="Usia Max (bulan)"><input type="number" min={0} value={form.maxBulan} onChange={e => setForm(f => ({ ...f, maxBulan: Number(e.target.value) }))} className={inp} /></Field>
        </div>
        <Field label="Pilihan Psikolog">
          <button type="button" onClick={() => setForm(f => ({ ...f, pilihanPsikolog: !f.pilihanPsikolog }))}
            className={`rounded-full px-4 py-1.5 text-[12px] font-semibold transition ${form.pilihanPsikolog ? 'bg-violet-500 text-white' : 'bg-slate-100 text-stv-body'}`}>
            {form.pilihanPsikolog ? '⭐ Pilihan Psikolog' : 'Bukan Pilihan Psikolog'}
          </button>
        </Field>
        <Field label="Deskripsi"><textarea value={form.deskripsi} onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))} rows={2} className={ta} /></Field>
        <Field label="Bukti Ilmiah"><textarea value={form.sci} onChange={e => setForm(f => ({ ...f, sci: e.target.value }))} rows={2} className={ta} /></Field>
        <Field label="Sumber"><input value={form.sumber} onChange={e => setForm(f => ({ ...f, sumber: e.target.value }))} className={inp} /></Field>
        <Field label="Keunggulan (satu per baris)">
          <textarea value={form.keunggulanText} onChange={e => setForm(f => ({ ...f, keunggulanText: e.target.value }))} rows={3} className={ta} placeholder="Keunggulan 1...&#10;Keunggulan 2..." />
        </Field>
        <Field label="Link Afiliasi (opsional)"><input value={form.affiliateUrl} onChange={e => setForm(f => ({ ...f, affiliateUrl: e.target.value }))} className={inp} /></Field>
        {err && <p className="text-[12px] text-red-500">{err}</p>}
        <ModalFooter onClose={onClose} onSaveDraft={() => save('draft')} />
      </form>
    </Modal>
  );
}

// ── Download Form ─────────────────────────────────────────────────────────────

type DForm = Omit<Downloadable, 'id'>;

const EMPTY_DFORM: DForm = {
  icon: '📄', nama: '', kategori: 'Panduan', minBulan: 0, maxBulan: 72,
  deskripsi: '', sci: '', sumber: '', caraPakai: '',
  halaman: '', jumlahUnduhan: 0, fileUrl: '#todo',
};

function DownloadModal({ initial, id, onClose }: { initial: DForm; id?: number; onClose: () => void }) {
  const { adminAddDownload, adminUpdateDownload } = useLearningStrategies();
  const [form, setForm] = useState<DForm>(initial);
  const [err, setErr] = useState('');

  function save(status: ContentStatus) {
    if (!form.nama.trim()) { setErr('Nama wajib diisi.'); return; }
    const payload = { ...form, status };
    if (id !== undefined) adminUpdateDownload(id, payload);
    else adminAddDownload(payload);
    onClose();
  }

  function submit(e: React.FormEvent) { e.preventDefault(); save('published'); }

  return (
    <Modal title={id !== undefined ? 'Edit Materi Unduhan' : 'Tambah Unduhan'} onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ikon"><input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} className={inp} /></Field>
          <Field label="Kategori">
            <select value={form.kategori} onChange={e => setForm(f => ({ ...f, kategori: e.target.value as DownloadKategori }))} className={inp}>
              {KATEGORI_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Nama Materi" required><input value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} className={inp} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Usia Min (bulan)"><input type="number" min={0} value={form.minBulan} onChange={e => setForm(f => ({ ...f, minBulan: Number(e.target.value) }))} className={inp} /></Field>
          <Field label="Usia Max (bulan)"><input type="number" min={0} value={form.maxBulan} onChange={e => setForm(f => ({ ...f, maxBulan: Number(e.target.value) }))} className={inp} /></Field>
        </div>
        <Field label="Jumlah Halaman"><input value={form.halaman} onChange={e => setForm(f => ({ ...f, halaman: e.target.value }))} className={inp} placeholder="8 halaman" /></Field>
        <Field label="Deskripsi"><textarea value={form.deskripsi} onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))} rows={2} className={ta} /></Field>
        <Field label="Bukti Ilmiah"><textarea value={form.sci} onChange={e => setForm(f => ({ ...f, sci: e.target.value }))} rows={2} className={ta} /></Field>
        <Field label="Sumber"><input value={form.sumber} onChange={e => setForm(f => ({ ...f, sumber: e.target.value }))} className={inp} /></Field>
        <Field label="Cara Menggunakan"><textarea value={form.caraPakai} onChange={e => setForm(f => ({ ...f, caraPakai: e.target.value }))} rows={2} className={ta} /></Field>
        <Field label="URL File (TODO: upload)"><input value={form.fileUrl} onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value }))} className={inp} /></Field>
        {err && <p className="text-[12px] text-red-500">{err}</p>}
        <ModalFooter onClose={onClose} onSaveDraft={() => save('draft')} />
      </form>
    </Modal>
  );
}

// ── shared modal shell ────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stv-navy/30 px-4 py-8"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-[600px] rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(16,58,107,.2)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-baloo text-[17px] font-bold text-stv-navy">{title}</h2>
          <button type="button" onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-stv-muted hover:bg-slate-200">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalFooter({ onClose, onSaveDraft }: { onClose: () => void; onSaveDraft?: () => void }) {
  return (
    <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
      <button type="button" onClick={onClose}
        className="rounded-full border border-stv-border px-4 py-2 text-[13px] font-semibold text-stv-body hover:bg-slate-50">
        Batal
      </button>
      <div className="flex gap-2">
        {onSaveDraft && (
          <button type="button" onClick={onSaveDraft}
            className="flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-2 text-[13px] font-semibold text-stv-body hover:bg-slate-50">
            <Save className="h-3.5 w-3.5" /> Simpan Draft
          </button>
        )}
        <button type="submit"
          className="flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-[13px] font-bold text-white hover:bg-amber-600">
          <Send className="h-3.5 w-3.5" /> Terbitkan
        </button>
      </div>
    </div>
  );
}

// ── Main Admin Page ───────────────────────────────────────────────────────────

type TabKey = 'aktivitas' | 'program' | 'alat' | 'unduhan';

export default function StrategiesAdmin() {
  const {
    managedActivities, managedPlans, managedTools, managedDownloads,
    adminDeleteActivity, adminDeletePlan, adminDeleteTool, adminDeleteDownload,
    adminSetStatus,
  } = useLearningStrategies();

  const [activeTab, setActiveTab] = useState<TabKey>('aktivitas');
  const [search, setSearch] = useState('');
  const [filterAge, setFilterAge] = useState('all');

  // Modals
  const [activityModal, setActivityModal] = useState<{ form: AForm; id?: number } | null>(null);
  const [planModal, setPlanModal]         = useState<{ form: PForm; id?: number } | null>(null);
  const [toolModal, setToolModal]         = useState<{ form: TForm; id?: number } | null>(null);
  const [downloadModal, setDownloadModal] = useState<{ form: DForm; id?: number } | null>(null);

  const filteredActs = useMemo(() => {
    const qs = search.toLowerCase();
    return managedActivities.filter(a =>
      (!search || a.judul.toLowerCase().includes(qs) || a.deskripsi.toLowerCase().includes(qs)) &&
      (filterAge === 'all' || a.ageId === filterAge)
    );
  }, [managedActivities, search, filterAge]);

  const filteredPlans = useMemo(() => {
    const qs = search.toLowerCase();
    const r = filterAge !== 'all' ? AGE_RANGES.find(x => x.id === filterAge) : null;
    return managedPlans.filter(p =>
      (!search || p.judul.toLowerCase().includes(qs)) &&
      (!r || (p.minBulan < r.max && p.maxBulan > r.min))
    );
  }, [managedPlans, search, filterAge]);

  const filteredTools = useMemo(() => {
    const qs = search.toLowerCase();
    const r = filterAge !== 'all' ? AGE_RANGES.find(x => x.id === filterAge) : null;
    return managedTools.filter(t =>
      (!search || t.nama.toLowerCase().includes(qs) || t.deskripsi.toLowerCase().includes(qs)) &&
      (!r || (t.minBulan < r.max && t.maxBulan > r.min))
    );
  }, [managedTools, search, filterAge]);

  const filteredDls = useMemo(() => {
    const qs = search.toLowerCase();
    const r = filterAge !== 'all' ? AGE_RANGES.find(x => x.id === filterAge) : null;
    return managedDownloads.filter(d =>
      (!search || d.nama.toLowerCase().includes(qs)) &&
      (!r || (d.minBulan < r.max && d.maxBulan > r.min))
    );
  }, [managedDownloads, search, filterAge]);

  const TABS: { id: TabKey; label: string; count: number }[] = [
    { id: 'aktivitas', label: 'Aktivitas',      count: managedActivities.length },
    { id: 'program',   label: 'Program Mingguan', count: managedPlans.length },
    { id: 'alat',      label: 'Alat Edukasi',    count: managedTools.length },
    { id: 'unduhan',   label: 'Unduhan',          count: managedDownloads.length },
  ];

  function confirmDelete(label: string, onConfirm: () => void) {
    if (window.confirm(`Hapus "${label}"? Tindakan ini tidak bisa dibatalkan.`)) onConfirm();
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">Learning Strategies</h2>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-[13px]">
            <span className="text-stv-muted">
              Total: <strong className="text-stv-navy">{managedActivities.length + managedPlans.length + managedTools.length + managedDownloads.length}</strong> konten
            </span>
            {(() => {
              const draftCount = [managedActivities, managedPlans, managedTools, managedDownloads]
                .flat().filter(x => x.status === 'draft').length;
              return draftCount > 0 ? (
                <span className="rounded-full bg-amber-100 px-3 py-0.5 font-semibold text-amber-700">
                  {draftCount} Draft belum diterbitkan
                </span>
              ) : (
                <span className="rounded-full bg-green-100 px-3 py-0.5 font-semibold text-green-700">
                  Semua konten sudah terbit
                </span>
              );
            })()}
            <span className="text-amber-500 font-medium">TODO: sambungkan ke backend</span>
          </div>
        </div>
        <button type="button"
          onClick={() => {
            if (activeTab === 'aktivitas') setActivityModal({ form: EMPTY_AFORM });
            else if (activeTab === 'program') setPlanModal({ form: EMPTY_PFORM });
            else if (activeTab === 'alat') setToolModal({ form: EMPTY_TFORM });
            else setDownloadModal({ form: EMPTY_DFORM });
          }}
          className="flex items-center gap-1.5 rounded-full bg-amber-500 px-5 py-2.5 text-[14px] font-bold text-white hover:bg-amber-600 transition">
          <Plus className="h-4 w-4" />
          Tambah {activeTab === 'aktivitas' ? 'Aktivitas' : activeTab === 'program' ? 'Program' : activeTab === 'alat' ? 'Alat' : 'Unduhan'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stv-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari judul..."
            className="w-full rounded-full border border-slate-200 bg-white py-2 pl-10 pr-4 text-[13px] focus:border-amber-400 focus:outline-none" />
        </div>
        <select value={filterAge} onChange={e => setFilterAge(e.target.value)}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[13px] focus:border-amber-400 focus:outline-none">
          <option value="all">Semua Usia</option>
          {AGE_RANGES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-100">
        {TABS.map(tab => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-[13px] font-semibold transition ${
              activeTab === tab.id ? 'border-amber-500 text-amber-600' : 'border-transparent text-stv-muted hover:text-stv-body'
            }`}>
            {tab.label}
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeTab === tab.id ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Aktivitas tab ─── */}
      {activeTab === 'aktivitas' && (
        <div className="flex flex-col gap-2">
          {filteredActs.length === 0
            ? <Empty label="aktivitas" />
            : filteredActs.map(a => (
              <Row key={a.id}
                icon={a.icon} title={a.judul} status={a.status}
                meta={[AGE_RANGES.find(r => r.id === a.ageId)?.label ?? a.ageId, `${a.durasiMenit} mnt`, a.isDIY ? 'DIY' : 'Perlu Alat']}
                onEdit={() => setActivityModal({ form: toAForm(a), id: a.id })}
                onDelete={() => confirmDelete(a.judul, () => adminDeleteActivity(a.id))}
                onToggleStatus={() => adminSetStatus('activity', a.id, a.status === 'draft' ? 'published' : 'draft')}
              />
            ))}
        </div>
      )}

      {/* ── Program tab ─── */}
      {activeTab === 'program' && (
        <div className="flex flex-col gap-2">
          {filteredPlans.length === 0
            ? <Empty label="program" />
            : filteredPlans.map(p => (
              <Row key={p.id}
                icon={p.icon} title={p.judul} status={p.status}
                meta={[p.ageLabel, ageStr(p.minBulan, p.maxBulan), `${p.hari.length} hari`]}
                onEdit={() => setPlanModal({ form: { icon: p.icon, judul: p.judul, ageLabel: p.ageLabel, minBulan: p.minBulan, maxBulan: p.maxBulan, deskripsi: p.deskripsi, sci: p.sci, sumber: p.sumber, caraPakai: p.caraPakai, hari: p.hari }, id: p.id })}
                onDelete={() => confirmDelete(p.judul, () => adminDeletePlan(p.id))}
                onToggleStatus={() => adminSetStatus('plan', p.id, p.status === 'draft' ? 'published' : 'draft')}
              />
            ))}
        </div>
      )}

      {/* ── Alat Edukasi tab ─── */}
      {activeTab === 'alat' && (
        <div className="flex flex-col gap-2">
          {filteredTools.length === 0
            ? <Empty label="alat edukasi" />
            : filteredTools.map(t => (
              <Row key={t.id}
                icon={t.icon} title={t.nama} status={t.status}
                meta={[t.ageLabel, t.hargaEstimasi, t.pilihanPsikolog ? '⭐ Pilihan Psikolog' : '']}
                onEdit={() => setToolModal({ form: { icon: t.icon, nama: t.nama, hargaEstimasi: t.hargaEstimasi, pilihanPsikolog: t.pilihanPsikolog, minBulan: t.minBulan, maxBulan: t.maxBulan, ageLabel: t.ageLabel, deskripsi: t.deskripsi, sci: t.sci, sumber: t.sumber, keunggulanText: t.keunggulan.join('\n'), affiliateUrl: t.affiliateUrl }, id: t.id })}
                onDelete={() => confirmDelete(t.nama, () => adminDeleteTool(t.id))}
                onToggleStatus={() => adminSetStatus('tool', t.id, t.status === 'draft' ? 'published' : 'draft')}
              />
            ))}
        </div>
      )}

      {/* ── Unduhan tab ─── */}
      {activeTab === 'unduhan' && (
        <div className="flex flex-col gap-2">
          {filteredDls.length === 0
            ? <Empty label="unduhan" />
            : filteredDls.map(d => (
              <Row key={d.id}
                icon={d.icon} title={d.nama} status={d.status}
                meta={[d.kategori, ageStr(d.minBulan, d.maxBulan), d.halaman]}
                onEdit={() => setDownloadModal({ form: { icon: d.icon, nama: d.nama, kategori: d.kategori, minBulan: d.minBulan, maxBulan: d.maxBulan, deskripsi: d.deskripsi, sci: d.sci, sumber: d.sumber, caraPakai: d.caraPakai, halaman: d.halaman, jumlahUnduhan: d.jumlahUnduhan, fileUrl: d.fileUrl }, id: d.id })}
                onDelete={() => confirmDelete(d.nama, () => adminDeleteDownload(d.id))}
                onToggleStatus={() => adminSetStatus('download', d.id, d.status === 'draft' ? 'published' : 'draft')}
              />
            ))}
        </div>
      )}

      {/* Modals */}
      {activityModal && (
        <ActivityModal initial={activityModal.form} id={activityModal.id} onClose={() => setActivityModal(null)} />
      )}
      {planModal && (
        <PlanModal initial={planModal.form} id={planModal.id} onClose={() => setPlanModal(null)} />
      )}
      {toolModal && (
        <ToolModal initial={toolModal.form} id={toolModal.id} onClose={() => setToolModal(null)} />
      )}
      {downloadModal && (
        <DownloadModal initial={downloadModal.form} id={downloadModal.id} onClose={() => setDownloadModal(null)} />
      )}
    </div>
  );
}

// ── shared row component ──────────────────────────────────────────────────────

function Row({ icon, title, meta, status, onEdit, onDelete, onToggleStatus }: {
  icon: string; title: string; meta: string[];
  status?: ContentStatus;
  onEdit: () => void; onDelete: () => void; onToggleStatus: () => void;
}) {
  const isDraft = status === 'draft';
  return (
    <div className={`flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_2px_8px_rgba(16,58,107,.05)] ${isDraft ? 'border-l-4 border-amber-300' : ''}`}>
      <span className="shrink-0 text-xl opacity-60" style={isDraft ? { filter: 'grayscale(60%)' } : {}}>{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`font-semibold text-[14px] truncate ${isDraft ? 'text-stv-muted' : 'text-stv-navy'}`}>{title}</p>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${isDraft ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
            {isDraft ? 'Draft' : 'Terbit'}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-0.5">
          {meta.filter(Boolean).map((m, i) => (
            <span key={i} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">{m}</span>
          ))}
        </div>
      </div>
      <div className="flex shrink-0 gap-1.5">
        <button type="button" onClick={onToggleStatus} title={isDraft ? 'Terbitkan' : 'Jadikan Draft'}
          className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${isDraft ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-slate-50 text-stv-muted hover:bg-slate-100'}`}>
          {isDraft ? <Send className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        </button>
        <button type="button" onClick={onEdit}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition">
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button type="button" onClick={onDelete}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="py-12 text-center text-stv-muted">
      <p className="font-semibold">Tidak ada {label} yang cocok</p>
      <p className="text-[13px] mt-1">Ubah filter atau tambahkan {label} baru.</p>
    </div>
  );
}
