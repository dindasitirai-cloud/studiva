import React, { createContext, useCallback, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Receipt, Clock, Video } from 'lucide-react';

export type FullscreenNotifKind =
  | 'spp-new'
  | 'spp-reminder-h7'
  | 'spp-reminder-h1'
  | 'webinar-reminder-h1';

export interface FullscreenNotif {
  id: string;
  kind: FullscreenNotifKind;
  title: string;
  message: string;
  amount?: number;
  ctaLabel: string;
  ctaTo?: string;
}

interface FullscreenNotifContextValue {
  showFullscreenNotif: (notif: Omit<FullscreenNotif, 'id'>) => void;
}

const FullscreenNotifContext = createContext<FullscreenNotifContextValue | null>(null);

let nid = 1;

function formatIDR(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

const KIND_META: Record<FullscreenNotifKind, { emoji: string; gradient: string; iconBg: string; icon: typeof Receipt }> = {
  'spp-new':           { emoji: '💳', gradient: 'from-emerald-500 to-teal-600',   iconBg: 'bg-emerald-100', icon: Receipt },
  'spp-reminder-h7':   { emoji: '📅', gradient: 'from-amber-400 to-orange-500',   iconBg: 'bg-amber-100',   icon: Clock },
  'spp-reminder-h1':   { emoji: '⏰', gradient: 'from-red-500 to-rose-600',        iconBg: 'bg-red-100',     icon: Clock },
  'webinar-reminder-h1': { emoji: '🎓', gradient: 'from-purple-500 to-indigo-600', iconBg: 'bg-purple-100', icon: Video },
};

function NotifModal({ notif, onClose }: { notif: FullscreenNotif; onClose: () => void }) {
  const navigate = useNavigate();
  const meta = KIND_META[notif.kind];
  const Icon = meta.icon;

  function handleCta() {
    onClose();
    if (notif.ctaTo) navigate(notif.ctaTo);
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-stv-navy/60 backdrop-blur-sm" onClick={onClose} />

      {/* Card */}
      <div className="relative w-full max-w-[440px] overflow-hidden rounded-3xl bg-white shadow-[0_32px_80px_rgba(16,58,107,.3)]">
        {/* Gradient header */}
        <div className={`bg-gradient-to-br ${meta.gradient} px-8 pb-10 pt-8 text-center text-white`}>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
          >
            <X className="h-4 w-4" />
          </button>
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${meta.iconBg}`}>
            <Icon className="h-8 w-8 text-stv-navy" strokeWidth={1.5} />
          </div>
          <p className="text-[40px] leading-none">{meta.emoji}</p>
        </div>

        {/* Content */}
        <div className="px-8 pb-8 pt-6 text-center">
          <h2 className="mb-2 font-baloo text-[22px] font-extrabold text-stv-navy">{notif.title}</h2>
          <p className="mb-4 text-[15px] leading-[1.6] text-stv-body">{notif.message}</p>

          {notif.amount !== undefined && (
            <div className="mb-5 rounded-2xl bg-slate-50 py-3">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-stv-muted">Jumlah Tagihan</p>
              <p className="font-baloo text-[28px] font-extrabold text-stv-navy">{formatIDR(notif.amount)}</p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleCta}
              className={`w-full rounded-2xl bg-gradient-to-r ${meta.gradient} py-3.5 font-baloo text-[16px] font-bold text-white transition hover:opacity-90`}
            >
              {notif.ctaLabel}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-2xl py-2.5 text-[14px] font-semibold text-stv-muted transition hover:text-stv-navy"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FullscreenNotificationProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<FullscreenNotif[]>([]);

  const showFullscreenNotif = useCallback((notif: Omit<FullscreenNotif, 'id'>) => {
    const id = `fsn-${nid++}`;
    setQueue(prev => [...prev, { ...notif, id }]);
  }, []);

  function dismiss() {
    setQueue(prev => prev.slice(1));
  }

  const current = queue[0] ?? null;

  return (
    <FullscreenNotifContext.Provider value={{ showFullscreenNotif }}>
      {children}
      {current && <NotifModal key={current.id} notif={current} onClose={dismiss} />}
    </FullscreenNotifContext.Provider>
  );
}

export function useFullscreenNotif() {
  const ctx = useContext(FullscreenNotifContext);
  if (!ctx) throw new Error('useFullscreenNotif must be used within FullscreenNotificationProvider');
  return ctx;
}
