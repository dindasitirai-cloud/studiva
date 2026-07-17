import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { CategoryInfo, DiscussionCategory } from '../types';
import TagInput from '../components/TagInput';

export default function NewDiscussionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const presetCategory = (location.state as { presetCategory?: DiscussionCategory } | null)?.presetCategory;
  const [categories, setCategories] = useState<Record<DiscussionCategory, CategoryInfo> | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<DiscussionCategory>(presetCategory ?? 'general');
  const [subcategory, setSubcategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get('/community/categories')
      .then(({ data }) => setCategories(data.categories))
      .catch(() => setCategories(null));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Judul dan isi diskusi wajib diisi.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const { data } = await api.post('/community/discussions', {
        title,
        content,
        category,
        subcategory: subcategory || undefined,
        tags,
        isAnonymous,
      });
      navigate(`/community/discussions/${data.discussion.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal membuat diskusi.');
    } finally {
      setSubmitting(false);
    }
  }

  const subcategories = categories?.[category]?.subcategories ?? [];

  return (
    <div className="bg-background px-4 py-12 md:px-8">
      <div className="mx-auto max-w-2xl rounded-xl border border-bordergray bg-white p-8 shadow-sm">
        <h1 className="text-h2 font-bold text-navy">Create Discussion</h1>

        {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-textdark">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={150}
              required
              className="mt-1 min-h-[48px] w-full rounded-md border border-bordergray px-4 py-2 focus:border-gold focus:outline-none"
            />
            <p className="mt-1 text-xs text-textlight">{title.length}/150</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-textdark">Category</label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as DiscussionCategory);
                  setSubcategory('');
                }}
                className="mt-1 min-h-[48px] w-full rounded-md border border-bordergray px-4 py-2 focus:border-gold focus:outline-none"
              >
                {categories &&
                  (Object.entries(categories) as [DiscussionCategory, CategoryInfo][]).map(([key, info]) => (
                    <option key={key} value={key}>
                      {info.label}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-textdark">Subcategory</label>
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="mt-1 min-h-[48px] w-full rounded-md border border-bordergray px-4 py-2 focus:border-gold focus:outline-none"
              >
                <option value="">None</option>
                {subcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-textdark">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              maxLength={5000}
              required
              placeholder="Ceritakan pengalaman, pertanyaan, atau kemenangan Anda..."
              className="mt-1 w-full rounded-md border border-bordergray px-4 py-2 focus:border-gold focus:outline-none"
            />
            <p className="mt-1 text-xs text-textlight">{content.length}/5000</p>
          </div>

          <div>
            <label className="text-sm font-medium text-textdark">Tags</label>
            <div className="mt-1">
              <TagInput value={tags} onChange={setTags} />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-textdark">
            <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
            Post Anonymously (akan tampil sebagai &quot;Tier 1/2 Parent&quot;)
          </label>

          <button type="submit" disabled={submitting} className="btn-primary self-start disabled:opacity-60">
            {submitting ? 'Memposting...' : 'Post Discussion'}
          </button>
        </form>
      </div>
    </div>
  );
}
