import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, Send } from 'lucide-react';
import { PartnerThread } from '../types';
import { COPY_ADMIN } from '../voiceGuide';
import ChatThread from '../parent/ChatThread';
import CatatanPendampingPanel from './CatatanPendampingPanel';
import { relativeTime } from '../../../pages/DashboardPages/Tier2/relativeTime';

interface ThreadDetailProps {
  thread: PartnerThread;
  onReply: (body: string, senderName: string) => void;
  onMarkDone: () => void;
  onBack?: () => void; // untuk tampilan mobile — kembali ke daftar
}

export default function ThreadDetail({ thread, onReply, onMarkDone, onBack }: ThreadDetailProps) {
  const [replyBody, setReplyBody] = useState('');
  // TODO: ambil dari akun pendamping yang sedang login
  const [senderName, setSenderName] = useState(COPY_ADMIN.namaPenandaTanganDefault);
  const [confirmDone, setConfirmDone] = useState(false);

  function handleReply(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = replyBody.trim();
    if (!trimmed) return;
    onReply(trimmed, senderName.trim() || COPY_ADMIN.namaPenandaTanganDefault);
    setReplyBody('');
  }

  const isDone = thread.status === 'selesai';

  return (
    <div className="flex h-full flex-col lg:flex-row lg:gap-0">
      {/* Panel kiri: percakapan + composer */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-stv-border bg-white px-4 py-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Kembali ke daftar"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-stv-muted transition hover:bg-stv-border hover:text-stv-navy lg:hidden"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-baloo text-[16px] font-bold text-stv-navy truncate">{thread.childName}</p>
              <StatusBadge status={thread.status} />
            </div>
            <p className="text-[12px] text-stv-muted">
              {thread.parentName} &middot; terakhir {relativeTime(thread.lastMessageAt)}
            </p>
          </div>

          {!isDone && (
            <div className="flex items-center gap-2">
              {confirmDone ? (
                <>
                  <span className="text-[12px] text-stv-body">{COPY_ADMIN.tandaiSelesaiKonfirmasi}</span>
                  <button
                    type="button"
                    onClick={() => { onMarkDone(); setConfirmDone(false); }}
                    className="rounded-lg bg-stv-green px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-stv-green/90"
                  >
                    {COPY_ADMIN.tandaiSelesaiYa}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDone(false)}
                    className="rounded-lg border border-stv-border px-3 py-1.5 text-[12px] font-semibold text-stv-body transition hover:bg-stv-border"
                  >
                    {COPY_ADMIN.tandaiSelesaiBatal}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDone(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-stv-border px-3 py-1.5 text-[12px] font-semibold text-stv-body transition hover:bg-stv-green-tint hover:text-stv-green"
                >
                  <CheckCircle className="h-3.5 w-3.5" strokeWidth={2} />
                  {COPY_ADMIN.tandaiSelesai}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Riwayat pesan */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4">
          <ChatThread messages={thread.messages} />
        </div>

        {/* Composer balasan */}
        {!isDone && (
          <form onSubmit={handleReply} className="border-t border-stv-border bg-white p-4">
            <div className="mb-2 flex items-center gap-2">
              <label className="shrink-0 text-[12px] font-semibold text-stv-muted">
                {COPY_ADMIN.namaPenandaTangan}:
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-36 rounded-lg border border-stv-border px-2.5 py-1 text-[13px] text-stv-navy focus:border-slate-400 focus:outline-none"
              />
            </div>
            <div className="flex items-end gap-2">
              <textarea
                rows={2}
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder={COPY_ADMIN.replyPlaceholder}
                className="flex-1 resize-none rounded-xl border border-stv-border bg-slate-50 px-3 py-2.5 text-[14px] text-stv-navy placeholder:text-stv-muted-2 focus:border-slate-400 focus:outline-none"
                style={{ minHeight: '64px' }}
              />
              <button
                type="submit"
                disabled={!replyBody.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stv-navy text-white transition hover:bg-stv-navy/90 disabled:opacity-40"
              >
                <Send className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Panel kanan: profil anak + catatan pendamping */}
      <aside className="w-full shrink-0 border-t border-stv-border bg-white lg:w-72 lg:border-l lg:border-t-0">
        <div className="overflow-y-auto p-4 lg:h-full">
          {/* Profil singkat anak */}
          <div className="mb-4 rounded-xl border border-stv-border p-3">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-stv-muted-2">
              {COPY_ADMIN.profilAnakTitle}
            </p>
            <p className="font-baloo text-[16px] font-bold text-stv-navy">{thread.childName}</p>
            <p className="text-[12px] text-stv-muted">Orang tua: {thread.parentName}</p>
            {/* TODO: tautkan ke profil & jurnal anak yang sudah ada di sistem (by childId) */}
            <p className="mt-1 text-[11px] text-stv-muted-2 italic">
              ID: {thread.childId}
            </p>
          </div>

          <CatatanPendampingPanel childId={thread.childId} childName={thread.childName} />
        </div>
      </aside>
    </div>
  );
}

function StatusBadge({ status }: { status: PartnerThread['status'] }) {
  const map: Record<PartnerThread['status'], { label: string; cls: string }> = {
    menunggu_balasan: { label: 'Menunggu', cls: 'bg-mawar text-rekah-tua' },
    dibalas: { label: 'Dibalas', cls: 'bg-stv-green-tint text-stv-green' },
    selesai: { label: 'Selesai', cls: 'bg-stv-border text-stv-muted' },
  };
  const { label, cls } = map[status];
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}>{label}</span>
  );
}
