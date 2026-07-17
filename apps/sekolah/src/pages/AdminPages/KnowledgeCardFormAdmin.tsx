import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, X, ArrowLeft, AlertCircle } from 'lucide-react';
import { api } from '../../api/client';
import { AGE_RANGES, DOMAIN_MAP, AgeKey, DomainCode } from '../DashboardPages/Tier2/knowledgeCardData';

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
  sci_paragraphs: string[];
  sources: string[];
  status: string;
}

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
  sci_paragraphs: string[];
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
  sci_paragraphs: [''],
  sources: [''],
};

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

const inputClass = "w-full rounded-xl border border-stv-border px-3 py-2.5 text-[14px] focus:border-amber-400 focus:outline-none";
const textareaClass = "w-full rounded-xl border border-stv-border px-3 py-2.5 text-[14px] focus:border-amber-400 focus:outline-none resize-y min-h-[80px]";
const selectClass = "w-full rounded-xl border border-stv-border px-3 py-2.5 text-[14px] focus:border-amber-400 focus:outline-none";

export default function KnowledgeCardFormAdmin() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [existingStatus, setExistingStatus] = useState<string>('DRAFT');

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
    setLoading(true);
    api.get<{ card: KnowledgeCardDetail }>(`/knowledge-cards/admin/all`)
      .then(() => {
        // We need to load specific card - use the admin all endpoint then filter,
        // or just use the public endpoint which only has PUBLISHED.
        // Better: load from the admin/all and filter by id. But we don't have a single-card admin endpoint.
        // Use the public endpoint first; if not found (not PUBLISHED), show error.
        // Actually let's build it properly using all and find:
        return api.get<{ cards: KnowledgeCardDetail[] }>(`/knowledge-cards/admin/all`);
      })
      .then(res => {
        const card = res.data.cards.find(c => c.id === Number(id));
        if (!card) {
          setError('Kartu tidak ditemukan.');
          return;
        }
        setExistingStatus(card.status);
        setForm({
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
          sci_paragraphs: card.sci_paragraphs.length > 0 ? card.sci_paragraphs : [''],
          sources: card.sources.length > 0 ? card.sources : [''],
        });
      })
      .catch(() => setError('Gagal memuat data kartu.'))
      .finally(() => setLoading(false));
  }, [id]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function setListItem(key: 'lakukan' | 'sci_paragraphs' | 'sources', idx: number, value: string) {
    setForm(prev => {
      const arr = [...(prev[key] as string[])];
      arr[idx] = value;
      return { ...prev, [key]: arr };
    });
  }

  function addListItem(key: 'lakukan' | 'sci_paragraphs' | 'sources', max?: number) {
    setForm(prev => {
      const arr = prev[key] as string[];
      if (max && arr.length >= max) return prev;
      return { ...prev, [key]: [...arr, ''] };
    });
  }

  function removeListItem(key: 'lakukan' | 'sci_paragraphs' | 'sources', idx: number, min?: number) {
    setForm(prev => {
      const arr = prev[key] as string[];
      if (min && arr.length <= min) return prev;
      return { ...prev, [key]: arr.filter((_, i) => i !== idx) };
    });
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
      sci_paragraphs: form.sci_paragraphs.filter(s => s.trim()),
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
      navigate('/admin/knowledge-cards');
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
        onClick={() => navigate('/admin/knowledge-cards')}
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
                className="h-4 w-4 rounded border-stv-border accent-amber-500"
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
                    className="flex items-center gap-1.5 text-[13px] font-semibold text-amber-600 hover:text-amber-700"
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
          <div className="flex flex-col gap-4">
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

            <div>
              <label className="mb-2 block text-[13px] font-semibold text-stv-navy">
                Paragraf Ilmiah
              </label>
              <div className="flex flex-col gap-3">
                {form.sci_paragraphs.map((para, idx) => (
                  <div key={idx} className="flex gap-2">
                    <div className="mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[11px] font-bold text-amber-700">
                      {idx + 1}
                    </div>
                    <textarea
                      value={para}
                      onChange={e => setListItem('sci_paragraphs', idx, e.target.value)}
                      placeholder={`Paragraf ${idx + 1}...`}
                      className={`${textareaClass} flex-1`}
                    />
                    {form.sci_paragraphs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeListItem('sci_paragraphs', idx, 1)}
                        className="mt-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-400 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addListItem('sci_paragraphs')}
                  className="flex items-center gap-1.5 text-[13px] font-semibold text-amber-600 hover:text-amber-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Tambah Paragraf
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
              className="flex items-center gap-1.5 text-[13px] font-semibold text-amber-600 hover:text-amber-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah Sumber
            </button>
          </div>
        </div>

        {/* NOTE */}
        <div className="rounded-xl bg-slate-50 p-4 text-[13px] text-stv-muted">
          Pratinjau tersedia setelah kartu disimpan dan dipublikasi di halaman Panduan Tumbuh Kembang.
        </div>

        {/* SUBMIT BUTTONS */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <button
            type="button"
            onClick={() => navigate('/admin/knowledge-cards')}
            className="rounded-full border border-stv-border px-6 py-2.5 text-[14px] font-semibold text-stv-body transition hover:bg-slate-50"
          >
            Batal
          </button>

          {isEditing && existingStatus === 'DRAFT' && (
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSubmit(false)}
              className="rounded-full border border-amber-500 px-6 py-2.5 text-[14px] font-semibold text-amber-600 transition hover:bg-amber-50 disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Kirim untuk Review'}
            </button>
          )}

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSubmit(true)}
            className="rounded-full bg-amber-500 px-6 py-2.5 text-[14px] font-bold text-white transition hover:bg-amber-600 disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan sebagai Draft'}
          </button>
        </div>
      </div>
    </div>
  );
}
