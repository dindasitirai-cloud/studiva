import React, { useState } from 'react';
import { api } from '../api/client';
import { Child } from '../types';

interface UpgradeRequestFormProps {
  childrenList: Child[];
  onSent?: () => void;
}

export default function UpgradeRequestForm({ childrenList, onSent }: UpgradeRequestFormProps) {
  const [childId, setChildId] = useState<number | ''>('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!childId) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/enrollment/request', { childId, message: message || undefined });
      setStatus('Permintaan enrollment Anda telah dikirim. Tim kami akan menghubungi Anda untuk proses selanjutnya.');
      setMessage('');
      onSent?.();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal mengirim permintaan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  }

  if (status) {
    return <p className="rounded-md bg-success/10 p-4 text-success">{status}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      <div>
        <label className="text-sm font-medium text-textdark">Anak yang ingin didaftarkan</label>
        <select
          value={childId}
          onChange={(e) => setChildId(e.target.value ? Number(e.target.value) : '')}
          required
          className="mt-1 min-h-[48px] w-full rounded-md border border-bordergray px-4 py-2 focus:border-gold focus:outline-none"
        >
          <option value="" disabled>
            Pilih anak
          </option>
          {childrenList
            .filter((c) => c.enrollment_status !== 'enrolled_tier1')
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-textdark">Pesan (opsional)</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="Ceritakan kebutuhan anak Anda atau pertanyaan mengenai Tier 1..."
          className="mt-1 w-full rounded-md border border-bordergray px-4 py-2 focus:border-gold focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="min-h-[48px] self-start rounded-md bg-gold px-6 py-3 font-semibold text-navy transition hover:bg-gold/90 disabled:opacity-60"
      >
        {submitting ? 'Mengirim...' : 'Request Enrollment'}
      </button>
    </form>
  );
}
