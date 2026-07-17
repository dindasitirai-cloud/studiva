import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Child, UpdateCategory } from '../../types';
import Card from '../../components/Card';
import Modal from '../../components/Modal';

const categories: UpdateCategory[] = ['academics', 'behavior', 'therapy', 'social'];

interface StudentWithLastUpdate extends Child {
  lastUpdateDate?: string;
}

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [students, setStudents] = useState<StudentWithLastUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<number | ''>('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<UpdateCategory>('academics');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    try {
      setLoading(true);
      const { data } = await api.get('/children');
      const children: Child[] = data.children;
      const withDates = await Promise.all(
        children.map(async (c) => {
          const updatesRes = await api.get(`/updates?childId=${c.id}&limit=1`);
          const lastUpdateDate = updatesRes.data.updates[0]?.date;
          return { ...c, lastUpdateDate };
        })
      );
      setStudents(withDates);
    } catch {
      setError('Gagal memuat daftar siswa.');
    } finally {
      setLoading(false);
    }
  }

  function openFormFor(childId: number) {
    setSelectedChildId(childId);
    setFormOpen(true);
    setSubmitStatus(null);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPhotoDataUrl(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhotoDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedChildId || !content.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/updates', {
        childId: selectedChildId,
        content,
        category,
        photos: photoDataUrl,
        date: new Date().toISOString().slice(0, 10),
      });
      setSubmitStatus('Update berhasil ditambahkan!');
      setContent('');
      setPhotoDataUrl(null);
      await loadStudents();
      setTimeout(() => setFormOpen(false), 1200);
    } catch {
      setSubmitStatus('Gagal menambahkan update. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="bg-background px-4 py-12 md:px-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-h2 font-bold text-navy">Selamat datang, {user?.name}</h1>
          <button
            onClick={handleLogout}
            className="min-h-[48px] rounded-md border border-bordergray px-4 py-2 text-textdark transition hover:bg-white"
          >
            Logout
          </button>
        </div>

        {error && <p className="mt-6 rounded-md bg-red-50 p-3 text-red-600">{error}</p>}

        <section className="mt-8">
          <h2 className="text-h3 font-semibold text-navy">Your Students</h2>
          {loading ? (
            <p className="mt-4 text-textlight">Memuat siswa...</p>
          ) : students.length === 0 ? (
            <p className="mt-4 text-textlight">Belum ada siswa yang ditugaskan kepada Anda.</p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {students.map((s) => (
                <Card key={s.id} className="flex flex-col">
                  <h3 className="text-h3 font-semibold text-navy">{s.name}</h3>
                  <p className="text-textlight">{s.age} tahun</p>
                  <p className="mt-2 text-sm text-textlight">
                    Last update:{' '}
                    {s.lastUpdateDate ? new Date(s.lastUpdateDate).toLocaleDateString('id-ID') : 'Belum ada'}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => openFormFor(s.id)}
                      className="min-h-[48px] flex-1 rounded-md bg-gold px-4 py-2 font-semibold text-navy transition hover:bg-gold/90"
                    >
                      Add Daily Update
                    </button>
                    <Link
                      to={`/dashboard/child/${s.id}`}
                      className="flex min-h-[48px] flex-1 items-center justify-center rounded-md border border-bordergray px-4 py-2 font-semibold text-textdark transition hover:bg-background"
                    >
                      View Profile
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      {formOpen && (
        <Modal title="Add Daily Update" onClose={() => setFormOpen(false)}>
          {submitStatus && <p className="mb-3 text-sm text-success">{submitStatus}</p>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-textdark">Child</label>
              <select
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(Number(e.target.value))}
                required
                className="mt-1 min-h-[48px] w-full rounded-md border border-bordergray px-4 py-2 focus:border-gold focus:outline-none"
              >
                <option value="" disabled>
                  Select a student
                </option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-textdark">Photo (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="mt-1 w-full text-sm text-textdark"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-textdark">Caption / Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={4}
                className="mt-1 w-full rounded-md border border-bordergray px-4 py-2 focus:border-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-textdark">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as UpdateCategory)}
                className="mt-1 min-h-[48px] w-full rounded-md border border-bordergray px-4 py-2 focus:border-gold focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="min-h-[48px] rounded-md bg-navy px-6 py-3 font-semibold text-white transition hover:bg-navy/90 disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
