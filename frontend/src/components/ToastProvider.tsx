import React, { createContext, useCallback, useContext, useState } from 'react';
import { X, MessageSquare, Video, Clock, TrendingUp, FolderOpen, ClipboardList, LucideIcon } from 'lucide-react';

// Covers notification "kinds" from both DashboardTier2Context (shared
// Studiva Digital activity) and DashboardTier1Context (teacher input) so
// either can pop up a toast without this file depending on their types.
export type ToastKind =
  | 'forum-reply' | 'webinar-registered' | 'webinar-reminder'
  | 'perkembangan' | 'portfolio' | 'asesmen';

const ICON_META: Record<ToastKind, { icon: LucideIcon; color: string; bg: string }> = {
  'forum-reply': { icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-50' },
  'webinar-registered': { icon: Video, color: 'text-amber-600', bg: 'bg-amber-50' },
  'webinar-reminder': { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  perkembangan: { icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
  portfolio: { icon: FolderOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
  asesmen: { icon: ClipboardList, color: 'text-indigo-600', bg: 'bg-indigo-50' },
};

interface ToastItem {
  id: string;
  kind: ToastKind;
  title: string;
  message: string;
}

interface ToastContextValue {
  showToast: (toast: { kind: ToastKind; title: string; message: string }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let toastId = 1;
const AUTO_DISMISS_MS = 6000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((toast: { kind: ToastKind; title: string; message: string }) => {
    const id = `toast-${toastId++}`;
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Fixed below the 60px dashboard topbar so it never overlaps it. */}
      <div className="pointer-events-none fixed inset-x-0 top-[76px] z-[70] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6">
        {toasts.map(t => {
          const meta = ICON_META[t.kind];
          const Icon = meta.icon;
          return (
            <div
              key={t.id}
              className="animate-fade-in-up pointer-events-auto flex w-full max-w-[360px] items-start gap-3 rounded-2xl bg-white p-4 shadow-[0_12px_32px_rgba(16,58,107,.18)]"
            >
              <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${meta.bg}`}>
                <Icon className={`h-4 w-4 ${meta.color}`} />
              </span>
              <div className="flex-1">
                <p className="text-[13px] font-bold text-stv-navy">{t.title}</p>
                <p className="mt-0.5 text-[12px] leading-[1.4] text-stv-body">{t.message}</p>
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Tutup notifikasi"
                className="text-stv-muted transition hover:text-stv-navy"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
