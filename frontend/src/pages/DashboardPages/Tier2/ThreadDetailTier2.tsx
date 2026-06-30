import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, ShieldCheck, Send, Clock } from 'lucide-react';
import { useDashboardTier2 } from '../../../context/DashboardTier2Context';
import { useAuth } from '../../../context/AuthContext';
import { useDashboardBasePath } from '../useDashboardBasePath';
import { relativeTime } from './relativeTime';

export default function ThreadDetailTier2() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const basePath = useDashboardBasePath();
  const { threads, addReply } = useDashboardTier2();
  const { user } = useAuth();
  const [reply, setReply] = useState('');

  const thread = threads.find(t => t.id === id);

  if (!thread) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 rounded-2xl bg-white p-8 text-center shadow-[0_4px_16px_rgba(16,58,107,.06)]">
        <MessageSquare className="h-10 w-10 text-amber-300" strokeWidth={1.5} />
        <h2 className="font-baloo text-[20px] font-bold text-stv-navy">Diskusi tidak ditemukan</h2>
        <Link
          to={`${basePath}/community`}
          className="rounded-full bg-amber-500 px-5 py-2 text-[14px] font-bold text-white no-underline transition hover:bg-amber-600"
        >
          Kembali ke Community Forum
        </Link>
      </div>
    );
  }

  function handleSubmitReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim() || !thread) return;
    addReply(thread.id, reply.trim(), user?.name ?? 'Anda');
    setReply('');
  }

  return (
    <div className="mx-auto max-w-[680px]">
      <button
        type="button"
        onClick={() => navigate(`${basePath}/community`)}
        className="mb-5 flex items-center gap-1.5 text-[14px] font-semibold text-stv-muted transition hover:text-amber-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Community Forum
      </button>

      {/* Original post */}
      <div className="rounded-2xl bg-white p-6 shadow-[0_4px_16px_rgba(16,58,107,.06)] sm:p-8">
        {thread.isSupportRequest && (
          <span className="mb-3 flex w-fit items-center gap-1 rounded-full bg-stv-green-tint px-2.5 py-0.5 text-[11px] font-bold text-stv-green">
            <ShieldCheck className="h-3 w-3" />
            Pertanyaan Resmi
          </span>
        )}
        <h1 className="font-baloo text-[24px] font-extrabold leading-[1.3] text-stv-navy sm:text-[28px]">{thread.title}</h1>
        <div className="mt-3 flex items-center gap-3 text-[13px] text-stv-muted">
          <span className="flex items-center gap-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-[11px] font-bold text-amber-700">
              {thread.author.charAt(0).toUpperCase()}
            </span>
            <strong className="text-stv-navy">{thread.author}</strong>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {relativeTime(thread.createdAt)}
          </span>
        </div>
        <p className="mt-4 text-[16px] leading-[1.75] text-stv-body">{thread.content}</p>
      </div>

      {/* Replies */}
      <div className="mt-6">
        <h3 className="mb-3 font-baloo text-[16px] font-bold text-stv-navy">
          {thread.replies.length} Balasan
        </h3>
        <div className="flex flex-col gap-3">
          {thread.replies.map(r => (
            <div
              key={r.id}
              className={`rounded-2xl p-4 ${
                r.isSupport ? 'border-2 border-stv-green-tint bg-stv-green-tint/30' : 'bg-white shadow-[0_4px_16px_rgba(16,58,107,.06)]'
              }`}
            >
              <div className="mb-2 flex items-center gap-2 text-[13px]">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                  r.isSupport ? 'bg-stv-green text-white' : 'bg-amber-100 text-amber-700'
                }`}>
                  {r.author.charAt(0).toUpperCase()}
                </span>
                <strong className="text-stv-navy">{r.author}</strong>
                {r.isSupport && (
                  <span className="flex items-center gap-1 rounded-full bg-stv-green px-2 py-0.5 text-[10px] font-bold text-white">
                    <ShieldCheck className="h-2.5 w-2.5" />
                    Tim Studiva
                  </span>
                )}
                <span className="ml-auto text-stv-muted">{relativeTime(r.createdAt)}</span>
              </div>
              <p className="text-[15px] leading-[1.65] text-stv-body">{r.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Reply form */}
      <form onSubmit={handleSubmitReply} className="mt-6 flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
        <label className="text-[13px] font-semibold text-stv-navy">Tulis balasan Anda</label>
        <textarea
          value={reply}
          onChange={e => setReply(e.target.value)}
          rows={3}
          placeholder="Bagikan pengalaman atau dukungan Anda di sini..."
          className="w-full resize-none rounded-xl border border-amber-200 px-4 py-2.5 text-[15px] focus:border-amber-500 focus:outline-none"
        />
        <button
          type="submit"
          className="flex items-center justify-center gap-1.5 self-end rounded-full bg-amber-500 px-5 py-2.5 text-[14px] font-bold text-white transition hover:bg-amber-600"
        >
          <Send className="h-4 w-4" />
          Kirim Balasan
        </button>
      </form>
    </div>
  );
}
