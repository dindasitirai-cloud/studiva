import React, { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Search, X, Save, Send, EyeOff } from 'lucide-react';
import { useKnowledgeLibrary } from '../../context/KnowledgeLibraryContext';
import {
  KnowledgeCard, AgeKey, DomainCode,
  AGE_RANGES, DOMAIN_MAP,
} from '../DashboardPages/Tier2/knowledgeCardData';

// ── helpers ───────────────────────────────────────────────────────────────────

const DOMAIN_CODES = Object.keys(DOMAIN_MAP) as DomainCode[];

const inp = "w-full rounded-xl border border-stv-border px-3 py-2 text-[13px] focus:border-amber-400 focus:outline-none";
const ta  = `${inp} resize-none`;

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[12px] font-semibold text-stv-navy">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
        {hint && <span className="ml-1.5 font-normal text-stv-muted">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

// ── Form type ─────────────────────────────────────────────────────────────────

interface CardForm {
  id: string;
  ageKey: AgeKey;
  domain: DomainCode;
  title: string;
  readMinutes: number;
  isMedical: boolean;
  photoSrc: string;
  photoAlt: string;
  photoCredit: string;
  terjadi: string;
  penting: string;
  lakukanText: string;
  perhatian: string;
  sciTitle: string;
  sciParagraphsText: string;
  sourcesText: string;
}

const EMPTY_FORM: CardForm = {
  id: '', ageKey: '0-3m', domain: 'FM', title: '',
  readMinutes: 3, isMedical: false,
  photoSrc: '', photoAlt: '', photoCredit: '',
  terjadi: '', penting: '', lakukanText: '', perhatian: '',
  sciTitle: '', sciParagraphsText: '', sourcesText: '',
};

function toForm(c: KnowledgeCard): CardForm {
  return {
    id: c.id,
    ageKey: c.ageKey,
    domain: c.domain,
    title: c.title,
    readMinutes: c.readMinutes,
    isMedical: c.isMedical ?? false,
    photoSrc: c.photo.src,
    photoAlt: c.photo.alt,
    photoCredit: c.photo.credit ?? '',
    terjadi: c.summary.terjadi,
    penting: c.summary.penting,
    lakukanText: c.summary.lakukan.join('\n'),
    perhatian: c.summary.perhatian,
    sciTitle: c.scientific.title,
    sciParagraphsText: (c.scientific.paragraphs ?? []).join('\n\n'),
    sourcesText: c.sources.join('\n'),
  };
}

function fromForm(f: CardForm, existing?: KnowledgeCard): KnowledgeCard {
  return {
    id: f.id.trim(),
    ageKey: f.ageKey,
    domain: f.domain,
    title: f.title.trim(),
    readMinutes: f.readMinutes,
    isMedical: f.isMedical,
    photo: {
      src: f.photoSrc.trim() || `/images/rl/${f.id.trim()}.jpg`,
      alt: f.photoAlt.trim() || f.title.trim(),
      credit: f.photoCredit.trim() || undefined,
    },
    summary: {
      terjadi: f.terjadi.trim(),
      penting: f.penting.trim(),
      lakukan: f.lakukanText.split('\n').map(s => s.trim()).filter(Boolean),
      perhatian: f.perhatian.trim(),
    },
    scientific: {
      // preserve complex fields (sections, references, stats, figure) from existing
      ...(existing?.scientific ?? {}),
      title: f.sciTitle.trim(),
      paragraphs: f.sciParagraphsText.split('\n\n').map(s => s.trim()).filter(Boolean),
    },
    sources: f.sourcesText.split('\n').map(s => s.trim()).filter(Boolean),
    adminStatus: existing?.adminStatus,
  };
}

// ── Card Form Modal ───────────────────────────────────────────────────────────

function CardFormModal({ initial, existing, onClose }: {
  initial: CardForm;
  existing?: KnowledgeCard;
  onClose: () => void;
}) {
  const { adminAddCard, adminUpdateCard } = useKnowledgeLibrary();
  const [form, setForm] = useState<CardForm>(initial);
  const [err, setErr] = useState('');
  const isEdit = !!existing;

  function save(status: 'draft' | 'published') {
    if (!form.id.trim()) { setErr('ID/Slug wajib diisi.'); return; }
    if (!form.title.trim()) { setErr('Judul wajib diisi.'); return; }
    const card: KnowledgeCard = { ...fromForm(form, existing), adminStatus: status };
    if (isEdit) adminUpdateCard(existing!.id, card);
    else adminAddCard(card);
    onClose();
  }

  function submit(e: React.FormEvent) { e.preventDefault(); save('published'); }

  function set<K extends keyof CardForm>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const val = (e.target as HTMLInputElement).type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
      setForm(f => ({ ...f, [key]: val }));
    };
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stv-navy/30 px-4 py-8"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-[660px] rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(16,58,107,.2)]">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-baloo text-[18px] font-bold text-stv-navy">
            {isEdit ? 'Edit Kartu' : 'Tambah Kartu Baru'}
          </h2>
          <button type="button" onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-stv-muted hover:bg-slate-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          {/* Identitas */}
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-stv-muted">Identitas Kartu</p>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="ID / Slug" required hint="(unik, tidak bisa diubah setelah tersimpan)">
                  <input value={form.id} onChange={set('id')} disabled={isEdit}
                    placeholder="cth: RL-0-3m-FM"
                    className={`${inp} ${isEdit ? 'bg-slate-100 opacity-60' : ''}`} />
                </Field>
                <Field label="Judul" required>
                  <input value={form.title} onChange={set('title')} className={inp} />
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Kelompok Usia" required>
                  <select value={form.ageKey} onChange={set('ageKey')} className={inp}>
                    {AGE_RANGES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
                  </select>
                </Field>
                <Field label="Domain" required>
                  <select value={form.domain} onChange={set('domain')} className={inp}>
                    {DOMAIN_CODES.map(d => <option key={d} value={d}>{DOMAIN_MAP[d].label}</option>)}
                  </select>
                </Field>
                <Field label="Est. Baca (menit)">
                  <input type="number" min={1} value={form.readMinutes} onChange={set('readMinutes')} className={inp} />
                </Field>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-[13px] text-stv-body">
                <input type="checkbox" checked={form.isMedical} onChange={set('isMedical')}
                  className="h-4 w-4 rounded border-stv-border accent-red-500" />
                <span><strong className="text-red-600">Konten Medis</strong> — menampilkan badge peringatan merah</span>
              </label>
            </div>
          </div>

          {/* Foto */}
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-stv-muted">Foto Cover</p>
            <div className="flex flex-col gap-3">
              <Field label="URL Foto" hint="(kosong = auto /images/rl/[id].jpg)">
                <input value={form.photoSrc} onChange={set('photoSrc')} placeholder="/images/rl/slug.jpg" className={inp} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Alt Text">
                  <input value={form.photoAlt} onChange={set('photoAlt')} className={inp} />
                </Field>
                <Field label="Kredit Foto (opsional)">
                  <input value={form.photoCredit} onChange={set('photoCredit')} placeholder="© Unsplash" className={inp} />
                </Field>
              </div>
            </div>
          </div>

          {/* Ringkasan */}
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-stv-muted">Ringkasan (halaman pertama buku)</p>
            <div className="flex flex-col gap-3">
              <Field label="Apa yang Terjadi?" required>
                <textarea value={form.terjadi} onChange={set('terjadi')} rows={2} className={ta}
                  placeholder="Jelaskan apa yang terjadi pada tahap ini..." />
              </Field>
              <Field label="Mengapa Ini Penting?">
                <textarea value={form.penting} onChange={set('penting')} rows={2} className={ta} />
              </Field>
              <Field label="Yang Bisa Dilakukan (satu per baris)">
                <textarea value={form.lakukanText} onChange={set('lakukanText')} rows={4} className={ta}
                  placeholder="Tip 1...&#10;Tip 2...&#10;Tip 3..." />
              </Field>
              <Field label="Perhatian / Catatan Khusus">
                <textarea value={form.perhatian} onChange={set('perhatian')} rows={2} className={ta} />
              </Field>
            </div>
          </div>

          {/* Detail Ilmiah */}
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-stv-muted">Detail Ilmiah</p>
            <div className="flex flex-col gap-3">
              <Field label="Judul Halaman Ilmiah">
                <input value={form.sciTitle} onChange={set('sciTitle')} className={inp}
                  placeholder="cth: Dasar Neurobiologi Motorik Kasar" />
              </Field>
              <Field label="Paragraf Ilmiah" hint="(pisahkan tiap paragraf dengan baris kosong)">
                <textarea value={form.sciParagraphsText} onChange={set('sciParagraphsText')} rows={5} className={ta}
                  placeholder="Paragraf 1...&#10;&#10;Paragraf 2..." />
              </Field>
              {existing?.scientific?.sections && existing.scientific.sections.length > 0 && (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-[12px] text-amber-700">
                  Kartu ini memiliki {existing.scientific.sections.length} seksi ilmiah terstruktur dari data asli yang tetap dipertahankan.
                </p>
              )}
            </div>
          </div>

          {/* Sumber */}
          <Field label="Sumber / Referensi" hint="(satu per baris)">
            <textarea value={form.sourcesText} onChange={set('sourcesText')} rows={3} className={ta}
              placeholder="WHO (2019)...&#10;AAP (2022), Pediatrics..." />
          </Field>

          {err && <p className="text-[12px] text-red-500">{err}</p>}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose}
              className="rounded-full border border-stv-border px-4 py-2 text-[13px] font-semibold text-stv-body hover:bg-slate-50">
              Batal
            </button>
            <div className="flex gap-2">
              <button type="button" onClick={() => save('draft')}
                className="flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-2 text-[13px] font-semibold text-stv-body hover:bg-slate-50">
                <Save className="h-3.5 w-3.5" /> Simpan Draft
              </button>
              <button type="submit"
                className="flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-[13px] font-bold text-white hover:bg-amber-600">
                <Send className="h-3.5 w-3.5" /> Terbitkan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Admin Page ───────────────────────────────────────────────────────────

export default function KnowledgeCardsAdmin() {
  const { managedCards, adminDeleteCard, adminSetCardStatus } = useKnowledgeLibrary();

  const [search, setSearch]             = useState('');
  const [filterAge, setFilterAge]       = useState<AgeKey | 'all'>('all');
  const [filterDomain, setFilterDomain] = useState<DomainCode | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [modal, setModal]               = useState<{ form: CardForm; existing?: KnowledgeCard } | null>(null);

  const filtered = useMemo(() => {
    const qs = search.toLowerCase();
    return managedCards.filter(c => {
      if (search && !c.title.toLowerCase().includes(qs) && !c.id.toLowerCase().includes(qs)) return false;
      if (filterAge !== 'all' && c.ageKey !== filterAge) return false;
      if (filterDomain !== 'all' && c.domain !== filterDomain) return false;
      const st = c.adminStatus ?? 'published';
      if (filterStatus !== 'all' && st !== filterStatus) return false;
      return true;
    });
  }, [managedCards, search, filterAge, filterDomain, filterStatus]);

  const draftCount = managedCards.filter(c => c.adminStatus === 'draft').length;

  function confirmDelete(c: KnowledgeCard) {
    if (window.confirm(`Hapus kartu "${c.title}"? Tindakan ini tidak bisa dibatalkan.`)) {
      adminDeleteCard(c.id);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">Panduan Tumbuh Kembang</h2>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-[13px]">
            <span className="text-stv-muted">
              Total: <strong className="text-stv-navy">{managedCards.length}</strong> kartu
            </span>
            {draftCount > 0 ? (
              <span className="rounded-full bg-amber-100 px-3 py-0.5 font-semibold text-amber-700">
                {draftCount} Draft belum diterbitkan
              </span>
            ) : (
              <span className="rounded-full bg-green-100 px-3 py-0.5 font-semibold text-green-700">
                Semua kartu sudah terbit
              </span>
            )}
            <span className="text-amber-500 font-medium">TODO: sambungkan ke backend</span>
          </div>
        </div>
        <button type="button"
          onClick={() => setModal({ form: EMPTY_FORM })}
          className="flex items-center gap-1.5 rounded-full bg-amber-500 px-5 py-2.5 text-[14px] font-bold text-white hover:bg-amber-600 transition">
          <Plus className="h-4 w-4" /> Tambah Kartu
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-[280px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stv-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari judul atau slug..."
            className="w-full rounded-full border border-slate-200 bg-white py-2 pl-10 pr-4 text-[13px] focus:border-amber-400 focus:outline-none" />
        </div>
        <select value={filterAge} onChange={e => setFilterAge(e.target.value as AgeKey | 'all')}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[13px] focus:border-amber-400 focus:outline-none">
          <option value="all">Semua Usia</option>
          {AGE_RANGES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
        </select>
        <select value={filterDomain} onChange={e => setFilterDomain(e.target.value as DomainCode | 'all')}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[13px] focus:border-amber-400 focus:outline-none">
          <option value="all">Semua Domain</option>
          {DOMAIN_CODES.map(d => <option key={d} value={d}>{DOMAIN_MAP[d].label}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[13px] focus:border-amber-400 focus:outline-none">
          <option value="all">Semua Status</option>
          <option value="published">Terbit</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <p className="text-[12px] text-stv-muted">
        Menampilkan <strong className="text-stv-navy">{filtered.length}</strong> dari {managedCards.length} kartu
      </p>

      {/* Card list */}
      {filtered.length === 0 ? (
        <div className="py-14 text-center text-stv-muted">
          <p className="font-semibold text-stv-navy">Tidak ada kartu yang cocok</p>
          <p className="mt-1 text-[13px]">Ubah filter atau tambahkan kartu baru.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(c => {
            const domain = DOMAIN_MAP[c.domain];
            const age    = AGE_RANGES.find(r => r.key === c.ageKey);
            const isDraft = c.adminStatus === 'draft';
            return (
              <div key={c.id}
                className={`flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_2px_8px_rgba(16,58,107,.05)] ${isDraft ? 'border-l-4 border-amber-300' : ''}`}>
                {/* Domain swatch */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: domain.bg }}>
                  <domain.icon className="h-5 w-5" style={{ color: domain.fg }} strokeWidth={1.5} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={`font-semibold text-[14px] truncate ${isDraft ? 'text-stv-muted' : 'text-stv-navy'}`}>
                      {c.title}
                    </p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${isDraft ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                      {isDraft ? 'Draft' : 'Terbit'}
                    </span>
                    {c.isMedical && (
                      <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">Medis</span>
                    )}
                  </div>
                  <div className="mt-0.5 flex flex-wrap gap-1.5">
                    <span className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                      style={{ background: age?.fill ?? '#F3F4F6', color: age?.ink ?? '#374151' }}>
                      {age?.label ?? c.ageKey}
                    </span>
                    <span className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                      style={{ background: domain.bg, color: domain.fg }}>
                      {domain.label}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-mono text-slate-500">
                      {c.id}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 gap-1.5">
                  <button type="button"
                    onClick={() => adminSetCardStatus(c.id, isDraft ? 'published' : 'draft')}
                    title={isDraft ? 'Terbitkan' : 'Jadikan Draft'}
                    className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${isDraft ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-slate-50 text-stv-muted hover:bg-slate-100'}`}>
                    {isDraft ? <Send className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </button>
                  <button type="button"
                    onClick={() => setModal({ form: toForm(c), existing: c })}
                    title="Edit"
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button type="button"
                    onClick={() => confirmDelete(c)}
                    title="Hapus"
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <CardFormModal
          initial={modal.form}
          existing={modal.existing}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
