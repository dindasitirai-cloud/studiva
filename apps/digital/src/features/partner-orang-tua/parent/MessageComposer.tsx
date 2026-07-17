import React, { useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { COPY_PARENT } from '../voiceGuide';

interface MessageComposerProps {
  onSend: (body: string) => void;
  disabled?: boolean;
}

export default function MessageComposer({ onSend, disabled }: MessageComposerProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 rounded-2xl border border-amber-200 bg-white p-3 shadow-sm"
    >
      <textarea
        ref={textareaRef}
        rows={2}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={COPY_PARENT.composerPlaceholder}
        className="flex-1 resize-none overflow-hidden bg-transparent text-[14px] text-stv-navy placeholder:text-stv-muted-2 focus:outline-none"
        style={{ minHeight: '48px', maxHeight: '160px' }}
      />
      <button
        type="submit"
        disabled={!value.trim() || disabled}
        aria-label={COPY_PARENT.composerKirim}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white transition hover:bg-amber-600 disabled:opacity-40"
      >
        <Send className="h-4 w-4" strokeWidth={2} />
      </button>
    </form>
  );
}
