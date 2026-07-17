import React, { useEffect, useState } from 'react';
import { CalendarCheck, AlertCircle } from 'lucide-react';
import { useDashboardTier1, AttendanceStatus } from './DashboardTier1Context';

const STATUS_LABEL: Record<AttendanceStatus, string> = { hadir: 'Hadir', izin: 'Izin', sakit: 'Sakit', alfa: 'Alfa' };
const STATUS_DOT: Record<AttendanceStatus, string> = {
  hadir: 'bg-stv-green', izin: 'bg-yellow-400', sakit: 'bg-orange-400', alfa: 'bg-red-500',
};
const STATUS_BADGE: Record<AttendanceStatus, string> = {
  hadir: 'bg-stv-green-tint text-stv-green',
  izin: 'bg-yellow-100 text-yellow-700',
  sakit: 'bg-orange-100 text-orange-700',
  alfa: 'bg-red-100 text-red-600',
};

const WEEKDAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

function useAnimatedCounter(target: number, duration = 800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    // No "run once" guard on purpose - see BerandaTier2's identical hook for
    // why that would break under React.StrictMode's dev-mode double-invoke.
    if (target === 0) { setCount(0); return; }
    const steps = 24;
    const stepTime = duration / steps;
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setCount(Math.round((target * current) / steps));
      if (current >= steps) clearInterval(interval);
    }, stepTime);
    return () => clearInterval(interval);
  }, [target, duration]);
  return count;
}

export default function KehadiranTier1() {
  const { attendanceRecords } = useDashboardTier1();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthLabel = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const byDay = new Map<number, AttendanceStatus>();
  attendanceRecords.forEach(r => {
    const d = new Date(r.date);
    if (d.getFullYear() === year && d.getMonth() === month) byDay.set(d.getDate(), r.status);
  });

  const counts = { hadir: 0, izin: 0, sakit: 0, alfa: 0 };
  attendanceRecords.forEach(r => { counts[r.status]++; });
  const total = attendanceRecords.length;
  const attendancePct = total > 0 ? Math.round((counts.hadir / total) * 100) : 0;

  const animatedPct = useAnimatedCounter(attendancePct);
  const animatedHadir = useAnimatedCounter(counts.hadir);
  const animatedIzin = useAnimatedCounter(counts.izin);
  const animatedSakit = useAnimatedCounter(counts.sakit);
  const animatedAlfa = useAnimatedCounter(counts.alfa);

  const recentRecords = [...attendanceRecords]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  const cells: (number | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div className="mx-auto flex max-w-[680px] flex-col gap-6">
      <div>
        <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">Kehadiran</h2>
        <p className="text-[14px] text-stv-muted">Rekap kehadiran anak Anda di Sekolah Studiva bulan ini.</p>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="animate-fade-in-up col-span-2 rounded-2xl bg-stv-sky-stroke p-4 text-center text-white sm:col-span-1">
          <div className="font-baloo text-[28px] font-extrabold">{animatedPct}%</div>
          <div className="mt-0.5 text-[11px] font-semibold text-white/90">Kehadiran</div>
        </div>
        <div className="animate-fade-in-up rounded-2xl bg-stv-green-tint p-4 text-center">
          <div className="font-baloo text-[22px] font-extrabold text-stv-green">{animatedHadir}</div>
          <div className="mt-0.5 text-[11px] text-stv-muted">Hadir</div>
        </div>
        <div className="animate-fade-in-up rounded-2xl bg-yellow-50 p-4 text-center">
          <div className="font-baloo text-[22px] font-extrabold text-yellow-600">{animatedIzin}</div>
          <div className="mt-0.5 text-[11px] text-stv-muted">Izin</div>
        </div>
        <div className="animate-fade-in-up rounded-2xl bg-orange-50 p-4 text-center">
          <div className="font-baloo text-[22px] font-extrabold text-orange-600">{animatedSakit}</div>
          <div className="mt-0.5 text-[11px] text-stv-muted">Sakit</div>
        </div>
        <div className="animate-fade-in-up rounded-2xl bg-red-50 p-4 text-center">
          <div className="font-baloo text-[22px] font-extrabold text-red-500">{animatedAlfa}</div>
          <div className="mt-0.5 text-[11px] text-stv-muted">Alfa</div>
        </div>
      </div>

      {/* Kalender */}
      <div className="rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
        <p className="mb-4 text-center font-baloo text-[16px] font-bold capitalize text-stv-navy">{monthLabel}</p>

        <div className="grid grid-cols-7 gap-1.5 text-center">
          {WEEKDAY_LABELS.map(w => (
            <div key={w} className="text-[11px] font-bold text-stv-muted-2">{w}</div>
          ))}
          {cells.map((day, idx) => {
            if (day === null) return <div key={idx} />;
            const status = byDay.get(day);
            return (
              <div
                key={idx}
                className={`flex h-9 items-center justify-center rounded-lg text-[13px] font-semibold ${
                  status ? `${STATUS_DOT[status]} text-white` : 'bg-stv-sky-tint/40 text-stv-muted-2'
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-3 border-t border-stv-border pt-3">
          {(Object.keys(STATUS_LABEL) as AttendanceStatus[]).map(s => (
            <span key={s} className="flex items-center gap-1.5 text-[12px] text-stv-muted">
              <span className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT[s]}`} />
              {STATUS_LABEL[s]}
            </span>
          ))}
        </div>
      </div>

      {/* Riwayat Terbaru */}
      <div>
        <h3 className="mb-3 font-baloo text-[16px] font-bold text-stv-navy">Riwayat Kehadiran Terbaru</h3>

        {recentRecords.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-stv-sky-tint py-14 text-center">
            <CalendarCheck className="h-10 w-10 text-stv-sky/60" strokeWidth={1.5} />
            <p className="mt-3 font-semibold text-stv-navy">Belum ada data kehadiran</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {recentRecords.map(r => (
              <div key={r.id} className="animate-fade-in-up flex flex-col gap-1.5 rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-stv-navy">
                    {new Date(r.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS_BADGE[r.status]}`}>
                    {STATUS_LABEL[r.status]}
                  </span>
                </div>
                {r.note && (
                  <p className="flex items-start gap-1.5 text-[12px] text-stv-muted">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {r.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
