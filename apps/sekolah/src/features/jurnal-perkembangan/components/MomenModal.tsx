import React from 'react';
import { X } from 'lucide-react';
import { MomenCategory, MomenData, MONTHS_FULL } from '../data/mockJurnalData';

interface Props {
  day: number;
  month: number;
  year: number;
  existing?: MomenData;
  onSave: (moment: MomenData) => void;
  onClose: () => void;
}

const CATEGORIES: { id: MomenCategory; label: string; bg: string; text: string }[] = [
  { id: 'c-motorik',    label: '🏃 Motorik',     bg: '#e3f0d9', text: '#5c7a44' },
  { id: 'c-komunikasi', label: '💬 Komunikasi',  bg: '#ddebfa', text: '#4a6f96' },
  { id: 'c-sosial',     label: '🤝 Sosial',       bg: '#fdf1cf', text: '#96772a' },
  { id: 'c-mandiri',    label: '🌱 Kemandirian',  bg: '#ecdff5', text: '#7a5b96' },
  { id: 'c-sensorik',   label: '✋ Sensorik',    bg: '#fde3ee', text: '#a85878' },
];

const EMOJI_BY_CAT: Record<MomenCategory, string> = {
  'c-motorik':    '🏃',
  'c-komunikasi': '💬',
  'c-sosial':     '🤝',
  'c-mandiri':    '🌱',
  'c-sensorik':   '✋',
};

const GRADIENT_BY_CAT: Record<MomenCategory, string> = {
  'c-motorik':    'linear-gradient(135deg,#e3f0d9,#fff)',
  'c-komunikasi': 'linear-gradient(135deg,#ddebfa,#fff)',
  'c-sosial':     'linear-gradient(135deg,#fdf1cf,#fff)',
  'c-mandiri':    'linear-gradient(135deg,#ecdff5,#fff)',
  'c-sensorik':   'linear-gradient(135deg,#fde3ee,#fff)',
};

export default function MomenModal({ day, month, year, existing, onSave, onClose }: Props) {
  const [caption, setCaption] = React.useState(existing?.caption ?? '');
  const [category, setCategory] = React.useState<MomenCategory>(existing?.category ?? 'c-motorik');
  const [photoSrc, setPhotoSrc] = React.useState<string>(existing?.gradientBg ? '' : '');

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // TODO: Upload foto ke storage backend
    setPhotoSrc(URL.createObjectURL(file));
  }

  function handleSave() {
    if (!caption.trim()) return;
    onSave({
      day,
      emoji: EMOJI_BY_CAT[category],
      category,
      caption: caption.trim(),
      gradientBg: GRADIENT_BY_CAT[category],
    });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-2xl bg-[#fffdfb] p-6 shadow-2xl">
        <div className="mb-1 flex items-start justify-between">
          <h3 className="font-caveat text-[#7c9161]" style={{ fontSize: 30 }}>
            Momen Hari Ini
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#a89a8c] transition hover:bg-[#f2e9e0]"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
        <p className="mb-4 text-[13px] font-bold text-[#a89a8c]">
          {day} {MONTHS_FULL[month]} {year}
        </p>

        {/* Photo upload */}
        <label className="mb-3 block cursor-pointer rounded-xl border-2 border-dashed border-[#d9c8ba] p-5 text-center text-[#a89a8c] transition hover:border-[#7c9161]">
          {photoSrc ? (
            <img src={photoSrc} alt="Foto momen" className="mx-auto max-h-32 rounded-lg object-cover" />
          ) : (
            <>
              <span className="mb-1 block text-3xl">📷</span>
              <span className="text-[13px]">Ketuk untuk unggah foto aktivitas si kecil</span>
            </>
          )}
          <input type="file" accept="image/*" onChange={handleFile} className="sr-only" />
        </label>

        <input
          type="text"
          value={caption}
          onChange={e => setCaption(e.target.value)}
          placeholder="Ceritakan momennya…"
          className="font-hand mb-3 w-full rounded-xl border border-[#ecdccf] px-4 py-2 text-[17px] text-[#4a4238] focus:border-[#7c9161] focus:outline-none"
        />

        {/* Category chips */}
        <div className="mb-4 flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className="cursor-pointer rounded-full px-3 py-1 text-[12px] font-bold transition"
              style={{
                background: cat.bg,
                color: cat.text,
                border: category === cat.id ? `2px solid ${cat.text}` : '2px solid transparent',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#f2e9e0] px-5 py-2 text-[13px] font-bold text-[#8a7f72] transition hover:bg-[#ece0d5]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-[#7c9161] px-5 py-2 text-[13px] font-bold text-white transition hover:bg-[#6a7e51]"
          >
            Simpan Momen
          </button>
        </div>
      </div>
    </div>
  );
}
