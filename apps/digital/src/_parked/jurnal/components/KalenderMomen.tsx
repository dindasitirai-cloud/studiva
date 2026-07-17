import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useJurnal } from '../context/JurnalContext';
import { MomenData, MomenCategory, MONTHS_FULL, CATEGORY_DOT, CATEGORY_LABEL } from '../data/mockJurnalData';
import MomenModal from './MomenModal';

const DOW = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];

function daysInMonth(month: number, year: number) {
  return new Date(year, month + 1, 0).getDate();
}
function firstDayOfMonth(month: number, year: number) {
  return new Date(year, month, 1).getDay(); // 0=Sun
}

interface Props {
  anakId: string;
}

export default function KalenderMomen({ anakId }: Props) {
  const { state, dispatch, activeMoments } = useJurnal();
  const { calendarMonth, calendarYear } = state;

  const [selectedDay, setSelectedDay] = React.useState<number | null>(null);

  function prevMonth() {
    const m = calendarMonth === 0 ? 11 : calendarMonth - 1;
    const y = calendarMonth === 0 ? calendarYear - 1 : calendarYear;
    dispatch({ type: 'SET_CALENDAR_MONTH', month: m, year: y });
  }
  function nextMonth() {
    const m = calendarMonth === 11 ? 0 : calendarMonth + 1;
    const y = calendarMonth === 11 ? calendarYear + 1 : calendarYear;
    dispatch({ type: 'SET_CALENDAR_MONTH', month: m, year: y });
  }

  function handleSaveMomen(moment: MomenData) {
    dispatch({ type: 'ADD_MOMENT', anakId, moment });
    setSelectedDay(null);
    // TODO: CRUD momen kalender ke backend (per anak, per tanggal)
  }

  const totalDays = daysInMonth(calendarMonth, calendarYear);
  const firstDow = firstDayOfMonth(calendarMonth, calendarYear);

  const categoryCounts = Object.values(activeMoments).reduce<Record<MomenCategory, number>>(
    (acc, m) => { acc[m.category] = (acc[m.category] ?? 0) + 1; return acc; },
    {} as Record<MomenCategory, number>,
  );
  const totalMoments = Object.keys(activeMoments).length;

  return (
    <div
      className="rounded-2xl p-6 shadow-[0_12px_34px_rgba(140,110,90,.16)]"
      style={{ background: '#fff9f2' }}
    >
      {/* Calendar header */}
      <div className="mb-4 flex items-center justify-center gap-5">
        <button
          type="button"
          aria-label="Bulan sebelumnya"
          onClick={prevMonth}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f2e6da] text-[#8a7f72] transition hover:bg-[#e8d8cc]"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
        </button>
        <h2 className="font-caveat text-[#7c9161]" style={{ fontSize: 42 }}>
          {MONTHS_FULL[calendarMonth]} {calendarYear}
        </h2>
        <button
          type="button"
          aria-label="Bulan berikutnya"
          onClick={nextMonth}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f2e6da] text-[#8a7f72] transition hover:bg-[#e8d8cc]"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </div>

      {/* Grid */}
      <div
        className="overflow-hidden rounded-xl border border-[#f0d9e2]"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}
      >
        {/* Day headers */}
        {DOW.map(d => (
          <div
            key={d}
            className="py-2 text-center text-[11px] font-extrabold uppercase tracking-wider text-[#b4849a]"
            style={{ background: '#fbeef3', padding: '8px 4px' }}
          >
            {d}
          </div>
        ))}

        {/* Empty cells before first day */}
        {Array.from({ length: firstDow }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[82px] border-t border-l border-[#f4e3ea] bg-[#fffdfb] opacity-50" />
        ))}

        {/* Day cells */}
        {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => {
          const moment = activeMoments[day];
          return (
            <div
              key={day}
              onClick={() => setSelectedDay(day)}
              className="relative min-h-[82px] cursor-pointer border-t border-l border-[#f4e3ea] p-1.5 transition hover:bg-[#fff4f8]"
              style={{ background: '#fffdfb' }}
            >
              <span className="block text-[12px] font-bold text-[#a89a8c]">
                {String(day).padStart(2, '0')}
              </span>
              {moment && (
                <>
                  <div
                    className="mt-1 flex items-center justify-center overflow-hidden rounded-lg"
                    style={{
                      height: 46,
                      background: moment.gradientBg,
                      fontSize: 22,
                    }}
                  >
                    {moment.emoji}
                  </div>
                  <span
                    className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full"
                    style={{ background: CATEGORY_DOT[moment.category] }}
                  />
                  <span
                    className="font-caveat mt-0.5 block truncate leading-tight text-[#f0876a]"
                    style={{ fontSize: 13 }}
                  >
                    {moment.caption}
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="font-caveat text-[#7c9161]" style={{ fontSize: 22 }}>
          Bulan ini: {totalMoments} momen terekam 🎉
        </span>
        {(Object.entries(categoryCounts) as [MomenCategory, number][]).map(([cat, count]) => (
          <span
            key={cat}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold"
            style={{
              background:
                cat === 'c-motorik' ? '#e3f0d9' :
                cat === 'c-komunikasi' ? '#ddebfa' :
                cat === 'c-sosial' ? '#fdf1cf' :
                cat === 'c-mandiri' ? '#ecdff5' : '#fde3ee',
              color:
                cat === 'c-motorik' ? '#5c7a44' :
                cat === 'c-komunikasi' ? '#4a6f96' :
                cat === 'c-sosial' ? '#96772a' :
                cat === 'c-mandiri' ? '#7a5b96' : '#a85878',
            }}
          >
            {CATEGORY_LABEL[cat]} · {count}
          </span>
        ))}
      </div>

      {/* Modal */}
      {selectedDay !== null && (
        <MomenModal
          day={selectedDay}
          month={calendarMonth}
          year={calendarYear}
          existing={activeMoments[selectedDay]}
          onSave={handleSaveMomen}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
}
