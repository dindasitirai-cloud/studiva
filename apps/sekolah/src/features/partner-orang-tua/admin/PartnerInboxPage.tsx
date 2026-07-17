import React, { useState } from 'react';
import { Inbox } from 'lucide-react';
import { PartnerThread, PartnerMessage, ThreadStatus } from '../types';
import { mockThreads } from '../mockData';
import { COPY_ADMIN, STATUS_LABEL } from '../voiceGuide';
import ThreadDetail from './ThreadDetail';
import { relativeTime } from '../../../lib/relativeTime';

const STATUS_ORDER: Record<ThreadStatus, number> = {
  menunggu_balasan: 0,
  dibalas: 1,
  selesai: 2,
};

const STATUS_BADGE_CLS: Record<ThreadStatus, string> = {
  menunggu_balasan: 'bg-amber-100 text-amber-700',
  dibalas: 'bg-stv-green-tint text-stv-green',
  selesai: 'bg-stv-border text-stv-muted',
};

function sortThreads(threads: PartnerThread[]): PartnerThread[] {
  return [...threads].sort((a, b) => {
    if (STATUS_ORDER[a.status] !== STATUS_ORDER[b.status]) {
      return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    }
    // menunggu_balasan: yang paling lama menunggu di puncak (ascending)
    if (a.status === 'menunggu_balasan') {
      return new Date(a.lastMessageAt).getTime() - new Date(b.lastMessageAt).getTime();
    }
    // lainnya: terbaru di atas (descending)
    return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
  });
}

function generateId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function PartnerInboxPage() {
  // TODO: inisialisasi dari API — query semua thread aktif
  const [threads, setThreads] = useState<PartnerThread[]>(mockThreads);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sorted = sortThreads(threads);
  const selectedThread = threads.find((t) => t.id === selectedId) ?? null;

  function handleReply(body: string, senderName: string) {
    if (!selectedId) return;

    const replyMsg: PartnerMessage = {
      id: generateId(),
      threadId: selectedId,
      sender: 'pendamping',
      senderName,
      body,
      createdAt: new Date().toISOString(),
      readByParent: false,
      readByPendamping: true,
    };

    // TODO: kirim ke backend + notifikasi orang tua
    setThreads((prev) =>
      prev.map((t) =>
        t.id === selectedId
          ? { ...t, status: 'dibalas', lastMessageAt: replyMsg.createdAt, messages: [...t.messages, replyMsg] }
          : t,
      ),
    );
  }

  function handleMarkDone() {
    if (!selectedId) return;
    // TODO: update status di backend
    setThreads((prev) =>
      prev.map((t) => (t.id === selectedId ? { ...t, status: 'selesai' } : t)),
    );
  }

  const pendingCount = threads.filter((t) => t.status === 'menunggu_balasan').length;

  return (
    <div className="flex h-[calc(100vh-60px)] overflow-hidden">
      {/* Daftar thread — selalu tampil di desktop, tersembunyi di mobile saat thread dipilih */}
      <div
        className={`flex w-full shrink-0 flex-col border-r border-stv-border bg-white lg:w-[340px] xl:w-[380px] ${
          selectedId ? 'hidden lg:flex' : 'flex'
        }`}
      >
        {/* Header daftar */}
        <div className="flex items-center gap-2 border-b border-stv-border px-4 py-3">
          <Inbox className="h-4 w-4 text-stv-muted" strokeWidth={2} />
          <h2 className="font-baloo text-[16px] font-bold text-stv-navy">Antrian Thread</h2>
          {pendingCount > 0 && (
            <span className="ml-auto rounded-full bg-amber-100 px-2.5 py-0.5 text-[12px] font-bold text-amber-700">
              {pendingCount}
            </span>
          )}
        </div>

        {/* Daftar */}
        {sorted.length === 0 ? (
          <p className="p-6 text-center text-[13px] text-stv-muted">{COPY_ADMIN.inboxEmptyState}</p>
        ) : (
          <ul className="flex-1 overflow-y-auto divide-y divide-stv-border">
            {sorted.map((thread) => {
              const lastMsg = thread.messages[thread.messages.length - 1];
              const isSelected = thread.id === selectedId;
              return (
                <li key={thread.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(thread.id)}
                    className={`w-full px-4 py-3 text-left transition hover:bg-amber-50 ${
                      isSelected ? 'bg-amber-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-[14px] font-bold text-stv-navy">
                            {thread.childName}
                          </p>
                          {thread.status === 'menunggu_balasan' && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                          )}
                        </div>
                        <p className="text-[12px] text-stv-muted">{thread.parentName}</p>
                        {lastMsg && (
                          <p className="mt-1 truncate text-[12px] text-stv-body">
                            {lastMsg.sender === 'sistem' ? '(jembatan otomatis)' : lastMsg.body}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_BADGE_CLS[thread.status]}`}
                        >
                          {STATUS_LABEL[thread.status]}
                        </span>
                        <span className="text-[11px] text-stv-muted-2">
                          {relativeTime(thread.lastMessageAt)}
                        </span>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Panel detail — tampil saat thread dipilih */}
      <div
        className={`flex-1 overflow-hidden ${selectedId ? 'flex flex-col' : 'hidden lg:flex lg:items-center lg:justify-center'}`}
      >
        {selectedThread ? (
          <ThreadDetail
            thread={selectedThread}
            onReply={handleReply}
            onMarkDone={handleMarkDone}
            onBack={() => setSelectedId(null)}
          />
        ) : (
          <p className="text-[14px] text-stv-muted">Pilih thread untuk melihat percakapan.</p>
        )}
      </div>
    </div>
  );
}
