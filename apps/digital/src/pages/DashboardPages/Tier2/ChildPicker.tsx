import React from 'react';
import { Check, X } from 'lucide-react';
import type { ProfilAnak } from '../../../types/anak';

interface ChildPickerProps {
  children: ProfilAnak[];
  taggedIds: string[];
  onToggle: (childId: string, isCurrentlyTagged: boolean) => void;
  label?: string;
}

/**
 * Lets a parent attribute a piece of activity (article read / course joined /
 * strategy saved) to one or more of their children. Only meaningful when
 * there's more than one child profile - "Perjalanan Pembelajaran" is tracked
 * per child, so we need to know which child this activity belongs to.
 * Clicking an already-tagged child again un-tags them (toggle, not one-way).
 */
export default function ChildPicker({ children, taggedIds, onToggle, label = 'Tandai untuk anak:' }: ChildPickerProps) {
  if (children.length === 0) return null;

  return (
    <div className="rounded-xl bg-fajar p-4">
      <p className="mb-2.5 text-[13px] font-semibold text-stv-navy">{label}</p>
      <div className="flex flex-wrap gap-2">
        {children.map(child => {
          const tagged = taggedIds.includes(child.id);
          return (
            <button
              key={child.id}
              type="button"
              onClick={() => onToggle(child.id, tagged)}
              aria-pressed={tagged}
              className={`group flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
                tagged
                  ? 'bg-stv-green text-white hover:bg-red-500'
                  : 'border border-madu bg-white text-stv-body hover:border-madu'
              }`}
            >
              {tagged ? (
                <>
                  <Check className="h-3.5 w-3.5 group-hover:hidden" />
                  <X className="hidden h-3.5 w-3.5 group-hover:block" />
                </>
              ) : (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-mawar text-[9px] font-bold text-rekah-tua">
                  {child.namaAnak.charAt(0).toUpperCase()}
                </span>
              )}
              {child.namaAnak}
            </button>
          );
        })}
      </div>
    </div>
  );
}
