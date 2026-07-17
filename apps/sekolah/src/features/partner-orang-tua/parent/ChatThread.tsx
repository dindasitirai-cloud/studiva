import React, { useEffect, useRef } from 'react';
import { PartnerMessage } from '../types';
import { relativeTime } from '../../../lib/relativeTime';

interface ChatThreadProps {
  messages: PartnerMessage[];
}

export default function ChatThread({ messages }: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 py-2">
      {messages.map((msg) => {
        if (msg.sender === 'sistem') {
          return (
            <div key={msg.id} className="flex flex-col items-center gap-0.5">
              <span className="rounded-full bg-stv-border px-3 py-1 text-center text-[12px] text-stv-muted">
                {msg.body}
              </span>
              <span className="text-[11px] text-stv-muted-2">{relativeTime(msg.createdAt)}</span>
            </div>
          );
        }

        const isParent = msg.sender === 'orang_tua';

        return (
          <div key={msg.id} className={`flex flex-col ${isParent ? 'items-end' : 'items-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed sm:max-w-[70%] ${
                isParent
                  ? 'rounded-br-sm bg-amber-500 text-white'
                  : 'rounded-bl-sm bg-white text-stv-navy shadow-sm ring-1 ring-stv-border'
              }`}
            >
              {msg.body}
            </div>
            <div className="mt-1 flex items-center gap-1.5 px-1">
              {!isParent && msg.senderName && (
                <span className="text-[12px] font-semibold text-amber-700">
                  — {msg.senderName} 🌷
                </span>
              )}
              <span className="text-[11px] text-stv-muted-2">{relativeTime(msg.createdAt)}</span>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
