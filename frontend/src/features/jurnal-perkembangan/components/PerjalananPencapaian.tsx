import React, { useState, useCallback } from 'react';
import { useJurnal } from '../context/JurnalContext';
import { MILESTONE_CATEGORIES, MONTHS_FULL } from '../data/mockJurnalData';
import MilestoneItem from './MilestoneItem';
import ConfettiBurst from './ConfettiBurst';

interface ConfettiPos { x: number; y: number; key: number }

interface Props {
  anakId: string;
  anakName: string;
  onGoToJurnal: (prefillTitle: string) => void;
}

export default function PerjalananPencapaian({ anakId, anakName, onGoToJurnal }: Props) {
  const { activeAchievements, dispatch } = useJurnal();
  const [confetti, setConfetti] = useState<ConfettiPos | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastTimer, setToastTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const totalAchieved = Object.keys(activeAchievements).length;
  const latestEntry = Object.entries(activeAchievements)
    .sort((a, b) => new Date(b[1].date).getTime() - new Date(a[1].date).getTime())[0];

  const latestMs = latestEntry
    ? MILESTONE_CATEGORIES.flatMap(c => c.items).find(it => it.id === latestEntry[0])
    : undefined;

  function handleToggle(milestoneId: string, el: HTMLButtonElement) {
    if (activeAchievements[milestoneId]) return; // already achieved
    const now = new Date();
    const date = `${now.getDate()} ${MONTHS_FULL[now.getMonth()]} ${now.getFullYear()}`;
    dispatch({ type: 'MARK_ACHIEVED', anakId, milestoneId, date, note: '' });
    // TODO: Simpan status centang + tanggal + catatan per anak ke backend

    const rect = el.getBoundingClientRect();
    setConfetti({ x: rect.left + rect.width / 2, y: rect.top, key: Date.now() });

    if (toastTimer) clearTimeout(toastTimer);
    setToastVisible(true);
    const t = setTimeout(() => setToastVisible(false), 2200);
    setToastTimer(t);
  }

  const handleConfettiDone = useCallback(() => setConfetti(null), []);

  return (
    <div>
      {/* Disclaimer */}
      <div
        className="mb-5 flex gap-3 rounded-2xl border border-[#f5ddc8] p-4"
        style={{ background: '#fff6ee' }}
      >
        <span style={{ fontSize: 22 }}>💛</span>
        <p className="font-hand text-[16px] leading-relaxed text-[#8a6f55]">
          Setiap anak tumbuh dengan kecepatan dan caranya sendiri. Checklist ini bukan tolok ukur,
          melainkan peta perjalanan untuk merayakan setiap langkah kecil si kecil.
        </p>
      </div>

      {/* Hero card */}
      <div
        className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-[18px] p-5"
        style={{ background: 'linear-gradient(120deg,#ffe9de,#fff3d9)' }}
      >
        <div>
          <div className="font-caveat text-[#b05f3c]" style={{ fontSize: 32 }}>
            {totalAchieved} pencapaian terekam 🏆
          </div>
          <div className="mt-0.5 text-[13px] font-bold text-[#b08a6a]">
            Perjalanan {anakName} sejauh ini
          </div>
        </div>
        {latestMs && latestEntry && (
          <div
            className="font-hand rounded-xl p-3 text-[15px] text-[#8a6f55] shadow-sm"
            style={{ background: '#fff' }}
          >
            Pencapaian terbaru: <b>{latestMs.name}</b> — {latestEntry[1].date} ✨
          </div>
        )}
      </div>

      {/* Categories */}
      {MILESTONE_CATEGORIES.map(cat => {
        const doneCount = cat.items.filter(it => activeAchievements[it.id]).length;
        const pct = cat.items.length > 0 ? (doneCount / cat.items.length) * 100 : 0;

        return (
          <div
            key={cat.id}
            className="mb-4 rounded-[18px] p-5 shadow-[0_4px_14px_rgba(120,90,70,.08)]"
            style={{ background: '#fff' }}
          >
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
                style={{ background: cat.bgColor }}
              >
                {cat.emoji}
              </span>
              <h4 className="text-[16px] font-extrabold text-[#3a4a6b]">{cat.name}</h4>
              <span
                className="font-caveat ml-auto text-[19px]"
                style={{ color: cat.barColor }}
              >
                {doneCount} pencapaian 🌟
              </span>
            </div>

            {/* Progress bar */}
            <div className="mb-4 h-2 overflow-hidden rounded-full bg-[#f2e9e0]">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{ width: `${pct}%`, background: cat.barColor }}
              />
            </div>

            {/* Items */}
            <div className="flex flex-col gap-1">
              {cat.items.map(item => (
                <MilestoneItem
                  key={item.id}
                  item={item}
                  achievement={activeAchievements[item.id]}
                  onToggle={el => handleToggle(item.id, el)}
                  onJurnal={name => onGoToJurnal(name)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Confetti */}
      {confetti && (
        <ConfettiBurst
          key={confetti.key}
          x={confetti.x}
          y={confetti.y}
          onDone={handleConfettiDone}
        />
      )}

      {/* Toast */}
      <div
        className="fixed bottom-7 left-1/2 z-[60] rounded-full px-6 py-3 text-[14px] font-bold text-white shadow-xl transition-all duration-300"
        style={{
          background: '#3a4a6b',
          transform: toastVisible ? 'translateX(-50%)' : 'translateX(-50%) translateY(80px)',
          opacity: toastVisible ? 1 : 0,
          pointerEvents: 'none',
        }}
      >
        Hore! Satu langkah lagi tercapai! 🎉
      </div>
    </div>
  );
}
