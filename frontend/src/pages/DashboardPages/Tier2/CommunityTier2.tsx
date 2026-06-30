import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MessageSquare, Clock, LifeBuoy, ShieldCheck, X } from 'lucide-react';
import { useDashboardTier2 } from '../../../context/DashboardTier2Context';
import { useAuth } from '../../../context/AuthContext';
import { relativeTime } from './relativeTime';

function NewThreadModal({ isSupportRequest, onClose, onCreated }: {
  isSupportRequest: boolean;
  onClose: () => void;
  onCreated: (threadId: string) => void;
}) {
  const { addThread } = useDashboardTier2();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Judul dan isi pertanyaan wajib diisi.');
      return;
    }
    const id = addThread(title.trim(), content.trim(), user?.name ?? 'Anda', isSupportRequest);
    onCreated(id);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stv-navy/30 px-4 py-8">
      <div className="w-full max-w-[520px] rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(16,58,107,.2)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-baloo text-[18px] font-bold text-stv-navy">
            {isSupportRequest ? 'Tanya Tim Studiva' : 'Buat Diskusi Baru'}
          </h2>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-stv-muted hover:text-stv-navy">
            <X className="h-4 w-4" />
          </button>
        </div>

        {isSupportRequest && (
          <p className="mb-4 rounded-xl bg-stv-green-tint px-4 py-3 text-[13px] text-stv-green">
            Pertanyaan ini akan ditandai sebagai pertanyaan resmi dan akan dijawab langsung oleh Tim Studiva.
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Judul *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={isSupportRequest ? 'mis. Bagaimana cara mengatasi...' : 'mis. Tips menghadapi...'}
              className="w-full rounded-xl border border-amber-200 px-4 py-2.5 text-[15px] focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-[13px] font-semibold text-stv-navy">
              {isSupportRequest ? 'Pertanyaan Anda *' : 'Isi Diskusi *'}
            </label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={4}
              placeholder="Ceritakan lebih detail di sini..."
              className="w-full resize-none rounded-xl border border-amber-200 px-4 py-2.5 text-[15px] focus:border-amber-500 focus:outline-none"
            />
          </div>
          {error && <p className="text-[13px] text-red-500">{error}</p>}
          <div className="mt-2 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-full border border-amber-200 px-5 py-2 text-[14px] font-semibold text-stv-body hover:bg-amber-50">
              Batal
            </button>
            <button type="submit" className="rounded-full bg-amber-500 px-5 py-2 text-[14px] font-bold text-white transition hover:bg-amber-600">
              {isSupportRequest ? 'Kirim Pertanyaan' : 'Posting Diskusi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CommunityTier2() {
  const navigate = useNavigate();
  const { threads } = useDashboardTier2();
  const [modalMode, setModalMode] = useState<'none' | 'discussion' | 'support'>('none');

  function handleCreated(threadId: string) {
    setModalMode('none');
    navigate(`/dashboard/tier2/community/${threadId}`);
  }

  const sortedThreads = [...threads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">Community Forum</h2>
        <p className="text-[14px] text-stv-muted">Ruang berbagi dan berdiskusi dengan sesama orang tua, didukung penuh oleh Studiva.</p>
      </div>

      {/* Dukungan Studiva - prominent banner */}
      <div className="flex flex-col items-start gap-4 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-400 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20">
            <LifeBuoy className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="font-baloo text-[16px] font-bold text-white">Dukungan Studiva</p>
            <p className="mt-0.5 text-[13px] text-white/90">Punya pertanyaan resmi? Tim Studiva siap membantu langsung.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setModalMode('support')}
          className="shrink-0 rounded-full bg-white px-5 py-2.5 font-baloo text-[14px] font-bold text-amber-600 transition hover:bg-amber-50"
        >
          Tanya Tim Studiva
        </button>
      </div>

      {/* New discussion button */}
      <div className="flex items-center justify-between">
        <h3 className="font-baloo text-[17px] font-bold text-stv-navy">Diskusi Terbaru</h3>
        <button
          type="button"
          onClick={() => setModalMode('discussion')}
          className="flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-[13px] font-bold text-white transition hover:bg-amber-600"
        >
          <Plus className="h-4 w-4" />
          Buat Diskusi Baru
        </button>
      </div>

      {/* Thread list */}
      {sortedThreads.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-amber-200 py-14 text-center">
          <MessageSquare className="h-10 w-10 text-amber-300" strokeWidth={1.5} />
          <p className="mt-3 font-semibold text-stv-navy">Belum ada diskusi</p>
          <p className="mt-1 text-[13px] text-stv-muted">Jadilah yang pertama membuat diskusi di komunitas ini.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sortedThreads.map(thread => (
            <button
              key={thread.id}
              type="button"
              onClick={() => navigate(`/dashboard/tier2/community/${thread.id}`)}
              className="flex flex-col gap-2 rounded-2xl bg-white p-5 text-left shadow-[0_4px_16px_rgba(16,58,107,.06)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(217,119,6,.12)]"
            >
              {thread.isSupportRequest && (
                <span className="flex w-fit items-center gap-1 rounded-full bg-stv-green-tint px-2.5 py-0.5 text-[11px] font-bold text-stv-green">
                  <ShieldCheck className="h-3 w-3" />
                  Pertanyaan Resmi
                </span>
              )}
              <p className="font-baloo text-[16px] font-bold leading-[1.3] text-stv-navy">{thread.title}</p>
              <p className="line-clamp-2 text-[14px] leading-[1.5] text-stv-muted">{thread.content}</p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-[12px] text-stv-muted">
                <span className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700">
                    {thread.author.charAt(0).toUpperCase()}
                  </span>
                  {thread.author}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {thread.replies.length} balasan
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {relativeTime(thread.createdAt)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {modalMode !== 'none' && (
        <NewThreadModal
          isSupportRequest={modalMode === 'support'}
          onClose={() => setModalMode('none')}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
