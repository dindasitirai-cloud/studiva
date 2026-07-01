import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Save, CalendarDays, BarChart3, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { useGuru, AttendanceStatusGuru } from './GuruContext';

const STATUS_META: Record<AttendanceStatusGuru, { label: string; bg: string; text: string; dot: string; active: string }> = {
  hadir: { label: 'Hadir', bg: 'bg-stv-green-tint', text: 'text-stv-green', dot: 'bg-stv-green', active: 'bg-stv-green text-white' },
  izin: { label: 'Izin', bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-400', active: 'bg-yellow-400 text-white' },
  sakit: { label: 'Sakit', bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500', active: 'bg-orange-500 text-white' },
  alfa: { label: 'Alfa', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500', active: 'bg-red-500 text-white' },
};
const WEEKDAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

function todayISO() { return new Date().toISOString().slice(0, 10); }

function useAnimatedCounter(target: number) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const steps = 20;
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setCount(Math.round((target * current) / steps));
      if (current >= steps) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [target]);
  return count;
}

// --- Input Kehadiran Tab ---
type RowState = { studentId: string; status: AttendanceStatusGuru; note: string; showNote: boolean };

function InputKehadiranTab() {
  const { students, attendanceRecords, saveClassAttendance } = useGuru();
  const [date, setDate] = useState(todayISO());

  const existingForDate = useMemo(
    () => attendanceRecords.filter(r => r.date === date),
    [attendanceRecords, date]
  );
  const alreadySaved = existingForDate.length > 0;

  const initRows = (): RowState[] =>
    students.map(s => {
      const existing = existingForDate.find(r => r.studentId === s.id);
      return { studentId: s.id, status: existing?.status ?? 'hadir', note: existing?.note ?? '', showNote: false };
    });

  const [rows, setRows] = useState<RowState[]>(initRows);
  const [saved, setSaved] = useState(false);

  // Re-init rows when date changes or existing data changes.
  // Inline the row-building logic to avoid a stale-closure on `initRows`.
  useEffect(() => {
    setRows(students.map(s => {
      const existing = existingForDate.find(r => r.studentId === s.id);
      return { studentId: s.id, status: existing?.status ?? 'hadir', note: existing?.note ?? '', showNote: false };
    }));
    setSaved(false);
  }, [date, existingForDate, students]);

  function setRowStatus(studentId: string, status: AttendanceStatusGuru) {
    setRows(prev => prev.map(r => r.studentId === studentId ? { ...r, status } : r));
  }
  function setRowNote(studentId: string, note: string) {
    setRows(prev => prev.map(r => r.studentId === studentId ? { ...r, note } : r));
  }
  function toggleNote(studentId: string) {
    setRows(prev => prev.map(r => r.studentId === studentId ? { ...r, showNote: !r.showNote } : r));
  }
  function markAllHadir() {
    setRows(prev => prev.map(r => ({ ...r, status: 'hadir' })));
  }

  function handleSave() {
    saveClassAttendance(rows.map(r => ({ studentId: r.studentId, date, status: r.status, note: r.note || undefined })));
    setSaved(true);
    // Update beranda checklist status
  }

  // Per-status summary
  const summary = useMemo(() => {
    const counts = { hadir: 0, izin: 0, sakit: 0, alfa: 0 };
    rows.forEach(r => counts[r.status]++);
    return counts;
  }, [rows]);

  return (
    <div className="flex flex-col gap-4">
      {/* Date picker + bulk action */}
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
        <div>
          <label className="mb-1 block text-[13px] font-semibold text-stv-navy">Tanggal Kehadiran</label>
          <input
            type="date"
            value={date}
            max={todayISO()}
            onChange={e => setDate(e.target.value)}
            className="rounded-xl border border-stv-border px-4 py-2.5 text-[15px] focus:border-teal-400 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={markAllHadir}
          className="rounded-full bg-stv-green-tint px-4 py-2 text-[13px] font-bold text-stv-green hover:opacity-80"
        >
          Tandai Semua Hadir
        </button>
      </div>

      {/* Student attendance rows */}
      <div className="flex flex-col gap-2">
        {rows.map(row => {
          const student = students.find(s => s.id === row.studentId)!;
          return (
            <div key={row.studentId} className="rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
              <div className="flex flex-wrap items-center gap-3">
                {/* Avatar */}
                {student.photo ? (
                  <img src={student.photo} alt={student.name} className="h-10 w-10 shrink-0 rounded-full object-cover" />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-600 font-baloo text-[16px] font-bold text-white">
                    {student.name.charAt(0)}
                  </div>
                )}
                <span className="flex-1 font-baloo text-[15px] font-bold text-stv-navy">{student.name}</span>

                {/* Status buttons */}
                <div className="flex gap-1.5">
                  {(Object.keys(STATUS_META) as AttendanceStatusGuru[]).map(s => {
                    const meta = STATUS_META[s];
                    const active = row.status === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRowStatus(row.studentId, s)}
                        className={`rounded-lg px-2.5 py-1.5 text-[12px] font-bold transition ${active ? meta.active : `${meta.bg} ${meta.text} hover:opacity-80`}`}
                      >
                        {meta.label}
                      </button>
                    );
                  })}
                </div>

                {/* Note toggle */}
                <button
                  type="button"
                  onClick={() => toggleNote(row.studentId)}
                  className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${row.note ? 'bg-teal-100 text-teal-700' : 'bg-slate-50 text-stv-muted hover:bg-slate-100'}`}
                  title="Tambah catatan"
                >
                  <MessageSquare className="h-4 w-4" />
                </button>
              </div>

              {row.showNote && (
                <input
                  value={row.note}
                  onChange={e => setRowNote(row.studentId, e.target.value)}
                  placeholder="Catatan (mis. terlambat 15 menit, dijemput lebih awal...)"
                  className="mt-3 w-full rounded-xl border border-stv-border px-3.5 py-2 text-[14px] focus:border-teal-400 focus:outline-none"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Summary + Save */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
        <div className="flex gap-3">
          {(Object.keys(STATUS_META) as AttendanceStatusGuru[]).map(s => (
            <span key={s} className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold ${STATUS_META[s].bg} ${STATUS_META[s].text}`}>
              <span className={`h-2 w-2 rounded-full ${STATUS_META[s].dot}`} />
              {summary[s]} {STATUS_META[s].label}
            </span>
          ))}
        </div>
        {saved ? (
          <div className="flex items-center gap-2 rounded-full bg-stv-green-tint px-4 py-2 text-[13px] font-bold text-stv-green">
            <CheckCircle2 className="h-4 w-4" />
            Kehadiran tersimpan
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-full bg-stv-green px-5 py-2.5 text-[14px] font-bold text-white transition hover:opacity-90"
          >
            <Save className="h-4 w-4" />
            Simpan Kehadiran {alreadySaved ? '(Perbarui)' : 'Kelas'}
          </button>
        )}
      </div>
    </div>
  );
}

// --- Rekap & Statistik Tab ---
function RekapTab() {
  const { students, attendanceRecords } = useGuru();
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id ?? '');
  const [viewMonth, setViewMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });

  const student = students.find(s => s.id === selectedStudentId);
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const studentRecords = attendanceRecords.filter(r => r.studentId === selectedStudentId);
  const byDay = new Map(studentRecords.map(r => [r.date.slice(8, 10).replace(/^0/, ''), r]));

  const counts = { hadir: 0, izin: 0, sakit: 0, alfa: 0 };
  studentRecords.forEach(r => counts[r.status]++);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const pct = total > 0 ? Math.round((counts.hadir / total) * 100) : 0;

  const animPct = useAnimatedCounter(pct);
  const animHadir = useAnimatedCounter(counts.hadir);

  return (
    <div className="flex flex-col gap-5">
      {/* Student selector */}
      <div className="flex flex-wrap gap-2">
        {students.map(s => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelectedStudentId(s.id)}
            className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${selectedStudentId === s.id ? 'bg-teal-600 text-white' : 'border border-stv-border bg-white text-stv-body hover:bg-teal-50'}`}
          >
            {s.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="col-span-2 rounded-2xl bg-stv-sky-stroke p-4 text-center text-white sm:col-span-1">
          <div className="font-baloo text-[26px] font-extrabold">{animPct}%</div>
          <div className="text-[11px] text-white/90">Kehadiran</div>
        </div>
        {(Object.keys(STATUS_META) as AttendanceStatusGuru[]).map(s => (
          <div key={s} className={`rounded-2xl p-4 text-center ${STATUS_META[s].bg}`}>
            <div className={`font-baloo text-[20px] font-extrabold ${STATUS_META[s].text}`}>
              {s === 'hadir' ? animHadir : counts[s]}
            </div>
            <div className="text-[11px] text-stv-muted">{STATUS_META[s].label}</div>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="rounded-2xl bg-white p-5 shadow-[0_4px_16px_rgba(16,58,107,.06)]">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-baloo text-[15px] font-bold text-stv-navy capitalize">
            {viewMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            {student && <span className="ml-2 text-stv-muted">— {student.name}</span>}
          </h3>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setViewMonth(new Date(year, month - 1, 1))} className="flex h-8 w-8 items-center justify-center rounded-full bg-stv-sky-tint text-stv-sky-stroke hover:bg-stv-sky-tint/80">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setViewMonth(new Date(year, month + 1, 1))} className="flex h-8 w-8 items-center justify-center rounded-full bg-stv-sky-tint text-stv-sky-stroke hover:bg-stv-sky-tint/80">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {WEEKDAY_LABELS.map(w => <div key={w} className="text-[11px] font-bold text-stv-muted-2">{w}</div>)}
          {cells.map((day, idx) => {
            if (day === null) return <div key={idx} />;
            const dayStr = String(day);
            const record = byDay.get(dayStr) ?? byDay.get(dayStr.padStart(2, '0'));
            const status = record?.status;
            return (
              <div
                key={idx}
                className={`flex h-9 items-center justify-center rounded-lg text-[12px] font-semibold ${
                  status ? `${STATUS_META[status].dot} text-white` : 'bg-stv-border/40 text-stv-muted-2'
                }`}
                title={status ? STATUS_META[status].label : undefined}
              >
                {day}
              </div>
            );
          })}
        </div>
        {/* Legend */}
        <div className="mt-3 flex flex-wrap justify-center gap-3 border-t border-stv-border pt-3">
          {(Object.keys(STATUS_META) as AttendanceStatusGuru[]).map(s => (
            <span key={s} className="flex items-center gap-1.5 text-[12px] text-stv-muted">
              <span className={`h-3 w-3 rounded-full ${STATUS_META[s].dot}`} />
              {STATUS_META[s].label}
            </span>
          ))}
          <span className="flex items-center gap-1.5 text-[12px] text-stv-muted">
            <span className="h-3 w-3 rounded-full bg-stv-border" />
            Belum dicatat
          </span>
        </div>
      </div>
    </div>
  );
}

// --- Main Page ---
export default function KehadiranGuru() {
  const [activeTab, setActiveTab] = useState<'input' | 'rekap'>('input');

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">Kehadiran</h2>
        <p className="text-[14px] text-stv-muted">Input kehadiran seluruh kelas sekaligus, atau lihat rekap per siswa.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('input')}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition ${activeTab === 'input' ? 'bg-stv-green text-white' : 'bg-stv-green-tint text-stv-green'}`}
        >
          <CalendarDays className="h-4 w-4" />
          Input Kehadiran
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('rekap')}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition ${activeTab === 'rekap' ? 'bg-stv-sky-stroke text-white' : 'bg-stv-sky-tint text-stv-sky-stroke'}`}
        >
          <BarChart3 className="h-4 w-4" />
          Rekap & Statistik
        </button>
      </div>

      {activeTab === 'input' ? <InputKehadiranTab /> : <RekapTab />}
    </div>
  );
}
