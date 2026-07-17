import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, MessageSquarePlus } from 'lucide-react';
import { useDashboardTier1 } from './DashboardTier1Context';

function formatChatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { weekday: 'short' }) + ', ' +
    d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

export default function CatatanGuruTier1() {
  const { parentNotes, addParentNote, child } = useDashboardTier1();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Flatten notes + replies into a chronological chat stream
  const messages = [...parentNotes]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .flatMap(note => {
      const items: { id: string; type: 'parent' | 'teacher'; text: string; time: string; name: string; readByTeacher: boolean }[] = [
        { id: note.id, type: 'parent', text: note.message, time: note.createdAt, name: 'Orang Tua', readByTeacher: note.readByTeacher },
      ];
      if (note.teacherResponse && note.teacherResponseAt) {
        items.push({
          id: note.id + '-reply',
          type: 'teacher',
          text: note.teacherResponse,
          time: note.teacherResponseAt,
          name: note.teacherName ?? child.waliKelas,
          readByTeacher: true,
        });
      }
      return items;
    });

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    addParentNote({ date: todayISODate(), category: 'info-umum', message: text, urgency: 'normal' });
    setInput('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className="mx-auto flex max-w-[680px] flex-col gap-4">
      <div>
        <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">Catatan untuk Guru</h2>
        <p className="text-[14px] text-stv-muted">
          Bagikan hal yang perlu jadi perhatian guru. Guru akan membalas di sini.
        </p>
      </div>

      {/* Chat window */}
      <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_4px_16px_rgba(16,58,107,.08)]">

        {/* Messages area */}
        <div className="flex max-h-[520px] min-h-[320px] flex-col gap-3 overflow-y-auto px-4 py-5">
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
              <MessageSquarePlus className="h-10 w-10 text-stv-sky-tint" strokeWidth={1.5} />
              <p className="text-[14px] font-semibold text-stv-navy">Belum ada catatan</p>
              <p className="text-[13px] text-stv-muted">Tulis pesan di bawah untuk mengirim catatan ke guru.</p>
            </div>
          ) : (
            messages.map(msg => {
              const isParent = msg.type === 'parent';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isParent ? 'items-end' : 'items-start'}`}
                >
                  <div className={`max-w-[78%] rounded-2xl px-4 py-3 ${
                    isParent
                      ? 'rounded-tr-sm bg-stv-sky-tint'
                      : 'rounded-tl-sm bg-stv-green-tint'
                  }`}>
                    {/* Sender name */}
                    <p className={`mb-1 text-[12px] font-bold ${
                      isParent ? 'text-stv-sky-stroke' : 'text-stv-green'
                    }`}>
                      {msg.name}
                    </p>
                    {/* Message text */}
                    <p className="text-[14px] leading-[1.6] text-stv-navy">{msg.text}</p>
                    {/* Timestamp */}
                    <p className={`mt-1.5 text-[11px] text-stv-muted ${isParent ? 'text-right' : 'text-left'}`}>
                      {formatChatTime(msg.time)}
                      {isParent && !msg.readByTeacher && (
                        <span className="ml-2 text-stv-muted-2">· Terkirim</span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Divider */}
        <div className="h-px bg-stv-border" />

        {/* Input area */}
        <div className="flex items-end gap-3 px-4 py-3">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tulis catatan..."
            rows={1}
            className="flex-1 resize-none rounded-2xl border border-stv-border bg-slate-50 px-4 py-3 text-[15px] text-stv-navy placeholder:text-stv-muted-2 focus:border-stv-sky-stroke focus:outline-none focus:ring-2 focus:ring-stv-sky-stroke/20"
            style={{ maxHeight: 120, overflowY: 'auto' }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim()}
            aria-label="Kirim catatan"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-stv-sky-stroke text-white shadow-[0_4px_12px_rgba(46,139,201,.35)] transition hover:bg-stv-sky-stroke/90 disabled:opacity-40"
          >
            <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
