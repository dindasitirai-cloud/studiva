import React, { useState } from 'react';
import { PartnerThread, PartnerMessage } from '../types';
import { COPY_PARENT } from '../voiceGuide';
import { mockParentThread } from '../mockData';
import IntroCard from './IntroCard';
import ChatThread from './ChatThread';
import MessageComposer from './MessageComposer';

// Komponen shared — dirancang untuk menerima konteks tier via props agar
// dapat dipasang di Studiva Digital (Tier 2) maupun Sekolah Studiva (Tier 1)
// tanpa duplikasi kode. Fase 1 hanya memasangnya di Tier 2.
// TODO: Fase 3 — pasang di dashboard Tier 1 dengan tierContext='tier1'
interface PartnerOrangTuaPageProps {
  tierContext?: 'tier1' | 'tier2';
}

function generateId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function PartnerOrangTuaPage({ tierContext = 'tier2' }: PartnerOrangTuaPageProps) {
  // TODO: Inisialisasi dari API — query thread milik orang tua yang sedang login
  const [thread, setThread] = useState<PartnerThread>(mockParentThread);
  const [sending, setSending] = useState(false);

  function handleSend(body: string) {
    if (sending) return;
    setSending(true);

    const parentMsg: PartnerMessage = {
      id: generateId(),
      threadId: thread.id,
      sender: 'orang_tua',
      body,
      createdAt: new Date().toISOString(),
      readByParent: true,
      readByPendamping: false,
    };

    setThread((prev) => ({
      ...prev,
      status: 'menunggu_balasan',
      lastMessageAt: parentMsg.createdAt,
      messages: [...prev.messages, parentMsg],
    }));

    // TODO: kirim parentMsg ke backend + trigger notifikasi ke pendamping

    // Balasan jembatan otomatis — delay 500 ms agar terasa natural
    setTimeout(() => {
      const bridgeMsg: PartnerMessage = {
        id: generateId(),
        threadId: thread.id,
        sender: 'sistem',
        body: COPY_PARENT.jembatanOtomatis,
        createdAt: new Date().toISOString(),
        readByParent: true,
        readByPendamping: true,
      };

      setThread((prev) => ({
        ...prev,
        lastMessageAt: bridgeMsg.createdAt,
        messages: [...prev.messages, bridgeMsg],
      }));

      setSending(false);
    }, 500);
  }

  const hasMessages = thread.messages.length > 0;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 pb-6">
      {!hasMessages && <IntroCard />}

      {hasMessages && (
        <div className="rounded-2xl border border-stv-border bg-white p-4 sm:p-5">
          {/* Header thread */}
          <div className="mb-4 flex items-center justify-between border-b border-stv-border pb-3">
            <div>
              <p className="text-[13px] text-stv-muted">Percakapan untuk</p>
              <p className="font-baloo text-[17px] font-bold text-stv-navy">{thread.childName}</p>
            </div>
            <StatusBadge status={thread.status} />
          </div>

          <div className="max-h-[480px] overflow-y-auto pr-1">
            <ChatThread messages={thread.messages} />
          </div>
        </div>
      )}

      <MessageComposer onSend={handleSend} disabled={sending} />

      {!hasMessages && (
        <p className="text-center text-[13px] text-stv-muted">{COPY_PARENT.emptyState}</p>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: PartnerThread['status'] }) {
  const map: Record<PartnerThread['status'], { label: string; cls: string }> = {
    menunggu_balasan: { label: 'Menunggu Balasan', cls: 'bg-amber-100 text-amber-700' },
    dibalas: { label: 'Sudah Dibalas', cls: 'bg-stv-green-tint text-stv-green' },
    selesai: { label: 'Selesai', cls: 'bg-stv-border text-stv-muted' },
  };
  const { label, cls } = map[status];
  return (
    <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${cls}`}>{label}</span>
  );
}
