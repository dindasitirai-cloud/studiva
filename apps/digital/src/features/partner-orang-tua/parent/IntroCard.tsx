import React from 'react';
import { ShieldCheck, Lock, Clock } from 'lucide-react';
import { COPY_PARENT } from '../voiceGuide';

const ICON_MAP = {
  ShieldCheck,
  Lock,
  Clock,
};

export default function IntroCard() {
  return (
    <div className="rounded-2xl border border-mawar bg-fajar p-5 sm:p-6">
      <h2 className="font-baloo text-[20px] font-bold text-stv-navy">{COPY_PARENT.introTitle}</h2>
      <p className="mt-2 text-[14px] leading-relaxed text-stv-body">{COPY_PARENT.introBody}</p>

      <ul className="mt-4 space-y-2.5">
        {COPY_PARENT.introPoin.map((poin) => {
          const Icon = ICON_MAP[poin.icon];
          return (
            <li key={poin.icon} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mawar text-rekah-tua">
                <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
              <span className="text-[13px] font-semibold text-stv-navy">{poin.label}</span>
            </li>
          );
        })}
      </ul>

      <p className="mt-5 rounded-xl bg-white/60 px-4 py-3 text-[12px] leading-relaxed text-stv-muted">
        {COPY_PARENT.introDisclaimer}
      </p>
    </div>
  );
}
