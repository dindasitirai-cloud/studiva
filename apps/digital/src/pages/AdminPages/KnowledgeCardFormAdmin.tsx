import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, X, ArrowLeft, AlertCircle, Send, Info, Eye } from 'lucide-react';
import { api } from '../../api/client';
import { AGE_RANGES, DOMAIN_MAP, AgeKey, DomainCode, CARDS, KnowledgeCard } from '@studiva/shared';
import { useAuth } from '../../context/AuthContext';
import { buatDanAjukan } from '../../lib/supabase/pipeline';
import { pindaiFields } from '../../lib/pemindaiKata';
import { composeScientific } from '../../lib/composeScientific';
import { FIGURE_REGISTRY } from '../../components/figures';
import { SCI_DATA } from '../DashboardPages/Tier2/scienceDetailData';
import PreviewBuku from './PreviewBuku';

interface KnowledgeCardDetail {
  id: number;
  slug: string;
  age_key: string;
  domain: string;
  title: string;
  photo_src: string | null;
  photo_alt: string | null;
  photo_credit: string | null;
  read_minutes: number;
  is_medical: boolean;
  terjadi: string;
  penting: string;
  lakukan: string[];
  perhatian: string;
  sci_title: string | null;
  sci_read_minutes: number | null;
  sci_sections: Array<{ judul: string; isi: string }>;
  sci_paragraphs: string[];
  sources: string[];
  status: string;
}

interface SciStat { value: string; label: string; ref: string; }
interface SciSection { judul: string; isi: string; }
interface SciFigure { id: string; caption: string; after: number; }

interface FormState {
  slug: string;
  age_key: AgeKey;
  domain: DomainCode;
  title: string;
  photo_src: string;
  photo_alt: string;
  photo_credit: string;
  read_minutes: number;
  is_medical: boolean;
  terjadi: string;
  penting: string;
  lakukan: string[];
  perhatian: string;
  sci_title: string;
  sci_read_minutes: number;
  sci_stats: SciStat[];
  sci_sections: SciSection[];
  sci_figures: SciFigure[];
  sci_takeaways: string[];
  sources: string[];
}

const EMPTY_FORM: FormState = {
  slug: '',
  age_key: '0-3m',
  domain: 'FM',
  title: '',
  photo_src: '',
  photo_alt: '',
  photo_credit: '',
  read_minutes: 2,
  is_medical: false,
  terjadi: '',
  penting: '',
  lakukan: ['', ''],
  perhatian: '',
  sci_title: '',
  sci_read_minutes: 6,
  sci_stats: [],
  sci_sections: [{ judul: '', isi: '' }],
  sci_figures: [],
  sci_takeaways: [],
  sources: [''],
};

const FIGURE_KEYS = Object.keys(FIGURE_REGISTRY);

async function uploadIlustrasi(file: File): Promise<string> {
  const { supabase } = await import('../../lib/supabase/client');
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { data, error } = await supabase.storage
    .from('wawasan-ilustrasi')
    .upload(filename, file, { upsert: false, contentType: file.type });
  if (error) throw new Error(error.message);
  const { data: urlData } = supabase.storage.from('wawasan-ilustrasi').getPublicUrl(data.path);
  return urlData.publicUrl;
}

type FigureMode = 'pustaka' | 'unggah';

function FigureItem({
  fig,
  idx,
  sectionCount,
  onChange,
  onRemove,
}: {
  fig: SciFigure;
  idx: number;
  sectionCount: number;
  onChange: (f: SciFigure) => void;
  onRemove: () => void;
}) {
  const isUrl = fig.id.startsWith('http') || fig.id.startsWith('/');
  const [mode, setMode] = React.useState<FigureMode>(isUrl ? 'unggah' : 'pustaka');
  const [uploading, setUploading] = React.useState(false);
  const [uploadErr, setUploadErr] = React.useState('');

  function switchMode(m: FigureMode) {
    setMode(m);
    onChange({ ...fig, id: '' });
    setUploadErr('');
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadErr('');
    try {
      const url = await uploadIlustrasi(file);
      onChange({ ...fig, id: url });
    } catch (err) {
      setUploadErr((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  const inputCls = "w-full rounded-xl border border-stv-border px-3 py-2.5 text-[14px] focus:border-madu focus:outline-none";
  const selectCls = "w-full rounded-xl border border-stv-border px-3 py-2.5 text-[14px] focus:border-madu focus:outline-none";

  return (
    <div className="rounded-xl border border-stv-border bg-slate-50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[12px] font-bold text-stv-muted">Ilustrasi {idx + 1}</span>
        <button
          type="button"
          onClick={onRemove}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-400 hover:text-red-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Mode toggle */}
      <div className="mb-3 flex gap-1 rounded-xl border border-stv-border bg-white p-1">
        {(['pustaka', 'unggah'] as FigureMode[]).map(m => (
          <button
            key={m}
            type="button"
            onClick={() => switchMode(m)}
            className={`flex-1 rounded-lg py-1.5 text-[12px] font-bold transition ${
              mode === m
                ? 'bg-rekah text-white shadow-sm'
                : 'text-stv-muted hover:text-stv-navy'
            }`}
          >
            {m === 'pustaka' ? 'Dari Pustaka' : 'Unggah Gambar'}
          </button>
        ))}
      </div>

      {mode === 'pustaka' && (
        <select
          value={FIGURE_REGISTRY[fig.id] ? fig.id : ''}
          onChange={e => onChange({ ...fig, id: e.target.value })}
          className={`${selectCls} mb-2`}
        >
          <option value="">— Pilih ilustrasi —</option>
          {FIGURE_KEYS.map(k => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      )}

      {mode === 'unggah' && (
        <div className="mb-2">
          <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-3 text-[13px] transition ${
            uploading ? 'border-rekah/30 bg-rekah/5 text-rekah/50' : 'border-stv-border hover:border-rekah/50 hover:bg-slate-100'
          }`}>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={uploading}
              onChange={handleFile}
            />
            {uploading ? 'Mengunggah...' : 'Pilih gambar dari perangkat'}
          </label>
          {uploadErr && (
            <p className="mt-1 text-[12px] text-red-600">
              {uploadErr.includes('Bucket not found') || uploadErr.includes('not found')
                ? 'Bucket "wawasan-ilustrasi" belum dibuat di Supabase Storage. Buat bucket public baru dengan nama tersebut.'
                : uploadErr}
            </p>
          )}
          {isUrl && (
            <div className="mt-2 overflow-hidden rounded-xl border border-stv-border bg-white">
              <img src={fig.id} alt={fig.caption || 'preview'} className="max-h-40 w-full object-contain" />
              <p className="truncate px-2 py-1 text-[11px] text-stv-muted">{fig.id}</p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-stv-muted">Caption</label>
          <input
            value={fig.caption}
            onChange={e => onChange({ ...fig, caption: e.target.value })}
            placeholder="Keterangan gambar..."
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-stv-muted">
            Setelah bagian ke-
          </label>
          <input
            type="number"
            min={0}
            max={Math.max(0, sectionCount - 1)}
            value={fig.after}
            onChange={e => onChange({ ...fig, after: Number(e.target.value) })}
            className={inputCls}
          />
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-4 border-b border-stv-border pb-2">
      <h3 className="font-baloo text-[15px] font-bold text-stv-navy">{title}</h3>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[13px] font-semibold text-stv-navy">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass = "w-full rounded-xl border border-stv-border px-3 py-2.5 text-[14px] focus:border-madu focus:outline-none";
const textareaClass = "w-full rounded-xl border border-stv-border px-3 py-2.5 text-[14px] focus:border-madu focus:outline-none resize-y min-h-[80px]";
const selectClass = "w-full rounded-xl border border-stv-border px-3 py-2.5 text-[14px] focus:border-madu focus:outline-none";

// Map kc-managed KnowledgeCard → FormState.
// Resolves module-based sections/stats via composeScientific.
function fromKcManaged(card: KnowledgeCard): FormState {
  const sci = composeScientific(card);
  const lakukan = card.summary?.lakukan ?? [];
  return {
    slug: card.id,
    age_key: card.ageKey,
    domain: card.domain,
    title: card.title,
    photo_src: card.photo?.src ?? '',
    photo_alt: card.photo?.alt ?? '',
    photo_credit: card.photo?.credit ?? '',
    read_minutes: card.readMinutes ?? 2,
    is_medical: card.isMedical ?? false,
    terjadi: card.summary?.terjadi ?? '',
    penting: card.summary?.penting ?? '',
    lakukan: lakukan.length >= 2 ? lakukan : [...lakukan, ...Array(Math.max(0, 2 - lakukan.length)).fill('')],
    perhatian: card.summary?.perhatian ?? '',
    sci_title: sci.title ?? '',
    sci_read_minutes: sci.readMinutes ?? 6,
    sci_stats: (sci.stats ?? []).map(s => ({
      value: s.value,
      label: s.label,
      ref: s.ref ? String(s.ref) : '',
    })),
    sci_sections: (sci.sections ?? []).length > 0
      ? sci.sections!.map(s => ({ judul: s.judul, isi: s.isi }))
      : [{ judul: '', isi: '' }],
    sci_figures: card.scientific?.figure
      ? [{ id: card.scientific.figure.id, caption: card.scientific.figure.caption, after: card.scientific.figure.afterSectionIndex ?? 0 }]
      : (card.scientific?.figures ?? []).map(f => ({ id: f.id, caption: f.caption, after: f.afterSectionIndex ?? 0 })),
    sci_takeaways: sci.takeaways ?? [],
    sources: card.sources?.length > 0 ? card.sources : [''],
  };
}

// Override form sci fields with SCI_DATA content (keyed by domain-ageKey, e.g. 'FM-0-3m')
// Returns the patched form or null if SCI_DATA has no entry for this card.
function applySciData(base: FormState, domain: string, ageKey: string): FormState | null {
  const sciKey = `${domain}-${ageKey}`;
  const sciDetail = SCI_DATA[sciKey];
  if (!sciDetail) return null;

  // Convert SCI_DATA sections to form format: each section header + each paragraph as a row
  const sciSections: SciSection[] = sciDetail.sections.flatMap(s =>
    s.p.map((p, i) => ({ judul: i === 0 ? s.h : '', isi: p.t }))
  );

  return {
    ...base,
    sci_title: sciDetail.title,
    sci_read_minutes: sciDetail.readMin,
    sci_sections: sciSections.length > 0 ? sciSections : [{ judul: '', isi: '' }],
    sources: sciDetail.refs.length > 0 ? sciDetail.refs : base.sources,
  };
}

function formToCard(form: FormState): KnowledgeCard {
  const sections = form.sci_sections
    .filter(s => s.isi.trim())
    .map(s => ({ judul: s.judul, isi: s.isi }));
  return {
    id: form.slug || 'preview',
    ageKey: form.age_key,
    domain: form.domain,
    title: form.title || '(Judul belum diisi)',
    photo: { src: form.photo_src, alt: form.photo_alt, credit: form.photo_credit || undefined },
    readMinutes: form.read_minutes,
    isMedical: form.is_medical,
    summary: {
      terjadi: form.terjadi,
      penting: form.penting,
      lakukan: form.lakukan.filter(s => s.trim()),
      perhatian: form.perhatian,
    },
    scientific: {
      title: form.sci_title || '',
      readMinutes: form.sci_read_minutes || undefined,
      sections: sections.length > 0 ? sections : undefined,
    },
    sources: form.sources.filter(s => s.trim()),
  };
}

export default function KnowledgeCardFormAdmin({ pipelineOnly = false, backPath = '/admin/knowledge-cards' }: { pipelineOnly?: boolean; backPath?: string }) {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);
  const { supabaseUser, peranStaf } = useAuth();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [existingStatus, setExistingStatus] = useState<string>('DRAFT');
  const [pesanPipeline, setPesanPipeline] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Auto-generate slug from age_key + domain when creating
  useEffect(() => {
    if (!isEditing && form.age_key && form.domain) {
      const autoSlug = `${form.age_key}-${form.domain.toLowerCase()}`;
      setForm(prev => ({ ...prev, slug: autoSlug }));
    }
  }, [form.age_key, form.domain, isEditing]);

  // Load existing card when editing
  useEffect(() => {
    if (!id) return;

    // kc-managed kartu pakai string ID (bukan numerik), e.g. "RL-0-3m-FM".
    // Dalam konteks pipelineOnly (Rekah admin), coba CARDS statis dulu,
    // lalu fallback ke kc_managed (untuk kartu yang diterbitkan via pipeline).
    if (pipelineOnly && isNaN(Number(id))) {
      const decoded = decodeURIComponent(id);
      const staticCard = CARDS.find(c => c.id === decoded);
      if (staticCard) {
        const base = fromKcManaged(staticCard);
        // Hanya gunakan SCI_DATA jika kartu statis belum punya konten ilmiah sendiri
        const hasOwnSci = base.sci_sections.some(s => s.isi.trim()) || base.sci_title.trim();
        const withSci = !hasOwnSci ? applySciData(base, staticCard.domain, staticCard.ageKey) : null;
        setForm(withSci ?? base);
        setExistingStatus('PUBLISHED');
        setLoading(false);
        return;
      }
      // Tidak ada di CARDS statis — coba kc_managed / knowledge_cards (kartu tayang dari pipeline)
      api.get<{ card: KnowledgeCard }>(`/kc-managed/admin/${encodeURIComponent(decoded)}`)
        .then(res => {
          // Gunakan konten yang tersimpan apa adanya, jangan timpa dengan SCI_DATA
          const base = fromKcManaged(res.data.card);
          setForm(base);
          setExistingStatus('PUBLISHED');
        })
        .catch(() => setError('Kartu tidak ditemukan di data Panduan.'))
        .finally(() => setLoading(false));
      return;
    }

    // Sistem lama: kartu dengan ID numerik di tabel knowledge_cards
    setLoading(true);
    api.get<{ cards: KnowledgeCardDetail[] }>(`/knowledge-cards/admin/all`)
      .then(res => {
        const card = res.data.cards.find(c => c.id === Number(id));
        if (!card) {
          setError('Kartu tidak ditemukan.');
          return;
        }
        setExistingStatus(card.status);
        // Prioritas: sci_sections (format baru) > sci_paragraphs (format lama) > kosong
        const storedSections = (card.sci_sections ?? []).filter(s => s.isi.trim());
        const storedParas = (card.sci_paragraphs ?? []).filter(p => p.trim());
        let sci_sections_form: SciSection[];
        if (storedSections.length > 0) {
          sci_sections_form = storedSections;
        } else if (storedParas.length > 0) {
          // Paragraf lama mungkin memakai encoding "judul: isi"
          sci_sections_form = storedParas.map(p => {
            const sep = p.indexOf(': ');
            return sep > 0 && sep < 70
              ? { judul: p.slice(0, sep), isi: p.slice(sep + 2) }
              : { judul: '', isi: p };
          });
        } else {
          sci_sections_form = [{ judul: '', isi: '' }];
        }
        const base: FormState = {
          slug: card.slug,
          age_key: card.age_key as AgeKey,
          domain: card.domain as DomainCode,
          title: card.title,
          photo_src: card.photo_src ?? '',
          photo_alt: card.photo_alt ?? '',
          photo_credit: card.photo_credit ?? '',
          read_minutes: card.read_minutes,
          is_medical: card.is_medical,
          terjadi: card.terjadi,
          penting: card.penting,
          lakukan: card.lakukan.length >= 2 ? card.lakukan : [...card.lakukan, ...Array(2 - card.lakukan.length).fill('')],
          perhatian: card.perhatian,
          sci_title: card.sci_title ?? '',
          sci_read_minutes: card.sci_read_minutes ?? 6,
          sci_stats: [],
          sci_sections: sci_sections_form,
          sci_figures: [],
          sci_takeaways: [],
          sources: card.sources.length > 0 ? card.sources : [''],
        };
        // Jangan timpa dengan SCI_DATA — konten admin yang sudah dimasukkan harus ditampilkan apa adanya
        setForm(base);
      })
      .catch(() => setError('Gagal memuat data kartu.'))
      .finally(() => setLoading(false));
  }, [id, pipelineOnly]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function setListItem(key: 'lakukan' | 'sources', idx: number, value: string) {
    setForm(prev => {
      const arr = [...(prev[key] as string[])];
      arr[idx] = value;
      return { ...prev, [key]: arr };
    });
  }

  function addListItem(key: 'lakukan' | 'sources', max?: number) {
    setForm(prev => {
      const arr = prev[key] as string[];
      if (max && arr.length >= max) return prev;
      return { ...prev, [key]: [...arr, ''] };
    });
  }

  function removeListItem(key: 'lakukan' | 'sources', idx: number, min?: number) {
    setForm(prev => {
      const arr = prev[key] as string[];
      if (min && arr.length <= min) return prev;
      return { ...prev, [key]: arr.filter((_, i) => i !== idx) };
    });
  }

  // Kirim ke pipeline Supabase (Supabase admin) — Fitri harus setujui sebelum tayang
  async function ajukanKePipeline() {
    setError('');
    if (!form.slug.trim()) { setError('Slug wajib diisi.'); return; }
    if (!form.title.trim()) { setError('Judul wajib diisi.'); return; }

    const filteredSources = form.sources.filter(s => s.trim());
    const sciSections = form.sci_sections.filter(s => s.isi.trim()).map(s => ({
      judul: s.judul,
      isi: s.isi,
    }));
    const sciStats = form.sci_stats.filter(s => s.value.trim()).map(s => ({
      value: s.value,
      label: s.label,
      ...(s.ref ? { ref: Number(s.ref) } : {}),
    }));

    const payload = {
      slug: form.slug.trim(), age_key: form.age_key, domain: form.domain,
      title: form.title.trim(), photo_src: form.photo_src.trim() || null,
      photo_alt: form.photo_alt.trim() || null, photo_credit: form.photo_credit.trim() || null,
      read_minutes: form.read_minutes, is_medical: form.is_medical,
      terjadi: form.terjadi.trim(), penting: form.penting.trim(),
      lakukan: form.lakukan.filter(s => s.trim()),
      perhatian: form.perhatian.trim(),
      scientific: {
        title: form.sci_title.trim() || null,
        readMinutes: form.sci_read_minutes || null,
        stats: sciStats.length ? sciStats : undefined,
        sections: sciSections.length ? sciSections : undefined,
        figures: form.sci_figures.filter(f => f.id).map(f => ({
          id: f.id,
          caption: f.caption,
          afterSectionIndex: f.after,
        })),
        takeaways: form.sci_takeaways.filter(t => t.trim()),
        references: filteredSources.map((text, i) => ({ n: i + 1, text })),
      },
      sources: filteredSources,
    };

    const temuanKata = pindaiFields({
      title: payload.title, terjadi: payload.terjadi, penting: payload.penting,
      perhatian: payload.perhatian, lakukan: payload.lakukan.join(' '),
      sci: [...form.sci_sections.map(s => `${s.judul} ${s.isi}`), ...form.sci_takeaways].join(' '),
    });
    if (Object.keys(temuanKata).length > 0) {
      setError('Konten mengandung kata yang perlu ditinjau. Perbaiki sebelum mengajukan.');
      return;
    }

    setSaving(true);
    try {
      await buatDanAjukan({
        jenis: 'panduan_tumbuh',
        judul: payload.title,
        isi: payload,
        id_konten_sumber: id ?? undefined,
      });
      setPesanPipeline('Konten berhasil diajukan untuk tinjauan Fitri. Tidak ada perubahan di database sampai Fitri menyetujui.');
    } catch (e) {
      setError((e as Error).message ?? 'Gagal mengajukan ke pipeline.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(submitAsDraft = true) {
    setError('');

    if (!form.slug.trim()) { setError('Slug wajib diisi.'); return; }
    if (!form.title.trim()) { setError('Judul wajib diisi.'); return; }
    if (form.photo_src.trim() && !form.photo_alt.trim()) { setError('Alt teks foto wajib diisi jika foto diisi.'); return; }

    const payload = {
      slug: form.slug.trim(),
      age_key: form.age_key,
      domain: form.domain,
      title: form.title.trim(),
      photo_src: form.photo_src.trim() || null,
      photo_alt: form.photo_alt.trim() || null,
      photo_credit: form.photo_credit.trim() || null,
      read_minutes: form.read_minutes,
      is_medical: form.is_medical,
      terjadi: form.terjadi.trim(),
      penting: form.penting.trim(),
      lakukan: form.lakukan.filter(s => s.trim()),
      perhatian: form.perhatian.trim(),
      sci_title: form.sci_title.trim() || null,
      sci_read_minutes: form.sci_read_minutes || null,
      sci_paragraphs: form.sci_sections
        .filter(s => s.isi.trim())
        .map(s => s.judul ? `${s.judul}: ${s.isi}` : s.isi),
      sources: form.sources.filter(s => s.trim()),
    };

    setSaving(true);
    try {
      if (isEditing && id) {
        await api.put(`/knowledge-cards/admin/${id}`, payload);

        if (!submitAsDraft && existingStatus === 'DRAFT') {
          await api.put(`/knowledge-cards/admin/${id}/status`, { status: 'IN_REVIEW' });
        }
      } else {
        const res = await api.post<{ card: { id: number } }>('/knowledge-cards/admin', payload);
        if (!submitAsDraft) {
          await api.put(`/knowledge-cards/admin/${res.data.card.id}/status`, { status: 'IN_REVIEW' });
        }
      }
      navigate(backPath);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr?.response?.data?.error ?? 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setSaving(false);
    }
  }

  const domainEntries = Object.entries(DOMAIN_MAP) as [DomainCode, typeof DOMAIN_MAP[DomainCode]][];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-stv-muted">
        <p className="text-[14px]">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate(backPath)}
        className="mb-6 flex items-center gap-2 text-[14px] font-semibold text-stv-muted transition hover:text-stv-navy"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Daftar Kartu
      </button>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-[13px] text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex flex-col gap-8">
        {/* META SECTION */}
        <div className="rounded-2xl border border-stv-border bg-white p-6">
          <SectionHeader title="Informasi Utama" />
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Rentang Usia" required>
                <select value={form.age_key} onChange={e => setField('age_key', e.target.value as AgeKey)} className={selectClass}>
                  {AGE_RANGES.map(ar => (
                    <option key={ar.key} value={ar.key}>{ar.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Domain" required>
                <select value={form.domain} onChange={e => setField('domain', e.target.value as DomainCode)} className={selectClass}>
                  {domainEntries.map(([code, info]) => (
                    <option key={code} value={code}>{info.label}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Judul Kartu" required>
              <input
                value={form.title}
                onChange={e => setField('title', e.target.value)}
                placeholder="contoh: Tummy time: menegakkan kepala"
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Slug (URL)" required>
                <input
                  value={form.slug}
                  onChange={e => setField('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  placeholder="contoh: 0-3m-fm"
                  className={inputClass}
                />
              </Field>
              <Field label="Waktu Baca (menit)">
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={form.read_minutes}
                  onChange={e => setField('read_minutes', Number(e.target.value))}
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_medical"
                checked={form.is_medical}
                onChange={e => setField('is_medical', e.target.checked)}
                className="h-4 w-4 rounded border-stv-border accent-madu"
              />
              <label htmlFor="is_medical" className="text-[14px] font-semibold text-stv-navy">
                Konten Medis (tampilkan peringatan "bukan pengganti nasihat dokter")
              </label>
            </div>
          </div>
        </div>

        {/* PHOTO SECTION */}
        <div className="rounded-2xl border border-stv-border bg-white p-6">
          <SectionHeader title="Foto" />
          <div className="flex flex-col gap-4">
            <Field label="URL Foto">
              <input
                value={form.photo_src}
                onChange={e => setField('photo_src', e.target.value)}
                placeholder="contoh: /images/rl/0-3m-fm.jpg atau https://..."
                className={inputClass}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Alt Teks Foto">
                <input
                  value={form.photo_alt}
                  onChange={e => setField('photo_alt', e.target.value)}
                  placeholder="Deskripsi gambar untuk aksesibilitas"
                  className={inputClass}
                />
              </Field>
              <Field label="Kredit Foto">
                <input
                  value={form.photo_credit}
                  onChange={e => setField('photo_credit', e.target.value)}
                  placeholder="contoh: Unsplash / nama fotografer"
                  className={inputClass}
                />
              </Field>
            </div>
          </div>
        </div>

        {/* RINGKASAN SECTION */}
        <div className="rounded-2xl border border-stv-border bg-white p-6">
          <SectionHeader title="Ringkasan (2 Menit)" />
          <div className="flex flex-col gap-4">
            <Field label="Yang Biasa Terjadi di Usia Ini">
              <textarea
                value={form.terjadi}
                onChange={e => setField('terjadi', e.target.value)}
                placeholder="Deskripsi singkat perkembangan yang umum terjadi..."
                className={textareaClass}
              />
            </Field>

            <Field label="Kenapa Penting">
              <textarea
                value={form.penting}
                onChange={e => setField('penting', e.target.value)}
                placeholder="Mengapa tahap perkembangan ini penting..."
                className={textareaClass}
              />
            </Field>

            <div>
              <label className="mb-2 block text-[13px] font-semibold text-stv-navy">
                Yang Bisa Dilakukan (min. 2, maks. 4)
              </label>
              <div className="flex flex-col gap-2">
                {form.lakukan.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      value={item}
                      onChange={e => setListItem('lakukan', idx, e.target.value)}
                      placeholder={`Langkah ${idx + 1}...`}
                      className={`${inputClass} flex-1`}
                    />
                    {form.lakukan.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeListItem('lakukan', idx, 2)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-400 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                {form.lakukan.length < 4 && (
                  <button
                    type="button"
                    onClick={() => addListItem('lakukan', 4)}
                    className="flex items-center gap-1.5 text-[13px] font-semibold text-rekah hover:text-rekah-tua"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Tambah Langkah
                  </button>
                )}
              </div>
            </div>

            <Field label="Tanda yang Perlu Diperhatikan">
              <textarea
                value={form.perhatian}
                onChange={e => setField('perhatian', e.target.value)}
                placeholder="Tanda-tanda yang perlu konsultasi dokter atau ahli..."
                className={textareaClass}
              />
            </Field>
          </div>
        </div>

        {/* DETAIL ILMIAH SECTION */}
        <div className="rounded-2xl border border-stv-border bg-white p-6">
          <SectionHeader title="Detail Ilmiah (Opsional)" />
          {isEditing && (
            <div className="mb-5 flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-[13px] text-sky-800">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />
              <span>
                Konten di bawah ini akan ditampilkan di halaman Detail Ilmiah buku.
                Perubahan yang diajukan akan diterapkan ke database setelah Fitri menyetujui.
              </span>
            </div>
          )}
          <div className="flex flex-col gap-6">

            {/* Judul + Waktu Baca */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Judul Artikel Ilmiah">
                <input
                  value={form.sci_title}
                  onChange={e => setField('sci_title', e.target.value)}
                  placeholder="contoh: Mengapa gerakan membangun otak..."
                  className={inputClass}
                />
              </Field>
              <Field label="Waktu Baca Ilmiah (menit)">
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={form.sci_read_minutes}
                  onChange={e => setField('sci_read_minutes', Number(e.target.value))}
                  className={inputClass}
                />
              </Field>
            </div>

            {/* Kotak Data / Statistik */}
            <div>
              <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Kotak Data</label>
              <p className="mb-2 text-[12px] text-stv-muted">
                Angka/fakta penting tampil di bagian atas artikel. Kolom "Ref" = nomor urut di Sumber Referensi (opsional).
              </p>
              <div className="flex flex-col gap-2">
                {form.sci_stats.map((stat, idx) => (
                  <div key={idx} className="flex items-start gap-2 rounded-xl border border-stv-border bg-slate-50 p-3">
                    <div className="flex flex-1 flex-wrap gap-2">
                      <input
                        value={stat.value}
                        onChange={e => {
                          const arr = [...form.sci_stats];
                          arr[idx] = { ...arr[idx], value: e.target.value };
                          setField('sci_stats', arr);
                        }}
                        placeholder="Nilai (contoh: 1 jt+)"
                        className={`${inputClass} w-28 shrink-0`}
                      />
                      <input
                        value={stat.label}
                        onChange={e => {
                          const arr = [...form.sci_stats];
                          arr[idx] = { ...arr[idx], label: e.target.value };
                          setField('sci_stats', arr);
                        }}
                        placeholder="Keterangan singkat..."
                        className={`${inputClass} flex-1 min-w-[160px]`}
                      />
                      <input
                        type="number"
                        min={0}
                        value={stat.ref}
                        onChange={e => {
                          const arr = [...form.sci_stats];
                          arr[idx] = { ...arr[idx], ref: e.target.value };
                          setField('sci_stats', arr);
                        }}
                        placeholder="Ref"
                        title="Nomor sumber referensi (kosong = tanpa kutipan)"
                        className={`${inputClass} w-16 shrink-0`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setField('sci_stats', form.sci_stats.filter((_, i) => i !== idx))}
                      className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-400 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {form.sci_stats.length < 3 && (
                  <button
                    type="button"
                    onClick={() => setField('sci_stats', [...form.sci_stats, { value: '', label: '', ref: '' }])}
                    className="flex items-center gap-1.5 text-[13px] font-semibold text-rekah hover:text-rekah-tua"
                  >
                    <Plus className="h-3.5 w-3.5" /> Tambah Kotak Data
                  </button>
                )}
              </div>
            </div>

            {/* Bagian / Sub-judul */}
            <div>
              <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Bagian Ilmiah</label>
              <p className="mb-2 text-[12px] text-stv-muted">
                Setiap bagian punya sub-judul dan teks paragraf. Gunakan [1], [2], ... untuk mengutip sumber referensi.
              </p>
              <div className="flex flex-col gap-3">
                {form.sci_sections.map((sec, idx) => (
                  <div key={idx} className="rounded-xl border border-stv-border bg-slate-50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[12px] font-bold text-stv-muted">Bagian {idx + 1}</span>
                      {form.sci_sections.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setField('sci_sections', form.sci_sections.filter((_, i) => i !== idx))}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-400 hover:text-red-600"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <input
                      value={sec.judul}
                      onChange={e => {
                        const arr = [...form.sci_sections];
                        arr[idx] = { ...arr[idx], judul: e.target.value };
                        setField('sci_sections', arr);
                      }}
                      placeholder="Sub-judul bagian (opsional)"
                      className={`${inputClass} mb-2`}
                    />
                    <textarea
                      value={sec.isi}
                      onChange={e => {
                        const arr = [...form.sci_sections];
                        arr[idx] = { ...arr[idx], isi: e.target.value };
                        setField('sci_sections', arr);
                      }}
                      placeholder={`Teks paragraf... Gunakan [1], [2] untuk kutipan sumber.`}
                      className={`${textareaClass} min-h-[100px]`}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setField('sci_sections', [...form.sci_sections, { judul: '', isi: '' }])}
                  className="flex items-center gap-1.5 text-[13px] font-semibold text-rekah hover:text-rekah-tua"
                >
                  <Plus className="h-3.5 w-3.5" /> Tambah Bagian
                </button>
              </div>
            </div>

            {/* Ilustrasi */}
            <div>
              <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Ilustrasi (Opsional)</label>
              <p className="mb-2 text-[12px] text-stv-muted">
                Pilih dari pustaka gambar bawaan, atau unggah gambar milik Anda. Bisa tambah lebih dari satu.
              </p>
              <div className="flex flex-col gap-3">
                {form.sci_figures.map((fig, idx) => (
                  <FigureItem
                    key={idx}
                    fig={fig}
                    idx={idx}
                    sectionCount={form.sci_sections.length}
                    onChange={updated => {
                      const arr = [...form.sci_figures];
                      arr[idx] = updated;
                      setField('sci_figures', arr);
                    }}
                    onRemove={() => setField('sci_figures', form.sci_figures.filter((_, i) => i !== idx))}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setField('sci_figures', [...form.sci_figures, { id: '', caption: '', after: 0 }])}
                  className="flex items-center gap-1.5 text-[13px] font-semibold text-rekah hover:text-rekah-tua"
                >
                  <Plus className="h-3.5 w-3.5" /> Tambah Ilustrasi
                </button>
              </div>
            </div>

            {/* Poin Penting */}
            <div>
              <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Poin Penting (Opsional)</label>
              <p className="mb-2 text-[12px] text-stv-muted">
                Butir-butir ringkasan yang tampil sebagai kotak sorotan di akhir artikel ilmiah.
              </p>
              <div className="flex flex-col gap-2">
                {form.sci_takeaways.map((poin, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      value={poin}
                      onChange={e => {
                        const arr = [...form.sci_takeaways];
                        arr[idx] = e.target.value;
                        setField('sci_takeaways', arr);
                      }}
                      placeholder={`Poin ${idx + 1}...`}
                      className={`${inputClass} flex-1`}
                    />
                    <button
                      type="button"
                      onClick={() => setField('sci_takeaways', form.sci_takeaways.filter((_, i) => i !== idx))}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-400 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setField('sci_takeaways', [...form.sci_takeaways, ''])}
                  className="flex items-center gap-1.5 text-[13px] font-semibold text-rekah hover:text-rekah-tua"
                >
                  <Plus className="h-3.5 w-3.5" /> Tambah Poin
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* SOURCES SECTION */}
        <div className="rounded-2xl border border-stv-border bg-white p-6">
          <SectionHeader title="Sumber Referensi" />
          <div className="flex flex-col gap-3">
            {form.sources.map((src, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  value={src}
                  onChange={e => setListItem('sources', idx, e.target.value)}
                  placeholder="contoh: AAP HealthyChildren.org"
                  className={`${inputClass} flex-1`}
                />
                {form.sources.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeListItem('sources', idx, 1)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-400 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addListItem('sources')}
              className="flex items-center gap-1.5 text-[13px] font-semibold text-rekah hover:text-rekah-tua"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah Sumber
            </button>
          </div>
        </div>

        {/* Pesan pipeline */}
        {pesanPipeline && (
          <div className="rounded-xl border border-daun/30 bg-daun/10 px-4 py-3 text-[13px] font-semibold text-daun">
            {pesanPipeline}
          </div>
        )}

        {/* SUBMIT BUTTONS */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-8">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 rounded-full border border-rekah/30 px-6 py-2.5 text-[14px] font-semibold text-rekah transition hover:bg-rekah/8"
          >
            <Eye className="h-4 w-4" />
            Preview Buku
          </button>

          <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(backPath)}
            className="rounded-full border border-stv-border px-6 py-2.5 text-[14px] font-semibold text-stv-body transition hover:bg-slate-50"
          >
            Batal
          </button>

          {!pipelineOnly && (
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSubmit(true)}
              className="rounded-full border border-stv-border px-6 py-2.5 text-[14px] font-semibold text-stv-body transition hover:bg-slate-50 disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Simpan Draft (langsung)'}
            </button>
          )}

          {/* Pipeline button — selalu tampil saat pipelineOnly, atau saat Supabase admin */}
          {(pipelineOnly || (supabaseUser && peranStaf === 'admin')) && (
            <button
              type="button"
              disabled={saving}
              onClick={ajukanKePipeline}
              className="flex items-center gap-2 rounded-full bg-rekah px-6 py-2.5 text-[14px] font-bold text-white shadow-[0_3px_12px_rgba(224,82,107,0.22)] transition hover:bg-rekah-tua disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {saving ? 'Mengajukan...' : 'Ajukan Tinjauan'}
            </button>
          )}
          </div>
        </div>
      </div>

      {showPreview && (
        <PreviewBuku card={formToCard(form)} onClose={() => setShowPreview(false)} />
      )}
    </div>
  );
}
