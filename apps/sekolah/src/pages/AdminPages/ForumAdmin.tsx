import React, { useMemo, useState } from 'react';
import {
  Plus, MessageSquare, Clock, ShieldCheck, Megaphone, Pin, PinOff, Eye, EyeOff,
  Trash2, Send, X, AlertTriangle, Search,
} from 'lucide-react';
import { useDashboardTier2, ForumThread, ForumThreadStatus } from '../../context/DashboardTier2Context';
import { relativeTime } from '../DashboardPages/Tier2/relativeTime';

const STATUS_LABEL: Record<ForumThreadStatus, string> = {
  aktif: 'Aktif',
  dilaporkan: 'Dilaporkan',
  disembunyikan: 'Disembunyikan',
};
const STATUS_STYLE: Record<ForumThreadStatus, string> = {
  aktif: 'bg-stv-green-tint text-stv-green',
  dilaporkan: 'bg-red-100 text-red-600',
  disembunyikan: 'bg-slate-100 text-slate-600',
};

function AnnouncementModal({ onClose, onCreate }: { onClose: () => void; onCreate: (title: string, content: string) => void }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) { setError('Judul dan isi pengumuman wajib diisi.'); return; }
    onCreate(title.trim(), content.trim());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stv-navy/30 px-4 py-8">
      <div className="w-full max-w-[520px] rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(16,58,107,.2)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-baloo text-[18px] font-bold text-stv-navy">Buat Pengumuman Resmi</h2>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-stv-muted hover:text-stv-navy">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Judul *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="mis. Jadwal Webinar Bulan Ini"
              className="w-full rounded-xl border border-stv-border px-4 py-2.5 text-[15px] focus:border-orange-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Isi Pengumuman *</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-xl border border-stv-border px-4 py-2.5 text-[15px] focus:border-orange-400 focus:outline-none"
            />
          </div>
          {error && <p className="text-[13px] text-red-500">{error}</p>}
          <div className="mt-2 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-full border border-stv-border px-5 py-2 text-[14px] font-semibold text-stv-body hover:bg-slate-50">
              Batal
            </button>
            <button type="submit" className="flex items-center gap-1.5 rounded-full bg-orange-500 px-5 py-2 text-[14px] font-bold text-white transition hover:bg-orange-600">
              <Megaphone className="h-4 w-4" />
              Posting Pengumuman
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReplyModal({ thread, onClose, onSend }: { thread: ForumThread; onClose: () => void; onSend: (content: string) => void }) {
  const [content, setContent] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stv-navy/30 px-4 py-8">
      <div className="w-full max-w-[480px] rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(16,58,107,.2)]">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-baloo text-[18px] font-bold text-stv-navy">Balas sebagai Tim Studiva</h2>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-stv-muted hover:text-stv-navy">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mb-4 text-[13px] text-stv-muted">{thread.title}</p>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={4}
          placeholder="Tulis balasan resmi..."
          className="w-full resize-none rounded-xl border border-stv-border px-4 py-2.5 text-[15px] focus:border-orange-400 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => content.trim() && onSend(content.trim())}
          disabled={!content.trim()}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-stv-green px-5 py-2.5 text-[14px] font-bold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          Kirim Balasan Resmi
        </button>
      </div>
    </div>
  );
}

export default function ForumAdmin() {
  const { threads, addThread, addReply, updateThreadStatus, togglePinThread, deleteThread } = useDashboardTier2();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'semua' | ForumThreadStatus>('semua');
  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const [replyThread, setReplyThread] = useState<ForumThread | null>(null);

  const reported = threads.filter(t => t.status === 'dilaporkan');

  const filtered = useMemo(() => {
    return threads
      .filter(t => statusFilter === 'semua' || t.status === statusFilter)
      .filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [threads, search, statusFilter]);

  function handleDelete(thread: ForumThread) {
    if (window.confirm(`Hapus diskusi "${thread.title}"? Tindakan ini tidak bisa dibatalkan.`)) {
      deleteThread(thread.id);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">Community Forum</h2>
          <p className="text-[14px] text-stv-muted">Satu komunitas bersama untuk Tier 1 & Tier 2 - moderasi dan balasan resmi tampil ke semua orang tua.</p>
        </div>
        <button
          type="button"
          onClick={() => setAnnouncementOpen(true)}
          className="flex items-center gap-1.5 rounded-full bg-orange-500 px-5 py-2.5 text-[14px] font-bold text-white transition hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" />
          Buat Pengumuman Resmi
        </button>
      </div>

      {/* Perlu Moderasi */}
      <div className="rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
        <h3 className="flex items-center gap-2 font-baloo text-[16px] font-bold text-stv-navy">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          Perlu Moderasi {reported.length > 0 && `(${reported.length})`}
        </h3>

        {reported.length === 0 ? (
          <p className="mt-3 text-[13px] text-stv-muted">Tidak ada konten yang dilaporkan saat ini.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {reported.map(t => (
              <div key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-red-50 p-3">
                <div>
                  <p className="text-[13px] font-semibold text-stv-navy">{t.title}</p>
                  <p className="text-[12px] text-stv-muted">oleh {t.author}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateThreadStatus(t.id, 'aktif')}
                    className="rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-stv-green hover:bg-stv-green-tint"
                  >
                    Abaikan Laporan
                  </button>
                  <button
                    type="button"
                    onClick={() => updateThreadStatus(t.id, 'disembunyikan')}
                    className="rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-orange-600 hover:bg-orange-100"
                  >
                    Sembunyikan
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(t)}
                    className="rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-red-600 hover:bg-red-100"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-[280px]">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stv-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari judul diskusi..."
            className="w-full rounded-full border border-stv-border bg-white py-2.5 pl-10 pr-4 text-[14px] focus:border-orange-400 focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as 'semua' | ForumThreadStatus)}
          className="rounded-full border border-stv-border bg-white px-4 py-2.5 text-[14px] focus:border-orange-400 focus:outline-none"
        >
          <option value="semua">Semua Status</option>
          <option value="aktif">Aktif</option>
          <option value="dilaporkan">Dilaporkan</option>
          <option value="disembunyikan">Disembunyikan</option>
        </select>
      </div>

      {/* Thread list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-orange-200 py-14 text-center">
          <MessageSquare className="h-10 w-10 text-orange-300" strokeWidth={1.5} />
          <p className="mt-3 font-semibold text-stv-navy">Tidak ada diskusi yang cocok</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(t => (
            <div key={t.id} className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`w-fit rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS_STYLE[t.status]}`}>{STATUS_LABEL[t.status]}</span>
                  {t.pinned && (
                    <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                      <Pin className="h-3 w-3" />Disematkan
                    </span>
                  )}
                  {t.isAnnouncement && (
                    <span className="flex items-center gap-1 rounded-full bg-stv-badge-navy-tint px-2.5 py-0.5 text-[11px] font-bold text-stv-navy">
                      <Megaphone className="h-3 w-3" />Pengumuman
                    </span>
                  )}
                  {t.isSupportRequest && (
                    <span className="flex items-center gap-1 rounded-full bg-stv-green-tint px-2.5 py-0.5 text-[11px] font-bold text-stv-green">
                      <ShieldCheck className="h-3 w-3" />Resmi
                    </span>
                  )}
                </div>
                <span className="flex items-center gap-1 text-[12px] text-stv-muted">
                  <Clock className="h-3 w-3" />{relativeTime(t.createdAt)}
                </span>
              </div>

              <div>
                <p className="font-baloo text-[15px] font-bold text-stv-navy">{t.title}</p>
                <p className="mt-0.5 line-clamp-2 text-[13px] text-stv-muted">{t.content}</p>
                <p className="mt-1 text-[12px] text-stv-muted">oleh {t.author} &middot; {t.replies.length} balasan</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-stv-border pt-3">
                <button
                  type="button"
                  onClick={() => setReplyThread(t)}
                  className="flex items-center gap-1.5 rounded-full bg-stv-green-tint px-3 py-1.5 text-[12px] font-semibold text-stv-green hover:opacity-80"
                >
                  <Send className="h-3.5 w-3.5" />
                  Balas Resmi
                </button>
                <button
                  type="button"
                  onClick={() => togglePinThread(t.id)}
                  className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-[12px] font-semibold text-amber-700 hover:opacity-80"
                >
                  {t.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                  {t.pinned ? 'Lepas Sematan' : 'Sematkan'}
                </button>
                <button
                  type="button"
                  onClick={() => updateThreadStatus(t.id, t.status === 'disembunyikan' ? 'aktif' : 'disembunyikan')}
                  className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[12px] font-semibold text-slate-600 hover:opacity-80"
                >
                  {t.status === 'disembunyikan' ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  {t.status === 'disembunyikan' ? 'Tampilkan' : 'Sembunyikan'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(t)}
                  className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-[12px] font-semibold text-red-600 hover:opacity-80"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {announcementOpen && (
        <AnnouncementModal
          onClose={() => setAnnouncementOpen(false)}
          onCreate={(title, content) => {
            addThread(title, content, 'Tim Studiva', false, true);
            setAnnouncementOpen(false);
          }}
        />
      )}

      {replyThread && (
        <ReplyModal
          thread={replyThread}
          onClose={() => setReplyThread(null)}
          onSend={content => {
            addReply(replyThread.id, content, 'Tim Studiva', true);
            setReplyThread(null);
          }}
        />
      )}
    </div>
  );
}
