import React, { useRef } from 'react';
import { MilestoneItemDef } from '../data/mockJurnalData';
import { AchievementEntry } from '../context/JurnalContext';

interface Props {
  item: MilestoneItemDef;
  achievement: AchievementEntry | undefined;
  onToggle: (itemEl: HTMLButtonElement) => void;
  onJurnal: (name: string) => void;
}

export default function MilestoneItem({ item, achievement, onToggle, onJurnal }: Props) {
  const isDone = Boolean(achievement);
  const checkRef = useRef<HTMLButtonElement>(null);

  return (
    <div
      className={`flex items-start gap-3 rounded-xl px-1 py-2 transition ${isDone ? '' : 'hover:bg-[#fdf8f2]'}`}
    >
      {/* Checkbox */}
      <button
        ref={checkRef}
        type="button"
        role="checkbox"
        aria-checked={isDone}
        aria-label={item.name}
        onClick={() => { if (!isDone && checkRef.current) onToggle(checkRef.current); }}
        className="mt-0.5 flex h-[26px] w-[26px] min-w-[26px] cursor-pointer items-center justify-center rounded-full border-[2.5px] text-sm font-bold text-white transition"
        style={{
          borderColor: isDone ? '#f2c14e' : '#d9c8ba',
          background: isDone ? '#f2c14e' : '#fff',
          cursor: isDone ? 'default' : 'pointer',
        }}
      >
        {isDone ? '★' : ''}
      </button>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <span
          className="block text-[14.5px] font-bold leading-tight"
          style={{ color: isDone ? '#96772a' : '#3a4a6b' }}
        >
          {item.name}
        </span>
        {isDone && achievement && (
          <span className="font-caveat mt-0.5 block text-[15px] text-[#b08a6a]">
            tercapai {achievement.date} 🎊
          </span>
        )}
        {isDone && (
          <button
            type="button"
            onClick={() => onJurnal(item.name)}
            className="mt-1 inline-block rounded-lg border-none bg-[#eef1f8] px-2.5 py-1 text-[11px] font-extrabold text-[#5b6c9e] transition hover:bg-[#dde3f0]"
          >
            Tulis di jurnal 📖
          </button>
        )}
      </div>
    </div>
  );
}
