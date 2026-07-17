import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarHeart } from 'lucide-react';
import { useDashboardBasePath } from '../useDashboardBasePath';

/** CTA lembut di bawah kartu domain DK — mengarah ke fitur Konsultasi. */
export function KonsultasiCTA() {
  const navigate = useNavigate();
  const basePath = useDashboardBasePath();

  return (
    <div className="mt-5 rounded-2xl border border-violet-200 bg-violet-50 p-5">
      <div className="flex items-start gap-3">
        <CalendarHeart
          className="mt-0.5 h-5 w-5 shrink-0 text-violet-600"
          strokeWidth={1.5}
        />
        <div className="flex-1">
          <p className="font-semibold text-violet-800 text-[14px]">
            Ingin mendiskusikan perkembangan anak Anda?
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-violet-700">
            Psikolog dan tim Studiva siap membantu.
          </p>
          <button
            type="button"
            onClick={() => {
              // TODO: lacak klik CTA (analitik) saat backend siap.
              navigate(`${basePath}/konsultasi`);
            }}
            className="mt-3 rounded-xl bg-violet-600 px-5 py-2 text-[13px] font-bold text-white transition hover:bg-violet-700 active:scale-95"
          >
            Jadwalkan Konsultasi
          </button>
        </div>
      </div>
    </div>
  );
}
