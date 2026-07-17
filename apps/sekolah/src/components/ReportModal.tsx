import React, { useState } from 'react';
import { api } from '../api/client';
import { ReportContentType, ReportReason } from '../types';
import Modal from './Modal';

interface ReportModalProps {
  contentId: number;
  contentType: ReportContentType;
  onClose: () => void;
}

const REASONS: { value: ReportReason; label: string }[] = [
  { value: 'spam', label: 'Spam / promosi' },
  { value: 'rude', label: 'Kasar / tidak sopan' },
  { value: 'off-topic', label: 'Tidak relevan' },
  { value: 'inappropriate', label: 'Tidak pantas' },
];

export default function ReportModal({ contentId, contentType, onClose }: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason) return;
    setSubmitting(true);
    try {
      await api.post('/community/report', { contentId, contentType, reason, details: details || undefined });
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Report Content" onClose={onClose}>
      {done ? (
        <p className="text-success">Terima kasih, laporan Anda telah dikirim ke tim moderasi.</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-textdark">Alasan</label>
            <div className="mt-2 flex flex-col gap-2">
              {REASONS.map((r) => (
                <label key={r.value} className="flex min-h-[44px] items-center gap-2">
                  <input
                    type="radio"
                    name="reason"
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                  />
                  {r.label}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-textdark">Detail (opsional)</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-bordergray px-4 py-2 focus:border-gold focus:outline-none"
            />
          </div>
          <button type="submit" disabled={!reason || submitting} className="btn-primary disabled:opacity-60">
            {submitting ? 'Mengirim...' : 'Submit Report'}
          </button>
        </form>
      )}
    </Modal>
  );
}
